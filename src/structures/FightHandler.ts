import { EventEmitter } from "node:events";
import { RPGUserDataJSON, FightableNPC, Stand, Ability } from "../@types";
import * as Functions from "../utils/Functions";
import CommandInteractionContext from "./CommandInteractionContext";
import {
    APIEmbed,
    ButtonBuilder,
    StringSelectMenuBuilder,
    ActionRowBuilder,
    ButtonStyle,
    InteractionCollector,
    ButtonInteraction,
    CacheType,
    StringSelectMenuInteraction,
    UserSelectMenuInteraction,
    RoleSelectMenuInteraction,
    MentionableSelectMenuInteraction,
    ChannelSelectMenuInteraction,
    Awaitable,
    Utils,
} from "discord.js";

export enum FightTypes { // for embed title
    Friendly = "🎌 Friendly Fight",
    Ranked = "⚔️ Ranked Fight",
    Dungeon = "🏰 Dungeon Raid",
    DailyQuest = "📆 Daily Quest Fight",
    ChapterQuest = "📜 Chapter Quest Fight",
    Boss = "💣 Boss Raid",
    Assault = "Assault Fight",
}

export const FighterAttackStaminaCost = 2;

export const FightTypeColor = {
    // friendy = yellow; ranked = orange; dungeon = brown; daily quest = blue; chapter quest = purple; boss = red
    [FightTypes.Friendly]: 0xffff00,
    [FightTypes.Ranked]: 0xffa500,
    [FightTypes.Dungeon]: 0xffa500,
    [FightTypes.DailyQuest]: 0xffa500,
    [FightTypes.ChapterQuest]: 0xffa500,
    [FightTypes.Boss]: 0xffa500,
    [FightTypes.Assault]: 0xffa500,
};

export class FightHandler extends EventEmitter {
    public on<K extends keyof FightEvents>(
        event: K,
        listener: (...args: FightEvents[K]) => void
    ): this {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return super.on(event, listener as (...args: any[]) => void);
    }
    public once<K extends keyof FightEvents>(
        event: K,
        listener: (...args: FightEvents[K]) => void
    ): this {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return super.once(event, listener as (...args: any[]) => void);
    }
    public emit<K extends keyof FightEvents>(event: K, ...args: FightEvents[K]): boolean {
        return super.emit(event, ...args);
    }
    public teams: Fighter[][];
    public fighters: Fighter[];
    public infos: FightInfos;
    public ended: boolean;
    public turns: {
        teams: Fighter[][];
        infos: FightInfos;
        logs: string[];
    }[];
    public nextTurnPromises: {
        promise: (thus: FightHandler) => void;
        cooldown: number;
    }[];
    public nextRoundPromises: {
        promise: (thus: FightHandler) => void;
        cooldown: number;
    }[];
    private listener: InteractionCollector<
        | ButtonInteraction<CacheType>
        | StringSelectMenuInteraction<CacheType>
        | UserSelectMenuInteraction<CacheType>
        | RoleSelectMenuInteraction<CacheType>
        | MentionableSelectMenuInteraction<CacheType>
        | ChannelSelectMenuInteraction<CacheType>
    >;
    private handleAbility: (interaction: StringSelectMenuInteraction<CacheType>) => Promise<void>;
    private handleMove: (
        move: "attack" | "dodge" | "block" | `ability:${Ability["name"]}`
    ) => Promise<void>;

