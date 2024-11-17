// models/User.js
import pool from "../db.js";

class User {
  constructor(userId, username, email) {
    this.userId = userId;
    this.username = username;
    this.email = email;
  }

  static async create({ userId, username, email}) {
    const result = await pool.query(
      "INSERT INTO Users (userId, username, email) VALUES ($1, $2, $3) RETURNING *",
      [userId, username, email]
    );
    return new User(result.rows[0]);
  }

  static async findByUsername(username) {
    const result = await pool.query("SELECT * FROM Users WHERE username = $1", [username]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      return new User(user.userId, user.username, user.email);
    }
    return null;
  }
}

export default User;
