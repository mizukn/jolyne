/* eslint-disable */
import fetch from "node-fetch";
import "dotenv/config";

const endpoint = "https://www.patreon.com/api/oauth2/api/current_user/campaigns";
const options = {
    headers: {
        Authorization: `Bearer ${process.env.PATREON_TOKEN}}`,
    },
};
async () => {
    let response = await fetch(endpoint, options);
    let json = await response.json();

    response = await fetch(
        `https://www.patreon.com/api/oauth2/api/campaigns/${json.data[0].id}/pledges`,
        options
    );
    json = await response.json();

    const pledges = json.data.filter((data: any) => data.type === "pledge");
    const users = json.included.filter((inc: any) => inc.type === "user");

    const patrons = pledges.map((pledge: any) => {
        const id = pledge.relationships.patron.data.id;
        const user = users.filter(
            (user: any) => user.id === pledge.relationships.patron.data.id
        )[0];

        return {
            id: id,
            full_name: user.attributes.full_name,
            vanity: user.attributes.vanity,
            email: user.attributes.email,
            discord_id: user.attributes.social_connections.discord
                ? user.attributes.social_connections.discord.user_id
                : null,
            amount_cents: pledge.attributes.amount_cents,
            created_at: pledge.attributes.created_at,
            declined_since: pledge.attributes.declined_since,
            patron_pays_fees: pledge.attributes.patron_pays_fees,
            pledge_cap_cents: pledge.attributes.pledge_cap_cents,
            image_url: user.attributes.image_url,
        };
    });
    console.log(users.map((user: any) => user.relationships.campaign?.data));
};

(async () => {
    let response = await fetch(endpoint, options);
    let json = await response.json();

    response = await fetch(
        `https://www.patreon.com/api/oauth2/v2/campaigns/${json.data[0].id}/pledges`,
        options
    );
    json = await response.json();
    console.log(json);
})();
