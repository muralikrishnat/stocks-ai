module.exports = function(driver) {
    return new Promise((res, rej) => {
        driver.get('https://in.investing.com/stock-screener/?sp=country::14|sector::a|industry::a|equityType::a|exchange::46|last::70,100%3Ceq_market_cap;1').then(function() {
            res({});
        });

    });
};