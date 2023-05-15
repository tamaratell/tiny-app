//-------------------SETUP------------------------\\
const express = require('express');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
//get the URLS page, render urls_index and pass urlDatabase as templateVars.
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

//get the new URL form page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//POST the URL created from /urls/new to /urls
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
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