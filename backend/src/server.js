import express from 'express';
import testroutes from './routes/test.js';
import { connectDB } from './config/db.js';
import dotenv from "dotenv";

dotenv.config();

connectDB();
// const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;


app.use("/", testroutes);
app.listen(PORT, () => {
    console.log('Server is running on port',PORT);
});


//