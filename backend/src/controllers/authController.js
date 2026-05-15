import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user._id, 
            email: user.email, 
            role: user.role,
            currentMode: user.currentMode 
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// @desc    Register User (Customer/Seller)
// @route   POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { 
            name, username, email, phoneNumber, age, 
            password, identificationNumber, role 
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }, { identificationNumber }] 
        });

        if (existingUser) {
            return res.status(400).json({ 
                error: "User already exists with this email, username, or identification number" 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            name,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            phoneNumber,
            age,
            password: hashedPassword,
            identificationNumber,
            role: role || 'customer',
            currentMode: role === 'seller' ? 'seller' : 'customer'
        });

        await user.save();

        // Generate token
        const token = generateToken(user);

        // Return user info (excluding password)
        const userData = {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            currentMode: user.currentMode
        };

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: userData,
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Registration failed" });
    }
};

// @desc    Register Admin (with verification code)
// @route   POST /api/auth/register-admin
export const registerAdmin = async (req, res) => {
    try {
        const { 
            name, username, age, email, password, adminCode 
        } = req.body;

        // Verify admin code
        if (adminCode !== process.env.ADMIN_SECRET_CODE) {
            return res.status(403).json({ error: "Invalid admin verification code" });
        }

        // Check if admin already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            return res.status(400).json({ error: "Admin already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin
        const admin = new User({
            name,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            age,
            password: hashedPassword,
            identificationNumber: `ADMIN-${Date.now()}`, // Auto-generate for admin
            role: 'admin',
            currentMode: 'customer'
        });

        await admin.save();

        // Generate token
        const token = generateToken(admin);

        const adminData = {
            id: admin._id,
            name: admin.name,
            username: admin.username,
            email: admin.email,
            role: admin.role
        };

        res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            user: adminData,
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Admin registration failed" });
    }
};

// @desc    Login User (by email or username)
// @route   POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        // Find user by email or username
        const user = await User.findOne({ 
            $or: [
                { email: identifier.toLowerCase() },
                { username: identifier.toLowerCase() }
            ]
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({ error: "Account is deactivated" });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user);

        const userData = {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            currentMode: user.currentMode
        };

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: userData,
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Login failed" });
    }
};

// @desc    Switch user mode (Customer <-> Seller)
// @route   PUT /api/auth/switch-mode
export const switchMode = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware
        const { mode } = req.body; // 'customer' or 'seller'

        if (!['customer', 'seller'].includes(mode)) {
            return res.status(400).json({ error: "Invalid mode" });
        }

        // Check if user has seller role when switching to seller
        if (mode === 'seller' && req.user.role !== 'seller' && req.user.role !== 'admin') {
            return res.status(403).json({ error: "You are not registered as a seller" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { currentMode: mode },
            { new: true }
        );

        // Generate new token with updated mode
        const token = generateToken(user);

        res.status(200).json({
            success: true,
            message: `Switched to ${mode} mode`,
            currentMode: user.currentMode,
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to switch mode" });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to get user" });
    }
};