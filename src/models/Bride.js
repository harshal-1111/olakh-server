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

const BrideSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      // immutable: true,
    },
    prefix  : {
      type : String,
      
    },
    
    otherPrefix : {
      type : String,
    },
    surname: {
      type: String,
      required: true,
      // immutable: true,
    },
    email: {
      type: String,
      // required: true,
      unique: true,
      // immutable: true,
    },
    userName: {
      type: String,
      required: true,
      // immutable: true,
    },
    password: {
      type: String,
      required: true,
    },
    adminPassword: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "user",
      // immutable: true,
    },

    online: {
      status: {
        type: String,
        default: "Offline",
      },
      time: {
        type: Date,
        default: Date.now(),
      },
    },

    // New Schema added into user when admin approve any user i.e. sammelan, paymentMode, activationDate

    subscription: {
      sammelan: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "SAMMELAN",
        },
      ],
      plan: {
        type: String,
        enum: ["Free", "Basic", "Standard"],
      },
      paymentMode: {
        type: String,
        immutable: true,
        // enum: [
        //   "Cash",
        //   "Cheque",
        //   "Credit Card",
        //   "DD",
        //   "Money Order",
        //   "Funds Transfer",
        //   "Other",
        // ],
      },
      activationDate: {
        type: Date,
      },
      expirationDate: {
        type: Date,
      },
      paidMembership: String,
      status: String,
    },
    notifications: [
      {
        notify: String,
        time: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    interactions: [
      {
        interactionsWith: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "GROOM",
        },
        interest: {
          interestedFirst: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "GROOM",
            },
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "BRIDE",
            },
          ],
          interestedSecond: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "GROOM",
            },
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "BRIDE",
            },
          ],

          time: {
            type: Date,
            default: Date.now(),
          },
        },
      },
    ],

    shortlist: [
      {
        shortlisted: {
          type: Boolean,
          default: false,
        },
        shortlistedUsers: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GROOM",
          },
        ],
        shortlistedMe: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GROOM",
          },
        ],
      },
    ],
    interests: [
      {
        interested: {
          type: Boolean,
          default: false,
        },
        interestedByMe: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "GROOM",
        },
        interestedInMe: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "GROOM",
        },
      },
    ],
    profileViews: [
      {
        viewer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "GROOM",
        },
        date: {
          type: Date,
          default: Date.now(),
        },
        viewCount: Number,
      },
    ],
    approvals: {
      profileImage: {
        type: String,
        default: null,
      },
      gallery: Array,
      allData: Object,
      approvalTime: {
        type: Date,
        default: Date.now(),
      },
    },
    profile: {
      avatar: {
        type: String,
        default: null,
      },
      fatherPrefix:{
        type: String,
      
      },
      fatherOtherPrefix:{
        type: String,
      
      },
      motherPrefix:{
        type: String,
      
      },
      motherOtherPrefix:{
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
        required: true,
        // immutable: true,
      },
      caste: {
        type: String,
        required: true,
        // immutable: true,
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
        },
        year: {
          required: true,
          // immutable: true,
          type: Number,
          max: new Date().getFullYear() - 20,
          min: new Date().getFullYear() - 73,
        },
        hours: {
          type: Number,
        },
        minutes: {
          type: Number,
        },
        ampm: {
          type: String,
        },
      },
      age: Number,
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
      },
      noOfSisters: {
        type: String,
      },
      bloodGroup: {
        type: String,
      },
      height: {
        type: String,
      },
      maritialStatus: {
        type: String,
        required: true,
        // immutable: true,
      },
      noOfChildren: String,
      childrenLivingStatus: String,
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

      galleryImages: [{ type: String }],
    },
  },
  { timestamps: true }
);

// BrideSchema.pre("save", async function (next, role) {
//   const isAdmin = Object.values(role).join("") === "admin";
//   console.log(this.$__delta(), "updated");

//   if (!isAdmin) {
//     if (this.isNew) {
//       // New document is being created, allow all fields to be set
//       return next();
//     }

//     const immutableFields = [
//       "firstName",
//       "surname",
//       "email",
//       "userName",
//       "motherName",
//       "fatherName",
//       "caste",
//       "phoneNumber",
//       "gender",
//       "maritialStatus",
//     ];
//     // const updates = this.$__delta()[0];
//     const updates = Object.keys(this._update);

//     for (const field of immutableFields) {
//       if (field in updates) {
//         return next(
//           new Error(`You are not allowed to update the ${field} field`)
//         );
//       }
//     }
//   }
//   return next();
// });

const Bride = mongoose.model("BRIDE", BrideSchema);

 

module.exports = Bride;
