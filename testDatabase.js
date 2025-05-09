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

async function testDatabaseConnection() {
  try {
    const pool = await sql.connect(dbConfig);
    console.log('✅ Verbonden met de database');

    // Testquery - alleen ter controle
    const result = await pool.request().query('SELECT 1 AS test');
    console.log('Testquery resultaat:', result.recordset);

    await pool.close();
  } catch (err) {
    console.error('❌ Databaseverbinding mislukt:', err.message);
  }
}

testDatabaseConnection();