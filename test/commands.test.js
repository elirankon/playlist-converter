const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');

const { expect } = chai;
const app = require('../index');
const processor = require('../processor');

chai.use(sinonChai);
const vorpal = app.main();

describe('service commands', () => {
    it('should have load and init commands for each service', (done) => {
        vorpal.exec('services list', (services) => {
            services.forEach((service) => {
                /* eslint-disable no-unused-expressions */
                expect(vorpal.find(`${service} load`)).to.not.be.undefined;
                expect(vorpal.find(`${service} init`)).to.not.be.undefined;
                /* eslint-enable no-unused-expressions */
            });
            done();
        });
    });
});

describe('#set commands', () => {
    it('sets the source service', (done) => {
        vorpal.exec('set youtube -s', () => {
            expect(processor.sourceService().name()).to.eql('youtube');
            done();
        });
    });

    it('sets the target service', (done) => {
        vorpal.exec('set youtube -t', () => {
            expect(processor.targetService().name()).to.eql('youtube');
            done();
        });
    });

    it('does not set a service that does not exist', (done) => {
        vorpal.exec('set blaah -s', (response) => {
            expect(response).to.eql('There is no service by this name');
            done();
        });
    });
});

describe('#start command', () => {
    let processorStartStub;
    beforeEach(() => {
        processorStartStub = sinon.stub(processor, 'start').resolves();
    });
    afterEach(() => {
        processorStartStub.restore();
    });

    it('calls processor.start() with provided title', (done) => {
        vorpal.exec('start -t "test title"', () => {
            expect(processorStartStub).to.be.calledWithExactly({ title: 'test title' });
            done();
        });
    });

    it('catches if processor.start() throws', (done) => {
        processorStartStub.restore();
        processorStartStub = sinon.stub(processor, 'start').rejects();
        vorpal.exec('start -t "test title"', (response) => {
            expect(response).to.include('something went wrong: ');
            done();
        });
    });
});
