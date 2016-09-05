var logger = require('../logging') ;
var Promise = require('bluebird') ;
var utils = require('../utils') ;
var Crawler = require('./crawler_base') ;
var node_util = require('util') ;

var pbpe_list_url = 'http://www.twse.com.tw/ch/trading/exchange/BWIBBU/BWIBBU_d.php' ;
var selector = 'div#tbl-containerx table tbody tr[bgcolor="#FFFFFF"]' ;
var data_fields = [{
    name: 'id',
    action: function(text, data){ data.id = text ; return data ;}
},{
    name: 'name',
    action: utils.emptyFn 
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

function DailyPBPECrawler (config){
    Crawler.apply(this, arguments) ;
}

DailyPBPECrawler.prototype = Object.create(Crawler.prototype) ;
DailyPBPECrawler.prototype.constructor = DailyPBPECrawler ;
DailyPBPECrawler.prototype.create_form_data = function(options){
    var cur_date = options && options instanceof Date? options: new Date() ;
    var year = (cur_date.getFullYear() - 1911) ;
    var month = (cur_date.getMonth() + 1)/10 < 1? '0'+(cur_date.getMonth() + 1): (cur_date.getMonth() + 1) ;
    var day = cur_date.getDate()/10 < 1? '0'+cur_date.getDate(): cur_date.getDate() ;

    return {
        input_date: year+'/'+month+'/'+day,
        // input_date: '105/6/4',
        select2: 'ALL',
        order: 'STKNO'
    }
}

DailyPBPECrawler.prototype.post_crawl = function(options, data){
    var cur_date = options && options instanceof Date? options: new Date() ;
    var utc_date = new Date(Date.UTC(cur_date.getFullYear(), cur_date.getMonth(), cur_date.getDate())) ;

    data.forEach(function(it, index, array){
        it.date = utc_date ;
    }) ;

    return data ;
}

var daily_pb_pe_crawler = new DailyPBPECrawler({
    name: 'DailyPBPECrawler',
    url: pbpe_list_url,
    fields: data_fields,
    selector: selector,
    type: 2
})

module.exports = daily_pb_pe_crawler ;