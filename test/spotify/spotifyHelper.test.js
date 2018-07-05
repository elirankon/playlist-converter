const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const _ = require('lodash');
const SpotifyApi = require('spotify-web-api-node');
const mockPlaylists = require('./mockPlaylists.json');
const spotifyHelper = require('../../services/spotify/spotifyHelper');

const cliSessionStub = {
    prompt: (params, callback) => {
        callback({ selectedPlaylist: { userId: 'gigi', playlistId: 'gaga' } });
    },
};

chai.use(sinonChai);
const { expect } = chai;

describe('spotifyHelper', () => {
    describe('#getMyId', () => {
        it('gets the current user from spotify', async () => {
            const getMeStub = sinon
                .stub(SpotifyApi.prototype, 'getMe')
                .resolves({ body: { id: 'moo' } });

            await spotifyHelper.getMyId();

            expect(getMeStub).to.be.called; // eslint-disable-line no-unused-expressions

            getMeStub.restore();
        });

        it('sets the current user Id', async () => {
            const getMeStub = sinon
                .stub(SpotifyApi.prototype, 'getMe')
                .resolves({ body: { id: 'moo' } });

            const id = await spotifyHelper.getMyId();

            expect(id).to.eql('moo');

            getMeStub.restore();
        });
    });

    describe('#generateNewPlaylist', () => {
        it('creates a playlist', (done) => {
            const createPlaylistStub = sinon.stub(SpotifyApi.prototype, 'createPlaylist').throws();

            spotifyHelper.generateNewPlaylist({ items: [], title: 'gaga' }).catch(() => {
                createPlaylistStub.restore();
                // eslint-disable-next-line no-unused-expressions
                expect(createPlaylistStub).to.be.called;
                done();
            });
        });

        it('loops through tracks and searches in spotify', async () => {
            const createPlaylistStub = sinon.stub(SpotifyApi.prototype, 'createPlaylist').resolves({
                body: { name: 'gaga', id: 'gagaid' },
            });

            const searchStub = sinon.stub(SpotifyApi.prototype, 'search').resolves({
                body: {
                    tracks: {
                        items: [{ uri: 'uriuri', name: 'namename' }],
                    },
                },
            });

            const addToPlaylistStub = sinon
                .stub(SpotifyApi.prototype, 'addTracksToPlaylist')
                .resolves();

            await spotifyHelper.generateNewPlaylist({
                items: ['gallgaa', 'gagaga33'],
                title: 'gaga',
            });

            createPlaylistStub.restore();
            searchStub.restore();
            addToPlaylistStub.restore();
            // eslint-disable-next-line no-unused-expressions
            expect(searchStub).to.be.calledTwice;
        });

        it('adds the results to the new playlist', async () => {
            const createPlaylistStub = sinon.stub(SpotifyApi.prototype, 'createPlaylist').resolves({
                body: { name: 'gaga', id: 'gagaid' },
            });

            const searchStub = sinon.stub(SpotifyApi.prototype, 'search').resolves({
                body: {
                    tracks: {
                        items: [{ uri: 'uriuri', name: 'namename' }],
                    },
                },
            });

            const addToPlaylistStub = sinon
                .stub(SpotifyApi.prototype, 'addTracksToPlaylist')
                .resolves();

            await spotifyHelper.generateNewPlaylist({ items: ['gallgaa'], title: 'gaga' });

            createPlaylistStub.restore();
            searchStub.restore();
            addToPlaylistStub.restore();
            // eslint-disable-next-line no-unused-expressions
            expect(addToPlaylistStub).to.be.calledWith('moo', 'gagaid', ['uriuri']);
        });

        it('ignores queries without results', async () => {
            const createPlaylistStub = sinon.stub(SpotifyApi.prototype, 'createPlaylist').resolves({
                body: { name: 'gaga', id: 'gagaid' },
            });

            const searchStub = sinon.stub(SpotifyApi.prototype, 'search').resolves({
                body: {
                    tracks: {
                        items: [],
                    },
                },
            });

            const addToPlaylistStub = sinon
                .stub(SpotifyApi.prototype, 'addTracksToPlaylist')
                .resolves();

            await spotifyHelper.generateNewPlaylist({ items: ['gallgaa'], title: 'gaga' });

            createPlaylistStub.restore();
            searchStub.restore();
            addToPlaylistStub.restore();
            // eslint-disable-next-line no-unused-expressions
            expect(addToPlaylistStub).to.be.calledWith('moo', 'gagaid', []);
        });
    });

    describe('#setAuth', () => {
        it('sets the auth in spotifyApi', async () => {
            const mockAuth = 'mockmock';
            const spotifyApiAuthStub = sinon.stub(SpotifyApi.prototype, 'setAccessToken');

            const authResponse = spotifyHelper.setAuth(mockAuth);
            expect(authResponse).to.eql(mockAuth);
            expect(spotifyApiAuthStub).to.have.been.calledWith(mockAuth);
            spotifyApiAuthStub.restore();
        });
    });

    describe('#loadUserPlaylist', () => {
        beforeEach(() => {
            spotifyHelper.resetLoadedItems();
        });

        it('gets the followed playlists', async () => {
            const mockResult = _.cloneDeep(mockPlaylists);
            mockResult.body.limit = 1;
            mockResult.body.offset = 0;
            mockResult.body.total = 1;
            mockResult.body.items.splice(1, 1);
            const getPlaylistFromSpotifyStub = sinon
                .stub(SpotifyApi.prototype, 'getUserPlaylists')
                .resolves(mockResult);

            const getTracksStub = sinon
                .stub(SpotifyApi.prototype, 'getPlaylistTracks')
                .resolves({ body: { items: [] } });

            await spotifyHelper.loadUserPlaylist(cliSessionStub, {});

            getPlaylistFromSpotifyStub.restore();
            getTracksStub.restore();
            expect(getPlaylistFromSpotifyStub).to.be.calledWith({ limit: 20, offset: 0 });
        });

        it('paginates through all the results', async () => {
            const mockResult = _.cloneDeep(mockPlaylists);
            mockResult.body.limit = 1;
            mockResult.body.offset = 0;
            mockResult.body.total = 2;
            mockResult.body.items.splice(1, 1);

            const mockResult2 = _.cloneDeep(mockPlaylists);
            mockResult.body.limit = 1;
            mockResult.body.offset = 1;
            mockResult.body.total = 2;
            mockResult.body.items.splice(1, 1);
            const getPlaylistFromSpotifyStub = sinon
                .stub(SpotifyApi.prototype, 'getUserPlaylists')
                .onFirstCall()
                .resolves(mockResult)
                .onSecondCall()
                .resolves(mockResult2);

            const getTracksStub = sinon
                .stub(SpotifyApi.prototype, 'getPlaylistTracks')
                .resolves({ body: { items: [] } });

            await spotifyHelper.loadUserPlaylist(cliSessionStub, {});

            getPlaylistFromSpotifyStub.restore();
            getTracksStub.restore();
            // eslint-disable-next-line no-unused-expressions
            expect(getPlaylistFromSpotifyStub).to.be.calledTwice;
        });

        it('rejects when spotify returns an error on get playlist', async () => {
            const getPlaylistFromSpotifyStub = sinon
                .stub(SpotifyApi.prototype, 'getUserPlaylists')
                .rejects();

            const getTracksStub = sinon
                .stub(SpotifyApi.prototype, 'getPlaylistTracks')
                .resolves({ body: { items: [] } });

            spotifyHelper.loadUserPlaylist(cliSessionStub, {}).catch((err) => {
                expect(typeof err).to.eql('object'); // eslint-disable-line no-unused-expressions
            });

            getPlaylistFromSpotifyStub.restore();
            getTracksStub.restore();
        });

        it('prompts the user to select a playlist', async () => {
            const promptStub = sinon.stub().callsFake((params, cb) => {
                cb({ selectedPlaylist: { userId: 'bbb', playlistId: 'bcc' } });
            });
            const sessionStub = {
                prompt: promptStub,
            };
            const mockResult = _.cloneDeep(mockPlaylists);
            mockResult.body.limit = 1;
            mockResult.body.offset = 0;
            mockResult.body.total = 1;
            mockResult.body.items.splice(1, 1);
            const getPlaylistFromSpotifyStub = sinon
                .stub(SpotifyApi.prototype, 'getUserPlaylists')
                .resolves(mockResult);

            const getTracksStub = sinon
                .stub(SpotifyApi.prototype, 'getPlaylistTracks')
                .resolves({ body: { items: [] } });

            await spotifyHelper.loadUserPlaylist(sessionStub, {});

            getPlaylistFromSpotifyStub.restore();
            getTracksStub.restore();
            // eslint-disable-next-line no-unused-expressions
            expect(promptStub).to.be.called;
        });

        it('gets the selected playlist tracks', async () => {
            const promptStub = sinon.stub().callsFake((params, cb) => {
                cb({ selectedPlaylist: { userId: 'bbb', playlistId: 'bcc' } });
            });
            const sessionStub = {
                prompt: promptStub,
            };
            const mockResult = _.cloneDeep(mockPlaylists);
            mockResult.body.limit = 1;
            mockResult.body.offset = 0;
            mockResult.body.total = 1;
            mockResult.body.items.splice(1, 1);
            const getPlaylistFromSpotifyStub = sinon
                .stub(SpotifyApi.prototype, 'getUserPlaylists')
                .resolves(mockResult);

            const getTracksStub = sinon.stub(SpotifyApi.prototype, 'getPlaylistTracks').resolves({
                body: {
                    items: [{ track: { name: 'bbb', artists: [{ name: 'gaga' }] } }],
                    limit: 1,
                    total: 1,
                    offset: 0,
                },
            });

            await spotifyHelper.loadUserPlaylist(sessionStub, {});

            getPlaylistFromSpotifyStub.restore();
            getTracksStub.restore();
            // eslint-disable-next-line no-unused-expressions
            expect(getTracksStub).to.be.calledWith('bbb', 'bcc');
        });

        it('rejects when spotify returns an error on get tracks', async () => {
            const promptStub = sinon.stub().callsFake((params, cb) => {
                cb({ selectedPlaylist: { userId: 'bbb', playlistId: 'bcc' } });
            });
            const sessionStub = {
                prompt: promptStub,
            };
            const mockResult = _.cloneDeep(mockPlaylists);
            mockResult.body.limit = 1;
            mockResult.body.offset = 0;
            mockResult.body.total = 1;
            mockResult.body.items.splice(1, 1);
            const getPlaylistFromSpotifyStub = sinon
                .stub(SpotifyApi.prototype, 'getUserPlaylists')
                .resolves(mockResult);

            const getTracksStub = sinon.stub(SpotifyApi.prototype, 'getPlaylistTracks').rejects();

            spotifyHelper.loadUserPlaylist(sessionStub, {}).catch((err) => {
                getPlaylistFromSpotifyStub.restore();
                getTracksStub.restore();
                expect(typeof err).to.eql('object');
            });
        });

        it('paginates through all the tracks results', async () => {
            const promptStub = sinon.stub().callsFake((params, cb) => {
                cb({ selectedPlaylist: { userId: 'bbb', playlistId: 'bcc' } });
            });
            const sessionStub = {
                prompt: promptStub,
            };
            const mockResult = _.cloneDeep(mockPlaylists);
            mockResult.body.limit = 1;
            mockResult.body.offset = 0;
            mockResult.body.total = 1;
            mockResult.body.items.splice(1, 1);
            const getPlaylistFromSpotifyStub = sinon
                .stub(SpotifyApi.prototype, 'getUserPlaylists')
                .resolves(mockResult);

            const getTracksStub = sinon
                .stub(SpotifyApi.prototype, 'getPlaylistTracks')
                .onFirstCall()
                .resolves({
                    body: {
                        items: [{ track: { name: 'bbb', artists: [{ name: 'gaga' }] } }],
                        limit: 1,
                        total: 2,
                        offset: 0,
                    },
                })
                .onSecondCall()
                .resolves({
                    body: {
                        items: [{ track: { name: 'bbc', artists: [{ name: 'gaga' }] } }],
                        limit: 1,
                        total: 2,
                        offset: 1,
                    },
                });

            await spotifyHelper.loadUserPlaylist(sessionStub, {});

            getPlaylistFromSpotifyStub.restore();
            getTracksStub.restore();
            // eslint-disable-next-line no-unused-expressions
            expect(getTracksStub).to.be.calledTwice;
        });

        it('formats a query string to store in memory for migration', async () => {
            const promptStub = sinon.stub().callsFake((params, cb) => {
                cb({ selectedPlaylist: { userId: 'bbb', playlistId: 'bcc' } });
            });
            const sessionStub = {
                prompt: promptStub,
            };
            const mockResult = _.cloneDeep(mockPlaylists);
            mockResult.body.limit = 1;
            mockResult.body.offset = 0;
            mockResult.body.total = 1;
            mockResult.body.items.splice(1, 1);
            const getPlaylistFromSpotifyStub = sinon
                .stub(SpotifyApi.prototype, 'getUserPlaylists')
                .resolves(mockResult);

            const getTracksStub = sinon.stub(SpotifyApi.prototype, 'getPlaylistTracks').resolves({
                body: {
                    items: [{ track: { name: 'bbb', artists: [{ name: 'gaga' }] } }],
                    limit: 1,
                    total: 1,
                    offset: 0,
                },
            });

            await spotifyHelper.loadUserPlaylist(sessionStub, {});

            getPlaylistFromSpotifyStub.restore();
            getTracksStub.restore();
            // eslint-disable-next-line no-unused-expressions
            expect(spotifyHelper.listLoaded().length).to.eql(1);
        });
    });
});
