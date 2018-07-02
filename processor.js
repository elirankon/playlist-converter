let sourceService;
let targetService;

module.exports = {
    sourceService: (service) => {
        if (service) sourceService = service;

        return sourceService;
    },
    targetService: (service) => {
        if (service) targetService = service;

        return targetService;
    },
    start: async ({ title }) => {
        try {
            await targetService.generate({ items: sourceService.getSourceItems(), title });
            return 'Playlist converted!';
        } catch (ex) {
            throw ex;
        }
    },
};
