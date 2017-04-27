var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');

request("https://www.buzzfeed.com", function(error, response, body){
  if(error){
    console.log("Error: " + error);
  }
  console.log("Status Code: " + response.statusCode);

  var $ = cheerio.load(body);

  $('div.col1 > ul > li.grid-posts_item').each(function( index ){
    var title = $(this).find('h2 > a').text().trim();
    var author = $(this).find('div.small-meta > div:nth-child(1) > a').text();
    var responses = $(this).find('div.small-meta > div:nth-child(3) > a').text();
    console.log(title);
    console.log(author);
    console.log(responses);
    fs.appendFileSync('buzzfeed.txt', title + '\n' + author + '\n' + responses + '\n');
});
});