    /**
     * @param {CommandInteractionContext} ctx of the command
     * @param {(RPGUserDataJSON | FightableNPC)[][]} teams array of teams (teams = array of fighters)
     * @param {FightTypes} type of the fight
     */
    constructor(
        public ctx: CommandInteractionContext,
        teams: (RPGUserDataJSON | FightableNPC)[][],
        type: FightTypes
    ) {
        super();
        this.teams = teams.map((team) => team.map((fighter) => new Fighter(fighter)));
        this.nextRoundPromises = [];
        this.nextTurnPromises = [];
        // prettier-ignore
        this.fighters = this.teams.flat().sort((a, b) => a.skillPoints.speed * 3 + a.level - (b.skillPoints.speed * 3 + b.level));

        // check every fighters to see if some of them have the same id (same user)
        for (let i = 0; i < this.fighters.length; i++) {
            if (type === FightTypes.Friendly) {
                this.fighters[i].health = this.fighters[i].maxHealth;
                this.fighters[i].stamina = this.fighters[i].maxStamina;
            }
            for (let j = i + 1; j < this.fighters.length; j++) {
                if (this.fighters[i].id === this.fighters[j].id) {
                    const fighter = this.fighters[i];
                    setTimeout(() => {
                        this.emit("unexpectedEnd", `Duplicate users in the fight: ${fighter.id}`);
                    }, 2000);
                }
            }
        }

        this.infos = {
            type,
            attackAgain: 0,
            dodgeAgain: 0,
            orderIndex: 0,
            cooldowns: [],
            attackOrder: this.fighters
                .sort(
                    (a, b) =>
                        b.level * 2 + b.skillPoints.speed - (a.level * 2 + a.skillPoints.speed)
                )
                .map((f) => f.id),
        };
        this.turns = [
            {
                teams: this.teams,
                infos: this.infos,
                logs: [],
            },
        ];

        this.listener = this.ctx.interaction.channel.createMessageComponentCollector({
            filter: (interaction) =>
                this.fighters.filter((f) => f.id === interaction.user.id).length > 0,
        });
        this.on("unexpectedEnd", (message) => {
            this.listener.stop();
            this.removeAllListeners();
            this.ended = true;
            ctx.client.log("Fight unexpected end: " + message, "error");
            // delete every keys of this object to prevent any further action and free memory
            for (const key of Object.keys(this)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                delete (this as any)[key];
            }
        });
        this.on("end", () => {
            this.ctx.makeMessage({
                content: "Fight ended",
                components: [],
            });
            this.listener.stop();
            this.removeAllListeners();
            this.ended = true;
            ctx.client.log(
                `Fight with fighters ${this.fighters.map((f) => f.name).join(", ")} ended with ${
                    this.fighters.filter((f) => f.health > 0).length
                } winners and ${this.fighters.filter((f) => f.health <= 0).length} losers.`,
                "info"
            );
            // delete every keys of this object to prevent any further action and free memory
            for (const key of Object.keys(this)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                delete (this as any)[key];
            }
        });
        this.listener.on("collect", (interaction) => {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            interaction.deferUpdate().catch(() => {});
            if (interaction.user.id !== this.whosTurn.id) return;
            if (interaction.isButton()) {
                switch (interaction.customId) {
                    case "selectAnotherTarget":
                        try {
                            this.selectTarget();
                            console.log("select another target");
                        } catch (e) {
                            this.emit("unexpectedEnd", (e as Error).message);
                        }
                        return;
                    case "attack":
                        return this.handleAttack();
                    case "defend":
                        return this.handleDefend();
                    case "forfeit":
                        return; //this.handleForfeit();
                    case "stand":
                        return this.selectStandAbility() as void;
                    case "goBack":
                        return this.updateMessage();
                    default:
                        this.emit("unexpectedEnd", "unknown button");
                        return;
                }
            } else if (interaction.isStringSelectMenu()) {
                switch (interaction.customId) {
                    case "abilities":
                        return this.handleUseAbility(interaction.values[0]);
                    case "target":
                        this.infos.target = interaction.values[0];
                        this.updateMessage();
                        return;
                    default:
                        this.emit("unexpectedEnd", "unknown select menu");
                        return;
                }
            }

            this.emit("unexpectedEnd", "unknown interaction");
        });

        // on every fighters stands, add cooldown for their abilities
        for (const fighter of this.fighters) {
            if (fighter.stand)
                fighter.stand.abilities.forEach((ability) => {
                    this.addOrEditCooldown(fighter.id, ability.name, ability.cooldown);
                });
        }
        if (Functions.findNPC(this.fighters[0].id)) this.updateMessage();
        else {
            this.updateMessage(true);
            setTimeout(() => {
                console.log("select target at init");
                this.selectTarget();
            }, 1200);
        }
    }

    get whosTurn(): Fighter {
        let whosTurn = this.fighters.filter((r) => r.health > 0)[this.infos.orderIndex];
        if (!whosTurn)
            whosTurn = this.fighters.filter((r) => r.health > 0)[this.infos.orderIndex - 1];
        if (!whosTurn) this.fighters.filter((r) => r.health > 0)[this.infos.orderIndex - 2];
        if (!whosTurn) this.fighters.filter((r) => r.health > 0)[this.infos.orderIndex - 3];
        if (!whosTurn) this.fighters.filter((r) => r.health > 0)[this.infos.orderIndex - 4];
        if (!whosTurn) this.fighters.filter((r) => r.health > 0)[this.infos.orderIndex - 5];
        if (!whosTurn) this.fighters.filter((r) => r.health > 0)[this.infos.orderIndex + 1];
        if (!whosTurn) this.fighters.filter((r) => r.health > 0)[this.infos.orderIndex + 2];
        if (!whosTurn) this.fighters.filter((r) => r.health > 0)[this.infos.orderIndex + 3];
        if (!whosTurn) this.fighters.filter((r) => r.health > 0)[this.infos.orderIndex + 4];
        if (!whosTurn) this.fighters.filter((r) => r.health > 0)[this.infos.orderIndex + 5];
        if (!whosTurn) {
            this.infos.orderIndex = 0;
            whosTurn = this.fighters.filter((r) => r.health > 0)[this.infos.orderIndex];
            this.turns = this.turns.slice(0, this.turns.length - 1);
            this.turns[this.turns.length - 1].logs.push(
                `[ERROR: 'whosTurn' is undefined. Rollback to last turn...]`
            );
        }
        return whosTurn;
    }

