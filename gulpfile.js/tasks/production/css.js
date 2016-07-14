var config       = require("../../config/production/css");
var gulp         = require("gulp");
var autoprefixer = require('gulp-autoprefixer');
var cssnano      = require("gulp-cssnano");

gulp.task("production-css", ["sass"], function() {
	return gulp.src(config.source)
		.pipe(autoprefixer(config.autoprefixer))
		.pipe(cssnano(config.cssnano))
		.pipe(gulp.dest(config.destination));
});
