var Sequelize = require("sequelize") ;
var logger = require('./logging') ;
var config = require('./config') ;
var _ = require('lodash') ;
var Promise = require('bluebird') ;

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
    institution_overall_diff: Sequelize.INTEGER,
    mv5: Sequelize.FLOAT,
    mv10: Sequelize.FLOAT,
    mv20: Sequelize.FLOAT,
    mv60: Sequelize.FLOAT,
    mv120: Sequelize.FLOAT,
    mv240: Sequelize.FLOAT
},{
    tableName: 'stock_daily_info',
    timestamps: false,
    instanceMethods:{
        updateMv: _updateMv
    },
    classMethods:{
        updateMvAll: _updateMvAll
    }
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
    transations: Sequelize.INTEGER,
    mv5: Sequelize.FLOAT,
    mv10: Sequelize.FLOAT,
    mv20: Sequelize.FLOAT,
    mv60: Sequelize.FLOAT,
    mv120: Sequelize.FLOAT,
    mv240: Sequelize.FLOAT,
    k9: Sequelize.FLOAT,
    d9: Sequelize.FLOAT,
    rsi5: Sequelize.FLOAT,
    rsi10: Sequelize.FLOAT,
    rsi6: Sequelize.FLOAT,
    rsi12: Sequelize.FLOAT,
    up5: Sequelize.FLOAT,
    up6: Sequelize.FLOAT,
    up10: Sequelize.FLOAT,
    up12: Sequelize.FLOAT,
    dn5: Sequelize.FLOAT,
    dn6: Sequelize.FLOAT,
    dn10: Sequelize.FLOAT,
    dn12: Sequelize.FLOAT
},{
    tableName: 'taiex',
    timestamps: false,
    instanceMethods:{
        updateMv: _updateMv
    },
    classMethods:{
        updateMvAll: _updateMvAll,
        updateKDAll: _updateKDAll,
        updateRSIAll: _updateRSIAll
    }
}) ;

/**
 * this is based on 
 * http://www.moneydj.com/KMDJ/Wiki/wikiViewer.aspx?keyid=1342fb37-760e-48b0-9f27-65674f6344c9
 */
function _updateRSIAll(){
    var rsi_days = _getAllDaysForAttr(_.keys(this.attributes), 'rsi') ;
    var tmp_attr_map = {} ;

    for(var i=0; i < rsi_days.length; i++){
        tmp_attr_map[rsi_days[i]] = ['up'+rsi_days[i], 'dn'+rsi_days[i]] ;
    }

    return this.findAll({order: 'date'}).then(function(records){
        var tmp_up = 0;
        var tmp_down = 0;
        var promise_list = [] ;

        // reset up and dn
        for(var i=0; i < records.length; i++){
            for(var j=0; j < rsi_days.length; j++){
                var attr_list = tmp_attr_map[rsi_days[j]] ;

                records[i][attr_list[0]] = null ;
                records[i][attr_list[1]] = null ;   
            }
        }

        // init the first up and dn
        var tmp_rsi_days = rsi_days.slice(0) ;
        for(var i=1; i < records.length; i++){
            var idx = i+1 ;
            var diff = -1*(records[i].get('close') - records[i-1].get('close')) ;

            if(diff > 0)
                tmp_up += diff ;
            else if(diff < 0)
                tmp_down += diff ;

            if(idx === tmp_rsi_days[0]){
                records[i].set('up'+idx, tmp_up/idx) ;
                records[i].set('dn'+idx, Math.abs(tmp_down/idx)) ;

                tmp_rsi_days.splice(0, 1) ;

                if(tmp_rsi_days.length === 0) 
                    break ;
            }
        }

        // calculate up, dn and rsi
        for(var i=0; i < records.length; i++){
            for(var j=0; j < rsi_days.length; j++){
                var attr_list = tmp_attr_map[rsi_days[j]] ;

                if(i !== 0 && (!records[i][attr_list[0]] && !records[i][attr_list[1]])){
                    if(records[i-1][attr_list[0]] && records[i-1][attr_list[1]]){
                        var diff = records[i].close - records[i-1].close ;

                        if(diff > 0){
                            tmp_up = diff ;
                            tmp_down = 0 ;
                        }
                        else if(diff < 0){
                            tmp_down = Math.abs(diff) ;
                            tmp_up = 0 ;
                        }

                        var new_up = (tmp_up-records[i-1][attr_list[0]])/rsi_days[j] + records[i-1][attr_list[0]] ;
                        var new_dn = (tmp_down-records[i-1][attr_list[1]])/rsi_days[j] + records[i-1][attr_list[1]] ;
                        records[i].set(attr_list[0], new_up) ;
                        records[i].set(attr_list[1], new_dn) ;
                        records[i].set('rsi'+rsi_days[j], (100*new_up/(new_up+new_dn))) ;
                    }
                }

                // if(records[i][attr_list[0]] && records[i][attr_list[1]]){
                    
                // }
            }

            promise_list.push(records[i].save().reflect()) ;
        }

        return Promise.all(promise_list) ;
    }) ;
}

