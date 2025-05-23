const { sql, poolPromise } = require('../config/db');

async function setRandomRatings() {
  try {
    const pool = await poolPromise;

    // Select 10 random items across Books, Movies, and Games
    const result = await pool.request().query(`
      SELECT TOP 10
        C.ContentID,
        CASE 
          WHEN B.BookID IS NOT NULL THEN 'Books'
          WHEN M.MovieID IS NOT NULL THEN 'Movies'
          WHEN G.GameID IS NOT NULL THEN 'Games'
        END AS ContentType,
        COALESCE(B.BookID, M.MovieID, G.GameID) AS ItemID
      FROM Content C
      LEFT JOIN Books B ON C.BookID = B.BookID
      LEFT JOIN Movies M ON C.MovieID = M.MovieID
      LEFT JOIN Games G ON C.GameID = G.GameID
      WHERE B.BookID IS NOT NULL OR M.MovieID IS NOT NULL OR G.GameID IS NOT NULL
      ORDER BY NEWID()
    `);

    const items = result.recordset;
    console.log('Selected items:', items);

    if (items.length === 0) {
      console.log('No items found to update.');
      return;
    }

    // Update ratings for each selected item
    for (const item of items) {
      const { ContentType, ItemID } = item;
      const table = ContentType;
      const idColumn = ContentType.slice(0, -1) + 'ID';
      await pool.request()
        .input('ItemID', sql.Int, ItemID)
        .query(`UPDATE ${table} SET Rating = 1 WHERE ${idColumn} = @ItemID`);
      console.log(`Updated ${ContentType} ID ${ItemID} to Rating = 1`);
    }

    console.log('Successfully updated 10 random items.');
  } catch (error) {
    console.error('Error in setRandomRatings:', error);
    throw error;
  }
}

// Run the script
setRandomRatings().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});