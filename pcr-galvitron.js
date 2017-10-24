var webdriver = require('selenium-webdriver');
var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();

var intervalTimer, endPromise, processEnd = false;
var checkIsConnected = function() {
    try {
        // if (!processEnd) {
        //     driver.findElements(webdriver.By.css('.stock-data')).then(function(result) {
        //         if (result && result.length > 0) {
        //             result[0].getText().then((text) => {
        //                 processEnd = true;
        //             });
        //         }
        //     });
        // }
        // if (processEnd) {
        //     clearInterval(intervalTimer);
        //     endPromise(ishares);
        // }
    } catch (e) {
        //swallow
        console.log('Connected Ended');
    }

};
var waitForever = function() {
    return new Promise(function(res, rej) {
        endPromise = res;
        intervalTimer = setInterval(checkIsConnected, 6600);
    });
};

driver.get('https://www.nseindia.com/live_market/dynaContent/live_watch/option_chain/optionKeys.jsp?symbolCode=-9999&symbol=BANKNIFTY&symbol=BANKNIFTY&instrument=OPTIDX&date=-&segmentLink=17&segmentLink=17').then(function() {
    return driver.executeScript(function() {

    });
}).then(function() {
    return waitForever();
});