const multer = require("multer");
const fs = require("fs");
const path = require("path");

const uploadFolder = "./cmspictures";
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

const storage = multer.diskStorage({
  destination: uploadFolder,
  filename: function (req, file, cb) {
    const filenameParts = file.originalname.split(".");
    const extension = filenameParts[filenameParts.length - 1];
    const filename = `${
      new Date().getTime().toString(36) + Math.random().toString(36).slice(2)
    }.${extension}`;
    const filepath = filename.replace(/\\/g, "/");
    cb(null, `/${filepath}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Only accept image files
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      return cb(new Error("Only image files are allowed"));
    }
  },
});

module.exports = upload;
