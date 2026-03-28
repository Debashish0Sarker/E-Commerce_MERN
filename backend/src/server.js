import express from 'express';
import testroutes from './routes/test.js';
import { connectDB } from './config/db.js';
import dotenv from "dotenv";

dotenv.config();


// const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());


// app.use((req, res, next) => {
//     console.log("we just logged in the middleware. Method is", req.method, "and url is", req.url);
//     next();
// });
app.use("/", testroutes);
connectDB().then(() => {
app.listen(PORT, () => {
    console.log('Server is running on port',PORT);
})
});


//