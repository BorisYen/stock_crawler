var request = require('request') ;
var cheerio = require('cheerio') ;
var _ = require("lodash") ;
var logger = require('../logging') ;

var price_url = "http://www.twse.com.tw/ch/trading/exchange/STOCK_DAY/STOCK_DAYMAIN.php" ;
var selector = "div#main-content table tbody tr" ;
var data_fields = ["date", "vol", "turnover", "open", "high", "low", "close", "diff", "transactions"] ;

function crawl_stock_price(stock_num, year, month, cb){
    request.post({
        url: price_url, 
        form: {
            "download": "",
            "query_year": year,
            "query_month": month,
            "CO_ID": stock_num,
            "query-button": "查詢"
        },
        timeout: 120000
    }, function(err, res, body){
        
        if(err){
            logger.error(err) ;
            return cb(err) ;
        }

        if(res.statusCode !== 200){
            logger.error("can not get the html content from server") ;
            return cb(err) ;
        }

        var $ = cheerio.load(body) ;
        var all_tr = $(selector) ;
        var page_price_data = [] ;

        if(all_tr.length === 1 && all_tr.html().indexOf("查無資料") != 0){
            logger.info("No data available.") ;
            return cb(new Error('No data available.'), page_price_data) ;
        }

        all_tr.each(function(index, tr){
            var price_data = {} ;

            $(this).children("td").each(function(i, td){
                // the first td is date. others are data. 
                if(price_data.date){
                    price_data[data_fields[i]] = _.toNumber($(td).text().split(",").join("")) ;
                } else {
                    var date_parts = $(td).text().split("/") ;
                    if(date_parts.length == 3){
                        // TODO figure out why the result of "new Date(year, month, day)" is not what I expected.
                        price_data.date = new Date(Date.UTC(parseInt(date_parts[0]) + 1911, parseInt(date_parts[1]) - 1, date_parts[2])) ;
                    } else {
                        logger.debug("this is not a date field: %s", $(td).text()) ;
                        
                    }
                }
            });

            if(!_.isEmpty(price_data))
                page_price_data.push(price_data) ;
        }) ;
        logger.debug('year %d, month %d', year, month) ;
        logger.debug('page price data. ', page_price_data) ;

        cb(err, page_price_data) ;
    })
}

/**
 * 1. the options could be a Date object or it could be {year: xxx, month: xxx, day:xx}.
 * the return value is an object.
 * 
 * 2. when only year is specified, it returns data for the whole year.
 * the return value is an array of objects.
 * 3. when only year and month are specified, it returns data for the whole month.
 * the return value is an array of objects.
 */
exports.crawl_price = function(stock, options, cb){
    var results = [] ;
    var year = options instanceof Date? options.getFullYear(): options.year ;
    var month = options instanceof Date? options.getMonth() + 1: options.month ;
    var day = options instanceof Date? options.getDate(): options.day ;

    logger.info('try to crawl data for year %d, month %d, day %d', year, month, day) ;
    // console.log('test',year, month, day, options.getTimezoneOffset(), options.getHours()) ;
    if(!year || (day && !month)) return cb(new Error('Illegal Argument')) ;

    function get_price_cb(mon, retries){
        retries = retries || 0 ;

        return function(err, result){
            if(err) {
                if(retries < 3){
                    logger.error('retry getting stock price for stock %d, month %d, retries %d', stock, mon, retries, err) ;
                    crawl_stock_price(stock, year, mon, get_price_cb(mon, retries + 1)) ;

                    return ;
                } else {
                    // exceed max retry count, add empty result to the result set.
                    logger.info('exceed max tried count. get data for stock %d, month %d, retries %d', stock, mon, retries) ;
                    results.push({month: mon, result: result}) ;
                }
            } else {
                logger.info('getting data successfully for stock %d, month %d, retries %d', stock, mon, retries) ;
                results.push({month: mon, result: result}) ;
            }

            if(results.length === target_result_length){
                if(day) {
                    var ret_idx = _.findIndex(results[0].result, function(o){
                        var test ;
                        return o.date.getTime() == new Date(Date.UTC(year, mon - 1 , day)).getTime() ;
                    }) ;

                    if(ret_idx != -1)
                        return cb(err, results[0].result[ret_idx]) ;
                    else
                        return cb(err, {}) ;
                } else if(month) {
                    cb(err, results[0].result) ;
                } else {
                    cb(err, _.reduce(results, function(ret, o){
                        return ret.concat(o.result) ;
                    }, [])) ;
                }
            }
        }
    }

    var loop_start = month || 1 ;
    var loop_end = month || 12 ;
    var target_result_length = loop_end - loop_start + 1 ;

    for(var i=loop_start; i<=loop_end; i++){
        crawl_stock_price(stock, year, i, get_price_cb(i)) ;
    }
}



// // get stock price sequentically by month
// function get_all_price(){
//     function get_price_cb(month){
//         return function(err){
//             if(err) {
//                 logger.error('get_stock_price err', err) ;
//                 throw err;
//             }

//             if(month < 12){
//                 get_stock_price(2353, 2015, month+1, get_price_cb(month+1)) ;
//             } else {
//                 logger.info('is done') ;
//                 is_done = true;
//             }
//         }
//     }

//     get_stock_price(2353, 2015, 1, get_price_cb(1));
// }

// get_all_price() ;

// get_stock_price(2353, 2016, 1) ;

// clear_up() ;

