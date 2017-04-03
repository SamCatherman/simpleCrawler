var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var START_URL = "http://www.arstechnica.com";
var SEARCH_WORD = "stemming";
var MAX_PAGES_TO_VISIT = "10";

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;

pagesToVisit.push(START_URL);
crawl();

function crawl() {
  if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log("Reached max limit of pages to visit.");
    return;
  }
  var nextPage = pagesToVisit.pop();
  if (nextPage in pagesVisited) {
    //already visited this page, repeat crawl function
    crawl();
  } else {
    //new page to visit
    visitPage(nextPage, crawl);
  }
}

function visitPage(url, callback) {
  //add page to set
  pagesVisited[url] = true;
  numPagesVisited++;

  //make request
  console.log("Visiting page " + url);
  request(url, function(error, response, body) {
    //check status code (200 is HTTP ok)
    console.log("Status Code: " + response.statusCode);
    if(response.statusCode !== 200) {
      callback();
      return;
    }
    //parse document body
    var $ = cheerio.load(body);
    var isWordFound = searchForWord($, SEARCH_WORD);
    if(isWordFound) {
      console.log("Word " + SEARCH_WORD + ' found at page ' + url);
    } else {
      collectInternalLinks($);
      //callback calls crawl()
      callback();
    }
  });
}

function searchForWord($, word) {
  var bodyText = $('html > body').text().toLowerCase();
  return(bodyText.indexOf(word.toLowerCase()) !== -1);
}

function collectInternalLinks($) {
  var relativeLinks = $("a[href^='/']");
  console.log("Found " + relativeLinks.length + "relative links on page");
  relativeLinks.each(function() {
    pagesToVisit.push(baseUrl + $(this).attr('href'));
  });
}
// var pageToVisit = "";
// console.log("Visiting page " + pageToVisit);
// request(pageToVisit, function(error, response, body) {
//   if(error){
//     console.log("Error: " + error);
//   }
//
//   //check status code(200 is HTTP OK)
//   console.log("Status Code: " + response.statusCode);
//   if(response.statusCode === 200) {
//     //parse the document body
//     var $ = cheerio.load(body);
//     console.log("Page title: " + $('title').text());
//   }
// });
//
// function searchForWord($, word) {
//   var bodyText = $('html > body').text();
//   if(bodyText.toLowerCase().indexOf(word.toLowerCase()) !== -1) {
//     return true;
//   }
//   return false;
// };
//
// function collectInternalLinks($) {
//   var allRelativeLinks = [];
//   var allAbsoluteLinks = [];
//
//   var relativeLinks = $("a[href^='/']");
//   relativeLinks.each(function() {
//     allRelativeLinks.push($(this).attr('href'));
//   });
//
//   var absoluteLinks = $("a[href^='http']");
//   absoluteLinks.each(function() {
//     allAbsoluteLinks.push($(this).attr('href'));
//   });
//
//   console.log("Found " + allRelativeLinks.length + "relative links");
//   console.log("Found " + allAbsoluteLinks.length + "absolute links");
// };
