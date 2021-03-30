const express = require("express");
const config = require("config");
const path = require("path");
const jwt = require("jsonwebtoken");
const db = require("./db");
const { verifyToken } = require("./functions");
const multer = require("multer");

// Init Router.
const admin = express.Router();

// Getting configs.
const product_db = config.get("db.name.product");
const upload = multer({ dest: "/p/IMG/" });

// Admin API
// Render API
admin.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/su/index.html"));
});
admin.get("/new_product", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/su/new_product.html"));
});
admin.post("/get_product", verifyToken, (req, res) => {});
admin.post("/add_product", verifyToken, upload.single("file"), async function (req, res) {
    var token = req.token;
    jwt.verify(token, config.get("token.keyToken"), (err, result) => {
        if (err) throw err;
        var name = req.body.name;
        var price = req.body.price;
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
                const imagePath = path.join(__dirname, '/public/images');
                const fileUpload = new Resize(imagePath);
                if (!req.file) {
                    res.status(401).json({error: 'Please provide an image'});
                }
                const filename = await fileUpload.save(req.file.buffer);
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
                                img: filename,
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
admin.post("/rm_product", verifyToken, (req, res) => {});
admin.post("/ch_product", verifyToken, (req, res) => {});

module.exports = admin;
