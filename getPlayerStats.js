const cheerio = require("cheerio");
const request = require("request");
var fs = require("fs");

module.exports = function getPlayerStats() {
  return new Promise((resolve, reject) => {
    request.get(
      "http://www.espn.com/nba/team/stats/_/name/lal",
      (err, res, html) => {
        if (!err) {
          const $ = cheerio.load(html);

          var returnJson = {};

          const Tables = $('table')
          console.log(`Tables: ${Tables.length}`)

          const vNames = Tables[0];
          const vAllStats = Tables[1];

          // Get Names
          const trNames = $(vNames).find("tbody").find("tr")

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

          const tbodyStats = $(vAllStats).find('tbody')
          console.log(`tbodyStats: ${tbodyStats.length}`)

          const playerStatRows = $(tbodyStats).find('tr')
          console.log(`PlayerStatCount: ${playerStatRows.length}`)

          playerStatRows.each((rowInd, rEl) => {
            currentStatsJson = {}
            const playerStatColumns = $(rEl).find('td')
            var jsonKey = Object.keys(returnJson)[rowInd]

            if(returnJson[jsonKey]){
              // Map all stat columns for player
              playerStatColumns.each((colInd ,cEl) => {
                currentStatsJson[headerKey[colInd]] = $(cEl).text()
              })

              // Set stats to player
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
