//ophalen van de API key uit de .env bestand
require('dotenv').config();

const createError = require("http-errors");
const express = require('express');
const path = require("path");
const hbs = require("hbs");
const indexRouter = require("./routes/index");
const axios = require('axios');
const sql = require('mssql');
const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.set("view options", { layout: "layouts/main"});
hbs.registerPartials(path.join(__dirname, "views/partials"));
hbs.registerHelper("isSelected", (type, key) => type == key ? "selected": "");
hbs.registerHelper("eq", function (a, b) {
  return a === b;
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

//Database configuratie
const dbConfig = {
  user: process.env.DB_USER,            // Gebruikersnaam van de database (uit .env)
  password: process.env.DB_PASSWORD,    // Wachtwoord van de database (uit .env)
  server: process.env.DB_SERVER,        // SQL Server adres (bijv. localhost)
  database: process.env.DB_NAME,        // Naam van de database
  options: {
    encrypt: true,                      // Altijd 'true' voor beveiliging
    trustServerCertificate: true        // Vertrouwen op het servercertificaat (voor lokale servers)
  }
};

// Verbinden met de database
async function connectToDatabase() {
  try {
    await sql.connect(dbConfig);
    console.log('Verbonden met de database!');
  } catch (err) {
    console.error('Fout bij verbinden met de database:', err);
  }
}

module.exports = app;