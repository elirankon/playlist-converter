const spotifyAuth = require('./spotifyAuth');

module.exports = (cli) => {
    cli.command('spotify init', 'initialize Spotify service').action((args, callback) => {
        spotifyAuth.init(cli.session).then(callback);
    });
};
