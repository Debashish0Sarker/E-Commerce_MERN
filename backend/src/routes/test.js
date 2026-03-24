import express from 'express';
import { testController, testController2 } from '../controllers/testcontroller.js'; 
const router = express.Router();

router.get("/test1",testController);
router.get("/test2", testController2);
export default router;