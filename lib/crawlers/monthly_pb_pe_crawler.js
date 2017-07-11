var logger = require('../../logging') ;
var Promise = require('bluebird') ;
var utils = require('../../utils') ;
var MonthlyStockDataCrawler = require('./crawler_base').MonthlyStockDataCrawler ;
var node_util = require('util') ;

var pbpe_list_url = 'http://www.tse.com.tw/exchangeReport/BWIBBU' ;
var data_fields = [{
    name: 'date',
    action: function(text, data){
        data.date = utils.convertToUTC(text) ;
        return data;
    }
},{
    name: 'yields',
    action: function(text, data) { data.yields = utils.convertToNum(text) ; return data ;}
},{
    name: 'nop',
    action: utils.emptyFn
},{
    name: 'pe_ratio',
    action: function(text, data) { data.pe_ratio = utils.convertToNum(text) ; return data ;}
}, {
    name: 'pb_ratio',
    action: function(text, data) { data.pb_ratio = utils.convertToNum(text) ; return data ;}
},{
    name: 'nop',
    action: utils.emptyFn
}] ;

function MonthlyPBPECrawler (config){
    MonthlyStockDataCrawler.apply(this, arguments) ;
}

MonthlyPBPECrawler.prototype = Object.create(MonthlyStockDataCrawler.prototype) ;
MonthlyPBPECrawler.prototype.constructor = MonthlyPBPECrawler ;
// MonthlyPBPECrawler.prototype.create_form_data = function(options){
//     return {
//         myear: options.year,
//         mmon: options.month,
//         STK_NO: options.stock
//     }
// }

var monthly_pb_pe_crawler = new MonthlyPBPECrawler({
    name: 'MonthlyPBPECrawler',
    url: pbpe_list_url,
    fields: data_fields,
    type: 1
})

module.exports = monthly_pb_pe_crawler ;