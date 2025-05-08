//niet ge-run-d
const sql = require("node:sqlite");

const db = new sql.DatabaseSync("data/groep.sqlite");

db.exec(`
    create table if not exists groeps (
    groepId integer primary key,
    tag text,
    createrId integer,
    createDate datetime
    );
    `);