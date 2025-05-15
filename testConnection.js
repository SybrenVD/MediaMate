const { poolPromise } = require('./config/db.js');

async function testConnection() {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT 1 AS test');
    console.log('Connection successful:', result.recordset);
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

testConnection();