const vorpal = require('vorpal')();
const youtube = require('./youtube');

const services = [youtube];

//youtube.init();

vorpal.delimiter('pConverter:>');
vorpal
  .command('services', 'Services related commands')
  .option('-l, --list', 'List all available services')
  .action((args, callback) => {
    if (args.options.list) {
      vorpal.session.log(services.map(service => service.name()).join('\n'));
    }

    callback();
  });

vorpal.command('source <source>', 'Specify source service').action((args, callback) => {
  callback();
});

vorpal.show();
