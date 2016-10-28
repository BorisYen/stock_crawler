# stock_crawler

This is a project that could be used to crawler stock information out of TWSE (http://www.twse.com.tw/ch/index.php).

The lib folder container clawler for different pages.

**createdb.js** can be used to create db schema and crawl data from TWSE into db.

```javascript
db.sequelize.sync() // this can be used to create database schema.
```
```javascript
// crawl data for stocks
var stocks = [{id: '0050'}, {id: '0051'}] ;

var m_price_crawler_pro = iterate_generator({
            generator: monthly_cralwer_data_gen, 
            gen_args: [stocks, monthly_price_crawler], 
            action: batch_save(StockDailyInfo)
        }).then(function(result){
            console.log('done') ;
        }) ;
```

**config.js** contains configurations that this project is using, such as database configuration, etc...

p.s. The project is still ongoing. The js file might not function correctly because it is version 0.0.1.

 