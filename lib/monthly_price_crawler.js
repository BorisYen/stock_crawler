var logger = require('../logging') ;
var Promise = require('bluebird') ;
var utils = require('../utils') ;
var MonthlyStockDataCrawler = require('./crawler_base').MonthlyStockDataCrawler ;
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
    MonthlyStockDataCrawler.apply(this, arguments) ;
}

MonthlyStockPriceCrawler.prototype = Object.create(MonthlyStockDataCrawler.prototype) ;
MonthlyStockPriceCrawler.prototype.constructor = MonthlyStockPriceCrawler ;
MonthlyStockPriceCrawler.prototype.create_form_data = function(options){
    return {
        'download': '',
        'query_year': options.year,
        'query_month': options.month,
        'CO_ID': options.stock,
        'query-button': '查詢'
    }
}

var monthly_stock_price_crawler = new MonthlyStockPriceCrawler({
    name: 'MonthlyStockPriceCrawler',
    url: price_url,
    fields: data_fields,
    selector: selector,
    type: 1
})

module.exports = monthly_stock_price_crawler
