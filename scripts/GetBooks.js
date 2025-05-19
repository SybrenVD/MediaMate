const { sql, poolPromise } = require('../config/db.js');

async function getFirst20Books() {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT TOP 20 * FROM Books');
    
    console.log(result.recordset);
    return result.recordset;
  } catch (err) {
    console.error('Error fetching books:', err);
    throw err;
  }
}

getFirst20Books();