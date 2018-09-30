const cheerio = require("cheerio");
const request = require("request");
var fs = require("fs");

module.exports = function getPlayerStats() {
  return new Promise((resolve, reject) => {
    request.get(
      "http://www.espn.com/nba/team/stats/_/name/lal",
      (err, res, html) => {
        if (!err) {
          var $ = cheerio.load(html);

          var returnJson = [];

          var varTr = $("td")
            .filter(function(i, el) {
              return $(this).text() === "GAME STATISTICS";
            })
            .parent()
            .next()
            .nextAll();

          varTr.map((i, e) => {
            var varTd = e.children;
            var singlePlayerStat = {};
            varTd.map((cur, ind) => {
              if (cur.firstChild.firstChild) {
                singlePlayerStat.name = cur.firstChild.firstChild.data;
                return;
              }
              singlePlayerStat[ind] = cur.firstChild.data;
            });
            returnJson.push(singlePlayerStat);
          });

          resolve(returnJson);
        }
      }
    );
  });
};
