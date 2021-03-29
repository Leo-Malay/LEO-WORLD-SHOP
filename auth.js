/*
 *   File: Authentication Router
 *   Author: Malay Bhavsar
 *   @All Rights Reserved
 */
// Importing the modules.
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const path = require("path");
const db = require("./db");
const { verifyToken } = require("./functions");

// Init Router.
const auth = express.Router();

// Getting configs.
const user_db = config.get("db.name.user");
const cart_db = config.get("db.name.cart");

/* Rendering Pages */
auth.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/a/login.html"));
});
auth.get("/new_account", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/a/new_account.html"));
});
auth.get("/account", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/a/account.html"));
});
auth.get("/forbidden", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/a/forbidden.html"));
});

/* Authorization */
auth.post("/login", (req, res) => {
    // Taking input from user.
    var username = req.body.username;
    var password = req.body.password;
    if (!username && !password) {
        res.json({
            status: 400,
            success: false,
            dtstamp: Date.now(),
            msg: "Something's Missing, Bad Request.",
        });
    } else {
        var query = { username, isDeleted: 0 };
        db.getDB()
            .collection(user_db)
            .findOne(query, (err, result) => {
                if (err) throw err;
                if (result) {
                    bcrypt.compare(
                        password,
                        result.password,
                        function (err, result1) {
                            if (err) throw err;
                            if (result1 == true) {
                                query = {
                                    username: username,
                                    uid: String(db.getID(result._id)),
                                    type: result.type,
                                    isDeleted: 0,
                                };
                                const token = jwt.sign(
                                    query,
                                    config.get("token.keyToken"),
                                    {
                                        expiresIn: 86400, // expires in 24 hours
                                    }
                                );
                                db.getDB()
                                    .collection(user_db)
                                    .updateOne(
                                        {
                                            _id: db.getOID(String(result._id)),
                                            username,
                                            type: result.type,
                                            isDeleted: 0,
                                        },
                                        { $set: { token } },
                                        (err, result2) => {
                                            if (err) throw err;
                                            if (result2.matchedCount != 0) {
                                                res.json({
                                                    status: 200,
                                                    msg: "Login Successfull",
                                                    token: token,
                                                    success: true,
                                                    dtstamp: Date.now(),
                                                });
                                            } else {
                                                res.json({
                                                    status: 200,
                                                    msg:
                                                        "Were unable to login! Try again",
                                                    token: "",
                                                    success: false,
                                                    dtstamp: Date.now(),
                                                });
                                            }
                                        }
                                    );
                            } else {
                                res.json({
                                    status: 200,
                                    msg: "Invalid Password",
                                    token: "",
                                    success: false,
                                    dtstamp: Date.now(),
                                });
                            }
                        }
                    );
                } else {
                    res.json({
                        status: 200,
                        msg: "No such user found!",
                        token: "",
                        success: false,
                        dtstamp: Date.now(),
                    });
                }
            });
    }
});
auth.post("/logout", verifyToken, (req, res) => {
    var token = req.token;
    jwt.verify(token, config.get("token.keyToken"), (err, result) => {
        if (err) throw err;
        var query = {
            _id: db.getOID(result.uid),
            username: result.username,
            type: result.type,
            token,
            isDeleted: 0,
        };
        db.getDB()
            .collection(user_db)
            .updateOne(query, { $set: { token: "" } }, (err, result1) => {
                if (err) throw err;
                if (result1.matchedCount != 0) {
                    res.json({
                        status: 200,
                        msg: "Logged out Successfully",
                        success: true,
                        dtstamp: Date.now(),
                    });
                } else {
                    res.json({
                        status: 200,
                        msg: "Were unable to logout! Try again",
                        success: false,
                        dtstamp: Date.now(),
                    });
                }
            });
    });
});

