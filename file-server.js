var url = require('url');

var fs = require('fs');
var path = require('path');


var sendResponse = function(response, body) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    response.writeHead(200, {
        'Content-Type': 'application/json'
    });
    response.end(body);
}
module.exports = function(options) {
    fePort = options.fePort;
    folder = options.folder || 'app';
    var server = require('https').createServer({
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('cert.pem')
    }, (request, response) => {

        var body = '';
        if (request.url.indexOf('api') >= 0) {
            request.on('data', function(chunk) {
                body += chunk;
            });
        }

        request.addListener('end', function() {
            if (request.method === 'OPTIONS') {
                response.setHeader('Access-Control-Allow-Origin', '*');
                response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
                response.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                response.end();

            } else if (request.url.indexOf('api') >= 0) {
                let parsedData = JSON.parse(body);
                if (parsedData.write) {
                    fs.writeFile(path.join(__dirname, 'files', fileName), body, (err) => {
                        console.log('fileName ', fileName, err);
                    });
                    sendResponse(response, body);
                } else if (parsedData.shares) {
                    console.log('shares ', parsedData.shares.length);
                    var fileName = parsedData.fileName;
                    fs.writeFile(path.join(__dirname, 'files', fileName), body, (err) => {
                        console.log('fileName ', fileName, err);
                    });
                    sendResponse(response, body);
                } else if (parsedData.action === "GET-FOLDER") {
                    fs.readdir(path.join(__dirname, parsedData.folderName), (err, files) => {
                        sendResponse(response, JSON.stringify({
                            data: files
                        }));
                    });
                } else {
                    sendResponse(response, body);
                }

            } else {
                fs.exists(path.join(__dirname, request.url), (exists) => {
                    if (exists) {
                        fs.readFile(path.join(__dirname, request.url), (err, fileContent) => {
                            response.end(fileContent);
                        });
                    } else {
                        response.writeHead(404);
                        response.end('');
                    }
                });
            }
        }).resume();
    }).listen(fePort, options.ip || '127.0.0.1', () => {
        console.log('Server Listining on ' + fePort);
    })

    var uiServe = require('http').createServer((request, response) => {
        var body = '';
        if (request.url.indexOf('api') >= 0) {
            request.on('data', function(chunk) {
                body += chunk;
            });
        }

        request.addListener('end', function() {
            if (request.method === 'OPTIONS') {
                response.setHeader('Access-Control-Allow-Origin', '*');
                response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
                response.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                response.end();

            } else if (request.url.indexOf('api') >= 0) {
                let parsedData = JSON.parse(body);
                if (parsedData.shares) {
                    console.log('shares ', parsedData.shares.length);
                    var fileName = parsedData.fileName;
                    fs.writeFile(path.join(__dirname, 'files', fileName), body, (err) => {
                        console.log('fileName ', fileName, err);
                    });
                    sendResponse(response, body);
                } else if (parsedData.action === "GET-FOLDER") {
                    fs.readdir(path.join(__dirname, parsedData.folderName), (err, files) => {
                        sendResponse(response, JSON.stringify({
                            data: files
                        }));
                    });
                } else {
                    sendResponse(response, body);
                }

            } else {
                var fileName = 'index.html';
                var folderName = 'ui';
                if (request.url != '/') {
                    fileName = request.url;
                }
                if (request.url.indexOf('files') >= 0) {
                    folderName = '';
                }
                var filePathTocheck = path.join(__dirname, folderName, fileName);
                fs.exists(filePathTocheck, (exists) => {
                    if (exists) {
                        fs.readFile(filePathTocheck, (err, fileContent) => {
                            response.end(fileContent);
                        });
                    } else {
                        fs.readFile(path.join(__dirname, 'ui', 'index.html'), (err, fileContent) => {
                            response.end(fileContent);
                        });
                    }
                });
            }
        }).resume();
    }).listen(3435, options.ip || '127.0.0.1', () => {
        console.log('Server Listining on 3435');
    })
};