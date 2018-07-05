const SpotifyApi = require('spotify-web-api-node');
const Promise = require('bluebird');
const utils = require('../../utils');

const spotifyApi = new SpotifyApi();
let loadedPlaylists = [];
let loadedItems = [];
let currentUserId;

async function getUserPlaylists({ next = 0, limit = 20 }) {
    return spotifyApi.getUserPlaylists({ limit, offset: next });
}

async function getUserPlaylistTracks({
    playlistId, userId, next = 0, limit = 20,
}) {
    return spotifyApi.getPlaylistTracks(userId, playlistId, {
        limit,
        offset: next,
    });
}

function extractValuesFromPlaylist(item) {
    return `${item.track.name} ${item.track.artists.map(artist => artist.name).join(' ')}`;
}

async function searchForTrack(query) {
    const response = await spotifyApi.search(query, ['track'], { limit: 1 });
    const { uri, name } = response.body.items[0];
    console.debug(`found track ${name} - ${uri} for query ${query}`);
    return { uri, name };
}

async function getMyId() {
    const currentUser = await spotifyApi.getMe();
    currentUserId = currentUser.body.id;
    return currentUserId;
}

async function createPlaylist({ title }) {
    const newPlaylistResponse = await spotifyApi.createPlaylist(currentUserId, title);
    console.debug(
        `created playlist ${newPlaylistResponse.body.name} with id ${newPlaylistResponse.body.id}`,
    );
    return newPlaylistResponse.body.id;
}

async function addTracksToPlaylist({ tracks, playlistId }) {
    await spotifyApi.addTracksToPlaylist(currentUserId, playlistId, tracks.map(track => track.uri));

    return playlistId;
}

async function generateNewPlaylist({ items, title }) {
    const playlistId = await createPlaylist({ title });
    const tracks = await Promise.map(items, searchForTrack, { concurrency: 1 });
    return addTracksToPlaylist({ tracks, playlistId });
}

async function loadPlaylistTracks(userId, playlistId) {
    await utils.fetchAndIterate(getUserPlaylistTracks, { userId, playlistId }, async (response) => {
        loadedItems = loadedItems.concat(response.body.items.map(extractValuesFromPlaylist));
        if (
            response.body.items.length === response.body.limit
            && response.body.total > loadedItems.length
        ) {
            // eslint-disable-next-line radix
            return parseInt(response.body.limit) + parseInt(response.body.offset);
        }
    });

    return loadedItems.length;
}

function getUserPlaylistSelection(cliSession) {
    return new Promise((resolve) => {
        cliSession.prompt(
            {
                type: 'list',
                name: 'selectedPlaylist',
                message: 'Please select a playlist to load',
                choices: loadedPlaylists.map(playlist => ({
                    name: `${playlist.name} by ${playlist.owner.display_name}`,
                    value: {
                        playlistId: playlist.id,
                        userId: playlist.owner.id,
                    },
                })),
                pageSize: 10,
            },
            (response) => {
                resolve(response.selectedPlaylist);
            },
        );
    });
}

async function selectFollowingPlaylists(cliSession, params = {}) {
    await utils.fetchAndIterate(getUserPlaylists, params, async (response) => {
        loadedPlaylists = loadedPlaylists.concat(response.body.items);
        if (
            response.body.items.length === response.body.limit
            && response.body.total > loadedPlaylists.length
        ) {
            return response.body.limit + response.body.offset;
        }
    });

    if (loadedPlaylists.length === 0) throw new Error('User does not follow any playlists');

    return getUserPlaylistSelection(cliSession);
}

async function loadUserPlaylist(cliSession, params) {
    const { playlistId, userId } = await selectFollowingPlaylists(cliSession, params);
    return loadPlaylistTracks(userId, playlistId);
}

function listLoaded() {
    return loadedItems;
}

module.exports = {
    setAuth: (authToken) => {
        spotifyApi.setAccessToken(authToken);
        return authToken;
    },
    getMyId,
    loadUserPlaylist,
    listLoaded,
    resetLoadedItems: () => {
        loadedItems = [];
        loadedPlaylists = [];
    },
    generateNewPlaylist,
};
