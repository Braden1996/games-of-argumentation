module.exports = {
  prepareBundle: prepareBundle,
  pipeBundle: pipeBundle
}

var config       = require("../config/javascript");
var handleErrors = require("../util/handleerrors");
var babelify     = require('babelify');
var browserify   = require("browserify");
var gulp         = require("gulp");
var source       = require("vinyl-source-stream");
var buffer       = require('vinyl-buffer');

// We need to do some work before we call bundle.
// For now, this is just a Babel transforms.
// Note: this is used by our JS watch task.
function prepareBundle(bundler) {
  return bundler
    .transform(babelify, {
      presets: ["es2015"],
      ignore: "bower_components",
      extensions: [".js"]
    })
}

// Call bundle and then convert it into a stream, so that we
// are able to pipe it.
// Note: this is used by our JS watch task.
function pipeBundle(bundler) {
  return bundler.bundle()
    .on("error", handleErrors.swallowError)
    .pipe(source(config.destinationFilename))  // Get streaming vinyl file object
    .pipe(buffer())  // Convert to Buffered vinyl file object
    .pipe(gulp.dest(config.destination));
}

gulp.task("javascript", function() {
  var bundler = browserify(config.source, config.customOptions);
  bundler = prepareBundle(bundler);
  return pipeBundle(bundler);
});