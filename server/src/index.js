import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from 'pg'; // Adjusted import
const {Pool} = pkg;
import fs from "fs";
import https from "https";
import http from "http";

dotenv.config();
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const app = express();

const options = {
    // key: fs.readFileSync("./src/certs/key.pem", 'utf8'),
    // cert: fs.readFileSync("./src/certs/cert.crt", 'utf8'),
    key: fs.readFileSync("./localhost.key", 'utf8'),
    cert: fs.readFileSync("./localhost.crt", 'utf8'),
};

const pool = new Pool({
    connectionString: process.env.DATABASE_URL3,
});
// const pool = new Pool({
//     user: "postgres",
//     host: process.env.ENDPOINT,
//     database: "mydb",
//     password: "postgres",
//     port: 5432,
// });

app.use(cors());
app.use(express.json());
const AWS = require("aws-sdk");
const sqs = new AWS.SQS({ region: "us-east-1" });

async function initializeDatabase() {
  try {
    const client = await pool.connect();
    console.log("Connected to the database");

    const sqlScript = fs.readFileSync("./src/db_script.sql", "utf8");
    await client.query(sqlScript);
    console.log("SQL script executed successfully");

    client.release();
  } catch (error) {
    console.error("Failed to initialize database", error);
  }
}

initializeDatabase();

app.post("/signup", async (req, res) => {
    const {userId, userUsername, userEmail} = req.body;

    console.log(process.env.DATABASE_URL);
    pool.connect()
        .then(() => console.log("Connected to RDS"))
        .catch(err => console.error("Failed to connect to RDS", err));

    console.log(userId + " " + userUsername + " " + userEmail);
    try {
        console.log("próba");
        const query = `
            INSERT INTO Users (userid, username, email)
            VALUES ($1, $2, $3)
            ON CONFLICT (userid) DO NOTHING
            RETURNING *;
        `;
        const values = [userId, userUsername, userEmail];
        const result = await pool.query(query, values);
        console.log("rezultat: " + result);

        if (result.rowCount === 0) {
            return res.status(200).json({message: "User already exists."});
        }

        res.status(200).json({
            message: "User created successfully",
            user: result.rows[0]
        });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({
            error: "An error occurred while creating the user.",
            details: error.message,
        });
    }
});


app.get("/users", async (req, res) => {
    console.log(pool)
    try {
        const query = "SELECT userid, username, email FROM Users";
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({
            error: "An error occurred while fetching users. DATABASE_URL3 rds: " + process.env.DATABASE_URL3,
            details: error.message,
        });
    }
});

app.get("/checkUser", async (req, res) => {
    const {userUsername} = req.query;
    console.log("WESZLLO")
    console.log(process.env.DATABASE_URL);
    pool.connect()
        .then(() => console.log("Connected to RDS"))
        .catch(err => console.error("Failed to connect to RDS", err));
    try {
        const query = "SELECT userid FROM Users WHERE username = $1";
        const values = [userUsername];
        const result = await pool.query(query, values);
        console.log("tyle userow: " + result.rows.length);
        if (result.rows.length > 0) {
            res.status(200).json({exists: true});
            console.log("true")
        } else {
            res.status(200).json({exists: false});
            console.log("false")
        }
    } catch (error) {
        console.error("Error checking user existence:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
});

app.get("/messages", async (req, res) => {
    try {
        const query = "SELECT id, text FROM messages";
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({
            error: "An error occurred while fetching messages.",
            details: error.message,
        });
    }
});

app.post("/messages", async (req, res) => {
    const { text } = req.body;

    try {
        // Send the message to SQS
        const params = {
            QueueUrl: process.env.SQS_QUEUE_URL,
            MessageBody: text,
        };

        await sqs.sendMessage(params).promise();

        res.status(201).json({
            message: "Message sent to queue successfully.",
        });
    } catch (error) {
        res.status(500).json({
            error: "An error occurred while sending the message to the queue.",
            details: error.message,
        });
    }
});

app.get('/health', (req, res) => {
    res.status(200).send("OK");
});
// app.post("/messages", async (req, res) => {
//     const { text } = req.body;
//
//     try {
//         const query = "INSERT INTO messages (text) VALUES ($1) RETURNING id, text";
//         const values = [text];
//         const result = await pool.query(query, values);
//
//         res.status(201).json({
//             message: "Message added successfully.",
//             data: result.rows[0],
//         });
//     } catch (error) {
//         res.status(500).json({
//             error: "An error occurred while adding the message.",
//             details: error.message,
//         });
//     }
// });


// Create the database schema on server start
// createDatabaseSchema(pool);



app.listen(3001, () => {
    console.log("HTTP server is running on port 3001");
});


// https.createServer(options, app).listen(3001, () => {
//     console.log("zmiana HTTPS server running on https://localhost:3001");
// });