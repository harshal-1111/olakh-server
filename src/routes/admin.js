const express = require("express");

const router = express.Router();

const bcrypt = require("bcryptjs");

const Admin = require("../models/Admin");
const Dashboard = require("../models/Dashboard");
const CMS = require("../models/CMS");

const auth = require("../middleware/auth");

const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');


// New Admin Account
router.post("/admin-register", async (req, res) => {
  try {
    let admin = new Admin(req.body);
    let dashboard = new Dashboard();
    let cms = new CMS();

    const salt = await bcrypt.genSalt(10);

    admin.password = await bcrypt.hash(req.body.password, salt);

    await admin.save();

    await dashboard.save();

    await cms.save();

    return res.status(200).json({
      msg: "Admin account created successfully",
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Get admin token
router.get("/auth-token", async (req, res) => {
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
  const [email, password] = credentials.split(":");

  try {
    let user = await Admin.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.SERVER_JWT_SECRET,

      { expiresIn: 60 * 60 * 24 },
      (err, token) => {
        if (err) throw err;

        // tk.token = token;

        res.json({ token, data: user });
      }
    );
    // await tk.save();
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.get("/all-staff", auth, async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== "admin") {
      return res.status(400).json({ msg: "You are not authorized" });
    }

    let staff = await Admin.find().select("-password -deletable");

    res.status(200).send(staff);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.post("/new-staff", auth, async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== "admin") {
      return res.status(400).json({ msg: "You are not authorized" });
    }

    const { name, email, password } = req.body;

    let staff = await Admin.findOne({ email });

    if (staff) {
      return res.status(400).json({ msg: "This email is already registered" });
    }

    staff = new Admin({
      name,
      email,
      password,
      deletable: true,
    });

    const salt = await bcrypt.genSalt(10);

    staff.password = await bcrypt.hash(password, salt);

    await staff.save();

    res.status(200).json({ msg: "New staff account created" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.delete("/:staffId", auth, async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== "admin") {
      return res.status(400).json({ msg: "You are not authorized" });
    }

    const staffId = req.params.staffId;

    let staff = await Admin.findById(staffId);

    if (!staff) {
      return res.status(404).json({ msg: "Staff not found" });
    }

    if (staff.deletable === false) {
      return res.status(400).json({ msg: "You are not authorized" });
    }

    await Admin.findByIdAndDelete(staffId);

    res.status(200).json({ msg: "Staff account deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// contact form api
router.post('/contact-us', async (req, res) => {
  const { name, email, subject, message } = req.body;
  let testAccount = await nodemailer.createTestAccount();
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    let info = await transporter.sendMail({
      from: email,
      to: "gourangh2@gmail.com",
      subject: `New message from ${name} via your website`,
      text: `
        Name: ${name}
        Email: ${email}
        Subject: ${subject}
        Message: ${message}
      `,
    });
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    res.status(200).send('Email sent successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error sending email.');
  }
});




module.exports = router;
