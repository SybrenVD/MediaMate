const { sql, poolPromise } = require('../config/db'); // Adjust path if needed

async function searchAllContent(query, page = 1, pageSize = 40) {
  try {
    const pool = await poolPromise;

    // Sanitize query to prevent SQL injection
    const sanitizedQuery = `%${query.replace(/[%_]/g, '')}%`;
    const offset = (page - 1) * pageSize;

    const request = pool.request();
    request.input('query', sql.NVarChar, sanitizedQuery);
    request.input('offset', sql.Int, offset);
    request.input('pageSize', sql.Int, pageSize);

    // Query to search Books, Movies, Games by Title, Genre, Description
    const result = await request.query(`
      WITH SearchResults AS (
        -- Books: Title (Rank 1)
        SELECT 
          b.BookID AS ItemID,
          'Book' AS ContentType,
          b.Title,
          b.Image,
          b.Description,
          STRING_AGG(g.Name, ', ') AS Genres,
          1 AS Rank
        FROM Books b
        JOIN Content c ON c.BookID = b.BookID
        LEFT JOIN Content_Genre cg ON cg.ContentID = c.ContentID
        LEFT JOIN Genres g ON g.GenreID = cg.GenreID
        WHERE b.Title LIKE @query
        GROUP BY b.BookID, b.Title, b.Image, b.Description

        UNION ALL

        -- Books: Genre (Rank 2)
        SELECT 
          b.BookID AS ItemID,
          'Book' AS ContentType,
          b.Title,
          b.Image,
          b.Description,
          STRING_AGG(g.Name, ', ') AS Genres,
          2 AS Rank
        FROM Books b
        JOIN Content c ON c.BookID = b.BookID
        JOIN Content_Genre cg ON cg.ContentID = c.ContentID
        JOIN Genres g ON g.GenreID = cg.GenreID
        WHERE g.Name LIKE @query
        GROUP BY b.BookID, b.Title, b.Image, b.Description

        UNION ALL

        -- Books: Description (Rank 3)
        SELECT 
          b.BookID AS ItemID,
          'Book' AS ContentType,
          b.Title,
          b.Image,
          b.Description,
          STRING_AGG(g.Name, ', ') AS Genres,
          3 AS Rank
        FROM Books b
        JOIN Content c ON c.BookID = b.BookID
        LEFT JOIN Content_Genre cg ON cg.ContentID = c.ContentID
        LEFT JOIN Genres g ON g.GenreID = cg.GenreID
        WHERE b.Description LIKE @query
        GROUP BY b.BookID, b.Title, b.Image, b.Description

        UNION ALL

        -- Movies: Title (Rank 1)
        SELECT 
          m.MovieID AS ItemID,
          'Movie' AS ContentType,
          m.Title,
          m.Image,
          m.Description,
          STRING_AGG(g.Name, ', ') AS Genres,
          1 AS Rank
        FROM Movies m
        JOIN Content c ON c.MovieID = m.MovieID
        LEFT JOIN Content_Genre cg ON cg.ContentID = c.ContentID
        LEFT JOIN Genres g ON g.GenreID = cg.GenreID
        WHERE m.Title LIKE @query
        GROUP BY m.MovieID, m.Title, m.Image, m.Description

        UNION ALL

        -- Movies: Genre (Rank 2)
        SELECT 
          m.MovieID AS ItemID,
          'Movie' AS ContentType,
          m.Title,
          m.Image,
          m.Description,
          STRING_AGG(g.Name, ', ') AS Genres,
          2 AS Rank
        FROM Movies m
        JOIN Content c ON c.MovieID = m.MovieID
        JOIN Content_Genre cg ON cg.ContentID = c.ContentID
        JOIN Genres g ON g.GenreID = cg.GenreID
        WHERE g.Name LIKE @query
        GROUP BY m.MovieID, m.Title, m.Image, m.Description

        UNION ALL

        -- Movies: Description (Rank 3)
        SELECT 
          m.MovieID AS ItemID,
          'Movie' AS ContentType,
          m.Title,
          m.Image,
          m.Description,
          STRING_AGG(g.Name, ', ') AS Genres,
          3 AS Rank
        FROM Movies m
        JOIN Content c ON c.MovieID = m.MovieID
        LEFT JOIN Content_Genre cg ON cg.ContentID = c.ContentID
        LEFT JOIN Genres g ON g.GenreID = cg.GenreID
        WHERE m.Description LIKE @query
        GROUP BY m.MovieID, m.Title, m.Image, m.Description

        UNION ALL

        -- Games: Title (Rank 1)
        SELECT 
          g.GameID AS ItemID,
          'Game' AS ContentType,
          g.Title,
          g.Image,
          g.Description,
          STRING_AGG(g2.Name, ', ') AS Genres,
          1 AS Rank
        FROM Games g
        JOIN Content c ON c.GameID = g.GameID
        LEFT JOIN Content_Genre cg ON cg.ContentID = c.ContentID
        LEFT JOIN Genres g2 ON g2.GenreID = cg.GenreID
        WHERE g.Title LIKE @query
        GROUP BY g.GameID, g.Title, g.Image, g.Description

        UNION ALL

        -- Games: Genre (Rank 2)
        SELECT 
          g.GameID AS ItemID,
          'Game' AS ContentType,
          g.Title,
          g.Image,
          g.Description,
          STRING_AGG(g2.Name, ', ') AS Genres,
          2 AS Rank
        FROM Games g
        JOIN Content c ON c.GameID = g.GameID
        JOIN Content_Genre cg ON cg.ContentID = c.ContentID
        JOIN Genres g2 ON g2.GenreID = cg.GenreID
        WHERE g2.Name LIKE @query
        GROUP BY g.GameID, g.Title, g.Image, g.Description

        UNION ALL

        -- Games: Description (Rank 3)
        SELECT 
          g.GameID AS ItemID,
          'Game' AS ContentType,
          g.Title,
          g.Image,
          g.Description,
          STRING_AGG(g2.Name, ', ') AS Genres,
          3 AS Rank
        FROM Games g
        JOIN Content c ON c.GameID = g.GameID
        LEFT JOIN Content_Genre cg ON cg.ContentID = c.ContentID
        LEFT JOIN Genres g2 ON g2.GenreID = cg.GenreID
        WHERE g.Description LIKE @query
        GROUP BY g.GameID, g.Title, g.Image, g.Description
      )
      SELECT 
        ItemID,
        ContentType,
        Title,
        Image,
        Genres,
        Description,
        (SELECT COUNT(DISTINCT CONCAT(ContentType, CAST(ItemID AS NVARCHAR(50)))) FROM SearchResults) AS TotalCount
      FROM (
        SELECT DISTINCT
          ItemID,
          ContentType,
          Title,
          Image,
          Genres,
          Description,
          Rank
        FROM SearchResults
        ORDER BY Rank, Title
        OFFSET @offset ROWS
        FETCH NEXT @pageSize ROWS ONLY
      ) AS OrderedResults;
    `);

    const searchResults = result.recordset.map(row => ({
      ItemID: row.ItemID,
      ContentType: row.ContentType,
      Title: row.Title,
      Image: row.Image,
      Genres: row.Genres,
      Description: row.Description
    }));
    const totalCount = result.recordset.length > 0 ? result.recordset[0].TotalCount : 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      searchResults,
      currentPage: page,
      totalPages,
      totalCount
    };
  } catch (err) {
    console.error('Error executing search query:', err.message);
    throw new Error('Failed to perform search');
  }
}

module.exports = { searchAllContent };