    private getTeamIdx(fighter: Fighter): number {
        return this.teams.findIndex((team) => team.includes(fighter));
    }

    private NPCAttack() {
        if (this.ended) return;
        if (!Functions.findNPC(this.whosTurn.id)) {
            this.emit("unexpectedEnd", "NPCAttack called on non-NPC");
            return;
        }

        let possible = ["defend"];
        if (this.whosTurn.canAttack) {
            possible.push("attack");
            possible.push("attack");
            possible.push("attack");
        }
        if (this.whosTurn.stand && this.whosTurnAvailableAbilities.length !== 0) {
            possible.push("stand");
            possible.push("stand");
        }

        if (this.whosTurn.extraTurns !== 0) {
            possible = possible.filter((p) => p !== "defend");
        }

        switch (possible[Math.floor(Math.random() * possible.length)]) {
            case "attack":
                console.log("select target at attack");
                this.selectTarget();
                this.handleAttack();
                break;
            case "defend":
                this.handleDefend();
                break;
            case "stand":
                console.log("select target at stand");
                this.selectTarget();
                this.selectStandAbility();
                break;
            default:
                this.emit("unexpectedEnd", "unknown NPC action");
                break;
        }
    }

    private selectTarget(): void {
        console.log(`Select target on user ${this.whosTurn.name}`);
        if (this.infos.selectedTargetCount === undefined) this.infos.selectedTargetCount = 0;
        else this.infos.selectedTargetCount++;

        if (this.infos.selectedTargetCount > 3 && !Functions.findNPC(this.whosTurn.id)) {
            this.turns[this.turns.length - 1].logs.push(
                `🤦:question: **${this.whosTurn.name}** took too much to do something and lost his turn.`
            );
            this.nextTurn();
            return;
        }
        const whosTurnTeam = this.getTeamIdx(this.whosTurn);
        let availableTargets = this.fighters.filter(
            (fighter) => this.getTeamIdx(fighter) !== whosTurnTeam && fighter.health > 0
        );
        if (this.whosTurn.manipulatedBy) {
            availableTargets = this.fighters.filter(
                (fighter) =>
                    this.getTeamIdx(fighter) !== this.getTeamIdx(this.whosTurn.manipulatedBy) &&
                    fighter.health > 0
            );
        }
        if (availableTargets.length === 0) {
            this.emit("unexpectedEnd", "no target available");
            return;
        }
        // if is npc, select a random target
        if (Functions.findNPC(this.whosTurn.id)) {
            this.infos.target = Functions.randomArray(availableTargets).id;
            return;
        }

        if (this.hasOneTarget) {
            this.infos.target = availableTargets[0].id;
            this.updateMessage();
            return;
        }

        const embed: APIEmbed = {
            title: "Select a target",
            description: `Select a target for your next move (or you can just defend after selecting the target)\n\n${this.generateFightersInfo(
                this.getTeamIdx(this.whosTurn)
            )}`,
            color: 0x70926c,
            thumbnail: {
                url:
                    this.ctx.client.users.cache.get(this.whosTurn.id)?.displayAvatarURL() ??
                    Functions.findNPC(this.whosTurn.id)?.avatarURL ??
                    undefined,
            },
        };
        const stringSelectMenu = new StringSelectMenuBuilder()
            .setCustomId("target")
            .setPlaceholder(`[${this.whosTurn.name}: select a target]`)
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(
                availableTargets.map((target) => ({
                    label:
                        (Functions.findNPC(target.id)
                            ? target.name
                            : target.manipulatedBy
                            ? target.name
                            : this.ctx.client.users.cache.get(target.id)?.tag ?? target.name) +
                        `: ${target.health.toLocaleString(
                            "en-US"
                        )}/${target.maxHealth.toLocaleString("en-US")} ❤️ (Team ${
                            this.getTeamIdx(target) + 1
                        })`,
                    emoji: target.manipulatedBy
                        ? this.ctx.client.localEmojis["hierophant_green"]
                        : Functions.findNPC(target.id)?.emoji ?? undefined,
                    value: target.id,
                }))
            );

        this.ctx.makeMessage({
            content: `It's **${this.whosTurn.name}**'s turn: Select a target for your next move (or you can just defend after selecting the target)`,
            //embeds: [embed],
            components: [Functions.actionRow([stringSelectMenu])],
        });
    }

    get whosTurnAvailableAbilities(): Ability[] {
        return this.whosTurn.stand.abilities.filter(
            (ability) =>
                ability.stamina <= this.whosTurn.stamina &&
                (this.infos.cooldowns.find(
                    (cooldown) => cooldown.move === ability.name && cooldown.id === this.whosTurn.id
                )?.cooldown ?? 0) <= 0
        );
    }

