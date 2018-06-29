const _ = require('lodash');

async function fetchAndIterate(fetcher, params, iterator) {
    params.limit = params.limit || 20;
    const results = await fetcher(params);
    const next = await iterator(results);
    if (!_.isEmpty(next)) {
        params.next = next;
        return fetchAndIterate(fetcher, params, iterator);
    }
}

module.exports = {
    fetchAndIterate,
};
