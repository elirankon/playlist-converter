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
    start: async ({ title }) => targetService.generate({ items: sourceService.getSourceItems(), title }),
};
