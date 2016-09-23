process.env.NODE_ENV = 'test' ;  // this needs to be the first line of the test file.

var db = require('../dbconnection') ;
var assert = require('assert');
var monthly_taiex_crawler = require('../lib/monthly_taiex_crawler') ;
var daily_pbpe_crawler = require('../lib/daily_pb_pe_crawler') ;
var monthly_price_crawler = require('../lib/monthly_price_crawler') ;
var monthly_taiex_trade_crawler = require('../lib/monthly_taiex_trade_crawler') 
var monthly_pbpe_crawler = require('../lib/monthly_pb_pe_crawler') ;
var daily_stock_load_security_lending_crawler = require('../lib/daily_stock_load_security_lending_crawler') ;
var daily_institution_trade_crawler = require('../lib/daily_institution_trade_crawler') ;
var _ = require('lodash') ;
var should = require('should') ;
var Assertion = should.Assertion ;

Assertion.add('coverAllMonthes', function(){
    var month_list = {} ;

    this.obj.forEach(function(it, idx, array){
        var month = it.date.getMonth() ;

        if(!month_list[month]){
            month_list[month] = 1 ;
        }
    }) ;

    should(_.keys(month_list)).has.lengthOf(12) ;
});

Assertion.add('sameYearMonthDay', function(options){
    should(options).not.empty() ;

    function test(it){
        if(options.year)
            should(it.date.getFullYear()).match(options.year) ;

        if(options.month)
            should(it.date.getMonth()+1).match(options.month) ;

        if(options.day)
            should(it.date.getDate()).match(options.day) ;
    }

    if(_.isArray(this.obj)){
        this.obj.forEach(function(it, idx, array){
            should(it).has.property('date').and.it.is.Date() ;
            test(it) ;
        }) ;
    } else {
        should(this.obj).has.property('date').and.it.is.Date() ;
        test(this.obj) ;
    }
})

