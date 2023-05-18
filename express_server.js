//-------------------SETUP------------------------\\
const express = require('express');
const req = require('express/lib/request');
const cookieParser = require('cookie-parser');
const res = require('express/lib/response');
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

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "123",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "123",
  },
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

const getUserbyID = (user_id) => {
  for (const user in users) {
    if (user === user_id) {
      return users[user];
    }
  }
};

const getUserByEmail = (user_email) => {
  for (const user in users) {
    const userInformation = users[user];
    if (userInformation.email === user_email) {
      return userInformation;
    }
  }
};


//-------------------ROUTES------------------------\\
//get the new URL form page
app.get("/urls/new", (req, res) => {
  const templateVars = { user: getUserbyID(req.cookies["user_id"]) };
  res.render("urls_new", templateVars);
});

//POST the URL created from /urls/new to /urls then render /urls:id for new URL 
//Add new URL to urlDatabase in format id: longURL
app.post("/urls", (req, res) => {
  const user = getUserbyID(req.cookies["user_id"]);
  const longURL = req.body.longURL;
  const id = generateRandomID();
  urlDatabase[id] = longURL;
  const templateVars = { longURL, id, user };
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
  const user = getUserbyID(req.cookies["user_id"]);
  id = req.params.id;
  const templateVars = { id, longURL: urlDatabase[id], user };
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

//login && set cookie //NOT WORKING PROPERLY YET, NEED TO UPDATE
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  res.cookie('username', `${username}`);
  res.redirect('/urls');
});

//go to the registration page
app.get('/register', (req, res) => {
  const user = getUserbyID(req.cookies["user_id"]);
  const templateVars = { user };
  res.render('urls_register', templateVars);
});

//register && set cookie
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomID();
  users[id] = { id, email, password };
  console.log(users);
  res.cookie('user_id', `${id}`);
  res.redirect('/urls');
});

//logout && clear cookies
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//get the URLS page, render urls_index and pass urlDatabase as templateVars.
app.get('/urls', (req, res) => {
  const user = getUserbyID(req.cookies["user_id"]);
  const templateVars = { urls: urlDatabase, user };
  console.log(templateVars);
  res.render('urls_index', templateVars);
});


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});