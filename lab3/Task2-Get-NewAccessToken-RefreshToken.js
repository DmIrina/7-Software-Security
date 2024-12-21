// Засвоювання базових навичок OAuth2  авторизаційного протоколу
// Отримати оновлений токен використовуючи refresh-token grant type
// https://auth0.com/docs/api/authentication?javascript#refresh-token

var request = require("request");
const jwt = require("jsonwebtoken");

const username = "test";
const password = "fake_Pass_777";
const audience = "https://dev-sadsdfgdfg.us.auth0.com/api/v2/";
const client_id = "dfsfasdfdfg";
const client_secret = "I-sdfdghzfgzsdfsf";
const domain = "dev-dfssagdfg.us.auth0.com";


const getToken = () => {
    return new Promise((resolve, reject) => {
        const options = {
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
            console.log("Old Access Token: \n", resp.access_token);
            console.log("Type: ", resp.token_type);
            console.log("Scope: ", resp.scope);
            console.log("Expires in: ", resp.expires_in, " секунд");

            const decodedAccessToken = jwt.decode(resp.access_token);
            console.log("Expiration: ", Date(Number(decodedAccessToken.exp) * 1000));
            console.log("Issuer:     ", Date(Number(decodedAccessToken.aud) * 1000));
            console.log("Audience: ", decodedAccessToken.aud);
            console.log("Refresh Token: \n", resp.refresh_token);
            resolve(resp.refresh_token);
        });
    });
}


const getRefreshedToken = (refresh_token) => {

    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            url: "https://" + domain + "/oauth/token",
            headers: {'content-type': 'application/x-www-form-urlencoded'},
            form: {
                grant_type: 'refresh_token',
                client_id: client_id,
                client_secret: client_secret,
                refresh_token: refresh_token
            }
        };

        request(options, function (error, response, body) {
            if (error) reject(error);

            const resp = JSON.parse(body);
            console.log("New Access Token: \n", resp.access_token);
            console.log("TokenType: ", resp.token_type);
            console.log("Scope: ", resp.scope);
            console.log("Expires in: ", resp.expires_in, " секунд");

            const decodedAccessToken = jwt.decode(resp.access_token);
            console.log("Expiration:   ", Date(Number(decodedAccessToken.exp) * 1000));
            console.log("Issuer:       ", Date(Number(decodedAccessToken.aud) * 1000));
            console.log("Audience:     ", decodedAccessToken.aud);

            const decodedIDToken = jwt.decode(resp.id_token);
            console.log("ID Token: \n", resp.id_token);
            console.log("Given Name : ", decodedIDToken.given_name);
            console.log("Family Name: ", decodedIDToken.family_name);
            console.log("Nick Name:   ", decodedIDToken.nickname);
            console.log("Name:        ", decodedIDToken.name);
            console.log("Updated At:  ", decodedIDToken.updated_at);
            console.log("email:       ", decodedIDToken.email);
            console.log("Issuere:     ", decodedIDToken.iss);
            console.log("Audience:    ", decodedIDToken.aud);
            console.log("Expiration:  ", Date(Number(decodedIDToken.exp) * 1000));
            console.log("Issuer:      ", Date(Number(decodedIDToken.aud) * 1000));
        });
    });
};

getToken()
    .then((access_token) => getRefreshedToken(access_token))
    .catch((error) => console.error(error));
