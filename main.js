const snoowrap = require("snoowrap");
const getStandings = require("./scrapers/getStandings");
const getPlayerStats = require("./scrapers/getPlayerStats");
const getGames = require("./scrapers/getGames");
const getRecord = require("./scrapers/getRecord");
const moment = require("moment-timezone");

require("dotenv").config();

if (!process.env.SUBREDDIT) {
  throw console.error(`'SUBREDDIT' environment value not found!`);
}

const r = new snoowrap({
  userAgent: "app",
  clientId: "GufnVQldw0V4pw",
  clientSecret: "GbSkOaUcOpnEfs2392moRi51J18",
  username: "lakerbot",
  password: "8yGqHnaegSQe"
});

const standingsHeader =
  "######[](/r)\n" +
  "####Current Standings\n" +
  " Seed | Team | W | L | GB\n" +
  "---|---|----|----|----\n";
var standingsString = standingsHeader;

const statsHeader =
  "######[](/r)\n" +
  "####Current Player Stats\n" +
  "Player | MPG | PPG | RPG | APG\n" +
  "---|---|----|----|----|----\n";
var statsString = statsHeader;

const monthScheduleHeader =
  "######[](/r)\n" +
  "#####This Month\n" +
  " U | M | T | W | T | F | S \n" +
  "---|---|---|---|---|---|---\n";
var monthScheduleString = monthScheduleHeader;

const recordHeader = "###### [](/record)\n";
var recordString = recordHeader;

const weekScheduleHeader = "###### [](/schedule)\n## Schedule:\n";
var weekScheduleString = weekScheduleHeader;

const teamToReddit = [
  { name: "Atlanta", reddit: "atlantahawks" },
  { name: "Brooklyn", reddit: "gonets" },
  { name: "Boston", reddit: "bostonceltics" },
  { name: "Charlotte", reddit: "charlottehornets" },
  { name: "Chicago", reddit: "chicagobulls" },
  { name: "Cleveland", reddit: "clevelandcavs" },
  { name: "Dallas", reddit: "mavericks" },
  { name: "Denver", reddit: "denvernuggets" },
  { name: "Detroit", reddit: "detroitpistons" },
  { name: "Golden State", reddit: "warriors" },
  { name: "Houston", reddit: "rockets" },
  { name: "Indiana", reddit: "pacers" },
  { name: "LA", reddit: "laclippers" },
  { name: "Los Angeles", reddit: "lakers" },
  { name: "Memphis", reddit: "memphisgrizzlies" },
  { name: "Miami", reddit: "heat" },
  { name: "Milwaukee", reddit: "mkebucks" },
  { name: "Minnesota", reddit: "timberwolves" },
  { name: "New Orleans", reddit: "nolapelicans" },
  { name: "New York", reddit: "nyknicks" },
  { name: "Oklahoma City", reddit: "thunder" },
  { name: "Orlando", reddit: "orlandomagic" },
  { name: "Philadelphia", reddit: "sixers" },
  { name: "Phoenix", reddit: "suns" },
  { name: "Portland", reddit: "ripcity" },
  { name: "Sacramento", reddit: "kings" },
  { name: "San Antonio", reddit: "nbaspurs" },
  { name: "Toronto", reddit: "torontoraptors" },
  { name: "Utah", reddit: "utahjazz" },
  { name: "Washington", reddit: "washingtonwizards" }
];

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

