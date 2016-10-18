var utils = require('../../utils') ;
var _ = require('lodash') ;

function _calculateWeeklyPrice(records){
    records = utils.sortRecord(records) ;
    var ret = [] ;

    var new_rec = {} ;
    var high_low_arr = [] ;
    var last_rec ;
    for(var i=0; i<records.length; i++){
        var cur_rec = records[i] ;
        var next_rec = (i === (records.length - 1))? records[i]: records[i+1] ;

        if(i === 0 || _.isEmpty(new_rec)){
            new_rec.start_date = cur_rec.date ;
            new_rec.open = cur_rec.open ;
        }

        high_low_arr.push(cur_rec.high, cur_rec.low) ;

        if(cur_rec.date.getDay() >= next_rec.date.getDay() || (next_rec.date.getTime() - cur_rec.date.getTime())/(3600*1000*24) > 7){
            new_rec.high = _.max(high_low_arr) ;
            new_rec.low = _.min(high_low_arr) ;
            new_rec.close = cur_rec.close ;
            new_rec.end_date = cur_rec.date ;

            ret.push(new_rec) ;

            new_rec = {} ;
            high_low_arr = [] ;
        }
    }

    return ret ;
}

function _calculateMonthlyPrice(records){
    records = utils.sortRecord(records) ;
    var ret = [] ;

    var new_rec = {} ;
    var high_low_arr = [] ;
    var last_rec ;
    for(var i=0; i<records.length; i++){
        var cur_rec = records[i] ;
        var next_rec = (i === (records.length - 1))? records[i]: records[i+1] ;

        if(i === 0 || _.isEmpty(new_rec)){
            new_rec.start_date = cur_rec.date ;
            new_rec.open = cur_rec.open ;
        }

        high_low_arr.push(cur_rec.high, cur_rec.low) ;
        
        // if the month is different or reach the end of the data, push new_rec to ret.
        if(cur_rec.date.getMonth() !== next_rec.date.getMonth() || cur_rec === next_rec){
            new_rec.high = _.max(high_low_arr) ;
            new_rec.low = _.min(high_low_arr) ;
            new_rec.close = cur_rec.close ;
            new_rec.end_date = cur_rec.date ;

            ret.push(new_rec) ;

            new_rec = {} ;
            high_low_arr = [] ;
        }
    }

    return ret ;
}

exports.calculateWeeklyPrice = _calculateWeeklyPrice ;
exports.calculateMonthlyPrice = _calculateMonthlyPrice ;