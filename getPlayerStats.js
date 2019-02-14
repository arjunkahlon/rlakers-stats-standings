const cheerio = require("cheerio");
const request = require("request");
var fs = require("fs");

module.exports = function getPlayerStats() {
  return new Promise((resolve, reject) => {
    request.get(
      "http://www.espn.com/nba/team/stats/_/name/lal",
      (err, res, html) => {
        if (!err) {
          console.log(html)
          const $ = cheerio.load(html);

          var returnJson = {};

          const vtops = $("td")
            .filter(function(i, el) {
              return $(el).attr('class') === "v-top";
            });

          console.log(`vtops: ${vtops.length}`)


          const vtopNames = vtops[0];
          const vtopAllStats = vtops[1];

          // Get Names
          const trNames = $(vtopNames).find("tbody").find("tr")

          trNames.each((i, el) => {
            const name = $(el).find("a").text()
            if (name.length > 0){
              returnJson[name] = {}
            }
          })
          console.log("===== Names")
          console.log(returnJson)

          // Get stats
          const headerKey = ['GP', 'GS', 'MPG', 'PPG', 'ORPG', 'DRPG', 'RPG', 'APG', 'STLPG', 'BLKPG', 'TOPG', 'PFPG', 'AST/TO', 'PER']

          const tbodyStats = $(vtopAllStats)
          .find("tbody")
          .filter((i, el) => {
            return $(el).attr('class') === 'Table2__tbody'
          })
          console.log(`tbodyStats: ${tbodyStats.length}`)

          const playerStatRows = $(tbodyStats).find('tr')
          console.log(`PlayerStatCount: ${playerStatRows.length}`)
          playerStatRows.each((rowInd, el) => {
            currentStatsJson = {}
            const playerStatColumns = $(el).find('td')
            var jsonKey = Object.keys(returnJson)[rowInd]

            if(returnJson[jsonKey]){
              playerStatColumns.each((colInd ,el) => {
                if(returnJson[jsonKey]){
                  currentStatsJson[headerKey[colInd]] = $(el).text()
                }
              })
              returnJson[jsonKey] = currentStatsJson
            }
          })

          console.log(returnJson)
          resolve(returnJson);
        }
      }
    );
  });
};
