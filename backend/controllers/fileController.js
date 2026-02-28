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
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/avi', 'video/mov',
    'application/pdf', 'text/plain', 'text/html', 'text/csv',
    'application/zip', 'application/x-zip-compressed',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB limit

const sanitizeFileName = (filename) => {
    return filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
};

// @desc    Prepare file upload with signed URL
// @route   POST /api/files/upload
// @access  Private
const uploadFile = async (req, res) => {
    try {
        const { fileName, fileType, fileSize, parentId } = req.body;

        // Validate required fields
        if (!fileName || !fileType || !fileSize) {
            return res.status(400).json({ message: 'Missing required fields: fileName, fileType, fileSize' });
        }

        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(fileType)) {
            return res.status(400).json({ message: 'File type not allowed' });
        }

        // Validate file size
        if (fileSize > MAX_FILE_SIZE) {
            return res.status(400).json({ message: 'File size exceeds limit (100MB)' });
        }

        // Validate parent folder if provided
        if (parentId) {
            const parentFolder = await File.findById(parentId);
            if (!parentFolder || !parentFolder.isFolder || parentFolder.userId.toString() !== req.user.id) {
                return res.status(400).json({ message: 'Invalid parent folder' });
            }
        }

        // Sanitize filename and create unique key
        const sanitizedFilename = sanitizeFileName(fileName);
        const sanitizedUsername = req.user.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const timestamp = Date.now();
        const s3Key = `users/${req.user.id}-${sanitizedUsername}/${timestamp}-${sanitizedFilename}`;

        // Create signed URL for direct S3 upload (15 minutes expiry)
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key,
            ContentType: fileType,
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 }); // 15 minutes

        // Prepare file data for database (will be saved after successful upload)
        const fileData = {
            userId: req.user.id,
            fileName: sanitizedFilename,
            fileType: fileType,
            s3Key: s3Key,
            size: fileSize,
            parentId: parentId || null,
        };

        const uploadId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

        res.status(200).json({
            signedUrl,
            fileData,
            uploadId
        });
    } catch (error) {
        console.error('Upload preparation error:', error.message);
        res.status(500).json({ message: 'Failed to prepare upload' });
    }
};

// @desc    Confirm successful upload and save to database
// @route   POST /api/files/confirm-upload
// @access  Private
const confirmUpload = async (req, res) => {
    try {
        const { uploadId, fileData } = req.body;

        if (!uploadId || !fileData) {
            return res.status(400).json({ message: 'Missing uploadId or fileData' });
        }

        // Verify the file data belongs to the authenticated user
        if (fileData.userId !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Check if file already exists (prevent duplicate confirms)
        const existingFile = await File.findOne({
            userId: req.user.id,
            s3Key: fileData.s3Key
        });

        if (existingFile) {
            return res.status(200).json(existingFile);
        }

        // Create the database record
        const file = await File.create(fileData);
        console.log(`Upload confirmed and saved: ${file.fileName}`);

        res.status(201).json(file);
    } catch (error) {
        console.error('Upload confirmation error:', error.message);
        res.status(500).json({ message: 'Failed to confirm upload' });
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
        const { parentId, search } = req.query;

        let filter = { userId: req.user.id };

        if (search) {
            // Global search: ignore parentId, look for partial matches case-insensitive
            filter.fileName = { $regex: search, $options: 'i' };
        } else {
            // Standard browsing: filter by parentId (null for root)
            filter.parentId = parentId || null;
        }

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
    confirmUpload,
    getFiles,
    deleteFile,
    createFolder,
};
