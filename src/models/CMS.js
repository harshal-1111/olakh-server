const mongoose = require("mongoose");

const { casteData, gotraData } = require("../data/UserData");

const CMSPictures = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "cmspics",
    },
    link: {
      type: Array,
    },
    caste: {
      type: Array,
      default: casteData,
    },
    gotra: {
      type: Array,
      default: gotraData,
    },
  },
  { timestamps: true }
);

const CMS = mongoose.model("cmspictures", CMSPictures);

module.exports = CMS;
