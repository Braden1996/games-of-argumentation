var config = require("./");

config.source = config.projectAssets + "/js/main.js";
config.destination = config.projectStatic + "/js";
config.destinationFilename = "main.js";

config.customOptions = {
  debug: true,
  noparse: ["jquery"]
};

module.exports = config;
