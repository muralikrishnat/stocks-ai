var mkdirp = require('mkdirp');
var getDirName = require('path').dirname;
var fs = require('fs');

function writeFile(path, contents, cb) {
    mkdirp(getDirName(path), function(err) {
        if (err) return cb(err);
        fs.writeFile(path, contents, cb);
    });
}

module.exports = {
    writeFile
}