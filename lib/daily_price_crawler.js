var request = require('request') ;
var cheerio = require('cheerio') ;
var _ = require("lodash") ;
var logger = require('../logging') ;
var Promise = require('bluebird') ;
var util = require('util') ;

var price_url = "http://www.twse.com.tw/ch/trading/exchange/STOCK_DAY/STOCK_DAYMAIN.php" ;
var selector = "div#main-content table tbody tr" ;
var data_fields = ["date", "vol", "turnover", "open", "high", "low", "close", "diff", "transactions"] ;

function crawl_stock_price(stock_symbol, year, month){
    // make sure this is a string;
    stock_symbol = stock_symbol + '' ;

    return new Promise(function(resolve, reject){
        request.post({
            url: price_url, 
            form: {
                "download": "",
                "query_year": year,
                "query_month": month,
                "CO_ID": stock_symbol,
                "query-button": "查詢"
            },
            timeout: 120000
        }, function(err, res, body){
            if(err){
                logger.error('Error when requesing data from TWSE.', err) ;
                return reject(err) ;
            }

            if(res.statusCode !== 200){
                logger.error("can not get the html content from server") ;
                return reject(err) ;
            }

            var $ = cheerio.load(body) ;
            var all_tr = $(selector) ;
            var page_price_data = [] ;

            if(all_tr.length === 1 && all_tr.html().indexOf("查無資料") != 0){
                return reject(new Error(util.format('No data available. Year: %d, Month: %d', year, month)), page_price_data) ;
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
                            price_data.id = stock_symbol ;
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

            return resolve(page_price_data) ;
        })
    }) ;
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
exports.crawl_price = function(stock, options){
    var year = options instanceof Date? options.getFullYear(): options.year ;
    var month = options instanceof Date? options.getMonth() + 1: options.month ;
    var day = options instanceof Date? options.getDate(): options.day ;

    if(!year || (day && !month)) return new Promise.reject(
        new Error(util.format('Illegal Argument: try to crawl data for year %d, month %d, day %d', year, month, day))) ;

    var loop_start = month || 1 ;
    var loop_end = month || 12 ;
    var promise_list = [] ;

    for(var i=loop_start; i<=loop_end; i++){
        promise_list.push(crawl_stock_price(stock, year, i)) ;
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
