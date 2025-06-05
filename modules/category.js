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
        T.ReleaseDate
      FROM ${config.table} T
      INNER JOIN Content C ON C.${config.idColumn} = T.${config.idColumn}
      ORDER BY T.ReleaseDate DESC
    `;
    const result = await pool.request().query(query);
    console.log(`Category items: ${JSON.stringify(result.recordset.slice(0, 2))}`);

    return result.recordset.map(item => ({
      id: item.id,
      name: truncateTitle(item.name),
      description: truncateDescription(item.Description),
      image: item.Image,
      releaseDate: item.ReleaseDate ? new Date(item.ReleaseDate).toDateString() : null
    }));
  } catch (err) {
    console.error(`Error fetching category content: ${err.message}`);
    return [];
  }
}

module.exports = { getCategoryContent };