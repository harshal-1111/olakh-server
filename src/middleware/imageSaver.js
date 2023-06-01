const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs").promises;
const path = require("path");

// Set up multer storage and limits
const uniqueId =
  new Date().getTime().toString(36) + Math.random().toString(36).slice(2);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../profile-image"));
  },
  filename: function (req, file, cb) {
    cb(null, uniqueId + path.extname(file.originalname));
  },
});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB file size limit
  },
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Only JPG, JPEG, and PNG image files are allowed!"));
    }
    cb(null, true);
  },
});

// Middleware for handling image upload and optimization
async function handleImageUpload(req, res, next) {
  try {
    // Handle multer upload
    await upload.single("file")(req, res, async function (err) {
      // console.log(JSON.parse(req.body.data), "body");
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        console.error(err);
        return res.status(400).json({
          msg: "Failed to upload profile picture. Please try again later. 1",
        });
      } else if (err) {
        // An unknown error occurred when uploading.
        console.error(err);
        return res.status(500).json({
          msg: "Failed to upload profile picture. Please try again later. 2",
        });
      }

      if (!req.file) {
        // No file was uploaded.
        next();
      } else {
        // Resize and compress the image
        const optimizedImage = await sharp(req.file.path)
          .resize({ width: 300, height: 300, fit: "cover" })
          .jpeg({ quality: 80 })
          .toBuffer();

        // Delete the original image file from disk
        await fs.unlink(req.file.path);

        // Save the optimized image to file system

        const imagePath = path.join(
          __dirname,
          "../../profile-image",
          uniqueId + path.extname(req.file.originalname)
        );
        await fs.writeFile(imagePath, optimizedImage);

        // Add the image URL to the request body
        req.body.avatar = `/profile-image/${path.basename(imagePath)}`;

        next();
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Failed to upload profile picture. Please try again later. 3",
    });
  }
}

module.exports = handleImageUpload;
