let labelling = require("../labelling.js");

function parse_cytoscape_instance(cy) {
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

	return cy;
}

module.exports = {
	"parse_cytoscape_instance": parse_cytoscape_instance
}