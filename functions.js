const db = require("./db"),
    config = require("config"),
    user_db = config.get("db.name.user");
function verifyToken(req, res, next) {
    const bearerHeader = req.headers.authorization;
    if (void 0 !== bearerHeader) {
        const bearer = bearerHeader.split(" "),
            bearerToken = bearer[1];
        (req.token = bearerToken),
            db
                .getDB()
                .collection(user_db)
                .findOne(
                    { token: req.token, isDeleted: 0 },
                    (err, a_result) => {
                        if (err) throw err;
                        null == a_result
                            ? res.json({
                                  status: 401,
                                  success: !1,
                                  msg:
                                      "Please Login to continue![Unauthorised Token]",
                                  dtstamp: Date.now(),
                              })
                            : next();
                    }
                );
    } else
        res.json({
            status: 401,
            success: !1,
            msg: "Please Login to Continue!",
            dtstamp: Date.now(),
        });
}
module.exports = { verifyToken: verifyToken };
