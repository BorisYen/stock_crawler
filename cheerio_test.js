var cheerio = require("cheerio") ;
var $ = cheerio.load('<ul id="fruits">  <li class="apple">Apple</li>  <li class="orange">Orange</li>  <li class="pear">Pear</li></ul>') ;

//console.log($.root().html()) ;

$("li").each(function(i, el){
    //console.log("this is root %s", $(el).root().html()) ;
    console.log("this is li %s", $(el).html()) ;
});
