const vorpal = require('vorpal')();
const config = require('./config.json');

const services = [];
config.services.forEach((service) => {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  services.push(require(service.path)(vorpal));
});

vorpal.delimiter('pConverter:>');
vorpal.command('services list', 'Services related commands').action((args, callback) => {
  vorpal.session.log(services.map(service => service.name()).join('\n'));
  callback();
});

vorpal.command('source <source>', 'Specify source service').action((args, callback) => {
  callback();
});

vorpal.show();
