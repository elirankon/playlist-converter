const commands = require('./commands');
const { listLoaded, searchAndGeneratePlaylist } = require('./youtubeHelper');

module.exports = cli => ({
    name: () => 'youtube',
    commands: commands(cli),
    getSourceItems: listLoaded,
    generate: searchAndGeneratePlaylist,
});
