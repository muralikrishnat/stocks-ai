var flashFaizer = require('./flash-faizer');
var nseCodes = [{
    nseCode: '20MICRONS'
}]
flashFaizer.getLinksWithNseCodes(nseCodes).then(({
    shares,
    investingWindow,
    rediffWindow
}) => {
    console.log('end of ', sharesWithLinks);
    investingWindow.close();
    rediffWindow.close();
}).catch(() => {

});