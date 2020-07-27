'use strict';

const getAutoprefixProcessor = require('./autoprefix-processor');
const usage = require('./usage');
const parseOptions = require('./parse-options');

module.exports = LessPluginAutoPrefixer;

function LessPluginAutoPrefixer(options) {
    this.options = options;
}

LessPluginAutoPrefixer.prototype = {
    install(less, pluginManager) {
        const AutoprefixProcessor = getAutoprefixProcessor(less);

        pluginManager.addPostProcessor(new AutoprefixProcessor(this.options));
    },
    printUsage() {
        usage.printUsage();
    },
    setOptions(options) {
        this.options = parseOptions(options);
    },
    minVersion: [2, 0, 0],
};
