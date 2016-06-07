var config = require("./");

module.exports = {
  source: config.projectAssets + "/scss/main.scss",
  destination: config.projectStatic + "/css",
  settings: {
    indentedSyntax: true, // Enable .sass syntax!
    imagePath: "images", // Used by the image-url helper
    includePaths: "bower_components"
  }
};
