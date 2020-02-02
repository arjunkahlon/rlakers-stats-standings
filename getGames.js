const cheerio = require("cheerio");
const request = require("request");
const moment = require("moment");

module.exports = function getGames() {
  return new Promise((resolve, reject) => {
    request.get(
      "http://www.espn.com/nba/team/schedule/_/name/lal",
      (err, res, html) => {
        if (!err) {
          var $ = cheerio.load(html);
          var monthsString = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
          ];

          var returnJson = [];

          var rowsOfInfo = $("tr")
            .filter((rowInd, el) => {
              const text = el.children[1].firstChild.firstChild.data
              return text != "Opponent"
            })
          console.log('Rows', rowsOfInfo.length)

          rowsOfInfo.map((i, e) => {
            const columnsInRow = e.children;
            const gameInfo = {};

            const gameDate = columnsInRow[0].firstChild.firstChild.data;
            const gameMonth = monthsString.indexOf(gameDate.split(" ")[1]);

            const gameDay = gameDate.split(" ")[2];
            const today = new Date();

            var gameYear = today.getFullYear();
            // If current month and game month aren't in the same half of the nba season
            // determined by end of season which very roughly halfway through the year
            if (gameMonth < 6 !== today.getMonth() < 6) {
              if (gameMonth > today.getMonth()) {
                // Happened in later part of gregorian year so game from previous year
                gameYear -= 1;
              } else {
                // Happened in later part of gregorian year so game will be next year
                gameYear += 1;
              }
            }

            var thirdCol = columnsInRow[2];
            var gameHour = 0;
            var gameMinute = 0;

            if (thirdCol && thirdCol.firstChild && thirdCol.firstChild.firstChild && thirdCol.firstChild.firstChild.type === "text") {
              // If game has W/L and score
              if (thirdCol.firstChild.firstChild.data.indexOf(":") === -1) {
                // Result
                gameInfo.isWin = thirdCol.firstChild.firstChild.data === "W";

                if (thirdCol.children[1]) {
                  gameInfo.score = thirdCol.children[1].firstChild.firstChild.data.trim();
                }
              }
            } else {
              // Time
              const time_result = thirdCol.firstChild.type === 'text' ? thirdCol.firstChild.data : thirdCol.firstChild.firstChild.firstChild.data
              if (thirdCol.firstChild.type !== 'text') {
                  gameHour = Number(time_result.split(":")[0]);
                  const ampm = time_result.split(" ")[1];
                  if (gameHour === 12) {
                    gameHour = ampm === "AM" ? 0 : 12;
                  } else if (ampm === "PM") {
                    gameHour += 12;
                  }

                  console.log(time_result)
                  gameMinute = Number(time_result.split(":")[1].split(" ")[0]);
              }else{
                gameInfo.date = time_result
                console.log(time_result)
              }
            }

            const dateGame = new Date(
              gameYear,
              gameMonth,
              gameDay,
              gameHour,
              gameMinute
            );

            gameInfo.date = gameInfo.date ?  gameInfo.date : dateGame;

            if (columnsInRow[1].firstChild.firstChild.firstChild) {
              gameInfo.isHome =
                columnsInRow[1].firstChild.firstChild.firstChild.data === "vs";
            }

            if (columnsInRow[1].firstChild.children[2]) {
              gameInfo.opponent =
                columnsInRow[1].firstChild.children[2].firstChild.firstChild.data;
            }
            returnJson.push(gameInfo);
          });

          resolve(returnJson);
        }
      }
    );
  });
};
