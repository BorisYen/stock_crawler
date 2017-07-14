var monthly_price_crawler = require('./lib/crawlers/monthly_price_crawler') ;
var stock_crawler = require('./lib/crawlers/stock_list_crawler') ;
var monthly_pbpe_crawler = require('./lib/crawlers/monthly_pb_pe_crawler') ;
var daily_pbpe_crawler = require('./lib/crawlers/daily_pb_pe_crawler') ;
var daily_stock_load_security_lending_crawler = require('./lib/crawlers/daily_stock_load_security_lending_crawler') ;
var daily_institution_trade_crawler = require('./lib/crawlers/daily_institution_trade_crawler') ;
var monthly_taiex_crawler = require('./lib/crawlers/monthly_taiex_crawler') 
var monthly_taiex_trade_crawler = require('./lib/crawlers/monthly_taiex_trade_crawler') 
var MonthlyStockDataCrawler = require('./lib/crawlers/crawler_base').MonthlyStockDataCrawler ;
var db = require('./dbconnection') ;
var logger = require('./logging') ;
var utils = require('./utils') ;
var Promise = require('bluebird') ;
var config = require('./config') ;
var agg = require('./lib/stats/aggregation') ;
var Stock = db.Stock ;
var StockDailyInfo = db.StockDailyInfo ;
var TAIEX = db.TAIEX ;

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
 */
function* monthly_cralwer_data_gen(stocks, crawler, start_date, end_date){
    var start_date = start_date || new Date() ;
    var end_date = end_date || new Date(start_date.getFullYear()-config.create_db_year_range, start_date.getMonth(), start_date.getDate()) ;

    if(start_date.getTime() <= end_date.getTime()) throw new Error('Start date <= End date') ;

    var start_year = start_date.getFullYear() ;
    var year_range = start_year - end_date.getFullYear() ;
    var batch_size = config.request_batch_size ;
    var promise_list = [] ;
    var promise_handled_count = 0 ;

    if(crawler instanceof MonthlyStockDataCrawler){
        for(var i=0; i<stocks.length; i++){    
            for(var j = start_year; j > (start_year - year_range); j--){
                for(var k=1; k<=12; k++){
                    if(Date.now() > Date.UTC(j, k - 1)){
                        promise_list.push(crawler.crawl({stock: stocks[i]['id'], year: j, month: k}).reflect()) ;
                        promise_handled_count++ ;

                        if(promise_handled_count%batch_size === 0){
                            yield Promise.all(promise_list).then(gather_promise_result) ;
                            promise_list = [] ;
                        }
                    }
                }
            }
        }
    } else {
        for(var j = start_year; j > (start_year - year_range); j--){
            for(var k=1; k<=12; k++){
                if(Date.now() > Date.UTC(j, k - 1)){
                    promise_list.push(crawler.crawl({year: j, month: k}).reflect()) ;
                    promise_handled_count++ ;

                    if(promise_handled_count%batch_size === 0){
                        yield Promise.all(promise_list).then(gather_promise_result) ;
                        promise_list = [] ;
                    }
                }
            }
        }
    }

    if(promise_list.length > 0){
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
    var batch_size = config.request_batch_size ;
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
                }).catch(function(err){
                    logger.info(err.message) ;
                    go(gen.next()) ;

                    return null ;
                });
            } else {
                next.value.then(function(d){
                    go(gen.next(d)) ;

                    return null ;  // add a return clause here, so that the warning from promise can be supressed.
                }).catch(function(err){
                    logger.info(err.message) ;
                    go(gen.next()) ;

                    return null ;
                }); ;
            }
        }

        go(gen.next()) ;
    }) ;
}


db.sequelize.sync().then(function(){

    return stock_crawler.crawl().then(batch_save(Stock)) ;

}).then(function(stocks){

    // var m_price_crawler_pro = iterate_generator({
    //         generator: monthly_cralwer_data_gen, 
    //         gen_args: [[{id:'2883'}], monthly_pbpe_crawler], 
    //         action: batch_save(StockDailyInfo)
    //     }).then(function(result){
    //         console.log('done') ;
    //     }) ;

    // var m_price_crawler_pro = iterate_generator({
    //         generator: monthly_cralwer_data_gen, 
    //         gen_args: [[{id:'0050'}], monthly_price_crawler], 
    //         action: batch_save(StockDailyInfo)
    //     }).then(function(result){
    //         console.log('done') ;
    //     }) ;

    var m_taiex_crawler_pro = iterate_generator({
            generator: monthly_cralwer_data_gen, 
            gen_args: [[], monthly_taiex_crawler], 
            action: batch_save(TAIEX)
        }).then(function(result){
            console.log('done') ;
            TAIEX.updateMaAll().then(function(result){TAIEX.updateBBandAll()}) ;
            // TAIEX.updateMaAll().then(function(result){TAIEX.updateBiasAll()}) ;
            // TAIEX.updateMACDAll() ;
            // TAIEX.updateKDAll() ;
            // TAIEX.updateRSIAll() ;
            // TAIEX.updatePsyAll() ;
            // TAIEX.updateDMIAll() ;
            // TAIEX.findAll().then(function(records){
            //     console.log(agg.calculateMonthlyPrice(records)) ;
            // })
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
    //         gen_args: [daily_stock_load_security_lending_crawler, new Date()], 
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
    //         gen_args: [daily_institution_trade_crawler, new Date()], 
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

