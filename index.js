const Vorpal = require('vorpal');
const config = require('./config.json');
const processor = require('./processor');

function main() {
    const vorpal = new Vorpal();
    if (process.env.NODE_ENV === 'test') vorpal.session.log = () => {};

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
        const resp = services.map(service => service.name());
        callback(resp);
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

    return vorpal;
}

if (process.env.NODE_ENV !== 'test') {
    const vorpalInstance = main();
    vorpalInstance.show();
}

module.exports = {
    main,
};
