let labelling = require("../logic/labelling.js");

function parse_cytoscape_instance(cy) {
	$("[data-js='graph-view-labelling']").on("m-button-switched", function(event, is_on) {
		if(is_on) {
			labelling.showLabelling(cy);
		} else {
			labelling.hideLabelling(cy);
		}
	});

	$("[data-js='graph-view-minmax']").on("m-button-switched", function(event, is_on) {
		if(is_on) {
			labelling.showMinMax(cy);
		} else {
			labelling.hideMinMax(cy);
		}
	});

	return cy;
}

module.exports = {
	"parse_cytoscape_instance": parse_cytoscape_instance
}