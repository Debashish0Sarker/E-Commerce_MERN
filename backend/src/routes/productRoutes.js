import express from "express";
import { createProduct, getAllProducts } from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: Anyone can see products
router.get("/", getAllProducts);

// Protected: Only logged-in sellers can upload
router.post("/upload", protect, createProduct);

export default router;