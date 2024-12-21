const fetch = require('node-fetch');
const express = require("express");
const querystring = require("querystring");
const bodyParser = require("body-parser");
const {auth} = require("express-oauth2-jwt-bearer");
const jsonwebtoken = require("jsonwebtoken");
const path = require("path");
const port = 3000;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// login = "testlogin";
// password = "passfake";

// random data
const constants = {
    DOMAIN: "dev-dfgdfgdfgdfg.us.auth0.com",
    CLIENT_ID: "gdfgdfgdfgdfg",
    CLIENT_SECRET:
        "I-LDHFJKFJB787FKDJFSDFJKFD",
    AUDIENCE: "https://dev-kjfhskljfhsdkfj.us.auth0.com/api/v2/",
};

const checkJwt = auth({
    audience: constants.AUDIENCE,
    issuerBaseURL: `https://${constants.DOMAIN}/`,
});

let app_token, public_key;

const get_user_token = async (
    domain,
    client_id,
    client_secret,
    audience,
    email,
    password
) => {
    let url = "https://" + domain + "/oauth/token";
    let params = querystring.stringify({
        audience: audience,
        grant_type: "password",
        client_id: client_id,
        client_secret: client_secret,
        username: email,
        password: password,
        scope: "offline_access openid",
    });
    return await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
    }).then((r) => r.json().then((data) => ({status: r.status, body: data})));
};

const get_refreshed_user_token = async (
    domain,
    client_id,
    client_secret,
    refresh_token
) => {
    let url = "https://" + domain + "/oauth/token";
    let params = querystring.stringify({
        grant_type: "refresh_token",
        client_id: client_id,
        client_secret: client_secret,
        refresh_token: refresh_token,
    });
    return await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
    }).then((r) => r.json().then((data) => ({status: r.status, body: data})));
};

const create_user_request = async (user, domain, app_token) => {
    let url = "https://" + domain + "/api/v2/users";
    let params = JSON.stringify({
        ...user,
        connection: "Username-Password-Authentication",
    });
    return await fetch(url, {
        method: "POST",
        headers: {
            Authorization: "Bearer " + app_token,
            "Content-Type": "application/json",
        },
        body: params,
    }).then((r) => r.json().then((data) => ({status: r.status, body: data})));
};

const get_app_token = async (domain, client_id, client_secret, audience) => {
    let url = "https://" + domain + "/oauth/token";
    let params = querystring.stringify({
        audience: audience,
        grant_type: "client_credentials",
        client_id: client_id,
        client_secret: client_secret,
    });
    return await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
    }).then((response) => response.json());
};

const get_public_key = async (domain) => {
    let url = "https://" + domain + "/pem";

    return await fetch(url, {
        method: "GET",
    }).then((response) => response.text());
};

const get_user_by_id = async (domain, id, app_token) => {
    let url = "https://" + domain + "/api/v2/users/" + id;
    return await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + app_token
        }
    }).then((response) => response.json());
};

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/index.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname + "/login.html"));
});

app.get("/logout", (req, res) => {
    res.redirect("/login");
});

app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname + "/signup.html"));
});

app.post("/api/login", (req, res) => {
    const {login, password} = req.body;

    get_user_token(
        constants.DOMAIN,
        constants.CLIENT_ID,
        constants.CLIENT_SECRET,
        constants.AUDIENCE,
        login,
        password
    ).then((data) => {
        if (data.status < 400) {
            res.json({
                token: data.body.access_token,
                refresh_token: data.body.refresh_token,
            });
        } else {
            res.status(data.status).send();
        }
    });
});

app.post("/api/signup", (req, res) => {
    const {email, username, password} = req.body;

    create_user_request(
        {email: email, username: username, password: password},
        constants.DOMAIN,
        app_token
    ).then((response) => {
        res.json(response).status(response.status);
    });
});

app.post("/api/token/refresh", (req, res) => {
    const {refresh_token} = req.body;

    get_refreshed_user_token(
        constants.DOMAIN,
        constants.CLIENT_ID,
        constants.CLIENT_SECRET,
        refresh_token
    ).then((response) => {
        if (response.status < 400) {
            res.json({
                token: response.body.access_token,
            });
        } else {
            res.status(response.status).send();
        }
    });
});

app.get("/api/userinfo", checkJwt, (req, res) => {
    const user_token = req.auth;
    const raw_jwt = user_token.token;

    jsonwebtoken.verify(raw_jwt, public_key, (err, decoded) => {
        console.log(decoded);
        get_user_by_id(constants.DOMAIN, decoded.sub, app_token).then((data) => {
            res.json({username: data.username});
        });
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);

    get_app_token(
        constants.DOMAIN,
        constants.CLIENT_ID,
        constants.CLIENT_SECRET,
        constants.AUDIENCE
    ).then((data) => {
        app_token = data.access_token;
    });

    get_public_key(constants.DOMAIN).then((data) => {
        public_key = data;
    });
});