    private selectStandAbility(): void | string[] {
        console.log(`Select stand ability on user ${this.whosTurn.name}`);
        if (!this.whosTurn) {
            this.emit("unexpectedEnd", "no fighter found");
            return;
        }
        if (this.infos.selectedTargetCount === undefined) this.infos.selectedTargetCount = 0;
        else this.infos.selectedTargetCount++;

        if (this.infos.selectedTargetCount > 3 && !Functions.findNPC(this.whosTurn.id)) {
            this.turns[this.turns.length - 1].logs.push(
                `🤦:question: **${this.whosTurn.name}** took too much to do something and lost his turn.`
            );
            this.nextTurn();
            return;
        }

        const availableAbilities = this.whosTurnAvailableAbilities;

        if (Functions.findNPC(this.whosTurn.id)) {
            return this.handleUseAbility(Functions.randomArray(availableAbilities).name);
        }
        const components = [];
        const embed = Functions.standAbilitiesEmbed(this.whosTurn, this.infos.cooldowns);
        if (availableAbilities.length !== 0) {
            components.push(
                Functions.actionRow([
                    new StringSelectMenuBuilder()
                        .setCustomId("abilities")
                        .setPlaceholder(`[${this.whosTurn.name}: select an ability]`)
                        .setMinValues(1)
                        .setMaxValues(1)
                        .addOptions(
                            availableAbilities.map((ability) => ({
                                label: ability.name,
                                value: ability.name,
                            }))
                        ),
                ])
            );
        } else {
            components.push(
                Functions.actionRow([
                    new ButtonBuilder()
                        .setDisabled(true)
                        .setLabel("[No abilities available]")
                        .setCustomId("noAbilities")
                        .setStyle(ButtonStyle.Danger),
                ])
            );
        }
        components.push(
            Functions.actionRow([
                new ButtonBuilder()
                    .setCustomId("goBack")
                    .setEmoji("⬅️")
                    .setStyle(ButtonStyle.Secondary),
            ])
        );

        this.ctx.makeMessage({
            content: `It's **${this.whosTurn.name}**'s turn: Select an ability to use`,
            embeds: [embed],
            components: components,
        });
    }

    private addOrEditCooldown(id: string, move: string, cooldown: number) {
        const cooldownIndex = this.infos.cooldowns.findIndex(
            (cooldown) => cooldown.id === id && cooldown.move === move
        );
        if (cooldownIndex === -1) {
            this.infos.cooldowns.push({ id, move, cooldown });
        } else {
            this.infos.cooldowns[cooldownIndex].cooldown = cooldown;
        }
    }

    private handleDefend(): void {
        console.log(`Defend on user ${this.whosTurn.name}`);
        if (!this.whosTurn) {
            this.emit("unexpectedEnd", "no fighter found");
            return;
        }

        this.whosTurn.isDefending = true;
        this.turns[this.turns.length - 1].logs.push(
            `> :shield: \`${this.whosTurn.name}\` is now defending theirselves`
        );
        this.nextTurn();
    }

    private handleAttack(): void {
        console.log(`handleAttack on user ${this.whosTurn.name}`);
        if (!this.whosTurn) {
            this.emit("unexpectedEnd", "no fighter found");
            return;
        }
        let target: string | Fighter = this.infos.target;
        if (!target) {
            this.emit("unexpectedEnd", "no target found");
            return;
        }
        target = !this.whosTurn.manipulatedBy
            ? this.fighters.find(
                  (fighter) =>
                      fighter.id === target &&
                      this.getTeamIdx(fighter) !== this.getTeamIdx(this.whosTurn)
              )
            : this.fighters.find(
                  (fighter) =>
                      fighter.id === target &&
                      this.getTeamIdx(fighter) !== this.getTeamIdx(this.whosTurn.manipulatedBy)
              );

        const damages = Functions.getAttackDamages(this.whosTurn);
        const attackEmoji = this.whosTurn.stand?.customAttack?.emoji ?? "👊";

        const status = target.removeHealth(damages, this.whosTurn);

        if (status.type === FighterRemoveHealthTypes.Defended) {
            this.turns[this.turns.length - 1].logs.push(
                `${attackEmoji}:shield: \`${this.whosTurn.name}\` attacks **${target.name}** but they defended theirselves and deals **${status.amount}** damages instead of **${damages}** (defense: -${status.defense})`
            );
        } else if (status.type === FighterRemoveHealthTypes.Dodged) {
            this.turns[this.turns.length - 1].logs.push(
                `${attackEmoji}:x: \`${this.whosTurn.name}\` attacks **${target.name}** but they dodged`
            );
        } else if (status.type === FighterRemoveHealthTypes.BrokeGuard) {
            this.turns[this.turns.length - 1].logs.push(
                `${attackEmoji}:shield: \`${this.whosTurn.name}\` attacks **${target.name}**' and broke their guard; -**${status.amount}** HP :heart: instead of **${damages}**`
            );
        } else if (status.type === FighterRemoveHealthTypes.Normal) {
            this.turns[this.turns.length - 1].logs.push(
                `${attackEmoji} \`${this.whosTurn.name}\` attacks **${target.name}** and deals **${status.amount}** damages`
            );
        }

        this.nextTurn();
    }

