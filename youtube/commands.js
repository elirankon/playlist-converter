const { init } = require('./youtubeAuth');
const youtubeHelper = require('./youtubeHelper');

/* extract: youtubeHelper.getItemsFromPlaylist,
  generate: youtubeHelper.searchAndGeneratePlaylist,
  init,
  */
module.exports = (cli) => {
    cli.command('youtube init', 'Initialise YouTube service').action((args, callback) => {
        init(cli.session).then((auth) => {
            youtubeHelper.setAuth(auth);
            callback('YouTube Initialized');
        });
    });

    cli.command('youtube load <playlist>', 'Load a playlist to be converted').action(
        (args, callback) => {
            youtubeHelper
                .getItemsFromPlaylist({ id: args.playlist })
                .then(addedCount => callback(`Loaded ${addedCount} videos from playlist ${args.playlist}`));
        },
    );

    cli.command('youtube list loaded', 'Shows videos ready for conversion').action(
        (args, callback) => {
            callback(youtubeHelper.listLoaded().join('\n'));
        },
    );

    cli.command('youtube create playlist <title>', 'Creates a playlist').action(
        (args, callback) => {
            youtubeHelper
                .createPlaylist({ title: args.title })
                .then(callback)
                .catch(callback);
        },
    );
};
