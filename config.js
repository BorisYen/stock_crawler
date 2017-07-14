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
    db_user: 'byan',
    db_passwd: 'byan',
    db_db: 'stock',

    test_db_dialect: 'mysql',
    test_db_host: '127.0.0.1',
    test_db_port: 3306,
    test_db_pool_min: 20,
    test_db_pool_max: 50,
    test_db_pool_idle: 100000,
    test_db_logging: logger.debug,
    test_db_user: 'byan',
    test_db_passwd: 'byan',
    test_db_db: 'stock_test',

    create_db_year_range: 2,
    request_batch_size: 2,  // control the batch size of requests sending to twse

    http_request_timeout: 60000
}