const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = "uploads/lessons";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only video files are allowed"), false);
  }
};

 const uploadLessonVideo = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 500 }, // 500MB
});

module.exports = uploadLessonVideo;