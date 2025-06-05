// modules/community.js
const { sql, poolPromise } = require('../config/db');

async function getCommunities() {
  const pool = await poolPromise;
  const result = await pool.request().query('SELECT * FROM Communities');
  return result.recordset;
}

async function createCommunity(ChatName, Keywords, Image, CreatorID) {
  console.log("🚀 Inserting to DB...");
  const pool = await poolPromise;
  await pool.request()
    .input('ChatName', sql.NVarChar(30), ChatName)
    .input('Keywords', sql.NVarChar(150), Keywords)
    .input('Image', sql.NVarChar(255), Image)
    .input('CreatorID', sql.Int, CreatorID)
    .query(`
      INSERT INTO Communities (ChatName, Keywords, Image, CreatorID)
      VALUES (@ChatName, @Keywords, @Image, @CreatorID)
    `);
    
}

module.exports = { getCommunities, createCommunity };

