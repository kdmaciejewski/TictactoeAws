import pkg from 'pg';
const { Pool } = pkg;


const pool = new Pool({
    host: 'aws-rds.c16ejl6j0lwa.us-east-1.rds.amazonaws.com',
    user: 'postgres',
    password: 'Maciejewski12',
    database: 'postgres',
    port: 5432,
});

export  function createDatabaseSchema(){

}
// export async function createDatabaseSchema(pool) {
//     const client = await pool.connect();
//     try {
//         await client.query(`
//             CREATE TABLE IF NOT EXISTS Users (
//                 userId UUID PRIMARY KEY,
//                 username VARCHAR(50) UNIQUE NOT NULL,
//                 email VARCHAR(100) UNIQUE NOT NULL
//             );
//         `);
//
//         console.log("Database and tables created successfully.");
//     } catch (error) {
//         console.error("Error creating database schema:", error);
//     } finally {
//         client.release();
//     }
// }


// Export the pool and the schema creation function
// export default { pool, createDatabaseSchema };
export default { createDatabaseSchema };