const snoowrap = require("snoowrap");
const getStandings = require("./getStandings");
const getPlayerStats = require("./getPlayerStats");
const getGames = require("./getGames");

const r = new snoowrap({
  userAgent: "app",
  clientId: "rV0GkjLP_yvfNg",
  clientSecret: "BovhTAIceBfPehZ6iOSzZBDm9sM",
  username: "lakerbot",
  password: "##lakers815"
});

const standingsHeader =
  "######[](/r)\n" +
  "####Current Standings\n" +
  "Team | W | L | % | GB\n" +
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

getStandings()
  .then(standingArray => {
    standingArray.map((e, i) => {
      standingsString +=
        `${e.name}|${e.wins}|${e.losses}|${e.winPercent}|${
          e.gamesBehind
        }`.trim() + "\n";
    });
    standingsString += "\n";

    return getPlayerStats();
  })
  .then(stats => {
    stats.map(c => {
      statsString += `${c.name}|${c[3]}|${c[4]}|${c[7]}|${c[8]}\n`;
    });
    statsString += "\n";

    return getGames();
  })
  .then(games => {
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

    return r.getSubreddit("lakers").getSettings("description");
  })
  .then(res => {
    const fullSettings = res.description;
    const beforeSplit = fullSettings.split(monthScheduleHeader)[0];
    const afterSplit = fullSettings
      .split("######[](/r)\n####Current Player Stats")[1]
      .split("#####[](/r)")[1];

    var settings =
      beforeSplit +
      monthScheduleString +
      standingsString +
      statsString +
      "#####[](/r)" +
      afterSplit;

    console.log(settings);
    r.getSubreddit("likwidtesting").editSettings({
      description: settings
    });
  });