getStandings()
  .then(standingArray => {
    standingArray.map((e, i) => {
      // Standings /////////////////////////////////////////////////////////
      if (e.name) {
        standingsString += `${i + 1}|${e.name}|${e.wins}|${e.losses}|${
          e.gamesBehind
        }\n`;
      }
    });
    standingsString += "\n";

    return getPlayerStats();
  })
  .then(stats => {
    // Player Stats /////////////////////////////////////////////////////////
    // Player | MPG | PPG | RPG | APG
    for (var key in stats){
      console.log(key)
      statsString += `${key}|${stats[key].MIN}|${stats[key].PTS}|${stats[key].REB}|${stats[key].AST}|\n`;
    }

    statsString += "\n";

    return getGames();
  })
  .then(games => {
    // Month schedule /////////////////////////////////////////////////////////
    const today = new Date();
    const numDaysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();

    // Get first day of the month and prepad the monthly calendar up to that day
    var firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth = firstDayOfMonth.getDay();

    for (var i = 0; i < firstDayOfMonth; i++) {
      monthScheduleString += "   |";
    }

    // Go through days and post games if any
    var pipeCount = firstDayOfMonth;
    for (var day = 1; day <= numDaysInMonth; day++) {
      var foundGame = games.find(game => {
        return (
          game.date.getDate() === day &&
          game.date.getMonth() === today.getMonth()
        );
      });

      monthScheduleString += `${day}`.padStart(2, "0");

      if (foundGame) {
        // Get the subreddit address
        const ttr = teamToReddit.find(team => {
          return foundGame.opponent === team.name;
        });
        var address = "[](/r/";
        if (ttr) {
          address += ttr.reddit;
        }
        monthScheduleString += address + ")";
      } else {
        monthScheduleString += " ";
      }

      if (pipeCount === 6) {
        monthScheduleString += "\n";
        pipeCount = 0;
      } else {
        monthScheduleString += "|";
        pipeCount++;
      }
    }
    monthScheduleString += "\n\n";

    return getGames();
  })
  .then(games => {
    // Schedule on top /////////////////////////////////////////////////////////
    const today = new Date();
    const gameOnOrBeforeToday = games.filter(g => {
      return g.date <= today;
    });
    var gameToday = games.filter(g => {
      return (
        g.date.getMonth() == today.getMonth() &&
        g.date.getFullYear() == today.getFullYear() &&
        g.date.getDate() == today.getDate()
      );
    });
    if (gameToday.length > 0) {
      gameToday = gameToday[0];
    }

    // console.log(gameToday);

    const lastGamePlayed = gameOnOrBeforeToday[gameOnOrBeforeToday.length - 1];

    // console.log(lastGamePlayed);

    const i =
      games.indexOf(gameToday) !== -1
        ? games.indexOf(gameToday)
        : games.indexOf(lastGamePlayed);

    // console.log(games);
    // console.log(games.indexOf(gameToday));
    // console.log(games.indexOf(lastGamePlayed));

    var gamesToDisplay;
    if (i < 3) {
      gamesToDisplay = games.splice(0, 7);
    } else if (i >= games.length - 3) {
      gamesToDisplay = games.splice(games.length - 7, 7);
    } else {
      gamesToDisplay = games.splice(i - 3, 7);
    }

    gamesToDisplay.map(c => {
      const ttr = teamToReddit.find(team => {
        return c.opponent === team.name;
      });

      var stringDate = monthsString[c.date.getMonth()];
      stringDate += ` ${c.date.getDate()}`;

      const momentDate = moment(c.date);
      const time = momentDate.tz("America/Los_Angeles").format("h:mma");

      var hour = c.date.getHours();
      hour = hour >= 12 ? hour - 12 : hour;
      hour = hour === 0 ? 12 : hour;

      weekScheduleString += `* [](/r/${ttr.reddit}) `;
      weekScheduleString += `*${stringDate}* `;
      weekScheduleString += c.score ? `**${c.score}** ` : `**${time}** `;
      weekScheduleString += c.hasOwnProperty("isWin")
        ? c.isWin
          ? "[W](#W)"
          : "[L](#L)"
        : c.isHome
        ? "[home](#home)"
        : "[away](#away)";
      weekScheduleString += "\n";
    });
    weekScheduleString += "\n";

    return getRecord();
  })
  .then(record => {
    // Record /////////////////////////////////////////////////////////
    recordString += `# Record ${record} \n\n`;

    return r.getSubreddit("lakers").getSettings("description");
  })
  .then(res => {
    const fullSettings = res.description;
    const beforeSplit = fullSettings.split(recordHeader)[0];
    const afterSplit = fullSettings
      .split("######[](/r)\n####Current Player Stats")[1]
      .split("#####[](/r)")[1];

    var settings =
      beforeSplit +
      recordString +
      monthScheduleString +
      weekScheduleString +
      standingsString +
      statsString +
      "#####[](/r)" +
      afterSplit;

    console.log(settings);
    r.getSubreddit(process.env.SUBREDDIT).editSettings({
      description: settings
    });
  });