    private handleUseAbility(ability: string): void {
        console.log(`handleUseAbility(${ability})`);
        const stand = this.whosTurn.stand;
        if (!stand) {
            this.emit("unexpectedEnd", "no stand found");
            return;
        }
        const abilityObj = stand.abilities?.find((a) => a.name === ability);
        if (!abilityObj) {
            this.emit("unexpectedEnd", "no ability found");
            return;
        }
        const target = !this.whosTurn.manipulatedBy
            ? this.fighters.find(
                  (fighter) =>
                      fighter.id === this.infos.target &&
                      this.getTeamIdx(fighter) !== this.getTeamIdx(this.whosTurn)
              )
            : this.fighters.find(
                  (fighter) =>
                      fighter.id === this.infos.target &&
                      this.getTeamIdx(fighter) !== this.getTeamIdx(this.whosTurn.manipulatedBy)
              );
        if (!target) {
            this.emit("unexpectedEnd", "no target found");
            return;
        }

        const dmg = Functions.getAbilityDamage(this.whosTurn, abilityObj);

        const status = target.removeHealth(
            dmg,
            this.whosTurn,
            abilityObj.blockable,
            abilityObj.dodgeable
        );

        if (status.type === FighterRemoveHealthTypes.Defended) {
            abilityObj.useMessage(this.whosTurn, target, status.amount, this);
            this.turns[this.turns.length - 1].logs.push(
                `${this.whosTurn.stand.emoji} \`${this.whosTurn.name}\` uses **${this.whosTurn.stand.name} : ${abilityObj.name}** on **${target.name}** but they defended theirselves and deals **${status.amount}** damages instead of **${dmg}** (defense: -${status.defense})`
            );
        } else if (status.type === FighterRemoveHealthTypes.Dodged) {
            this.turns[this.turns.length - 1].logs.push(
                `:x: \`${this.whosTurn.name}\` uses **${this.whosTurn.stand.name} : ${abilityObj.name}** on **${target.name}** but they dodged`
            );
        } else if (status.type === FighterRemoveHealthTypes.BrokeGuard) {
            abilityObj.useMessage(this.whosTurn, target, status.amount, this);
            if (abilityObj.extraTurnsIfGB !== undefined)
                this.whosTurn.extraTurns += abilityObj.extraTurnsIfGB;
            this.turns[this.turns.length - 1].logs.push(
                `${this.whosTurn.stand.emoji} \`${this.whosTurn.name}\` uses **${this.whosTurn.stand.name} : ${abilityObj.name}** on **${target.name}** and their guard was broken and deals **${status.amount}** damages instead of **${dmg}**`
            );
        } else if (status.type === FighterRemoveHealthTypes.Normal) {
            let statusMsg: string;
            if (abilityObj.useMessage) {
                const statusMsgR = abilityObj.useMessage(
                    this.whosTurn,
                    target,
                    status.amount,
                    this
                );
                if (statusMsgR) statusMsg = statusMsgR;
            }
            if (!statusMsg)
                statusMsg = `${this.whosTurn.stand.emoji} \`${this.whosTurn.name}\` uses **${this.whosTurn.stand.name} : ${abilityObj.name}** on **${target.name}** and deals **${status.amount}** damages`;
            this.turns[this.turns.length - 1].logs.push(statusMsg);
        }
        if (abilityObj.extraTurns !== undefined && status.type !== FighterRemoveHealthTypes.Dodged)
            this.whosTurn.extraTurns += abilityObj.extraTurns;

        this.addOrEditCooldown(this.whosTurn.id, ability, abilityObj.cooldown);
        this.nextTurn();
    }

