const express = require("express");
const config = require("config");
const path = require("path");
const jwt = require("jsonwebtoken");
const db = require("./db");
const { verifyToken } = require("./functions");

// Init Router.
const admin = express.Router();

// Getting configs.
const product_db = config.get("db.name.product");

// Admin API
// Render API
admin.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/su/index.html"));
});
admin.get("/new_product", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/su/new_product.html"));
});
admin.get("/list", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/su/list.html"));
});
admin.get("/product", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/su/product.html"));
});

// Product
admin.post("/get_product", verifyToken, (req, res) => {
    var token = req.token;
    jwt.verify(token, config.get("token.keyToken"), (err, result) => {
        if (err) throw err;
        if (result.type == "A") {
            var product_id = req.body.product_id;
            var query = {
                _id: db.getOID(product_id),
                soldBy: result.username,
                isDeleted: 0,
            };
            db.getDB()
                .collection(product_db)
                .find(query, {
                    projection: {
                        deleteDate: 0,
                        createDate: 0,
                        isDeleted: 0,
                    },
                })
                .toArray((err, result1) => {
                    if (err) throw err;
                    res.json({
                        status: 200,
                        success: true,
                        dtstamp: Date.now(),
                        body: result1,
                    });
                });
        } else {
            res.json({
                status: 403,
                success: false,
                dtstamp: Date.now(),
                msg: "You are not authorised to use this API!",
            });
        }
    });
});
admin.post("/get_product", verifyToken, (req, res) => {
    var token = req.token;
    jwt.verify(token, config.get("token.keyToken"), (err, result) => {
        if (err) throw err;
        if (result.type == "A") {
            var product_id = req.body.product_id;
            var query = {
                _id: db.getOID(product_id),
                soldBy: result.username,
                isDeleted: 0,
            };
            db.getDB()
                .collection(product_db)
                .findOne(
                    query,
                    {
                        projection: {
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
        } else {
            res.json({
                status: 403,
                success: false,
                dtstamp: Date.now(),
                msg: "You are not authorised to use this API!",
            });
        }
    });
});
admin.post("/add_product", verifyToken, (req, res) => {
    var token = req.token;
    jwt.verify(token, config.get("token.keyToken"), (err, result) => {
        if (err) throw err;
        var name = req.body.name;
        var price = req.body.price;
        var img = req.body.img;
        var category = req.body.category.toUpperCase();
        var details = req.body.details;
        var specs = req.body.specs;
        if (result.type == "A") {
            if (!name && !price && !img && !details && !specs && !category) {
                res.json({
                    status: 400,
                    success: false,
                    dtstamp: Date.now(),
                    msg: "Something's Missing, Bad Request.",
                });
            } else {
                var query = { name, isDeleted: 0 };
                db.getDB()
                    .collection(product_db)
                    .findOne(query, (err, result1) => {
                        if (err) throw err;
                        if (result1) {
                            res.json({
                                status: 200,
                                success: false,
                                dtstamp: Date.now(),
                                msg: "Such product already exists",
                            });
                        } else {
                            query = {
                                name,
                                price,
                                img,
                                details,
                                specs,
                                category,
                                isDeleted: 0,
                                createDate: Date.now(),
                                deleteDate: "",
                                rating: [],
                                soldBy: result.username,
                            };
                            db.getDB()
                                .collection(product_db)
                                .insertOne(query, (err, result2) => {
                                    if (err) throw err;
                                    if (result2.insertedId) {
                                        res.json({
                                            status: 200,
                                            success: true,
                                            dtstamp: Date.now(),
                                            msg:
                                                "New Product Added Successfully!",
                                            product_id: result2.insertedId,
                                        });
                                    } else {
                                        res.json({
                                            status: 200,
                                            msg:
                                                "Something went wrong while adding the product!",
                                            success: false,
                                            dtstamp: Date.now(),
                                        });
                                    }
                                });
                        }
                    });
            }
        } else {
            res.json({
                status: 403,
                success: false,
                dtstamp: Date.now(),
                msg: "You are not authorised to use this API!",
            });
        }
    });
});
admin.post("/ch_product", verifyToken, (req, res) => {
    var token = req.token;
    var p_id = req.body.product_id;
    jwt.verify(token, config.get("token.keyToken"), (err, result) => {
        if (err) throw err;
        if (req.body.soldBy) {
            res.json({
                status: 200,
                success: false,
                dtstamp: Date.now(),
                msg: "Cannot update Soldby from here!",
            });
        } else if (result.type == "A") {
            delete req.body["product_id"];
            var query = {
                _id: db.getOID(p_id),
                soldBy: result.username,
                isDeleted: 0,
            };
            db.getDB()
                .collection(product_db)
                .updateOne(query, { $set: req.body }, (err, result1) => {
                    if (err) throw err;
                    if (result1.matchedCount != 0) {
                        res.json({
                            status: 200,
                            success: true,
                            dtstamp: Date.now(),
                            msg: "Product Updated Successfully",
                        });
                    } else {
                        res.json({
                            status: 200,
                            msg:
                                "Were unable to update your product! Try again",
                            success: false,
                            dtstamp: Date.now(),
                        });
                    }
                });
        } else {
            res.json({
                status: 403,
                success: false,
                dtstamp: Date.now(),
                msg: "You are not authorised to use this API!",
            });
        }
    });
});
admin.post("/rm_product", verifyToken, (req, res) => {
    var token = req.token;
    jwt.verify(token, config.get("token.keyToken"), (err, result) => {
        if (err) throw err;
        if (result.type == "A") {
            var product_id = req.body.product_id;
            var query = {
                _id: db.getOID(product_id),
                soldBy: result.username,
                isDeleted: 0,
            };
            db.getDB()
                .collection(product_db)
                .updateOne(
                    query,
                    {
                        $set: {
                            isDeleted: 1,
                            deleteDate: String(Date.now()),
                        },
                    },
                    (err, result1) => {
                        if (err) throw err;
                        if (result1.matchedCount != 0) {
                            res.json({
                                status: 200,
                                success: true,
                                dtstamp: Date.now(),
                                msg: "Product Deleted Successfully",
                            });
                        } else {
                            res.json({
                                status: 200,
                                success: false,
                                dtstamp: Date.now(),
                                msg: "Were unable to delete the product",
                            });
                        }
                    }
                );
        } else {
            res.json({
                status: 403,
                success: false,
                dtstamp: Date.now(),
                msg: "You are not authorised to use this API!",
            });
        }
    });
});

// Order
admin.post("/pack_order", verifyToken, (req, res) => {});
admin.post("/deport_order", verifyToken, (req, res) => {});

module.exports = admin;
