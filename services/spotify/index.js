const commands = require('./commands');

module.exports = cli => ({
    name: () => 'spotify',
    commands: commands(cli),
    getSourceItems: () => {},
    generate: () => {},
});
