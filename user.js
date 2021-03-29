/*
 *   File: User Router
 *   Author: Malay Bhavsar
 *   @All Rights Reserved
 */
// Importing the modules.
const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("config");
const path = require("path");
const db = require("./db");
const { verifyToken } = require("./functions");

// Init Router.
const user = express.Router();

// Getting configs.
const cart_db = config.get("db.name.cart");
const order_db = config.get("db.name.order");
const product_db = config.get("db.name.product");
const system_db = config.get("db.name.system");

// User API

/* Render Page */
user.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/u/home.html"));
});
user.get("/home", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/u/home.html"));
});
user.get("/product", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/u/product.html"));
});
user.get("/cart", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/u/cart.html"));
});
user.get("/billing", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/u/billing.html"));
});
user.get("/order_confirm", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/u/order_confirm.html"));
});

/* Cart */
user.get("/get_cart", verifyToken, (req, res) => {
    var token = req.token;
    jwt.verify(token, config.get("token.keyToken"), (err, result) => {
        if (err) throw err;
        var query = {
            uid: db.getOID(result.uid),
            username: result.username,
            isDeleted: 0,
        };
        db.getDB()
            .collection(cart_db)
            .findOne(query, (err, result1) => {
                if (err) throw err;
                res.json({
                    status: 200,
                    success: true,
                    dtstamp: Date.now(),
                    body: result1.cart,
                });
            });
    });
});
user.post("/add_cart", verifyToken, (req, res) => {
    var product_id = req.body.product_id;
    var product_qty = req.body.product_qty;
    var token = req.token;
    if (!product_id && !product_qty) {
        res.json({
            status: 400,
            success: false,
            dtstamp: Date.now(),
            msg: "Something's Missing, Bad Request.",
        });
    } else {
        jwt.verify(token, config.get("token.keyToken"), (err, result) => {
            var query = {
                uid: db.getOID(result.uid),
                username: result.username,
                isDeleted: 0,
            };
            db.getDB()
                .collection(product_db)
                .findOne(
                    {
                        _id: db.getOID(product_id),
                        isDeleted: 0,
                    },
                    (err, result0) => {
                        if (err) throw err;
                        if (result0) {
                            db.getDB()
                                .collection(cart_db)
                                .findOne(
                                    {
                                        uid: db.getOID(result.uid),
                                        username: result.username,
                                        isDeleted: 0,
                                        "cart.product_id": product_id,
                                    },
                                    (err, result1) => {
                                        if (err) throw err;
                                        if (result1) {
                                            res.json({
                                                status: 200,
                                                success: false,
                                                dtstamp: Date.now(),
                                                msg: "product already in cart!",
                                            });
                                        } else {
                                            db.getDB()
                                                .collection(cart_db)
                                                .updateOne(
                                                    query,
                                                    {
                                                        $addToSet: {
                                                            cart: {
                                                                product_id,
                                                                product_qty,
                                                            },
                                                        },
                                                    },
                                                    (err, result2) => {
                                                        if (err) throw err;
                                                        if (
                                                            result2.matchedCount !=
                                                            0
                                                        ) {
                                                            res.json({
                                                                status: 200,
                                                                success: true,
                                                                dtstamp: Date.now(),
                                                                msg:
                                                                    "Added to cart Successfully",
                                                            });
                                                        } else {
                                                            res.json({
                                                                status: 200,
                                                                success: false,
                                                                dtstamp: Date.now(),
                                                                msg:
                                                                    "Were unable to add to cart! Try again",
                                                            });
                                                        }
                                                    }
                                                );
                                        }
                                    }
                                );
                        } else {
                            res.json({
                                status: 200,
                                success: false,
                                dtstamp: Date.now(),
                                msg: "Such product doesn't exist!",
                            });
                        }
                    }
                );
        });
    }
});
user.post("/rm_cart", verifyToken, (req, res) => {
    var token = req.token;
    var product_id = req.body.product_id;
    if (!product_id) {
        res.json({
            status: 400,
            success: false,
            dtstamp: Date.now(),
            msg: "Something's Missing, Bad Request.",
        });
    } else {
        jwt.verify(token, config.get("token.keyToken"), (err, result) => {
            if (err) throw err;
            var query = {
                uid: db.getOID(result.uid),
                username: result.username,
                isDeleted: 0,
            };
            db.getDB()
                .collection(cart_db)
                .updateOne(
                    query,
                    { $pull: { cart: { product_id } } },
                    { multi: false },
                    (err, result1) => {
                        if (err) throw err;
                        if (
                            result1.matchedCount != 0 &&
                            result1.modifiedCount != 0
                        ) {
                            res.json({
                                status: 200,
                                success: true,
                                dtstamp: Date.now(),
                                msg: "Removed from cart Successfully",
                            });
                        } else {
                            res.json({
                                status: 200,
                                success: false,
                                dtstamp: Date.now(),
                                msg:
                                    "Were unable to remove from cart! Try again",
                            });
                        }
                    }
                );
        });
    }
});
user.post("/ch_cart", verifyToken, (req, res) => {
    var token = req.token;
    var product_id = req.body.product_id;
    var product_qty = req.body.product_qty;
    if (!product_id && !product_qty) {
        res.json({
            status: 400,
            success: true,
            dtstamp: Date.now(),
            msg: "Something's Missing, Bad Request.",
        });
    } else {
        jwt.verify(token, config.get("token.keyToken"), (err, result) => {
            if (err) throw err;
            var query = {
                uid: db.getOID(result.uid),
                username: result.username,
                isDeleted: 0,
                "cart.product_id": product_id,
            };
            db.getDB()
                .collection(cart_db)
                .updateOne(
                    query,
                    {
                        $set: {
                            "cart.$": { product_id, product_qty },
                        },
                    },
                    (err, result1) => {
                        if (err) throw err;
                        if (
                            result1.matchedCount != 0 &&
                            result1.modifiedCount != 0
                        ) {
                            res.json({
                                status: 200,
                                success: true,
                                dtstamp: Date.now(),
                                msg: "Cart Updated Successfully",
                            });
                        } else {
                            res.json({
                                status: 200,
                                success: false,
                                dtstamp: Date.now(),
                                msg:
                                    "Were unable to update the cart! Try again",
                            });
                        }
                    }
                );
        });
    }
});
user.post("/pay_cart", verifyToken, (req, res) => {
    var token = req.token;
    var pay_amount = req.body.pay_amount;
    jwt.verify(token, config.get("token.keyToken"), (err, result) => {
        if (err) throw err;
        var query = {
            uid: db.getOID(result.uid),
            username: result.username,
            isDeleted: 0,
        };
        db.getDB()
            .collection(cart_db)
            .updateOne(query, { $set: { pay_amount } }, (err, result1) => {
                if (err) throw err;
                if (result1.modifiedCount != 0) {
                    res.json({
                        status: 200,
                        success: true,
                        dtstamp: Date.now(),
                        msg: "Amount updated successfully",
                    });
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        dtstamp: Date.now(),
                        msg: "Unable to update amount",
                    });
                }
            });
    });
});
user.get("/bill", verifyToken, (req, res) => {
    var token = req.token;
    jwt.verify(token, config.get("token.keyToken"), (err, result) => {
        if (err) throw err;
        var query = {
            uid: db.getOID(result.uid),
            username: result.username,
            isDeleted: 0,
        };
        db.getDB()
            .collection(cart_db)
            .findOne(query, (err, result) => {
                if (err) throw err;
                db.getDB()
                    .collection(system_db)
                    .findOne(
                        {},
                        { projection: { service_tax: 1, delivery_chrg: 1 } },
                        (err, result1) => {
                            if (err) throw err;
                            res.json({
                                status: 200,
                                success: true,
                                dtstamp: Date.now(),
                                body: {
                                    pay_amount: result.pay_amount,
                                    delivery_chrg: result1.delivery_chrg,
                                    service_tax: result1.service_tax,
                                },
                            });
                        }
                    );
            });
    });
});

