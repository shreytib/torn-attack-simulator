const GLOBALS = {
    debug: false
};

const _originalLog = console.log;
console.log = (...args) => {
    if (GLOBALS.debug) _originalLog(...args);
};
