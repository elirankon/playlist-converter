const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');

const { expect } = chai;
const app = require('../../index');
const { init } = require('./youtubeAuth');
const youtubeHelper = require('./youtubeHelper');

chai.use(sinonChai);
const vorpal = app.main();

describe('youtube commands', () => {
    let initStub;
    let loadStub;

    afterEach(() => {
        initStub.restore();
        loadStub.restore();
    });

    describe('#load', () => {
        it('calls youtube helper to load files into memory', (done) => {
            loadStub = sinon.stub(youtubeHelper, 'getItemsFromPlaylist').resolves();
            vorpal.exec('youtube load gagaga', () => {
                expect(loadStub).to.be.calledWithExactly({ id: 'gagaga' });
                done();
            });
        });

        it('exits when youtubeHelper load rejects', (done) => {});
    });

    describe('#init', () => {});
});
