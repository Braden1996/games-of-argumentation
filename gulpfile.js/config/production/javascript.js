var config = require("./");

module.exports = {
  source: config.source + "/**/js/**/*.js",
  destination: config.destination,
};
