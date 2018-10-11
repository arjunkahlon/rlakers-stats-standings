const cheerio = require("cheerio");
const request = require("request");
var fs = require("fs");

module.exports = function getStandings() {
  return new Promise((resolve, reject) => {
    request.get(
      "http://www.espn.com/nba/team/_/name/lal/",
      (err, res, html) => {
        if (!err) {
          var $ = cheerio.load(html);
          var record = $(".ClubhouseHeader__Record").children()[0].firstChild
            .data;

          resolve(record);
        }
      }
    );
  });
};
