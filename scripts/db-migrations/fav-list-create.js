//niet ge-run-d
const sql = require("node:sqlite");

const db = new sql.DatabaseSync("data/fav.sqlite");

db.exec(`
    create table if not exists favitems (
    favId integer primary key,
    bookId integer,
    filmId integer,
    movieId integer,
    fandomId integer);
    `);