// This middleware handles file uploads using multer, configuring storage, file naming, and file type validation.
// It ensures only valid image files are uploaded and limits the file size to 5MB.
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    const hashSum = crypto.createHash("md5");
    hashSum.update(file.originalname + Date.now());
    const hex = hashSum.digest("hex");

    const newFileName = `${hex}-${file.originalname}`;

    // Check if a file with the same name already exists
    fs.readdir(uploadPath, (err, files) => {
      if (err) {
        return cb(err);
      }

      const existingFile = files.find((f) => f === newFileName);
      if (existingFile) {
        console.log("File already exists:", existingFile);
        cb(null, existingFile);
      } else {
        console.log("New file name:", newFileName);
        cb(null, newFileName);
      }
    });
  },
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.mimetype.match(/^image\/(jpeg|png|gif|bmp|webp)$/)) {
    cb(new Error("Invalid file type. Only image files are allowed."), false);
    console.log("Invalid file type. Only image files are allowed.");
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
});

module.exports = upload;
