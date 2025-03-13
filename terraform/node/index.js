const AWS = require('aws-sdk');
// const {Client} = require('pg');
const { Pool } = require('pg');

// Initialize SQS client
const sqs = new AWS.SQS();

// Environment variables
// const DB_HOST = process.env.DB_HOST;
// const DB_USER = process.env.DB_USER;
// const DB_PASSWORD = process.env.DB_PASSWORD;
// const DB_NAME = process.env.DB_NAME;

// Admin user for demonstration purposes
const adminUser = "admin";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL2,
});

exports.handler = async (event) => {
    // const client = new Client({
    //     host: DB_HOST,
    //     user: DB_USER,
    //     password: DB_PASSWORD,
    //     database: DB_NAME,
    // });


    try {
        // Connect to the database
        // await client.connect();


        let lastMessage = "";
        for (const record of event.Records) {
            const messageBody = record.body;
            lastMessage = messageBody;
            console.log(`Processing message: ${messageBody}`);

            // Check if the message contains a number
            if (/\d/.test(messageBody)) {
                await sendToAdmin(messageBody);
            }

            // Save message to the database
            await saveMessageToDb(messageBody);
        }

        // Commit the transaction (not needed for individual inserts)
        console.log("All messages processed successfully.");
        return {status: "success", details: lastMessage};
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return {status: "error", details: error.message + "test:  " + process.env.DATABASE_URL2};
    } finally {


        // await client.end();
        await pool.end();
    }
};

const sendToAdmin = async (message) => {
    console.log(`Sending message to admin: ${message}`);
    // Logic for sending message to the admin
};

const saveMessageToDb = async (message) => {
    const query = "INSERT INTO messages (text) VALUES ($1)";


    // await client.query(query, [message]);

    try {
        const result = await pool.query(query, [message]);
        console.log("Message saved to DB:", result.rowCount);
    } catch (error) {
        console.error(`Error saving message to DB: ${error.message}`);
        throw error;
    }
};
