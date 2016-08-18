var winston = require('winston') ;

winston.remove(winston.transports.Console) ;

winston.add(winston.transports.Console, {
    timestamp: true,
    prettyPrint: true,
    json: false
}) ;

winston.add(winston.transports.File, { 
    filename: './log/applog.log',
    maxsize: 10 * 1024 * 1024,
    maxFiles: 10,
    json: false,
    prettyPrint: true
 });

winston.level = 'info' ;

module.exports = winston ;