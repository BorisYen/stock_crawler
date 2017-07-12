# stock_crawler
 
## 1. Summary

This is a project that could be used to crawl stock information out of TWSE (http://www.twse.com.tw/ch/index.php).

The **./lib/crawlers** folder container clawler for different pages.

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

Note: This project depends on mysql for data storage.
* * *
## 2. Crawlers
This project supports the following Crawlers. Each crawler is used to crawl data for a specific page. Those crawler are extened from **Crawler** class. 
Each crawler should be able to work on its own.

*   daily_institution_trade_crawler (<http://www.tse.com.tw/fund/T86>)
*   daily_pb_pe_crawler (<http://www.tse.com.tw/exchangeReport/BWIBBU_d>)
*   daily_stock_load_security_lending_crawler (<http://www.tse.com.tw/exchangeReport/TWTASU>)
*   monthly_pb_pe_crawler (<http://www.tse.com.tw/exchangeReport/BWIBBU>)
*   monthly_price_crawler (<http://www.tse.com.tw/exchangeReport/STOCK_DAY>)
*   monthly_taiex_crawler (<http://www.tse.com.tw/indicesReport/MI_5MINS_HIST>)
*   monthly_taiex_trade_crawler (<http://www.tse.com.tw/exchangeReport/FMTQIK>)

* * *
## 3. Technical Functions
In additon to the crawlers, the project also support a few technical functions. The following is a list of current supported functions. 
These function are all in **./lib/stats/technical_cal_functions.js**
*   DMI
*   MACD
*   PSY
*   BIAS
*   RSI
*   MA
*   KD

Note: the equations I used for those functions are all based on results of google search. It might not be accurate. 
Please let me know if there is a better equation for those functions. 
* * *
## 4. Note

I started this project just to pratice my js skill and try something new. 
If you happen to see this project and like it, you are welcome to use it on any project of your own. No need to worry about the license issue.

The project is still ongoing. The js file might not function correctly from time to time.

v0.1 is no longer working due to the redesing of web interface by TWSE.