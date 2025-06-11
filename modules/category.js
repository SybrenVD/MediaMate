const { sql, poolPromise } = require('../config/db');
const { truncateDescription } = require('./truncate');
const { truncateTitle } = require('./truncateTitle');

async function getCategoryContent(type, page = 1, pageSize = 20) {
  const validTables = {
    games: { table: 'Games', idColumn: 'GameID' },
    books: { table: 'Books', idColumn: 'BookID' },
    movies: { table: 'Movies', idColumn: 'MovieID' }
  };

  const config = validTables[type.toLowerCase()];
  if (!config) {
    console.error(`Invalid type: ${type}`);
    return { searchResults: [], currentPage: page, totalPages: 0, totalCount: 0 };
  }

  try {
    const pool = await poolPromise;
    const offset = (page - 1) * pageSize;
    const query = `
      SELECT 
        C.ContentID AS id,
        T.Title AS name,
        T.Description,
        ISNULL(T.Image, '/images/placeholder.jpg') AS Image,
        T.ReleaseDate,
        T.Rating,
        STRING_AGG(G.Name, ', ') AS Genres,
        '${type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}' AS ContentType,
        (SELECT COUNT(*) FROM ${config.table} T2 INNER JOIN Content C2 ON C2.${config.idColumn} = T2.${config.idColumn}) AS TotalCount
      FROM ${config.table} T
      INNER JOIN Content C ON C.${config.idColumn} = T.${config.idColumn}
      LEFT JOIN Content_Genre CG ON C.ContentID = CG.ContentID
      LEFT JOIN Genres G ON CG.GenreID = G.GenreID
      GROUP BY C.ContentID, T.Title, T.Description, T.Image, T.ReleaseDate, T.Rating
      ORDER BY T.ReleaseDate DESC
      OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY
    `;
    const result = await pool.request().query(query);

    const searchResults = result.recordset.map(item => ({
      id: item.id,
      ItemID: item.id,
      ContentType: item.ContentType,
      type: type.toLowerCase(),
      name: truncateTitle(item.name),
      description: truncateDescription(item.Description),
      image: item.Image,
      releaseDate: item.ReleaseDate ? new Date(item.ReleaseDate).toDateString() : null,
      rating: item.Rating || 0,
      Genres: item.Genres || ''
    }));

    const totalCount = result.recordset.length > 0 ? result.recordset[0].TotalCount : 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    const returnValue = { searchResults, currentPage: page, totalPages, totalCount };
    return returnValue;
  } catch (err) {
    console.error(`Error fetching category content: ${err.message}`);
    return { searchResults: [], currentPage: page, totalPages: 0, totalCount: 0 };
  }
}

module.exports = { getCategoryContent };