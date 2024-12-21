// lab02 Task-1
// Створити запити на отримання токену через client_credentials grant

var request = require("request");
const querystring = require("querystring");

let params = querystring.stringify({
    audience: "https://kpi.eu.auth0.com/api/v2/",
    grant_type: "client_credentials",
    client_id: "fgdfgddgdfg",
    client_secret: "dfgdfgdfgdfgdgfg"
});

var options = {
    method: 'POST',
    url: 'https://kpi.eu.auth0.com/oauth/token',
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params
};

request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
});