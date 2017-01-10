var fs = require('fs-extra');
var path = require('path');
var Promise = require('promise');
var Handlebars = require('handlebars');
var generatedSuffix = "_generated";

module.exports = function generate(mapFilePath) {
    var startTime = Date.now();
    var map = require(mapFilePath);
    var mainPath = getDirFromFile(mapFilePath);
    var outputPath = path.join(mainPath, map.output);

    if (!map.output.includes(generatedSuffix)) {
        showError("For safety reasons, output folder name should contain " + generatedSuffix + " part.");
        return;
    }

    var partials = getPartials(mainPath, map.partials);
    for (var key in partials) {
        Handlebars.registerPartial(key, partials[key]);
    }

    var helpers = map.helpers;
    for (var key in helpers) {
        Handlebars.registerHelper(key, helpers[key]);
    }

    cleanGenerateDir(outputPath, map.files)
        .then(function () {
            for (var i = 0; i < map.files.length; i++) {
                (function (i) {
                    if (!checkMapStructure(map.files, i)) return;

                    var file = map.files[i];
                    var templatePath = path.join(mainPath, file.template);
                    var fileOutputPath = path.join(outputPath, file.output);

                    var data = file.data;

                    var outputContent;

                    readTemplateFile(templatePath)
                        .then(function (template) {
                            return renderTemplate(template, data, partials);
                        })
                        .then(function (output) {
                            outputContent = output;
                            return ensureDir(fileOutputPath);
                        })
                        .then(function () {
                            return writeTemplateToFile(fileOutputPath, outputContent);
                        })
                        .then(function () {
                            if (i == map.files.length - 1) {
                                var endTime = Date.now();
                                var resultTime = prettyDate(endTime, startTime);
                                var fdef = i > 1 ? "files" : "file";
                                console.log("Generation complete: " + map.files.length + " " + fdef + " generated in " + resultTime)
                            }
                        })
                        .done();
                })(i);
            }
        });
}

//
// Promises
//
function cleanGenerateDir(outputPath, files) {
    return new Promise(function (fulfill, reject) {
        var arr = outputPath.split('/');
        var dir = arr[arr.length - 1];
        var allFiles = getAllFiles(outputPath, null, '.meta');
        var neededFiles = getFileListFromFileObject(outputPath, files);
        var filesToDelete = [];

        for (var i = 0; i < allFiles.length; i++) {
            var currentFile = allFiles[i];
            if (neededFiles.indexOf(currentFile) == -1) filesToDelete.push(currentFile);
        }

        if (dir.includes("_generated")) {
            for (var i = 0; i < filesToDelete.length; i++) {
                fs.unlink(filesToDelete[i]);
            }
            
            fulfill();

            // Temporarly commented beacuse we may return to this solution, it's faster.
            // fs.emptyDir(outputPath, function (err) {
            //     if (err) reject(err);
            //     else fulfill();
            // })
        } else {
            reject();
            showError("Can't clean directory without '" + generatedSuffix + "' part in it's name.");
            console.log(outputPath);
        }
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
        fs.ensureDir(getDirFromFile(outputPath), function (err) {
            if (err) reject(err);
            else fulfill();
        });
    });
}

function renderTemplate(template, data, partials) {
    return new Promise(function (fulfill, reject) {
        var compiled = Handlebars.compile(template, {noEscape: true});
        var output = compiled(data);
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

function addSuffixToFileName(str) {
    var arr = str.split('/');
    arr.pop();
    var last = arr[arr.length - 1].split(".");
    arr[arr.length - 1] = last[0] + generatedSuffix + "." + last[1];
    return arr.join('/');
}

function getDirFromFile(str) {
    var arr = str.split('/');
    arr.pop();
    return arr.join('/');
}

function getAllFiles(dir, filelist, excepthEnding) {
    var files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = getAllFiles(path.join(dir, file), filelist, excepthEnding);
        }
        else {
            if (excepthEnding) {
                if (file.indexOf(excepthEnding) == -1) {
                    filelist.push(path.join(dir, file));
                }
            } else {
                filelist.push(path.join(dir, file));
            }
        }
    });
    return filelist;
}

function getFileListFromFileObject(outputPath, files) {
    var result = [];
    for (var key in files) {
        result.push(path.join(outputPath, files[key].output));
    }

    return result;
}

function fsExistsSync(myDir) {
    try {
        fs.accessSync(myDir);
        return true;
    } catch (e) {
        return false;
    }
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