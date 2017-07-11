var logger = require('../../logging') ;
var Promise = require('bluebird') ;
var utils = require('../../utils') ;
var DailyDataCrawler = require('./crawler_base').DailyDataCrawler ;
var node_util = require('util') ;

var institution_trade_url = 'http://www.tse.com.tw/fund/T86' ;

var data_fields = [{
    name: 'id',
    action: function(text, data){ data.id = text ; return data ;}
},{
    name: 'name',
    action: utils.emptyFn 
},{
    name: 'foreign_investors_buy',
    action: function(text, data) { data.pe_ratio = utils.convertToNum(text) ; return data ;}
}, {
    name: 'foreign_investors_sell',
    action: function(text, data) { data.yields = utils.convertToNum(text) ; return data ;}
}, {
    name: 'foreign_investors_diff',
    action: function(text, data) { data.pb_ratio = utils.convertToNum(text) ; return data ;}
},{
    name: 'investment_trust_buy',
    action: function(text, data) { data.pe_ratio = utils.convertToNum(text) ; return data ;}
}, {
    name: 'investment_trust_sell',
    action: function(text, data) { data.yields = utils.convertToNum(text) ; return data ;}
}, {
    name: 'investment_trust_diff',
    action: function(text, data) { data.pb_ratio = utils.convertToNum(text) ; return data ;}
},{
    name: 'dealer_overall_diff',
    action: function(text, data) { data.pe_ratio = utils.convertToNum(text) ; return data ;}
}, {
    name: 'dealer_buy',
    action: function(text, data) { data.yields = utils.convertToNum(text) ; return data ;}
}, {
    name: 'dealer_sell',
    action: function(text, data) { data.pb_ratio = utils.convertToNum(text) ; return data ;}
},{
    name: 'dealer_diff',
    action: function(text, data) { data.pe_ratio = utils.convertToNum(text) ; return data ;}
}, {
    name: 'dealer_hedge_buy',
    action: function(text, data) { data.yields = utils.convertToNum(text) ; return data ;}
}, {
    name: 'dealer_hedge_sell',
    action: function(text, data) { data.pb_ratio = utils.convertToNum(text) ; return data ;}
}, {
    name: 'dealer_hedge_diff',
    action: function(text, data) { data.yields = utils.convertToNum(text) ; return data ;}
}, {
    name: 'institution_overall_diff',
    action: function(text, data) { data.pb_ratio = utils.convertToNum(text) ; return data ;}
}] ;

function DailyInstitutionTradeCrawler (config){
    DailyDataCrawler.apply(this, arguments) ;
}

DailyInstitutionTradeCrawler.prototype = Object.create(DailyDataCrawler.prototype) ;
DailyInstitutionTradeCrawler.prototype.constructor = DailyInstitutionTradeCrawler ;
DailyInstitutionTradeCrawler.prototype.create_form_data = function(options){
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

var daily_institution_trade_crawler = new DailyInstitutionTradeCrawler({
    name: 'DailyInstitutionTradeCrawler',
    url: institution_trade_url,
    fields: data_fields,
    type: 2
})

module.exports = daily_institution_trade_crawler ;