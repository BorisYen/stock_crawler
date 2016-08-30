var _ = require('lodash') ;

exports.emptyFn = function(){} ;

exports.convertToNum = function(text){
    if(!_.isString(text))
        throw new Error('Illegal Argument!') ;

    return _.toNumber(text.split(",").join("")) ;
} ;

exports.convertToUTC = function(text){
    if(!_.isString(text))
        throw new Error('Illegal Argument!') ;

    var date_parts = text.split("/") ;
    if(date_parts.length == 3){
        return new Date(Date.UTC(parseInt(date_parts[0]) + 1911, parseInt(date_parts[1]) - 1, date_parts[2])) ;
    } else {
        throw new Error('Illegal Format for Date.') ;
    } 
}

exports.dataConvertWrapper = function(text, data){

}