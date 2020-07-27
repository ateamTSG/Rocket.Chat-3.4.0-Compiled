'use strict';

module.exports = function parse(options) {
    if (typeof options === 'string') {
        return {
            browsers: options.replace(/\s*,\s*/g, ',').split(','),
        };
    }

    return options;
};
