import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import { connectDB } from './config/db.js';
import testroutes from './routes/test.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();
console.log("JWT_SECRET loaded:", process.env.JWT_SECRET ? "YES ✅" : "NO ❌");
console.log("ADMIN_SECRET_CODE loaded:", process.env.ADMIN_SECRET_CODE ? "YES ✅" : "NO ❌");
console.log("GEMINI_API_KEY loaded:", process.env.GEMINI_API_KEY ? "YES ✅" : "NO (using smart fallback) ℹ️");

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/api/test", testroutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/ai", aiRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
