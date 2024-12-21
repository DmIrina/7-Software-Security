// lab02 Task-2
// Створити юзера с власним e-mail в системі використовуючи код
// auth0.com/docs/api/management/v2#!/Users/post_users
const randomNum = Math.floor(Math.random() * 100000);
const request = require("request");
const axios = require('axios');
const querystring = require("querystring");

const data = JSON.stringify({
    // "username": "username-234234234234234234",
    "email": "idmi_" + randomNum + "@gmail.com",
    "user_metadata": {},
    "blocked": false,
    "email_verified": false,
    "app_metadata": {},
    "given_name": "Iryna",
    "family_name": "Dmytriieva",
    "name": "Dmytriieva Iryna",
    "nickname": "catother",
    "connection": "Username-Password-Authentication",
    "password": "passfake",
    "verify_email": false
});

function getAccessToken() {
    return new Promise((resolve, reject) => {
        let params = querystring.stringify({
            audience: "https://kpi.eu.auth0.com/api/v2/",
            grant_type: "client_credentials",
            client_id: "dfgdfgdgfg",
            client_secret: "dfgdfgdfgdfgfgdfg-dfgdfgdfgdfgfgg"
        });

        const optionsGetAccessToken = {
            method: 'POST',
            url: 'https://kpi.eu.auth0.com/oauth/token',
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
        url: 'https://kpi.eu.auth0.com/api/v2/users',
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
    .then(response => {
        console.log(response.data);
    })
    .catch(error => {
        console.error(error);
    });