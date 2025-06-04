require('dotenv').config();

const createError = require("http-errors");
const express = require('express');
const path = require("path");
const hbs = require("hbs");
const session = require("express-session");
const bodyParser = require('body-parser');
const indexRouter = require("./routes/index");
const multer = require("multer");

// Init Express app
const app = express();
const port = process.env.PORT || 3001;

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.set("view options", { layout: "layouts/main"});
hbs.registerPartials(path.join(__dirname, "views/partials"));

// Handlebars helpers
hbs.registerHelper("isSelected", (type, key) => type == key ? "selected": "");
hbs.registerHelper("eq", function (a, b) {
  return a === b;
});
hbs.registerHelper("gt", function (a, b) {
  return a > b;
});
hbs.registerHelper("lt", function (a, b) {
  return a < b;
});
hbs.registerHelper("add", function (a, b) {
  return a + b;
});
hbs.registerHelper("subtract", function (a, b) {
  return a - b;
});
hbs.registerHelper("max", function (a, b) {
  return a > b ? a : b;
});
hbs.registerHelper("min", function (a, b) {
  return a < b ? a : b;
});
hbs.registerHelper("lookup", function(obj, key) {
  return obj[key];
});
hbs.registerHelper('ifEquals', function (arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper('array', function (...args) {
  return args.slice(0, -1); // Remove Handlebars options object
});
hbs.registerHelper('includes', function (array, value) {
  return array && array.includes(value);
});
hbs.registerHelper('join', function (array, separator) {
  return array ? array.map(item => encodeURIComponent(item)).join(separator) : '';
});
hbs.registerHelper('encodeURIComponent', function (str) {
  return encodeURIComponent(str || '');
});
hbs.registerHelper('json', function (context) {
  return JSON.stringify(context, null, 2);
});
hbs.registerHelper('rangeHelper', function(start, end) {
  let result = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
});
hbs.registerHelper("lte", function (a, b) {
  return a <= b;
});

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
app.use("/", indexRouter);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render("error");
});

// Start server
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

module.exports = app;