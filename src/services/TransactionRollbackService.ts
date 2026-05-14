import type { Transaction } from "../@types";
import type DatabaseHandler from "../structures/DatabaseHandler";
import type JolyneClient from "../structures/JolyneClient";
import * as Functions from "../utils/Functions";
import { cloneDeep } from "lodash";

export const fixRaidTransactions = async (
    database: DatabaseHandler,
    client: JolyneClient,
): Promise<void> => {
    const transactions = await database.postgresql.query<Transaction>(
        `SELECT *
          FROM transactions
          WHERE message LIKE '%Raided%'`,
    );
    for (const transaction of transactions.rows) {
        for (const data of transaction.data) {
            const iceShardDiff =
                (data.newData.inventory["ice_shard"] ?? 0) -
                (data.oldData.inventory["ice_shard"] ?? 0);
            if (iceShardDiff) {
                console.log(transaction.message, data.newData.tag, iceShardDiff);
                if (!transaction.message.includes("Ice Golem")) {
                    console.log(`Eligible for refund: ${data.newData.tag}`);
                    const newData = await database.getRPGUserData(data.newData.id);
                    const oldData = cloneDeep(newData);
                    const toGive = iceShardDiff * -1;
                    const result = Functions.addItem(newData, "ice_shard", toGive);
                    if (result && toGive > 0) {
                        console.log(`Refunded ${toGive} ice shards to ${data.newData.tag}`);
                        const transac = await database.handleTransaction(
                            [{ oldData, newData }],
                            `Refund ${toGive} ice shards from raid transaction::: ${transaction.message} [${transaction.id}]`,
                        );
                        const channel = await client.channels.fetch("1324017623125459036");
                        if (channel.isTextBased() && channel.isSendable()) {
                            await channel.send(
                                `<@${data.newData.id}> \`[${transac}]\` | You have been refunded **${toGive}** ice shards from a raid transaction::: ${transaction.message} [${transaction.id}]`,
                            );
                        }
                    }
                }
            }
        }
    }
};

export const rollbackDailyClaim = async (database: DatabaseHandler): Promise<string | 0> => {
    const transactions = await database.postgresql.query<Transaction>(
        `SELECT *
      FROM transactions
      WHERE message LIKE '%Daily claim%'
      AND date > NOW() - INTERVAL '48 HOURS'`,
    );

    console.log(`Found ${transactions.rows.length} transactions to check for rollback.X`);

    let rollbacksProcessed = 0;

    for await (const transaction of transactions.rows) {
        console.log(`Checking transaction ${transaction.id} for rollback...`);
        const oldData = transaction.data[0].oldData;
        const newData = transaction.data[0].newData;

        if (!oldData?.daily || !newData?.daily) {
            console.log(`Skipping transaction ${transaction.id} due to missing data.`);
            continue;
        }

        console.log(newData.daily.claimStreak, oldData.daily.claimStreak);
        if (newData.daily.claimStreak < oldData.daily.claimStreak) {
            console.log(
                `Mismatch found! Old: ${oldData.daily.claimStreak}, New: ${newData.daily.claimStreak}`,
            );

            const userData = await database.getRPGUserData(newData.id);
            if (userData.daily.claimStreak < oldData.daily.claimStreak) {
                userData.daily.claimStreak = newData.daily.claimStreak;
                userData.daily.lastClaimed = new Date().setUTCHours(0, 0, 0, 0);
                rollbacksProcessed++;
                console.log(`Rollback daily claim streak for ${userData.tag}...`);

                await database.handleTransaction(
                    [
                        {
                            oldData: transaction.data[0].newData,
                            newData: userData,
                        },
                    ],
                    `Rollback daily claim streak for ${userData.tag} from ${oldData.daily.claimStreak} to ${newData.daily.claimStreak}`,
                );
                console.log(
                    `Rollback daily claim streak for ${userData.tag} from ${oldData.daily.claimStreak} to ${newData.daily.claimStreak}`,
                );
            }
        }
    }

    return rollbacksProcessed > 0 ? "Rollback completed." : 0;
};

export const rollbackTransaction = async (
    database: DatabaseHandler,
    id: string,
): Promise<string | 0> => {
    const transaction = await database.postgresql.query<Transaction>(
        `SELECT data,message
         FROM transactions
         WHERE id = $1`,
        [id],
    );
    if (!transaction.rows.length) return 0;
    const data = transaction.rows[0];
    const rollbackData = data.data.map(({ oldData, newData }) => ({
        oldData: newData,
        newData: oldData,
    }));
    const status = await database.handleTransaction(rollbackData, `rollback '${data.message}'`);
    if (!status) return 0;

    await database.postgresql.query(
        `DELETE
         FROM transactions
         WHERE id = $1`,
        [id],
    );
    return status;
};
