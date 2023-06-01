const router = require("express").Router();

const auth = require("../middleware/auth");

const handleGalleryUpload = require("../middleware/galleryImagesUploader");

const Approval = require("../models/Approvals");

const fs = require("fs");

const util = require("util");
const readdir = util.promisify(fs.readdir);
const rename = util.promisify(fs.rename);
const path = require("path");
const Bride = require("../models/Bride");
const Groom = require("../models/Groom");

const handleImageUpload = require("../middleware/profileImageApproval");
const handleImageUpdate = require("../middleware/profileImageApproveAndSave");

router.get("/all-image-approvals", auth, async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== "admin") {
      return res.status(403).json({ msg: "You are not authorized" });
    }

    let approvals = await Approval.find({ name: "profileImage" });

    res.status(200).send(approvals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/all-approvals", auth, async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== "admin") {
      return res.status(403).json({ msg: "You are not authorized" });
    }

    let approvals = await Approval.find();

    res.status(200).send(approvals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post(
  "/by-user/profile-image",
  auth,
  handleImageUpload,
  async (req, res) => {
    try {
      const { gender } = JSON.parse(req.body.data);
      const { avatar } = req.body;
      const { id } = req.user;

      let approval = await Approval.findOne({ user: id });
      // if(approval) {
      //   return res.status(404).json({msg:'You have already a request pending'})
      // }
      let user;

      if (gender === "Male") {
        user = await Groom.findById(id);
      } else {
        user = await Bride.findById(id);
      }

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      if (avatar) {
        user.approvals.profileImage = avatar;
      }

      if (approval) {
        approval.approvalInfo.profileImage = avatar;
      } else {
        approval = new Approval({
          user: id,
          name: "profileImage",
          userName: user.firstName + " " + user.surname,
          userGender: user.profile.gender,
          approvalInfo: {
            profileImage: avatar,
          },
        });
      }

      await user.save();
      await approval.save();
      res.status(201).json({ msg: "Profile image approval request received" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);
router.post(
  "/by-admin/profile-image",
  auth,
  handleImageUpdate,
  async (req, res) => {
    try {
      const { _id, gender, avatar } = req.body;

      let user;

      if (gender === "Male") {
        user = await Groom.findById(_id);
      } else {
        user = await Bride.findById(_id);
      }

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      if (avatar) {
        user.profile.avatar = avatar;
      }
      await Approval.findOneAndDelete({ user: _id });

      await user.save();
      //   await approval.save();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get("/update-approval/:id", auth, async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== "admin") {
      return res.status(400).json({ msg: "You are not authorized" });
    }

    const id = req.params.id;
    let approval = await Approval.findById(id);

    if (!approval) {
      return res.status(404).json({ msg: "This approval is not found" });
    }

    let user;

    if (approval.userGender === "Male") {
      user = await Groom.findById(approval.user);
    } else {
      user = await Bride.findById(approval.user);
    }

    let oldAvatar = approval.approvalInfo.profileImage;

    const profileApprovalPath = path.join(__dirname, "../../profile-approval");
    const profileImagePath = path.join(__dirname, "../../profile-image");
    const imageName = path.basename(oldAvatar);

    const imageLinkRegex = new RegExp(imageName, "i");

    // Find image in profile-approval folder
    const files = await readdir(profileApprovalPath);
    const matchingFile = files.find((file) => imageLinkRegex.test(file));
    if (!matchingFile) {
      return res.status(404).json({ msg: "This image is not available" });
    }

    // Move image to profile-image folder
    const oldPath = path.join(profileApprovalPath, matchingFile);
    const newPath = path.join(profileImagePath, matchingFile);

    await rename(oldPath, newPath);

    // Set newAvatar variable to new path
    const newAvatar = newPath;
    user.profile.avatar = `/profile-image/${path.basename(newAvatar)}`;
    user.approvals.profileImage = null;

    await user.save();

    await Approval.findByIdAndDelete(id);

    res.status(201).json({ msg: "Image approved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/delete-approval/:id", auth, async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== "admin") {
      return res.status(400).json({ msg: "You are not authorized" });
    }

    const id = req.params.id;
    let approval = await Approval.findById(id);

    if (!approval) {
      return res.status(404).json({ msg: "This approval is not found" });
    }

    let user;

    if (approval.userGender === "Male") {
      user = await Groom.findById(approval.user);
    } else {
      user = await Bride.findById(approval.user);
    }

    const approvalImagePath = approval.approvalInfo.profileImage;

    if (approvalImagePath) {
      const existingImagePath = path.join(
        __dirname,
        "../..",
        approvalImagePath.replace(".jpeg", path.extname(approvalImagePath))
      );
      try {
        await fs.promises.access(existingImagePath, fs.promises.constants.F_OK);
        // If the file exists, delete it
        await fs.promises.unlink(existingImagePath);
      } catch (error) {
        // If the file doesn't exist, do nothing
      }
    }

    user.approvals.profileImage = null;

    await user.save();

    await Approval.findByIdAndDelete(id);

    res.status(201).json({ msg: "Profile request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/by-user/profile-data", auth, async (req, res) => {
  try {
    const { id, gender } = req.user;
    const data = req.body;

    console.log(req.body, "approvals");

    let user;
    if (gender === "Male") {
      user = await Groom.findById(id);
    } else {
      user = await Bride.findById(id);
    }

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    let approval = await Approval.findOne({ user: user._id });

    if (approval) {
      approval.approvalInfo.allData = {
        ...approval.approvalInfo.allData,
        ...data,
      };
    } else {
      approval = new Approval({
        userProfileImage: user.profile.avatar,
        approvalInfo: {
          allData: data,
        },
        user: user._id,
        userName: `${user.firstName} ${user.surname}`,
        userGender: user.profile.gender,
      });
    }

    user.approvals.allData = data;

    await user.save();
    await approval.save();

    res.status(200).json({ msg: "Approval request created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/by-admin/approve-data/:id", auth, async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== "admin") {
      return res.status(400).json({ msg: "You are not authorized" });
    }

    const id = req.params.id;
    let approval = await Approval.findById(id);

    if (!approval) {
      return res.status(404).json({ msg: "This approval is not found" });
    }

    let user;

    if (approval.userGender === "Male") {
      user = await Groom.findById(approval.user);
    } else {
      user = await Bride.findById(approval.user);
    }

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const {
      firstName,
      surname,
      userName,
      // password,
      motherName,
      fatherName,
      email,
      city,
      pincode,
      phoneNumber,
      // gender,
      caste,
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
    } = approval.approvalInfo.allData;

    if (firstName) user.firstName = firstName;
    if (surname) user.surname = surname;

    if (userName) user.userName = userName;

    if (email) user.email = email;
    if (phoneNumber) user.profile.phoneNumber = phoneNumber;
    if (fatherName) user.profile.fatherName = fatherName;
    if (motherName) user.profile.motherName = motherName;
    if (caste) user.profile.caste = caste;
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

    user.approvals.allData = null;

    await user.save();

    await Approval.findByIdAndDelete(id);
    res.status(200).json({ msg: "Data approved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get approval list
router.get("/all-user/profile-data", auth, async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== "admin") {
      return res.status(401).json({ msg: "You are not authorized" });
    }

    const approvals = await Approval.find();

    if (approvals.length === 0) {
      return res.status(404).json({ msg: "No approval requests found" });
    }

    const allData = approvals.map((approval) => approval.allData);

    res.status(200).json({ data: allData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get under review list
router.get("/all-user/under-review", auth, async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== "admin") {
      return res.status(401).json({ msg: "You are not authorized" });
    }

    const approvals = await Approval.find();

    if (approvals.length === 0) {
      return res.status(404).json({ msg: "No approval requests found" });
    }

    const allData = approvals.map((approval) => approval.allData);

    let totalApprovals = allData.length;
    res.status(200).json({totalApprovals, data: allData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// gallery images api
router.post(
  "/by-user/gallery-images",
  auth,
  handleGalleryUpload,
  async (req, res) => {
    try {
      console.log(req.body);

      const { id, gender } = req.user;
      let user;
      if (gender === "Male") {
        user = await Groom.findById(id);
      } else {
        user = await Bride.findById(id);
      }

      let approval = await Approval.findOne({ user: id });

      if (approval) {
        approval.approvalInfo.gallery = req.body.gallery;
      } else {
        approval = new Approval({
          approvalInfo: {
            gallery: req.body.gallery,
          },
          userName: `${user.firstName} ${user.surname}`,
          user: user._id,
          userProfileImage: user.profile.avatar,
          userGender: user.profile.gender,
        });
      }

      user.approvals.gallery = req.body.gallery;

      res.status(200).json({ approval, user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
