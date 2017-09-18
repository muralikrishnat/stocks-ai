var fs = require('fs');
var path = require('path');

var webdriver = require('selenium-webdriver');
var By = webdriver.By;

var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();

var getShares = function() {
    $('.popupCloseIcon').click();
    var shares = [];
    $('.resultsStockScreenerTbl').find('tr').each((i, sr) => {
        var $sr = $(sr);
        var name = $sr.find('td[data-column-name="name_trans"]').text().trim();
        var link = $sr.find('td[data-column-name="name_trans"]').find('a').attr('href');
        var symbol = $sr.find('td[data-column-name="viewData.symbol"]').text().trim();

        var lastPrice = $sr.find('td[data-column-name="last"]').text().trim();
        lastPrice = lastPrice.replace(/,/g, '');
        lastPrice = parseFloat(lastPrice);
        var marketCap = $sr.find('td[data-column-name="eq_market_cap"]').text().trim();
        var volume = $sr.find('td[data-column-name="turnover_volume"]').text().trim();
        var stockProps = {
            name,
            link,
            symbol,
            lastPrice,
            marketCap,
            volume
        };
        var technocalProps = ['tech_sum_900', 'tech_sum_3600', 'tech_sum_86400', 'tech_sum_week', 'tech_sum_month'];
        var performanceProps = ['daily', 'week', 'month', 'ytd', 'year', '3year'];
        var technicalYes = true,
            performaceYes = true;
        technocalProps.forEach((t) => {
            if ($sr.find('td[data-column-name="' + t + '"]').text().trim() == 'Strong Buy') {
                technicalYes = technicalYes && true;
            } else {
                technicalYes = false;
            }
        });

        performanceProps.forEach((p) => {
            stockProps[p] = $sr.find('td[data-column-name="' + p + '"]').text().trim();
            if (stockProps[p].indexOf('-') < 0) {
                performaceYes = performaceYes && true;
            } else {
                performaceYes = false;
            }
        });
        if (technicalYes && performaceYes) {
            shares.push(stockProps);
            //window.open(link);
        }
    });
    $('body').append('<div class="share-80-100">' + JSON.stringify(shares) + '</div>');

    // $.ajax({
    //     type: "POST",
    //     url: 'http://localhost:6589/api',
    //     data: JSON.stringify({
    //         fileName: 'strategy-results/final-stocks-80-100.json',
    //         shares: shares
    //     }),
    //     success: () => {},
    //     contentType: 'application/json',
    //     dataType: 'json'
    // });
};

var sharesWithNseCodes = [];
var sharesToCheck = [];
var stepIndex = 0;

var getStocksData = function() {
    var hdata = [];
    $('.historicalTbl').find('tr').each(function(i, tr) {
        var hdate = $(tr).find('td:eq(0)').text().trim();
        var price = $(tr).find('td:eq(1)').text().trim();
        var open = $(tr).find('td:eq(2)').text().trim();
        var high = $(tr).find('td:eq(3)').text().trim();
        var low = $(tr).find('td:eq(4)').text().trim();
        var change = $(tr).find('td:eq(6)').text().trim();
        var className = $(tr).find('td:eq(6)').attr('class');
        hdata.push({
            hdate,
            price,
            open,
            high,
            low,
            change,
            className
        })
    });
    var nseCode = $('#quotes_summary_current_data .right').children('div:eq(3)').find('span.elp').text().trim();
    var stockDetails = {
        nseCode: nseCode,
        ilink: window.location.href,
        hdata: hdata,
        link: window.location.href.replace('https://in.investing.com', '').replace('-historical-data', '')
    }
    $('body').append('<div class="nse-code">' + JSON.stringify(stockDetails) + '</div>');
};
var waitForElementLoad = function() {
    return driver.findElements(webdriver.By.css('#quotes_summary_current_data')).then(function(result) {
        return result[0];
    });
};

var waitForCodeRange = function() {
    return driver.findElements(webdriver.By.css('.share-80-100')).then(function(result) {
        return result[0].getText().then((text) => {
            sharesToCheck = JSON.parse(text.trim());
        });
    });
};

var waitForCode = function() {
    return driver.findElements(webdriver.By.css('.nse-code')).then(function(result) {
        return result[0].getText().then((text) => {
            sharesWithNseCodes.push(JSON.parse(text.trim()));
        });
    });
};

