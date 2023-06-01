// require("dotenv").config();
const express = require("express");

const bodyParser = require("body-parser");
const path = require("path");
const app = express();

const connectDB = require("./src/config/db");
const cors = require("cors");
const nodemailer = require('nodemailer');


app.use(cors());

connectDB();

// app.use(express.json({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// ROUTE PATHS FOR API
app.use(
  "/profile-image",
  express.static(path.join(__dirname, "profile-image"))
);
app.use(
  "/profile-approval",
  express.static(path.join(__dirname, "profile-approval"))
);
app.use("/cmspictures", express.static(path.join(__dirname, "cmspictures")));

app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/user", require("./src/routes/user"));
app.use("/api/admin", require("./src/routes/admin"));
app.use("/api/sammelan", require("./src/routes/sammelans"));
app.use("/api/package", require("./src/routes/packages"));
app.use("/api/cms", require("./src/routes/cms"));
app.use("/api/approval", require("./src/routes/approval"));
app.use("/api/interactions", require("./src/routes/interactions"))

const PORT = process.env.SERVER_PORT;

app.listen(PORT, () => console.log("App Running on ", PORT));
