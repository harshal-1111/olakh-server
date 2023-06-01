const mongoose = require("mongoose");

// const {
//   gotraData,
//   casteData,
//   heightData,
//   maritalStatusData,
//   manglikData,
//   rashiData,
//   naadiData,
//   charanData,
//   nakshatraData,
//   complexionData,
//   bodyTypeData,
// } = require("../data/UserData");

const UnderReview = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    prefix: {
      type: String,
    },

    otherPrefix: {
      type: String,
    },
    surname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      default: "user",
    },
    profile: {
      avatar: {
        type: String,
        default: null,
      },
      fatherPrefix: {
        type: String,

      },
      fatherOtherPrefix: {
        type: String,

      },
      motherPrefix: {
        type: String,

      },
      motherOtherPrefix: {
        type: String,
      },
      motherName: {
        type: String,
        required: true,
        // immutable: true,
      },
      fatherName: {
        type: String,
        required: true,
        // immutable: true,
      },

      city: {
        type: String,
        default: null,
        // immutable: true,
      },
      pincode: Number,
      phoneNumber: {
        type: String,
        default: null,
        required: true,
        unique: true,
        // immutable: true,
      },
      gender: {
        type: String,
        enum: ["Male", "Female"],
        required: true,
        // immutable: true,
      },
      caste: {
        type: String,
        required: true,
        immutable: true,
        // enum: casteData,
      },
      subCaste: {
        type: String,
        // required: true,
        // immutable: true,
      },
      // superCaste: String,
      // subCaste: String,

      dateOfBirth: {
        day: {
          required: true,
          // immutable: true,
          type: Number,
          min: 1,
          max: 31,
        },
        month: {
          required: true,
          // immutable: true,
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
            "September",
            "October",
            "November",
            "December",
          ],
        },
        year: {
          required: true,
          // immutable: true,
          type: Number,
          max: new Date().getFullYear() - 20,
          min: new Date().getFullYear() - 73,
        },
      },
      age: { type: String },
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
        // enum: ["1", "2", "3", "4", "5", "5+"],
      },
      noOfSisters: {
        type: String,
        // enum: ["1", "2", "3", "4", "5", "5+"],
      },
      bloodGroup: {
        type: String,
        // enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Don't Know"],
      },
      height: {
        type: String,
        // enum: heightData,
      },
      maritialStatus: {
        type: String,
        required: true,
        immutable: true,
        // enum: maritalStatusData,
      },
      gotra: { type: String },
      mangalik: { type: String },
      rashi: { type: String },
      naadi: { type: String },
      charan: { type: String },
      nakshatra: { type: String },
      hobby: {
        type: String,
      },
      complexion: { type: String },
      bodyType: { type: String },
      qualification: String,
      completeOccupationDetails: String,
      annualIncomeExample: Number,
      incomeType: { type: String },
      otherIncomeType : {type : String,},
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
  },
  { timestamps: true }
);

const UnderReviewUser = mongoose.model("underReviewUser", UnderReview);

module.exports = UnderReviewUser;
