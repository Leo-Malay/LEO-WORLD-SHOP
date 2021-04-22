const express = require("express"),
    config = require("config"),
    db = require("./db"),
    path = require("path"),
    admin = require("./admin"),
    user = require("./user"),
    auth = require("./auth"),
    helmet = require("helmet"),
    compression = require("compression"),
    app = express(),
    init = express.Router();
init.get("/favicon", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/IMG/favicon.ico"));
}),
    init.get("/", (req, res) => {
        res.redirect("/u/home");
    }),
    app.use(express.static("public")),
    app.use(express.urlencoded({ extended: !0 })),
    app.use(express.json()),
    app.use(
        helmet.contentSecurityPolicy({
            directives: {
                "default-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                "img-src": ["'self'", "data:", "https:"],
            },
        })
    ),
    app.use(compression()),
    app.use("/su", admin),
    app.use("/u", user),
    app.use("/a", auth),
    app.use("/", init),
    app.use("/p", express.static("public"));
const port = process.env.PORT || 2905;
db.connect((err) => {
    if (err) throw err;
    app.listen(port, () => {
        console.log("[+] Server Started on PORT:", port);
    });
});
