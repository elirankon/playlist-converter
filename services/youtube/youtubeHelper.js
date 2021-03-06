const { google } = require('googleapis');
const Promise = require('bluebird');
const _ = require('lodash');
const { fetchAndIterate } = require('../../utils');

let sourceItems = [];
let auth;

function processAutoGenerateYTMusicVideo(video) {
    const { title } = video.snippet;
    if (video.snippet.description.endsWith('Auto-generated by YouTube.')) {
        const videoDescriptionParts = video.snippet.description.split('\n\n');
        return videoDescriptionParts[1];
    }

    return title
        .toLowerCase()
        .replace(/(official video|official audio|music video|official)/g, '')
        .replace(/\W/g, ' ');
}

function fetchItemsFromApi({ id, limit = 50, next } = {}) {
    return new Promise((resolve, reject) => {
        const service = google.youtube('v3');
        const params = {
            auth,
            part: 'snippet',
            type: 'playlist',
            playlistId: id,
            pageToken: next || null,
            maxResults: limit,
        };

        service.playlistItems.list(params, (err, response) => {
            if (err || !response.data) {
                return reject(
                    new Error(
                        `The API returned an error: ${err ? err.message : 'invalid response'}`,
                    ),
                );
            }

            const items = response.data.items.map(processAutoGenerateYTMusicVideo);
            resolve({ items, nextPage: response.data.nextPageToken });
        });
    });
}

async function getItemsFromPlaylist({ id } = {}) {
    sourceItems = [];
    try {
        await fetchAndIterate(fetchItemsFromApi, { id }, async (results) => {
            sourceItems = sourceItems.concat(results.items);
            return results.nextPage;
        });
        return sourceItems.length;
    } catch (ex) {
        throw ex;
    }
}

function searchForVideo({ query } = {}) {
    return new Promise((resolve, reject) => {
        const params = {
            auth,
            q: `${query} lyrics|"official video"|"official audio"`,
            type: 'video',
            part: 'snippet',
            maxResults: 1,
        };

        const service = google.youtube('v3');
        service.search.list(params, (err, response) => {
            if (err) return reject(err);

            const result = response.data.items[0];
            if (!result) {
                console.debug(`no results for query ${query}`);
                return resolve();
            }

            resolve(result.id.videoId);
        });
    });
}

function addItemToPlaylist({ playlistId, videoId }) {
    return new Promise((resolve, reject) => {
        const params = {
            auth,
            part: 'snippet',
            resource: {
                snippet: {
                    playlistId,
                    resourceId: {
                        videoId,
                        kind: 'youtube#video',
                    },
                },
            },
        };

        const service = google.youtube('v3');
        service.playlistItems.insert(params, (err) => {
            if (err) return reject(err);

            console.debug(`video ${videoId} add to playlist ${playlistId}`);
            return resolve();
        });
    });
}

function createPlaylist({ title } = {}) {
    return new Promise((resolve, reject) => {
        if (!title) reject(new Error('You must provide a title'));

        const service = google.youtube('v3');
        service.playlists.insert(
            {
                auth,
                part: 'snippet,status',
                resource: {
                    snippet: {
                        title,
                        description: 'auto created by pConverter',
                    },
                    status: {
                        privacyStatus: 'private',
                    },
                },
            },
            (err, response) => {
                if (err) return reject(err);

                return resolve(response.data.id);
            },
        );
    });
}

async function searchAndGeneratePlaylist({ items, title } = {}) {
    try {
        const videoIds = _.compact(
            await Promise.all(items.map(item => searchForVideo({ query: item }))),
        );
        const playlistId = await createPlaylist({ title });
        console.debug(`playlist ${title} created with Id: ${playlistId}`);
        await Promise.map(videoIds, videoId => addItemToPlaylist({ playlistId, videoId }), {
            concurrency: 1,
        });

        return playlistId;
    } catch (ex) {
        throw ex;
    }
}

function listLoaded() {
    return sourceItems;
}
module.exports = {
    getItemsFromPlaylist,
    searchAndGeneratePlaylist,
    listLoaded,
    setAuth: (newAuth) => {
        auth = newAuth;
        return auth;
    },
};
