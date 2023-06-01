const express = require("express");

const router = express.Router();

// const auth = require("../middleware/auth");

const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");

const Admin = require("../models/Admin");

const Groom = require("../models/Groom");
const Bride = require("../models/Bride");

router.get(
  "/jwt/token",

  async (req, res) => {
    if (
      !req.headers.authorization ||
      req.headers.authorization.indexOf("Basic ") === -1
    ) {
      return res.status(401).json({ message: "Missing Authorization Header" });
    }

    // verify auth credentials
    const base64Credentials = req.headers.authorization.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "ascii"
    );
    const [userName, password] = credentials.split(":");

    console.log(userName);
    try {
      let user = await Groom.findOne({ userName });
      if (!user) user = await Bride.findOne({ userName });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ message: "Invalid credentials" }] });
      }

      // const permissions = await Permissions.findOne({ name: user.primary_role.name })

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
      }

      const payload = {
        user: {
          id: user._id,
          role: user.role,
        },
      };

      jwt.sign(
        payload,
        process.env.SERVER_JWT_SECRET_USER_KEY,
        {
          expiresIn: "86400000",
        },
        (err, token) => {
          if (err) throw err;

          // tk.token = token;

          res.json({ token });
        }
      );
      // await tk.save();
    } catch (error) {
      // console.log(err.message);
      res.status(500).json({ message: error.message });
    }
  }
);

router.get("/current-user", auth, async (req, res) => {
  try {
    let role = req.user.role;
    let gender = req.user.gender;
    let userId = req.user.id;
    let user;
    if (role === "admin") {
      user = await Admin.findById(userId);
    }
    if (role === "user") {
      if (gender === "Male") {
        user = await Groom.findById(userId);
      } else if (gender === "Female") {
        user = await Bride.findById(userId);
      }
    }

    if (!user) {
      return res.status(404).json({ msg: "Cannot get the user" });
    }

    res.status(200).json({ data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
