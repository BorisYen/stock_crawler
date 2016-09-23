var Sequelize = require("sequelize")
var logger = require('./logging') ;
var config = require('./config')

var is_test = process.env.NODE_ENV === 'test' ;
var db = is_test? config.test_db_db: config.db_db ;
var user = is_test? config.test_db_user: config.db_user ;
var passwd = is_test? config.test_db_passwd: config.db_passwd ;

var sequelize = new Sequelize(db, user, passwd, {
    dialect: is_test? config.test_db_dialect: config.db_dialect,
    port: is_test? config.test_db_port: config.db_port,
    pool: {
        min: is_test? config.test_db_pool_min: config.db_pool_min,
        max: is_test? config.test_db_pool_max: config.db_pool_max,
        idle: is_test? config.test_db_pool_idle: config.db_pool_idle
    },
    logging: is_test? config.test_db_logging: config.db_logging
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
 * diff: 漲跌價差  - this could be null due to the data from twse is not a number.
 * transations: 成交筆數
 * pb_ratio: 股價淨值比
 * pe_ratio: 本益比
 * yields: 殖利率
 * stock_load_count: 融券賣出 成交數量
 * stock_load_amount: 融券賣出 成交金額
 * security_lending_count: 借券賣出 成交數量
 * security_lending_amount: 借券賣出 成交金額
 * foreign_investors_buy: 外資買進股數
 * foreign_investors_sell: 外資賣出股數
 * foreign_investors_diff: 外資買賣超股數
 * investment_trust_buy: 投信買進股數
 * investment_trust_sell: 投信賣出股數
 * investment_trust_diff: 投信買賣超股數
 * dealer_overall_diff: 自營商買賣超股數
 * dealer_buy: 自營商買進股數(自行買賣)
 * dealer_sell: 自營商賣出股數(自行買賣)
 * dealer_diff: 自營商買賣超股數(自行買賣)
 * dealer_hedge_buy: 自營商買進股數(避險)
 * dealer_hedge_sell: 自營商賣出股數(避險)
 * dealer_hedge_diff: 自營商買賣超股數(避險)
 * institution_overall_diff: 三大法人買賣超股數
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
    yields: Sequelize.FLOAT,
    stock_load_count: Sequelize.INTEGER,
    stock_load_amount: Sequelize.BIGINT,
    security_lending_count: Sequelize.INTEGER,
    security_lending_amount: Sequelize.BIGINT,
    foreign_investors_buy: Sequelize.INTEGER,
    foreign_investors_sell: Sequelize.INTEGER,
    foreign_investors_diff: Sequelize.INTEGER,
    investment_trust_buy: Sequelize.INTEGER,
    investment_trust_sell: Sequelize.INTEGER,
    investment_trust_diff: Sequelize.INTEGER,
    dealer_overall_diff: Sequelize.INTEGER,
    dealer_buy: Sequelize.INTEGER,
    dealer_sell: Sequelize.INTEGER,
    dealer_diff: Sequelize.INTEGER,
    dealer_hedge_buy: Sequelize.INTEGER,
    dealer_hedge_sell: Sequelize.INTEGER,
    dealer_hedge_diff: Sequelize.INTEGER,
    institution_overall_diff: Sequelize.INTEGER
},{
    tableName: 'stock_daily_info',
    timestamps: false
}) ;


/**
 * date: 日期
 * vol: 成交股數
 * turnover: 成交金額
 * open: 開盤價
 * high: 最高價
 * low: 最低價
 * close: 收盤價
 * diff: 漲跌價差 
 * transations: 成交筆數
 */

exports.TAIEX = sequelize.define('taiex', {
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
    transations: Sequelize.INTEGER
},{
    tableName: 'taiex',
    timestamps: false
}) ;

exports.sequelize = sequelize ;