/* Account */
auth.post("/new_account", (req, res) => {
    var name = req.body.name;
    var username = req.body.username;
    var password = req.body.password;
    var mobile_no = req.body.mobile_no;
    var email = req.body.email;
    var city = req.body.city.toUpperCase();
    var state = req.body.state.toUpperCase();
    var country = req.body.country.toUpperCase();
    if (
        !name &&
        !username &&
        !password &&
        !mobile_no &&
        !email &&
        !city &&
        !state &&
        !country
    ) {
        res.json({
            status: 400,
            success: false,
            dtstamp: Date.now(),
            msg: "Something's Missing, Bad Request.",
        });
    } else {
        var query = { username, "personal.email": email, isDeleted: 0 };
        db.getDB()
            .collection(user_db)
            .findOne(query, (err, result) => {
                if (err) throw err;
                if (result) {
                    res.json({
                        status: 200,
                        success: false,
                        dtstamp: Date.now(),
                        msg: "Username or Email Already Exists! Try Again!",
                    });
                } else {
                    bcrypt.genSalt(10, function (err, salt) {
                        if (err) throw err;
                        bcrypt.hash(password, salt, function (err, password) {
                            if (err) throw err;
                            query = {
                                name,
                                username,
                                password,
                                token: "",
                                type: "U",
                                address: {
                                    city,
                                    state,
                                    country,
                                },
                                personal: { email, mobile_no },
                                isDeleted: 0,
                                createDate: String(Date.now()),
                                deleteDate: "",
                            };
                            db.getDB()
                                .collection(user_db)
                                .insertOne(query, (err, result) => {
                                    if (err) throw err;
                                    query = {
                                        uid: result.insertedId,
                                        username,
                                        cart: [],
                                        isDeleted: 0,
                                    };
                                    db.getDB()
                                        .collection(cart_db)
                                        .insertOne(query, (err, result1) => {
                                            if (err) throw err;
                                            if (result1.insertedId) {
                                                res.json({
                                                    status: 200,
                                                    success: true,
                                                    dtstamp: Date.now(),
                                                    msg:
                                                        "New Account Created Successfully!",
                                                });
                                            } else {
                                                res.json({
                                                    status: 200,
                                                    msg:
                                                        "Something went wrong while creating an account!",
                                                    success: false,
                                                    dtstamp: Date.now(),
                                                });
                                            }
                                        });
                                });
                        });
                    });
                }
            });
    }
});
auth.post("/get_account", verifyToken, (req, res) => {
    var token = req.token;
    jwt.verify(token, config.get("token.keyToken"), (err, result) => {
        if (err) throw err;
        var query = {
            _id: db.getOID(result.uid),
            username: result.username,
            type: result.type,
            isDeleted: 0,
            token: token,
        };
        db.getDB()
            .collection(user_db)
            .findOne(
                query,
                {
                    projection: {
                        password: 0,
                        token: 0,
                        deleteDate: 0,
                        createDate: 0,
                        isDeleted: 0,
                    },
                },
                (err, result1) => {
                    if (err) throw err;
                    res.json({
                        status: 200,
                        success: true,
                        dtstamp: Date.now(),
                        body: result1,
                    });
                }
            );
    });
});
auth.post("/ch_account", verifyToken, (req, res) => {
    var token = req.token;
    jwt.verify(token, config.get("token.keyToken"), (err, result) => {
        if (err) throw err;
        if (req.body.password || req.body.username) {
            res.json({
                status: 200,
                success: false,
                dtstamp: Date.now(),
                msg: "Cannot update Password or Username or Cart from here!",
            });
        } else {
            var query = {
                _id: db.getOID(result.uid),
                username: result.username,
                type: result.type,
                isDeleted: 0,
                token: token,
            };
            db.getDB()
                .collection(user_db)
                .updateOne(query, { $set: req.body }, (err, result1) => {
                    if (err) throw err;
                    if (result1.matchedCount != 0) {
                        res.json({
                            status: 200,
                            success: true,
                            dtstamp: Date.now(),
                            msg: "Account Updated Successfully",
                        });
                    } else {
                        res.json({
                            status: 200,
                            msg:
                                "Were unable to update your account! Try again",
                            success: false,
                            dtstamp: Date.now(),
                        });
                    }
                });
        }
    });
});
auth.post("/rm_account", verifyToken, (req, res) => {
    var token = req.token;
    jwt.verify(token, config.get("token.keyToken"), (err, result) => {
        if (err) throw err;
        var password = req.body.password;
        if (!password) {
            res.json({ status: 400, msg: "Something's Missing, Bad Request." });
        } else {
            var query = {
                _id: db.getOID(result.uid),
                username: result.username,
                type: result.type,
                isDeleted: 0,
                token: token,
            };
            db.getDB()
                .collection(user_db)
                .findOne(query, (err, result1) => {
                    if (err) throw err;
                    if (result1) {
                        bcrypt.compare(
                            password,
                            result1.password,
                            function (err, result2) {
                                if (err) throw err;
                                if (result2 == true) {
                                    db.getDB()
                                        .collection(user_db)
                                        .updateOne(
                                            {
                                                _id: db.getOID(result.uid),
                                                username: result.username,
                                                type: result.type,
                                                isDeleted: 0,
                                            },
                                            {
                                                $set: {
                                                    token: "",
                                                    isDeleted: 1,
                                                    deleteDate: String(
                                                        Date.now()
                                                    ),
                                                },
                                            },
                                            (err, result2) => {
                                                if (err) throw err;
                                                if (result2.matchedCount != 0) {
                                                    db.getDB()
                                                        .collection(cart_db)
                                                        .updateOne(
                                                            {
                                                                uid: db.getOID(
                                                                    result.uid
                                                                ),
                                                                username:
                                                                    result.username,
                                                                isDeleted: 0,
                                                            },
                                                            {
                                                                $set: {
                                                                    isDeleted: 1,
                                                                    cart: [],
                                                                },
                                                            },
                                                            (err, result3) => {
                                                                if (err)
                                                                    throw err;
                                                                if (
                                                                    result3.matchedCount !=
                                                                    0
                                                                ) {
                                                                    res.json({
                                                                        status: 200,
                                                                        success: true,
                                                                        dtstamp: Date.now(),
                                                                        msg:
                                                                            "Account Deleted Successfully",
                                                                    });
                                                                } else {
                                                                    res.json({
                                                                        status: 200,
                                                                        success: false,
                                                                        dtstamp: Date.now(),
                                                                        msg:
                                                                            "Were unable to delete the account",
                                                                    });
                                                                }
                                                            }
                                                        );
                                                } else {
                                                    res.json({
                                                        status: 200,
                                                        success: false,
                                                        dtstamp: Date.now(),
                                                        msg:
                                                            "Were unable to delete the account",
                                                    });
                                                }
                                            }
                                        );
                                } else {
                                    res.json({
                                        status: 200,
                                        success: false,
                                        dtstamp: Date.now(),
                                        msg: "Invalid Password",
                                    });
                                }
                            }
                        );
                    } else {
                        res.json({
                            status: 200,
                            success: false,
                            dtstamp: Date.now(),
                            msg: "No such user found!",
                        });
                    }
                });
        }
    });
});

module.exports = auth;
