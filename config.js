var logger = require('./logging') ;

module.exports = {
    init: false,

    db_dialect: 'mysql',
    db_host: '127.0.0.1',
    db_port: 3306,
    db_pool_min: 20,
    db_pool_max: 50,
    db_pool_idle: 100000,
    db_logging: logger.debug,

    create_db_year_range: 1,

    http_request_timeout: 20000
}