    private nextTurn() {
        this.infos.selectedTargetCount = 0;

        try {
            for (const nextTurnPromises of this.nextTurnPromises) {
                nextTurnPromises.cooldown--;
                if (nextTurnPromises.cooldown === 0) {
                    nextTurnPromises.promise(this);
                    this.nextTurnPromises = this.nextTurnPromises.filter(
                        (p) => p !== nextTurnPromises
                    );
                }
            }
        } catch (e) {
            console.error(e);
            this.emit("unexpectedEnd", "error while handling nextTurnPromises");
        }

        let deadTeams = 0;
        for (const team of this.teams) {
            if (team.filter((f) => f.health > 0).length === 0) deadTeams++;
        }
        if (deadTeams === this.teams.length - 1) {
            const winner = this.teams.find((team) => team.filter((f) => f.health > 0).length > 0);
            const losers = this.teams.filter((team) => team !== winner);

            this.updateMessage(true);
            this.emit("end", winner, losers);
            return;
        }
        if (this.whosTurn.extraTurns > 0) {
            this.whosTurn.extraTurns--;
            this.updateMessage();
            return;
        }
        this.infos.orderIndex++;
        if (this.whosTurn.health <= 0) {
            this.nextTurn();
            return;
        }
        if (this.whosTurn.isFrozen) {
            this.whosTurn.frozenFor--;
            this.nextTurn();
            return;
        }

        /*
        this.infos.orderIndex++;
        if (this.whosTurn.health <= 0) {
            this.nextTurn();
            return;
        } */
        if (this.infos.orderIndex >= this.fighters.filter((f) => f.health > 0).length) {
            try {
                for (const nextTurnPromises of this.nextRoundPromises) {
                    nextTurnPromises.cooldown--;
                    if (nextTurnPromises.cooldown === 0) {
                        nextTurnPromises.promise(this);
                        this.nextRoundPromises = this.nextRoundPromises.filter(
                            (p) => p !== nextTurnPromises
                        );
                    }
                }
            } catch (e) {
                console.error(e);
                this.emit("unexpectedEnd", "error while handling nextRoundPromises");
            }

            for (const cooldown of this.infos.cooldowns) {
                cooldown.cooldown--;
                if (cooldown.cooldown <= 0) cooldown.cooldown = 0;
            }

            for (const fighter of this.fighters.filter((f) => f.health > 0)) {
                if (!fighter.isFrozen) fighter.incrStamina(FighterAttackStaminaCost);
                if (fighter.defendCount >= 3) {
                    fighter.defendCount++;
                } else if (fighter.isDefending) {
                    fighter.defendCount++;
                }
                if (fighter.defendCount >= 6) fighter.defendCount = 0;
            }

            this.infos.orderIndex = 0;
            this.turns.push({
                logs: [],
                infos: this.infos,
                teams: this.teams,
            });
        }
        this.infos.target = undefined;
        this.infos.selectedTargetCount = 0;

        if (Functions.findNPC(this.whosTurn.id)) return this.updateMessage();

        this.updateMessage(true);

        if (this.hasOneTarget) {
            console.log("has one target");
            this.selectTarget();
        } else
            setTimeout(() => {
                console.log("timeout select target");
                this.selectTarget();
            }, 1200); // giving them time to read the message
    }

    /**
     * Checks if there is only one remaining target for the current
     * turn. It does this by first filtering the teams array to only
     * include teams that are not the current turn's team and contain at
     * least one fighter with health greater than 0. It then checks if
     * the length of this filtered array is equal to 1, and that the length
     * of the only remaining team is also 1, indicating that there is only
     * one remaining target. If both conditions are true, the function
     * returns true, otherwise it returns false.
     */
    get hasOneTarget(): boolean {
        return !this.whosTurn.manipulatedBy
            ? this.teams.filter(
                  (fighters, index) =>
                      index !== this.getTeamIdx(this.whosTurn) &&
                      fighters.filter((f) => f.health > 0).length > 0
              ).length === 1 &&
                  this.teams.filter(
                      (fighters, index) =>
                          index !== this.getTeamIdx(this.whosTurn) &&
                          fighters.filter((f) => f.health > 0).length > 0
                  )[0].length === 1
            : false;
    }

