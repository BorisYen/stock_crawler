var logger = require('../../logging') ;
var Promise = require('bluebird') ;
var utils = require('../../utils') ;
var MonthlyDataCrawler = require('./crawler_base').MonthlyDataCrawler ;
var node_util = require('util') ;

var taiex_trade_url = 'http://www.tse.com.tw/exchangeReport/FMTQIK' ;
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
    name: 'transations',
    action: function(text, data) { data.transations = utils.convertToNum(text) ; return data ;}
}, {
    name: 'close',  // the data will be coming from monthly_taiex_crawler
    action: utils.emptyFn
}, {
    name: 'diff',
    action: function(text, data) { data.diff = utils.convertToNum(text) ; return data ;}
}] ;

function MonthlyTAIEXTradeCrawler(config){
    MonthlyDataCrawler.apply(this, arguments) ;
}

MonthlyTAIEXTradeCrawler.prototype = Object.create(MonthlyDataCrawler.prototype) ;
MonthlyTAIEXTradeCrawler.prototype.constructor = MonthlyTAIEXTradeCrawler ;

var monthly_taiex_trade_crawler = new MonthlyTAIEXTradeCrawler({
    name: 'MonthlyTAIEXTradeCrawler',
    url: taiex_trade_url,
    fields: data_fields,
    type: 1
})

module.exports = monthly_taiex_trade_crawler