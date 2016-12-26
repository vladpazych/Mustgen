var mustache = require('mustache');
var fs = require('fs-extra');
var path = require('path');
var mkdirp = require('mkdirp');
var Promise = require('promise');

module.exports = function generate(mapFilePath) {
    var startTime = Date.now();
    var map = require(mapFilePath);
    var mainPath = getDirFromFile(mapFilePath);

    for (var i = 0; i < map.length; i++) {
        (function (i) {
            if (!checkMapStructure(map, i)) return;

            var file = map[i];
            var templatePath = path.join(mainPath, file.template);
            var outputPath = path.join(mainPath, file.output);
            var partials = getPartials(mainPath, file.partials);
            var data = file.data;

            var outputContent;

            cleanGenerateDir(outputPath)
                .then(function () {
                    return readTemplateFile(templatePath);
                })
                .catch(showError)
                .then(function (template) {
                    return renderTemplate(template, data, partials);
                })
                .catch(showError)
                .then(function (output) {
                    outputContent = output;
                    return ensureDir(outputPath);
                })
                .catch(showError)
                .then(function () {
                    return writeTemplateToFile(outputPath, outputContent);
                })
                .catch(showError)
                .then(function () {
                    if (i == map.length - 1) {
                        var endTime = Date.now();
                        var resultTime = prettyDate(endTime, startTime);
                        var fdef = i > 1 ? "files" : "file";
                        console.log("Generation complete: " + map.length + " " + fdef + " generated in " + resultTime)
                    }
                });
        })(i);
    }


}

//
// Promises
//
function cleanGenerateDir(outputPath) {
    return new Promise(function (fulfill, reject) {
        fs.emptyDir(getDirFromFile(outputPath), function (err) {
            if (err) reject(err);
            else fulfill();
        })
    });
}

function readTemplateFile(templatePath) {
    return new Promise(function (fulfill, reject) {
        fs.readFile(templatePath, 'utf8', function (err, data) {
            if (err) reject(err);
            else fulfill(data);
        });
    });
}

function writeTemplateToFile(outputPath, outputContent) {
    return new Promise(function (fulfill, reject) {
        fs.writeFile(outputPath, outputContent, { flag: 'w' }, function (err) {
            if (err) reject(err);
            else fulfill();
        });
    });
}

function ensureDir(outputPath) {
    return new Promise(function (fulfill, reject) {
        mkdirp(getDirFromFile(outputPath), function (err) {
            if (err) reject(err);
            else fulfill();
        });
    });
}

function renderTemplate(template, data, partials) {
    return new Promise(function (fulfill, reject) {
        var output = mustache.render(template, data, partials);
        fulfill(output);
    });
}







//
// Checks
//
function checkMapStructure(map, i) {
    if (map[i] == undefined) {
        showError('map is undefined');
        return false;
    }
    if (typeof map[i].template != 'string') {
        showError("can't find map.template in file #" + i);
        return false;
    }
    if (typeof map[i].output != 'string') {
        showError("can't find map.output in file #" + i);
        return false;
    }

    return true;
}



//
// FS Helpers
//
function getPartials(mainPath, obj) {
    if (obj == undefined) return {};
    var partials = obj;
    var result = {};

    for (var key in partials) {
        result[key] = fs.readFileSync(path.join(mainPath, partials[key]), 'utf8');
    }

    return result;
}

function getDirFromFile(str) {
    var arr = str.split('/');
    arr.pop();
    return arr.join('/');
}



//
// Common Helpers
//
function showError(err) {
    console.log("Generation error: " + err);
}

function showInfo(info) {
    console.log("Generation info: " + info);
}

function prettyDate(endTime, startTime) {
    var ms = Math.floor((endTime - startTime));
    if (ms < 1000) return ms + "ms";
    else return Math.floor(ms / 1000) + "sec " + ms % 1000 + "ms";
    return secs;
}