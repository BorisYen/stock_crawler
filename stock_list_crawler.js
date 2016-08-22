var cheerio = require('cheerio') ;
var request = require('request') ;
var logger = require('./logging') ;

// use this url for now.
// TODO: if there is a better url, use it instead.
var stock_list_url = 'http://www.twse.com.tw/ch/trading/exchange/TWTASU/TWTASU.php' ;
var selector = "div#main-content table tbody tr" ;

// this is used to get a complete list of stocks on TWSE.
function get_stock_list(date, cb){
    var cur_date = new Date() ;
    var cb = cb || function(){} ;

    request.post({
        url: stock_list_url,
        form: {
            download: "",
            qdate: (cur_date.getFullYear - 1911)+'/'+(cur_date.getMonth+1)+'/'+cur_date.getDate()
        },
        timeout: 120000
    }, function(err, res, body){
        if(err){
            logger.error('Unable to get stock list.', err) ;
            return ;
        } 

        var $ = cheerio.load(body) ;
        var all_tr = $(selector) ;

        if(all_tr.length === 1 && all_tr.html().indexOf("查無資料") != 0){
            logger.info("No data available.") ;
            return cb(new Error('No data available.'), page_price_data) ;
        }

        var stock_list = [] ;
        all_tr.each(function(index, tr){
            var tmp = $(this).children('td').first().text() ;
            var id_symbol = tmp.trim().split(/\s+/) ;

            if(id_symbol.length != 2){
                logger.debug('This is not a id_symbol composite.', tmp) ;
            } else {
                stock_list.push({id: id_symbol[0], symbol: id_symbol[1]}) ;
            }
        }) ;

        cb(err, stock_list) ;
    }) ;
}

var stock_list = get_stock_list(new Date(2016, 7, 19), function(err, stock_list){
    logger.info('Stock list', stock_list) ;
}) ;
