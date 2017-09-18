var webdriver = require('selenium-webdriver');

var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();


var fs = require('fs');
var path = require('path');

var sharesWithNseCodes = [];

var processShares = function(pathToRead) {
    return new Promise((res, rej) => {
        fs.readdir(pathToRead, (err, files) => {
            res({ err, files });
        });
    });

};

var shares = [];
var sharesHash = {};
var sharesFromFiles = function(filePath) {
    return new Promise((res, rej) => {
        fs.readFile(filePath, (err, fileContent) => {
            var filejson = JSON.parse(fileContent.toString());
            sharesHash[filePath] = filejson.shares;
            res(filejson);
        });
    });
};

var getStocksData = function() {
    var nseCode = $('#quotes_summary_current_data .right').children('div:eq(3)').find('span.elp').text().trim();
    $('body').append('<div class="nse-code">' + (window.location.href.replace('https://in.investing.com', '').replace('-historical-data', '')) + '!!!' + nseCode + '</div>');
};
var waitForElementLoad = function() {
    return driver.findElements(webdriver.By.css('#quotes_summary_current_data')).then(function(result) {
        return result[0];
    });
};

var waitForCode = function() {
    return driver.findElements(webdriver.By.css('.nse-code')).then(function(result) {
        return result[0].getText().then((text) => {
            sharesWithNseCodes.push(text);
        });
    });
};
var getDriverByUrl = function(url) {
    return driver.get(url).then(waitForElementLoad).then(function() {
        return driver.executeScript(getStocksData);
    }).then(waitForCode);
};
var sharesToCheck = [];
var stepIndex = 0;
var pickNextStep = function() {
    if (sharesToCheck[stepIndex] && sharesToCheck[stepIndex].link) {
        return getDriverByUrl('https://in.investing.com' + sharesToCheck[stepIndex++].link + '-historical-data').then(pickNextStep);
    } else {
        return {};
    }
};
try {
    sharesFromFiles(path.join(__dirname, 'files/strategy-results/final-stocks-80-100.json')).then((resp) => {
        sharesToCheck = resp.shares;
        return sharesToCheck;
    }).then(() => {
        return pickNextStep().then(() => {
            return {};
        });
    }).then(() => {
        sharesWithNseCodes.forEach((s) => {
            if (s.split('!!!').length > 0) {
                var link = s.split('!!!')[0];
                var nseCode = s.split('!!!')[1];
                sharesToCheck.forEach((g) => {
                    if (g.link.trim() == link.trim()){
                        g.nseCode = nseCode;
                    }
                });
            }

        });
        console.log(sharesToCheck);
        //driver.close();
    });

} catch (er) {
    //swallow it
}