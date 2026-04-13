const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.fieldname === 'resume' ? 'uploads/resumes' : 'uploads/avatars';
    cb(null, path.join(__dirname, '..', dir));
  },
  filename: (req, file, cb) => {
    const unique = crypto.randomBytes(12).toString('hex');
    cb(null, `${req.user.id}_${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'avatar') {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
    }
  }
  if (file.fieldname === 'resume') {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed for resumes'), false);
    }
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
});

module.exports = upload;
