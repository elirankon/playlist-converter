const _ = require('lodash');

async function fetchAndIterate(fetcher, params, iterator) {
    try {
        params.limit = params.limit || 20;
        const results = await fetcher(params);
        const next = await iterator(results);
        if (!_.isEmpty(next)) {
            params.next = next;
            return fetchAndIterate(fetcher, params, iterator);
        }
    } catch (ex) {
        throw ex;
    }
}

module.exports = {
    fetchAndIterate,
};
