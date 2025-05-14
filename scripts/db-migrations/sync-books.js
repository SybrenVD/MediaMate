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

  const genres = [
    "Art", "Biography", "Business", "Children", "Comics", "Computers",
    "Cooking", "Education", "Fiction", "Health", "History", "Horror",
    "Law", "Mathematics", "Medical", "Music", "Philosophy", "Poetry",
    "Psychology", "Religion", "Romance", "Science", "Science Fiction",
    "Self-Help", "Sports", "Technology", "Travel"
  ];

  for (const genre of genres) {
    await pool.request()
      .input('Name', sql.VarChar, genre)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM Genres WHERE Name = @Name)
        INSERT INTO Genres (Name) VALUES (@Name)
      `);
  }

  for (const genre of genres) {
    const genreIdResult = await pool.request()
      .input('Name', sql.VarChar, genre)
      .query('SELECT GenresID FROM Genres WHERE Name = @Name');
    const genreId = genreIdResult.recordset[0].GenresID;

    for (let page = 0; page < 5; page++) {
      const startIndex = page * 40;
      const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
        params: {
          q: `subject:${genre}`,
          maxResults: 40,
          startIndex: startIndex
        }
      });
      const books = response.data.items || [];
      for (const book of books) {
        const title = book.volumeInfo.title || 'No title';
        const description = book.volumeInfo.description || 'No description';
        const releaseDate = book.volumeInfo.publishedDate || null;

        await pool.request()
          .input('Title', sql.VarChar, title)
          .input('ContentType', sql.VarChar, 'Book')
          .input('Description', sql.VarChar, description)
          .input('ReleaseDate', sql.Date, releaseDate)
          .input('addedByUserID', sql.Int, 1)
          .input('GenresID', sql.Int, genreId)
          .query(`
            INSERT INTO Content (Title, ContentType, Description, ReleaseDate, Rating, addedByUserID, GenresID)
            VALUES (@Title, @ContentType, @Description, @ReleaseDate, NULL, @addedByUserID, @GenresID)
          `);
      }
    }
  }

  await pool.close();
}

main().catch(console.error);