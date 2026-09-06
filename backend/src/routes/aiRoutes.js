import express from "express";
import { handleChat } from "../controllers/aiController.js";

const router = express.Router();

// Public route: any visitor or registered user can chat with the shopping assistant
router.post("/chat", handleChat);

export default router;