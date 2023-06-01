const express = require("express");

const router = express.Router();

const bcrypt = require("bcryptjs");

const { check, validationResult } = require("express-validator");

const UnderReviewUser = require("../models/UnderReviewUsers");
const Bride = require("../models/Bride");

const auth = require("../middleware/auth");

// Register a User
router.post(
  "/register",
  [
    check("firstName", "First name is required").not().isEmpty(),
    check("surname", "Surname is required").not().isEmpty(),
    check("motherName", "Mother name is required").not().isEmpty(),
    check("fatherName", "Father name is required").not().isEmpty(),
    check("email", "Include a valid email").isEmail(),
    check("city", "City is required").not().isEmpty(),
    check("pincode", "Please provide a pincode").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName,
      surname,
      motherName,
      fatherName,
      email,
      city,
      pincode,
      phoneNumber,
      gender,
      caste,
      dateOfBirth,
      permanentAddress,
      otherContactInfo,
      birthPlace,
      noOfBrothers,
      noOfSisters,
      bloodGroup,
      Height,
      maritialStatus,
      gotra,
      mangalik,
      rashi,
      naadi,
      charan,
      nakshatra,
      complexion,
      bodyType,
      qualification,
      completeOccupationDetails,
      annualIncomeExample,
      incomeType,
      currentOrganizationexperience,
      otherDisabilities,
    } = req.body;

    try {
      let user = await Bride.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ msg: "This email is already registered" });
      }

      user = await UnderReviewUser.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ msg: "This email is already under review" });
      }

      let profile = {
        motherName,
        fatherName,
        city,
        pincode,
        phoneNumber,
        gender,
        caste,
        dateOfBirth,
        permanentAddress,
        otherContactInfo,
        birthPlace,
        noOfBrothers,
        noOfSisters,
        bloodGroup,
        Height,
        maritialStatus,
        gotra,
        mangalik,
        rashi,
        naadi,
        charan,
        nakshatra,
        complexion,
        bodyType,
        qualification,
        completeOccupationDetails,
        annualIncomeExample,
        incomeType,
        currentOrganizationexperience,
        otherDisabilities,
      };

      user = new UnderReviewUser({
        firstName,
        surname,
        email,
        profile,
      });

      await user.save();

      return res.status(200).json({
        msg: "Account created successfully",
      });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  }
);

router.put("/verify/:user_id", auth, async (req, res) => {
  try {
    const visitorRole = req.user.role;
    if (visitorRole !== "admin") {
      return res.status(401).json({ msg: "You are not authorized" });
    }

    const userId = req.params.user_id;

    let user = await UnderReviewUser.findById(userId);

    if (!user) return res.status(400).json({ msg: "User not found" });

    const password = req.body.password;

    user = { ...user._doc, password };
    let verifiedUser = new Bride(user);

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt);

    await verifiedUser.save();

    await UnderReviewUser.findByIdAndDelete(userId);

    return res.status(200).json({
      msg: "User verified successfully",
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

module.exports = router;
