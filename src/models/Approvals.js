const mongoose = require("mongoose");

const ApprovalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "approvals",
    },
    user: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BRIDE",
      },
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GROOM",
      },
    ],
    userProfileImage: String,
    userName: String,
    userGender: String,
    approvalInfo: {
      profileImage: {
        type: String,
      },
      gallery: Array,
      allData: Object,
      approvalTime: {
        type: Date,
        default: Date.now(),
      },
    },
  },
  { timestamps: true }
);

const Approval = mongoose.model("approval", ApprovalSchema);

module.exports = Approval;
