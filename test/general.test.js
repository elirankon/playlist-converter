const { expect } = require('chai');
const config = require('../config');

const services = [];

config.services.forEach((service) => {
    services[service.name] = require(`../${service.path}`); // eslint-disable-line import/no-dynamic-require,global-require
});

describe('services interfaces check', () => {
    it('checks that all services implement `name`', () => {
        services.forEach(service => expect(typeof service.name).to.equal('function'));
    });
    it('checks that all services implement `commands`', () => {
        services.forEach(service => expect(typeof service.commands).to.equal('function'));
    });
    it('checks that all services implement `getSourceItems`', () => {
        services.forEach(service => expect(typeof service.getSourceItems).to.equal('function'));
    });
    it('checks that all services implement `generate`', () => {
        services.forEach(service => expect(typeof service.generate).to.equal('function'));
    });
});
