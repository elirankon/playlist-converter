const readline = require('readline');
const util = require('util');
const youtube = require('./youtube');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

youtube.init().then(async (auth) => {
  const results = await youtube.search({ auth, id: 'PL6JIi0t5bs5bonWA1HRYJhp208ZSAR4dz' });
  console.log(util.inspect(results, true, 4, true));
}).catch(console.error);
