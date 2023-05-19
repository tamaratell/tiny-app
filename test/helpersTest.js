const assert = require('chai').assert;
const {
  generateRandomID,
  getUserbyID,
  getUserByEmail,
  getURLSforUser
} = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('generateRandomID', function() {
  it('should return a random ID of length 6', () => {
    const id = generateRandomID();
    assert.lengthOf(id, 6);
  });
});

describe('getUserbyID', function() {
  it('should return a user with valid ID', () => {
    const user = getUserbyID("userRandomID", testUsers);
    const expectedUser = {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    };
    assert.deepEqual(user, expectedUser);
  });
});

describe('getUserByEmail', function() {
  it('should return a user with valid email', () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUser = {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    };
    assert.deepEqual(user, expectedUser);
  });

  it('should return null for non-existent email', () => {
    const user = getUserByEmail("nonexistent@example.com", testUsers);
    assert.isNull(user);
  });
});

describe('getURLSforUser', function() {
  const urlDatabase = {
    b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "userRandomID"
    },
    i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "userRandomID"
    }
  };

  it('should return URLs for a valid user ID', () => {
    const userURLs = getURLSforUser("userRandomID", urlDatabase);
    const expectedURLs = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "userRandomID"
      },
      i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "userRandomID"
      }
    };
    assert.deepEqual(userURLs, expectedURLs);
  });

  it('should return an empty object for a non-existent user ID', () => {
    const userURLs = getURLSforUser("nonexistentID", urlDatabase);
    assert.isEmpty(userURLs);
  });
});
