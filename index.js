const express = require("express");
const config = require("config");
const db = require("./db");
const admin = require("./admin");
const user = require("./user");
const auth = require("./auth");
const helmet = require("helmet");
const compression = require("compression");

// Getting config variables.
const port = config.get("app.port");

// Init app.
const app = express();

// Setting path.
app.use(express.static("public"));
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(express.json());
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            "default-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        },
    })
);
app.use(compression());

// Defining paths.
app.use("/su", admin);
app.use("/u", user);
app.use("/a", auth);
app.use("/p", express.static("public"));

// Starting the server.
db.connect((err) => {
    if (err) throw err;
    app.listen(port, "0.0.0.0", () => {
        console.log("[+] Server Started on PORT:", port);
    });
});
