var Sequelize = require("sequelize")
var logger = require('./logging') ;

var sequelize = new Sequelize('stock', 'byan', 'byan', {
    dialect: 'mysql',
    port: 3306,
    pool: {
        min: 1,
        max: 50,
        idle: 10000
    }
}) ;

exports.Stock = sequelize.define('stock', {
    id: { 
        type: Sequelize.STRING(15),
        primaryKey: true,
        allowNull: false
    },
    name: Sequelize.STRING(50)
}, {
    tableName: 'stock',
    timestamps: false
}) ;

exports.StockDailyInfo = sequelize.define('stock_daily_info', {
    id: {
        type: Sequelize.STRING(15),
        primaryKey: true,
        allNull: false
    },
    date: {
        type: Sequelize.DATE,
        primaryKey: true,
        allNull: false
    },
    vol: Sequelize.BIGINT,
    trunover: Sequelize.BIGINT,
    open: Sequelize.FLOAT,
    high: Sequelize.FLOAT,
    low: Sequelize.FLOAT,
    close: Sequelize.FLOAT,
    diff: Sequelize.FLOAT,
    trancations: Sequelize.INTEGER,
    pb_ratio: Sequelize.FLOAT,
    pe_ratio: Sequelize.FLOAT,
    yields: Sequelize.FLOAT
}) ;

exports.sequelize = sequelize ;

// exports.init = function (cb){
//     pool.query('create table if not exists stock_price ( \
//             date Date, \
//             vol BIGINT, \
//             turnover BIGINT, \
//             open Float, \
//             high Float, \
//             low Float, \
//             close Float, \
//             diff Float, \
//             transactions INT,\
//             primary key (date) \
//         )', function(err, rows, fields){
//             if(err) {
//                 logger.error('something wrong when creating the stock table', err) 
                
//                 return cb(err) ;
//             }

//             logger.info('create stock table successfully.') ;
//             cb(err) ;
//         }) ;
// }

// exports.end = function(cb){
//     pool.end(function(err){
//         if(err){
//             logger.error('something wrong when ending the pool', err) ;
//             return cb(err) ;
//         }
//         logger.info('end db_pool') ;
//         return cb(err) ;
//     });
// }