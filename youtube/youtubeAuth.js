const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const { OAuth2 } = google.auth;

const SCOPES = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.upload',
];
const TOKEN_DIR = `${process.env.HOME
  || process.env.HOMEPATH
  || process.env.USERPROFILE}/.credentials/`;
const TOKEN_PATH = `${TOKEN_DIR}youtube.json`;

let authToken;

function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log(`Token stored to ${TOKEN_PATH}`);
  });
}

function getNewToken(oauth2Client, callback) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oauth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error('Error while trying to retrieve access token', err);
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

function authorize(credentials, callback) {
  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  const redirectUrl = credentials.installed.redirect_uris[0];
  const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      return getNewToken(oauth2Client, callback);
    }
    oauth2Client.credentials = JSON.parse(token);
    callback(oauth2Client);
  });
}

function init() {
  return new Promise((resolve, reject) => {
    fs.readFile(`${__dirname}/client_secret.json`, (err, content) => {
      if (err) {
        reject(new Error(`Error loading client secret file: ${err}`));
      }
      // Authorize a client with the loaded credentials, then call the YouTube API.
      authorize(JSON.parse(content), (token) => {
        resolve(token);
      });
    });
  });
}

module.exports = {
  init,
  getAuthToken: () => authToken,
};
