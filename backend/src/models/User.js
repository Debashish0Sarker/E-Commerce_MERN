import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    // Personal Information
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true,
        min: 18
    },
    password: {
        type: String,
        required: true
    },
    identificationNumber: {
        type: String,
        required: true,
        unique: true,
        sparse: true  // Allows null but enforces uniqueness when present
    },
    
    // Role Management
    role: {
        type: String,
        enum: ['customer', 'seller', 'admin'],
        default: 'customer'
    },
    currentMode: {
        type: String,
        enum: ['customer', 'seller'],
        default: 'customer'
    },
    
    // Admin specific
    adminVerificationCode: {
        type: String,
        select: false  // Won't be returned in queries by default
    },
    
    // Account status
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Timestamps
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Compound index for faster login queries
userSchema.index({ email: 1, username: 1 });

const User = mongoose.model("User", userSchema);
export default User;