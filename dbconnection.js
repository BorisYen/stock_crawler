var Sequelize = require("sequelize")
var logger = require('./logging') ;
var config = require('./config')

var sequelize = new Sequelize('stock', 'byan', 'byan', {
    dialect: config.db_dialect,
    port: config.db_port,
    pool: {
        min: config.db_pool_min,
        max: config.db_pool_max,
        idle: config.db_pool_idle
    }
}) ;

/**
 * id: 證券代號
 * name: 證券名稱
 */
exports.Stock = sequelize.define('stock', {
    id: { 
        type: Sequelize.STRING(15),
        primaryKey: true,
        allowNull: false
    },
    name: Sequelize.STRING(50)
}, {
    tableName: 'stock',
    timestamps: false,
    charset: 'utf8',
    collate: 'utf8_general_ci'
}) ;

/**
 * id: 證券代號
 * date: 日期
 * vol: 成交股數
 * turnover: 成交金額
 * open: 開盤價
 * high: 最高價
 * low: 最低價
 * close: 收盤價
 * diff: 漲跌價差
 * transations: 成交筆數
 * pb_ratio: 股價淨值比
 * pe_ratio: 本益比
 * yields: 殖利率
 */
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
    turnover: Sequelize.BIGINT,
    open: Sequelize.FLOAT,
    high: Sequelize.FLOAT,
    low: Sequelize.FLOAT,
    close: Sequelize.FLOAT,
    diff: Sequelize.FLOAT,
    transations: Sequelize.INTEGER,
    pb_ratio: Sequelize.FLOAT,
    pe_ratio: Sequelize.FLOAT,
    yields: Sequelize.FLOAT
},{
    tableName: 'stock_daily_info',
    timestamps: false
}) ;

exports.sequelize = sequelize ;