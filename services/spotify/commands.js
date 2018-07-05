const spotifyAuth = require('./spotifyAuth');
const spotifyHelper = require('./spotifyHelper');

module.exports = (cli) => {
    cli.command('spotify init', 'initialize Spotify service').action((args, callback) => {
        spotifyAuth
            .init(cli.session)
            .then((authToken) => {
                spotifyHelper.setAuth(authToken);
                spotifyHelper.getMyId().catch((ex) => {
                    cli.session.log('failed to get my ID', { ex });
                });
                callback('Spotify Initialized');
            })
            .catch((err) => {
                callback('Something went wrong', err.message);
            });
    });

    cli.command(
        'spotify load',
        "Shows the user's following playlists and then selects the desired one.",
    ).action((args, callback) => {
        spotifyHelper
            .loadUserPlaylist(cli.session)
            .then(count => callback(`${count} items loaded from playlist`))
            .catch(callback);
    });
};
