before(() => {
    // silence the console
    console.debug = () => {};
});

after(() => {
    // reset console
    delete console.debug;
});
