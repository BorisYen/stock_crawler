process.env.NODE_ENV = 'test' ;  // this needs to be the first line of the test file.

var should = require('should') ;
var Assertion = should.Assertion ;
var _ = require('lodash') ;

Assertion.add('resultIn', function(golden_data, attrs_to_test){
    var records = this.obj ;
    var rec_for_test = [] ;

    // do not need to compare all the data. randomly pick 10 records should be good enough.
    for(var i=0; i<10; i++){
        rec_for_test.push(records[Math.floor(Math.random()*records.length)]) ;
    }

    for(var i=0; i<rec_for_test.length; i++){
        var test_rec1 = rec_for_test[i] ;

        var idx = _.findIndex(golden_data, function(o){
            var d = new Date(o.date) ;
            return d.getFullYear() === test_rec1.date.getFullYear() && d.getDate() === test_rec1.date.getDate() &&
                d.getMonth() === test_rec1.date.getMonth() ;
        })

        if(idx !== -1){
            var test_rec2 = golden_data[idx] ;

            for(var j=0; j<attrs_to_test.length; j++){
                var attr = attrs_to_test[j] ;

                if(test_rec1[attr] && test_rec2[attr]){
                    should(test_rec1[attr].toFixed(2)).equal(test_rec2[attr].toFixed(2)) ;
                }
            }
        }
    }
});

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