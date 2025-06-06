const sql = require('mssql');
const { poolPromise } = require('../config/db');

async function submitOrUpdateReview(type, contentId, userId, rating, comment) {
  const pool = await poolPromise;

  const existing = await pool.request()
    .input('ContentID', sql.Int, contentId)
    .input('UserID', sql.Int, userId)
    .query(`SELECT ReviewID FROM Reviews WHERE ContentID = @ContentID AND UserID = @UserID`);

  if (existing.recordset.length > 0) {
    await pool.request()
      .input('Rating', sql.Int, rating)
      .input('Comment', sql.NVarChar(sql.MAX), comment)
      .input('ReviewDate', sql.Date, new Date())
      .input('ContentID', sql.Int, contentId)
      .input('UserID', sql.Int, userId)
      .query(`
        UPDATE Reviews
        SET Rating = @Rating, Comment = @Comment, ReviewDate = @ReviewDate
        WHERE ContentID = @ContentID AND UserID = @UserID
      `);
  } else {
    await pool.request()
      .input('UserID', sql.Int, userId)
      .input('ContentID', sql.Int, contentId)
      .input('Rating', sql.Int, rating)
      .input('Comment', sql.NVarChar(sql.MAX), comment)
      .input('ReviewDate', sql.Date, new Date())
      .query(`
        INSERT INTO Reviews (UserID, ContentID, Rating, Comment, ReviewDate)
        VALUES (@UserID, @ContentID, @Rating, @Comment, @ReviewDate)
      `);
  }

  // No need to update any content table here!
}

module.exports = { submitOrUpdateReview };