describe('Crawler Test', function() {
    this.timeout(100000) ;

    before(function(){
      return db.sequelize.sync() ;
    }) ;

    describe('Monthly TAIEX Crawler', function() {
        describe('crawl data', function(){
            it('all data should be in the same month', function() {
                return monthly_taiex_crawler.crawl({year: 2016, month: 5}).should.finally.be.an.Array().and.not.empty()
                    .and.have.sameYearMonthDay({year: 2016, month: 5}) ;
	        });

            it('crawl data for a specific date (year, month, day)', function(){
                return monthly_taiex_crawler.crawl({year: 2016, month: 5, day: 4}).should.finally.not.be.an.Array()
                    .and.have.sameYearMonthDay({year: 2016, month: 5, day: 4}) ;
            }) ;

            it('crawl data for a specific date (with a date object)', function(){
                return monthly_taiex_crawler.crawl({date: new Date(2016, 4, 4)}).should.finally.not.be.an.Array()
                    .and.have.sameYearMonthDay({year: 2016, month: 5, day: 4}) ;
            }) ;

            it('crawl data for a date that should not have data.', function(){
                return monthly_taiex_crawler.crawl({year: 2020, month: 5, day: 4}).should.be.rejectedWith(/No data available/) ;
            }) ;

            it('crawl data for a whole year.', function(){
                return monthly_taiex_crawler.crawl({year: 2015}).should.finally.be.an.Array()
                    .and.have.sameYearMonthDay({year: 2015}).and.coverAllMonthes() ;
            }) ;
        });
    });

    describe('Monthly TAIEX Trade Crawler', function() {
        describe('crawl data', function(){
            it('crawl data for a specific date (year, month)', function() {
                return monthly_taiex_trade_crawler.crawl({year: 2016, month: 5}).should.finally.be.an.Array().and.not.empty()
                    .and.have.sameYearMonthDay({year: 2016, month: 5}) ;
	        });

            it('crawl data for a specific date (year, month, day)', function(){
                return monthly_taiex_trade_crawler.crawl({year: 2016, month: 5, day: 4}).should.finally.not.be.an.Array()
                    .and.have.sameYearMonthDay({year: 2016, month: 5, day: 4}) ;
            }) ;

            it('crawl data for a specific date (with a date object)', function(){
                return monthly_taiex_trade_crawler.crawl({date: new Date(2016, 4, 4)}).should.finally.not.be.an.Array()
                    .and.have.sameYearMonthDay({year: 2016, month: 5, day: 4}) ;
            }) ;

            it('crawl data for a date that should not have data.', function(){
                return monthly_taiex_trade_crawler.crawl({year: 2020, month: 5, day: 4}).should.be.rejectedWith(/No data available/) ;
            }) ;

            it('crawl data for a whole year.', function(){
                return monthly_taiex_trade_crawler.crawl({year: 2015}).should.finally.be.an.Array()
                    .and.have.sameYearMonthDay({year: 2015}).and.coverAllMonthes() ;
            }) ;
        });
    });

    describe('Monthly PB PE Crawler', function() {
        describe('crawl data', function(){
            it('crawl data for a specific date with stock', function() {
                return monthly_pbpe_crawler.crawl({stock: '1101', date: new Date(2016, 4, 4)}).should.finally.not.be.an.Array()
                    .and.have.sameYearMonthDay({year: 2016, month: 5, day: 4}) ;
            });

            it('crawl data for a specific stock (year, month)', function() {
                return monthly_pbpe_crawler.crawl({stock: '1101', year: 2016, month: 5}).should.finally.be.an.Array().and.not.empty()
                    .and.have.sameYearMonthDay({year: 2016, month: 5}) ;
            });

            it('crawl data for a specific date with stock which does not exist', function() {
                return monthly_pbpe_crawler.crawl({stock: '0000', date: new Date(2016, 4, 4)}).should.be.rejectedWith(/No data available/) ;
            });

            it('crawl data for a specific date (market is not opened on that date)', function() {
                return monthly_pbpe_crawler.crawl({stock: '1101', date: new Date(2016, 8, 11)}).should.be.rejectedWith(/No data available/) ;
            });

            it('crawl data for a date without stock.', function(){
                return monthly_price_crawler.crawl({year: 2016, month: 5, day: 4}).should.be.rejectedWith(/Stock Symbol not found/) ;
            }) ;

            it('crawl data for a whole year.', function(){
                return monthly_pbpe_crawler.crawl({stock: '1101', year: 2015}).should.finally.be.an.Array()
                    .and.have.sameYearMonthDay({year: 2015}).and.coverAllMonthes() ;
            }) ;
        });
	});

    describe('Monthly Price Crawler', function() {
        describe('crawl data', function(){
            it('all data should be in the same month', function() {
                return monthly_price_crawler.crawl({stock: '0050', year: 2016, month: 5}).should.finally.be.an.Array().and.not.empty()
                    .and.have.sameYearMonthDay({year: 2016, month: 5}) ;
	        });

            it('crawl data for a specific date (year, month, day)', function(){
                return monthly_price_crawler.crawl({stock: '0050', year: 2016, month: 5, day: 4}).should.finally.not.be.an.Array()
                    .and.have.sameYearMonthDay({year: 2016, month: 5, day: 4}) ;
            }) ;

            it('crawl data for a specific date (with a date object)', function(){
                return monthly_price_crawler.crawl({stock: '0050', date: new Date(2016, 4, 4)}).should.finally.not.be.an.Array()
                    .and.have.sameYearMonthDay({year: 2016, month: 5, day: 4}) ;
            }) ;

            it('crawl data for a date that should not have data.', function(){
                return monthly_price_crawler.crawl({stock: '0050', year: 2020, month: 5, day: 4}).should.be.rejectedWith(/No data available/) ;
            }) ;

            it('crawl data for a date without stock.', function(){
                return monthly_price_crawler.crawl({year: 2016, month: 5, day: 4}).should.be.rejectedWith(/Stock Symbol not found/) ;
            }) ;

            it('crawl data for a whole year.', function(){
                return monthly_price_crawler.crawl({stock: '0050', year: 2015}).should.finally.be.an.Array()
                    .and.have.sameYearMonthDay({year: 2015}).and.coverAllMonthes() ;
            }) ;
        });
    });

    describe('Daily Stock PB PE Crawler', function() {
        describe('crawl data', function(){
            it('crawl data for a specific date with stock', function() {
                return daily_pbpe_crawler.crawl({stock: '1101', date: new Date(2016, 4, 4)}).should.finally.not.be.an.Array()
                    .and.have.sameYearMonthDay({year: 2016, month: 5, day: 4}) ;
            });

            it('crawl data for a specific date without stock', function() {
                return daily_pbpe_crawler.crawl({date: new Date(2016, 4, 4)}).should.finally.be.an.Array()
                    .and.have.sameYearMonthDay({year: 2016, month: 5, day: 4}) ;
            });

            it('crawl data for a specific date with stock which does not exist', function() {
                return daily_pbpe_crawler.crawl({stock: '0000', date: new Date(2016, 4, 4)}).should.be.rejectedWith(/No data available/) ;
            });

            it('crawl data for a specific date (market is not opened on that date)', function() {
                return daily_pbpe_crawler.crawl({date: new Date(2016, 8, 11)}).should.be.rejectedWith(/No data available/) ;
            });
        });
	});

    describe('Daily Stock Load and Security Crawler', function() {
        describe('crawl data', function(){
            it('crawl data for a specific date with stock', function() {
                return daily_stock_load_security_lending_crawler.crawl({stock: '1101', date: new Date(2016, 4, 4)}).should.finally.not.be.an.Array()
                    .and.have.sameYearMonthDay({year: 2016, month: 5, day: 4}) ;
            });

            it('crawl data for a specific date without stock', function() {
                return daily_stock_load_security_lending_crawler.crawl({date: new Date(2016, 4, 4)}).should.finally.be.an.Array()
                    .and.have.sameYearMonthDay({year: 2016, month: 5, day: 4}) ;
            });

            it('crawl data for a specific date with stock which does not exist', function() {
                return daily_stock_load_security_lending_crawler.crawl({stock: '0000', date: new Date(2016, 4, 4)}).should.be.rejectedWith(/No data available/) ;
            });

            it('crawl data for a specific date (market is not opened on that date)', function() {
                return daily_stock_load_security_lending_crawler.crawl({date: new Date(2016, 8, 11)}).should.be.rejectedWith(/No data available/) ;
            });
        });
	});

    describe('Daily Institutional Trade Crawler', function() {
        describe('crawl data', function(){
            it('crawl data for a specific date with stock', function() {
                return daily_institution_trade_crawler.crawl({stock: '1101', date: new Date(2016, 4, 4)}).should.finally.not.be.an.Array()
                    .and.have.sameYearMonthDay({year: 2016, month: 5, day: 4}) ;
            });

            it('crawl data for a specific date without stock', function() {
                return daily_institution_trade_crawler.crawl({date: new Date(2016, 4, 4)}).should.finally.be.an.Array()
                    .and.have.sameYearMonthDay({year: 2016, month: 5, day: 4}) ;
            });

            it('crawl data for a specific date with stock which does not exist', function() {
                return daily_institution_trade_crawler.crawl({stock: '0000', date: new Date(2016, 4, 4)}).should.be.rejectedWith(/No data available/) ;
            });

            it('crawl data for a specific date (market is not opened on that date)', function() {
                return daily_institution_trade_crawler.crawl({date: new Date(2016, 8, 11)}).should.be.rejectedWith(/No data available/) ;
            });
        });
	});
});
