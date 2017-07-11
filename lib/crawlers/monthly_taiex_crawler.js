var logger = require('../../logging') ;
var Promise = require('bluebird') ;
var utils = require('../../utils') ;
var MonthlyDataCrawler = require('./crawler_base').MonthlyDataCrawler ;
var node_util = require('util') ;

var taiex_url = 'http://www.tse.com.tw/indicesReport/MI_5MINS_HIST' ;
var data_fields = [{
    name: 'date',
    action: function(text, data){
        data.date = utils.convertToUTC(text) ;
    }
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
}] ;

function MonthlyTAIEXCrawler(config){
    MonthlyDataCrawler.apply(this, arguments) ;
}

MonthlyTAIEXCrawler.prototype = Object.create(MonthlyDataCrawler.prototype) ;
MonthlyTAIEXCrawler.prototype.constructor = MonthlyTAIEXCrawler ;

var monthly_taiex_crawler = new MonthlyTAIEXCrawler({
    name: 'MonthlyTAIEXCrawler',
    url: taiex_url,
    fields: data_fields,
    type: 1
})

module.exports = monthly_taiex_crawler