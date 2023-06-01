const multer = require("multer");
const jimp = require("jimp");
const fs = require("fs").promises;
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.user.id;
    const uploadPath = path.join(__dirname, `../../gallery/${userId}`);
    fs.mkdir(uploadPath, { recursive: true }, (err) => {
      if (err) {
        console.error(err);
        cb(err, null);
      } else {
        cb(null, uploadPath);
      }
    });
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

async function handleGalleryUpload(req, res, next) {
  try {
    // Handle multer upload
    await upload.array("images")(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        console.error(err);
        return res.status(400).json({
          msg: "Failed to upload gallery images. Please try again later. 1",
        });
      } else if (err) {
        // An unknown error occurred when uploading.
        console.error(err);
        return res.status(500).json({
          msg: "Failed to upload gallery images. Please try again later. 2",
        });
      }

      // Load and optimize each image using jimp
      const optimizedImages = await Promise.all(
        req.files.map(async (file) => {
          const imagePath = file.path;
          const image = await jimp.read(imagePath);

          // Resize and compress the image
          await image
            .resize(500, jimp.AUTO) // set width to 500 pixels, maintain aspect ratio
            .quality(80) // set quality to 80
            .writeAsync(imagePath); // write the optimized image back to disk

          // Rename the file to use the unique ID and .jpeg extension
          const newImagePath = path.join(
            path.dirname(imagePath),
            path
              .basename(file.filename)
              .replace(path.extname(file.filename), ".jpeg")
          );
          await fs.rename(imagePath, newImagePath);

          return `/gallery/${req.user.id}/${path.basename(newImagePath)}`;
        })
      );

      // Add the image URLs to the request body
      req.body.gallery = optimizedImages;

      next();
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Failed to upload gallery images. Please try again later. 3",
    });
  }
}

module.exports = handleGalleryUpload;
