var logger = require('../logging') ;
var Promise = require('bluebird') ;
var utils = require('../utils') ;
var Crawler = require('./crawler_base') ;
var node_util = require('util') ;

var price_url = 'http://www.twse.com.tw/ch/trading/exchange/STOCK_DAY/STOCK_DAYMAIN.php' ;
var selector = 'div#main-content table tbody tr' ;
var data_fields = [{
    name: 'date',
    action: function(text, data){
        data.date = utils.convertToUTC(text) ;
    }
}, {
    name: 'vol',
    action: function(text, data) { data.vol = utils.convertToNum(text) ; return data ;}
}, {
    name: 'turnover',
    action: function(text, data) { data.turnover = utils.convertToNum(text) ; return data ;}
}, {
    name: 'open',
    action: function(text, data) { data.open = utils.convertToNum(text) ; return data ;}
}, {
    name: 'high',
    action: function(text, data) { data.high = utils.convertToNum(text) ; return data ;}
}, {
    name: 'low',
    action: function(text, data) { data.low = utils.convertToNum(text) ; return data ;}
}, {
    name: 'close',
    action: function(text, data) { data.close = utils.convertToNum(text) ; return data ;}
}, {
    name: 'diff',
    action: function(text, data) { data.diff = utils.convertToNum(text) ; return data ;}
}, {
    name: 'transations',
    action: function(text, data) { data.transations = utils.convertToNum(text) ; return data ;}
}] ;

function MonthlyStockPriceCrawler(config){
    Crawler.apply(this, arguments) ;
}

MonthlyStockPriceCrawler.prototype = Object.create(Crawler.prototype) ;
MonthlyStockPriceCrawler.prototype.constructor = MonthlyStockPriceCrawler ;
MonthlyStockPriceCrawler.prototype.create_form_data = function(options){
    return {
        'download': '',
        'query_year': options.year,
        'query_month': options.month,
        'CO_ID': options.stock_symbol,
        'query-button': '查詢'
    }
}

MonthlyStockPriceCrawler.prototype.post_crawl = function(options, data){
    data.forEach(function(it, idx, array){
        it.id = options.stock_symbol ;
    }) ;
}

var monthly_stock_price_crawler = new MonthlyStockPriceCrawler({
    name: 'MonthlyStockPriceCrawler',
    url: price_url,
    fields: data_fields,
    selector: selector,
    type: 1
})

/**
 * 1. the options could be a Date object or it could be {year: xxx, month: xxx, day:xx}.
 * the return value is an object.
 * 
 * 2. when only year is specified, it returns data for the whole year.
 * the return value is an array of objects.
 * 3. when only year and month are specified, it returns data for the whole month.
 * the return value is an array of objects.
 */
exports.crawl_price = function(stock, options){
    var year = options instanceof Date? options.getFullYear(): options.year ;
    var month = options instanceof Date? options.getMonth() + 1: options.month ;
    var day = options instanceof Date? options.getDate(): options.day ;

    if(!year || (day && !month)) return new Promise.reject(
        new Error(node_util.format('Illegal Argument: try to crawl data for year %d, month %d, day %d', year, month, day))) ;

    var loop_start = month || 1 ;
    var loop_end = month || 12 ;
    var promise_list = [] ;

    for(var i=loop_start; i<=loop_end; i++){
        promise_list.push(monthly_stock_price_crawler.crawl({stock_symbol: stock, year: year, month: i})) ;
    }

    return Promise.all(promise_list.map(function(promise){
        return promise.reflect() ;
    })).then(function(result){
        var err_month = [] ;
        var crawl_results = [] ;

        result.forEach(function(item, index, array){
            if(item.isRejected()){
                logger.error(item.reason().message) ;
                // for whole year
                if(result.length > 1)
                    err_month.push(index+1) ;
                else // for single month or day.
                    err_month.push(month)
            } else {
                if(day){
                    var monthly_result = item.value() ;

                    var ret_idx = _.findIndex(monthly_result, function(o){
                        return o.date.getTime() == new Date(Date.UTC(year, month - 1 , day)).getTime() ;
                    }) ;

                    if(ret_idx != -1) {
                        crawl_results.push(monthly_result[ret_idx]) ;
                    }
                } else {
                    crawl_results = crawl_results.concat(item.value()) ;
                }
            }
        }) ;

        return crawl_results ;
    });
}
