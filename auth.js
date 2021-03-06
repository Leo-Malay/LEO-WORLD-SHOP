const express = require("express"),
    bcrypt = require("bcrypt"),
    jwt = require("jsonwebtoken"),
    config = require("config"),
    path = require("path"),
    db = require("./db"),
    { verifyToken: verifyToken } = require("./functions"),
    auth = express.Router(),
    user_db = config.get("db.name.user"),
    cart_db = config.get("db.name.cart");
auth.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/a/login.html"));
}),
    auth.get("/new_account", (req, res) => {
        res.sendFile(path.join(__dirname + "/public/a/new_account.html"));
    }),
    auth.get("/account", (req, res) => {
        res.sendFile(path.join(__dirname + "/public/a/account.html"));
    }),
    auth.get("/forbidden", (req, res) => {
        res.sendFile(path.join(__dirname + "/public/a/forbidden.html"));
    }),
    auth.post("/login", (req, res) => {
        var username = req.body.username,
            password = req.body.password;
        if (username || password) {
            var query = { username: username, isDeleted: 0 };
            db.getDB()
                .collection(user_db)
                .findOne(query, (err, result) => {
                    if (err) throw err;
                    result
                        ? bcrypt.compare(
                              password,
                              result.password,
                              function (err, result1) {
                                  if (err) throw err;
                                  if (1 == result1) {
                                      query = {
                                          username: username,
                                          uid: String(db.getID(result._id)),
                                          type: result.type,
                                          isDeleted: 0,
                                      };
                                      const token = jwt.sign(
                                          query,
                                          config.get("token.keyToken"),
                                          { expiresIn: 86400 }
                                      );
                                      db.getDB()
                                          .collection(user_db)
                                          .updateOne(
                                              {
                                                  _id: db.getOID(
                                                      String(result._id)
                                                  ),
                                                  username: username,
                                                  type: result.type,
                                                  isDeleted: 0,
                                              },
                                              { $set: { token: token } },
                                              (err, result2) => {
                                                  if (err) throw err;
                                                  0 != result2.matchedCount
                                                      ? res.json({
                                                            status: 200,
                                                            msg:
                                                                "Login Successfull",
                                                            token: token,
                                                            success: !0,
                                                            dtstamp: Date.now(),
                                                        })
                                                      : res.json({
                                                            status: 200,
                                                            msg:
                                                                "Were unable to login! Try again",
                                                            token: "",
                                                            success: !1,
                                                            dtstamp: Date.now(),
                                                        });
                                              }
                                          );
                                  } else
                                      res.json({
                                          status: 200,
                                          msg: "Invalid Password",
                                          token: "",
                                          success: !1,
                                          dtstamp: Date.now(),
                                      });
                              }
                          )
                        : res.json({
                              status: 200,
                              msg: "No such user found!",
                              token: "",
                              success: !1,
                              dtstamp: Date.now(),
                          });
                });
        } else
            res.json({
                status: 400,
                success: !1,
                dtstamp: Date.now(),
                msg: "Something's Missing, Bad Request.",
            });
    }),
    auth.post("/logout", verifyToken, (req, res) => {
        var token = req.token;
        jwt.verify(token, config.get("token.keyToken"), (err, result) => {
            if (err) throw err;
            var query = {
                _id: db.getOID(result.uid),
                username: result.username,
                type: result.type,
                token: token,
                isDeleted: 0,
            };
            db.getDB()
                .collection(user_db)
                .updateOne(query, { $set: { token: "" } }, (err, result1) => {
                    if (err) throw err;
                    0 != result1.matchedCount
                        ? res.json({
                              status: 200,
                              msg: "Logged out Successfully",
                              success: !0,
                              dtstamp: Date.now(),
                          })
                        : res.json({
                              status: 200,
                              msg: "Were unable to logout! Try again",
                              success: !1,
                              dtstamp: Date.now(),
                          });
                });
        });
    }),
    auth.post("/new_account", (req, res) => {
        var name = req.body.name,
            username = req.body.username,
            password = req.body.password,
            mobile_no = req.body.mobile_no,
            email = req.body.email,
            city = req.body.city.toUpperCase(),
            state = req.body.state.toUpperCase(),
            country = req.body.country.toUpperCase();
        if (
            name ||
            username ||
            password ||
            mobile_no ||
            email ||
            city ||
            state ||
            country
        ) {
            var query = {
                username: username,
                "personal.email": email,
                isDeleted: 0,
            };
            db.getDB()
                .collection(user_db)
                .findOne(query, (err, result) => {
                    if (err) throw err;
                    result
                        ? res.json({
                              status: 200,
                              success: !1,
                              dtstamp: Date.now(),
                              msg:
                                  "Username or Email Already Exists! Try Again!",
                          })
                        : bcrypt.genSalt(10, function (err, salt) {
                              if (err) throw err;
                              bcrypt.hash(
                                  password,
                                  salt,
                                  function (err, password) {
                                      if (err) throw err;
                                      (query = {
                                          name: name,
                                          username: username,
                                          password: password,
                                          token: "",
                                          type: "U",
                                          address: {
                                              city: city,
                                              state: state,
                                              country: country,
                                          },
                                          personal: {
                                              email: email,
                                              mobile_no: mobile_no,
                                          },
                                          isDeleted: 0,
                                          createDate: String(Date.now()),
                                          deleteDate: "",
                                      }),
                                          db
                                              .getDB()
                                              .collection(user_db)
                                              .insertOne(
                                                  query,
                                                  (err, result) => {
                                                      if (err) throw err;
                                                      (query = {
                                                          uid:
                                                              result.insertedId,
                                                          username: username,
                                                          cart: [],
                                                          isDeleted: 0,
                                                      }),
                                                          db
                                                              .getDB()
                                                              .collection(
                                                                  cart_db
                                                              )
                                                              .insertOne(
                                                                  query,
                                                                  (
                                                                      err,
                                                                      result1
                                                                  ) => {
                                                                      if (err)
                                                                          throw err;
                                                                      result1.insertedId
                                                                          ? res.json(
                                                                                {
                                                                                    status: 200,
                                                                                    success: !0,
                                                                                    dtstamp: Date.now(),
                                                                                    msg:
                                                                                        "New Account Created Successfully!",
                                                                                }
                                                                            )
                                                                          : res.json(
                                                                                {
                                                                                    status: 200,
                                                                                    msg:
                                                                                        "Something went wrong while creating an account!",
                                                                                    success: !1,
                                                                                    dtstamp: Date.now(),
                                                                                }
                                                                            );
                                                                  }
                                                              );
                                                  }
                                              );
                                  }
                              );
                          });
                });
        } else
            res.json({
                status: 400,
                success: !1,
                dtstamp: Date.now(),
                msg: "Something's Missing, Bad Request.",
            });
    }),
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
                            success: !0,
                            dtstamp: Date.now(),
                            body: result1,
                        });
                    }
                );
        });
    }),
    auth.post("/ch_account", verifyToken, (req, res) => {
        var token = req.token;
        jwt.verify(token, config.get("token.keyToken"), (err, result) => {
            if (err) throw err;
            if (req.body.password || req.body.username)
                res.json({
                    status: 200,
                    success: !1,
                    dtstamp: Date.now(),
                    msg:
                        "Cannot update Password or Username or Cart from here!",
                });
            else {
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
                        0 != result1.matchedCount
                            ? res.json({
                                  status: 200,
                                  success: !0,
                                  dtstamp: Date.now(),
                                  msg: "Account Updated Successfully",
                              })
                            : res.json({
                                  status: 200,
                                  msg:
                                      "Were unable to update your account! Try again",
                                  success: !1,
                                  dtstamp: Date.now(),
                              });
                    });
            }
        });
    }),
    auth.post("/rm_account", verifyToken, (req, res) => {
        var token = req.token;
        jwt.verify(token, config.get("token.keyToken"), (err, result) => {
            if (err) throw err;
            var password = req.body.password;
            if (password) {
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
                        result1
                            ? bcrypt.compare(
                                  password,
                                  result1.password,
                                  function (err, result2) {
                                      if (err) throw err;
                                      1 == result2
                                          ? db
                                                .getDB()
                                                .collection(user_db)
                                                .updateOne(
                                                    {
                                                        _id: db.getOID(
                                                            result.uid
                                                        ),
                                                        username:
                                                            result.username,
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
                                                        0 !=
                                                        result2.matchedCount
                                                            ? db
                                                                  .getDB()
                                                                  .collection(
                                                                      cart_db
                                                                  )
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
                                                                      (
                                                                          err,
                                                                          result3
                                                                      ) => {
                                                                          if (
                                                                              err
                                                                          )
                                                                              throw err;
                                                                          0 !=
                                                                          result3.matchedCount
                                                                              ? res.json(
                                                                                    {
                                                                                        status: 200,
                                                                                        success: !0,
                                                                                        dtstamp: Date.now(),
                                                                                        msg:
                                                                                            "Account Deleted Successfully",
                                                                                    }
                                                                                )
                                                                              : res.json(
                                                                                    {
                                                                                        status: 200,
                                                                                        success: !1,
                                                                                        dtstamp: Date.now(),
                                                                                        msg:
                                                                                            "Were unable to delete the account",
                                                                                    }
                                                                                );
                                                                      }
                                                                  )
                                                            : res.json({
                                                                  status: 200,
                                                                  success: !1,
                                                                  dtstamp: Date.now(),
                                                                  msg:
                                                                      "Were unable to delete the account",
                                                              });
                                                    }
                                                )
                                          : res.json({
                                                status: 200,
                                                success: !1,
                                                dtstamp: Date.now(),
                                                msg: "Invalid Password",
                                            });
                                  }
                              )
                            : res.json({
                                  status: 200,
                                  success: !1,
                                  dtstamp: Date.now(),
                                  msg: "No such user found!",
                              });
                    });
            } else
                res.json({
                    status: 400,
                    msg: "Something's Missing, Bad Request.",
                });
        });
    }),
    (module.exports = auth);
