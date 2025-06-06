const { sql, poolPromise } = require('../config/db');

async function getCommunities(searchQuery = '') {
  console.log(`getCommunities: searchQuery=${searchQuery}`);
  try {
    const pool = await poolPromise;
    let query = `
      SELECT 
        RoomID,
        ChatName,
        Keywords,
        Image,
        CreatorID
      FROM Communities
    `;
    const params = {};
    let searchResults = [];

    if (searchQuery.trim()) {
      const keywords = searchQuery.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
      if (keywords.length > 0) {
        // Build LIKE conditions for Keywords and ChatName
        const keywordConditions = keywords.map((_, i) => `LOWER(Keywords) LIKE @keyword${i}`).join(' OR ');
        const chatNameConditions = keywords.map((_, i) => `LOWER(ChatName) LIKE @keyword${i}`).join(' OR ');
        
        query += `
          WHERE (${keywordConditions}) OR (${chatNameConditions})
          ORDER BY 
            (
              ${keywords.map((_, i) => `CASE WHEN LOWER(Keywords) LIKE @keyword${i} THEN 1 ELSE 0 END`).join(' + ')}
            ) DESC,
            (
              ${keywords.map((_, i) => `CASE WHEN LOWER(ChatName) LIKE @keyword${i} THEN 1 ELSE 0 END`).join(' + ')}
            ) DESC
        `;

        // Add parameters for each keyword
        keywords.forEach((keyword, i) => {
          params[`keyword${i}`] = `%${keyword}%`;
        });
      }
    } else {
      query += ` ORDER BY ChatName ASC`;
    }

    const request = pool.request();
    for (const [key, value] of Object.entries(params)) {
      request.input(key, sql.NVarChar, value);
    }

    const result = await request.query(query);
    console.log(`Found ${result.recordset.length} communities`);

    searchResults = result.recordset.map(item => ({
      RoomID: item.RoomID,
      ChatName: item.ChatName,
      Keywords: item.Keywords || '',
      Image: item.Image,
      CreatorID: item.CreatorID
    }));

    return { searchResults };
  } catch (err) {
    console.error(`Error fetching communities: ${err.message}`);
    return { searchResults: [] };
  }
}

module.exports = { getCommunities };