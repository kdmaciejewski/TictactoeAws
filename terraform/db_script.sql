CREATE TABLE IF NOT EXISTS users
(
    userid   VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email    VARCHAR(255) UNIQUE NOT NULL
);

INSERT INTO Users (userid, username, email)
VALUES ('23', 'terraform_test', 'test@example.com');

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL
);

INSERT INTO messages (text) VALUES ('Hello, World!')
ON CONFLICT (text) DO NOTHING;

INSERT INTO messages (text) VALUES ('This is a test message.')
ON CONFLICT (text) DO NOTHING;