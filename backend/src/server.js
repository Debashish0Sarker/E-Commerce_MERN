import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import { connectDB } from './config/db.js';
import testroutes from './routes/test.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';

dotenv.config();
console.log("JWT_SECRET loaded:", process.env.JWT_SECRET ? "YES ✅" : "NO ❌");
console.log("ADMIN_SECRET_CODE loaded:", process.env.ADMIN_SECRET_CODE ? "YES ✅" : "NO ❌");

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api/test", testroutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});