const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');

const { expect } = chai;
const app = require('../../index');
const youtubeAuth = require('../../services/youtube/youtubeAuth');
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
            const loadStub = sinon.stub(youtubeHelper, 'getItemsFromPlaylist').rejects(error);
            vorpal.exec('youtube load gagaga', (response) => {
                loadStub.restore();
                expect(response).to.eql(error);
                done();
            });
        });
    });

    describe('#init', () => {
        it('calls auth init and sets auth in youtube helper', (done) => {
            const mockAuth = { ping: 'pong' };
            const initStub = sinon.stub(youtubeAuth, 'init').resolves(mockAuth);
            const setAuthStub = sinon.stub(youtubeHelper, 'setAuth');

            vorpal.exec('youtube init', () => {
                initStub.restore();
                setAuthStub.restore();
                expect(initStub).to.be.calledOnce; // eslint-disable-line
                expect(setAuthStub).to.be.calledWith(mockAuth);
                done();
            });
        });

        it('exits when init fails', (done) => {
            const initStub = sinon.stub(youtubeAuth, 'init').rejects({ message: 'oh oh' });

            vorpal.exec('youtube init', (response) => {
                initStub.restore();
                expect(initStub).to.be.calledOnce; // eslint-disable-line 
                expect(response).to.include('Something went wrong');
                done();
            });
        });
    });
});
