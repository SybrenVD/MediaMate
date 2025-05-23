require('dotenv').config();
const axios = require('axios');
const sql = require('mssql');
const { poolPromise } = require('../config/db'); // Adjust path to your config file
const striptags = require('striptags');

async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url);
      return response;
    } catch (error) {
      if (error.response && (error.response.status === 429 || error.response.status === 502 || error.response.status === 503)) {
        if (attempt === retries) {
          throw new Error(`Failed after ${retries} attempts: ${error.message}`);
        }
        console.log(`Attempt ${attempt} failed with status ${error.response.status}. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

async function updateGameDescriptions() {
  try {
    const pool = await poolPromise;
    console.log('Fetching games from database...');

    // Get all games from the Games table
    const result = await pool.request().query(`
      SELECT GameID, Title
      FROM Games
      WHERE Description IS NULL OR Description = 'No description'
    `);
    const games = result.recordset;
    console.log(`Found ${games.length} games needing description updates.`);

    // Process games in batches to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < games.length; i += batchSize) {
      const batch = games.slice(i, i + batchSize);
      console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(games.length / batchSize)}...`);

      // Process each game in the batch
      for (const game of batch) {
        try {
          // Construct the API URL using the game title as the slug
          // Replace spaces with hyphens and remove special characters for the slug
          const slug = game.Title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');
          const url = `https://api.rawg.io/api/games/${slug}?key=f161c5ceeac2444a950ccf2fe1cdebb4`;

          // Fetch game details from RAWG API
          await new Promise(resolve => setTimeout(resolve, 200)); // Rate limit delay
          const response = await fetchWithRetry(url);
          const gameData = response.data;

          // Get and clean the description
          let description = gameData.description_raw || gameData.description || 'No description';
          description = typeof description === 'string' ? description : String(description);

          // Strip HTML tags
          description = striptags(description);

          // Truncate to 2000 characters (per database schema)
          if (description.length > 2000) {
            console.log(`Truncating description for game "${game.Title}": Original length = ${description.length}`);
            description = description.substring(0, 2000);
          }

          // Update the Games table
          await pool.request()
            .input('GameID', sql.Int, game.GameID)
            .input('Description', sql.NVarChar, description)
            .query(`
              UPDATE Games
              SET Description = @Description
              WHERE GameID = @GameID
            `);

          console.log(`Updated description for game "${game.Title}" (ID: ${game.GameID})`);

        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log(`Game "${game.Title}" (ID: ${game.GameID}) not found in RAWG API. Skipping.`);
          } else {
            console.error(`Error processing game "${game.Title}" (ID: ${game.GameID}):`, error.message);
          }
        }
      }
    }

    console.log('Description update process completed.');
  } catch (error) {
    console.error('Error in updateGameDescriptions:', error.message);
    process.exit(1);
  } finally {
    // Close the database connection
    sql.close();
  }
}

updateGameDescriptions().catch(console.error);