    /**
     * Updates the message that is displayed to the user(s). It starts by
     * creating several instances of the ButtonBuilder class and
     * StringSelectMenuBuilder class, which are used to create buttons
     * and select menus respectively. These buttons include options to
     * attack, select another target, defend, view the stand's abilities,
     * forfeit the fight, and a "waiting for NPC" option. Then it creates
     * a embed object that contains several properties such as title,
     * description, thumbnail, etc. The embed's title is set to the
     * infos.type, which is the type of fight. The embed's description is
     * generated by calling generateFightersInfo() function and the embed's
     * color is set based on the infos.type as well. The function then updates
     * the message with this new embed and buttons/select menus.
     * @param {boolean} silent If true, it will only display the status of the fight, no components.
     */
    private updateMessage(silent?: boolean) {
        if (this.ended) return;
        let whosTurn = this.whosTurn;
        if (!whosTurn) {
            this.infos.orderIndex = 0;
            whosTurn = this.whosTurn;
        }
        const attackButton = new ButtonBuilder()
            .setCustomId(`attack`)
            .setLabel(whosTurn.stand?.customAttack ? whosTurn.stand.customAttack.name : "Attack")
            .setEmoji(whosTurn.stand?.customAttack ? whosTurn.stand.customAttack.emoji : "👊")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(
                silent
                    ? true && this.whosTurn.canAttack
                    : this.infos.cooldowns.find(
                          (cd) =>
                              cd.id === whosTurn.id &&
                              cd.move === whosTurn.stand?.customAttack?.name
                      )?.cooldown < 0 && this.whosTurn.canAttack
            );
        const selectAnotherTargetButton = new ButtonBuilder()
            .setCustomId(`selectAnotherTarget`)
            .setLabel("Select another target")
            .setEmoji("◀️")
            .setDisabled(silent ? true : false)
            .setStyle(ButtonStyle.Secondary);
        const defendButton = new ButtonBuilder()
            .setCustomId(`defend`)
            .setLabel("Defend")
            .setEmoji("🛡️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(
                silent
                    ? true
                    : this.infos.cooldowns.find(
                          (cd) => cd.id === whosTurn.id && cd.move === "defend"
                      )?.cooldown < 0
            );
        const standButton = new ButtonBuilder()
            .setCustomId(`stand`)
            .setLabel(`${whosTurn.stand?.name}'s Abilities`)
            .setEmoji(whosTurn.stand?.emoji ?? "👊")
            .setDisabled(silent ? true : false)
            .setStyle(ButtonStyle.Primary);
        const forfeitButton = new ButtonBuilder()
            .setCustomId(`forfeit`)
            .setLabel("Forfeit")
            .setEmoji("🏳️")
            .setDisabled(
                silent
                    ? true
                    : this.infos.type === (FightTypes.Ranked || FightTypes.Boss)
                    ? true
                    : false
            )
            .setStyle(ButtonStyle.Danger);
        const waitingNPC = new ButtonBuilder()
            .setCustomId(`waitingNPC`)
            .setLabel("[Waiting for NPC...]")
            .setEmoji("⏳")
            .setDisabled(true)
            .setStyle(ButtonStyle.Danger);

        const embed: APIEmbed = {
            title: this.infos.type,
            thumbnail: {
                url:
                    this.ctx.client.users.cache.get(whosTurn.id)?.displayAvatarURL() ??
                    Functions.findNPC(whosTurn.id)?.avatarURL ??
                    undefined,
            },
            description: this.generateFightersInfo() + "\n**▬▬▬▬▬▬▬▬「TURNS」▬▬▬▬▬▬▬▬▬**",
            color: FightTypeColor[this.infos.type],
            footer: {
                text: `You have ${whosTurn.stamina} stamina left. ⚡`,
            },
            fields:
                this.turns[0].logs.length !== 0
                    ? this.turns.map((turn, index) => {
                          return {
                              name: `Turn ${index + 1}`,
                              value: turn.logs.join("\n"),
                          };
                      })
                    : [
                          {
                              name: "Turn 1",
                              value: "Fight has started",
                          },
                      ],
        };

        const rows: (ButtonBuilder | StringSelectMenuBuilder)[][] = [[attackButton, defendButton]];
        if (whosTurn.stand) rows[0].push(standButton);
        rows[0].push(forfeitButton);
        let content = `It's **${this.whosTurn.name}**'s turn.`;

        if (!this.hasOneTarget && !silent) {
            content += !Functions.findNPC(whosTurn.id)
                ? `\nSelected target: **${
                      this.fighters.find((f) => f.id === this.infos.target)?.name ?? "[ERROR]"
                  }**`
                : "";
            rows.push([selectAnotherTargetButton]);
        }

        try {
            this.ctx.makeMessage({
                content,
                embeds: [embed],
                components: Functions.findNPC(whosTurn.id)
                    ? [Functions.actionRow([waitingNPC])]
                    : rows.map((row) => Functions.actionRow(row)),
            });
        } catch (e) {
            console.error(e);
            this.emit("unexpectedEnd", "Failed to send message: " + (e as Error).message);
        }

        if (!silent && Functions.findNPC(whosTurn.id)) {
            if (this.whosTurn.extraTurns === 0) setTimeout(() => this.NPCAttack(), 1200);
            else this.NPCAttack();
        }
    }

    private generateFightersInfo(ignoreTeamIndex?: number) {
        return `**▬▬▬▬▬▬▬▬「HEALTH」▬▬▬▬▬▬▬▬**
${this.teams
    .filter((team, index) => index !== ignoreTeamIndex)
    .map((team, index) => {
        return `${team
            .map(
                (fighter) =>
                    `:heart: \`「Team ${index + 1}」\` **${
                        fighter.name
                    }:** ${fighter.health.toLocaleString(
                        "en-US"
                    )}/${fighter.maxHealth.toLocaleString("en-US")}`
            )
            .join("\n")}`;
    })
    .join("\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n")}\n
**▬▬▬▬▬▬▬▬「DEFENSE」▬▬▬▬▬▬▬▬**
${this.teams
    .filter((team, index) => index !== ignoreTeamIndex)
    .map((team, index) => {
        return `${team
            .map(
                (fighter) =>
                    `:shield: \`「Team ${index + 1}」\` **${
                        fighter.name
                    }:** ${fighter.defense.toLocaleString(
                        "en-US"
                    )}/${fighter.maxDefense.toLocaleString("en-US")}`
            )
            .join("\n")}`;
    })
    .join("\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n")}\n`;
    }
}

export class Fighter {
    public id: string;
    public name: string;
    public health: number;
    public stamina: number;
    public maxHealth: number;
    public maxStamina: number;
    public defense: number;
    public maxDefense: number;
    public stand: Stand;
    public level: number;
    public skillPoints: RPGUserDataJSON["skillPoints"];
    public isDefending: boolean;
    public defendCount: number;
    public dodgeFor: number;
    private lastRegeneratedDefense: number;
    public cantAttackFor: number;
    public frozenFor: number;
    public cantDefendFor: number;
    public extraTurns: number;
    public manipulatedBy: Fighter;

