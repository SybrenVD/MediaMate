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

  const genres = [
    "Art", "Biography", "Business", "Children", "Comics", "Computers",
    "Cooking", "Education", "Fiction", "Health", "History", "Horror",
    "Law", "Mathematics", "Medical", "Music", "Philosophy", "Poetry",
    "Psychology", "Religion", "Romance", "Science", "Science Fiction",
    "Self-Help", "Sports", "Technology", "Travel"
  ];

  // Insert genres
  for (const genre of genres) {
    await pool.request()
      .input('Name', sql.VarChar, genre)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM Genres WHERE Name = @Name)
        INSERT INTO Genres (Name) VALUES (@Name)
      `);
  }

  // Process books for each genre
  for (const genre of genres) {
    const genreIdResult = await pool.request()
      .input('Name', sql.VarChar, genre)
      .query('SELECT GenreID FROM Genres WHERE Name = @Name');
    const genreId = genreIdResult.recordset[0].GenreID;

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
        // Ensure description is a string and truncate to 2000 characters
        let description = book.volumeInfo.description || 'No description';
        description = typeof description === 'string' ? description : String(description);
        if (description.length > 2000) {
          console.log(`Truncating description for book "${title}": Original length = ${description.length}`);
          description = description.substring(0, 2000);
        }

        // Validate and format releaseDate
        let releaseDate = book.volumeInfo.publishedDate || null;
        if (releaseDate) {
          // Handle various date formats
          if (/^\d{4}$/.test(releaseDate)) {
            releaseDate = `${releaseDate}-01-01`; // Year-only: 2023 -> 2023-01-01
          } else if (/^\d{4}-\d{2}$/.test(releaseDate)) {
            releaseDate = `${releaseDate}-01`; // Year-month: 2023-05 -> 2023-05-01
          } else if (!/^\d{4}-\d{2}-\d{2}$/.test(releaseDate)) {
            console.log(`Invalid date format for book "${title}": ${releaseDate}, setting to NULL`);
            releaseDate = null; // Set to null for any other invalid format
          }
          // Additional validation to ensure date is valid
          if (releaseDate) {
            const dateObj = new Date(releaseDate);
            if (isNaN(dateObj.getTime()) || dateObj.getFullYear() < 1000 || dateObj.getFullYear() > 9999) {
              console.log(`Invalid date for book "${title}": ${releaseDate}, setting to NULL`);
              releaseDate = null;
            }
          }
        }

        // Insert into Books table
        const bookResult = await pool.request()
          .input('Title', sql.VarChar, title)
          .input('Description', sql.VarChar, description)
          .input('ReleaseDate', sql.Date, releaseDate)
          .input('AddedByUserID', sql.Int, addedByUserID)
          .query(`
            INSERT INTO Books (Title, Description, ReleaseDate, AddedByUserID)
            OUTPUT INSERTED.BookID
            VALUES (@Title, @Description, @ReleaseDate, @AddedByUserID)
          `);
        
        const bookId = bookResult.recordset[0].BookID;

        // Insert into Content table
        const contentResult = await pool.request()
          .input('BookID', sql.Int, bookId)
          .query(`
            INSERT INTO Content (BookID)
            OUTPUT INSERTED.ContentID
            VALUES (@BookID)
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

  await pool.close();
}

main().catch(console.error);