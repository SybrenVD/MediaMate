const { poolPromise } = require("../config/db");

async function getContentByTypeAndId(type, id) {
  const pool = await poolPromise;

  let query = "";
  let idColumn = "";
  let table = "";

  switch (type.toLowerCase()) {
    case "books":
      table = "Books";
      idColumn = "BookID";
      break;
    case "movies":
      table = "Movies";
      idColumn = "MovieID";
      break;
    case "games":
      table = "Games";
      idColumn = "GameID";
      break;
    default:
      return null;
  }

  query = `
    SELECT Title, Description, Image, ReleaseDate
    FROM ${table}
    WHERE ${idColumn} = @Id
  `;

  const result = await pool.request()
    .input("Id", id)
    .query(query);

  if (result.recordset[0]?.ReleaseDate) {
    const rawDate = new Date(result.recordset[0].ReleaseDate);
    const formattedDate = rawDate.toDateString();
    result.recordset[0].ReleaseDate = formattedDate;
  }

  return result.recordset[0] || null;
}

module.exports = { getContentByTypeAndId };
