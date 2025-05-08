const sql = require('mssql');

require('dotenv').config();
const dbConfig = {
  server: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  }
};

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USERNAME:', process.env.DB_USERNAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_DATABASE:', process.env.DB_DATABASE);

async function testDatabaseConnection() {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query('SELECT 1 AS test');
      console.log('Database connection successful:', result.recordset);
      await pool.close(); // vergeet niet af te sluiten
    } catch (err) {
      console.error('Database connection failed:', err.message);
      console.error('Full error object:', err);  // Toon het volledige foutobject
    }
  }

testDatabaseConnection();