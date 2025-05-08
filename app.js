// Loading the API key from the .env file
require('dotenv').config();

const createError = require("http-errors");
const express = require('express');
const path = require("path");
const hbs = require("hbs");
const indexRouter = require("./routes/index");
const session = require("express-session");
const bodyParser = require('body-parser');
const importRoutes = require('./routes/import');
const sql = require('mssql');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.set("view options", { layout: "layouts/main"});
hbs.registerPartials(path.join(__dirname, "views/partials"));
hbs.registerHelper("isSelected", (type, key) => type == key ? "selected": "");
hbs.registerHelper("eq", function (a, b) {
  return a === b;
});

hbs.registerHelper('range', function(start, end, options) {
  let result = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
});

app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));


app.use(session({
  secret: 'mySecretKey123',
  resave: false,
  saveUninitialized: true
}));

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Use the routes that you have defined
app.use('/import', importRoutes);
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

// Database configuration
// Database configuration from .env file
const dbConfig = {
  server: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  }
};


// Connecting to the database
async function connectToDatabase() {
  try {
    await sql.connect(dbConfig);
    console.log('Verbonden met de database!');
  } catch (err) {
    console.error('Fout bij verbinden met de database:', err);
  }
}

connectToDatabase();

module.exports = app;