var logger = require('../logging') ;
var utils = require('../utils') ;
var node_util = require('util') ;
var Crawler = require('./crawler_base') ;
var _ = require('lodash') ;

// use this url for now.
// TODO: if there is a better url, use it instead.
var stock_list_url = 'http://www.twse.com.tw/ch/trading/exchange/TWTASU/TWTASU.php' ;
var selector = 'div#main-content table tbody tr' ;
var data_fields = [{
    name: 'id_name',
    action: function(text, data){
        var id_name = text.trim().split(/\s+/) ;
        if(id_name.length < 2){
            throw new Error(node_util.format('%s is not a correct id_name composite!', text)) ;
        } else {
            data.id = id_name[0] ;
            data.name = id_name.slice(1).join(" ") ;
        }

        return data ;
    }
}
// , {
//     name: 'stock_load_count',
//     action: function(text, data) { data.stock_load_count = utils.convertToNum(text) ; return data ;}
// }, {
//     name: 'stock_load_amount',
//     action: function(text, data) { data.stock_load_amount = utils.convertToNum(text) ; return data ;}
// }, {
//     name: 'security_lending_count',
//     action: function(text, data) { data.security_lending_count = utils.convertToNum(text) ; return data ;}
// }, {
//     name: 'security_lending_amount',
//     action: function(text, data) { data.security_lending_amount = utils.convertToNum(text) ; return data ;}
// }
] ;

function DailyStockLoadSecurityLendingCrawler(config){
    Crawler.apply(this, arguments) ;
}

DailyStockLoadSecurityLendingCrawler.prototype = Object.create(Crawler.prototype) ;
DailyStockLoadSecurityLendingCrawler.prototype.constructor = DailyStockLoadSecurityLendingCrawler ;
DailyStockLoadSecurityLendingCrawler.prototype.create_form_data = function(options){
    var cur_date = options && options instanceof Date? options: new Date() ;
    var year = (cur_date.getFullYear() - 1911) ;
    var month = (cur_date.getMonth() + 1)/10 < 1? '0'+(cur_date.getMonth() + 1): (cur_date.getMonth() + 1) ;
    var day = cur_date.getDate()/10 < 1? '0'+cur_date.getDate(): cur_date.getDate() ;

    return {
        download: "",
        qdate: year+'/'+month+'/'+day
    }
}

DailyStockLoadSecurityLendingCrawler.prototype.post_crawl = function(options, data){
    var cur_date = options && options instanceof Date? options: new Date() ;
    var utc_date = new Date(Date.UTC(cur_date.getFullYear(), cur_date.getMonth(), cur_date.getDate())) ;

    data.forEach(function(it, index, array){
        it.date = utc_date ;
    }) ;

    return data ;
}

var stock_list_crawler = new DailyStockLoadSecurityLendingCrawler({
    name: 'DailyStockLoadSecurityLendingCrawler',
    url: stock_list_url,
    fields: data_fields,
    selector: selector,
    type: 2
}) ;

// this is used to get a complete list of stocks on TWSE.
function crawl_stock_list(date){
    return stock_list_crawler.crawl(date) ;
}

exports.crawl_stock_list = crawl_stock_list ;