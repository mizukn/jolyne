import fetch from "node-fetch";
import "dotenv/config";

/*
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
*/
