const { google } = require('googleapis');
const { fetchAndIterate } = require('./utils');

let sourceItems = [];

function processAutoGenerateYTMusicVideo(video) {
    const { title } = video.snippet;
    if (video.snippet.description.endsWith('Auto-generated by YouTube.')) {
        const videoDescriptionParts = video.snippet.description.split('\n\n');
        return videoDescriptionParts[1];
    }

    return title
        .toLowerCase()
        .replace(/(official video|official audio|music video)/g, '')
        .replace(/\W/g, ' ');
}

function fetchItemsFromApi({
    auth, id, limit = 50, next,
} = {}) {
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
                reject(new Error(`The API returned an error: ${err}`));
            }

            const items = response.data.items.map(processAutoGenerateYTMusicVideo);
            resolve({ items, nextPage: response.data.nextPageToken });
        });
    });
}

async function getItemsFromPlaylist({ auth, id } = {}) {
    sourceItems = [];
    await fetchAndIterate(fetchItemsFromApi, { auth, id }, async (results) => {
        sourceItems = sourceItems.concat(results.items);
        return results.nextPage;
    });

    return sourceItems.length;
}

function searchForVideo({ auth, query } = {}) {
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
            if (err) reject(err);

            const result = response.items[0];
            console.log(`found video ${result.snippet.title} for query ${query}`);
            resolve(result.id.videoId);
        });
    });
}

function addItemToPlaylist({ auth, playlistId, videoId }) {
    return new Promise((resolve, reject) => {
        const params = {
            auth,
            part: 'snippet',
            resource: {
                snippet: {
                    playlistId,
                    videoId,
                    kind: 'youtube#video',
                },
            },
        };

        const service = google.youtube('v3');
        service.playlistItems.insert(params, (err, response) => {
            if (err) return reject(err);

            console.debug('add item response', response);
            return resolve();
        });
    });
}

function createPlaylist({ auth, title } = {}) {
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
                    },
                    status: {
                        privacyStatus: 'private',
                    },
                },
            },
            (err, response) => {
                if (err) return reject(err);

                return resolve(response.result.id);
            },
        );
    });
}

async function searchAndGeneratePlaylist({ auth, items, title } = {}) {
    const videoIds = await Promise.all(items.map(item => searchForVideo({ auth, query: item })));
    const playlistId = await createPlaylist({ auth, title });

    await Promise.all(videoIds.map(videoId => addItemToPlaylist({ auth, playlistId, videoId })));

    return playlistId;
}

function listLoaded() {
    return sourceItems;
}
module.exports = {
    getItemsFromPlaylist,
    searchAndGeneratePlaylist,
    listLoaded,
};
