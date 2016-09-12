var logger = require('../logging') ;
var Promise = require('bluebird') ;
var utils = require('../utils') ;
var MonthlyDataCrawler = require('./crawler_base').MonthlyDataCrawler ;
var node_util = require('util') ;

var taiex_url = 'http://www.twse.com.tw/ch/trading/indices/MI_5MINS_HIST/MI_5MINS_HIST.php' ;
var selector = 'table.board_trad tr.gray12' ;
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
MonthlyTAIEXCrawler.prototype.create_form_data = function(options){
    var year = (options.year - 1911) ;
    var month = options.month/10 < 1? '0'+options.month: options.month ;

    return {
        'myear': year,
        'mmon': month
    }
}

var monthly_taiex_crawler = new MonthlyTAIEXCrawler({
    name: 'MonthlyTAIEXCrawler',
    url: taiex_url,
    fields: data_fields,
    selector: selector,
    type: 1
})

module.exports = monthly_taiex_crawler