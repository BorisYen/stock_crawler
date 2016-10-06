var monthly_price_crawler = require('./lib/monthly_price_crawler') ;
var stock_crawler = require('./lib/stock_list_crawler') ;
var monthly_pbpe_crawler = require('./lib/monthly_pb_pe_crawler') ;
var daily_pbpe_crawler = require('./lib/daily_pb_pe_crawler') ;
var daily_stock_load_security_lending_crawler = require('./lib/daily_stock_load_security_lending_crawler') ;
var monthly_taiex_crawler = require('./lib/monthly_taiex_crawler') 
var monthly_taiex_trade_crawler = require('./lib/monthly_taiex_trade_crawler') 
var MonthlyStockDataCrawler = require('./lib/crawler_base').MonthlyStockDataCrawler ;
var db = require('./dbconnection') ;
var logger = require('./logging') ;
var utils = require('./utils') ;
var Promise = require('bluebird') ;
var config = require('./config') ;
var Stock = db.Stock ;
var StockDailyInfo = db.StockDailyInfo ;
var TAIEX = db.TAIEX ;

// function* stock_gen(offset, limit, crawler){
//     var offset = offset || 0 ;
//     var limit = limit || 1 ;

//     while(true){
//         var stocks = yield Stock.findAll({offset: offset, limit: limit}) ;
//         var data_g = monthly_cralwer_data_gen(stocks, crawler) ;

//         for(var crawl_data of data_g){
//             var crawl_results = yield crawl_data ;
//             var upsert_promises = [] ;

//             crawl_results.forEach(function(it, idx, array){
//                  upsert_promises.push(StockDailyInfo.upsert(it).reflect()) ;
//             }) ;

//             yield Promise.all(upsert_promises) ;
//         }

//         if(stocks.length > 0)
//             offset += limit ;
//         else
//             break ;
//     }

//     console.log('leave stock generator') ;
// }

/**
 * The project use Promise.all a lot.
 * 
 * This is util function to gather the result.
 */
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
    var end_date = end_date || new Date(start_date.getFullYear()-config.create_db_year_range, start_date.getMonth(), start_date.getDate()) ;

    if(start_date.getTime() <= end_date.getTime()) throw new Error('Start date <= End date') ;

    var start_year = start_date.getFullYear() ;
    var year_range = start_year - end_date.getFullYear() ;
    
    if(crawler instanceof MonthlyStockDataCrawler){
        for(var i=0; i<stocks.length; i++){
            var promise_list = [] ;

            for(var j = start_year; j > (start_year - year_range); j--){
                promise_list.push(crawler.crawl({stock: stocks[i]['id'], year: j}).reflect()) ;
            }

            yield Promise.all(promise_list).then(gather_promise_result) ;
        }
    } else {
        var promise_list = [] ;

        for(var j = start_year; j > (start_year - year_range); j--){
            promise_list.push(crawler.crawl({year: j}).reflect()) ;
        }

        yield Promise.all(promise_list).then(gather_promise_result) ;
    }
}

/**
 * 
 */
function* daily_crawler_data_gen(crawler, start_date, end_date){
    var start_date = start_date || new Date() ;
    var end_date = end_date || new Date(start_date.getFullYear()-config.create_db_year_range, start_date.getMonth(), start_date.getDate()) ;
    
    if(start_date.getTime() <= end_date.getTime()) throw new Error('Start date <= End date') ;

    var cur_year = start_date.getFullYear() ;
    var cur_month = start_date.getMonth() ;
    var cur_day = start_date.getDate() ;
    var batch_size = 2 ;
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

        if(offset !== 0 && offset%batch_size === 0){
            yield Promise.all(promise_batch).then(gather_promise_result) ;
            promise_batch = [] ;
        }

        offset++ ;
    }

    if(promise_batch.length > 0){
        yield Promise.all(promise_batch).then(gather_promise_result) ;
    }
}

/**
 * This is used to save data to db. It wraps a db_model and use it to insert/update data.
 */
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
            upsert_promises = null ;  // this seems to cause some sort memory leak.  TODO: need to get to the bottom of it.
            results = null ;
            return data;
        }) ;
    }
}

/**
 * Iterate over the generator and perform an action on the result of each item from the generator.
 */
function iterate_generator(options){
    return new Promise(function(resolve, reject){
        if(!options.generator) reject(new Error('No generator is specified.')) ;

        var gen_args = options.gen_args ;
        var gen = options.generator.apply(null, gen_args) ;
        var action = options.action ;

        function go(next){
            if(next.done) return resolve() ;

            if(action){
                next.value.then(action).then(function(d){
                    go(gen.next(d)) ;

                    return null ;  // add a return clause here, so that the warning from promise can be supressed.
                });
            } else {
                next.value.then(function(d){
                    go(gen.next(d)) ;

                    return null ;  // add a return clause here, so that the warning from promise can be supressed.
                }) ;
            }
        }

        go(gen.next()) ;
    }) ;
}


db.sequelize.sync().then(function(){

    return stock_crawler.crawl().then(batch_save(Stock)) ;

}).then(function(stocks){
    var data_gen_promises = [] ;

    // var m_price_crawler_pro = iterate_generator({
    //         generator: monthly_cralwer_data_gen, 
    //         gen_args: [ [{id: '0050'}], monthly_price_crawler], 
    //         action: batch_save(StockDailyInfo)
    //     }).then(function(result){
    //         console.log('done') ;
    //         StockDailyInfo.updateMvAll('0050') ;
    //         StockDailyInfo.updateKDAll('0050') ;
    //         StockDailyInfo.updateRSIAll('0050') ;
    //     }) ;

    var m_taiex_crawler_pro = iterate_generator({
            generator: monthly_cralwer_data_gen, 
            gen_args: [[], monthly_taiex_crawler], 
            action: batch_save(TAIEX)
        }).then(function(result){
            console.log('done') ;
            TAIEX.updateMvAll().then(function(result){TAIEX.updateBiasAll()}) ;
            TAIEX.updatePsyAll() ;
            // TAIEX.updateKDAll() ;
            // TAIEX.updateRSIAll() ;
        }) ;

    // var m_taiex_trade_pro = iterate_generator({
    //         generator: monthly_cralwer_data_gen, 
    //         gen_args: [[], monthly_taiex_trade_crawler], 
    //         action: batch_save(TAIEX)
    //     }).then(function(result){
    //         console.log('done') ;
    //     }) ;
    
    // var d_pbpe_crawler_pro = iterate_generator({
    //         generator: daily_crawler_data_gen, 
    //         gen_args: [daily_pbpe_crawler, new Date()], 
    //         action: batch_save(StockDailyInfo)
    //     }) ;

    // d_pbpe_crawler_pro.then(function(){
    //     if (global.gc) {
    //         global.gc();
    //     } else {
    //         console.log('Garbage collection unavailable.  Pass --expose-gc '
    //         + 'when launching node to enable forced garbage collection.');
    //     }
    // })
    // var d_stock_load_security_lending_pro = iterate_generator({
    //         generator: daily_crawler_data_gen, 
    //         gen_args: [daily_stock_load_security_lending_crawler, new Date()], 
    //         action: batch_save(StockDailyInfo)
    //     }) ;

    // data_gen_promises.push(m_price_crawler_pro, m_taiex_crawler_pro, m_taiex_trade_pro, 
    //      d_stock_load_security_lending_pro) ;

    // return Promise.all(data_gen_promises) ;
}) ;

// setInterval(function(){
//     console.log('gc') ;
//     global.gc() ;
// }, 10000)

