const { poolPromise } = require('../config/db');

async function getCategoryContent(type) {
  const validTypes = {
    games: 'Games',
    books: 'Books',
    movies: 'Movies',
  };

  const table = validTypes[type.toLowerCase()];
  if (!table) return null;

  try {
    const pool = await poolPromise;
    const result = await pool.request().query(
      `SELECT ${table}ID as id, Title, Description, Image, ReleaseDate FROM ${table} ORDER BY ${table}ID LIMIT 20`
    );

    if (!result.recordset.length) return [];

    return result.recordset.map(item => ({
      id: item.id,
      name: item.Title,
      description: item.Description,
      image: item.Image || '/images/placeholder.jpg',
      releaseDate: item.ReleaseDate,
    }));
  } catch (error) {
    console.error('DB error:', error);
    return null;
  }
}

module.exports = { getCategoryContent };





