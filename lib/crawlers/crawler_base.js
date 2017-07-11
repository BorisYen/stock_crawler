var cheerio = require('cheerio') ;
var request = require('request') ;
var Promise = require('bluebird') ;
var node_util = require('util') ;
var iconv = require('iconv-lite') ;
var logger = require('../../logging') ;
var config = require('../../config') ;
var _ = require('lodash') ;

/**
 * Base Class of crawler
 * 
 * There are two types of crawler depending on the page layout from TWSE.
 * 1. monthly data for a specific stock
 * 2. data for all stock for a specific date.
 */
function Crawler(config){
    if(this.constructor === Crawler){
        throw new Error('Can not instantiate abstract class!') ;
    }

    if(!config.url) throw new Error('Url needs to be defined.') ;
    if(!config.fields) throw new Error('Can not locate hanlders for fileds.') ;
    if(!config.selector) throw new Error('Can not locate selector.') ;
    if(!config.type || (config.type !== 1 && config.type !== 2)) throw new Error('Can not locate type or type is not 1 or 2.') ;

    _.assign(this, config) ;
}

Crawler.prototype.crawl = function(options){
    return _crawl.call(this, options) ;
}

/**
 * internal function shared by all crawlers.
 */
function _crawl(options){
    var that = this ;
    return new Promise(function(resolve, reject){
        request.get({
            url: that.url,
            qs: that.create_form_data(options),
            timeout: config.http_request_timeout
            // ,
            // // 'request' by default decode the data with utf8, this is not what we need.
            // // by setting encoding to null, the 'body' will be a buffer object.
            // encoding: null 
        }, function(err, res, body){
            if(err){
                logger.error(node_util.format('Err: %s, Options: %j', err.message, options)) ;
                return reject(err) ;
            } 

            if(res.statusCode < 200 || res.statusCode >= 300) {
                // console.log(body) ;
                logger.error(node_util.format('StatusCode: %d, Options: %j', res.statusCode, options)) ;
                return reject(new Error(node_util.format('No data available for crawler %s. Options: %j', that.name, options))) ;
            } 

            // if(res.headers['content-type'] && 
            //     (res.headers['content-type'].toLowerCase().indexOf('utf8') != -1 || res.headers['content-type'].toLowerCase().indexOf('utf-8') != -1)){
            //     body = body.toString('utf8') ;
            // } else {
            //     body = iconv.decode(body, 'Big5') ;
            // }

            var data = JSON.parse(body).data ;

            // var $ = cheerio.load(body) ;
            // var all_tr = $(that.selector) ;

            // if(all_tr.length === 0 || (all_tr.length === 1 && all_tr.html().indexOf("查無資料") != 0)){
            //     return reject(new Error(node_util.format('No data available for crawler %s. Options: %j', that.name, options))) ;
            // }

            // var ret = [] ;
            // all_tr.each(function(index, tr){
            //     if(that.is_valid_row(tr)){
            //         var row_data = {} ;

            //         $(this).children('td').each(function(i, td){
            //             if(that.fields[i] && that.fields[i].action)
            //                 that.fields[i].action($(td).text(), row_data) ;
            //         }) ;

            //         ret.push(row_data) ;
            //     }
            // }) ;

            
            var ret = [] ;
            if(data){
                data.forEach(function(item, rindex, arr){
                    var row_data = {} ;

                    item.forEach(function(cell, cindex, row){
                        if(that.fields[cindex] && that.fields[cindex].action){
                            that.fields[cindex].action(cell, row_data) ;
                        } 
                    }) ;

                    ret.push(row_data) ;
                }) ;
            }

            that.post_crawl(options, ret)
            resolve(ret) ;
        }) ;
    }) ;
}

/**
 * Different twse page might need to have different form data.
 * Overwrite this method to provide the form data.
 */
Crawler.prototype.create_form_data = function(options){
    throw new Error('Abstract Method') ;
}

/**
 * After the data is crawled, might need to add some more fields to it based on the option provided for the crawl method.
 * This method has to be a sync method.
 * 
 * para: options used for crawl method.
 * data: data retrieve from the page.
 */
Crawler.prototype.post_crawl = function(options, data){
    
}

/**
 * Not every row on the table is needed. 
 * Overwirte this function to get rid of data that is not needed
 */
Crawler.prototype.is_valid_row = function(tr){
    return true ;
}

function MonthlyDataCrawler(config){
    Crawler.apply(this, arguments) ;
}

MonthlyDataCrawler.prototype = Object.create(Crawler.prototype) ;
MonthlyDataCrawler.prototype.constructor = MonthlyDataCrawler ;

/**
 * options looks like {
 *     date: new Date(),
 *     year: 2016,
 *     month: 9,
 *     day: 10
 * }
 * 
 * 
 * 1. when date or day is specified, it returns a day worth of data.
 * the return value is an object.
 * 2. when only year is specified, it returns data for the whole year.
 * the return value is an array of objects.
 * 3. when only year and month are specified, it returns data for the whole month.
 * the return value is an array of objects.
 */
