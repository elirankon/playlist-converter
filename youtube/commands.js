const { init } = require('./youtubeAuth');
const youtubeHelper = require('./youtubeHelper');

/* extract: youtubeHelper.getItemsFromPlaylist,
  generate: youtubeHelper.searchAndGeneratePlaylist,
  init,
  */
module.exports = (cli) => {
  cli.command('services youtube init', 'Initialise YouTube service').action((args, callback) => {
    init(cli.session).then(() => callback('YouTube Initialized'));
  });
};
