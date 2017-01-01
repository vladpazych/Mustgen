var child_process = require('child_process');
var path = require('path');
var watch = require('node-watch');

var generate = function (mapFilePath) {
    var mainPath = path.dirname(require.main.filename);
    var mapFileAbsolutePath = path.join(mainPath, mapFilePath);
    runGenerateServer(mapFileAbsolutePath);
}

generate.watch = function (watchDir, mapFilePath) {
    var mainPath = path.dirname(require.main.filename);
    var mapFileAbsolutePath = path.join(mainPath, mapFilePath);

    runGenerateServer(mapFileAbsolutePath);

    if (typeof watchDir == 'string') {
        watch(watchDir, function () {
            runGenerateServer(mapFileAbsolutePath);
        });
    }
}


module.exports = generate;

function runGenerateServer(mapFilePath) {
    var serverFilePath = path.join(__dirname, 'server.js');
    var command = "node " + serverFilePath + " " + mapFilePath;

    console.log(child_process.execSync(command, { encoding: 'utf8' }));
}