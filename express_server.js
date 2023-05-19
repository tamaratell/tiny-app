//-------------------SETUP------------------------\\
const express = require('express');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const methodOverride = require('method-override');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

//------------------MIDDLEWARE---------------------\\
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['some-long-secret']
}));

//-------------------OBJECTS------------------------\\
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
    visits: 0,
    uniqueVisitors: [],
    visitorsList: []
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
    visits: 0,
    uniqueVisitors: [],
    visitorsList: []
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

const {
  generateRandomID,
  getUserbyID,
  getUserByEmail,
  getURLSforUser
} = require('./helpers');


//-------------------ROUTES------------------------\\
//get the new URL form page
app.get("/urls/new", (req, res) => {
  const user = getUserbyID(req.session.user_id, users);
  if (!user) {
    return res.redirect('/login');
  }
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

//POST the URL created from /urls/new to /urls then render /urls:id for new URL 
//Add new URL to urlDatabase in format id: longURL.
app.post("/urls", (req, res) => {
  const currentRoute = '/urls';
  const user = getUserbyID(req.session.user_id, users);
  if (!user) {
    return res.status(304).send("Only logged in users can shorten URLs");
  }
  const longURL = req.body.longURL;
  const id = generateRandomID();
  urlDatabase[id] = {
    longURL, userID: user.id, visits: 0,
    uniqueVisitors: [],
    visitorsList: []
  };
  const templateVars = { longURL, id, user, currentRoute };
  res.render('urls_show', templateVars);
});

//get longURL page by pressing its shortURL on urls_show template. 
//id is the shortURL id
//e.g. /u/b2xVn2 is the url path for shortURL id b2xVn2
app.get('/u/:id', (req, res) => {
  const user = getUserbyID(req.session.user_id, users);
  if (!user) {
    return res.status(403).send("You must be logged in to edit URLS");
  }
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;

  if (!longURL) {
    res.status(404).send("URL not found :(");
  }

  //set cookie if no visitor_is found
  if (!req.cookies.visitor_id) {
    const visitorId = generateRandomID();
    res.cookie('visitor_id', `${visitorId}`);
    urlDatabase[id].uniqueVisitors.push(visitorId);
  }

  // Add visit entry to the visitorsList array
  const visitEntry = {
    timestamp: new Date(),
    visitorId: req.cookies.visitor_id,
  };

  //add visitor information to database
  urlDatabase[id].visitorsList.push(visitEntry);
  urlDatabase[id].visits++;

  res.redirect(longURL);

});

//go to the edit page for a link from the homepage by clicking the edit button
app.post('/urls/:id', (req, res) => {
  const currentRoute = '/urls/:id';
  const user = getUserbyID(req.session.user_id, users);
  if (!user) {
    return res.status(403).send("You must be logged in to edit URLS");
  }
  id = req.params.id;

  const totalVisits = urlDatabase[id].visits;
  const uniqueVisitorsCount = urlDatabase[id].uniqueVisitors;
  const visits = urlDatabase[id].visitorsList;

  const templateVars = { id, longURL: urlDatabase[id].longURL, user, totalVisits, uniqueVisitorsCount, visits, currentRoute };
  res.render('urls_show', templateVars);
});

//update a longURL (and the database) using the form on /urls/:id (edit page)
app.put('/urls/:id', (req, res) => {
  const user = getUserbyID(req.session.user_id, users);
  if (!user) {
    return res.status(403).send("You must be logged in to edit URLS");
  }
  const longURL = req.body.longURL;
  const id = req.params.id;
  urlDatabase[id].longURL = longURL;
  res.redirect('/urls');
});


//delete a URL resource (and remove it from url Database)
app.delete('/urls/:id/delete', (req, res) => {
  const user = getUserbyID(req.session.user_id, users);
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
  const user = getUserbyID(req.session.user_id, users);
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
  const user = getUserByEmail(email, users);

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
    req.session.user_id = `${user.id}`;
    res.redirect('/urls');
  }

});

//get the registration page
app.get('/register', (req, res) => {
  const user = getUserbyID(req.session.user_id, users);
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

  if (getUserByEmail(email, users)) {
    res.status(401).send("Error: Please try again");
    return;
  }

  const id = generateRandomID();
  users[id] = { id, email, password };
  req.session.user_id = `${id}`;
  res.redirect('/urls');
});

//logout && clear cookies
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

//-------------------END OF LOGIN AND REGISTRATION ROUTES------------------------\\


//get the URLS page, render urls_index and pass urlDatabase as templateVars.
app.get('/urls', (req, res) => {
  const user = getUserbyID(req.session.user_id, users);
  if (!user) {
    return res.status(403).send("You must be logged in to view URLS");
  }
  const urlsForUser = getURLSforUser(req.session.user_id, urlDatabase);
  const templateVars = { urls: urlsForUser, user };
  res.render('urls_index', templateVars);
});


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

