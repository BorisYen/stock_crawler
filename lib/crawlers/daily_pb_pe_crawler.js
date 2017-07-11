var logger = require('../../logging') ;
var Promise = require('bluebird') ;
var utils = require('../../utils') ;
var DailyDataCrawler = require('./crawler_base').DailyDataCrawler ;
var node_util = require('util') ;

var pbpe_list_url = 'http://www.tse.com.tw/exchangeReport/BWIBBU_d' ;

var data_fields = [{
    name: 'id',
    action: function(text, data){ data.id = text ; return data ;}
},{
    name: 'name',
    action: utils.emptyFn 
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

function DailyPBPECrawler (config){
    DailyDataCrawler.apply(this, arguments) ;
}

DailyPBPECrawler.prototype = Object.create(DailyDataCrawler.prototype) ;
DailyPBPECrawler.prototype.constructor = DailyPBPECrawler ;
DailyPBPECrawler.prototype.create_form_data = function(options){
    var q_date = options.date ;
    var year = q_date.getFullYear() ;
    var month = (q_date.getMonth() + 1)/10 < 1? '0'+(q_date.getMonth() + 1): (q_date.getMonth() + 1) ;
    var day = q_date.getDate()/10 < 1? '0'+q_date.getDate(): q_date.getDate() ;

    return {
        'response': 'json',
        'date': ""+year+month+day,
        'selectType': 'ALL',
        '_': Date.now()
    }
}

var daily_pb_pe_crawler = new DailyPBPECrawler({
    name: 'DailyPBPECrawler',
    url: pbpe_list_url,
    fields: data_fields,
    type: 2
})

module.exports = daily_pb_pe_crawler ;