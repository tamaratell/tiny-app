//-------------------SETUP------------------------\\
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

//------------------MIDDLEWARE---------------------\\
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//-------------------OBJECTS------------------------\\
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("123", 10)
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("123", 10)
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
  return null;
};

const getURLSforUser = (user_id) => {
  let urlsForUser = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === user_id) {
      urlsForUser[url] = urlDatabase[url];
    }
  }
  return urlsForUser;
};


//-------------------ROUTES------------------------\\
//get the new URL form page
app.get("/urls/new", (req, res) => {
  const user = getUserbyID(req.cookies["user_id"]);
  if (!user) {
    return res.redirect('/login');
  }
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

//POST the URL created from /urls/new to /urls then render /urls:id for new URL 
//Add new URL to urlDatabase in format id: longURL.
app.post("/urls", (req, res) => {
  const user = getUserbyID(req.cookies["user_id"]);
  if (!user) {
    return res.status(304).send("Only logged in users can shorten URLs");
  }
  const longURL = req.body.longURL;
  const id = generateRandomID();
  urlDatabase[id] = { longURL, userID: user.id };
  console.log(urlDatabase);
  const templateVars = { longURL, id, user };
  res.render('urls_show', templateVars);
});

//get longURL page by pressing its shortURL on urls_show template. 
//id is the shortURL id
//e.g. /u/b2xVn2 is the url path for shortURL id b2xVn2
app.get('/u/:id', (req, res) => {
  const user = getUserbyID(req.cookies["user_id"]);
  if (!user) {
    return res.status(403).send("You must be logged in to edit URLS");
  }
  id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  if (!longURL) {
    res.status(404).send("URL not found :(");
  }
  res.redirect(longURL);

});

//go to the edit page for a link from the homepage by clicking the edit button
app.post('/urls/:id', (req, res) => {
  const user = getUserbyID(req.cookies["user_id"]);
  if (!user) {
    return res.status(403).send("You must be logged in to edit URLS");
  }
  id = req.params.id;
  const templateVars = { id, longURL: urlDatabase[id].longURL, user };
  res.render('urls_show', templateVars);
});

//update a longURL (and the database) using the form on /urls/:id (edit page)
app.post('/urls/:id/edit', (req, res) => {
  const user = getUserbyID(req.cookies["user_id"]);
  if (!user) {
    return res.status(403).send("You must be logged in to edit URLS");
  }
  const longURL = req.body.longURL;
  const id = req.params.id;
  urlDatabase[id].longURL = longURL;
  res.redirect('/urls');
});


//delete a URL resource (and remove it from url Database)
app.post('/urls/:id/delete', (req, res) => {
  const user = getUserbyID(req.cookies["user_id"]);
  if (!user) {
    return res.status(403).send("You must be logged in to delete URLS");
  }
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});



//-------------------LOGIN AND REGISTRATION ROUTES------------------------\\

//get the login page
app.get('/login', (req, res) => {
  const user = getUserbyID(req.cookies["user_id"]);
  if (user) {
    return res.redirect('/urls');
  }
  const templateVars = { user };
  res.render('urls_login', templateVars);
});

//login && set cookie 
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);

  if (email === "" || password === "") {
    res.status(400).send("Error: credentials cannot be empty");
    return;
  }

  if (!user) {
    res.status(401).send("Invalid credentials");
    return;
  }

  if (user) {
    if (!bcrypt.compareSync(password, user.password)) {
      res.status(401).send("Invalid credentials");
      return;
    }
    res.cookie('user_id', `${user.id}`);
    res.redirect('/urls');
  }

});

//get the registration page
app.get('/register', (req, res) => {
  const user = getUserbyID(req.cookies["user_id"]);
  if (user) {
    return res.redirect('/urls');
  }
  const templateVars = { user };
  res.render('urls_register', templateVars);
});

//register && set cookie
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);

  if (email === "" || password === "") {
    res.status(404).send("Error: credentials cannot be empty");
    return;
  }

  if (getUserByEmail(email)) {
    res.status(401).send("Error: Please try again");
    return;
  }

  const id = generateRandomID();
  users[id] = { id, email, password };
  res.cookie('user_id', `${id}`);
  res.redirect('/urls');
});

//logout && clear cookies
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

//-------------------END OF LOGIN AND REGISTRATION ROUTES------------------------\\


//get the URLS page, render urls_index and pass urlDatabase as templateVars.
app.get('/urls', (req, res) => {
  const user = getUserbyID(req.cookies["user_id"]);
  if (!user) {
    return res.status(403).send("You must be logged in to view URLS");
  }
  const urlsForUser = getURLSforUser(req.cookies["user_id"]);
  const templateVars = { urls: urlsForUser, user };
  console.log(templateVars);
  res.render('urls_index', templateVars);
});


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

//res.status(403).send("You must be logged in to view URLS");