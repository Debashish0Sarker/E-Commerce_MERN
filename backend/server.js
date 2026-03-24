import express from 'express';
import testroutes from './routes/test.js';
// const express = require('express');
const app = express();
app.use("/test", testroutes);
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});