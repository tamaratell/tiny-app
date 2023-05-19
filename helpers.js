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

const getUserbyID = (user_id, users) => {
  for (const user in users) {
    if (user === user_id) {
      return users[user];
    }
  }
};

const getUserByEmail = (user_email, users) => {
  for (const user in users) {
    const userInformation = users[user];
    if (userInformation.email === user_email) {
      return userInformation;
    }
  }
  return null;
};

const getURLSforUser = (user_id, urlDatabase) => {
  let urlsForUser = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === user_id) {
      urlsForUser[url] = urlDatabase[url];
    }
  }
  return urlsForUser;
};

module.exports = {
  generateRandomID,
  getUserbyID,
  getUserByEmail,
  getURLSforUser
};