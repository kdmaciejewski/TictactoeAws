import { CognitoUserPool } from "amazon-cognito-identity-js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

// Cognito user pool configuration
const poolData = {
  // UserPoolId: process.env.COGNITO_USER_POOL_ID,
  // ClientId: process.env.COGNITO_CLIENT_ID,
    UserPoolId: 'us-east-1_UWMwgv1eF',
    ClientId: '1n9uk5pnaor8p1t9jjdg9e45cn'
};

const userPool = new CognitoUserPool(poolData);

export const signup = (req, res, pool) => {
  const { username, email, password } = req.body;

  userPool.signUp(username, password, [{ Name: "email", Value: email }], null, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(400).json({ message: err.message || "Error signing up." });
    }

    console.log("User registered:", data);
    // Optionally, store additional user data in RDS here
    const userId = uuidv4(); // Generate unique user ID for your RDS

    // If you want to store user information in RDS, you can create a function to insert user data into your PostgreSQL database.
    // Example: await pool.query('INSERT INTO users ...', [userId, username, firstName, lastName]);

    return res.status(201).json({
      message: "User created successfully",
      user: { userId: data.userSub, username, email, password},
    });
  });
};
