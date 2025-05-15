const { sql, poolPromise } = require('../config/db');

const getGames = async (genre = null, limit = 10, offset = 0) => {
  try {
    const pool = await poolPromise;
    let query = `
      SELECT g.GameID, g.Title, g.Description, g.ReleaseDate, g.Rating, 
             STRING_AGG(gen.Name, ', ') AS Genres
      FROM Games g
      JOIN Content c ON g.GameID = c.GameID
      JOIN Content_Genre cg ON c.ContentID = cg.ContentID
      JOIN Genres gen ON cg.GenreID = gen.GenreID
    `;
    if (genre) query += ` WHERE gen.Name = @genre`;
    query += `
      GROUP BY g.GameID, g.Title, g.Description, g.ReleaseDate, g.Rating
      ORDER BY g.GameID
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;
    const request = pool.request()
      .input('limit', sql.Int, limit)
      .input('offset', sql.Int, offset);
    if (genre) request.input('genre', sql.NVarChar, genre);
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error('Error fetching games:', err);
    throw err;
  }
};

const getGameById = async (gameId) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('gameId', sql.Int, gameId)
      .query(`
        SELECT g.GameID, g.Title, g.Description, g.ReleaseDate, g.Rating,
               STRING_AGG(gen.Name, ', ') AS Genres
        FROM Games g
        JOIN Content c ON g.GameID = c.GameID
        JOIN Content_Genre cg ON c.ContentID = cg.ContentID
        JOIN Genres gen ON cg.GenreID = gen.GenreID
        WHERE g.GameID = @gameId
        GROUP BY g.GameID, g.Title, g.Description, g.ReleaseDate, g.Rating
      `);
    return result.recordset[0] || null;
  } catch (err) {
    console.error('Error fetching game by ID:', err);
    throw err;
  }
};

const getGenres = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT GenreID, Name FROM Genres ORDER BY Name
    `);
    return result.recordset;
  } catch (err) {
    console.error('Error fetching genres:', err);
    throw err;
  }
};

module.exports = { getGames, getGameById, getGenres };