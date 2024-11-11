// controllers/MessageController.js
import Message from "../models/Message.js";

export async function sendMessage(req, res) {
  const { senderId, receiverId, content } = req.body;
  try {
    const message = await Message.create({
      messageId: uuidv4(),
      senderId,
      receiverId,
      content,
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Message could not be sent." });
  }
}

export async function getMessages(req, res) {
  const { userId, contactId } = req.params;
  try {
    const messages = await Message.findAllBetweenUsers(userId, contactId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Could not retrieve messages." });
  }
}
