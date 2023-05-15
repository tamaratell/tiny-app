const express = require('express');
const res = require('express/lib/response');
const app = express();
const PORT = 8080;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send("Welcome to my homepage!");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});