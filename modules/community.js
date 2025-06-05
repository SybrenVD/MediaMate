// modules/community.js
const { sql, poolPromise } = require('../config/db');

async function getCommunities() {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Communities');
    return result.recordset;
  } catch (err) {
    console.error('❌ Error fetching communities:', err);
    return [];
  }
}

module.exports = { getCommunities };
