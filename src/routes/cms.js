const express = require("express");
const Jimp = require("jimp");
const CMS = require("../models/CMS");
const auth = require("../middleware/auth");
const router = express.Router();

// const path = require("path");

const fs = require("fs");

const upload = require("../middleware/cmsSaver");

async function resizeImage(filePath) {
  const image = await Jimp.read(filePath);
  await image.resize(800, Jimp.AUTO);
  await image.writeAsync(filePath);
}

router.post("/pics/new", auth, upload.array("images"), async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== "admin") {
      return res.status(400).json({ msg: "You are not authorized" });
    }
    let cmsLinks = [];
    const files = req.files;
    for (let i = 0; i < files.length; i++) {
      const filePath = files[i].path.replace(/\\/g, "/");
      await resizeImage(filePath);
      // console.log(filePath);
      cmsLinks.push(`${filePath}`);
    }
    let cms = await CMS.findOne({ name: "cmspics" });
    if (!cms) {
      cms = new CMS({
        link: cmsLinks,
      });
    } else {
      cmsLinks.forEach((links) => cms.link.push(links));
    }

    await cms.save();
    res.status(200).send(cms.link);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.get("/pics/get-all", async (req, res) => {
  try {
    let cms = await CMS.find().select("-name");

    res.status(200).send(cms);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.delete("/pics/:link", auth, async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== "admin") {
      return res.status(400).json({ msg: "You are not authorized" });
    }
    const link = req.params.link;
    // const link = path.basename(linkId);
    const filePath = `./cmspictures/${link}`;
    fs.unlinkSync(filePath);
    const cms = await CMS.findOne({ name: "cmspics" });
    const index = cms.link.indexOf(`cmspictures/${link}`);
    if (index >= 0) {
      cms.link.splice(index, 1);
      await cms.save();
    }
    res.status(200).send(cms.link);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// ==================Caste===============

router.post("/caste/new-caste", auth, async (req, res) => {
  try {
    const { role } = req.user;
    const { data, update } = req.body;
    if (role !== "admin") {
      return res.status(403).json({ msg: "You are not Authorized" });
    }

    let caste = await CMS.findOne({ name: "cmspics" });
    if (caste) {
      if (update) {
        caste.caste.forEach((cst, index) => {
          data.forEach((dt) => {
            if (dt.old === cst) {
              caste.caste[index] = dt.new;
            }
          });
        });
      } else {
        data.forEach((dt) => caste.caste.push(dt));
      }
    }
    await caste.save();
    return res.status(201).send(caste);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.delete("/caste/:name", auth, async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== "admin") {
      return res.status(403).json({ msg: "You are not authorized" });
    }
    const name = req.params.name;

    let caste = await CMS.findOne({ name: "cmspics" });

    caste.caste = caste.caste.filter((cst) => cst !== name);
    await caste.save();
    res.status(201).send(caste.caste);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});
// ==================Gotra===============

router.post("/gotra/new-gotra", auth, async (req, res) => {
  try {
    const { role } = req.user;
    const { data, update } = req.body;
    if (role !== "admin") {
      return res.status(403).json({ msg: "You are not Authorized" });
    }

    let gotra = await CMS.findOne({ name: "cmspics" });
    if (gotra) {
      if (update) {
        gotra.gotra.forEach((cst, index) => {
          data.forEach((dt) => {
            if (dt.old === cst) {
              gotra.gotra[index] = dt.new;
            }
          });
        });
      } else {
        gotra.gotra = [...gotra.gotra, ...data].sort((a, b) =>
          a.charAt(0).localeCompare(b.charAt(0))
        );
      }
    }

    await gotra.save();
    return res.status(201).send(gotra);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.delete("/gotra/:name", auth, async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== "admin") {
      return res.status(403).json({ msg: "You are not authorized" });
    }
    const name = req.params.name;

    let gotra = await CMS.findOne({ name: "cmspics" });

    gotra.gotra = gotra.gotra.filter((cst) => cst !== name);
    await gotra.save();
    res.status(201).send(gotra.gotra);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

module.exports = router;