    constructor(data: RPGUserDataJSON | FightableNPC) {
        this.id = data.id;
        this.name = Functions.isRPGUserDataJSON(data) ? data.tag.slice(0, -5) : data.name;
        this.health = Functions.isRPGUserDataJSON(data)
            ? data.health
            : Functions.getMaxHealth(data);
        this.stamina = Functions.isRPGUserDataJSON(data)
            ? data.stamina
            : Functions.getMaxStamina(data);
        this.maxHealth = Functions.getMaxHealth(data);
        this.maxStamina = Functions.getMaxStamina(data);
        this.defense = this.maxHealth * 0.2;
        this.maxDefense = this.maxHealth * 0.2;
        this.stand = Functions.findStand(data.stand);
        this.level = data.level;
        this.skillPoints = Functions.getSkillPointsBonus(data);
        this.isDefending = false;
        this.dodgeFor = 0;
        this.defendCount = 0;
        this.cantAttackFor = 0;
        this.frozenFor = 0;
        this.cantDefendFor = 0;
        this.extraTurns = 0;
    }

    get canAttack(): boolean {
        return (
            this.stamina >= FighterAttackStaminaCost &&
            this.cantAttackFor === 0 &&
            this.frozenFor === 0
        );
    }

    get canDefend(): boolean {
        return this.defendCount < 3 && this.cantDefendFor === 0 && this.frozenFor === 0;
    }

    get isFrozen(): boolean {
        return this.frozenFor > 0;
    }

    regenerateDefense(): void {
        if (!this.lastRegeneratedDefense) this.lastRegeneratedDefense = this.maxDefense * 0.9;
        else this.lastRegeneratedDefense -= this.lastRegeneratedDefense * 0.1;
        this.defense = this.lastRegeneratedDefense;
    }

    public incrHealth(amount: number): void {
        this.health += amount;
        if (this.health > this.maxHealth) this.health = this.maxHealth;
        if (this.health < 0) this.health = 0;
    }

    public incrStamina(amount: number): void {
        this.stamina += amount;
        if (this.stamina > this.maxStamina) this.stamina = this.maxStamina;
        if (this.stamina < 0) this.stamina = 0;
    }

    removeHealth(
        amount: number,
        fighter?: Fighter,
        defenseBreak?: boolean,
        dodgeable?: boolean
    ): { type: FighterRemoveHealthTypes; amount: number; defense?: number } {
        if (amount === 0) {
            return {
                type: FighterRemoveHealthTypes.Normal,
                amount: 0,
            };
        }
        const oldHealth = this.health;
        const oldDefense = this.defense;
        // If is defending
        if (this.isDefending) {
            if (!fighter) {
                throw new Error("Fighter is defending but no fighter was provided.");
            }

            this.defendCount++;

            let multiplier = 0.15;
            if (fighter.skillPoints.defense > this.skillPoints.defense)
                multiplier +=
                    Functions.getDiffPercent(
                        fighter.skillPoints.defense,
                        this.skillPoints.defense
                    ) * 0.001;
            else if (fighter.skillPoints.defense < this.skillPoints.defense)
                multiplier -=
                    Functions.getDiffPercent(
                        fighter.skillPoints.defense,
                        this.skillPoints.defense
                    ) * 0.001;
            const healthAmount = Math.round(amount * multiplier);

            this.incrHealth(-healthAmount);
            console.log(healthAmount);
            this.defense -= Math.round(amount * 1.3);

            if (this.defense <= 0 || defenseBreak) {
                this.incrHealth(-(amount * (1.25 + multiplier)));
                this.regenerateDefense();
                this.isDefending = false;
                return {
                    type: FighterRemoveHealthTypes.BrokeGuard,
                    amount: oldHealth - this.health,
                };
            }

            return {
                type: FighterRemoveHealthTypes.Defended,
                amount: oldHealth - this.health,
                defense: oldDefense - this.defense,
            };
        } else this.incrHealth(-amount);

        return {
            type: FighterRemoveHealthTypes.Normal,
            amount: oldHealth - this.health,
        };
    }
}

export interface FightInfos {
    type: FightTypes;
    target?: Fighter["id"];
    selectedTargetCount?: number;
    targetMove?: string;
    attackAgain: number;
    dodgeAgain: number;
    orderIndex: number;
    attackOrder: Fighter["id"][];
    cooldowns: {
        id: string;
        move: string;
        cooldown: number;
    }[];
}

export interface FightEvents {
    end: [winners: Fighter[], losers: Fighter[][]];
    heartbeat: [turn: FightHandler["turns"]];
    forfeit: [winners: Fighter[], losers: Fighter[][]];
    unexpectedEnd: [message: string];
    handleAttack: [target: Fighter];
}

export enum FighterRemoveHealthTypes {
    Normal = 1,
    Dodged = 2,
    BrokeGuard = 3,
    Defended = 5,
}
