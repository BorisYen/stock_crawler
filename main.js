var price_crawler = require('./lib/daily_price_crawler') ;
var stock_crawler = require('./lib/stock_list_crawler') ;
var db = require('./dbconnection') ;
var logger = require('./logging') ;
var utils = require('./utils') ;
var Stock = db.Stock ;

function init_stock_list(cb){
    cb = cb || utils.emptyFn ;

    function save_stock_list(err, result){
        if(err) {
            logger.error('Unable to get stock list', err) ;
            return ;
        }
        result.slice(0, 2).forEach(function(item, index, array){
            Stock.create(item).then(function(stock){
                logger.info('Successfully insert', stock) ;
            }).catch(function(err){
                if(err.original.errno != 1062)
                    logger.info('Error happens when inserting data', err) ;
            }) ;
            // db_pool.query('INSERT INTO stock SET ?', item, function(err, result){
            //     // 1062 means "Duplicate entry"
            //     if(err && err.errno != 1062){
            //         logger.error('Unable to insert stock:', item, err) ;
            //     } else {
            //         logger.info('Successfully insert', item) ;
            //     }
            // });
        }) ;
    } 

    stock_crawler.crawl_stock_list(new Date(), save_stock_list) ;
}

init_stock_list() ;
// function init_stock_price(){
//     price_crawler.crawl_price(2353, {year: 2016, month: 8}, function(err, result){
//         if(err){
//             logger.error('unable to get price data for stock %d, options:', 2353, {year: 2016,  day: 3}, err) ;
//         }
//         logger.info(result) ;
//         db.end(function(){}) ;
//     }) ;
// }
