var price_crawler = require('./lib/daily_price_crawler') ;
var stock_crawler = require('./lib/stock_list_crawler') ;
var db = require('./dbconnection') ;
var logger = require('./logging') ;
var utils = require('./utils') ;
var Promise = require('bluebird') ;
var config = require('./config') ;
var Stock = db.Stock ;
var StockDailyInfo = db.StockDailyInfo ;

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

function insert_stock_daily_info(stock_symbol){
    var cur_date = new Date() ;
    var cur_year = cur_date.getFullYear() ;
    var year_range = 10 ;
    var promise_list = [] ;
    var upsert_promise_list = [] ;

    for(var i = cur_year; i > (cur_year - year_range); i--){
        promise_list.push(price_crawler.crawl_price(stock_symbol, {year: i}).reflect()) ;
    }

    return Promise.all(promise_list).then(function(result){
        logger.info('result length', result.length) ;

        result.forEach(function(item, index, array){
            item.value().forEach(function(it, idx){
                upsert_promise_list.push(StockDailyInfo.upsert(it).reflect()) ;
            })
        }) ;

        return Promise.all(upsert_promise_list) ;
    }) ;
}

function create_db(offset){
    var stock_list = [] ;

    get_stock_record(offset) ;

    function get_stock_record(offset){
        var offset = offset || 0 ;
        var limit = 10 ;

        Stock.findAll({offset: offset, limit: limit}).then(function(records){
            if(records.length != 0){
                stock_list = stock_list.concat(records) ;
                next(offset) ;
            }
        }) ;
    }

    function next(offset){
        var stock = stock_list.shift() ;
        if(stock){
            logger.info('Start creating data for stock %s', stock.getDataValue('id')) ;
            insert_stock_daily_info(stock.getDataValue('id')).then(function(){
                // when this funciton is called, all the upsert for that stock should have completed.
                next(offset) ;
            }) ;
        } else {
            get_stock_record(offset + 10) ;
        }
    }
}

create_db() ;