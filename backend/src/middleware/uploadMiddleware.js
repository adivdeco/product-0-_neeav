const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Middleware for single image upload
const uploadSingle = upload.single('avatar');

// Middleware for multiple images
const uploadMultiple = upload.array('images', 10); // max 10 images

module.exports = { uploadSingle, uploadMultiple };