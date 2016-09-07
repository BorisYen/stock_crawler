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

function* stock_gen(offset, limit){
    var offset = offset || 0 ;
    var limit = limit || 1 ;

    while(true){
        var stocks = yield Stock.findAll({offset: offset, limit: limit}) ;
        
        if(stocks.length > 0)
            offset += limit ;
        else
            break ;
    }

    console.log('leave stock generator') ;
}

function* data_gen(stocks){
    var cur_year = new Date().getFullYear() ;
    var year_range = config.db_create_db_year_count ;
    
    for(var i=0; i<stocks.length; i++){
        var promise_list = [] ;

        for(var j = cur_year; j > (cur_year - year_range); j--){
            promise_list.push(monthly_price_crawler.crawl({stock: stocks[i].getDataValue('id'), year: j}).reflect()) ;
        }

        yield Promise.all(promise_list) ;
    }
}

function save_data(db_model){
    return function(data){
        data.forEach(function(item, index, array){
            if(item.isFulfilled()){
                item.value().forEach(function(it, idx){
                    upsert_promise_list.push(db_model.upsert(it).reflect()) ;
                })
            } else {
                logger.error(item.reason()) ;
            }
        }) ;

        return Promise.all(upsert_promise_list) ;
    }
}

var stock_g = stock_gen(0, 2) ;

function iterate_stock(stop){
    var next = stock_g.next(stop) ;

    if(!next.done){
        next.value.then(function(stocks){
            var data_g = data_gen(stocks) ;

            next_data_g() ;
            function next_data_g(){
                var data_g_next = data_g.next() ;

                if(!data_g_next.done){
                    data_g_next.value.then(function(data){
                        //insert data here.

                        next_data_g() ;
                    })
                } else {
                    iterate_stock(stocks) ;
                }
            }
        }) ;
    }
}

iterate_stock() ;

// function get_monthly_crawler_data(stocks){
//     var cur_year = new Date().getFullYear() ;
//     var year_range = config.db_create_db_year_count ;
//     var promise_list = [] ;

//     stocks.forEach(function(it, idx, array){
//         for(var j = cur_year; j > (cur_year - year_range); j--){
//             promise_list.push(monthly_price_crawler.crawl({stock: it.getDataValue('id'), year: j}).reflect()) ;
//         }
//     }) ;

//     return Promise.all(promise_list) ;
// }

// function upsert_monthly_crawler_data(promise_results){
//     var upsert_promise_list = [] ;

//     promise_results.forEach(function(item, index, array){
//         if(item.isFulfilled()){
//             item.value().forEach(function(it, idx){
//                 upsert_promise_list.push(StockDailyInfo.upsert(it).reflect()) ;
//             })
//         } else {
//             logger.error(item.reason()) ;
//         }
//     }) ;

//     return Promise.all(upsert_promise_list) ;
// }



// function save_stock_list(result){   
//     var promise_list = [] ;

//     result.forEach(function(item, index, array){
//         promise_list.push(Stock.upsert(item).reflect()) ;
//     }) ;

//     return Promise.all(promise_list);
// }

// stock_crawler.crawl(new Date(2016, 6, 20)).then(save_stock_list).then(
//     function(results){
//         var not_fulfilled = [] ;
//         for(var i=0; i < results.length; i++){
//             if(!results[i].isFulfilled()){
//                 not_fulfilled.push(''+i);
//             }
//         }

//         if(not_fulfilled.length > 0){
//             return logger.error(new Error('Items can not be save.', not_fulfilled)) ;
//         } else {
//             return logger.info('Insert stock list successfuly.') ;
//         }
//     }).catch(function(err){
//         logger.error('Something wrong when init the stock list', err) ;
//     });

