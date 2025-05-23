require('dotenv').config();
const axios = require('axios');
const sql = require('mssql');
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

async function main() {
  const config = {
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    database: process.env.DB_DATABASE,
    options: {
      encrypt: true,
      trustServerCertificate: true
    }
  };

  const pool = await sql.connect(config);

  // Ensure a default user exists
  const userResult = await pool.request()
    .input('Username', sql.VarChar, 'Admin')
    .input('Email', sql.VarChar, null)
    .input('PasswordHash', sql.VarChar, 'Tp:r7576jX')
    .input('UserType', sql.VarChar, 'Admin')
    .query(`
      IF NOT EXISTS (SELECT 1 FROM Users WHERE Username = @Username)
      INSERT INTO Users (Username, Email, PasswordHash, UserType)
      OUTPUT INSERTED.UserID
      VALUES (@Username, @Email, @PasswordHash, @UserType)
    `);
  const addedByUserID = userResult.recordset && userResult.recordset.length > 0 ? userResult.recordset[0].UserID : 1;

  // Game genres to insert
  const gameGenres = [
    'Action', 'Adventure', 'RPG', 'Shooter', 'Strategy', 'Simulation',
    'Puzzle', 'Arcade', 'Platformer', 'Sports', 'Fighting', 'Racing',
    'Multiplayer', 'Battle Royale', 'MOBA', 'Survival', 'Open World',
    'Sandbox', 'Horror', 'Stealth', 'Visual Novel', 'Idle', 'Card Game',
    'Board Game', 'Trivia', 'Music', 'Educational'
  ];

  // RAWG genre name to slug mapping
  const rawgGenreMap = {
    'Action': 'action',
    'Adventure': 'adventure',
    'RPG': 'role-playing-games-rpg',
    'Shooter': 'shooter',
    'Strategy': 'strategy',
    'Simulation': 'simulation',
    'Puzzle': 'puzzle',
    'Arcade': 'arcade',
    'Platformer': 'platformer',
    'Sports': 'sports',
    'Fighting': 'fighting',
    'Racing': 'racing',
    'Multiplayer': 'massively-multiplayer',
    'Battle Royale': 'battle-royale',
    'MOBA': 'moba',
    'Survival': 'survival',
    'Open World': 'open-world',
    'Sandbox': 'sandbox',
    'Horror': 'horror',
    'Stealth': 'stealth',
    'Visual Novel': 'visual-novel',
    'Idle': 'indie',
    'Card Game': 'card',
    'Board Game': 'board-games',
    'Trivia': 'educational',
    'Music': 'music',
    'Educational': 'educational'
  };

  // Insert genres, respecting existing ones
  for (const genre of gameGenres) {
    await pool.request()
      .input('Name', sql.VarChar, genre)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM Genres WHERE Name = @Name)
        INSERT INTO Genres (Name) VALUES (@Name)
      `);
  }

  // Track inserted games and shortfalls
  const gamesPerGenre = {};
  let totalGamesInserted = 0;
  const targetGamesPerGenre = 200; // 5 pages * 40 games
  const targetTotalGames = gameGenres.length * targetGamesPerGenre; // 27 * 200 = 5400

  // Process games for each genre (initial pass)
  for (const genre of gameGenres) {
    const genreIdResult = await pool.request()
      .input('Name', sql.VarChar, genre)
      .query('SELECT GenreID FROM Genres WHERE Name = @Name');
    const genreId = genreIdResult.recordset[0].GenreID;

    let gamesInsertedForGenre = 0;

    for (let page = 1; page <= 5; page++) {
      try {
        // Add delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 200));

        const response = await fetchWithRetry('https://api.rawg.io/api/games', {
          key: 'f161c5ceeac2444a950ccf2fe1cdebb4',
          genres: rawgGenreMap[genre].includes('battle-royale') || rawgGenreMap[genre].includes('moba') || rawgGenreMap[genre].includes('open-world') || rawgGenreMap[genre].includes('horror') || rawgGenreMap[genre].includes('visual-novel') || rawgGenreMap[genre].includes('music') || rawgGenreMap[genre].includes('survival') || rawgGenreMap[genre].includes('sandbox') || rawgGenreMap[genre].includes('stealth') ? undefined : rawgGenreMap[genre],
          tags: rawgGenreMap[genre].includes('battle-royale') || rawgGenreMap[genre].includes('moba') || rawgGenreMap[genre].includes('open-world') || rawgGenreMap[genre].includes('horror') || rawgGenreMap[genre].includes('visual-novel') || rawgGenreMap[genre].includes('music') || rawgGenreMap[genre].includes('survival') || rawgGenreMap[genre].includes('sandbox') || rawgGenreMap[genre].includes('stealth') ? rawgGenreMap[genre] : undefined,
          page: page,
          page_size: 40
        });
        const games = response.data.results || [];

        if (games.length === 0) {
          console.log(`No games found for genre "${genre}" on page ${page}.`);
          break;
        }

        for (const game of games) {
          const title = game.name || 'No title';

          // Fetch detailed game data for description
          let description = 'No description';
          try {
            const slug = title.toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .trim()
              .replace(/\s+/g, '-');
            const detailUrl = `https://api.rawg.io/api/games/${slug}?key=f161c5ceeac2444a950ccf2fe1cdebb4`;
            await new Promise(resolve => setTimeout(resolve, 200)); // Rate limit delay
            const detailResponse = await fetchWithRetry(detailUrl);
            const gameData = detailResponse.data;

            description = gameData.description_raw || gameData.description || 'No description';
            description = typeof description === 'string' ? description : String(description);
            // Strip HTML tags
            description = striptags(description);
            // Truncate to 2000 characters
            if (description.length > 2000) {
              console.log(`Truncating description for game "${title}": Original length = ${description.length}`);
              description = description.substring(0, 2000);
            }
          } catch (error) {
            if (error.response && error.response.status === 404) {
              console.log(`Detailed data not found for game "${title}". Using default description.`);
            } else {
              console.error(`Error fetching detailed data for game "${title}":`, error.message);
            }
          }

          // Validate and format releaseDate
          let releaseDate = game.released || null;
          if (releaseDate) {
            if (/^\d{4}$/.test(releaseDate)) {
              releaseDate = `${releaseDate}-01-01`;
            } else if (/^\d{4}-\d{2}$/.test(releaseDate)) {
              releaseDate = `${releaseDate}-01`;
            } else if (!/^\d{4}-\d{2}-\d{2}$/.test(releaseDate)) {
              console.log(`Invalid date format for game "${title}": ${releaseDate}, setting to NULL`);
              releaseDate = null;
            }
            if (releaseDate) {
              const dateObj = new Date(releaseDate);
              if (isNaN(dateObj.getTime()) || dateObj.getFullYear() < 1000 || dateObj.getFullYear() > 9999) {
                console.log(`Invalid date for game "${title}": ${releaseDate}, setting to NULL`);
                releaseDate = null;
              }
            }
          }

          // Get full image URL from background_image
          const imageUrl = game.background_image || null;

          // Insert into Games table with Image and Description
          const gameResult = await pool.request()
            .input('Title', sql.NVarChar, title)
            .input('Description', sql.NVarChar, description)
            .input('ReleaseDate', sql.Date, releaseDate)
            .input('Image', sql.NVarChar, imageUrl)
            .input('AddedByUserID', sql.Int, addedByUserID)
            .query(`
              INSERT INTO Games (Title, Description, ReleaseDate, Rating, Image, AddedByUserID)
              OUTPUT INSERTED.GameID
              VALUES (@Title, @Description, @ReleaseDate, NULL, @Image, @AddedByUserID)
            `);
          
          const gameId = gameResult.recordset[0].GameID;

          // Insert into Content table
          const contentResult = await pool.request()
            .input('GameID', sql.Int, gameId)
            .query(`
              INSERT INTO Content (GameID)
              OUTPUT INSERTED.ContentID
              VALUES (@GameID)
            `);
          
          const contentId = contentResult.recordset[0].ContentID;

          // Link to genre in Content_Genre table
          await pool.request()
            .input('GenreID', sql.Int, genreId)
            .input('ContentID', sql.Int, contentId)
            .query(`
              INSERT INTO Content_Genre (GenreID, ContentID)
              VALUES (@GenreID, @ContentID)
            `);

          gamesInsertedForGenre++;
          totalGamesInserted++;
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log(`No more games found for genre "${genre}" on page ${page}.`);
          break;
        }
        console.error(`Error fetching games for genre "${genre}" on page ${page}:`, error.message);
        break;
      }
    }

    gamesPerGenre[genre] = gamesInsertedForGenre;
    if (gamesInsertedForGenre < targetGamesPerGenre) {
      console.log(`Genre "${genre}" yielded ${gamesInsertedForGenre} games, shortfall of ${targetGamesPerGenre - gamesInsertedForGenre}.`);
    }
  }

  // Compensate for shortfalls
  const shortfall = targetTotalGames - totalGamesInserted;
  if (shortfall > 0) {
    console.log(`Total games inserted: ${totalGamesInserted}, shortfall: ${shortfall}. Fetching additional games.`);

    // Prioritize high-yield genres
    const highYieldGenres = ['Action', 'Adventure', 'RPG', 'Shooter'];
    let remainingShortfall = shortfall;

    for (const genre of highYieldGenres) {
      if (remainingShortfall <= 0) break;

      const genreIdResult = await pool.request()
        .input('Name', sql.VarChar, genre)
        .query('SELECT GenreID FROM Genres WHERE Name = @Name');
      const genreId = genreIdResult.recordset[0].GenreID;

      let page = 6;
      while (remainingShortfall > 0) {
        try {
          await new Promise(resolve => setTimeout(resolve, 200));

          const response = await fetchWithRetry('https://api.rawg.io/api/games', {
            key: 'f161c5ceeac2444a950ccf2fe1cdebb4',
            genres: rawgGenreMap[genre].includes('battle-royale') || rawgGenreMap[genre].includes('moba') || rawgGenreMap[genre].includes('open-world') || rawgGenreMap[genre].includes('horror') || rawgGenreMap[genre].includes('visual-novel') || rawgGenreMap[genre].includes('music') || rawgGenreMap[genre].includes('survival') || rawgGenreMap[genre].includes('sandbox') || rawgGenreMap[genre].includes('stealth') ? undefined : rawgGenreMap[genre],
            tags: rawgGenreMap[genre].includes('battle-royale') || rawgGenreMap[genre].includes('moba') || rawgGenreMap[genre].includes('open-world') || rawgGenreMap[genre].includes('horror') || rawgGenreMap[genre].includes('visual-novel') || rawgGenreMap[genre].includes('music') || rawgGenreMap[genre].includes('survival') || rawgGenreMap[genre].includes('sandbox') || rawgGenreMap[genre].includes('stealth') ? rawgGenreMap[genre] : undefined,
            page: page,
            page_size: 40
          });
          const games = response.data.results || [];

          if (games.length === 0) {
            console.log(`No more games found for genre "${genre}" on page ${page} for shortfall.`);
            break;
          }

          for (const game of games) {
            const title = game.name || 'No title';

            // Fetch detailed game data for description
            let description = 'No description';
            try {
              const slug = title.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-');
              const detailUrl = `https://api.rawg.io/api/games/${slug}?key=f161c5ceeac2444a950ccf2fe1cdebb4`;
              await new Promise(resolve => setTimeout(resolve, 200)); // Rate limit delay
              const detailResponse = await fetchWithRetry(detailUrl);
              const gameData = detailResponse.data;

              description = gameData.description_raw || gameData.description || 'No description';
              description = typeof description === 'string' ? description : String(description);
              // Strip HTML tags
              description = striptags(description);
              // Truncate to 2000 characters
              if (description.length > 2000) {
                console.log(`Truncating description for game "${title}": Original length = ${description.length}`);
                description = description.substring(0, 2000);
              }
            } catch (error) {
              if (error.response && error.response.status === 404) {
                console.log(`Detailed data not found for game "${title}". Using default description.`);
              } else {
                console.error(`Error fetching detailed data for game "${title}":`, error.message);
              }
            }

            // Validate and format releaseDate
            let releaseDate = game.released || null;
            if (releaseDate) {
              if (/^\d{4}$/.test(releaseDate)) {
                releaseDate = `${releaseDate}-01-01`;
              } else if (/^\d{4}-\d{2}$/.test(releaseDate)) {
                releaseDate = `${releaseDate}-01`;
              } else if (!/^\d{4}-\d{2}-\d{2}$/.test(releaseDate)) {
                console.log(`Invalid date format for game "${title}": ${releaseDate}, setting to NULL`);
                releaseDate = null;
              }
              if (releaseDate) {
                const dateObj = new Date(releaseDate);
                if (isNaN(dateObj.getTime()) || dateObj.getFullYear() < 1000 || dateObj.getFullYear() > 9999) {
                  console.log(`Invalid date for game "${title}": ${releaseDate}, setting to NULL`);
                  releaseDate = null;
                }
              }
            }

            // Get full image URL from background_image
            const imageUrl = game.background_image || null;

            // Insert into Games table with Image and Description
            const gameResult = await pool.request()
              .input('Title', sql.NVarChar, title)
              .input('Description', sql.NVarChar, description)
              .input('ReleaseDate', sql.Date, releaseDate)
              .input('Image', sql.NVarChar, imageUrl)
              .input('AddedByUserID', sql.Int, addedByUserID)
              .query(`
                INSERT INTO Games (Title, Description, ReleaseDate, Rating, Image, AddedByUserID)
                OUTPUT INSERTED.GameID
                VALUES (@Title, @Description, @ReleaseDate, NULL, @Image, @AddedByUserID)
              `);
            
            const gameId = gameResult.recordset[0].GameID;

            // Insert into Content table
            const contentResult = await pool.request()
              .input('GameID', sql.Int, gameId)
              .query(`
                INSERT INTO Content (GameID)
                OUTPUT INSERTED.ContentID
                VALUES (@GameID)
              `);
            
            const contentId = contentResult.recordset[0].ContentID;

            // Link to genre in Content_Genre table
            await pool.request()
              .input('GenreID', sql.Int, genreId)
              .input('ContentID', sql.Int, contentId)
              .query(`
                INSERT INTO Content_Genre (GenreID, ContentID)
                VALUES (@GenreID, @ContentID)
              `);

            totalGamesInserted++;
            remainingShortfall--;
            gamesPerGenre[genre] = (gamesPerGenre[genre] || 0) + 1;

            if (remainingShortfall <= 0) break;
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log(`No more games found for genre "${genre}" on page ${page} for shortfall.`);
            break;
          }
          console.error(`Error fetching shortfall games for genre "${genre}" on page ${page}:`, error.message);
          break;
        }
        page++;
      }
    }

    console.log(`After compensation, total games inserted: ${totalGamesInserted}, remaining shortfall: ${remainingShortfall}.`);
  }

  // Log final counts
  console.log('Games inserted per genre:', gamesPerGenre);
  console.log(`Total games inserted: ${totalGamesInserted}`);

  await pool.close();
}

main().catch(console.error);