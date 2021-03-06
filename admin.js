const express = require("express"),
    config = require("config"),
    path = require("path"),
    jwt = require("jsonwebtoken"),
    db = require("./db"),
    { verifyToken: verifyToken } = require("./functions"),
    admin = express.Router(),
    product_db = config.get("db.name.product"),
    order_db = config.get("db.name.order");
admin.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/su/index.html"));
}),
    admin.get("/new_product", (req, res) => {
        res.sendFile(path.join(__dirname + "/public/su/new_product.html"));
    }),
    admin.get("/list", (req, res) => {
        res.sendFile(path.join(__dirname + "/public/su/list.html"));
    }),
    admin.get("/product", (req, res) => {
        res.sendFile(path.join(__dirname + "/public/su/product.html"));
    }),
    admin.post("/admin_dash", verifyToken, (req, res) => {
        var token = req.token;
        jwt.verify(token, config.get("token.keyToken"), (err, result) => {
            if (err) throw err;
            if ("A" == result.type) {
                var query = {
                    _id: db.getOID(result.uid),
                    username: result.username,
                    isDeleted: 0,
                };
                db.getDB()
                    .collection(user_db)
                    .findOne(
                        query,
                        {
                            projection: {
                                deleteDate: 0,
                                createDate: 0,
                                isDeleted: 0,
                                total_rev: 1,
                                total_order: 1,
                            },
                        },
                        (err, result1) => {
                            if (err) throw err;
                            res.json({
                                status: 200,
                                success: !0,
                                dtstamp: Date.now(),
                                body: result1,
                            });
                        }
                    );
            } else
                res.json({
                    status: 403,
                    success: !1,
                    dtstamp: Date.now(),
                    msg: "You are not authorised to use this API!",
                });
        });
    }),
    admin.post("/list", verifyToken, (req, res) => {
        var token = req.token;
        jwt.verify(token, config.get("token.keyToken"), (err, result) => {
            if (err) throw err;
            if ("A" == result.type) {
                var query = { soldBy: result.username, isDeleted: 0 };
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
                            success: !0,
                            dtstamp: Date.now(),
                            body: result1,
                        });
                    });
            } else
                res.json({
                    status: 403,
                    success: !1,
                    dtstamp: Date.now(),
                    msg: "You are not authorised to use this API!",
                });
        });
    }),
    admin.post("/get_product", verifyToken, (req, res) => {
        var token = req.token;
        jwt.verify(token, config.get("token.keyToken"), (err, result) => {
            if (err) throw err;
            if ("A" == result.type) {
                var product_id = req.body.product_id,
                    query = {
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
                                success: !0,
                                dtstamp: Date.now(),
                                body: result1,
                            });
                        }
                    );
            } else
                res.json({
                    status: 403,
                    success: !1,
                    dtstamp: Date.now(),
                    msg: "You are not authorised to use this API!",
                });
        });
    }),
    admin.post("/add_product", verifyToken, (req, res) => {
        var token = req.token;
        jwt.verify(token, config.get("token.keyToken"), (err, result) => {
            if (err) throw err;
            var name = req.body.name,
                price = req.body.price,
                img = req.body.img,
                category = req.body.category.toUpperCase(),
                details = req.body.details,
                specs = req.body.specs;
            if ("A" == result.type)
                if (name || price || img || details || specs || category) {
                    var query = { name: name, isDeleted: 0 };
                    db.getDB()
                        .collection(product_db)
                        .findOne(query, (err, result1) => {
                            if (err) throw err;
                            result1
                                ? res.json({
                                      status: 200,
                                      success: !1,
                                      dtstamp: Date.now(),
                                      msg: "Such product already exists",
                                  })
                                : ((query = {
                                      name: name,
                                      price: price,
                                      img: img,
                                      details: details,
                                      specs: specs,
                                      category: category,
                                      isDeleted: 0,
                                      createDate: Date.now(),
                                      deleteDate: "",
                                      rating: [],
                                      soldBy: result.username,
                                  }),
                                  db
                                      .getDB()
                                      .collection(product_db)
                                      .insertOne(query, (err, result2) => {
                                          if (err) throw err;
                                          result2.insertedId
                                              ? res.json({
                                                    status: 200,
                                                    success: !0,
                                                    dtstamp: Date.now(),
                                                    msg:
                                                        "New Product Added Successfully!",
                                                    product_id:
                                                        result2.insertedId,
                                                })
                                              : res.json({
                                                    status: 200,
                                                    msg:
                                                        "Something went wrong while adding the product!",
                                                    success: !1,
                                                    dtstamp: Date.now(),
                                                });
                                      }));
                        });
                } else
                    res.json({
                        status: 400,
                        success: !1,
                        dtstamp: Date.now(),
                        msg: "Something's Missing, Bad Request.",
                    });
            else
                res.json({
                    status: 403,
                    success: !1,
                    dtstamp: Date.now(),
                    msg: "You are not authorised to use this API!",
                });
        });
    }),
    admin.post("/ch_product", verifyToken, (req, res) => {
        var token = req.token,
            p_id = req.body.product_id;
        jwt.verify(token, config.get("token.keyToken"), (err, result) => {
            if (err) throw err;
            if (req.body.soldBy)
                res.json({
                    status: 200,
                    success: !1,
                    dtstamp: Date.now(),
                    msg: "Cannot update Soldby from here!",
                });
            else if ("A" == result.type) {
                delete req.body.product_id;
                var query = {
                    _id: db.getOID(p_id),
                    soldBy: result.username,
                    isDeleted: 0,
                };
                db.getDB()
                    .collection(product_db)
                    .updateOne(query, { $set: req.body }, (err, result1) => {
                        if (err) throw err;
                        0 != result1.matchedCount
                            ? res.json({
                                  status: 200,
                                  success: !0,
                                  dtstamp: Date.now(),
                                  msg: "Product Updated Successfully",
                              })
                            : res.json({
                                  status: 200,
                                  msg:
                                      "Were unable to update your product! Try again",
                                  success: !1,
                                  dtstamp: Date.now(),
                              });
                    });
            } else
                res.json({
                    status: 403,
                    success: !1,
                    dtstamp: Date.now(),
                    msg: "You are not authorised to use this API!",
                });
        });
    }),
    admin.post("/rm_product", verifyToken, (req, res) => {
        var token = req.token;
        jwt.verify(token, config.get("token.keyToken"), (err, result) => {
            if (err) throw err;
            if ("A" == result.type) {
                var product_id = req.body.product_id,
                    query = {
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
                            0 != result1.matchedCount
                                ? res.json({
                                      status: 200,
                                      success: !0,
                                      dtstamp: Date.now(),
                                      msg: "Product Deleted Successfully",
                                  })
                                : res.json({
                                      status: 200,
                                      success: !1,
                                      dtstamp: Date.now(),
                                      msg: "Were unable to delete the product",
                                  });
                        }
                    );
            } else
                res.json({
                    status: 403,
                    success: !1,
                    dtstamp: Date.now(),
                    msg: "You are not authorised to use this API!",
                });
        });
    }),
    admin.post("/order", verifyToken, (req, res) => {
        var token = req.token;
        jwt.verify(token, config.get("token.keyToken"), (err, result) => {
            if (err) throw err;
            if ("A" == result.type) {
                var query = { status: { $in: [0, 1] }, isDeleted: 0 };
                db.getDB()
                    .collection(order_db)
                    .find(query, {
                        projection: { uid: 0, username: 0, isDeleted: 0 },
                    })
                    .toArray((err, result1) => {
                        if (err) throw err;
                        res.json({
                            status: 200,
                            success: !0,
                            dtstamp: Date.now(),
                            body: result1,
                        });
                    });
            } else
                res.json({
                    status: 403,
                    success: !1,
                    dtstamp: Date.now(),
                    msg: "You are not authorised to use this API!",
                });
        });
    }),
    admin.post("/pack_deport_order", verifyToken, (req, res) => {
        var token = req.token;
        jwt.verify(token, config.get("token.keyToken"), (err, result) => {
            if (err) throw err;
            if ("A" == result.type) {
                var order_id = req.body.order_id,
                    query = { _id: db.getOID(order_id), isDeleted: 0 };
                db.getDB()
                    .collection(order_db)
                    .updateOne(
                        query,
                        { $set: { status: 2 } },
                        (err, result1) => {
                            if (err) throw err;
                            0 != result1.matchedCount
                                ? res.json({
                                      status: 200,
                                      success: !0,
                                      dtstamp: Date.now(),
                                      msg: "Successfully Packed and Shipped",
                                  })
                                : res.json({
                                      status: 200,
                                      msg:
                                          "Were unable to update order! Try again",
                                      success: !1,
                                      dtstamp: Date.now(),
                                  });
                        }
                    );
            } else
                res.json({
                    status: 403,
                    success: !1,
                    dtstamp: Date.now(),
                    msg: "You are not authorised to use this API!",
                });
        });
    }),
    (module.exports = admin);
