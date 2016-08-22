var price_crawler = require('./daily_price_crawler') ;
var db = require('./dbconnection') ;
var logger = require('./logging') ;
var db_pool = db.pool ;

db.init(function(err){
    if(err) {
        logger.error('can not init db', err) ;
        process.exit(1) ;
    }

    price_crawler.crawl_price(2353, {year: 2016, month: 8}, function(err, result){
        if(err){
            logger.error('unable to get price data for stock %d, options:', 2353, {year: 2016,  day: 3}, err) ;
        }
        logger.info(result) ;
        db.end(function(){}) ;
    }) ;
});
