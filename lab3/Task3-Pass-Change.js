// Засвоювання базових навичок OAuth2  авторизаційного протоколу
// зробити запит на API для зміни паролю
// https://auth0.com/docs/api/authenticate/database-connections/password-change#directly-set-the-new-password

var request = require("request");
const jwt = require("jsonwebtoken");
const querystring = require("querystring");
const axios = require("axios");

const app_name = 'Idmi App Lab02-Lab03';
const audience = "https://dev-gsdsdfssdf.us.auth0.com/api/v2/";
const grant_type = "client_credentials";
const client_id = "fsdffsdfsdf";
const client_secret = "sdfshfghdsDfdf";
const domain = "dev-dfdfgzdfgdfgdfg.us.auth0.com";
const userId = 'auth0|653bf23eac518e078556c656';
const oldPassword = 'fake_Pass_777'
const newPassword = 'fake_Pass_777';
const connection = "Username-Password-Authentication";
const url = "https://" + domain + "/api/v2/users/" + userId
i = 1

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
            console.log("scope: ", tokenResponse.scope);
            console.log("Access token: ", accessToken);
            resolve(accessToken);
        });
    });
}

const changePassword = (access_token) => {
    return new Promise((resolve, reject) => {
        var options = {
            method: 'PATCH',
            url: url,
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${access_token}`
            },
            data: {password: newPassword, connection: connection}
        };
        axios.request(options).then(function (response) {
            console.log("Пароль змінено на " + newPassword);
            console.log("Для перевірки використовуйте код Task1-Get-UserToken.js, " +
                "який спрацює лише з паролем fake_Pass_777");
            console.log(response.data);
        }).catch(function (error) {
            console.error(error);
        });
    });
}

    getAccessToken()
        .then((access_token) => changePassword(access_token))
        .catch((error) => console.error(error));
