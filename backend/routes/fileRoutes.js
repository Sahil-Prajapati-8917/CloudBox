const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { uploadFile, confirmUpload, getFiles, deleteFile, createFolder } = require('../controllers/fileController');

// Multer setup using disk storage (better for large files)
const storage = multer.diskStorage({});
const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // Limit 100MB (matches controller)
    fileFilter: (req, file, cb) => {
        // Basic file type validation
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
            'video/mp4', 'video/avi', 'video/mov',
            'application/pdf', 'text/plain', 'text/html', 'text/csv',
            'application/zip', 'application/x-zip-compressed',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('File type not allowed'), false);
        }
    }
});

router.post('/upload', protect, uploadFile); // Changed: no longer using multer
router.post('/confirm-upload', protect, confirmUpload);
router.post('/create-folder', protect, createFolder);
router.get('/', protect, getFiles);
router.delete('/:id', protect, deleteFile);

module.exports = router;
