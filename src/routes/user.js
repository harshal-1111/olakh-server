const express = require("express");

const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const handleImageUpload = require("../middleware/profileImageSaver");
const nodeEmailVerify = require("../middleware/eMailer");

const { body, validationResult } = require("express-validator");

const UnderReviewUser = require("../models/UnderReviewUsers");
const Groom = require("../models/Groom");
const Bride = require("../models/Bride");
const CMS = require('../models/CMS');

const Dashboard = require("../models/Dashboard");

const auth = require("../middleware/auth");
const Sammelan = require("../models/Sammelans");

// Register a User
router.post(
  "/register",
  handleImageUpload,
  [
    body("prefix", "Your Name Prefix is required").notEmpty(),
    body("otherPrefix", "Other Prefix is required").notEmpty(),
    body("firstName", "First name is required").notEmpty(),
    body("surname", "Surname is required").notEmpty(),
    body("motherPrefix", "Mother Prefix is required").notEmpty(),
    body("motherOtherPrefix", "Mother Other Prefix is required").notEmpty(),
    body("motherName", "Mother name is required").notEmpty(),
    body("fatherName", "Father name is required").notEmpty(),
    body("fatherPrefix", "Father Prefix is required").notEmpty(),
    body("fatherOtherPrefix", "Father Other Prefix is required").notEmpty(),
    body("email", "Include a valid email").isEmail(),
    body("city", "City is required").notEmpty(),
    body("pincode", "Please provide a pincode").notEmpty(),
    body("dateOfBirth", "Date of birth details are required").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(JSON.parse(req.body.data));
    // console.log(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { avatar } = req.body;
    const {
      firstName,
      prefix,
      otherPrefix,
      surname,
      fatherPrefix,
      fatherOtherPrefix,
      motherPrefix,
      motherOtherPrefix,
      motherName,
      fatherName,
      email,
      city,
      pincode,
      phoneNumber,
      gender,
      caste,
      subCaste,
      permanentAddress,
      otherContactInfo,
      birthPlace,
      noOfBrothers,
      noOfSisters,
      bloodGroup,
      height,
      maritialStatus,
      noOfChildren,
      childrenLivingStatus,
      gotra,
      mangalik,
      rashi,
      naadi,
      charan,
      nakshatra,
      hobby,
      complexion,
      bodyType,
      qualification,
      completeOccupationDetails,
      annualIncomeExample,
      incomeType,
      otherIncomeType,
      otherDisabilities,
    } = JSON.parse(req.body.data);

    const data = JSON.parse(req.body.data);

    let superCaste = subCaste ? caste : "";
    const currentOrganizationexperience = {
      months: data["currentOrganizationexperience.months"],
      years: data["currentOrganizationexperience.years"],
    };
    const dateOfBirth = {
      day: data["dateOfBirth.day"],
      month: data["dateOfBirth.month"],
      year: data["dateOfBirth.year"],
      ampm: data["dateOfBirth.ampm"],
      hours: data["dateOfBirth.hours"],
      minutes: data["dateOfBirth.minutes"],
    };

    console.log(superCaste, subCaste, caste);

    switch (gender) {
      case "Male":
        break;
      case "Female":
        break;
      default:
        return res
          .status(400)
          .json({ msg: "Gender must be specified Male or Female" });
    }
    try {
      let user;
      if (gender === "Male") {
        user = await Groom.find({
          $or: [{ email }, { "profile.phoneNumber": phoneNumber }],
        });
      } else if (gender === "Female") {
        user = await Bride.find({
          $or: [{ email }, { "profile.phoneNumber": phoneNumber }],
        });
      }
      if (user.length > 0) {
        let matchedKeys = [];
        user.forEach((person) => {
          if (person.email === email) {
            matchedKeys.push("email");
          }
          if (person.profile.phoneNumber === phoneNumber) {
            matchedKeys.push("phone");
          }
        });
        if (matchedKeys.includes("email")) {
          return res
            .status(400)
            .json({ msg: "This email is already registered" });
        }
        if (matchedKeys.includes("phone")) {
          return res
            .status(400)
            .json({ msg: "This phone number is already registered" });
        }
      }

      user = await UnderReviewUser.find({
        $or: [{ email }, { "profile.phoneNumber": phoneNumber }],
      });
      if (user.length > 0) {
        let matchedKeys = [];
        user.forEach((person) => {
          if (person.email === email) {
            matchedKeys.push("email");
          }
          if (person.profile.phoneNumber === phoneNumber) {
            matchedKeys.push("phone");
          }
        });
        if (matchedKeys.includes("email")) {
          return res
            .status(400)
            .json({ msg: "This email is already under review" });
        }
        if (matchedKeys.includes("phone")) {
          return res
            .status(400)
            .json({ msg: "This phone number is already under review" });
        }
      }

      // const month =
      //   new Date(
      //     `${dateOfBirth.year}-${dateOfBirth.month}-${dateOfBirth.day}`
      //   ).getMonth() + 1;

      // const age = Math.floor(
      //   (new Date() -
      //     new Date(`${dateOfBirth.year}-${month}-${dateOfBirth.day}`)) /
      //     31557600000
      // );
      let profile = {
        avatar,
        motherName,
        fatherName,
        surname,
        fatherPrefix,
        fatherOtherPrefix,
        motherPrefix,
        motherOtherPrefix,
        city,
        pincode,
        phoneNumber,
        gender,
        caste,
        subCaste,
        superCaste,
        dateOfBirth,
        // age,
        permanentAddress,
        otherContactInfo,
        birthPlace,
        noOfBrothers,
        noOfSisters,
        bloodGroup,
        height,
        maritialStatus,
        noOfChildren,
        childrenLivingStatus,
        gotra,
        mangalik,
        rashi,
        naadi,
        charan,
        nakshatra,
        hobby,
        complexion,
        bodyType,
        qualification,
        completeOccupationDetails,
        annualIncomeExample,
        incomeType,
        otherIncomeType,
        currentOrganizationexperience,
        otherDisabilities,
      };

      user = new UnderReviewUser({
        firstName,
        surname,
        prefix,
        otherPrefix,
        email,
        profile,
      });

      let dashboard = await Dashboard.findOne({ name: "Admin Dashboard" });

      let dashboardFields = {
        ...dashboard.toObject(),
        underReviewUsers: dashboard.underReviewUsers + 1,
      };

      dashboard = await Dashboard.findOneAndUpdate(
        { name: "Admin Dashboard" },
        { $set: dashboardFields },
        { new: true }
      );

      await user.save();
      await dashboard.save();
      return res.status(200).json({
        msg: "Account created successfully",
        data: user,
      });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  }
);

// Update a User
router.patch("/:user_id", auth, async (req, res) => {
  const {
    city,
    pincode,
    permanentAddress,
    otherContactInfo,
    birthPlace,
    noOfBrothers,
    noOfSisters,
    bloodGroup,
    height,
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
    let user,
      gender = req.user.gender,
      user_id = req.params.user_id,
      role = req.user.role;

    if (gender) {
      if (gender === "Male") {
        user = await Groom.findById(user_id);
      } else if (gender === "Female") {
        user = await Bride.findById(user_id);
      }
    }

    if (role === "admin") {
      user = await Groom.findById(user_id);
      gender = "Male";
      if (!user) {
        user = await Bride.findById(user_id);
        gender = "Female";
      }
    }

    if (city) user.profile.city = city;
    if (pincode) user.profile.pincode = pincode;
    if (permanentAddress) user.profile.permanentAddress = permanentAddress;
    if (otherContactInfo) user.profile.otherContactInfo = otherContactInfo;
    if (birthPlace) user.profile.birthPlace = birthPlace;
    if (birthPlace) user.profile.birthPlace = birthPlace;
    if (noOfBrothers) user.profile.noOfBrothers = noOfBrothers;
    if (noOfSisters) user.profile.noOfSisters = noOfSisters;
    if (bloodGroup) user.profile.bloodGroup = bloodGroup;
    if (height) user.profile.height = height;
    if (maritialStatus) user.profile.maritialStatus = maritialStatus;
    if (gotra) user.profile.gotra = gotra;
    if (mangalik) user.profile.mangalik = mangalik;
    if (rashi) user.profile.rashi = rashi;
    if (naadi) user.profile.naadi = naadi;
    if (charan) user.profile.charan = charan;
    if (nakshatra) user.profile.nakshatra = nakshatra;
    if (complexion) user.profile.complexion = complexion;
    if (bodyType) user.profile.bodyType = bodyType;
    if (qualification) user.profile.qualification = qualification;
    if (completeOccupationDetails)
      user.profile.completeOccupationDetails = completeOccupationDetails;
    if (annualIncomeExample)
      user.profile.annualIncomeExample = annualIncomeExample;
    if (incomeType) user.profile.incomeType = incomeType;
    if (currentOrganizationexperience)
      user.profile.currentOrganizationexperience =
        currentOrganizationexperience;
    if (otherDisabilities) user.profile.otherDisabilities = otherDisabilities;

    await user.save();
    res.status(200).send(user);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Update a User By ADMIN
router.patch("/by-admin/:user_id", auth, async (req, res) => {
  try {
    const {
      firstName,
      surname,
      userName,
      password,
      motherName,
      fatherName,
      prefix,
      otherPrefix,
      fatherPrefix,
      fatherOtherPrefix,
      motherPrefix,
      motherOtherPrefix,
      email,
      city,
      pincode,
      phoneNumber,
      gender,
      caste,
      superCaste,
      subCaste,
      // dateOfBirth,
      permanentAddress,
      otherContactInfo,
      birthPlace,
      noOfBrothers,
      noOfSisters,
      bloodGroup,
      height,
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
      otherDisabilities,
      currentOrganizationexperience,
      sammelan,
    } = req.body;

    console.log(noOfSisters);

    // const { sammelan } = req.body.data;
    let user,
      user_id = req.params.user_id,
      role = req.user.role;

    if (role !== "admin") {
      return res.status(403).json({ msg: "You are not authorized" });
    }

    if (gender) {
      if (gender === "Male") {
        user = await Groom.findById(user_id);
        if (user) {
          let newUser = new Bride({
            ...user,
            profile: { ...user.profile, gender },
          });
          await newUser.save();
          await Groom.findByIdAndDelete(req.params.id);

          return res.status(201).send(newUser);
        }
      } else {
        user = await Bride.findById(user_id);
        if (user) {
          let newUser = new Groom({
            ...user,
            profile: { ...user.profile, gender },
          });
          await newUser.save();
          await Bride.findByIdAndDelete(req.params.id);

          return res.status(201).send(newUser);
        }
      }
    } else {
      user = await UnderReviewUser.findById(user_id);
    }

    if (!user) {
      user = await Groom.findById(user_id);
    }
    if (!user) {
      user = await Bride.findById(user_id);
    }

    if (firstName) user.firstName = firstName;
    if (surname) user.surname = surname;
    if (password) {
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);
      user.adminPassword = password;
    }
    if (userName) user.userName = userName;

    if (email) user.email = email;
    if (phoneNumber) user.profile.phoneNumber = phoneNumber;
    if (fatherName) user.profile.fatherName = fatherName;
    if (motherName) user.profile.motherName = motherName;
    if (caste) user.profile.caste = caste;
    if (superCaste) {
      user.profile.superCaste = superCaste;
      let sub = user.profile.caste.split(" ")[1] || "";
      user.profile.caste = superCaste + " " + sub;
    }
    if (subCaste) {
      // console.log("salman sub cast");

      // console.log(subCaste);
      user.profile.subcaste = subCaste;
      let sup = user.profile.caste.split(" ")[0] || "";
      user.profile.caste = sup + " " + subCaste;
    }
    if (city) user.profile.city = city;
    if (pincode) user.profile.pincode = pincode;
    if (permanentAddress) user.profile.permanentAddress = permanentAddress;
    if (otherContactInfo) user.profile.otherContactInfo = otherContactInfo;
    if (birthPlace) user.profile.birthPlace = birthPlace;
    if (noOfBrothers) user.profile.noOfBrothers = noOfBrothers;
    if (noOfSisters) user.profile.noOfSisters = noOfSisters;
    if (bloodGroup) user.profile.bloodGroup = bloodGroup;
    if (height) user.profile.height = height;
    if (maritialStatus) user.profile.maritialStatus = maritialStatus;
    if (gotra) user.profile.gotra = gotra;
    if (mangalik) user.profile.mangalik = mangalik;
    if (rashi) user.profile.rashi = rashi;
    if (naadi) user.profile.naadi = naadi;
    if (charan) user.profile.charan = charan;
    if (nakshatra) user.profile.nakshatra = nakshatra;
    if (complexion) user.profile.complexion = complexion;
    if (bodyType) user.profile.bodyType = bodyType;
    if (qualification) user.profile.qualification = qualification;
    if (completeOccupationDetails)
      user.profile.completeOccupationDetails = completeOccupationDetails;
    if (annualIncomeExample)
      user.profile.annualIncomeExample = annualIncomeExample;
    if (incomeType) user.profile.incomeType = incomeType;
    if (currentOrganizationexperience)
      user.profile.currentOrganizationexperience =
        currentOrganizationexperience;
    if (otherDisabilities) user.profile.otherDisabilities = otherDisabilities;
    if (sammelan?.length > 0) user.subscription.sammelan = sammelan;

    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Update users sammelan By ADMIN
router.patch("/by-admin/sammelan/:user_id", auth, async (req, res) => {
  try {
    const { sammelan } = req.body.data;
    let user,
      user_id = req.params.user_id,
      role = req.user.role;

    if (role !== "admin") {
      return res.status(403).json({ msg: "You are not authorized" });
    }

    user = await Groom.findById(user_id);

    if (!user) {
      user = await Bride.findById(user_id);
    }

    if (sammelan?.length > 0) user.subscription.sammelan = sammelan;

    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

//Today's registered/verified users
router.get("/today-registered", auth, async (req, res) => {
  try {
    // const today = new Date().toISOString().slice(0, 10);
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setUTCHours(23, 59, 59, 999);

    let grooms = await Groom.find({
      createdAt: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
    });
    let brides = await Bride.find({
      createdAt: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
    });

    let users = [...grooms, ...brides].sort(
      (a, b) => b.updatedAt - a.updatedAt
    );

    res.status(200).send(users);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// router.patch("/interaction/:targetId", auth, async (req, res) => {
//   try {
//     const { id, gender } = req.user;

//     const targetId = req.params.targetId;
//     const { interest, shortlist, profileViews } = req.body;
//     let hunterUser, targetUser;

//     if (gender === "Male") {
//       hunterUser = await Groom.findById(id);
//     } else {
//       hunterUser = await Bride.findById(id);
//     }
//     if (!hunterUser) {
//       return res.status(404).json({ msg: "User not found" });
//     }

//     if (gender === "Male") {
//       targetUser = await Bride.findById(targetId);
//     } else {
//       targetUser = await Groom.findById(targetId);
//     }

//     if (!targetUser) {
//       return res.status(404).json({ msg: "User not found" });
//     }
//     // let targetUserInteractionsWithHunterUser = Boolean(
//     //   targetUser.interactions.find((interaction) => interaction.user === hunterUser._id)
//     // );

//     let targetUserInteractionsWithHunterUser = targetUser.interactions.find(
//       (interaction) => interaction.interactionsWith?.equals(hunterUser._id)
//     );
//     let hunterUserInteractionsWithTargetUser = hunterUser.interactions.find(
//       (interaction) => interaction.interactionsWith?.equals(targetUser._id)
//     );

//     // console.log(targetUserInteractionsWithHunterUser);
//     if (!hunterUserInteractionsWithTargetUser) {
//       if (interest) {
//         hunterUser.interactions.unshift({
//           interactionsWith: targetUser._id,
//           interest: {
//             interestedFirst: hunterUser._id,
//           },
//         });
//         hunterUser.notifications?.push({
//           notify: `You are interested in ${targetUser.firstName} ${targetUser.surname}`,
//         });
//         targetUser.interactions.unshift({
//           interactionsWith: hunterUser._id,
//           interest: {
//             interestedFirst: hunterUser._id,
//           },
//         });
//         targetUser.notifications?.push({
//           notify: `${hunterUser.firstName} ${hunterUser.surname} is interested in you`,
//         });
//       }

//       ///kjkjhkjhkjhkjhkhkjhkjhkjhkjhkj
//       if (shortlist) {
//         hunterUser.interactions.unshift({
//           interactionsWith: targetUser._id,
//           shortlisted: true,
//         });
//         targetUser.notifications?.push({
//           notify: `You have been shortlisted by ${hunterUser.firstName} ${hunterUser.surname}`,
//         });
//         hunterUser.notifications?.push({
//           notify: `You have shortlisted ${targetUser.firstName} ${targetUser.surname}`,
//         });
//       }
//     } else {
//       if (interest) {
//         if (
//           hunterUserInteractionsWithTargetUser.interest.interestedFirst[0]?.equals(
//             hunterUser._id
//           )
//         ) {
//           return res.status(400).json({
//             msg: `You are already interested in ${targetUser.firstName} ${targetUser.surname}`,
//           });
//         } else if (
//           hunterUserInteractionsWithTargetUser.interest.interestedSecond[0]?.equals(
//             hunterUser._id
//           )
//         ) {
//           return res.status(400).json({
//             msg: `You are already interested in ${targetUser.firstName} ${targetUser.surname}`,
//           });
//         } else {
//           hunterUser.interactions = hunterUser.interactions.map(
//             (interactions) => {
//               if (interactions.interactionsWith.equals(targetUser._id)) {
//                 if (
//                   interactions.interest.interestedFirst[0]?.equals(
//                     targetUser._id
//                   )
//                 ) {
//                   return {
//                     ...interactions,
//                     interest: { interestedSecond: hunterUser._id },
//                   };
//                 } else {
//                   return {
//                     ...interactions,
//                     interest: { interestedFirst: hunterUser._id },
//                   };
//                 }
//               }
//               return interactions;
//             }
//           );
//           targetUser.interactions = targetUser.interactions.map(
//             (interactions) => {
//               if (interactions.interactionsWith.equals(hunterUser._id)) {
//                 if (
//                   interactions.interest.interestedFirst[0]?.equals(
//                     targetUser._id
//                   )
//                 ) {
//                   return {
//                     ...interactions,
//                     interest: { interestedSecond: hunterUser._id },
//                   };
//                 } else {
//                   return {
//                     ...interactions,
//                     interest: { interestedFirst: hunterUser._id },
//                   };
//                 }
//               }
//               return interactions;
//             }
//           );
//           hunterUser.notifications?.push({
//             notify: `You are interested in ${targetUser.firstName} ${targetUser.surname}`,
//           });
//           targetUser.notifications?.push({
//             notify: `${hunterUser.firstName} ${hunterUser.surname} is interested in you`,
//           });
//         }
//       }
//       if (interest === false) {
//         if (
//           targetUserInteractionsWithHunterUser.interest.interestedFirst[0]?.equals(
//             hunterUser._id
//           )
//         ) {
//           hunterUser.interactions = hunterUser.interactions.map(
//             (interactions) => {
//               if (interactions.interactionsWith.equals(targetUser._id)) {
//                 if (
//                   interactions.interest.interestedFirst[0]?.equals(
//                     hunterUser._id
//                   )
//                 ) {
//                   return {
//                     ...interactions,
//                     interest: { interestedFirst: [] },
//                   };
//                 } else {
//                   return {
//                     ...interactions,
//                     interest: { interestedSecond: [] },
//                   };
//                 }
//               }
//               return interactions;
//             }
//           );
//           targetUser.interactions = targetUser.interactions.map(
//             (interactions) => {
//               if (interactions.interactionsWith.equals(hunterUser._id)) {
//                 if (
//                   interactions.interest.interestedFirst[0]?.equals(
//                     hunterUser._id
//                   )
//                 ) {
//                   return {
//                     ...interactions,
//                     interest: { interestedFirst: [] },
//                   };
//                 } else {
//                   return {
//                     ...interactions,
//                     interest: { interestedSecond: [] },
//                   };
//                 }
//               }
//               return interactions;
//             }
//           );
//           hunterUser.notifications?.push({
//             notify: `You have been disconnected from ${targetUser.firstName} ${targetUser.surname}`,
//           });
//         } else if (
//           targetUserInteractionsWithHunterUser.interest.interestedSecond[0]?.equals(
//             hunterUser._id
//           )
//         ) {
//           hunterUser.interactions = hunterUser.interactions.map(
//             (interactions) => {
//               if (interactions.interactionsWith.equals(targetUser._id)) {
//                 return {
//                   ...interactions,
//                   interest: { interestedSecond: null },
//                 };
//               }
//               return interactions;
//             }
//           );
//           targetUser.interactions = targetUser.interactions.map(
//             (interactions) => {
//               if (interactions.interactionsWith.equals(hunterUser._id)) {
//                 return {
//                   ...interactions,
//                   interest: { interestedSecond: null },
//                 };
//               }
//               return interactions;
//             }
//           );
//           hunterUser.notifications?.push({
//             notify: `${targetUser.firstName} ${targetUser.surname} is not in your interests now`,
//           });
//         } else {
//           return res.status(400).json({
//             msg: `You do not have interest with ${targetUser.firstName} ${targetUser.surname}`,
//           });
//         }
//       }
//       if (shortlist) {
//         if (hunterUserInteractionsWithTargetUser.shortlisted === true) {
//           return res.status(400).json({
//             msg: `You have already shortlisted ${targetUser.firstName} ${targetUser.surname}`,
//           });
//         } else {
//           hunterUser.interactions = hunterUser.interactions.map(
//             (interactions) => {
//               if (interactions.interactionsWith.equals(targetUser._id)) {
//                 return { ...interactions, shortlisted: true };
//               }
//               return interactions;
//             }
//           );
//           targetUser.notifications?.push({
//             notify: `You have been shortlisted by ${hunterUser.firstName} ${hunterUser.surname}`,
//           });
//           hunterUser.notifications?.push({
//             notify: `You have shortlisted ${targetUser.firstName} ${targetUser.surname}`,
//           });
//         }
//       }
//       if (shortlist === false) {
//         if (hunterUserInteractionsWithTargetUser.shortlisted === true) {
//           hunterUser.interactions = hunterUser.interactions.map(
//             (interactions) => {
//               if (interactions.interactionsWith.equals(targetUser._id)) {
//                 return { ...interactions, shortlisted: false };
//               }
//               return interactions;
//             }
//           );

//           hunterUser.notifications?.push({
//             notify: `You have removed ${targetUser.firstName} ${targetUser.surname} from shortlists`,
//           });
//         } else {
//           return res.status(400).json({
//             msg: `You have not shortlisted ${targetUser.firstName} ${targetUser.surname}`,
//           });
//         }
//       }
//     }

//     if (profileViews) {
//       let hunterOldProfileView = Boolean(
//         targetUser.profileViews.find((view) =>
//           view.viewer.equals(hunterUser._id)
//         )
//       );
//       if (!hunterOldProfileView) {
//         targetUser.profileViews.unshift({
//           viewer: hunterUser._id,
//           viewCount: 1,
//         });
//       } else {
//         const currentDate = new Date().toISOString().slice(0, 10);
//         const profileViewsDate = targetUser.profileViews.date
//           .toISOString()
//           .slice(0, 10);

//         if (profileViewsDate === currentDate) {
//           if (targetUser.profileViews.viewCount < 1) {
//             targetUser.profileViews.viewCount += 1;
//             targetUser.notifications?.push({
//               notify: `${hunterUser.firstName} ${hunterUser.surname} viewed your profile`,
//             });
//           }
//         }
//       }
//     }
//     await hunterUser.save();
//     await targetUser.save();
//     res.status(200).json({ hunterUser, targetUser });
//   } catch (error) {
//     res.status(500).json({ msg: error.message });
//   }
// });

router.patch("/approval/:targetId", auth, async (req, res) => {
  try {
    const { id, gender } = req.user;

    const targetId = req.params.targetId;
    const { targetGender, status } = req.body;
    let user, targetUser;

    if (gender === "Male") {
      user = await Groom.findById(id);
    } else {
      user = await Bride.findById(id);
    }
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (targetGender === "Male") {
      targetUser = await Groom.findById(targetId);
    } else {
      targetUser = await Bride.findById(targetId);
    }

    if (!targetUser) {
      return res.status(404).json({ msg: "Target user not found" });
    }

    const connection = targetUser.interactions.connections.find(
      (conn) => String(conn.connector) === String(user._id)
    );
    console.log(connection);

    if (!connection) {
      return res.status(404).json({ msg: "Connection not found" });
    }

    connection.status = status;
    await targetUser.save();
    res.status(200).json({ msg: "Connection status updated successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.get("/login", async (req, res) => {
  if (
    !req.headers.authorization ||
    req.headers.authorization.indexOf("Basic ") === -1
  ) {
    return res.status(401).json({ message: "Missing Authorization Header" });
  }

  // Login with auth credentials
  const base64Credentials = req.headers.authorization.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii"
  );
  const [userName, password] = credentials.split(":");

  try {
    let user = await Groom.findOne({ userName });

    if (!user) user = await Bride.findOne({ userName });

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
        gender: user.profile.gender,
      },
    };

    user.online.status = "Online";
    await user.save();

    jwt.sign(
      payload,
      process.env.SERVER_JWT_SECRET,

      { expiresIn: 60 * 60 * 24 },
      (err, token) => {
        if (err) throw err;

        res.json({ token, user });
      }
    );
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

//User Logout
router.delete("/logout", auth, async (req, res) => {
  try {
    const id = req.user.id;
    const gender = req.user.gender;

    let user;

    if (gender === "Male") {
      user = await Groom.findById(id);
    } else {
      user = await Bride.findById(id);
    }

    user.online.status = "Offline";
    await user.save();

    res.status(200).json({ msg: "User logged out" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

//Verify user with ID
router.put("/verify/:user_id", auth, async (req, res) => {
  try {
    const visitorRole = req.user.role;
    if (visitorRole !== "admin") {
      return res.status(401).json({ msg: "You are not authorized" });
    }

    const userId = req.params.user_id;
    const {
      userName,
      password,
      sammelan,
      paymentMode,
      activationDate,
      paidMembership,
    } = req.body;

    let user = await UnderReviewUser.findById(userId);

    // let sam = Sammelan.findById(sammelan);

    if (!user) return res.status(400).json({ msg: "User not found" });

    user = {
      ...user.toObject(),
      subscription: {
        sammelan,
        paymentMode,
        activationDate,
        paidMembership,
      },
      userName,
      password,
      adminPassword: password,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    let verifiedUser;
    if (user.profile.gender === "Male") {
      verifiedUser = new Groom(user);
    } else if (user.profile.gender === "Female") {
      verifiedUser = new Bride(user);
    }

    sammelan.users = verifiedUser._id;

    const salt = await bcrypt.genSalt(10);

    verifiedUser.password = await bcrypt.hash(password, salt);
    let dashboard = await Dashboard.findOne({ name: "Admin Dashboard" });

    let dashboardFields = {
      ...dashboard.toObject(),
      totalUsers: dashboard.totalUsers + 1,
      totalMale:
        user.profile.gender === "Male"
          ? dashboard.totalMale + 1
          : dashboard.totalMale,
      totalFemale:
        user.profile.gender === "Female"
          ? dashboard.totalFemale + 1
          : dashboard.totalFemale,
      underReviewUsers: dashboard.underReviewUsers - 1,
    };
    dashboard = await Dashboard.findOneAndUpdate(
      { name: "Admin Dashboard" },
      { $set: dashboardFields },
      { new: true }
    );

    await dashboard.save();
    await verifiedUser.save();

    await UnderReviewUser.findByIdAndDelete(userId);

    nodeEmailVerify(
      verifiedUser.firstName + " " + verifiedUser.surname,
      verifiedUser.email,
      userName,
      password
    );
    return res.status(200).json({
      msg: "User verified successfully",
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

//User Search with age and caste range
router.post("/search", async (req, res) => {
  try {
    let order = req.body.order || -1;
    let gender = req.body.gender;
    let filters = req.body.filters;

    let user;
    if (gender === "Male") {
      user = await Groom.find(filters)
        .select("-password")
        .sort({ updatedAt: order });
    } else if (gender === "Female") {
      user = await Bride.find(filters)
        .select("-password")
        .sort({ updatedAt: order });
    }
    return res.status(200).json({ msg: "response success", data: user });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.get("/online-users", auth, async (req, res) => {
  try {
    let brides = await Bride.find({ "online.status": "Online" });
    let grooms = await Groom.find({ "online.status": "Online" });
    let users = [...brides, ...grooms].sort(
      (a, b) => b.online.time - a.online.time
    );



    res.status(200).send(users);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});


//salman working 2
router.get('/api/gotra', async (req, res) => {
  try {
    const cmsPictures = await CMS.findOne(); // Assuming there's only one document in the  
    const gotraValues = cmsPictures.gotra;
    res.json(gotraValues);
  } catch (error) {
    console.log('Error fetching "gotra" values:', error);
    res.status(500).json({ error: 'Error fetching "gotra" values' });
  }
});



router.get("/me", auth, async (req, res) => {
  try {
    const { id, gender } = req.user;

    let user;
    if (gender === "Male") {
      user = await Groom.findById(id);
    } else {
      user = await Bride.findById(id);
    }

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.get("/under-review", auth, async (req, res) => {
  try {
    let users = await UnderReviewUser.find().sort("createdAt");

    res.status(200).send(users);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

//Delete a user by Id
router.delete(
  "/delete-user/:id/:gender/:underReview",
  auth,
  async (req, res) => {
    try {
      const { role } = req.user;
      const { id, gender, underReview } = req.params;
      console.log(req.params);
      if (role !== "admin") {
        return res.status(400).json({ msg: "You are not authorized" });
      }

      if (underReview === "yes") {
        await UnderReviewUser.findByIdAndDelete(id);
      } else if (gender === "Male") {
        await Groom.findByIdAndDelete(id);
      } else if (gender === "Female") {
        await Bride.findByIdAndDelete(id);
      }

      res.status(200).json({ msg: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  }
);

router.post("/user-in-profile", auth, async (req, res) => {
  try {
    const { role, id } = req.user;
    const { _id, gender, underReview } = req.body;

    if (role !== "admin" || (role === "user" && id !== _id)) {
      return res.status(404).json({ msg: "You are not authorized" });
    }
    let user;
    if (underReview) {
      user = await UnderReviewUser.findById(_id);
    } else if (gender === "Male") {
      user = await Groom.findById(_id);
    } else {
      user = await Bride.findById(_id);
    }
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.get("/all-users", auth, async (req, res) => {
  try {
    let brides = await Bride.find().select("-password -adminPassword");
    let grooms = await Groom.find().select("-password -adminPassword");

    let users = [...brides, ...grooms].sort(
      (a, b) => b.updatedAt - a.updatedAt
    );
    res.status(200).send(users);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

//By admin all users with password
router.get("/by-admin/all-users", auth, async (req, res) => {
  try {
    let brides = await Bride.find();
    let grooms = await Groom.find();

    let users = [...brides, ...grooms].sort(
      (a, b) => b.updatedAt - a.updatedAt
    );

    res.status(200).send(users);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.get("/sammelanusers/:id", async (req, res) => {
  const sammelanId = req.params.id;
  try {
    // Get the sammelan status from the sammelan model
    const sammelan = await Sammelan.findById(sammelanId);
    const status = sammelan.status;

    // Check if sammelan status is 'on'
    if (status === "on") {
      // Find all brides with subscription to the given sammelan
      const brides = await Bride.find({ "subscription.sammelan": sammelanId });

      // Find all grooms with subscription to the given sammelan
      const grooms = await Groom.find({ "subscription.sammelan": sammelanId });

      // Combine the results and send the response
      const users = brides
        .concat(grooms)
        .sort((a, b) => b.updatedAt - a.updatedAt);
      res.status(200).json({ users });
    } else {
      res.status(200).json({ users: [] }); // Return empty array if sammelan status is off
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/single-user-profile/:id", auth, async (req, res) => {
  try {
    const { gender } = req.user;
    const { id } = req.params;

    let user;
    if (gender === "Male") {
      user = await Bride.findById(id);
    } else {
      user = await Groom.findById(id);
    }

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// get all users for home page and get total users counts 

router.get("/all-users-home", async (req, res) => {
  try {
    let brides = await Bride.find();
    let grooms = await Groom.find();

    let users = [...brides, ...grooms].sort((a, b) => b.updatedAt - a.updatedAt
    );

    let totalUsers = users.length;

    res.status(200).send({ users, totalUsers }); // Updated response format
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});




module.exports = router;
