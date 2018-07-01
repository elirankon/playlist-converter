const vorpal = require('vorpal')();
const config = require('./config.json');
const processor = require('./processor');

const services = [];
const nameToService = {};
config.services.forEach((service) => {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const reqService = require(service.path)(vorpal);
    services.push(reqService);
    nameToService[reqService.name()] = reqService;
});

vorpal.delimiter('pConverter:>');
vorpal.command('services list', 'Services related commands').action((args, callback) => {
    callback(services.map(service => service.name()).join('\n'));
});

vorpal
    .command('set <service>', 'Sets the source service')
    .autocomplete(services.map(service => service.name()))
    .option('-t, --target', 'sets the target service')
    .option('-s, --source', 'sets the source service')
    .action((args, callback) => {
        if (!nameToService[args.service]) return callback('There is no service by this name');

        processor[`${args.options.source ? 'source' : 'target'}Service`](
            nameToService[args.service],
        );
        callback(`${args.options.source ? 'source' : 'target'} set to ${args.service}`);
    });

vorpal
    .command('start', 'Starts the conversion')
    .option('-t, --title <title>', 'target playlist title')
    .action((args, callback) => {
        processor
            .start({ title: args.options.title })
            .then(callback)
            .catch((err) => {
                callback('something went wrong: ', err);
            });
    });

vorpal.show();
