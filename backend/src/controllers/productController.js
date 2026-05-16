import Product from "../models/Product.js";

export const createProduct = async (req, res) => {
    try {
        const { name, price, category, description, condition, ownerCount } = req.body;

        // 1. Check if user is in Seller mode
        if (req.user.currentMode !== 'seller' && req.user.role !== 'admin') {
            return res.status(403).json({ error: "You must be in Seller mode to upload products" });
        }

        // 2. Validate "Used" item logic
        if (condition === 'Used' && (ownerCount === undefined || ownerCount === null)) {
            return res.status(400).json({ error: "Used products must state the number of previous owners" });
        }

        const product = new Product({
            name,
            price,
            category,
            description,
            condition,
            ownerCount: condition === 'New' ? 0 : ownerCount,
            seller: req.user.id // Taken from the protect middleware
        });

        await product.save();

        res.status(201).json({
            success: true,
            message: "Product uploaded successfully",
            product
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to upload product" });
    }
};

// Get all products (for customers to see)
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('seller', 'name email');
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
};