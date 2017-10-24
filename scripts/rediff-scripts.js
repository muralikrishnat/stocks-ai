module.exports = {
    runInRediff: function(shares) {
        if (shares.length > 0) {
            var logger = function(msg) {
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
                $logger.append('<div style="margin-bottom: 5px;"> =&gt; ' + msg + '</div>');
                var jsonData = {
                    shares: shares
                };
            };
            logger('process started for ' + shares.length + ' shares');
            var processingshares = [];
            var makeRequest = function(share) {
                $.ajax({
                    type: "GET",
                    url: 'http://money.rediff.com/snsproxy.php?type=all&prefix=' + share.nseCode,
                    success: () => {}
                }).then((resp) => {
                    logger('search done for ' + share.nseCode);
                    if (resp && resp.indexOf('Suggestionr.show(') >= 0) {
                        try {
                            var respresult = resp.replace('Suggestionr.show("', '');
                            respresult = respresult.replace('");', '');
                            respresult = respresult.split('|')[0];
                            share.rlink = respresult.split('###')[2];
                        } catch (e) {

                        }
                    }
                    share.rsearch = true;
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
                    if (processingshares.filter(r => { return r.rsearch != true; }).length === 0) {
                        logger('search process done', 'green');
                        var jsonData = {
                            shares: processingshares
                        };
                        $('body').append('<div class="rediff-links">' + JSON.stringify(jsonData) + '</div>');
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
            $('body').append('<div class="rediff-links">' + JSON.stringify(jsonData) + '</div>');
        }
    }
};