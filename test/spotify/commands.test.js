/* eslint-disable no-unused-expressions */
const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');

const { expect } = chai;
const app = require('../../index');
const spotifyAuth = require('../../services/spotify/spotifyAuth');
const spotifyHelper = require('../../services/spotify/spotifyHelper');

chai.use(sinonChai);
const vorpal = app.main();

describe('spotify commands', () => {
    describe('#load', () => {
        it('calls spotify helper to load files into memory', (done) => {
            const loadStub = sinon.stub(spotifyHelper, 'loadUserPlaylist').resolves();
            vorpal.exec('spotify load', () => {
                loadStub.restore();
                expect(loadStub).to.be.called;
                done();
            });
        });

        it('exits when spotify load rejects', (done) => {
            const error = { message: 'the message' };
            const loadStub = sinon.stub(spotifyHelper, 'loadUserPlaylist').rejects(error);
            vorpal.exec('spotify load', (response) => {
                loadStub.restore();
                expect(response).to.eql(error);
                done();
            });
        });
    });

    describe('#init', () => {
        it('calls auth init and sets auth in spotify helper', (done) => {
            const mockAuth = 'mocki mocki';
            const initStub = sinon.stub(spotifyAuth, 'init').resolves(mockAuth);
            const setAuthStub = sinon.stub(spotifyHelper, 'setAuth');

            vorpal.exec('spotify init', () => {
                initStub.restore();
                setAuthStub.restore();
                expect(initStub).to.be.calledOnce; // eslint-disable-line
                expect(setAuthStub).to.be.calledWith(mockAuth);
                done();
            });
        });

        it('exits when init fails', (done) => {
            const initStub = sinon.stub(spotifyAuth, 'init').rejects({ message: 'oh oh' });

            vorpal.exec('spotify init', (response) => {
                initStub.restore();
                expect(initStub).to.be.calledOnce; // eslint-disable-line
                expect(response).to.include('Something went wrong');
                done();
            });
        });
    });
});
/* eslint-enable no-unused-expressions */
