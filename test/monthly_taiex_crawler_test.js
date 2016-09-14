process.env.NODE_ENV = 'test' ;  // this needs to be the first line of the test file.

var db = require('../dbconnection') ;
var assert = require('assert');
var monthly_taiex_crawler = require('../lib/monthly_taiex_crawler') ;
var _ = require('lodash') ;


describe('Array', function() {
    before(function(){
      return db.sequelize.sync() ;
    }) ;

    describe('Monthly TAIEX Crawler', function() {
        describe('crawl data', function(){
            it('all data should be in the same month', function() {
                return monthly_taiex_crawler.crawl({year: 2016, month: 5}).then(function(results){
                    assert(results.length > 2, 'result is empty') ;
                    
                    results.forEach(function(it, idx, array){
                        assert(it.date, 'no date in the item') ;
                        assert(it.date instanceof Date, 'it.date is not an Date') ;

                        assert.equal(it.date.getMonth(), 4, 'the month is not expected.') ;
                    }) ;
                }) ;
	          });

            it('crawl data for a specific date (year, month, day)', function(){
                return monthly_taiex_crawler.crawl({year: 2016, month: 5, day: 4}).then(function(result){
                      assert(!_.isArray(result), 'result is can not be an Array') ;
                      
                      assert(result.date, 'no date in the result') ;
                      assert(result.date instanceof Date, 'result.date is not an Date') ;

                      assert.equal(result.date.getMonth(), 4, 'the month is not expected.') ;
                      assert.equal(result.date.getDate(), 4, 'the month is not expected.') ;
                }) ;
            }) ;

            it('crawl data for a specific date (with a date object)', function(){
                return monthly_taiex_crawler.crawl({date: new Date(2016, 4, 4)}).then(function(result){
                      assert(!_.isArray(result), 'result is can not be an Array') ;
                      
                      assert(result.date, 'no date in the result') ;
                      assert(result.date instanceof Date, 'result.date is not an Date') ;

                      assert.equal(result.date.getMonth(), 4, 'the month is not expected.') ;
                      assert.equal(result.date.getDate(), 4, 'the month is not expected.') ;
                }) ;
            }) ;

            it('crawl data for a date that should not have data.', function(){
                return monthly_taiex_crawler.crawl({year: 2020, month: 5, day: 4}).then(function(result){
                    throw new Error('can not reach here') ;
                }).catch(function(err){
                    if(err.message.indexOf('No data available') != -1)
                        return true ;
                    else throw err;
                }) ;
            }) ;
        });
	  });
});
