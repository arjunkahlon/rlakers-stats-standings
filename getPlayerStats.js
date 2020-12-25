const cheerio = require("cheerio");
const request = require("request");
var fs = require("fs");
const { all } = require("bluebird");

module.exports = function getPlayerStats() {
  return new Promise((resolve, reject) => {
    request.get(
      "http://www.espn.com/nba/team/stats/_/name/lal",
      (err, res, html) => {
        if (!err) {
          const $ = cheerio.load(html);

          const statsTable = $("div.Table__Title").next();
          
          const trNames = statsTable.find("tbody")[0].children;
          const names = trNames.map(trName => {
             const name = $(trName).find("a").text();
             if (name.trim().length > 0){
               return name
             }
          })
          .filter(name => name); 
          console.log("Names: ", names)

          const trAllPlayersStats = statsTable.find("tbody")[1].children;
          //Go through table and for each player
          const allPlayersStats = trAllPlayersStats.map(trSinglePlayerStats => {
            // go through the spans of stats and fromt he spans
            const singlePlayersStats = $(trSinglePlayerStats).find("span").toArray().map(statSpan => (
              // grab the data
              statSpan?.firstChild?.data
            ));
            return singlePlayersStats;
          })
          console.log("Players Stats: ", allPlayersStats)

          // order of stats on pages in an array
          const headerKey = ['GP', 'GS', 'MIN', 'PTS', 'OR', 'DR', 'REB', 'AST', 'STL', 'BLK', 'TO', 'PF', 'AST/TO', 'PER']
          const returnJson = {};
          names.forEach((name, i) => {
            //create stat object
            const currentPlayerStatsJson = {}
            const currentPlayerStats = allPlayersStats[i]
            currentPlayerStats.forEach((stat, i) => {
              currentPlayerStatsJson[headerKey[i]] = stat;
            })

            returnJson[name] = currentPlayerStatsJson
          });

          console.log("Return value: ", returnJson)
          resolve(returnJson);
        }
      }
    );
  });
};
