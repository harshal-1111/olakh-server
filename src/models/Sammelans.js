const mongoose = require("mongoose");

const SammelanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
    unique: true,
  },
  serialNumber: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    required: true,
    default: "off",
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
});

const Sammelan = mongoose.model("SAMMELAN", SammelanSchema);

module.exports = Sammelan;
