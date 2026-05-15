import express from "express";
import { 
    register, 
    registerAdmin, 
    login, 
    switchMode, 
    getCurrentUser 
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/register-admin", registerAdmin);
router.post("/login", login);

// Protected routes
router.get("/me", protect, getCurrentUser);
router.put("/switch-mode", protect, switchMode);

export default router;