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
}

function get_and_insert_daily_stock_info(stock_symbol){
    var cur_year = new Date().getFullYear() ;
    var year_range = config.db_create_db_year_count ;
    var promise_list = [] ;
    var upsert_promise_list = [] ;

    for(var i = cur_year; i > (cur_year - year_range); i--){
        promise_list.push(monthly_price_crawler.crawl({stock: stock_symbol, year: i}).reflect()) ;
    }

    return Promise.all(promise_list).then(function(result){
        result.forEach(function(item, index, array){
            if(item.isFulfilled()){
                item.value().forEach(function(it, idx){
                    upsert_promise_list.push(StockDailyInfo.upsert(it).reflect()) ;
                })
            } else {
                logger.error(item.reason()) ;
            }
        }) ;

        return Promise.all(upsert_promise_list) ;
    }) ;
}

// Get a few stocks at a time and try to get the price info for them.
function create_db(offset, limit){
    var stock_list = [] ;

    get_stock_record() ;

    function get_stock_record(offset, limit){
        var offset = offset || 0 ;
        var limit = limit || 1 ;

        Stock.findAll({offset: offset, limit: limit}).then(function(records){
            if(records.length != 0){
                stock_list = stock_list.concat(records) ;
                next(offset, limit) ;
            } else {
                logger.info('Create daily price info done.') ;
            }
        }) ;
    }

    function next(offset, limit){
        var task_complete_count = 0 ;

        stock_list.forEach(function(stock, idx, array){
            logger.info('Start creating data for stock %s', stock.getDataValue('id')) ;
            get_and_insert_daily_stock_info(stock.getDataValue('id')).then(function(insert_results){
                insert_results.forEach(function(it, idx, array){
                    if(it.isRejected()){
                        var err = it.reason() ;
                        logger.error(err.message, err.sql) ;
                    }
                }) ;
                // when this funciton is called, all the upsert for that stock should have completed.
                if(++task_complete_count === stock_list.length){
                    stock_list = [] ;
                    get_stock_record(offset+limit, limit) ;
                }
            }) ;
        }) ;
    }
}

// create_db() ;

// monthly_pbpe_crawler.crawl({stock_symbol: '2353', year: 2016, month: 8}) ;
// daily_pbpe_crawler.crawl({stock: '2353', date: new Date(2016, 5, 4)}).then(function(result){
//     console.log(result) ;
// }) ;

// function* test(){
//     yield 1;
//     yield 2;
//  }

//  var gen = test() ;

//  console.log(gen.next().value) ;