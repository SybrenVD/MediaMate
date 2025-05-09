//niet ge-run-d
const sql = require("node:sqlite");

const db = new sql.DatabaseSync("data/chat.sqlite");

db.exec(`
    create table if not exists chats (
    messageId integer primary key,
    fromID integer,
    time datetime,
    toID integer,
    content varchar(255)
    );
    `);