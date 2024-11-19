import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {StreamChat} from "stream-chat";
import pkg from 'pg'; // Adjusted import
const {Pool} = pkg;
import fs from "fs";
import https from "https";
import http from "http";

dotenv.config();

const key = fs.readFileSync("./src/certs/key.pem", 'utf8');
const cert = fs.readFileSync("./src/certs/cert.crt", 'utf8');
const credentials = {key: key, cert: cert};
const app = express();

const options = {
  key: fs.readFileSync("./src/certs/key.pem", 'utf8'),
  cert: fs.readFileSync("./src/certs/cert.crt", 'utf8'),
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const api_key = "842k9artxzb2";
const api_secret = "qmv88zpghbgrty3kj9y86vb9tqeghadagn7mmv2mm5gyd3355j3f2ys6z5u3zyva";
const serverClient = new StreamChat.getInstance(api_key, api_secret);
app.use(cors());
app.use(express.json());

// app.post("/signup", async (req, res) => {
//     const {userId, userUsername, userEmail} = req.body;
//     try {
//         const token = serverClient.createToken(userId);
//         res.json({token});
//     } catch (error) {
//         res.status(500).json(error);
//     }
// });
app.post("/signup", async (req, res) => {
    const { userId, userUsername, userEmail } = req.body;

    console.log(process.env.DATABASE_URL);
    pool.connect()
    .then(() => console.log("Connected to RDS"))
    .catch(err => console.error("Failed to connect to RDS", err));

    if (!userId || !userUsername || !userEmail) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        const query = `
            INSERT INTO Users (userid, username, email)
            VALUES ($1, $2, $3)
            ON CONFLICT (userid) DO NOTHING
            RETURNING *;
        `;
        const values = [userId, userUsername, userEmail];
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(200).json({ message: "User already exists." });
        }

        const token = serverClient.createToken(userId);

        res.status(201).json({
            message: "User created successfully",
            user: result.rows[0],
            token,
        });
    } catch (error) {
        res.status(500).json({
            error: "An error occurred while creating the user.",
            details: error.message,
        });
    }
});

app.post("/login", async (req, res) => {
    const {username} = req.body;
    try {
        const {users} = await serverClient.queryUsers({name: username});
        if (users.length === 0) return res.status(404).json({message: "User not found"});

        const token = serverClient.createToken(users[0].id);
        res.json({token, userId: users[0].id}); // Send userId along with the token
    } catch (error) {
        res.status(500).json(error);
    }
});

app.get("/users", async (req, res) => {
    try {
        const query = "SELECT userid, username, email FROM Users";
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({
            error: "An error occurred while fetching users.",
            details: error.message,
        });
    }
});

// Create the database schema on server start
// createDatabaseSchema(pool);

// app.listen(3001, () => {
//     console.log("Server is running on port 3001");
// });

// Replace app.listen with HTTPS server setup
// https.createServer({ key, cert }, app).listen(3001, () => {
//   console.log("HTTPS Server running on port 3001");
// });

// app.get("/", (req, res) => {
//   res.send("Hello, secure world!");
// });

https.createServer(options, app).listen(3001, () => {
  console.log("HTTPS server running on https://localhost:3001");
});