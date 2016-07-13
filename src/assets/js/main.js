// Libraries
// (check package.json for library "entry-point" information)
require("jquery");


$(document).ready(function() {
	// Load visuals
	require("./visuals/m-button.js");
	require("./visuals/m-tablist.js");

	// Load views
	require("./views/onclick.js");

	// Load game app
	let game = require("./app/main.js");
	game.ready();
});