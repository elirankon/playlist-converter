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

function storeToken(cliSession, token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    cliSession.log(`Token stored to ${TOKEN_PATH}`);
  });
}

function getNewToken(cliSession, oauth2Client, callback) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  cliSession.log('Authorize this app by visiting this url: ', authUrl);
  cliSession.prompt(
    { type: 'input', name: 'code', message: 'Enter the code from that page here:' },
    (result) => {
      oauth2Client.getToken(result.code, (err, token) => {
        if (err) {
          console.error('Error while trying to retrieve access token', err);
        }
        oauth2Client.credentials = token;
        storeToken(cliSession, token);
        callback(oauth2Client);
      });
    },
  );
}

function authorize(cliSession, credentials, callback) {
  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  const redirectUrl = credentials.installed.redirect_uris[0];
  const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      return getNewToken(cliSession, oauth2Client, callback);
    }
    oauth2Client.credentials = JSON.parse(token);
    callback(oauth2Client);
  });
}

function init(cliSession) {
  return new Promise((resolve, reject) => {
    fs.readFile(`${__dirname}/client_secret.json`, (err, content) => {
      if (err) {
        reject(new Error(`Error loading client secret file: ${err}`));
      }
      // Authorize a client with the loaded credentials, then call the YouTube API.
      authorize(cliSession, JSON.parse(content), (token) => {
        resolve(token);
      });
    });
  });
}

module.exports = {
  init,
  getAuthToken: () => authToken,
};