var getDriverByUrl = function(url) {
    return driver.get(url).then(waitForElementLoad).then(function() {
        return driver.executeScript(getStocksData);
    }).then(waitForCode);
};
var pickNextStep = function() {
    if (sharesToCheck[stepIndex] && sharesToCheck[stepIndex].link) {
        return getDriverByUrl('https://in.investing.com' + sharesToCheck[stepIndex++].link + '-historical-data').then(pickNextStep);
    } else {
        return {};
    }
};


var sharesInRediffByFile = {};
var sharesToCheckHash = {};
var sharesInRediff = [];
var sharesWithMeter = [];

var saveFile = function(filePath, content) {
    return new Promise((res, rej) => {
        fs.writeFile(filePath, content, (err) => {
            res({ err });
        });
    });
};

var readFile = function(filePath, hashObj) {
    return new Promise((res, rej) => {
        fs.readFile(filePath, (err, content) => {
            var filejson = JSON.parse(content.toString());
            hashObj[filePath] = filejson.shares;
            res({ err, content });
        });
    });
};
var readFolder = function(fPath) {
    return new Promise((res, rej) => {
        fs.readdir(fPath, (err, files) => {
            res({ err, files });
        });
    });
};


var processRediffSite = function() {
    var folderPath = path.join(__dirname, '/files/rediff/total-nse');
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
        return {};
    });
};
var getDriverByUrlRediff = function(url) {
    return driver.get(url).then(function() {
        return driver.findElements(webdriver.By.css('#for_NSE .cmp_meterbox')).then(function(result) {
            return result[0];
        });
    }).then(function() {
        return driver.executeScript(function() {
            var stockDetails = {
                code: $('#for_NSE .grey2.f12').text().trim(),
                meter: $('#for_NSE .cmp_meterbox').find('img').attr('src'),
                rlink: window.location.href
            };
            $('body').append('<div class="stock-data">' + JSON.stringify(stockDetails) + ' </div>');
        });
    }).then(function() {
        return driver.findElements(webdriver.By.css('.stock-data')).then(function(result) {
            return result[0].getText().then((text) => {
                sharesWithMeter.push(JSON.parse(text.trim()));
            });
        });
    });
};
var pickNextStepRediff = function() {
    if (foundShares[stepIndex] && foundShares[stepIndex].rshare) {
        return getDriverByUrlRediff(foundShares[stepIndex++].rshare.link).then(pickNextStepRediff);
    } else {
        return {};
    }
};
var foundShares = [];
var compareWithRediff = function() {
    return pickNextStepRediff().then(() => {
        return {};
    });
};

try {
    driver.get('https://in.investing.com/stock-screener/?sp=country::14|sector::a|industry::a|equityType::a|exchange::46|last::70,100%3Ceq_market_cap;1').then(function() {
        return driver.executeScript(getShares);
    }).then(waitForCodeRange).then(function() {
        return pickNextStep().then(() => {
            return {};
        });
    }).then(() => {
        sharesWithNseCodes.forEach((s) => {
            sharesToCheck.forEach((g) => {
                if (g.link.trim() == s.link.trim()) {
                    Object.assign(g, s);
                }
            });
        });

        return saveFile(
            path.join(__dirname, 'files/strategy-results/final-stocks-80-100.json'),
            JSON.stringify({ shares: sharesToCheck })
        );
    }).then(() => {
        return processRediffSite().then(() => {
            for (var i = 0; i < sharesToCheck.length; i++) {
                for (var j = 0; j < sharesInRediff.length; j++) {
                    if (sharesToCheck[i].nseCode == sharesInRediff[j].code) {
                        foundShares.push({
                            rshare: sharesInRediff[j],
                            ishare: sharesToCheck[i]
                        })
                        break;
                    }
                }
            }
            stepIndex = 0;
            return compareWithRediff().then(() => {
                sharesWithMeter.forEach(l => {
                    sharesToCheck.forEach((g) => {
                        if (g.nseCode == l.code) {
                            Object.assign(g, l);
                        }
                    });
                });

                return saveFile(
                    path.join(__dirname, 'files/strategy-results/final-stocks-80-100.json'),
                    JSON.stringify({ shares: sharesToCheck })
                );
            });
        });
    }).then(() => {
        console.log('END ', sharesToCheck.length);
    });


} catch (er) {
    //swallow it
}