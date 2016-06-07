var config       = require("../../config/production/css");
var gulp         = require("gulp");
var autoprefixer = require('gulp-autoprefixer');
var cssnano    = require("gulp-cssnano");

gulp.task("production-css", function() {
	return gulp.src(config.source)
		.pipe(autoprefixer())
		.pipe(cssnano())
		.pipe(gulp.dest(config.destination));
});
