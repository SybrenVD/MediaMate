const { poolPromise } = require("../config/db");
const { truncateDescription } = require("./truncate");

async function getBestRated() {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT TOP 10
        C.ContentID,
        B.BookID, B.Title AS BookTitle, B.Description AS BookDesc, B.Image AS BookImage, B.Rating AS Rating,
        NULL AS MovieID, NULL AS MovieTitle, NULL AS MovieDesc, NULL AS MovieImage, NULL AS MovieRating,
        NULL AS GameID, NULL AS GameTitle, NULL AS GameDesc, NULL AS GameImage, NULL AS GameRating
      FROM Content C
      INNER JOIN Books B ON C.BookID = B.BookID
      WHERE B.Rating IS NOT NULL
      UNION ALL
      SELECT 
        C.ContentID,
        NULL AS BookID, NULL AS BookTitle, NULL AS BookDesc, NULL AS BookImage, NULL AS BookRating,
        M.MovieID, M.Title AS MovieTitle, M.Description AS MovieDesc, M.Image AS MovieImage, M.Rating AS Rating,
        NULL AS GameID, NULL AS GameTitle, NULL AS GameDesc, NULL AS GameImage, NULL AS GameRating
      FROM Content C
      INNER JOIN Movies M ON C.MovieID = M.MovieID
      WHERE M.Rating IS NOT NULL
      UNION ALL
      SELECT 
        C.ContentID,
        NULL AS BookID, NULL AS BookTitle, NULL AS BookDesc, NULL AS BookImage, NULL AS BookRating,
        NULL AS MovieID, NULL AS MovieTitle, NULL AS MovieDesc, NULL AS MovieImage, NULL AS MovieRating,
        G.GameID, G.Title AS GameTitle, G.Description AS GameDesc, G.Image AS GameImage, G.Rating AS Rating
      FROM Content C
      INNER JOIN Games G ON C.GameID = G.GameID
      WHERE G.Rating IS NOT NULL
      ORDER BY Rating DESC, ContentID DESC
    `);

    const items = result.recordset.map(row => {
      let type = '';
      let title = '';
      let description = '';
      let fullDescription = '';
      let image = '';
      let rating = 0;

      if (row.BookID) {
        type = 'books';
        title = row.BookTitle;
        description = truncateDescription(row.BookDesc);
        fullDescription = row.BookDesc || '';
        image = row.BookImage;
        rating = row.BookRating || 0;
      } else if (row.MovieID) {
        type = 'movies';
        title = row.MovieTitle;
        description = truncateDescription(row.MovieDesc);
        fullDescription = row.MovieDesc || '';
        image = row.MovieImage;
        rating = row.MovieRating || 0;
      } else if (row.GameID) {
        type = 'games';
        title = row.GameTitle;
        description = truncateDescription(row.GameDesc);
        fullDescription = row.GameDesc || '';
        image = row.GameImage;
        rating = row.GameRating || 0;
      }

      return {
        id: row.ContentID,
        type,
        title,
        description, // Truncated for cards
        fullDescription, // Full for details
        img: image || '/images/placeholder.jpg',
        rating
      };
    });

    console.log('getBestRated items:', items); // Debug log
    return items;
  } catch (error) {
    console.error('Error in getBestRated:', error);
    throw error;
  }
}


async function getRandomBooks() {
  const pool = await poolPromise;

  const result = await pool.request().query(`
    SELECT TOP 10
      C.ContentID,
      B.BookID, 
      B.Title AS BookTitle, 
      B.Description AS BookDesc, 
      B.Image AS BookImage
    FROM Content C
    INNER JOIN Books B ON C.BookID = B.BookID
    ORDER BY NEWID()
  `);

  const items = result.recordset.map(row => ({
    id: row.ContentID,
    type: 'books',
    title: row.BookTitle,
    description: truncateDescription(row.BookDesc),
    img: row.BookImage || '/images/placeholder.jpg'
  }));

  return items;
}


async function getRandomMovies() {
  const pool = await poolPromise;

  const result = await pool.request().query(`
    SELECT TOP 10
      C.ContentID,
      M.MovieID, 
      M.Title AS MovieTitle, 
      M.Description AS MovieDesc, 
      M.Image AS MovieImage
    FROM Content C
    INNER JOIN Movies M ON C.MovieID = M.MovieID
    ORDER BY NEWID()
  `);

  const items = result.recordset.map(row => ({
    id: row.ContentID,
    type: 'movies',
    title: row.MovieTitle,
    description: truncateDescription(row.MovieDesc),
    img: row.MovieImage || '/images/placeholder.jpg'
  }));

  return items;
}


async function getRandomGames() {
  const pool = await poolPromise;

  const result = await pool.request().query(`
    SELECT TOP 10
      C.ContentID,
      G.GameID, 
      G.Title AS GameTitle, 
      G.Description AS GameDesc, 
      G.Image AS GameImage
    FROM Content C
    INNER JOIN Games G ON C.GameID = G.GameID
    ORDER BY NEWID()
  `);

  const items = result.recordset.map(row => ({
    id: row.ContentID,
    type: 'games',
    title: row.GameTitle,
    description: truncateDescription(row.GameDesc),
    img: row.GameImage || '/images/placeholder.jpg'
  }));

  return items;
}


module.exports = {
  getBestRated,
  getRandomBooks,
  getRandomMovies,
  getRandomGames
};
