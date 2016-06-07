var config = require("../../config/watch/sass");
var gulp   = require("gulp");
var watch  = require("gulp-watch");

gulp.task("watch-sass", ["sass"], function() {
	gulp.watch(config.watch, ["sass"]);
});
