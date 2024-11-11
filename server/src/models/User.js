// models/User.js
import pool from "../db.js";

class User {
  constructor(userId, username, email, password) {
    this.userId = userId;
    this.username = username;
    this.email = email;
    this.password = password;
  }

  static async create({ userId, username, email, password}) {
    const result = await pool.query(
      "INSERT INTO Users (userId, username, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
      [userId, username, email, password]
    );
    return new User(result.rows[0]);
  }

  static async findByUsername(username) {
    const result = await pool.query("SELECT * FROM Users WHERE username = $1", [username]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      return new User(user.userId, user.username, user.email, user.password);
    }
    return null;
  }

  // Add additional methods like update or delete as needed
}

export default User;
