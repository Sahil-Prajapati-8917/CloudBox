const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
    },
    bio: {
        type: String,
        default: '',
        maxlength: [500, 'Bio cannot exceed 500 characters'],
        trim: true,
    },
    location: {
        type: String,
        default: '',
        maxlength: [100, 'Location cannot exceed 100 characters'],
        trim: true,
    },
    plan: {
        type: String,
        enum: ['Free Tier', 'Premium', 'Pro'],
        default: 'Free Tier',
    },
    profileImage: {
        type: String,
        default: '',
        trim: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Note: email field already has unique index due to unique: true constraint

module.exports = mongoose.model('User', userSchema);
