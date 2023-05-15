const express = require('express');
const res = require('express/lib/response');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send("Welcome to my homepage!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//get the URLS page, render urls_index and pass urlDatabase as templateVars.
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

//get the URL for the shortened id and render that page. id is the shortURL id
//e.g. /urls/b2xVn2 is the url path for shortURL id b2xVn2
app.get('/urls/:id', (req, res) => {
  id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { longURL, id };
  res.render('urls_show', templateVars);

});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});