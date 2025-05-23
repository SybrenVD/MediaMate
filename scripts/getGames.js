const { sql, poolPromise } = require('../config/db.js');

async function getFirst20Games() {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT TOP 20 * FROM Games');
    
    console.log(result.recordset);
    return result.recordset;
  } catch (err) {
    console.error('Error fetching games:', err);
    throw err;
  }
}

getFirst20Games();