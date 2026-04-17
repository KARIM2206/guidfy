const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder =
      req.path.includes('cover') ? 'uploads/covers' : 'uploads/avatars';
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const unique = `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});
const uploadProfile = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ok = allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error('Images only!'), ok);
  },
});

module.exports = uploadProfile;