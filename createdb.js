var monthly_price_crawler = require('./lib/monthly_price_crawler') ;
var stock_crawler = require('./lib/stock_list_crawler') ;
var monthly_pbpe_crawler = require('./lib/monthly_pb_pe_crawler') ;
var daily_pbpe_crawler = require('./lib/daily_pb_pe_crawler') ;
var daily_stock_load_security_lending_crawler = require('./lib/daily_stock_load_security_lending_crawler') ;
var db = require('./dbconnection') ;
var logger = require('./logging') ;
var utils = require('./utils') ;
var Promise = require('bluebird') ;
var config = require('./config') ;
var Stock = db.Stock ;
var StockDailyInfo = db.StockDailyInfo ;

// create schema
db.sequelize.sync() ;

function* stock_gen(offset, limit, crawler){
    var offset = offset || 0 ;
    var limit = limit || 1 ;

    while(true){
        var stocks = yield Stock.findAll({offset: offset, limit: limit}) ;
        var data_g = monthly_cralwer_data_gen(stocks, crawler) ;

        for(var crawl_data of data_g){
            var crawl_results = yield crawl_data ;
            var upsert_promises = [] ;

            crawl_results.forEach(function(it, idx, array){
                 upsert_promises.push(StockDailyInfo.upsert(it).reflect()) ;
            }) ;

            yield Promise.all(upsert_promises) ;
        }

        if(stocks.length > 0)
            offset += limit ;
        else
            break ;
    }

    console.log('leave stock generator') ;
}

function gather_promise_result(results){
    var ret = [] ;

    results.forEach(function(pro, idx, array){
        if(pro.isFulfilled()){
            ret = ret.concat(pro.value()) ;
        } else {
            logger.error(pro.reason().message) ;
        }
    }) ;

    return ret ;
}

/**
 * Get data for a year at a time. Focus on year for now.
 * 
 * TODO: make it more accurate when retrieving data.
 */
function* monthly_cralwer_data_gen(stocks, crawler, start_date, end_date){
    var start_date = start_date || new Date() ;
    var end_date = end_date || new Date(start_date.getFullYear()-config.db_create_db_year_count, start_date.getMonth(), start_date.getDate()) ;

    if(start_date.getTime() <= end_date.getTime()) throw new Error('Start date <= End date') ;

    var start_year = start_date.getFullYear() ;
    var year_range = start_year - end_date.getFullYear() ;
    
    for(var i=0; i<stocks.length; i++){
        var promise_list = [] ;

        for(var j = start_year; j > (start_year - year_range); j--){
            promise_list.push(crawler.crawl({stock: stocks[i]['id'], year: j}).reflect()) ;
        }

        yield Promise.all(promise_list).then(gather_promise_result) ;
    }
}

/**
 * 
 */
function* daily_crawler_data_gen(crawler, start_date, end_date){
    var start_date = start_date || new Date() ;
    var end_date = end_date || new Date(start_date.getFullYear()-config.db_create_db_year_count, start_date.getMonth(), start_date.getDate()) ;
    
    if(start_date.getTime() <= end_date.getTime()) throw new Error('Start date <= End date') ;

    var cur_year = start_date.getFullYear() ;
    var cur_month = start_date.getMonth() ;
    var cur_day = start_date.getDate() ;
    var batch_size = 1 ;
    var offset = 0 ;
    var promise_batch = [] ;

    while(true){
        var q_date = new Date(cur_year, cur_month, cur_day-offset) ;

        console.log(q_date) ;
        if(q_date.getTime() <= end_date.getTime()){
             break ;
        }
        else{
            promise_batch.push(crawler.crawl({date: q_date}).reflect()) ;
        }

        if(offset%batch_size === 0){
            yield Promise.all(promise_batch).then(gather_promise_result) ;
            promise_batch = [] ;
        }

        offset++ ;
    }

    if(promise_batch.length > 0){
        yield Promise.all(promise_batch).then(gather_promise_result) ;
    }
}

// daily_crawler_data_gen() ;

function batch_save(db_model){
    return function (data){
        var upsert_promises= [] ;

        data.forEach(function(it, idx, array){
            upsert_promises.push(db_model.upsert(it).reflect()) ;
        }) ;

        return Promise.all(upsert_promises).then(function(results){
            results.forEach(function(it, idx, array){
                if(it.isRejected()){
                    var err = it.reason() ;
                    logger.error(err.message, err.sql) ;
                }
            }) ;

            return true;
        }) ;
    }
}


function iterate_generator(options){
    return new Promise(function(resolve, reject){
        if(!options.generator) throw new Error('No generator is specified.') ;

        var gen_args = options.gen_args ;
        var gen = options.generator.apply(null, gen_args) ;
        var action = options.action ;

        function go(next){
            if(next.done) return resolve() ;

            if(action){
                next.value.then(action).then(function(d){
                    go(gen.next(d)) ;

                    return null ;
                });
            } else {
                next.value.then(function(d){
                    go(gen.next(d)) ;

                    return null ;
                }) ;
            }
        }

        go(gen.next()) ;
    }) ;
}

// iterate_generator({
//     generator: monthly_cralwer_data_gen, 
//     gen_args: [ [{id: '0050'}, {id: '0051'}], monthly_price_crawler], 
//     action: batch_save(StockDailyInfo)
// }).then(function(result){
//     console.log('done') ;
// }) ;

// iterate_generator({
//     generator: daily_crawler_data_gen, 
//     gen_args: [daily_pbpe_crawler, new Date()], 
//     action: batch_save(StockDailyInfo)
// }) ;
 
iterate_generator({
    generator: daily_crawler_data_gen, 
    gen_args: [daily_stock_load_security_lending_crawler, new Date()], 
    action: batch_save(StockDailyInfo)
}) ;

// stock_crawler.crawl().then(function(results){
//     console.log(results) ;
// }) ;

