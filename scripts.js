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
    var perfomanceYes = true;
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
            perfomanceYes = perfomanceYes && true;
        } else {
            perfomanceYes = false;
        }
    });
    if (technicalYes && perfomanceYes) {
        shares.push(stockProps);
    }
});
console.log('shares ', shares.length);
var doneSharesCount = 0;
var checkAllDone = function() {
    if (shares.length == doneSharesCount) {
        console.log('investing.com Done!!!!!!!!!!!!!!!!!!!!!!1');
    }
};

shares.forEach(s => {
    var nt = document.createElement('IFRAME');
    nt.onload = function() {
        var doc = this.contentDocument || this.contentWindow.document;
        var hdata = [];
        if (doc.getElementById('curr_table')) {
            $('<table>' + doc.getElementById('curr_table').innerHTML + '</table>').find('tbody').find('tr').each(function(i, tr) {
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


$('.dataTable').find('tr').each((i, tr) => {
    var price = parseFloat($(tr).find('td:eq(3)').text().trim().replace(/,/g, ''));
    if (price >= 80 && price <= 100) {} else { $(tr).hide() }
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


$.ajax({
    type: "POST",
    url: 'https://in.investing.com/search/service/search',
    data:  {
        'search_text':'20MICRONS',
        'term':'20MICRONS',
        'country_id':14,
        'tab_id':'Stocks' 
    },
    success: () => {},
    contentType: 'application/x-www-form-urlencoded',
    dataType: 'json'
}).then((resp) => { console.log(resp); });

$.ajax({
    type: "GET",
    url: 'http://money.rediff.com/snsproxy.php?type=all&prefix=20MICRONS',
    success: () => {}
}).then((resp) => { console.log(resp); });


[  "BPCL", "BRITANNIA", "BSE", "CADILAHC", "CAIRN", "CANBK", "CANFINHOME", "CAPF", "CASTROLIND", "CEATLTD", "CENTRALBK", "CENTURYPLY", "CENTURYTEX", "CESC", "CGPOWER", "CHENNPETRO", "CHOLAFIN", "CIPLA", "COALINDIA", "COFFEEDAY", "COLPAL", "CONCOR", "COROMANDEL", "COX&KINGS", "CRISIL", "CROMPTON", "CUB", "CUMMINSIND", "CYIENT", "DABUR", "DALMIABHA", "DBCORP", "DBREALTY", "DCBBANK", "DHFL", "DISHTV", "DIVISLAB", "DLF", "DMART", "DRREDDY", "ECLERX", "EDELWEISS", "EICHERMOT", "EIDPARRY", "EIHOTEL", "EMAMILTD", "ENDURANCE", "ENGINERSIN", "EQUITAS", "ESCORTS", "EVEREADY", "EXIDEIND", "FAGBEARING", "FEDERALBNK", "FEL", "FORTIS", "GAIL", "GATI", "GEPIL", "GESHIP", "GET&D", "GILLETTE", "GLAXO", "GLENMARK", "GMRINFRA", "GODREJIND", "GODREJPROP", "GOLDBEES", "GPPL", "GRANULES", "GRASIM", "GRUH", "GSFC", "GSKCONS", "GSPL", "GUJFLUORO", "GUJGASLTD", "HAVELLS", "HCC", "HCLTECH", "HDFC", "HDFCBANK", "HDIL", "HEROMOTOCO", "HEXAWARE", "HINDALCO", "HINDCOPPER", "HINDPETRO", "HINDUNILVR", "HINDZINC", "HONAUT", "HOTELEELA", "HUDCO", "IBREALEST", "IBULHSGFIN", "ICICIBANK", "ICICIPRULI", "ICIL", "IDBI", "IDEA", "IDFC", "IDFCBANK", "IFCI", "IGL", "IIFL", "INDHOTEL", "INDIACEM", "INDIANB", "INDIGO", "INDUSINDBK", "INFIBEAM", "INFRATEL", "INFY", "INOXWIND", "IOB", "IOC", "IPCALAB", "IRB", "ITC", "JAGRAN", "JETAIRWAYS", "JINDALSTEL", "JISLJALEQS", "JKCEMENT", "JKTYRE", "JPASSOCIAT", "JSWENERGY", "JSWSTEEL", "JUBILANT", "JUBLFOOD", "JUSTDIAL", "JYOTHYLAB", "KAJARIACER", "KANSAINER", "KARURVYSYA", "KEC", "KOTAKBANK", "KPIT", "KSCL", "KTKBANK", "KWALITY", "L&TFH", "LALPATHLAB", "LICHSGFIN", "LINDEINDIA", "LIQUIDBEES", "LOVABLE", "LT", "LUPIN", "M&M", "M&MFIN", "M100", "M50", "MAHINDCIE", "MANAPPURAM", "MARICO", "MARUTI", "MCDOWELL-N", "MCLEODRUSS", "MCX", "MERCATOR", "MFSL", "MGL", "MINDTREE", "MOTHERSUMI", "MPHASIS", "MRF", "MRPL", "MUTHOOTFIN", "NATCOPHARM", "NATIONALUM", "NAUKRI", "NBCC", "NCC", "NESTLEIND", "NETWORK18", "NH", "NHPC", "NIFTYBEES", "NIITTECH", "NLCINDIA", "NMDC", "NTPC", "OBEROIRLTY", "OFSS", "OIL", "ONGC", "ORIENTBANK", "PAGEIND", "PCJEWELLER", "PEL", "PERSISTENT", "PETRONET", "PFC", "PFIZER", "PGHH", "PHOENIXLTD", "PIDILITIND", "PIIND", "PNB", "POWERGRID", "PRESTIGE", "PTC", "PVR", "QUICKHEAL", "RAJESHEXPO", "RAMCOCEM", "RAYMOND", "RBLBANK", "RCOM", "RDEL", "RECLTD", "RELAXO", "RELCAPITAL", "RELIANCE", "RELINFRA", "REPCOHOME", "ROLTA", "RPOWER", "SADBHAV", "SAIL", "SANOFI", "SBIN", "SCHAND", "SHREECHEM", "SHRIRAMCIT", "SIEMENS", "SINTEX", "SJVN", "SKFINDIA", "SNOWMAN", "SOLARINDS", "SOUTHBANK", "SPARC", "SREINFRA", "SRF", "SRTRANSFIN", "STAR", "SUNDARMFIN", "SUNPHARMA", "SUNTV", "SUPREMEIND", "SUZLON", "SYMPHONY", "SYNDIBANK", "SYNGENE", "TATACHEM", "TATACOFFEE", "TATACOMM", "TATAELXSI", "TATAGLOBAL", "TATAMOTORS", "TATAMTRDVR", "TATAPOWER", "TATASTEEL", "TCI", "TCS", "TECHM", "TEJASNET", "THERMAX", "THOMASCOOK", "THYROCARE", "TITAN", "TORNTPHARM", "TORNTPOWER", "TRENT", "TTKPRESTIG", "TUBEINVEST", "TV18BRDCST", "TVSMOTOR", "UBL", "UCOBANK", "UJJIVAN", "ULTRACEMCO", "UNIONBANK", "UPL", "VAKRANGEE", "VEDL", "VGUARD", "VIJAYABANK", "VOLTAS", "VTL", "WABCOINDIA", "WHIRLPOOL", "WIPRO", "WOCKPHARMA", "WONDERLA", "YESBANK", "ZEEL"]
 
[
    {
        code: 'BGRENERGY',
        ilink: 'https://in.investing.com/equities/adani-enterprises-historical-data'
    },
    {
        code: 'BGRENERGY',
        ilink: 'https://in.investing.com/equities/adani-enterprises-historical-data'
    },
    {
        code: 'BGRENERGY',
        ilink: 'https://in.investing.com/equities/adani-enterprises-historical-data'
    },
    {
        code: 'BGRENERGY',
        ilink: 'https://in.investing.com/equities/adani-enterprises-historical-data'
    },
    {
        code: 'BGRENERGY',
        ilink: 'https://in.investing.com/equities/adani-enterprises-historical-data'
    },
    {
        code: 'BGRENERGY',
        ilink: 'https://in.investing.com/equities/adani-enterprises-historical-data'
    },
    {
        code: 'BANKBARODA',
        ilink: 'https://in.investing.com/equities/bank-of-baroda-historical-data'
    },
    {
        code: 'BAJAJHIND',
        ilink: 'https://in.investing.com/equities/bajaj-hindusthan-limited-historical-data'
    },
    {
        code: 'ADANIENT',
        ilink: 'https://in.investing.com/equities/adani-enterprises-historical-data'
    },
    {
        code: 'ADANIPOWER',
        ilink: 'https://in.investing.com/equities/adani-power-historical-data'
    },
    {
        code: 'ALBK',
        ilink: 'https://in.investing.com/equities/allahabad-bank-historical-data'
    },
    {
        code: 'ANDHRABANK',
        ilink: 'https://in.investing.com/equities/andhra-bank-historical-data'
    },
    {
        code: 'ASHOKLEY',
        ilink: 'https://in.investing.com/equities/ashok-leyland-historical-data'
    }
]


