module.exports = function(driver) {
    var SM = function() {
        this.openSite = function(url, fn, argsArr) {
            return this;
        };

        this.execute = function() {
            return this;
        };
    };

    return new SM();
};