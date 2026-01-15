const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3Client = require('../config/s3');
const File = require('../models/File');

// @desc    Upload file
// @route   POST /api/files/upload
// @access  Private
const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);

// File validation helpers
const ALLOWED_FILE_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/avi', 'video/mov',
    'application/pdf', 'text/plain',
    'application/zip', 'application/x-zip-compressed'
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB limit

const sanitizeFileName = (filename) => {
    return filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
};

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { originalname, mimetype, size, path } = req.file;

        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(mimetype)) {
            try { await unlinkFile(path); } catch (e) { }
            return res.status(400).json({ message: 'File type not allowed' });
        }

        // Validate file size
        if (size > MAX_FILE_SIZE) {
            try { await unlinkFile(path); } catch (e) { }
            return res.status(400).json({ message: 'File size exceeds limit (100MB)' });
        }

        // Sanitize filename and create unique key
        const sanitizedFilename = sanitizeFileName(originalname);
        const sanitizedUsername = req.user.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const timestamp = Date.now();
        const s3Key = `users/${req.user.id}-${sanitizedUsername}/${timestamp}-${sanitizedFilename}`;

        // Validate parent folder if provided
        if (req.body.parentId) {
            const parentFolder = await File.findById(req.body.parentId);
            if (!parentFolder || !parentFolder.isFolder || parentFolder.userId.toString() !== req.user.id) {
                try { await unlinkFile(path); } catch (e) { }
                return res.status(400).json({ message: 'Invalid parent folder' });
            }
        }

        // Upload to S3 (required for all environments)
        console.log(`Attempting S3 upload for ${originalname} (${mimetype})`);

        // Create read stream from the temp file
        const fileStream = fs.createReadStream(path);

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key,
            Body: fileStream,
            ContentType: mimetype,
        });

        await s3Client.send(command);
        console.log(`S3 upload successful for ${originalname}`);

        // Clean up local temp file
        await unlinkFile(path);

        const file = await File.create({
            userId: req.user.id,
            fileName: sanitizedFilename,
            fileType: mimetype,
            s3Key: s3Key,
            size: size,
            parentId: req.body.parentId || null,
        });

        res.status(201).json(file);
    } catch (error) {
        console.error('Upload Error:', error.message);
        // Attempt cleanup if upload fails
        try { if (req.file?.path) await unlinkFile(req.file.path); } catch (e) { }
        res.status(500).json({ message: 'File upload failed' });
    }
};

// @desc    Create folder
// @route   POST /api/files/create-folder
// @access  Private
const createFolder = async (req, res) => {
    try {
        const { name, parentId } = req.body;

        // Validate folder name
        if (!name || typeof name !== 'string') {
            return res.status(400).json({ message: 'Valid folder name is required' });
        }

        const trimmedName = name.trim();
        if (trimmedName.length === 0 || trimmedName.length > 255) {
            return res.status(400).json({ message: 'Folder name must be between 1 and 255 characters' });
        }

        // Check for invalid characters
        if (/[<>:"/\\|?*]/.test(trimmedName)) {
            return res.status(400).json({ message: 'Folder name contains invalid characters' });
        }

        // Validate parent folder if provided
        if (parentId) {
            const parentFolder = await File.findById(parentId);
            if (!parentFolder || !parentFolder.isFolder || parentFolder.userId.toString() !== req.user.id) {
                return res.status(400).json({ message: 'Invalid parent folder' });
            }
        }

        // Check if folder with same name already exists in the same location
        const existingFolder = await File.findOne({
            userId: req.user.id,
            fileName: trimmedName,
            parentId: parentId || null,
            isFolder: true
        });

        if (existingFolder) {
            return res.status(400).json({ message: 'Folder with this name already exists' });
        }

        const folder = await File.create({
            userId: req.user.id,
            fileName: trimmedName,
            fileType: 'folder',
            s3Key: `folders/${Date.now()}_${trimmedName.replace(/[^a-zA-Z0-9]/g, '_')}`,
            size: 0,
            isFolder: true,
            parentId: parentId || null,
        });

        res.status(201).json(folder);
    } catch (error) {
        console.error('Folder creation error:', error.message);
        res.status(500).json({ message: 'Folder creation failed' });
    }
};

// @desc    Get user files with signed URLs
// @route   GET /api/files
// @access  Private
const getFiles = async (req, res) => {
    try {
        const { parentId } = req.query;
        // Filter by parentId (null for root)
        const filter = {
            userId: req.user.id,
            parentId: parentId || null
        };

        const files = await File.find(filter).sort({ isFolder: -1, uploadedAt: -1 });

        const filesWithUrls = [];
        for (const file of files) {
            if (file.isFolder) {
                filesWithUrls.push(file.toObject());
                continue;
            }

            try {
                const command = new GetObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: file.s3Key,
                });

                // Generate signed URL valid for 1 hour (3600 seconds)
                const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

                filesWithUrls.push({
                    ...file.toObject(),
                    url,
                });
            } catch (s3Error) {
                console.warn(`S3 file missing for ${file.fileName}, removing from database:`, s3Error.message);

                // File doesn't exist in S3, remove from database
                try {
                    await file.deleteOne();
                    console.log(`Cleaned up orphaned database record for ${file.fileName}`);
                } catch (deleteError) {
                    console.error(`Failed to delete orphaned record for ${file.fileName}:`, deleteError.message);
                }

                // Don't include this file in the response since it no longer exists
                continue;
            }
        }

        res.json(filesWithUrls);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve files' });
    }
};

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Private
const deleteFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Check user ownership
        if (file.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (file.isFolder) {
            // Delete all files inside folder (shallow for now)
            await File.deleteMany({ parentId: file._id });
            await file.deleteOne();
            return res.json({ message: 'Folder removed' });
        }

        // Try to delete from S3
        try {
            const command = new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: file.s3Key,
            });

            await s3Client.send(command);
        } catch (s3Error) {
            console.warn(`Failed to delete from S3: ${file.fileName}:`, s3Error.message);
            // Continue with database deletion even if S3 fails
            // In production, you might want to handle this differently
        }

        // Delete from DB
        await file.deleteOne();

        res.json({ message: 'File removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'File deletion failed' });
    }
};

module.exports = {
    uploadFile,
    getFiles,
    deleteFile,
    createFolder,
};
