var price_crawler = require('./lib/daily_price_crawler') ;
var stock_crawler = require('./lib/stock_list_crawler') ;
var db = require('./dbconnection') ;
var logger = require('./logging') ;
var utils = require('./utils') ;
var Promise = require('bluebird') ;
var config = require('./config') ;
var Stock = db.Stock ;

if(!config.init){
    // create schema
    db.sequelize.sync() ;

    function save_stock_list(result){   
        var promise_list = [] ;

        result.forEach(function(item, index, array){
            promise_list.push(Stock.upsert(item)) ;
        }) ;

        var ret = Promise.all(promise_list.map(function(promise){
            return promise.reflect() ;
        }))

        return ret;
    }

    stock_crawler.crawl_stock_list(new Date()).then(save_stock_list).then(
        function(results){
            var not_fulfilled = [] ;
            for(var i=0; i < results.length; i++){
                if(!results[i].isFulfilled()){
                    not_fulfilled.push(''+i);
                }
            }

            if(not_fulfilled.length > 0){
                return console.error(new Error('Items can not be save.', not_fulfilled)) ;
            } else {
                return console.info('Insert stock list successfuly.') ;
            }
        }).catch(function(err){
            logger.error('Something wrong when init the stock list', err) ;
        });

    
}