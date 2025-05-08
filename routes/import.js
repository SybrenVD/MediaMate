const express = require('express');
const router = express.Router();
const sql = require('mssql');
const axios = require('axios');

// Database configuration from .env file
const dbConfig = {
    server: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    }
  };

// Test database connection as an async function
async function testDbConnection() {
  try {
    await sql.connect(dbConfig);
    console.log('Succes: Verbonden met de database!');
  } catch (err) {
    console.error('Fout bij verbinden met de database:', err);
  }
}

// Fetch popular movies and genres from TMDB and insert them into the database
router.get('/movies', async (req, res) => {
  try {
    // Fetch genres from TMDB
    const genresResponse = await axios.get('https://api.themoviedb.org/3/genre/movie/list', {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: 'en-US' // English language
      }
    });

    const genres = genresResponse.data.genres;

    // Establish connection to the database
    await sql.connect(dbConfig);

    // Insert genres into the Genres table
    for (const genre of genres) {
      const request = new sql.Request();
      request.input('GenreID', sql.Int, genre.id);
      request.input('Name', sql.VarChar(20), genre.name);

      await request.query(`
        IF NOT EXISTS (SELECT 1 FROM Genres WHERE GenreID = @GenreID)
        BEGIN
          INSERT INTO Genres (GenreID, Name)
          VALUES (@GenreID, @Name)
        END
      `);
    }

    // Fetch popular movies from the TMDB API
    const moviesResponse = await axios.get('https://api.themoviedb.org/3/movie/popular', {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: 'en-US' // English language
      }
    });

    const movies = moviesResponse.data.results;

    // Loop through all the movies and insert them into the Content table
    for (const movie of movies) {
      const movieRequest = new sql.Request();

      // Insert movie data into the Content table
      movieRequest.input('ContentID', sql.Int, movie.id);
      movieRequest.input('Title', sql.VarChar(255), movie.title);
      movieRequest.input('ContentType', sql.VarChar(10), 'Movie'); // ContentType = 'Movie'
      movieRequest.input('Description', sql.VarChar(300), movie.overview || '');
      movieRequest.input('ReleaseDate', sql.Date, movie.release_date ? movie.release_date : null);
      movieRequest.input('Rating', sql.Decimal(2, 1), movie.vote_average || 0);
      movieRequest.input('addedByUserID', sql.Int, 1); // Test user, change to real user if needed

      // SQL query to check if the movie already exists, if not, insert it
      await movieRequest.query(`
        IF NOT EXISTS (SELECT 1 FROM Content WHERE ContentID = @ContentID)
        BEGIN
          INSERT INTO Content (ContentID, Title, ContentType, Description, ReleaseDate, Rating, addedByUserID)
          VALUES (@ContentID, @Title, @ContentType, @Description, @ReleaseDate, @Rating, @addedByUserID)
        END
      `);

      // Insert genres for the movie into the Content_Genre table
      const contentGenres = movie.genre_ids; // TMDB provides a list of genre IDs for each movie
      for (const genreID of contentGenres) {
        const contentGenreRequest = new sql.Request();
        contentGenreRequest.input('ContentID', sql.Int, movie.id);
        contentGenreRequest.input('GenreID', sql.Int, genreID);

        await contentGenreRequest.query(`
          IF NOT EXISTS (SELECT 1 FROM Content_Genre WHERE ContentID = @ContentID AND GenreID = @GenreID)
          BEGIN
            INSERT INTO Content_Genre (ContentID, GenreID)
            VALUES (@ContentID, @GenreID)
          END
        `);
      }
    }

    res.status(200).json({ message: '✅ Movies and genres have been successfully added to the Content and Genres tables.' });

  } catch (err) {
    console.error('❌ Error during import:', err);
    res.status(500).json({ error: 'Import failed.' });
  } finally {
    sql.close(); // Always close the connection to keep it clean
  }
});

// Calling the test database connection function
testDbConnection();

module.exports = router;