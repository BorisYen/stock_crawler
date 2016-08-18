var request = require('request') ;
var cheerio = require('cheerio') ;
var _ = require("lodash") ;
var logger = require('./logging') ;

var price_url = "http://www.twse.com.tw/ch/trading/exchange/STOCK_DAY/STOCK_DAYMAIN.php" ;
var selector = "div#main-content table tbody tr" ;
var data_fields = ["date", "vol", "turnover", "open", "high", "low", "close", "diff", "transactions"] ;

function get_stock_price(stock_num, year, month, cb){
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
                        price_data.date = new Date(parseInt(date_parts[0]) + 1911, parseInt(date_parts[1]) - 1, date_parts[2]) ;
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

        // page_price_data.forEach(function(data, index, arr){
        //     db_pool.query('insert into stock_price set ?', data, function(err, result){
        //         if(err) {
        //             // logger.error('insert db err: ', err) ;
        //             console.log(err) ; 
        //             return ;
        //         }

        //         logger.debug('insert data successfully.', result) ;
        //     }) ;
        // }) ;
        cb(err, page_price_data) ;
    })
}

// get stock price in parallel in month
exports.get_daily_price_for_year = function(stock, year, cb){
    var results = [] ;

    function get_price_cb(month, retries){
        retries = retries || 0 ;

        return function(err, result){
            if(err) {
                if(retries < 3){
                    logger.error('retry getting stock price for stock %d, month %d, retries %d', stock, month, retries, err) ;
                    get_stock_price(stock, year, month, get_price_cb(month, retries + 1)) ;

                    return ;
                } else {
                    // exceed max retry count, add empty result to the result set.
                    logger.info('exceed max tried count. get data for stock %d, month %d, retries %d', stock, month, retries) ;
                    results.push({month: month, result: result}) ;
                }
            } else {
                logger.info('getting data successfully for stock %d, month %d, retries %d', stock, month, retries) ;
                results.push({month: month, result: result}) ;
            }

            if(results.length === 12){
                cb(err, results) ;
            }
        }
    }

    for(var i=1; i<=12; i++){
        get_stock_price(stock, year, i, get_price_cb(i)) ;
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

