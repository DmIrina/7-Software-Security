const express = require('express'),
    app = express(),
    jwt = require('jsonwebtoken'),      // Підключення бібліотеки JWT
    crypto = require('crypto');

const path = require("path");
const cors = require("cors");
const host = '127.0.0.1';
const port = 7000;



const tokenKey = "iryna_secret_key_4932";
const jwtExpirySeconds = 1000; // 10 sec


const users =
    [
        {
            "id": 1,
            "login": "user1",
            "password": "password1",
            "username": "***USER-1***"
        },
        {
            "id": 2,
            "login": "user2",
            "password": "password2",
            "username": "***USER-2***"
        },
        {
            "id": 3,
            "login": "user3",
            "password": "password3",
            "username": "***USER-3***"
        },
        {
            "id": 4,
            'login': "test@ukr.net",
            'password': "1111",
            'username': "Dmytriieva Iryna",
        },
    ]

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    if (req.headers.authorization) {
        jwt.verify(
            req.headers.authorization.split(' ')[1],
            tokenKey,
            (err, payload) => {
                if (err) next();
                else if (payload) {
                    for (let user of users) {
                        if (user.id === payload.id) {
                            req.user = user;
                            next();
                        }
                    }

                    if (!req.user) next();
                }
            }
        );
    }

    next();
});

app.post('/api/login', (req, res) => {
    for (let user of users) {
        if (
            req.body.login === user.login &&
            req.body.password === user.password
        ) {
            return res.status(200).json({
                id: user.id,
                login: user.login,
                username: user.username,
                jwtToken: jwt.sign({id: user.id}, tokenKey),
            });
        }
    }

    return res
        .status(404)
        .json({message: 'User not found'});
});

app.get('/', (req, res) => {
    if (req.user) {
        return res.status(200).json(req.user);
    }
    res.sendFile(path.join(__dirname + "/index.html"));

});

app.listen(port, host, () =>
    console.log(`Server listens http://${host}:${port}`)
);