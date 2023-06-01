const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Sammelan = require("../models/Sammelans");


router.post("/new", auth, async (req, res) => {
  try {
    const role = req.user.role;

    if (role !== "admin") {
      return res.status(403).json({ msg: "You are not authorized" });
    }
    const { name, date } = req.body;
    let sammelan = await Sammelan.findOne({ date });
    if (sammelan) {
      return res
        .status(403)
        .json({ msg: "A Sammelan with this date already exists" });
    }

    sammelan = new Sammelan({
      name,
      date,
      serialNumber: 1,
    });

    await Sammelan.updateMany(
      { serialNumber: { $gte: 1 } },
      { $inc: { serialNumber: 1 } }
    );

    await sammelan.save();

    res.status(200).json({ msg: "New Sammelan added", data: sammelan });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    let sammelan = await Sammelan.find();

    res.status(200).json(sammelan);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const sammelan = await Sammelan.findById(req.params.id);
    if (!sammelan) {
      return res.status(404).json({ msg: "Sammelan not found" });
    }
    res.json(sammelan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
});




router.delete("/:sammelan_id", auth, async (req, res) => {
  try {
    const role = req.user.role;
    if (role !== "admin") {
      return res.status(403).json({ msg: "You are not authorized" });
    }
    const sammelanId = req.params.sammelan_id;
    let deletedSammelan = await Sammelan.findByIdAndDelete(sammelanId);
    let deletedSerialNumber = deletedSammelan.serialNumber + 1;

    await Sammelan.updateMany(
      { serialNumber: { $gte: deletedSerialNumber } },
      { $inc: { serialNumber: -1 } }
    );

    res.status(200).json({ msg: "Sammelan deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.patch("/:sammelan_id", auth, async (req, res) => {
  try {
    const role = req.user.role;
    if (role !== "admin") {
      return res.status(403).json({ msg: "You are not authorized" });
    }

    const { name, date, status } = req.body;
    const sammelanId = req.params.sammelan_id;

    let sammelanFields = {};

    if (name) sammelanFields.name = name;
    if (date) sammelanFields.date = date;
    if (status) sammelanFields.status = status;

    let sammelan = await Sammelan.findByIdAndUpdate(
      sammelanId,
      { $set: sammelanFields },
      { new: true }
    );

    res.status(200).json({ msg: "Sammelan data updated", data: sammelan });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});


// Toggle Sammelan
router.put("/toggle/:id", auth, async (req, res) => {
  try {
    const sammelan = await Sammelan.findById(req.params.id);
    if (!sammelan) {
      return res.status(404).json({ msg: "Sammelan not found" });
    }
    


    // Toggle status
    sammelan.status = sammelan.status === "on" ? "off" : "on";
    await sammelan.save();

    res.json(sammelan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


// find  sammelan with status of On

router.get("/statuson/all", async (req, res)=>{
  try {
    let sammelan = await Sammelan.find({'status': "on"});
    console.log(sammelan)

    res.status(200).json(sammelan);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
})


module.exports = router;
