import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import messageRoutes from "./routes/messageRoutes.js";
import { StreamChat } from "stream-chat";
import { createDatabaseSchema } from "./db.js"; // Import the schema creation function
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import pkg from 'pg'; // Adjusted import
const { Pool } = pkg;

// Load environment variables
dotenv.config();
const app = express();

const poolData = {
    // UserPoolId: process.env.COGNITO_USER_POOL_ID,
    // ClientId: process.env.COGNITO_CLIENT_ID

    UserPoolId: 'us-east-1_UWMwgv1eF',
    ClientId: '1n9uk5pnaor8p1t9jjdg9e45cn'
};

// Initialize the PostgreSQL pool with the connection string from the environment
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

const api_key = "842k9artxzb2";
const api_secret = "qmv88zpghbgrty3kj9y86vb9tqeghadagn7mmv2mm5gyd3355j3f2ys6z5u3zyva";
const serverClient = new StreamChat.getInstance(api_key, api_secret);

const userPool = new CognitoUserPool(poolData);

app.use(cors());
app.use(express.json());

// Use routes

app.use("/api/messages", messageRoutes);


app.post("/signup", async (req, res) => {
  const { userId } = req.body;
  try {
    const token = serverClient.createToken(userId);
    res.json({ token });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post("/login", async (req, res) => {
  const { username } = req.body;
  try {
    const { users } = await serverClient.queryUsers({ name: username });
    if (users.length === 0) return res.status(404).json({ message: "User not found" });

    const token = serverClient.createToken(users[0].id);
    res.json({ token, userId: users[0].id }); // Send userId along with the token
  } catch (error) {
    res.status(500).json(error);
  }
});


// Create the database schema on server start
// createDatabaseSchema(pool);

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});