MonthlyDataCrawler.prototype.crawl = function(options){
    var query_date = options.date ;
    var year = query_date && query_date instanceof Date? query_date.getFullYear(): options.year ;
    var month = query_date && query_date instanceof Date? query_date.getMonth() + 1: options.month ;
    var day = query_date && query_date instanceof Date? query_date.getDate(): options.day ;

    if(!year || (day && !month)) return Promise.reject(
        new Error(node_util.format('Illegal Argument: try to crawl data with year %d, month %d, day %d', stock, year, month, day))) ;
    
    var that = this ;
    var loop_start = month || 1 ;
    var loop_end = month || 12 ;
    var promise_list = [] ;

    for(var i=loop_start; i<=loop_end; i++){
        var crawl_options = _.assign({}, options) ;

        crawl_options.year = year ;
        crawl_options.month = i ;
        promise_list.push(_crawl.call(this, crawl_options).reflect()) ;
    }

    return Promise.all(promise_list).then(function(result){
        promise_list = null ;

        var err_month = [] ;
        var crawl_results = [] ;

        result.forEach(function(item, index, array){
            if(item.isRejected()){
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
                        crawl_results = monthly_result[ret_idx] ;
                    }
                } else {
                    crawl_results = crawl_results.concat(item.value()) ;
                }
            }
        }) ;

        if(err_month.length === result.length || crawl_results.length === 0)
            return Promise.reject(new Error(node_util.format('No data available for crawler %s. Options: %j', that.name, options)));
        
        return crawl_results ;
    });
}

MonthlyDataCrawler.prototype.create_form_data = function(options){
    var month = options.month < 10? '0'+options.month: options.month ;
    return {
        'response': 'json',
        'date': ""+options.year+month+'01',
        '_': Date.now()
    }
}

function MonthlyStockDataCrawler(){
    MonthlyDataCrawler.apply(this, arguments) ;
}

MonthlyStockDataCrawler.prototype = Object.create(MonthlyDataCrawler.prototype) ;
MonthlyStockDataCrawler.prototype.constructor = MonthlyStockDataCrawler ;

/**
 * options looks like {
 *     stock: '0050',
 *     .
 *     .
 *     .
 * }
 * 
 * stock is not optional.
 */
MonthlyStockDataCrawler.prototype.crawl = function(options){
    if(!options.stock) {
        return Promise.reject(new Error('Stock Symbol not found.')) ;
    } else {
        return MonthlyDataCrawler.prototype.crawl.call(this, options) ;
    }
}

MonthlyStockDataCrawler.prototype.post_crawl = function(options, data){
    data.forEach(function(it, idx, array){
        it.id = options.stock ;
    }) ;
}

MonthlyStockDataCrawler.prototype.create_form_data = function(options){
    var ret = MonthlyDataCrawler.prototype.create_form_data.call(this, options) ;

    ret.stockNo = options.stock ;
    
    return ret ;
}

function DailyDataCrawler(config){
    Crawler.apply(this, arguments) ;
}

DailyDataCrawler.prototype = Object.create(Crawler.prototype) ;
DailyDataCrawler.prototype.constructor = DailyDataCrawler ;

DailyDataCrawler.prototype.post_crawl = function(options, data){
    var q_date = options.date ;
    var utc_date = new Date(Date.UTC(q_date.getFullYear(), q_date.getMonth(), q_date.getDate())) ;

    data.forEach(function(it, index, array){
        it.date = utc_date ;
    }) ;

    return data ;
}

/**
 * options looks like {
 *     stock: '0050',
 *     date: new Date()
 * }
 * 
 * both stock and date can be optional.
 */
DailyDataCrawler.prototype.crawl = function(options){
    var options = options || {} ;
    var that = this ;

    options.date = options.date && options.date instanceof Date? options.date: new Date() ;

    if(!options.stock){
        return _crawl.call(this, options) ;
    } else {
        return _crawl.call(this, options).then(function(result){
            var tmp = result.filter(function(it, idx, array){
                if(it.id && it.id.trim() === options.stock) return true ;
            }) ;

            if(tmp.length === 1) 
                return tmp[0] ;
            else if(tmp.length > 1) { // this is not supposed to happen.
                logger.warn(node_util.format('More than one item is returned for option: %j', options)) ;
                return tmp ;  
            } else {
                throw new Error(node_util.format('No data available for crawler %s. Options: %j', that.name, options)) ;
            }
        }) ;
    }
}

exports.Crawler = Crawler ;
exports.MonthlyDataCrawler = MonthlyDataCrawler ;
exports.MonthlyStockDataCrawler = MonthlyStockDataCrawler ;
exports.DailyDataCrawler = DailyDataCrawler ;