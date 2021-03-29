const db = require("./db");
const config = require("config");

// Getting configs.
const user_db = config.get("db.name.user");

// Token verifier.
function verifyToken(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== "undefined") {
        // Getting the token.
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        db.getDB()
            .collection(user_db)
            .findOne({ token: req.token, isDeleted: 0 }, (err, a_result) => {
                if (err) throw err;
                if (a_result == null) {
                    res.json({
                        status: 401,
                        success: false,
                        msg: "Please Login to continue![Unauthorised Token]",
                        dtstamp: Date.now(),
                    });
                } else {
                    next();
                }
            });
    } else {
        res.json({
            status: 401,
            success: false,
            msg: "Please Login to Continue!",
            dtstamp: Date.now(),
        });
    }
}

module.exports = { verifyToken };
