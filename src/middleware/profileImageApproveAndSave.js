const multer = require("multer");
const jimp = require("jimp");
const fs = require("fs").promises;
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../profile-image"));
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

async function handleImageUpdate(req, res, next) {
  try {
    const profileImagePath = path.join(__dirname, "../../profile-image");
    const approvalImagePath = path.join(__dirname, "../../profile-approval");

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

      if (req.body.link !== undefined) {
        // Remove existing image from profile-image and profile-approval folders if found
        const existingImageName = path.basename(req.body.link);
        const existingProfileImage = path.join(
          profileImagePath,
          existingImageName
        );
        const existingApprovalImage = path.join(
          approvalImagePath,
          existingImageName
        );
        await fs.unlink(existingProfileImage).catch(() => {});
        await fs.unlink(existingApprovalImage).catch(() => {});
      }

      if (!req.file && req.body.link === undefined) {
        // No file was uploaded and link is undefined
        next();
      } else {
        // Load the image using jimp
        const image = req.file
          ? await jimp.read(req.file.path)
          : await jimp.read(req.body.link);

        // Resize and compress the image
        await image
          .resize(300, 300) // set width and height to 300 pixels
          .quality(80); // set quality to 80

        // Rename the file to use the unique ID and .jpeg extension
        const imageName = `${new Date().getTime().toString(36)}${Math.random()
          .toString(36)
          .slice(2)}.jpeg`;
        const imagePath = path.join(profileImagePath, imageName);
        // const approvalPath = path.join(approvalImagePath, imageName);

        // Save the image to the profile-image folder
        await image.writeAsync(imagePath);

        // Add the image URL to the request body
        req.body.avatar = `/profile-image/${imageName}`;

        // Move the image to the profile-approval folder if there is no approval record found
        const approvalRecordPath = path.join(
          __dirname,
          "../../db/approvals.json"
        );
        const approvals = JSON.parse(await fs.readFile(approvalRecordPath));
        const existingApproval = approvals.find((approval) => {
          return approval.image === imageName;
        });

        // If an approval record already exists, update it with the new image path
        if (existingApproval) {
          existingApproval.image = `/profile-image/${imageName}`;
          await fs.writeFile(
            approvalRecordPath,
            JSON.stringify(approvals, null, 2)
          );
        } else {
          // Otherwise, move the image to the profile-approval folder
          const approvalPath = path.join(
            __dirname,
            "../../profile-approval",
            imageName
          );
          await fs.rename(imagePath, approvalPath);
        }

        // Check if there is a profile image with the same name in the profile-approval folder
        const approvalImagePath = path.join(
          __dirname,
          "../../profile-approval",
          imageName
        );
        const approvalImageExists = await fs
          .access(approvalImagePath)
          .then(() => true)
          .catch(() => false);

        // If an image with the same name exists in the profile-approval folder, remove it
        if (approvalImageExists) {
          await fs.unlink(approvalImagePath);
        }

        next();
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Failed to upload profile picture. Please try again later.",
    });
  }
}

module.exports = handleImageUpdate;
