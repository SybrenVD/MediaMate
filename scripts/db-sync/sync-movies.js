require('dotenv').config();
const axios = require('axios');
const sql = require('mssql');

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

  // Movie genres to insert
  const movieGenres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
    'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery',
    'Romance', 'Science Fiction', 'TV Movie', 'Thriller', 'War', 'Western'
  ];

  // TMDb genre ID to name mapping (from https://api.themoviedb.org/3/genre/movie/list)
  const tmdbGenreMap = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Science Fiction',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western'
  };

  // Fetch TMDB configuration for image base URL
  const configResponse = await axios.get('https://api.themoviedb.org/3/configuration', {
    params: {
      api_key: 'c6fbfed994de21544500c97199ead40d'
    }
  });
  const imageBaseUrl = configResponse.data.images.secure_base_url;
  const imageSize = 'w500'; // Reasonable size for posters

  // Insert genres, respecting existing ones
  for (const genre of movieGenres) {
    await pool.request()
      .input('Name', sql.VarChar, genre)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM Genres WHERE Name = @Name)
        INSERT INTO Genres (Name) VALUES (@Name)
      `);
  }

  // Process movies for each genre
  for (const genre of movieGenres) {
    const genreIdResult = await pool.request()
      .input('Name', sql.VarChar, genre)
      .query('SELECT GenreID FROM Genres WHERE Name = @Name');
    const genreId = genreIdResult.recordset[0].GenreID;

    // TMDb API returns max 20 results per page, so fetch 2 pages to get ~40
    for (let page = 1; page <= 7; page += 1) {
      // Fetch two sub-pages of 20 to approximate 40
      for (let subPage = 1; subPage <= 2; subPage++) {
        const response = await axios.get('https://api.themoviedb.org/3/discover/movie', {
          params: {
            api_key: 'c6fbfed994de21544500c97199ead40d',
            language: 'en-EN',
            with_genres: Object.keys(tmdbGenreMap).find(key => tmdbGenreMap[key] === genre),
            page: (page - 1) * 2 + subPage // Adjust page number for sub-pages
          }
        });
        const movies = response.data.results || [];

        for (const movie of movies) {
          const title = movie.title || 'No title';
          // Ensure description is a string and truncate to 2000 characters
          let description = movie.overview || 'No description';
          description = typeof description === 'string' ? description : String(description);
          if (description.length > 2000) {
            console.log(`Truncating description for movie "${title}": Original length = ${description.length}`);
            description = description.substring(0, 2000);
          }

          // Validate and format releaseDate
          let releaseDate = movie.release_date || null;
          if (releaseDate) {
            // Handle various date formats
            if (/^\d{4}$/.test(releaseDate)) {
              releaseDate = `${releaseDate}-01-01`; // Year-only: 2023 -> 2023-01-01
            } else if (/^\d{4}-\d{2}$/.test(releaseDate)) {
              releaseDate = `${releaseDate}-01`; // Year-month: 2023-05 -> 2023-05-01
            } else if (!/^\d{4}-\d{2}-\d{2}$/.test(releaseDate)) {
              console.log(`Invalid date format for movie "${title}": ${releaseDate}, setting to NULL`);
              releaseDate = null; // Set to null for any other invalid format
            }
            // Additional validation to ensure date is valid
            if (releaseDate) {
              const dateObj = new Date(releaseDate);
              if (isNaN(dateObj.getTime()) || dateObj.getFullYear() < 1000 || dateObj.getFullYear() > 9999) {
                console.log(`Invalid date for movie "${title}": ${releaseDate}, setting to NULL`);
                releaseDate = null;
              }
            }
          }

          // Construct full image URL
          const imageUrl = movie.poster_path ? `${imageBaseUrl}${imageSize}${movie.poster_path}` : null;

          // Insert into Movies table with Image column
          const movieResult = await pool.request()
            .input('Title', sql.NVarChar, title) // Use NVarChar for Title
            .input('Description', sql.NVarChar, description) // Use NVarChar for Description
            .input('ReleaseDate', sql.Date, releaseDate)
            .input('Image', sql.NVarChar, imageUrl) // New Image column
            .input('AddedByUserID', sql.Int, addedByUserID)
            .query(`
              INSERT INTO Movies (Title, Description, ReleaseDate, Rating, Image, AddedByUserID)
              OUTPUT INSERTED.MovieID
              VALUES (@Title, @Description, @ReleaseDate, NULL, @Image, @AddedByUserID)
            `);
          
          const movieId = movieResult.recordset[0].MovieID;

          // Insert into Content table
          const contentResult = await pool.request()
            .input('MovieID', sql.Int, movieId)
            .query(`
              INSERT INTO Content (MovieID)
              OUTPUT INSERTED.ContentID
              VALUES (@MovieID)
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
        }
      }
    }
  }

  await pool.close();
}

main().catch(console.error);