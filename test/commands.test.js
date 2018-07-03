const { expect } = require('chai');
const app = require('../index');

const vorpal = app.main();

describe('service commands', () => {
    it('should have load and init commands for each service', (done) => {
        vorpal.exec('services list', (services) => {
            services.forEach((service) => {
                expect(vorpal.find(`${service} load`)).to.not.be.undefined;
                expect(vorpal.find(`${service} init`)).to.not.be.undefined;
            });
            done();
        });
    });
});
