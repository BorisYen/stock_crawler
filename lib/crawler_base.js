var cheerio = require('cheerio') ;
var request = require('request') ;
var Promise = require('bluebird') ;
var node_util = require('util') ;
var iconv = require('iconv-lite') ;
var logger = require('../logging') ;
var _ = require('lodash') ;

/**
 * Base Class of crawler
 * 
 * There are two types of crawler depending on the page layout from TWSE.
 * 1. monthly data for a specific stock
 * 2. data for all stock for a specific date.
 */
function Crawler(config){
    if(this.constructor === Crawler){
        throw new Error('Can not instantiate abstract class!') ;
    }

    if(!config.url) throw new Error('Url needs to be defined.') ;
    if(!config.fields) throw new Error('Can not locate hanlders for fileds.') ;
    if(!config.selector) throw new Error('Can not locate selector.') ;

    _.assign(this, config) ;
}

Crawler.prototype.crawl = function(options){
    var that = this ;
    return new Promise(function(resolve, reject){
        request.post({
            url: that.url,
            form: that.create_form_data(options),
            timeout: 20000,
            // 'request' by default decode the data with utf8, this is not what we need.
            // by setting encoding to null, the 'body' will be a buffer object.
            encoding: null 
        }, function(err, res, body){
            if(err){
                logger.error(node_util.format('Err: %s, Options: %j', err.message, options)) ;
                return reject(err) ;
            } 

            if(res.headers['content-type'] && 
                (res.headers['content-type'].toLowerCase().indexOf('utf8') != -1 || res.headers['content-type'].toLowerCase().indexOf('utf-8') != -1)){
                body = body.toString('utf8') ;
            } else {
                body = iconv.decode(body, 'Big5') ;
            }
            
            var $ = cheerio.load(body) ;
            var all_tr = $(that.selector) ;

            if(all_tr.length === 1 && all_tr.html().indexOf("查無資料") != 0){
                return reject(new Error(node_util.format('No data available. Options: %j', options))) ;
            }

            var ret = [] ;
            all_tr.each(function(index, tr){
                if(that.is_valid_row(tr)){
                    var row_data = {} ;

                    $(this).children('td').each(function(i, td){
                        if(that.fields[i] && that.fields[i].action)
                            that.fields[i].action($(td).text(), row_data) ;
                    }) ;

                    ret.push(row_data) ;
                }
            }) ;

            that.post_crawl(options, ret)
            resolve(ret) ;
        }) ;
    }) ;
}

/**
 * Different twse page might need to have different form data.
 * Overwrite this method to provide the form data.
 */
Crawler.prototype.create_form_data = function(options){
    throw new Error('Abstract Method') ;
}

/**
 * After the data is crawled, might need to add some more fields to it based on the option provided for the crawl method.
 * This method has to be a sync method.
 * 
 * para: options used for crawl method.
 * data: data retrieve from the page.
 */
Crawler.prototype.post_crawl = function(options, data){
    
}

/**
 * Not every row on the table is needed. 
 * Overwirte this function to get rid of data that is not needed
 */
Crawler.prototype.is_valid_row = function(tr){
    return true ;
}

module.exports = Crawler ;