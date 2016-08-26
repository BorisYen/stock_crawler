var cheerio = require('cheerio') ;
var request = require('request') ;
var logger = require('../logging') ;
var utils = require('../utils') ;
var Promise = require('bluebird') ;

// use this url for now.
// TODO: if there is a better url, use it instead.
var stock_list_url = 'http://www.twse.com.tw/ch/trading/exchange/TWTASU/TWTASU.php' ;
var selector = "div#main-content table tbody tr" ;

// this is used to get a complete list of stocks on TWSE.
function crawl_stock_list(date){
    var cur_date = date || new Date() ;

    return new Promise(function(resolve, reject){
        request.post({
            url: stock_list_url,
            form: {
                download: "",
                qdate: (cur_date.getFullYear() - 1911)+'/'+(cur_date.getMonth() + 1)+'/'+(cur_date.getDate()+2)
            },
            timeout: 120000
        }, function(err, res, body){
            if(err){
                return reject(new Error('Unable to get stock list.')) ;
            } 

            var $ = cheerio.load(body) ;
            var all_tr = $(selector) ;

            if(all_tr.length === 1 && all_tr.html().indexOf("查無資料") != 0){
                return reject(new Error('No data available.')) ;
            }

            var stock_list = [] ;
            all_tr.each(function(index, tr){
                var tmp = $(this).children('td').first().text() ;
                var id_name = tmp.trim().split(/\s+/) ;

                if(id_name.length != 2){
                    logger.debug('This is not a id_symbol composite.', tmp) ;
                } else {
                    stock_list.push({id: id_name[0], name: id_name[1]}) ;
                }
            }) ;

            resolve(stock_list) ;
        }) ;
    }) ;
}

exports.crawl_stock_list = crawl_stock_list ;