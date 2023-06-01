const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Package = require("../models/Packages");

router.get("/all-packages", async (req, res) => {
  try {
    let packs = await Package.find();

    res.status(200).send(packs);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.post("/new-package", auth, async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== "admin") {
      return res.status(403).json({ msg: "You are not authorized" });
    }
    const { name, fields } = req.body;

    let pack = await Package.findOne({ name });

    if (pack) {
      return res.status(404).json({ msg: "This package name already exists" });
    }

    if (fields.length <= 0) {
      return res.status(400).json({ msg: "No fields found for this package" });
    }
    let packageFields = [];
    fields.forEach((fd) => (packageFields = [...packageFields, fd.value]));

    pack = new Package({ name, fields: packageFields });

    await pack.save();
    res.status(200).json({ msg: `${name} package added` });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const { role } = req.user;

    if (role !== "admin") {
      return res.status(400).json({ msg: "You are not authorized" });
    }

    await Package.findByIdAndDelete(id);

    res.status(200).json({ msg: "Package deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

module.exports = router;
