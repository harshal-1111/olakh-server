const mongoose = require("mongoose");

const {
  gotraData,
  casteData,
  heightData,
  maritalStatusData,
  manglikData,
  rashiData,
  naadiData,
  charanData,
  nakshatraData,
  complexionData,
  bodyTypeData,
  
} = require("../data/UserData");

const UserProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    motherName: {
      type: String,
      required: true,
      immutable: true,
    },
    fatherName: {
      type: String,
      required: true,
      immutable: true,
    },

    city: {
      type: String,
      default: null,
      immutable: true,
    },
    pincode: Number,
    avatar: {
      type: String,
    },

    phoneNumber: {
      type: String,
      default: null,
      required: true,
      unique: true,
      immutable: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
      immutable: true,
    },
    caste: {
      type: String,
      required: true,
      immutable: true,
      enum: casteData,
    },
    dateOfBirth: {
      day: {
        immutable: true,
        type: Number,
        min: 1,
        max: 31,
      },
      month: {
        immutable: true,
        type: String,
        enum: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "October",
          "November",
          "December",
        ],
      },
      year: {
        immutable: true,
        type: Number,
        min: new Date().getFullYear() - 20,
        max: new Date().getFullYear() - 73,
      },
    },
    permanentAddress: {
      type: String,
    },
    otherContactInfo: {
      type: String,
    },
    birthPlace: {
      type: String,
    },
    noOfBrothers: {
      type: String,
      enum: ["1", "2", "3", "4", "5", "5+"],
    },
    noOfSisters: {
      type: String,
      enum: ["1", "2", "3", "4", "5", "5+"],
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Don't Know"],
    },
    height: {
      type: String,
      enum: heightData,
    },
    maritialStatus: {
      type: String,
      required: true,
      immutable: true,
      enum: maritalStatusData,
    },
    gotra: { type: String, enum: gotraData },
    mangalik: { type: String, enum: manglikData },
    rashi: { type: String, enum: rashiData },
    naadi: { type: String, enum: naadiData },
    charan: { type: String, enum: charanData },
    nakshatra: { type: String, enum: nakshatraData },
    complexion: { type: String, enum: complexionData },
    bodyType: { type: String, enum: bodyTypeData },
    qualification: String,
    completeOccupationDetails: String,
    annualIncomeExample: Number,
    incomeType: { type: String, enum: ["Dollar", "VRO"] },
    currentOrganizationexperience: {
      years: {
        type: Number,
        min: 0,
        max: 50,
      },
      months: {
        type: Number,
        min: 0,
        max: 12,
      },
    },
    otherDisabilities: String,
  },
  { timestamps: true }
);

const UserProfile = mongoose.model("userProfile", UserProfileSchema);

module.exports = UserProfile;
