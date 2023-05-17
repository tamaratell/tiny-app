//-------------------SETUP------------------------\\
const express = require('express');
const req = require('express/lib/request');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

//------------------MIDDLEWARE---------------------\\
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//-------------------OBJECTS------------------------\\
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//-------------------FUNCTIONS------------------------\\

const generateRandomID = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  let id = "";
  for (const character of characters) {
    if (id.length < 6) {
      id += characters[Math.floor(Math.random() * (characters.length))];
    }
  }
  return id;
};



//-------------------ROUTES------------------------\\
//get the new URL form page
app.get("/urls/new", (req, res) => {
  const username = req.cookies["username"];
  res.render("urls_new", username);
});

//POST the URL created from /urls/new to /urls then render /urls:id for new URL 
//Add new URL to urlDatabase in format id: longURL
app.post("/urls", (req, res) => {
  const username = req.cookies["username"];
  const longURL = req.body.longURL;
  const id = generateRandomID();
  urlDatabase[id] = longURL;
  const templateVars = { longURL, id, username };
  res.render('urls_show', templateVars);
});

//get longURL page by pressing its shortURL on urls_show template. 
//id is the shortURL id
//e.g. /u/b2xVn2 is the url path for shortURL id b2xVn2
app.get('/u/:id', (req, res) => {
  id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);

});

//go to the edit page for a link from the homepage by clicking the edit button
app.post('/urls/:id', (req, res) => {
  const username = req.cookies["username"];
  id = req.params.id;
  const templateVars = { id, longURL: urlDatabase[id], username };
  res.render('urls_show', templateVars);
});

//update a longURL (and the database) using the form on /urls/:id (edit page)
app.post('/urls/:id/edit', (req, res) => {
  const longURL = req.body.longURL;
  const id = req.params.id;
  urlDatabase[id] = longURL;
  console.log(urlDatabase);
  res.redirect('/urls');
});


//delete a URL resource (and remove it from url Database)
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

//login
app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie('username', `${username}`);
  res.redirect('/urls');
});

//get the URLS page, render urls_index and pass urlDatabase as templateVars.
app.get('/urls', (req, res) => {
  const username = req.cookies["username"];
  const templateVars = { urls: urlDatabase, username };
  res.render('urls_index', templateVars);
});


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});