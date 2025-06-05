const { poolPromise } = require('../config/db');
const { truncateDescription } = require('./truncate');
const { truncateTitle } = require('./truncateTitle');

async function getCategoryContent(type) {
  const validTables = {
    games: 'Games',
    books: 'Books',
    movies: 'Movies',
  };

  const table = validTables[type.toLowerCase()];
  if (!table) return null;

  const idColumn = table.slice(0, -1) + 'ID'; // e.g. Games -> GameID

  try {
    const pool = await poolPromise;

    const query = `
      SELECT TOP 20 
        ${idColumn} AS id, 
        Title, 
        Description, 
        ISNULL(Image, '/images/placeholder.jpg') AS Image, 
        ReleaseDate 
      FROM ${table} 
      ORDER BY ${idColumn} DESC`;

    const result = await pool.request().query(query);

    return result.recordset.map(item => ({
      id: item.id,
      name: truncateTitle(item.Title),          // truncate title here
      description: truncateDescription(item.Description), // truncate description here
      image: item.Image,
      releaseDate: item.ReleaseDate,
    }));
  } catch (err) {
    console.error('Error fetching category content:', err);
    return null;
  }
}

module.exports = { getCategoryContent };








