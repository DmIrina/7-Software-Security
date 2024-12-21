// login = "idmi_13194";
// password = "fake_Pass_777";

const uuid = require('uuid');
const express = require('express');
const onFinished = require('on-finished');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;
const fs = require('fs');
const cors = require('cors');
const axios = require("axios");
const request = require("request");
const jwt = require("jsonwebtoken");
const names = require("girl-names");
const querystring = require("querystring");
const app = express();

const audience = "https://dev-dfsdflskjdfls.us.auth0.com/api/v2/";
const client_id = "dslfk;lsdkjflsdjfsd";
const client_secret = "I-jskdskfjsdkfhjsdff";
const domain = "dev-dsfksdjflsdkjfkldf.us.auth0.com";
const url = "https://" + domain + '/oauth/token'

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const SESSION_KEY = 'Authorization';

class Session {
    #sessions = {}

    constructor() {
        try {
            this.#sessions = fs.readFileSync('./sessions.json', 'utf8');
            this.#sessions = JSON.parse(this.#sessions.trim());

            console.log(this.#sessions);
        } catch (e) {
            this.#sessions = {};
        }
    }

    #storeSessions() {
        fs.writeFileSync('./sessions.json', JSON.stringify(this.#sessions), 'utf-8');
    }

    set(key, value) {
        if (!value) {
            value = {};
        }
        this.#sessions[key] = value;
        this.#storeSessions();
    }

    get(key) {
        return this.#sessions[key];
    }

    init(res) {
        const sessionId = uuid.v4();
        this.set(sessionId);

        return sessionId;
    }

    destroy(req, res) {
        const sessionId = req.sessionId;
        delete this.#sessions[sessionId];
        this.#storeSessions();
    }
}

const sessions = new Session();

async function getUserInfo(accessToken) {
    const url = "https://dev-jlkjdflskjflkf.us.auth0.com/userinfo";

    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        return response.data;
    } catch (error) {
        console.error(error);
        throw new Error("Unable to fetch user information");
    }
}

function getAccessToken() {
    return new Promise((resolve, reject) => {
        let params = querystring.stringify({
            audience: audience,
            grant_type: "client_credentials",
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
            console.log("Access token: ", accessToken);
            resolve(accessToken);
        });
    });
}


function createUser(token, data) {
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

    return axios(optionsCreateUser)
        .then(response => {
            return response.data; // Return user data
        })
        .catch(error => {
            console.error(error);
            throw new Error("Unable to create user");
        });
}

function formatDateTime(timestamp) {
    const date = new Date(timestamp);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months in JS start from 0, so +1
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
}


const getNewAccessToken = (refresh_token) => {
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
            resolve(resp);
        });
    });
};


// Додати цей middleware перед іншими маршрутами для усунення помилки cors,
// Помилка виникає через політику Same-Origin Policy (SOP),
// яка обмежує запити з одного джерела на інше.
// запит зі сторінки, яка запущена на http://localhost:63342 (ЦуиІещкь), до сервера на http://localhost:3000.
// Це вважається різними джерелами, і браузер блокує такі запити за замовчуванням.
app.use(cors());

app.use((req, res, next) => {
    let currentSession = {};
    let sessionId = req.get(SESSION_KEY);

    if (sessionId) {
        currentSession = sessions.get(sessionId);
        if (!currentSession) {
            currentSession = {};
            sessionId = sessions.init(res);
        }
    } else {
        sessionId = sessions.init(res);
    }
    req.session = currentSession;
    req.sessionId = sessionId;
    onFinished(req, () => {
        const currentSession = req.session;
        const sessionId = req.sessionId;
        sessions.set(sessionId, currentSession);
    });

    next();
});

app.get('/', (req, res) => {
    if (req.session.username) {
        return res.json({
            username: req.session.username,
            nickname: req.session.nickname,
            email: req.session.email,
            exp: req.session.exp,
            name: req.session.name,
            logout: 'http://localhost:3000/logout'
        })
    }
    res.sendFile(path.join(__dirname + '/index.html'));
})

app.get('/logout', (req, res) => {
    sessions.destroy(req, res);
    res.redirect('/');
});

app.post('/api/login', async (req, res) => {
    let {login, password} = req.body;
    try {
        const options = {
            method: 'POST',
            url: "https://" + domain + "/oauth/token",
            headers: {'content-type': 'application/x-www-form-urlencoded'},
            form:
                {
                    grant_type: 'password',
                    username: login,
                    password: password,
                    audience: audience,
                    client_id: client_id,
                    client_secret: client_secret,
                    scope: "offline_access openid"         // для отримання refresh_token
                }
        };

        request(options, async function (error, response, body) {
            if (error) throw new Error(error);
            const resp = JSON.parse(body);
            const accessToken = resp.access_token;
            const refresh_token = resp.refresh_token;

            if (accessToken !== "" && accessToken !== undefined) {
                const userInfo = await getUserInfo(accessToken);
                // Інформація про користувача в userInfo
                console.log("User Info from auth0.com:");
                console.log(userInfo);
                console.log("Type: ", resp.token_type);
                console.log("Scope: ", resp.scope);
                console.log("Expires in: ", resp.expires_in);
                const decodedAccessToken = jwt.decode(resp.access_token);
                const expirationDateFormatted = formatDateTime(Number(decodedAccessToken.exp) * 1000);
                console.log("Expiration: ", expirationDateFormatted);
                console.log("Issuer:     ", Date(Number(decodedAccessToken.aud) * 1000));
                console.log("Audience: ", decodedAccessToken.aud);
                req.session.email = userInfo.email;
                req.session.nickname = userInfo.nickname;
                req.session.username = login;
                req.session.exp = expirationDateFormatted;
                req.session.login = login;
                req.session.name = userInfo.name;
                req.session.refresh_token = refresh_token;
                res.json({token: req.sessionId});
            } else {
                console.log("User not found");
                console.log(resp.toString());
            }
            res.status(401).send();
        });
    } catch (error) {
        console.error(error);
    }
});


app.post('/api/register', async (req, res) => {
    const {login, password} = req.body;
    const randomNum = Math.floor(Math.random() * 100000);
    let given_name = names.girlsname();
    let name = names.girlsname();
    let nickname = names.girlsname();
    const username = login + "_" + randomNum;

    const data = JSON.stringify({
        "username": username,
        "email": username + "@gmail.com",
        "user_metadata": {},
        "blocked": false,
        "email_verified": false,
        "app_metadata": {},
        "given_name": given_name,
        "family_name": name + " " + given_name,
        "name": name,
        "nickname": nickname + " " + name + " " + given_name,
        "connection": "Username-Password-Authentication",
        "password": password,
        "verify_email": false
    });

    try {
        const token = await getAccessToken();
        let userData = await createUser(token, data); // Get user data
        userData.password = password;

        res.json(userData); // Send user data to client
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/api/refresh_token', async (req, res) => {
    try {
        let curentRefreshToken = req.session.refresh_token;
        const resp = await getNewAccessToken(curentRefreshToken);
        const decodedAccessToken = jwt.decode(resp.access_token);
        const expirationDateFormatted = formatDateTime(Number(decodedAccessToken.exp) * 1000);
        res.json(expirationDateFormatted); // Send  data to client
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
