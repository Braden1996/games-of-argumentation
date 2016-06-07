var config = require("./");

module.exports = {
  autoprefixer: { browsers: ["last 2 version"] },
  source: config.source + "/**/css/**/*.css",
  destination: config.destination,
};
