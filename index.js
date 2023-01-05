const mongoose = require("mongoose");
require('dotenv').config()
dburl=process.env.ATLASURL
mongoose.connect(dburl);

const express = require("express");
const app = express();
const nocache = require("nocache");
const flash = require("connect-flash");
const session = require("express-session");
const bodyParser = require("body-parser");
const adminRoute = require("./routes/adminRoute");
const userRoute = require("./routes/userRoute"); 

app.use(
    session({
        secret: "thisismysecretkey",
        saveUninitialized: true,
        resave: false,
    })
);
app.use(nocache());

app.use(express.static("public/"));
app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", "./views");

app.use("/admin", adminRoute);
app.use("/", userRoute);

app.use((req, res) => {
    res.status(404).render("error");
});

app.listen(3000, () => {
    console.log("server running....");
});

module.exports = app;
