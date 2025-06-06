const { sql, poolPromise } = require('../config/db');
const { truncateDescription } = require('./truncate');
const { truncateTitle } = require('./truncateTitle');

async function getCategoryContent(type) {
  console.log(`getCategoryContent: type=${type}`);
  const validTables = {
    games: { table: 'Games', idColumn: 'GameID' },
    books: { table: 'Books', idColumn: 'BookID' },
    movies: { table: 'Movies', idColumn: 'MovieID' }
  };

  const config = validTables[type.toLowerCase()];
  if (!config) {
    console.error(`Invalid type: ${type}`);
    return [];
  }

  try {
    const pool = await poolPromise;
    const query = `
      SELECT TOP 20 
        C.ContentID AS id,
        T.Title AS name,
        T.Description,
        ISNULL(T.Image, '/images/placeholder.jpg') AS Image,
        T.ReleaseDate,
        T.Rating,
        STRING_AGG(G.Name, ', ') AS Genres,
        '${type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}' AS ContentType
      FROM ${config.table} T
      INNER JOIN Content C ON C.${config.idColumn} = T.${config.idColumn}
      LEFT JOIN Content_Genre CG ON C.ContentID = CG.ContentID
      LEFT JOIN Genres G ON CG.GenreID = G.GenreID
      GROUP BY C.ContentID, T.Title, T.Description, T.Image, T.ReleaseDate, T.Rating
      ORDER BY T.ReleaseDate DESC
    `;
    const result = await pool.request().query(query);
    console.log(`Category items: ${JSON.stringify(result.recordset.slice(0, 2))}`);

    return result.recordset.map(item => ({
      id: item.id,
      name: truncateTitle(item.name),
      description: truncateDescription(item.Description),
      image: item.Image,
      releaseDate: item.ReleaseDate ? new Date(item.ReleaseDate).toDateString() : null,
      type: type.toLowerCase(),
      ContentType: item.ContentType,
      rating: item.Rating || 0,
      Genres: item.Genres || ''
    }));
  } catch (err) {
    console.error(`Error fetching category content: ${err.message}`);
    return [];
  }
}

module.exports = { getCategoryContent };