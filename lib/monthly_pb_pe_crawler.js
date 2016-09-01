var logger = require('../logging') ;
var Promise = require('bluebird') ;
var utils = require('../utils') ;
var Crawler = require('./crawler_base') ;
var node_util = require('util') ;

var pbpe_list_url = 'http://www.twse.com.tw/ch/trading/exchange/BWIBBU/BWIBBU_d.php' ;
var selector = 'table.board_trad tbody tr' ;
var data_fields = [{
    name: 'date',
    action: function(text, data){
        data.date = utils.convertToUTC(text) ;
        return data;
    }
},{
    name: 'pe_ratio',
    action: function(text, data) { data.pe_ratio = utils.convertToNum(text) ; return data ;}
}, {
    name: 'yields',
    action: function(text, data) { data.yields = utils.convertToNum(text) ; return data ;}
}, {
    name: 'pb_ratio',
    action: function(text, data) { data.pb_ratio = utils.convertToNum(text) ; return data ;}
}] ;

function MonthlyPBPECrawler (config){
    Crawler.apply(this, arguments) ;
}

MonthlyPBPECrawler.prototype = Object.create(Crawler.prototype) ;
MonthlyPBPECrawler.prototype.constructor = MonthlyPBPECrawler ;
MonthlyPBPECrawler.prototype.create_form_data = function(options){
    return {
        myear: options.year,
        mmon: options.month,
        STK_NO: options.stock_symbol
    }
}

var monthly_pb_pe_crawler = new MonthlyPBPECrawler({
    name: 'MonthlyPBPECrawler',
    url: pbpe_list_url,
    fields: data_fields,
    selector: selector
})

module.exports = monthly_pb_pe_crawler ;