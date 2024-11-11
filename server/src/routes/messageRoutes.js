import express from "express";
import { sendMessage, getMessages } from "../controllers/MessageController.js";

const router = express.Router();

router.post("/", sendMessage);
router.get("/:userId/:contactId", getMessages);

export default router;
