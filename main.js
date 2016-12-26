var child_process = require('child_process');
var path = require('path');
var watch = require('node-watch');

module.exports = function (watchDirOrMap, mapFilePath) {
    var mainPath = path.dirname(require.main.filename);
    var mapFileAbsolutePath = path.join(mainPath, mapFilePath);

    runGenerateServer(mapFileAbsolutePath);

    if (typeof watchDirOrMap == 'string') {
        watch(watchDirOrMap, function () {
            runGenerateServer(mapFileAbsolutePath);
        });
    }
}

function runGenerateServer(mapFilePath) {
    var serverFilePath = path.join(__dirname, 'server.js');
    var command = "node " + serverFilePath + " " + mapFilePath;

    // child_process.exec(command, function (err, stdout, stderr) {
    //     if (err) console.log(err);
    //     if (stderr) console.log(stderr);
    //     console.log(stdout);
    // });

    console.log(child_process.execSync(command, {encoding: 'utf8'}));
}