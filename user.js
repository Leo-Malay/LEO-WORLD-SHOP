const express = require("express"),
    jwt = require("jsonwebtoken"),
    config = require("config"),
    path = require("path"),
    db = require("./db"),
    { verifyToken: verifyToken } = require("./functions"),
    user = express.Router(),
    cart_db = config.get("db.name.cart"),
    order_db = config.get("db.name.order"),
    product_db = config.get("db.name.product"),
    system_db = config.get("db.name.system");
user.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/u/home.html"));
}),
    user.get("/home", (req, res) => {
        res.sendFile(path.join(__dirname + "/public/u/home.html"));
    }),
    user.get("/product", (req, res) => {
        res.sendFile(path.join(__dirname + "/public/u/product.html"));
    }),
    user.get("/cart", (req, res) => {
        res.sendFile(path.join(__dirname + "/public/u/cart.html"));
    }),
    user.get("/billing", (req, res) => {
        res.sendFile(path.join(__dirname + "/public/u/billing.html"));
    }),
    user.get("/order_confirm", (req, res) => {
        res.sendFile(path.join(__dirname + "/public/u/order_confirm.html"));
    }),
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
                        success: !0,
                        dtstamp: Date.now(),
                        body: result1.cart,
                    });
                });
        });
    }),
    user.post("/add_cart", verifyToken, (req, res) => {
        var product_id = req.body.product_id,
            product_qty = req.body.product_qty,
            token = req.token;
        product_id || product_qty
            ? jwt.verify(token, config.get("token.keyToken"), (err, result) => {
                  var query = {
                      uid: db.getOID(result.uid),
                      username: result.username,
                      isDeleted: 0,
                  };
                  db.getDB()
                      .collection(product_db)
                      .findOne(
                          { _id: db.getOID(product_id), isDeleted: 0 },
                          (err, result0) => {
                              if (err) throw err;
                              result0
                                  ? db
                                        .getDB()
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
                                                result1
                                                    ? res.json({
                                                          status: 200,
                                                          success: !1,
                                                          dtstamp: Date.now(),
                                                          msg:
                                                              "product already in cart!",
                                                      })
                                                    : db
                                                          .getDB()
                                                          .collection(cart_db)
                                                          .updateOne(
                                                              query,
                                                              {
                                                                  $addToSet: {
                                                                      cart: {
                                                                          product_id: product_id,
                                                                          product_qty: product_qty,
                                                                      },
                                                                  },
                                                              },
                                                              (
                                                                  err,
                                                                  result2
                                                              ) => {
                                                                  if (err)
                                                                      throw err;
                                                                  0 !=
                                                                  result2.matchedCount
                                                                      ? res.json(
                                                                            {
                                                                                status: 200,
                                                                                success: !0,
                                                                                dtstamp: Date.now(),
                                                                                msg:
                                                                                    "Added to cart Successfully",
                                                                            }
                                                                        )
                                                                      : res.json(
                                                                            {
                                                                                status: 200,
                                                                                success: !1,
                                                                                dtstamp: Date.now(),
                                                                                msg:
                                                                                    "Were unable to add to cart! Try again",
                                                                            }
                                                                        );
                                                              }
                                                          );
                                            }
                                        )
                                  : res.json({
                                        status: 200,
                                        success: !1,
                                        dtstamp: Date.now(),
                                        msg: "Such product doesn't exist!",
                                    });
                          }
                      );
              })
            : res.json({
                  status: 400,
                  success: !1,
                  dtstamp: Date.now(),
                  msg: "Something's Missing, Bad Request.",
              });
    }),
    user.post("/rm_cart", verifyToken, (req, res) => {
        var token = req.token,
            product_id = req.body.product_id;
        product_id
            ? jwt.verify(token, config.get("token.keyToken"), (err, result) => {
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
                          { $pull: { cart: { product_id: product_id } } },
                          { multi: !1 },
                          (err, result1) => {
                              if (err) throw err;
                              0 != result1.matchedCount &&
                              0 != result1.modifiedCount
                                  ? res.json({
                                        status: 200,
                                        success: !0,
                                        dtstamp: Date.now(),
                                        msg: "Removed from cart Successfully",
                                    })
                                  : res.json({
                                        status: 200,
                                        success: !1,
                                        dtstamp: Date.now(),
                                        msg:
                                            "Were unable to remove from cart! Try again",
                                    });
                          }
                      );
              })
            : res.json({
                  status: 400,
                  success: !1,
                  dtstamp: Date.now(),
                  msg: "Something's Missing, Bad Request.",
              });
    }),
    user.post("/ch_cart", verifyToken, (req, res) => {
        var token = req.token,
            product_id = req.body.product_id,
            product_qty = req.body.product_qty;
        product_id || product_qty
            ? jwt.verify(token, config.get("token.keyToken"), (err, result) => {
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
                                  "cart.$": {
                                      product_id: product_id,
                                      product_qty: product_qty,
                                  },
                              },
                          },
                          (err, result1) => {
                              if (err) throw err;
                              0 != result1.matchedCount &&
                              0 != result1.modifiedCount
                                  ? res.json({
                                        status: 200,
                                        success: !0,
                                        dtstamp: Date.now(),
                                        msg: "Cart Updated Successfully",
                                    })
                                  : res.json({
                                        status: 200,
                                        success: !1,
                                        dtstamp: Date.now(),
                                        msg:
                                            "Were unable to update the cart! Try again",
                                    });
                          }
                      );
              })
            : res.json({
                  status: 400,
                  success: !0,
                  dtstamp: Date.now(),
                  msg: "Something's Missing, Bad Request.",
              });
    }),
    user.post("/pay_cart", verifyToken, (req, res) => {
        var token = req.token,
            pay_amount = req.body.pay_amount;
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
                    { $set: { pay_amount: pay_amount } },
                    (err, result1) => {
                        if (err) throw err;
                        0 != result1.modifiedCount
                            ? res.json({
                                  status: 200,
                                  success: !0,
                                  dtstamp: Date.now(),
                                  msg: "Amount updated successfully",
                              })
                            : res.json({
                                  status: 200,
                                  success: !1,
                                  dtstamp: Date.now(),
                                  msg: "Unable to update amount",
                              });
                    }
                );
        });
    }),
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
                            {
                                projection: {
                                    service_tax: 1,
                                    delivery_chrg: 1,
                                },
                            },
                            (err, result1) => {
                                if (err) throw err;
                                res.json({
                                    status: 200,
                                    success: !0,
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
    }),
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
                        success: !0,
                        dtstamp: Date.now(),
                        body: result1,
                    });
                });
        });
    }),
    user.post("/place_order", verifyToken, (req, res) => {
        var token = req.token,
            pay_type = req.body.pay_type,
            pay_amount = req.body.pay_amount,
            name = req.body.name,
            msg = req.body.msg,
            address = req.body.address,
            mobile_no = req.body.mobile_no;
        pay_type && name && msg && address && mobile_no && pay_amount
            ? jwt.verify(token, config.get("token.keyToken"), (err, result) => {
                  var query = {
                      uid: db.getOID(result.uid),
                      username: result.username,
                      isDeleted: 0,
                  };
                  db.getDB()
                      .collection(cart_db)
                      .findOne(
                          query,
                          { projection: { cart: 1 } },
                          (err, result1) => {
                              if (err) throw err;
                              0 != result1.matchedCount
                                  ? ((query1 = {
                                        uid: db.getOID(result.uid),
                                        username: result.username,
                                        cart: result1.cart,
                                        pay_type: pay_type,
                                        pay_amount: pay_amount,
                                        pay_id: "",
                                        details: {
                                            name: name,
                                            msg: msg,
                                            address: address,
                                            mobile_no: mobile_no,
                                        },
                                        isDeleted: 0,
                                        status: 0,
                                    }),
                                    db
                                        .getDB()
                                        .collection(order_db)
                                        .insertOne(query1, (err, result2) => {
                                            if (err) throw err;
                                            db.getDB()
                                                .collection(cart_db)
                                                .updateOne(
                                                    query,
                                                    {
                                                        $set: {
                                                            cart: [],
                                                            pay_amount: 0,
                                                        },
                                                    },
                                                    (err, result3) => {
                                                        if (err) throw err;
                                                        0 !=
                                                        result3.modifiedCount
                                                            ? res.json({
                                                                  status: 200,
                                                                  success: !0,
                                                                  dtstamp: Date.now(),
                                                                  msg:
                                                                      "Order placed Successfully",
                                                                  order_id: db.getID(
                                                                      result2.insertedID
                                                                  ),
                                                              })
                                                            : res.json({
                                                                  status: 200,
                                                                  success: !1,
                                                                  dtstamp: Date.now(),
                                                                  msg:
                                                                      "Something went wrong! Try again later or check orders!",
                                                                  order_id: "",
                                                              });
                                                    }
                                                );
                                        }))
                                  : res.json({
                                        status: 200,
                                        success: !1,
                                        dtstamp: Date.now(),
                                        msg:
                                            "Unable to place order as user doesn't exist.",
                                    });
                          }
                      );
              })
            : res.json({
                  status: 400,
                  success: !1,
                  dtstamp: Date.now(),
                  msg: "Some missing fields!",
              });
    }),
    user.post("/cancel_order", verifyToken, (req, res) => {
        var token = req.token,
            order_id = req.body.order_id;
        order_id
            ? jwt.verify(token, config.get("token.keyToken"), (err, result) => {
                  if (err) throw err;
                  var query = {
                      _id: db.getOID(order_id),
                      uid: db.getOID(result.uid),
                      username: result.username,
                      isDeleted: 0,
                  };
                  db.getDB()
                      .collection(order_db)
                      .updateOne(
                          query,
                          { $set: { status: -1 } },
                          (err, result1) => {
                              if (err) throw err;
                              0 != result1.matchedCount
                                  ? res.json({
                                        status: 200,
                                        success: !0,
                                        dtstamp: Date.now(),
                                        msg: "Order cancelled Successfully",
                                    })
                                  : res.json({
                                        status: 200,
                                        success: !1,
                                        dtstamp: Date.now(),
                                        msg:
                                            "Unable to cancel your order as user doesn't exist.",
                                    });
                          }
                      );
              })
            : res.json({
                  status: 200,
                  success: !1,
                  dtstamp: Date.now(),
                  msg: "No Order to cancel",
              });
    }),
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
                        success: !0,
                        dtstamp: Date.now(),
                        body: result,
                    });
                }
            );
    }),
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
                            success: !0,
                            dtstamp: Date.now(),
                            category: "Popular Products",
                            body: result1,
                        });
                    });
            });
    }),
    user.post("/category", (req, res) => {
        db.getDB()
            .collection(system_db)
            .findOne({}, { projection: { category: 1 } }, (err, result) => {
                if (err) throw err;
                res.json({
                    status: 200,
                    success: !0,
                    dtstamp: Date.now(),
                    body: result.category,
                });
            });
    }),
    user.post("/get_category", (req, res) => {
        var category = req.body.category.toUpperCase();
        db.getDB()
            .collection(system_db)
            .findOne({}, { projection: { category: 1 } }, (err, result) => {
                if (err) throw err;
                result.category.includes(category)
                    ? db
                          .getDB()
                          .collection(product_db)
                          .find(
                              { category: category, isDeleted: 0 },
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
                                  success: !0,
                                  dtstamp: Date.now(),
                                  category: category,
                                  body: result1,
                              });
                          })
                    : res.json({
                          status: 200,
                          success: !1,
                          dtstamp: Date.now(),
                          body: [],
                          msg: "No such category found!",
                      });
            });
    }),
    (module.exports = user);
