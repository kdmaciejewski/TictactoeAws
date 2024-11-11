// models/Message.js
import pool from "../db.js";

class Message {
  constructor(messageId, senderId, receiverId, content, timestamp) {
    this.messageId = messageId;
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.content = content;
    this.timestamp = timestamp;
  }

  static async create({ messageId, senderId, receiverId, content }) {
    const result = await pool.query(
      "INSERT INTO Messages (messageId, senderId, receiverId, content) VALUES ($1, $2, $3, $4) RETURNING *",
      [messageId, senderId, receiverId, content]
    );
    return new Message(result.rows[0]);
  }

  static async findAllBetweenUsers(userId, contactId) {
    const result = await pool.query(
      "SELECT * FROM Messages WHERE (senderId = $1 AND receiverId = $2) OR (senderId = $2 AND receiverId = $1) ORDER BY timestamp ASC",
      [userId, contactId]
    );
    return result.rows.map(
      (msg) => new Message(msg.messageId, msg.senderId, msg.receiverId, msg.content, msg.timestamp)
    );
  }

  // Add additional methods as needed
}

export default Message;
