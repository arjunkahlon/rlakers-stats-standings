const getPlayerStats = require("./getPlayerStats");
const getGames = require("./getGames");

getGames().then(results => console.log(results))