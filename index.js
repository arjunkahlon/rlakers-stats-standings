const snoowrap = require("snoowrap");
const getStandings = require("./getStandings");
const getPlayerStats = require("./getPlayerStats");

const r = new snoowrap({
  userAgent: "app",
  clientId: "rV0GkjLP_yvfNg",
  clientSecret: "BovhTAIceBfPehZ6iOSzZBDm9sM",
  username: "lakerbot",
  password: "##lakers815"
});

// Get settings
r.getSubreddit("lakers")
  .getSettings("description")
  .then(res => {
    //Take it apart
    const fullSettings = res.description;
    const beforeSplit = fullSettings.split(
      "######[](/r)\n####Current Standings"
    )[0];
    const afterSplit =
      "##### [](/r)" +
      fullSettings
        .split("######[](/r)\n####Current Player Stats")[1]
        .split("##### [](/r)")[1];
    var settings;
    //Get standings

    var standingsString = `######[](/r)
####Current Standings
Team | W | L | % | GB
---|---|----|----|----
`;

    var statsString = `######[](/r)
####Current Player Stats
Player | MPG | PPG | RPG | APG
---|---|----|----|----|----
`;

    getStandings()
      .then(standings => {
        standings.map((e, i) => {
          standingsString +=
            `${e.name}|${e.wins}|${e.losses}|${e.winPercent}|${
              e.gamesBehind
            }`.trim() + "\n";
        });
        standingsString += "\n";

        return standingsString;
      })
      .then(
        getPlayerStats().then(stats => {
          stats.map(c => {
            statsString += `${c.name}|${c[3]}|${c[4]}|${c[7]}|${c[8]}\n`;
          });
          statsString += "\n";

          var settings =
            beforeSplit + standingsString + statsString + afterSplit;

          r.getSubreddit("likwidtesting").editSettings({
            description: settings
          });
        })
      );
  });
