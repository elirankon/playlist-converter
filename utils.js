const _ = require('lodash');

async function fetchAndIterate(fetcher, params, iterator) {
    try {
        params.limit = params.limit || 20;
        const results = await fetcher(params);
        const next = await iterator(results);
        if (!_.isUndefined(next) && !_.isEmpty(next.toString())) {
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
