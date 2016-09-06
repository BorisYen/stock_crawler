var monthly_price_crawler = require('./lib/monthly_price_crawler') ;
var stock_crawler = require('./lib/stock_list_crawler') ;
var monthly_pbpe_crawler = require('./lib/monthly_pb_pe_crawler') ;
var daily_pbpe_crawler = require('./lib/daily_pb_pe_crawler') ;
var db = require('./dbconnection') ;
var logger = require('./logging') ;
var utils = require('./utils') ;
var Promise = require('bluebird') ;
var config = require('./config') ;
var Stock = db.Stock ;
var StockDailyInfo = db.StockDailyInfo ;

// create schema
db.sequelize.sync() ;

function save_stock_list(result){   
    var promise_list = [] ;

    result.forEach(function(item, index, array){
        promise_list.push(Stock.upsert(item).reflect()) ;
    }) ;

    return Promise.all(promise_list);
}

stock_crawler.crawl(new Date(2016, 6, 20)).then(save_stock_list).then(
    function(results){
        var not_fulfilled = [] ;
        for(var i=0; i < results.length; i++){
            if(!results[i].isFulfilled()){
                not_fulfilled.push(''+i);
            }
        }

        if(not_fulfilled.length > 0){
            return logger.error(new Error('Items can not be save.', not_fulfilled)) ;
        } else {
            return logger.info('Insert stock list successfuly.') ;
        }
    }).catch(function(err){
        logger.error('Something wrong when init the stock list', err) ;
    });

