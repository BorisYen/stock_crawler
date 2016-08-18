var price_crawler = require('./get_price') ;
var db = require('./dbconnection') ;
var logger = require('./logging') ;
var db_pool = db.pool ;

db.init(function(err){
    if(err) {
        logger.error('can not init db', err) ;
        process.exit(1) ;
    }

    price_crawler.get_daily_price_for_year(2353, 2016, function(err, result){
        if(err){
            logger.error('unable to get price data for stock %d, year %d', 2353, 2016) ;
        }
        logger.info(result) ;
        db.end(function(){}) ;
    }) ;
});
