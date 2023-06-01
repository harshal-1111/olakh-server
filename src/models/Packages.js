const mongoose = require("mongoose");

const PackagesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    fields: {
      type: Array,
      default: [],
      required: true,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BRIDE",
      },
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GROOM",
      },
    ],
  },
  { timestamps: true }
);

const Package = mongoose.model("packages", PackagesSchema);

module.exports = Package;
