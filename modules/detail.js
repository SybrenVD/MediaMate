const { poolPromise } = require("../config/db");

async function getContentByTypeAndId(type, id) {
  const pool = await poolPromise;

  let query = "";
  if (type === "books") {
    query = `
      SELECT B.Title, B.Description, B.Image, B.ReleaseDate
      FROM Books B
      INNER JOIN Content C ON C.BookID = B.BookID
      WHERE C.ContentID = @Id
    `;
  } else if (type === "movies") {
    query = `
      SELECT M.Title, M.Description, M.Image, M.ReleaseDate
      FROM Movies M
      INNER JOIN Content C ON C.MovieID = M.MovieID
      WHERE C.ContentID = @Id
    `;
  } else if (type === "games") {
    query = `
      SELECT G.Title, G.Description, G.Image, G.ReleaseDate
      FROM Games G
      INNER JOIN Content C ON C.GameID = G.GameID
      WHERE C.ContentID = @Id
    `;
  } else {
    return null;
  }

  const result = await pool.request()
    .input("Id", id)
    .query(query);


    if (result.recordset[0]?.ReleaseDate) {
  const rawDate = new Date(result.recordset[0].ReleaseDate);
  const formattedDate = rawDate.toDateString(); // bvb: "Thu Jul 21 2022"
  result.recordset[0].ReleaseDate = formattedDate;
}

  return result.recordset[0] || null;
}

module.exports = { getContentByTypeAndId };
