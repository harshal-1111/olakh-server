const multer = require("multer");
const jimp = require("jimp");
const fs = require("fs").promises;
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../profile-approval"));
  },
  filename: function (req, file, cb) {
    const uniqueId =
      new Date().getTime().toString(36) + Math.random().toString(36).slice(2);
    cb(null, uniqueId + ".jpeg");
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

async function handleImageUpload(req, res, next) {
  try {
    // Handle multer upload
    await upload.single("file")(req, res, async function (err) {
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
        const { avatar } = JSON.parse(req.body.data);

        if (avatar) {
          const existingImagePath = path.join(
            __dirname,
            "../..",
            avatar.replace(".jpeg", path.extname(avatar))
          );
          try {
            await fs.access(existingImagePath, fs.constants.F_OK);
            // If the file exists, delete it
            await fs.unlink(existingImagePath);
          } catch (error) {
            // If the file doesn't exist, do nothing
          }
        }

        // Load the image using jimp
        const image = await jimp.read(req.file.path);

        // Resize and compress the image
        await image
          .resize(300, 300) // set width and height to 300 pixels
          .quality(80) // set quality to 80
          .writeAsync(req.file.path); // write the optimized image back to disk

        // Rename the file to use the unique ID and .jpeg extension
        const imagePath = path.join(
          __dirname,
          "../../profile-approval",
          req.file.filename
        );
        const newImagePath = path.join(
          __dirname,
          "../../profile-approval",
          req.file.filename.replace(path.extname(req.file.filename), ".jpeg")
        );
        await fs.rename(imagePath, newImagePath);

        // Add the image URL to the request body
        req.body.avatar = `/profile-approval/${path.basename(newImagePath)}`;

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
