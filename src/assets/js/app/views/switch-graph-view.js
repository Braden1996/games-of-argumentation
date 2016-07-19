let labelling = require("../logic/labelling.js");

function parseCytoscapeInstance(cy) {
	$("[data-switch-graph-view='labelling']").on("m-button-switched", function(event, is_on) {
		if(is_on) {
			labelling.showLabelling(cy);
		} else {
			labelling.hideLabelling(cy);
		}
	});

	$("[data-switch-graph-view='minmax']").on("m-button-switched", function(event, is_on) {
		if(is_on) {
			labelling.showMinMax(cy);
		} else {
			labelling.hideMinMax(cy);
		}
	});

	return cy;
}

module.exports = {
	"parseCytoscapeInstance": parseCytoscapeInstance
}