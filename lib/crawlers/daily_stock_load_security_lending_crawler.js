var logger = require('../../logging') ;
var utils = require('../../utils') ;
var node_util = require('util') ;
var DailyDataCrawler = require('./crawler_base').DailyDataCrawler ;

// use this url for now.
// TODO: if there is a better url, use it instead.
var stock_list_url = 'http://www.tse.com.tw/exchangeReport/TWTASU' ;
var selector = 'div#main-content table tbody tr' ;
var data_fields = [{
    name: 'id_name',
    action: function(text, data){
        var id_name = text.trim().split(/\s+/) ;
        if(id_name.length < 2){
            logger.warn(node_util.format('%s is not a correct id_name composite!', text)) ;
        } else {
            data.id = id_name[0] ;
            data.name = id_name.slice(1).join(" ") ;
        }

        return data ;
    }
}, {
    name: 'stock_load_count',
    action: function(text, data) { data.stock_load_count = utils.convertToNum(text) ; return data ;}
}, {
    name: 'stock_load_amount',
    action: function(text, data) { data.stock_load_amount = utils.convertToNum(text) ; return data ;}
}, {
    name: 'security_lending_count',
    action: function(text, data) { data.security_lending_count = utils.convertToNum(text) ; return data ;}
}, {
    name: 'security_lending_amount',
    action: function(text, data) { data.security_lending_amount = utils.convertToNum(text) ; return data ;}
}
] ;

function DailyStockLoadSecurityLendingCrawler(config){
    DailyDataCrawler.apply(this, arguments) ;
}

DailyStockLoadSecurityLendingCrawler.prototype = Object.create(DailyDataCrawler.prototype) ;
DailyStockLoadSecurityLendingCrawler.prototype.constructor = DailyStockLoadSecurityLendingCrawler ;
DailyStockLoadSecurityLendingCrawler.prototype.create_form_data = function(options){
    var q_date = options.date ;
    var year = q_date.getFullYear() ;
    var month = (q_date.getMonth() + 1)/10 < 1? '0'+(q_date.getMonth() + 1): (q_date.getMonth() + 1) ;
    var day = q_date.getDate()/10 < 1? '0'+q_date.getDate(): q_date.getDate() ;

    return {
        'response': 'json',
        'date': ""+year+month+day,
        '_': Date.now()
    }
}

var stock_list_crawler = new DailyStockLoadSecurityLendingCrawler({
    name: 'DailyStockLoadSecurityLendingCrawler',
    url: stock_list_url,
    fields: data_fields,
    selector: selector,
    type: 2
}) ;

module.exports = stock_list_crawler ;