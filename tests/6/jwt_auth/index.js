const express = require("express");
const querystring = require("querystring");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const {auth} = require("express-oauth2-jwt-bearer");
const jsonwebtoken = require("jsonwebtoken");
const session = require("express-session");
const fetch = require('node-fetch');
const path = require("path");
const port = 3000;

// login = "testlogin";
// password = "passfake";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(
    session({
        resave: false,
        saveUninitialized: false,
        secret: "Default secret",
        cookie: {},
    })
);

// login = "testlogin";
// password = "passfake";

// random data
const constants = {
    DOMAIN: "dev-kjfhskljfhsdkfj.us.auth0.com",
    CLIENT_ID: "fsdflkxklbhxkjcnoloe",
    CLIENT_SECRET:
        "I-LDHFJKFJB787FKDJFSDFJKFD",
    AUDIENCE: "https://dev-kjfhskljfhsdkfj.us.auth0.com/api/v2/",
};

const checkJwt = auth({
    audience: constants.AUDIENCE,
    issuerBaseURL: `https://${constants.DOMAIN}/`,
});

let app_token, public_key;

const get_user_token_by_authorization_code = async (
    domain,
    client_id,
    client_secret,
    audience,
    code,
    redirect_uri
) => {
    let url = "https://" + domain + "/oauth/token";
    let params = querystring.stringify({
        grant_type: "authorization_code",
        client_id: client_id,
        client_secret: client_secret,
        audience: audience,
        code: code,
        redirect_uri: redirect_uri,
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
            Authorization: "Bearer " + app_token,
        },
    }).then((response) => response.json());
};

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/index.html"));
});

app.get("/login", (req, res) => {
    let query = querystring.stringify({
        client_id: constants.CLIENT_ID,
        redirect_uri: "http://localhost:3000/login_callback",
        response_type: "code",
        response_mode: "query",
        scope: "offline_access openid",
        audience: constants.AUDIENCE,
    });
    let authorize_url = "https://" + constants.DOMAIN + "/authorize?" + query;
    res.redirect(authorize_url);
});

app.get("/login_callback", (req, res) => {
    const {code} = req.query;

    get_user_token_by_authorization_code(
        constants.DOMAIN,
        constants.CLIENT_ID,
        constants.CLIENT_SECRET,
        constants.AUDIENCE,
        code,
        "http://localhost:3000/login_callback"
    ).then((data) => {
        let body = data.body;

        req.session.token = body.access_token;
        res.cookie("refresh_token", body.refresh_token);
        res.redirect("/");
    });
});

app.get("/logout", (req, res) => {
    let query = querystring.stringify({
        client_id: constants.CLIENT_ID,
        returnTo: "http://localhost:3000/login",
    });
    let logout_url = "https://" + constants.DOMAIN + "/v2/logout?" + query;

    res.redirect(logout_url);
});

app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname + "/signup.html"));
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

app.get("/api/token", (req, res) => {
    if (req.session.token) {
        jsonwebtoken.verify(req.session.token, public_key, (err, decoded) => {
            if (err) {
                res.status(401).send();
            } else {
                res.json({token: req.session.token});
            }
        });
    } else {
        res.status(401).send();
    }
});

app.get("/api/userinfo", checkJwt, (req, res) => {
    const user_token = req.auth;
    const raw_jwt = user_token.token;

    jsonwebtoken.verify(raw_jwt, public_key, (err, decoded) => {
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
