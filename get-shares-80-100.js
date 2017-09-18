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
    var nseCode = $('#quotes_summary_current_data .right').children('div:eq(3)').find('span.elp').text().trim();
    var stockDetails = {
        nseCode: nseCode,
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


try {
    driver.get('https://in.investing.com/stock-screener/?sp=country::14|sector::a|industry::a|equityType::a|exchange::46|last::80,90%3Ceq_market_cap;1').then(function() {
        return driver.executeScript(getShares);
    }).then(waitForCodeRange).then(function() {
        return pickNextStep().then(() => {
            return {};
        });
    }).then(() => {
        sharesWithNseCodes.forEach((s) => { 
            sharesToCheck.forEach((g) => {
                if (g.link.trim() == s.link.trim()) {
                    g.nseCode = s.nseCode;
                }
            });
        });
        
        fs.writeFile(path.join(__dirname, 'files/strategy-results/final-stocks-80-100.json'), JSON.stringify({
            shares: sharesToCheck
        }), () => {
            console.log('File Created ');
        });
    })

} catch (er) {
    //swallow it
}