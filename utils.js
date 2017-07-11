var _ = require('lodash') ;

exports.emptyFn = function(){} ;

exports.convertToNum = function(text){
    if(!_.isString(text)){
        console.log(text) ;
        throw new Error('Illegal Argument!') ;
    }

    var ret = _.toNumber(text.split(",").join(""))

    return  isNaN(ret)? undefined: ret;
} ;

/**
 * text has to be format yyy/mm/dd
 * the year is the year of Taiwan
 */
exports.convertToUTC = function(text){
    if(!_.isString(text))
        throw new Error('Illegal Argument!') ;
    
    var date_pattern = /(\d+)[^0-9]*(\d+)[^0-9]*(\d+)/ ;
    // var date_parts = text.split("/") ;
    var date_parts = text.match(date_pattern) ;
    if(date_parts.length == 4){
        return new Date(Date.UTC(parseInt(date_parts[1]) + 1911, parseInt(date_parts[2]) - 1, date_parts[3])) ;
    } else {
        throw new Error('Illegal Format for Date.') ;
    } 
}

exports.dataConvertWrapper = function(text, data){

}

exports.sortRecord = function(records, desc){
    return records.sort(function(a, b){
        if(desc){
            if(a.date.getTime() < b.date.getTime()) return 1 ;
            else if(a.date.getTime() > b.date.getTime()) return -1 ;
            else return 0 ;
        } else {
            if(a.date.getTime() < b.date.getTime()) return -1 ;
            else if(a.date.getTime() > b.date.getTime()) return 1 ;
            else return 0 ;
        }
    }) ;
}

exports.sortDays = function(days, desc){
    return days.sort(function(a, b){
        if(desc){
            if(a < b) return 1 ;
            else if(a > b) return -1 ;
            else return 0 ;
        } else {
            if(a < b) return -1 ;
            else if(a > b) return 1 ;
            else return 0 ;
        }
    }) ;
}

exports.getAttrArr = function(prefix, arr){
    return arr.map(function(it, idx, array){
        return prefix+it ;
    })
}

exports.getAttrMap = function(prefix, arr){
    var ret = {} ;

    for(var i=0; i < arr.length; i++){
        ret[arr[i]] = prefix+arr[i] ;
    }
    
    return ret ;
}