//nog niet ge-run-d
const sql = require("node:dqlite");

const db = new sql.DatabaseSync("data/fav.sqlite");

db.exec(`
    create table if not exists items (
    id integer primary key,
    bookId integer,
    filmId integer,
    movieId integer,
    fandomId integer);
    `);