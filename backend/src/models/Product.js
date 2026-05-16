import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String, // e.g., "Cars", "Clothes"
        required: true
    },
    description: {
        type: String,
        required: true
    },
    condition: {
        type: String,
        enum: ['New', 'Used'],
        required: true
    },
    // Logic for "Used" items
    ownerCount: {
        type: Number,
        default: 0,
        // We will validate this in the controller based on the condition
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const Product = mongoose.model("Product", productSchema);
export default Product;