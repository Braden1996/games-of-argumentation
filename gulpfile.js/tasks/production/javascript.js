var config = require("../../config/production/javascript");
var gulp   = require("gulp");
var uglify = require('gulp-uglify');

gulp.task("production-javascript", function() {
	return gulp.src(config.source)
		.pipe(uglify())
		.pipe(gulp.dest(config.destination));
});
