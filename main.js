var watch = require('node-watch');
var generate = require('./generate');

module.exports = function (watchDirOrMap, map) {
    generate(map);

    if (typeof watchDirOrMap == 'string') {
        watch(watchDirOrMap, function () {
            generate(map);
        });
    }
}