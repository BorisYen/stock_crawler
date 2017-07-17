# 股市爬蟲
 
## 1. 摘要

這個專案是用來從台灣證卷交易所抓取資料 (http://www.twse.com.tw/ch/index.php).

這個 **./lib/crawlers** 目錄裡的程式，可用來抓取不用的頁面.

**createdb.js** 這個檔案可以用初始化資料庫裡的資料.

```javascript
db.sequelize.sync() // this can be used to create database schema.
```
```javascript
// 抓取不同股票的資料
var stocks = [{id: '0050'}, {id: '0051'}] ;

var m_price_crawler_pro = iterate_generator({
            generator: monthly_cralwer_data_gen, 
            gen_args: [stocks, monthly_price_crawler], 
            action: batch_save(StockDailyInfo)
        }).then(function(result){
            console.log('done') ;
        }) ;
```

**config.js** 這個檔案包含了這個專案主要會用到的設定，如資料庫的設定…

註：這個專案跟mysql有相依的關係。
* * *
## 2. 爬蟲程式
這個專案包含了不同的程式，同來抓取不同頁面的資料。 這些程式都繼承自 **Crawler** 類別。 
每一個程式都能猵立運作.

*   daily_institution_trade_crawler (<http://www.tse.com.tw/fund/T86>)
*   daily_pb_pe_crawler (<http://www.tse.com.tw/exchangeReport/BWIBBU_d>)
*   daily_stock_load_security_lending_crawler (<http://www.tse.com.tw/exchangeReport/TWTASU>)
*   monthly_pb_pe_crawler (<http://www.tse.com.tw/exchangeReport/BWIBBU>)
*   monthly_price_crawler (<http://www.tse.com.tw/exchangeReport/STOCK_DAY>)
*   monthly_taiex_crawler (<http://www.tse.com.tw/indicesReport/MI_5MINS_HIST>)
*   monthly_taiex_trade_crawler (<http://www.tse.com.tw/exchangeReport/FMTQIK>)

* * *
## 3. 技術指標
除了抓取頁面的資料，這個專案也包含了一些技術指標的計算。下面是目前支援的技術指標 
這些指標的計算方式存放在 **./lib/stats/technical_cal_functions.js**
*   DMI
*   MACD
*   PSY
*   BIAS
*   RSI
*   MA
*   KD
*   BBand

註： 這些指標的計算公式多是google而來的。也許無法百分百的正確。 
如果有更好的計算方式，請讓我知道。 
* * *
## 4. 註

這個專案主要是我用來練習一些沒用過的東西. 
如果你有機會看到這個專安，而且覺的對你有幫助，你可以把這些程式拿回去自己用。不會有版權的問題。

這個專案還在進行中，有時有些程式也許會不正常工作。

v0.1 已經無法正常使用，因為台灣證卷交易所在2017年做了一次使用者界面的更動。