function _updateKDAll(){
    return this.findAll({order: 'date'}).then(function(records){
        if(records.length < 9) return ;

        var promise_list = [] ;
        var kd_days = 9 ;
        // KD9, there needs to be at least 9 records to calculate the KD.
        for(var i=(kd_days-1); i < records.length; i++){
            var cur_rec = records[i] ;
            var cal_rec_count = 0 ;
            var period_max = 0 ;
            var period_min = Number.MAX_SAFE_INTEGER ;

            for(var j=(i-kd_days+1); j <= i; j++){
                if(records[j].get('high') > period_max)
                    period_max = records[j].get('high') ;
                
                if(records[j].get('low') < period_min)
                    period_min = records[j].get('low') ;
            }

            var rsv = 100*((cur_rec.get('close') - period_min)/(period_max - period_min)) ;
            var pre_k = records[i-1].get('k9')? records[i-1].get('k9'): 50 ;
            var pre_d = records[i-1].get('d9')? records[i-1].get('d9'): 50 ;
            var cur_k = (rsv/3 + 2*pre_k/3) ;

            // console.log(cur_rec.get('date'), rsv, pre_k, pre_d, cur_k, cur_rec.get('close'), period_max, period_min) ;
            cur_rec.set('k9', cur_k) ;
            cur_rec.set('d9', (cur_k/3 + 2*pre_d/3)) ;

            promise_list.push(cur_rec.save().reflect()) ;
        }

        return Promise.all(promise_list) ;
    }) ;
}

function _updateMvAll(){
    var mv_days = _getAllDaysForAttr(_.keys(this.attributes), 'mv') ;
    // getting all data might be a bit risky and memory consuming
    // TODO: might need to break data into pieces.
    return this.findAll({order: 'date desc'}).then(function(records){
        var promise_list = [] ;

        for(var i=0; i < records.length; i++){
            var cur_rec = records[i] ;
            var tmp_mv_days = mv_days.slice(0) ;
            var tmp_sum = 0 ;

            for(var j=i; j < records.length; j++){
                var idx = j-i+1 ;
                tmp_sum += records[j].get('close') ;

                if(idx === tmp_mv_days[0]){
                    cur_rec.set('mv'+idx, tmp_sum/idx) ;
                    tmp_mv_days.splice(0, 1) ;

                    if(tmp_mv_days.length <= 0)
                        break ; 
                }
            }

            promise_list.push(cur_rec.save().reflect()) ;
        }

        return Promise.all(promise_list) ;
    }) ;
}

function _updateMv(){
    var mv_days = _getAllDaysForAttr(_.keys(this.Model.attributes), 'mv') ;
    var max_mv = mv_days[mv_days.length - 1] ;
    var that = this ;

    return this.Model.findAll({
        where:{
            date:{
                $lte: this.get('date')
            }
        },
        limit: max_mv,
        order: 'date desc'
    }).then(function(results){
        var price_sum = 0 ;
        results.forEach(function(it, idx, array){
            price_sum += it.get('close')? it.get('close'): 0 ;
            
            if(idx === (mv_days[0] - 1)){
                that.set('mv'+(idx+1), price_sum/(idx+1)) ;
                mv_days.splice(0, 1) ;
            }
        }) ;

        return that.save() ;
    })
}

function _getAllDaysForAttr(keys, attrPrefix){
    var ret = [] ;

    keys.forEach(function(it, idx, array){
        if(it.startsWith(attrPrefix)){
            ret.push(parseInt(it.slice(attrPrefix.length))) ;
        }
    }) ;

    return ret.sort(function(a, b){
        if(a < b) return -1 ;
        else if(a > b) return 1 ;
        else return 0 ;
    }) ;
}

exports.sequelize = sequelize ;