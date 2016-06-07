var config     = require("../../config/javascript");
var javascript = require("../javascript")
var browserify = require("browserify");
var gulp       = require("gulp");
var gutil      = require("gulp-util");
var assign     = require("lodash.assign");
var watchify   = require("watchify");

gulp.task("watch-javascript", function() {
  var bundler = browserify(config.source, assign({
    cache: {},
    packageCache: {},
  }, config.customOptions));

  bundler = javascript.prepareBundle(bundler);

  bundler = watchify(bundler);

  bundler.on("update", function() {
    var updateStart = Date.now();
    gutil.log("Starting '" + gutil.colors.cyan("Rebundling") + "'...");
    javascript.pipeBundle(bundler);
    gutil.log("Finished '" + gutil.colors.cyan("Rebundling") + "' after", gutil.colors.magenta((Date.now() - updateStart) + "ms"));
  });
  return javascript.pipeBundle(bundler);
});