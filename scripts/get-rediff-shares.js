var path = require('path');
var fs = require('fs');

var sharesInRediffByFile = {};
var sharesInRediff = [];

var readFile = function (filePath, hashObj) {
    return new Promise((res, rej) => {
        fs.readFile(filePath, (err, content) => {
            var filejson = JSON.parse(content.toString());
            hashObj[filePath] = filejson.shares;
            res({ err, content });
        });
    });
};
var readFolder = function (fPath) {
    return new Promise((res, rej) => {
        fs.readdir(fPath, (err, files) => {
            res({ err, files });
        });
    });
};

module.exports = {
    getShares: function () {
        var folderPath = path.join(__dirname, '..', '/files/rediff/total-nse');
        return readFolder(folderPath).then(({ err, files }) => {
            return Promise.all(files.map(f => {
                return readFile(path.join(folderPath, f), sharesInRediffByFile);
            }));
        }).then(() => {
            Object.keys(sharesInRediffByFile).forEach(k => {
                sharesInRediffByFile[k].forEach(s => {
                    sharesInRediff.push(s);
                });
            });
            return { shares: sharesInRediff };
        });
    }
}