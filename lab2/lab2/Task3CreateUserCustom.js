// lab02 Task-2
// Створити юзера с власним e-mail в системі використовуючи код
// auth0.com/docs/api/management/v2#!/Users/post_users
const randomNum = Math.floor(Math.random() * 100000);
const request = require("request");
const axios = require('axios');
const querystring = require("querystring");

const username = "idmi_" + randomNum;

const data = JSON.stringify({
    "username": username,
    "email": username + "@gmail.com",
    "user_metadata": {},
    "blocked": false,
    "email_verified": false,
    "app_metadata": {},
    "given_name": "Iryna",
    "family_name": "Dmytriieva",
    "name": "Dmytriieva Iryna",
    "nickname": "Kitten's Mother",
    "connection": "Username-Password-Authentication",
    "password": "fake_Pass_777",
    "verify_email": false
});
// random data
const app_name = 'Idmi App Lab02-Lab03';
const audience = "https://dev-gdfgdasdasd.us.auth0.com/api/v2/";
const grant_type = "client_credentials";
const client_id = "gsdfghfgfghfg";
const client_secret = "I-sdfsdfsdfgfgfgd";
const domain = "dev-dsfsdfsdfsdf.us.auth0.com";

function getAccessToken() {
    return new Promise((resolve, reject) => {
        let params = querystring.stringify({
            audience: audience,
            grant_type: grant_type,
            client_id: client_id,
            client_secret: client_secret
        });

        const optionsGetAccessToken = {
            method: 'POST',
            url: 'https://' + domain + '/oauth/token',
            headers: {'content-type': 'application/x-www-form-urlencoded'},
            body: params
        };

        request(optionsGetAccessToken, function (error, response, body) {
            if (error) {
                reject(error);
                return;
            }

            const tokenResponse = JSON.parse(body);
            const accessToken = tokenResponse.access_token;
            console.log("App NAme: " + app_name);
            console.log("Token:");
            console.log("type: ", tokenResponse.token_type);
            console.log("scope: ", tokenResponse.scope);
            console.log("expires in: ", tokenResponse.expires_in, " секунд");
            console.log("Access token: ", accessToken);

            resolve(accessToken);
        });
    });
}

function createUser(token) {
    const optionsCreateUser = {
        method: "POST",
        url: 'https://' + domain + '/api/v2/users',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        data: data
    };

    return axios(optionsCreateUser);
}

getAccessToken()
    .then(token => createUser(token))
    .then(response => console.log(response.data))
    .catch(error => console.error(error));


// Output
// App NAme: Idmi App Lab02-Lab03
// Token:
//     type:  Bearer
// scope:  create:users
// expires in:  86400  секунд
// Access token:  eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFQZGxGU1g2ZjA1Y3VwdGF2MDR5diJ9.eyJpc3MiOiJodHRwczovL2Rldi1mZnZkYnY3YzQ1MzZvaHMxLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJ5cDhVN05udnhrU25GNUIyUXdoZn
// B5SEROMDgxUmtRRUBjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly9kZXYtZmZ2ZGJ2N2M0NTM2b2hzMS51cy5hdXRoMC5jb20vYXBpL3YyLyIsImlhdCI6MTY5ODQyNzQ1MywiZXhwIjoxNjk4NTEzODUzLCJhenAiOiJ5cDhVN05udnhrU25GNUIyUXdoZnB5SEROMDgx
// UmtRRSIsInNjb3BlIjoiY3JlYXRlOnVzZXJzIiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIn0.k-hZs0ous51abDm4XK4mdoPsT0CHfjWZYE0y4VFuvA-saFL8j46Sf0HpE0Pu9neQ2oeeqW1L0095zOu_C74y1qqS32kuP-vBRIO8QljU75_M5iLIEt2c1BVj3k
// aJSu-cx6mUXRsJKBAmMhW1Sj1QhdUFfPTAbCCGXnonispUduXw9CX8e_JTxoROwI9beCQrCk4ITvp7fxKCT8Z00Y_FW46n6w3mrZDqe58WaQhI3DeltBIA0w_X58iRd_vDgi-ocnkjEbEAmZqlhnokMvwMg-jEt5sSk2FGPB-seQ9CCMK6OzYJttz9gE-7JgwdMZ1E
// bl4NBruP2ADFHgz0xZF-rQ
// {
//   blocked: false,
//       created_at: '2023-10-27T17:24:14.377Z',
//     email: 'idmi_13194@gmail.com',
//     email_verified: false,
//     family_name: 'Dmytriieva',
//     given_name: 'Iryna',
//     identities: [
//   {
//     connection: 'Username-Password-Authentication',
//     user_id: '653bf23eac518e078556c656',
//     provider: 'auth0',
//     isSocial: false
//   }
// ],
//     name: 'Dmytriieva Iryna',
//     nickname: "Kitten's Mother",
//     picture: 'https://s.gravatar.com/avatar/318ed71e0bf11c8337cebe4af81e1e8c?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fdi.png',
//     updated_at: '2023-10-27T17:24:14.377Z',
//     user_id: 'auth0|653bf23eac518e078556c656',
//     user_metadata: {},
//   username: 'idmi_13194'
// }


