const bcrypt = require('bcryptjs');

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

module.exports = {
  urlDatabase,
  users
};