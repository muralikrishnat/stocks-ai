var origin = window.location.origin;
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

    technocalProps.forEach((t) => {
        stockProps[t] = $sr.find('td[data-column-name="' + t + '"]').text().trim();
    });

    performanceProps.forEach((p) => {
        stockProps[p] = $sr.find('td[data-column-name="' + p + '"]').text().trim();
    });
    shares.push(stockProps);
})

$.ajax({
    type: "POST",
    url: 'http://localhost:6589/api',
    data: JSON.stringify({
        fileName: 'investing/stocks-80-100-' + (new Date).getTime() + '-1.json',
        shares: shares
    }),
    success: () => {},
    contentType: 'application/json',
    dataType: 'json'
});



var stocks = [];
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
        stocks.push(stockProps);
    }
});
stocks.length;


$('.dataTable').find('tr').each((i, tr) => {
    var price = parseFloat($(tr).find('td:eq(3)').text().trim().replace(/,/g, ''));
	if (price >= 80 && price <= 100) {} else { $(tr).hide()}
});


var shares = [];
$('.dataTable').find('tr').each((i, tr) => {  
    if ($(tr).find('td:eq(0) a').length > 0) {
        shares.push({
            name: $(tr).find('td:eq(0) a').text().trim(),
            link: $(tr).find('td:eq(0) a').attr('href'),
            code: $(tr).find('td:eq(1)').text().trim() 
        });
    }
});

$.ajax({
    type: "POST",
    url: 'http://localhost:3435/api',
    data: JSON.stringify({
        fileName: 'rediff/total-nse/1.json',
        shares: shares
    }),
    success: () => {},
    contentType: 'application/json',
    dataType: 'json'
});