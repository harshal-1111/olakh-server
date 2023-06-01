const mongoose = require("mongoose");

const DashboardSchema = new mongoose.Schema({
  name: { type: String, default: "Admin Dashboard" },
  totalUsers: {
    type: Number,
    default: 0,
  },
  totalMale: {
    type: Number,
    default: 0,
  },
  totalFemale: {
    type: Number,
    default: 0,
  },
  activeUsers: {
    type: Number,
    default: 0,
  },
  emailUnverifiedUsers: {
    type: Number,
    default: 0,
  },
  mobileUnverifiedUsers: {
    type: Number,
    default: 0,
  },

  underReviewUsers: {
    type: Number,
    default: 0,
  },

  pendingPayments: {
    amount: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
  },
  rejectedPayments: {
    amount: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
  },
  chargedPayments: {
    amount: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
  },
  purchasedPackages: {
    basic: {
      amount: { type: Number, default: 0 },
      date: {
        type: Date,
        default: Date.now,
      },
    },
    standard: {
      amount: { type: Number, default: 0 },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  },
});

const Dashboard = mongoose.model("DASHBOARD", DashboardSchema);

module.exports = Dashboard;
