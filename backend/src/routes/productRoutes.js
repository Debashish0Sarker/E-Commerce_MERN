import express from "express";
import { createProduct, getAllProducts, getProductById } from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: Anyone can see products
router.get("/", getAllProducts);

// Public: Anyone can see a single product's details
router.get("/:id", getProductById);

// Protected: Only logged-in sellers can upload
router.post("/upload", protect, createProduct);

export default router;