var webdriver = require('selenium-webdriver');
var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();

try {
    require('./scripts/get-shares-range')(driver, webdriver.By).then((shares) => {

    });

} catch (er) {
    //swallow it
}