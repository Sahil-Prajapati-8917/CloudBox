const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    fileName: {
        type: String,
        required: [true, 'File name is required'],
        trim: true,
        maxlength: [255, 'File name cannot exceed 255 characters'],
    },
    fileType: {
        type: String,
        required: function() { return !this.isFolder; }, // Required for files, not folders
        trim: true,
    },
    s3Key: {
        type: String,
        required: [true, 'S3 key is required'],
        trim: true,
    },
    size: {
        type: Number,
        required: function() { return !this.isFolder; }, // Required for files, not folders
        min: [0, 'File size cannot be negative'],
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
    isFolder: {
        type: Boolean,
        default: false,
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        default: null,
        // Validate that parentId references a folder
        validate: {
            validator: async function(value) {
                if (!value) return true; // null is allowed
                const parent = await mongoose.model('File').findById(value);
                return parent && parent.isFolder;
            },
            message: 'Parent must be a folder'
        }
    },
});

// Add indexes for performance
fileSchema.index({ userId: 1, parentId: 1 }); // For file listings
fileSchema.index({ userId: 1, isFolder: -1, uploadedAt: -1 }); // For sorting

// Note: Size validation is handled in the controller, not middleware

module.exports = mongoose.model('File', fileSchema);
