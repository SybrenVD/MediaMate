const express = require('express');
const app = express();

// Middleware & routes
app.get('/', (req, res) => {
  res.send('Hello from MediaMate!');
});

module.exports = app;