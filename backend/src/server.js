import express from 'express';
import testroutes from './routes/test.js';
import authRoutes from './routes/authRoutes.js';
import { connectDB } from './config/db.js';
import dotenv from "dotenv";
import productRoutes from './routes/productRoutes.js';




dotenv.config();
console.log("JWT_SECRET loaded:", process.env.JWT_SECRET ? "YES ✅" : "NO ❌");
console.log("ADMIN_SECRET_CODE loaded:", process.env.ADMIN_SECRET_CODE ? "YES ✅" : "NO ❌");

connectDB();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/test", testroutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
app.use("/api/products", productRoutes);