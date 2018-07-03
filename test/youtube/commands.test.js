const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');

const { expect } = chai;
const app = require('../../index');
const { init } = require('../../services/youtube/youtubeAuth');
const youtubeHelper = require('../../services/youtube/youtubeHelper');

chai.use(sinonChai);
const vorpal = app.main();

describe('youtube commands', () => {
    describe('#load', () => {
        it('calls youtube helper to load files into memory', (done) => {
            const loadStub = sinon.stub(youtubeHelper, 'getItemsFromPlaylist').resolves();
            vorpal.exec('youtube load gagaga', () => {
                loadStub.restore();
                expect(loadStub).to.be.calledWithExactly({ id: 'gagaga' });
                done();
            });
        });

        it('exits when youtubeHelper load rejects', (done) => {
            const error = { message: 'the message' };
            const loadStub = sinon
                .stub(youtubeHelper, 'getItemsFromPlaylist')
                .rejects(error);
            vorpal.exec('youtube load gagaga', (response) => {
                loadStub.restore();
                expect(response).to.eql(error);
                done();
            });
        });
    });

    describe('#init', () => {});
});
