const createError = require("http-errors");
const express = require('express');
const path = require("path");
const hbs = require("hbs");
const indexRouter = require("./routes/index");
const session = require("express-session");


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

hbs.registerHelper('range', function(start, end, options) {
  let result = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
});

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

module.exports = app;