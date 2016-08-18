var mysql = require("mysql")
var logger = require('./logging') ;

var pool  = mysql.createPool({
    connectionLimit : 10,
    host     : '127.0.0.1',
    user     : 'byan',
    password : 'byan',
    database : 'stock'
});

exports.pool = pool;

exports.init = function (cb){
    pool.query('create table if not exists stock_price ( \
            date Date, \
            vol BIGINT, \
            turnover BIGINT, \
            open Float, \
            high Float, \
            low Float, \
            close Float, \
            diff Float, \
            transactions INT,\
            primary key (date) \
        )', function(err, rows, fields){
            if(err) {
                logger.error('something wrong when creating the stock table', err) 
                
                return cb(err) ;
            }

            logger.info('create stock table successfully.') ;
            cb(err) ;
        }) ;
}

exports.end = function(cb){
    pool.end(function(err){
        if(err){
            logger.error('something wrong when ending the pool', err) ;
            return cb(err) ;
        }
        logger.info('end db_pool') ;
        return cb(err) ;
    });
}