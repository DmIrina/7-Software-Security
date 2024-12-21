// Lab 03 - Task 1
// Засвоювання базових навичок OAuth2  авторизаційного протоколу
// На основі даних Lab02 зробити запит на отримання user token (створеного в lab02)
// https://auth0.com/docs/api/authentication?javascript#resource-owner-password

var request = require("request");
const jwt = require("jsonwebtoken");

const username = "test";
const password = "fake_Pass_777";
const audience = "https://dev-ffvdbv7c4536ohs1.us.auth0.com/api/v2/";
const client_id = "dsfsdfsdfsdgfdgd";
const client_secret = "I-dfsdfgfghs";
const domain = "dev-gdfgasdasd.us.auth0.com";

var options = {
    method: 'POST',
    url: "https://" + domain + "/oauth/token",
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    form:
        {
            grant_type: 'password',
            username: username,
            password: password,
            audience: audience,
            client_id: client_id,
            client_secret: client_secret,
            scope: "offline_access openid"         // для отримання refresh_token
        }
};

request(options, function (error, response, body) {
    if (error) throw new Error(error);
    const resp = JSON.parse(body);
    console.log("Type: ", resp.token_type);
    console.log("Scope: ", resp.scope);
    console.log("Expires in: ", resp.expires_in, " секунд");

    const decodedAccessToken = jwt.decode(resp.access_token);
    console.log("Expiration: ", Date(Number(decodedAccessToken.exp) * 1000) );
    console.log("Issuer:     ", Date(Number(decodedAccessToken.aud) * 1000) );
    console.log("Audience: ", decodedAccessToken.aud);


    console.log("Access Token: ", resp.access_token);
    console.log("Refresh Token: ", resp.refresh_token);
});
