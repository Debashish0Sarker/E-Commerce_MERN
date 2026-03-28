import express from 'express';
import { testController, testController2, createTest} from '../controllers/testcontroller.js'; 

const router = express.Router();

router.get("/test1",testController);
router.get("/test2", testController2);
router.post("/posttest",createTest);
export default router;