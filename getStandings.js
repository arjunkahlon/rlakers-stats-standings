const cheerio = require("cheerio");
const request = require("request");
var fs = require("fs");

module.exports = function getStandings() {
  return new Promise((resolve, reject) => {
    request.get(
      "http://scores.nbcsports.com/nba/standings_conference.asp",
      (err, res, html) => {
        if (!err) {
          var $ = cheerio.load(html);

          var returnJson = [];

          var varTr = $("td")
            .filter(function(i, el) {
              return $(this).text() === "Western Conference";
            })
            .parent()
            .next()
            .nextAll();

          varTr.map((i, e) => {
            var td = e.firstChild.next;
            var teamStat = {};

            if (td) {
              var name = td.lastChild.lastChild.data;
              teamStat.name = name;

              var stats = e.children.filter(el => {
                return el.type === "tag" && el.firstChild.data.trim();
              });

              teamStat.wins = stats[0].firstChild.data;
              teamStat.losses = stats[1].firstChild.data;
              teamStat.winPercent = stats[3].firstChild.data;
              teamStat.gamesBehind = stats[4].firstChild.data;

              console.log(teamStat)

              returnJson.push(teamStat);
            }
          });
          resolve(returnJson);
        }
      }
    );
  });
};
