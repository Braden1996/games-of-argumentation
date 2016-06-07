var config = require("./");

config.source = config.projectAssets + "/js/main.js";
config.destination = config.projectStatic + "/js";
config.destinationFilename = "main.js";

config.browserifyOptions = {
  debug: true,
  noparse: ["jquery", "cytoscape"]  // We don't need to bundle these libs
};

config.babelifyOptions = {
  presets: ["es2015"],
  ignore: "bower_components",
  extensions: [".js"]
};

module.exports = config;
