const SpotifyApi = require('spotify-web-api-node');
const utils = require('../../utils');

const spotifyApi = new SpotifyApi();
let loadedPlaylists = [];
let loadedItems = [];

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
    loadUserPlaylist,
    listLoaded,
    resetLoadedItems: () => {
        loadedItems = [];
        loadedPlaylists = [];
    },
};
