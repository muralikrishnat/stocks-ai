var { writeFile } = require('./scripts/file-manager');
var { runInInvesting } = require('./scripts/investing-scritps');
var { runInRediff } = require('./scripts/rediff-scripts');
var path = require('path');
var webdriver = require('selenium-webdriver');
var logger = function(msg) {
    var t = new Date();
    console.log(' [LOG => ' + t.getMinutes() + ':' + t.getSeconds() + ':' + t.getMilliseconds() + '] ' + msg);
};

module.exports = {
    getLinksWithNseCodes: function(nseCodes) {
        // var nseCodes = [{
        //     nseCode: '20MICRONS'
        // }];

        var investingWindow, rediffWindow;
        var investingWindow = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();
        var rediffWindow = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();

        var investingJson = {},
            isharesDone = false,
            rediffJson = {},
            rsharesDone = false;
        var ipromise = investingWindow.get('https://in.investing.com/equities/').then(() => {
            return investingWindow.executeScript(runInInvesting, nseCodes);
        });

        var rproimse = rediffWindow.get('http://money.rediff.com/companies/20-Microns-Ltd/15110088?snssrc=sugg').then(() => {
            return rediffWindow.executeScript(runInRediff, nseCodes);
        });
        var promise, timer;
        var checkLinks = function() {
            if (!isharesDone) {
                investingWindow.findElements(webdriver.By.css('.investing-links')).then(function(result) {
                    if (result && result.length > 0) {
                        result[0].getText().then((text) => {
                            investingJson = JSON.parse(text.trim());
                            isharesDone = true;
                        });
                    }
                });
            }

            if (!rsharesDone) {
                rediffWindow.findElements(webdriver.By.css('.rediff-links')).then(function(result) {
                    if (result && result.length > 0) {
                        result[0].getText().then((text) => {
                            rediffJson = JSON.parse(text.trim());
                            rsharesDone = true;
                        });
                    }
                });
            }
            if (isharesDone && rsharesDone) {
                clearInterval(timer);
                promise({});
            }

        };
        var continueWaiting = function() {
            return new Promise((res) => {
                promise = res;
                timer = setInterval(checkLinks, 1000);
            });
        };

        return continueWaiting().then(() => {
            nseCodes.forEach((n, i) => {
                n.ilink = investingJson.shares[i].ilink;
                n.rlink = rediffJson.shares[i].rlink;
            });
            console.log('done process');
            if (nseCodes.length > 0) {
                writeFile(path.join(__dirname, 'files/nse-with-links', (new Date).getTime() + '.json'), JSON.stringify({ shares: nseCodes }), function() {

                });
            }
          
            return {
                shares: nseCodes,
                investingWindow,
                rediffWindow
            }
        });
    }
};