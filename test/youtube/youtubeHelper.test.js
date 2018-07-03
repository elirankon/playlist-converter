const sinon = require('sinon');
const chai = require('chai');
const googleapis = require('googleapis');
const chance = require('chance').Chance();
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');

const youtubeHelper = require('../../services/youtube/youtubeHelper');

chai.use(chaiAsPromised);
chai.use(sinonChai);
const { expect } = chai;

describe('youtubeHelper', () => {
    describe('#getItemsFromPlaylist', () => {
        it('gets the playlist items', async () => {
            const playlistStub = sinon
                .stub(googleapis.youtube_v3.Resource$Playlistitems.prototype, 'list')
                .yields(undefined, {
                    data: {
                        items: [
                            {
                                snippet: {
                                    description: chance.string({ length: 8 }),
                                    title: chance.string({ length: 8 }),
                                },
                            },
                        ],
                    },
                });
            const playlistLength = await youtubeHelper.getItemsFromPlaylist({ id: 'sdfsdf' });
            expect(playlistLength).to.equal(1);
            playlistStub.restore();
        });

        it('gets the playlist items and paginates', async () => {
            const playlistStub = sinon
                .stub(googleapis.youtube_v3.Resource$Playlistitems.prototype, 'list')
                .onFirstCall()
                .yields(undefined, {
                    data: {
                        items: [
                            {
                                snippet: {
                                    description: chance.string({ length: 8 }),
                                    title: chance.string({ length: 8 }),
                                },
                            },
                        ],
                        nextPageToken: chance.string(),
                    },
                })
                .onSecondCall()
                .yields(undefined, {
                    data: {
                        items: [
                            {
                                snippet: {
                                    description: chance.string({ length: 8 }),
                                    title: chance.string({ length: 8 }),
                                },
                            },
                        ],
                    },
                });
            const playlistLength = await youtubeHelper.getItemsFromPlaylist({ id: 'sdfsdf' });
            expect(playlistLength).to.equal(2);
            playlistStub.restore();
        });

        it('generates in-memory list of queries from title and/or description', async () => {
            const v1Title = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
            const v2Title = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
            const playlistStub = sinon
                .stub(googleapis.youtube_v3.Resource$Playlistitems.prototype, 'list')
                .onFirstCall()
                .yields(undefined, {
                    data: {
                        items: [
                            {
                                snippet: {
                                    description: chance.string({ length: 8 }),
                                    title: v1Title,
                                },
                            },
                        ],
                        nextPageToken: chance.string(),
                    },
                })
                .onSecondCall()
                .yields(undefined, {
                    data: {
                        items: [
                            {
                                snippet: {
                                    description: chance.string({ length: 8 }),
                                    title: v2Title,
                                },
                            },
                        ],
                    },
                });
            const playlistLength = await youtubeHelper.getItemsFromPlaylist({ id: 'sdfsdf' });
            expect(playlistLength).to.equal(2);
            expect(youtubeHelper.listLoaded()).to.eql([v1Title, v2Title]);
            playlistStub.restore();
        });

        it('gets the query from the description for auto generated by youtube videos', async () => {
            const v1Title = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
            const v2Title = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz' });
            const v1Description = 'This line is ignored\n\nThis line is saved to memory\n\nBlah Blah Auto-generated by YouTube.';
            const playlistStub = sinon
                .stub(googleapis.youtube_v3.Resource$Playlistitems.prototype, 'list')
                .onFirstCall()
                .yields(undefined, {
                    data: {
                        items: [
                            {
                                snippet: {
                                    description: v1Description,
                                    title: v1Title,
                                },
                            },
                        ],
                        nextPageToken: chance.string(),
                    },
                })
                .onSecondCall()
                .yields(undefined, {
                    data: {
                        items: [
                            {
                                snippet: {
                                    description: chance.string({ length: 8 }),
                                    title: v2Title,
                                },
                            },
                        ],
                    },
                });
            const playlistLength = await youtubeHelper.getItemsFromPlaylist({ id: 'sdfsdf' });
            expect(playlistLength).to.equal(2);
            expect(youtubeHelper.listLoaded()).to.eql(['This line is saved to memory', v2Title]);
            playlistStub.restore();
        });

        it('rejects if youtube api returns an error', async () => {
            const playlistStub = sinon
                .stub(googleapis.youtube_v3.Resource$Playlistitems.prototype, 'list')
                .onFirstCall()
                .yields({ message: 'BLAAAH YOU DEAD' }, undefined);
            youtubeHelper.getItemsFromPlaylist({ id: 'sdfsdf' }).catch((err) => {
                expect(err.message).to.equal('The API returned an error: BLAAAH YOU DEAD');
                playlistStub.restore();
            });
        });

        it('rejects if youtube api returns an invalid response', async () => {
            const playlistStub = sinon
                .stub(googleapis.youtube_v3.Resource$Playlistitems.prototype, 'list')
                .onFirstCall()
                .yields(undefined, { response: {} });
            youtubeHelper.getItemsFromPlaylist({ id: 'sdfsdf' }).catch((err) => {
                expect(err.message).to.equal('The API returned an error: invalid response');
                playlistStub.restore();
            });
        });
    });

    describe('#searchAndGeneratePlaylist', () => {
        let searchStub;
        let insertPlaylistItemStub;
        let createPlaylistStub;
        beforeEach(() => {
            youtubeHelper.setAuth({ ping: 'pong' });
        });

        afterEach(() => {
            searchStub.restore();
            insertPlaylistItemStub.restore();
            createPlaylistStub.restore();
        });

        it('searches for youtube videos', async () => {
            searchStub = sinon
                .stub(googleapis.youtube_v3.Resource$Search.prototype, 'list')
                .yields(undefined, {
                    data: {
                        items: [
                            {
                                id: {
                                    videoId: chance.string(),
                                },
                                snippet: {
                                    title: chance.string(),
                                },
                            },
                        ],
                    },
                });
            insertPlaylistItemStub = sinon
                .stub(googleapis.youtube_v3.Resource$Playlistitems.prototype, 'insert')
                .yields();
            createPlaylistStub = sinon
                .stub(googleapis.youtube_v3.Resource$Playlists.prototype, 'insert')
                .yields(undefined, {
                    data: {
                        id: chance.string(),
                    },
                });

            await youtubeHelper.searchAndGeneratePlaylist({
                items: ['blah blah'],
                title: 'bli bli',
            });
            expect(searchStub).to.be.calledWith({
                auth: { ping: 'pong' },
                q: 'blah blah lyrics|"official video"|"official audio"',
                type: 'video',
                part: 'snippet',
                maxResults: 1,
            });
        });
        it('creates a playlist', async () => {
            searchStub = sinon
                .stub(googleapis.youtube_v3.Resource$Search.prototype, 'list')
                .yields(undefined, {
                    data: {
                        items: [
                            {
                                id: {
                                    videoId: chance.string(),
                                },
                                snippet: {
                                    title: chance.string(),
                                },
                            },
                        ],
                    },
                });
            insertPlaylistItemStub = sinon
                .stub(googleapis.youtube_v3.Resource$Playlistitems.prototype, 'insert')
                .yields();
            createPlaylistStub = sinon
                .stub(googleapis.youtube_v3.Resource$Playlists.prototype, 'insert')
                .yields(undefined, {
                    data: {
                        id: chance.string(),
                    },
                });

            await youtubeHelper.searchAndGeneratePlaylist({
                items: ['blah blah'],
                title: 'bli bli',
            });
            expect(createPlaylistStub).to.be.calledWith({
                auth: { ping: 'pong' },
                part: 'snippet,status',
                resource: {
                    snippet: {
                        title: 'bli bli',
                        description: 'auto created by pConverter',
                    },
                    status: {
                        privacyStatus: 'private',
                    },
                },
            });
        });
        it('fetches the first result from the search', async () => {
            const firstVideo = '1stVideo';
            searchStub = sinon
                .stub(googleapis.youtube_v3.Resource$Search.prototype, 'list')
                .yields(undefined, {
                    data: {
                        items: [
                            {
                                id: {
                                    videoId: firstVideo,
                                },
                                snippet: {
                                    title: chance.string(),
                                },
                            },
                            {
                                id: {
                                    videoId: chance.string(),
                                },
                                snippet: {
                                    title: chance.string(),
                                },
                            },
                        ],
                    },
                });
            insertPlaylistItemStub = sinon
                .stub(googleapis.youtube_v3.Resource$Playlistitems.prototype, 'insert')
                .yields();
            createPlaylistStub = sinon
                .stub(googleapis.youtube_v3.Resource$Playlists.prototype, 'insert')
                .yields(undefined, {
                    data: {
                        id: 'playplay1',
                    },
                });

            await youtubeHelper.searchAndGeneratePlaylist({
                items: ['blah blah'],
                title: 'bli bli',
            });
            expect(insertPlaylistItemStub).to.be.calledOnceWith({
                auth: { ping: 'pong' },
                part: 'snippet',
                resource: {
                    snippet: {
                        playlistId: 'playplay1',
                        resourceId: {
                            videoId: firstVideo,
                            kind: 'youtube#video',
                        },
                    },
                },
            });
        });
        it('fails if search fails', async () => {
            searchStub = sinon
                .stub(googleapis.youtube_v3.Resource$Search.prototype, 'list')
                .yields({ message: 'something bad' });
            insertPlaylistItemStub = sinon
                .stub(googleapis.youtube_v3.Resource$Playlistitems.prototype, 'insert')
                .yields();
            createPlaylistStub = sinon
                .stub(googleapis.youtube_v3.Resource$Playlists.prototype, 'insert')
                .yields(undefined, {
                    data: {
                        id: 'playplay1',
                    },
                });

            youtubeHelper
                .searchAndGeneratePlaylist({
                    items: ['blah blah'],
                    title: 'bli bli',
                })
                .catch((err) => {
                    expect(err.message).to.eql('something bad');
                });
        });

        it('rejects if there is no playlist title', async () => {
            searchStub = sinon
                .stub(googleapis.youtube_v3.Resource$Search.prototype, 'list')
                .yields(undefined, {
                    data: {
                        items: [
                            {
                                id: {
                                    videoId: chance.string(),
                                },
                                snippet: {
                                    title: chance.string(),
                                },
                            },
                        ],
                    },
                });
            insertPlaylistItemStub = sinon
                .stub(googleapis.youtube_v3.Resource$Playlistitems.prototype, 'insert')
                .yields();
            createPlaylistStub = sinon
                .stub(googleapis.youtube_v3.Resource$Playlists.prototype, 'insert')
                .yields(undefined, {
                    data: {
                        id: chance.string(),
                    },
                });

            expect(
                youtubeHelper.searchAndGeneratePlaylist({
                    items: ['blah blah'],
                }),
            ).to.be.rejectedWith('You must provide a title');
        });
        it('rejects if there is an error in the youtube api', async () => {
            searchStub = sinon
                .stub(googleapis.youtube_v3.Resource$Search.prototype, 'list')
                .yields(undefined, {
                    data: {
                        items: [
                            {
                                id: {
                                    videoId: chance.string(),
                                },
                                snippet: {
                                    title: chance.string(),
                                },
                            },
                        ],
                    },
                });
            insertPlaylistItemStub = sinon
                .stub(googleapis.youtube_v3.Resource$Playlistitems.prototype, 'insert')
                .yields();
            createPlaylistStub = sinon
                .stub(googleapis.youtube_v3.Resource$Playlists.prototype, 'insert')
                .yields();

            // eslint-disable-next-line
            expect(
                youtubeHelper.searchAndGeneratePlaylist({
                    items: ['blah blah'],
                    title: 'bli bli',
                }),
            ).to.be.rejected;
        });
        it('adds the found videos to the created playlist', async () => {
            searchStub = sinon
                .stub(googleapis.youtube_v3.Resource$Search.prototype, 'list')
                .yields(undefined, {
                    data: {
                        items: [
                            {
                                id: {
                                    videoId: 'vid1',
                                },
                                snippet: {
                                    title: chance.string(),
                                },
                            },
                            {
                                id: {
                                    videoId: 'vid2',
                                },
                                snippet: {
                                    title: chance.string(),
                                },
                            },
                        ],
                    },
                });
            insertPlaylistItemStub = sinon
                .stub(googleapis.youtube_v3.Resource$Playlistitems.prototype, 'insert')
                .yields();
            createPlaylistStub = sinon
                .stub(googleapis.youtube_v3.Resource$Playlists.prototype, 'insert')
                .yields(undefined, {
                    data: {
                        id: 'playplay1',
                    },
                });

            await youtubeHelper.searchAndGeneratePlaylist({
                items: ['bla', 'bli'],
                title: 'bli bli',
            });

            // eslint-disable-next-line
            expect(insertPlaylistItemStub).to.be.calledTwice;
        });

        it('rejects if error in adding videos to the created playlist', async () => {
            searchStub = sinon
                .stub(googleapis.youtube_v3.Resource$Search.prototype, 'list')
                .yields(undefined, {
                    data: {
                        items: [
                            {
                                id: {
                                    videoId: 'vid1',
                                },
                                snippet: {
                                    title: chance.string(),
                                },
                            },
                            {
                                id: {
                                    videoId: 'vid2',
                                },
                                snippet: {
                                    title: chance.string(),
                                },
                            },
                        ],
                    },
                });
            insertPlaylistItemStub = sinon
                .stub(googleapis.youtube_v3.Resource$Playlistitems.prototype, 'insert')
                .callsFake((params, cb) => {
                    cb({ message: 'danger' });
                });
            createPlaylistStub = sinon
                .stub(googleapis.youtube_v3.Resource$Playlists.prototype, 'insert')
                .yields(undefined, {
                    data: {
                        id: 'playplay1',
                    },
                });

            // eslint-disable-next-line
            expect(
                youtubeHelper.searchAndGeneratePlaylist({
                    items: ['bla', 'bli'],
                    title: 'bli bli',
                }),
            ).to.be.rejected;
        });
    });

    describe('#setAuth', () => {
        it('sets the auth for youtube service', () => {
            const mockAuth = { ping: 'pong' };
            expect(youtubeHelper.setAuth(mockAuth)).to.eql(mockAuth);
        });
    });
});
