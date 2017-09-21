var path = require('path');
var fs = require('fs');

var webdriver = require('selenium-webdriver');
var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();

var intervalTimer, endPromise, ishares = [], rshares = [];
var rshareProcess = true, isharesDone = false, rsharesDone = false;
var getRediffShares = function () {
    require('./scripts/get-rediff-shares').getShares().then((r) => {
        rshares = r.shares;
        rsharesDone = true;
    });
};
var checkIsConnected = function () {
    try {
        if (rshareProcess) {
            rshareProcess = false;
            getRediffShares();
        }

        if (!isharesDone) {
            driver.findElements(webdriver.By.css('.stock-data')).then(function (result) {
                if (result && result.length > 0) {
                    result[0].getText().then((text) => {
                        ishares = JSON.parse(text.trim());
                        isharesDone = true;
                    });
                }
            });
        }

        if (isharesDone && rsharesDone) {
            clearInterval(intervalTimer);
            endPromise(ishares);
        }

    } catch (e) {
        //swallow
        console.log('Connected Ended');
    }

};

var processInvestingComShares = function () {
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
        var technicalYes = true;
        technocalProps.forEach((t) => {
            if ($sr.find('td[data-column-name="' + t + '"]').text().trim() == 'Strong Buy') {
                technicalYes = technicalYes && true;
            } else {
                technicalYes = false;
            }
        });

        performanceProps.forEach((p) => {
            stockProps[p] = $sr.find('td[data-column-name="' + p + '"]').text().trim();
        });
        if (technicalYes && performanceProps) {
            shares.push(stockProps);
        }
    });
    var doneSharesCount = 0;
    var checkAllDone = function () {
        if (shares.length == doneSharesCount) {
            $('body').append('<div class="stock-data">' + JSON.stringify(shares) + '</div>');
        }
    };

    shares.forEach(s => {
        var nt = document.createElement('IFRAME');
        nt.onload = function () {
            var doc = this.contentDocument || this.contentWindow.document;
            var hdata = [];
            if (doc.getElementById('curr_table')) {
                $('<table>' + doc.getElementById('curr_table').innerHTML + '</table>').find('tbody').find('tr').each(function (i, tr) {
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
                    });
                });
            }

            var nseCode = '';
            if (doc.getElementById('quotes_summary_current_data')) {
                nseCode = $('<div>' + doc.getElementById('quotes_summary_current_data').innerHTML + '</div>').find('.right').children('div:eq(3)').find('span.elp').text().trim();
            }
            s.nseCode = nseCode;
            s.hdata = hdata;
            doneSharesCount = doneSharesCount + 1;
            checkAllDone();
        };
        nt.src = s.link + '-historical-data';
        $('body').append(nt);
    });
};
var waitForever = function () {
    return new Promise(function (res, rej) {
        endPromise = res;
        intervalTimer = setInterval(checkIsConnected, 6600);
    });
};

var from = 40,
    to = 50,
    page = 1;

if (process.argv) {
    process.argv.forEach((a) => {
        if (a.split('=').length > 0 && a.split('=')[0] == 'from') {
            from = parseInt(a.split('=')[1]);
        }

        if (a.split('=').length > 0 && a.split('=')[0] == 'to') {
            to = parseInt(a.split('=')[1]);
        }

        if (a.split('=').length > 0 && a.split('=')[0] == 'page') {
            page = parseInt(a.split('=')[1]);
        }
    });
}

var mkdirp = require('mkdirp');
var getDirName = require('path').dirname;

function writeFile(path, contents, cb) {
    mkdirp(getDirName(path), function (err) {
        if (err) return cb(err);
        fs.writeFile(path, contents, cb);
    });
}

var rediffPromise, rediffInterval;
driver.get('https://in.investing.com/stock-screener/?sp=country::14|sector::a|industry::a|equityType::a|exchange::46|last::' + from + ',' + to + '%3Ceq_market_cap;' + page).then(function () {
    return driver.executeScript(processInvestingComShares);
}).then(function () {
    return waitForever();
}).then(() => {
    return new Promise((res, rej) => {
        var foundShares = [];
        ishares.forEach(iItem => {
            for (var i = 0; i < rshares.length; i++) {
                if (iItem.nseCode == rshares[i].code) {
                    iItem.rlink = rshares[i].link;
                    foundShares.push(iItem);
                }
            }
        });
        console.log('shares ishares and rshares and common shares ', ishares.length, rshares.length, foundShares.length);
        res({ shares: foundShares });
    });
}).then((t) => {
    return driver.get('http://money.rediff.com/index.html?src=comp_top_nav').then(() => {
        return driver.executeScript(function (shares) {
            var sharesFetched = 0;
            var checkAllDone = () => {
                if (sharesFetched === shares.length) {
                    $('body').append('<div class="rediff-loaded">' + JSON.stringify(shares) + '</div>');
                }
            };
            shares.forEach(s => {
                var nt = document.createElement('IFRAME');
                nt.onload = function () {
                    var doc = this.contentDocument || this.contentWindow.document;
                    if (doc.getElementById('for_NSE')) {
                        var $for_NSE = $('<div>' + doc.getElementById('for_NSE').innerHTML + '</div>');
                        s.rcode = $for_NSE.find('.grey2.f12').text().trim();
                        s.meter = $for_NSE.find('.cmp_meterbox').find('img').attr('src');
                        if (doc.getElementById('for_BSE')) {
                            var $for_BSE = $('<div>' + doc.getElementById('for_BSE').innerHTML + '</div>');
                            s.group = $for_BSE.find('.grey2.f12').text().trim();
                        }
                    }
                    sharesFetched = sharesFetched + 1;
                    checkAllDone();
                };
                nt.src = s.rlink;
                $('body').append(nt);
            });

        }, ishares);
    });
}).then(() => {
    return new Promise(function (res, rej) {
        rediffPromise = res;
        rediffInterval = setInterval(function () {
            driver.findElements(webdriver.By.css('.rediff-loaded')).then(function (result) {
                if (result && result.length > 0) {
                    result[0].getText().then((text) => {
                        res(text);
                        clearInterval(rediffInterval);
                    });
                }
            });
        }, 6600);
    });
}).then((jsonString) => {
    return new Promise((res, rej) => {
        try {
            var finalshares = JSON.parse(jsonString);
            var fileContent = {
                shares: finalshares
            };

            var tDate = new Date();
            var fileName = 'final-stocks-' + from + '-' + to + '-' + page + '-tmp.json';
            fileName = '/' + tDate.getFullYear() + '/' + tDate.getMonth() + '/' + tDate.getDate() + '/' + fileName;
            var filePath = path.join(__dirname, 'files/kitto-results/', fileName);
            writeFile(filePath, JSON.stringify(fileContent), (err) => {
                res({ err });
            });
        } catch (e) {
            res({ err: e });
        }
    });
}).then(({ err }) => {
    if (err) {
        console.log('Error during process : ', err);
    } else {
        console.log('Done Process!!!!!!!');
    }
    driver.close();
});