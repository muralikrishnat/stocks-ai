module.exports = {
    runInInvesting: function(shares) {
        if (shares.length > 0) {


            var logger = function(msg, color = 'white') {
                var $logger = $('.logger');
                if ($logger.length === 0) {
                    $logger = $('<div/>').addClass('logger').css({
                        position: 'fixed',
                        top: '96px',
                        left: '7%',
                        width: '500px',
                        backgroundColor: 'black',
                        color: 'white',
                        zIndex: '9999999',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        padding: '20px',
                        borderRadius: '15px'
                    });
                    $('body').append($logger);
                }
                $logger.append('<div style="margin-bottom: 5px;font-color: ' + (color) + '"> =&gt; ' + msg + '</div>')
            };
            logger('process started for ' + shares.length + ' shares');

            var processingshares = [];
            var makeRequest = function(share) {
                return $.ajax({
                    type: "POST",
                    url: 'https://in.investing.com/search/service/search',
                    data: {
                        'search_text': share.nseCode,
                        'term': share.nseCode,
                        'country_id': 14,
                        'tab_id': 'Stocks'
                    },
                    success: () => {},
                    contentType: 'application/x-www-form-urlencoded',
                    dataType: 'json'
                }).then((resp) => {
                    logger('search done for ' + share.nseCode);
                    if (resp.All && resp.All[0]) {
                        share.ilink = 'https://in.investing.com' + resp.All[0].link;
                    }
                    share.isearch = true;
                    processNextShare();
                });
            };
            var processNextShare = function() {
                if (shares.length > 0) {
                    var pShare = shares.pop();
                    logger('search started for ' + pShare.nseCode);
                    processingshares.push(pShare);
                    makeRequest(pShare);
                } else {
                    if (processingshares.filter(r => { return r.isearch != true; }).length === 0) {
                        logger('search process done', 'green');
                        var jsonData = {
                            shares: processingshares
                        };
                        $('body').append('<div class="investing-links">' + JSON.stringify(jsonData) + '</div>');
                    }
                }
            };
            for (var i = 0; i < 3; i++) {
                if (shares.length > 0) {
                    var pShare = shares.pop();
                    logger('search started for ' + pShare.nseCode);
                    processingshares.push(pShare);
                    makeRequest(pShare)
                }
            }
        } else {
            var jsonData = {
                shares: []
            };
            $('body').append('<div class="investing-links">' + JSON.stringify(jsonData) + '</div>');
        }
    }
};