/* Order */
user.post("/order", verifyToken, (req, res) => {
    var token = req.token;
    jwt.verify(token, config.get("token.keyToken"), (err, result) => {
        if (err) throw err;
        var query = {
            uid: db.getOID(result.uid),
            username: result.username,
            isDeleted: 0,
        };
        db.getDB()
            .collection(order_db)
            .find(query)
            .toArray((err, result1) => {
                if (err) throw err;
                res.json({
                    status: 200,
                    success: true,
                    dtstamp: Date.now(),
                    body: result1,
                });
            });
    });
});
user.post("/place_order", verifyToken, (req, res) => {
    var token = req.token;
    var pay_type = req.body.pay_type;
    var pay_amount = req.body.pay_amount;
    var name = req.body.name;
    var msg = req.body.msg;
    var address = req.body.address;
    var mobile_no = req.body.mobile_no;
    if (!pay_type || !name || !msg || !address || !mobile_no || !pay_amount) {
        res.json({
            status: 400,
            success: false,
            dtstamp: Date.now(),
            msg: "Some missing fields!",
        });
    } else {
        jwt.verify(token, config.get("token.keyToken"), (err, result) => {
            var query = {
                uid: db.getOID(result.uid),
                username: result.username,
                isDeleted: 0,
            };
            db.getDB()
                .collection(cart_db)
                .findOne(query, { projection: { cart: 1 } }, (err, result1) => {
                    if (err) throw err;
                    if (result1.matchedCount != 0) {
                        query1 = {
                            uid: db.getOID(result.uid),
                            username: result.username,
                            cart: result1.cart,
                            pay_type,
                            pay_amount,
                            pay_id: "",
                            details: {
                                name,
                                msg,
                                address,
                                mobile_no,
                            },
                            isDeleted: 0,
                            status: 0,
                        };
                        db.getDB()
                            .collection(order_db)
                            .insertOne(query1, (err, result2) => {
                                if (err) throw err;
                                db.getDB()
                                    .collection(cart_db)
                                    .updateOne(
                                        query,
                                        { $set: { cart: [], pay_amount: 0 } },
                                        (err, result3) => {
                                            if (err) throw err;
                                            if (result3.modifiedCount != 0) {
                                                res.json({
                                                    status: 200,
                                                    success: true,
                                                    dtstamp: Date.now(),
                                                    msg:
                                                        "Order placed Successfully",
                                                    order_id: db.getID(
                                                        result2.insertedID
                                                    ),
                                                });
                                            } else {
                                                res.json({
                                                    status: 200,
                                                    success: false,
                                                    dtstamp: Date.now(),
                                                    msg:
                                                        "Something went wrong! Try again later or check orders!",
                                                    order_id: "",
                                                });
                                            }
                                        }
                                    );
                            });
                    } else {
                        res.json({
                            status: 200,
                            success: false,
                            dtstamp: Date.now(),
                            msg: "Unable to place order as user doesn't exist.",
                        });
                    }
                });
        });
    }
});
user.post("/cancel_order", verifyToken, (req, res) => {
    var token = req.token;
    var order_id = req.body.order_id;
    if (!order_id) {
        res.json({
            status: 200,
            success: false,
            dtstamp: Date.now(),
            msg: "No Order to cancel",
        });
    } else {
        jwt.verify(token, config.get("token.keyToken"), (err, result) => {
            if (err) throw err;
            var query = {
                _id: db.getOID(order_id),
                uid: db.getOID(result.uid),
                username: result.username,
                isDeleted: 0,
            };
            db.getDB()
                .collection(order_db)
                .updateOne(query, { $set: { status: -1 } }, (err, result1) => {
                    if (err) throw err;
                    if (result1.matchedCount != 0) {
                        res.json({
                            status: 200,
                            success: true,
                            dtstamp: Date.now(),
                            msg: "Order cancelled Successfully",
                        });
                    } else {
                        res.json({
                            status: 200,
                            success: false,
                            dtstamp: Date.now(),
                            msg:
                                "Unable to cancel your order as user doesn't exist.",
                        });
                    }
                });
        });
    }
});

