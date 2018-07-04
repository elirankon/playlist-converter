const commands = require('./commands');
const { listLoaded } = require('./spotifyHelper');

module.exports = cli => ({
    name: () => 'spotify',
    commands: commands(cli),
    getSourceItems: listLoaded,
    generate: () => {},
});
