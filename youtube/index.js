const commands = require('./commands');

module.exports = cli => ({
    name: () => 'youtube',
    commands: commands(cli),
});