/* Home & Product */
user.post("/product", (req, res) => {
    var product_id = req.body.product_id;
    db.getDB()
        .collection(product_db)
        .findOne(
            { _id: db.getOID(product_id), isDeleted: 0 },
            (err, result) => {
                if (err) throw err;
                res.json({
                    status: 200,
                    success: true,
                    dtstamp: Date.now(),
                    body: result,
                });
            }
        );
});
user.post("/home", (req, res) => {
    db.getDB()
        .collection(system_db)
        .findOne({}, { projection: { popular: 1 } }, (err, result) => {
            if (err) throw err;
            db.getDB()
                .collection(product_db)
                .find(
                    { _id: { $in: result.popular }, isDeleted: 0 },
                    { projection: { _id: 1, name: 1, img: 1, price: 1 } }
                )
                .toArray((err, result1) => {
                    if (err) throw err;
                    res.json({
                        status: 200,
                        success: true,
                        dtstamp: Date.now(),
                        category: "Popular Products",
                        body: result1,
                    });
                });
        });
});
user.post("/category", (req, res) => {
    db.getDB()
        .collection(system_db)
        .findOne({}, { projection: { category: 1 } }, (err, result) => {
            if (err) throw err;
            res.json({
                status: 200,
                success: true,
                dtstamp: Date.now(),
                body: result.category,
            });
        });
});
user.post("/get_category", (req, res) => {
    var category = req.body.category.toUpperCase();
    db.getDB()
        .collection(system_db)
        .findOne({}, { projection: { category: 1 } }, (err, result) => {
            if (err) throw err;
            if (result.category.includes(category)) {
                db.getDB()
                    .collection(product_db)
                    .find(
                        { category, isDeleted: 0 },
                        {
                            projection: {
                                _id: 1,
                                name: 1,
                                price: 1,
                                img: 1,
                            },
                        }
                    )
                    .toArray((err, result1) => {
                        if (err) throw err;
                        res.json({
                            status: 200,
                            success: true,
                            dtstamp: Date.now(),
                            category,
                            body: result1,
                        });
                    });
            } else {
                res.json({
                    status: 200,
                    success: false,
                    dtstamp: Date.now(),
                    body: [],
                    msg: "No such category found!",
                });
            }
        });
});

/* Rating and comments */
// Under construction

module.exports = user;
