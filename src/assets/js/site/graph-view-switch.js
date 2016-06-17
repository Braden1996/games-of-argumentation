let game = require("../game/main.js");
let labelling = require("../game/labelling.js");
let cy = game.cytoscape_instance;

$("[data-js='graph-view-labelling']").on("m-button-switched", function(event, is_on) {
	if(is_on) {
		labelling.show_labelling(cy);
	} else {
		labelling.hide_labelling(cy);
	}
});

$("[data-js='graph-view-minmax']").on("m-button-switched", function(event, is_on) {
	if(is_on) {
		labelling.show_minmax(cy);
	} else {
		labelling.hide_minmax(cy);
	}
});