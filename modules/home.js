const { poolPromise } = require("../config/db");

async function getHomePageContent() {
  const pool = await poolPromise;

  const result = await pool.request().query(`
    SELECT 
      C.ContentID,
      B.BookID, B.Title AS BookTitle, B.Description AS BookDesc,
      M.MovieID, M.Title AS MovieTitle, M.Description AS MovieDesc,
      G.GameID, G.Title AS GameTitle, G.Description AS GameDesc
    FROM Content C
    LEFT JOIN Books B ON C.BookID = B.BookID
    LEFT JOIN Movies M ON C.MovieID = M.MovieID
    LEFT JOIN Games G ON C.GameID = G.GameID
    ORDER BY C.ContentID DESC
  `);

  const items = result.recordset.map(row => {
    let type = '';
    let title = '';
    let description = '';

    if (row.BookID) {
      type = 'books';
      title = row.BookTitle;
      description = row.BookDesc;
    } else if (row.MovieID) {
      type = 'movies';
      title = row.MovieTitle;
      description = row.MovieDesc;
    } else if (row.GameID) {
      type = 'games';
      title = row.GameTitle;
      description = row.GameDesc;
    }

    return {
      id: row.ContentID,
      type,
      title,
      description,
      img: '/images/placeholder.jpg'
    };
  });

  return items;
}

module.exports = {
  getHomePageContent
};
