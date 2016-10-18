var stock_crawler = require('./daily_stock_load_security_lending_crawler')


/**
 * Use existing crawler to do the job. The date can be any date as long as the market was opened that day.
 * 
 * Ignore all the arguments passed to this crawler.
 * 
 * TODO: might need to find a more suitable page to crawl.
 */
exports.crawl = function(){
    return stock_crawler.crawl({date: new Date(2016, 6, 20)}).then(function(results){
        var ret = [] ;

        results.forEach(function(it, idx, array){
            ret.push({id: it.id, name: it.name}) ;
        }) ;

        return ret;
    }) ;
}