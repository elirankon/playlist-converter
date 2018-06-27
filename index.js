const vorpal = require('vorpal')();
const youtube = require('./youtube');

const services = {
  youtube,
};

// youtube.init();

vorpal.delimiter('pConverter:>');
vorpal
  .command('services [service] <command>', 'Services related commands')
  .action((args, callback) => {
    if (args.command === 'list') {
      vorpal.session.log(services.map(service => service.name()).join('\n'));
    }

    if (args.command === 'init') {
      services[args.service].init().then(callback);
    }
  });

vorpal.command('source <source>', 'Specify source service').action((args, callback) => {
  callback();
});

vorpal.show();
