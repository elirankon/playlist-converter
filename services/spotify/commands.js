const spotifyAuth = require('./spotifyAuth');

module.exports = (cli) => {
    cli.command('spotify init', 'initialize Spotify service').action((args, callback) => {
        spotifyAuth.init(cli.session).then(callback);
    });

    cli.command('spotify load <playlist>', 'loads a playlist to memory').action(
        (args, callback) => {
            callback();
        },
    );
};
