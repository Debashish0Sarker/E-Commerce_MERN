import Product from "../models/Product.js";
import User from "../models/User.js";

export const createProduct = async (req, res) => {
    try {
        const { name, price, category, description, condition, ownerCount, stock } = req.body;

        // 1. Check if user is in Seller mode
        if (req.user.currentMode !== 'seller' && req.user.role !== 'admin') {
            return res.status(403).json({ error: "You must be in Seller mode to upload products" });
        }

        // 2. Validate "Used" item logic
        if (condition === 'Used' && (ownerCount === undefined || ownerCount === null)) {
            return res.status(400).json({ error: "Used products must state the number of previous owners" });
        }

        // 3. Validate stock quantity
        const parsedStock = Number(stock) > 0 ? Math.floor(Number(stock)) : 1;

        const product = new Product({
            name,
            price,
            category,
            description,
            condition,
            ownerCount: condition === 'New' ? 0 : ownerCount,
            stock: parsedStock,
            seller: req.user.id // Taken from the protect middleware
        });

        await product.save();

        res.status(201).json({
            success: true,
            message: "Product uploaded successfully",
            product
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Failed to upload product" });
    }
};

// Get all products (only products with stock > 0 are displayed)
export const getAllProducts = async (req, res) => {
    try {
        // Ensure any existing products without stock field default to stock: 1
        await Product.updateMany({ stock: { $exists: false } }, { $set: { stock: 1 } });

        // Only return products that have remaining stock > 0
        const products = await Product.find({ stock: { $gt: 0 } }).populate('seller', 'name email');
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
};

// Get a single product by ID (with full seller info)
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate(
            'seller',
            'name email phoneNumber username'
        );

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json(product);
    } catch (error) {
        // Handle invalid ObjectId format
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ error: "Product not found" });
        }
        res.status(500).json({ error: "Failed to fetch product" });
    }
};

// Direct Buy Now purchase
export const buyProduct = async (req, res) => {
    try {
        const { quantity = 1 } = req.body;
        const purchaseQty = Math.max(1, Math.floor(Number(quantity)));

        const product = await Product.findById(req.params.id);
        if (!product || product.stock <= 0) {
            return res.status(404).json({ error: "Product is out of stock or no longer available" });
        }

        if (product.seller.toString() === req.user.id.toString()) {
            return res.status(400).json({ error: "You cannot buy your own product" });
        }

        if (product.stock < purchaseQty) {
            return res.status(400).json({ 
                error: `Only ${product.stock} items remaining in stock` 
            });
        }

        // Deduct purchased quantity from stock
        product.stock -= purchaseQty;

        let isSoldOut = false;
        if (product.stock <= 0) {
            isSoldOut = true;
            // Automatically remove product from product list / database when sold out!
            await Product.findByIdAndDelete(product._id);
            // Clean up from all users' carts
            await User.updateMany({}, { $pull: { cart: { product: product._id } } });
        } else {
            await product.save();
        }

        // Also clean up from buyer's cart if this item was in there
        await User.findByIdAndUpdate(req.user.id, {
            $pull: { cart: { product: product._id } }
        });

        res.status(200).json({
            success: true,
            message: isSoldOut 
                ? "All units sold! Product has been purchased and removed from the listings."
                : `Purchase successful! ${product.stock} units remaining.`,
            remainingStock: isSoldOut ? 0 : product.stock
        });
    } catch (error) {
        console.error("Purchase failed:", error);
        res.status(500).json({ error: "Purchase failed. Please try again." });
    }
};