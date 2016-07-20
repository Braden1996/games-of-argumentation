let labelling = require("../logic/labelling.js");
let cyto_helpers = require("../util/cytoscape-helpers.js");
let openFile = require("../util/openfile.js");

function parseCytoscapeInstance(cy) {
	let callback = function(reader, evt) {
		let graph_json = reader.result;
		let graph = JSON.parse(graph_json);
		cyto_helpers.setGraph(cy, graph);

		if($("[data-js='graph-view-labelling']").hasClass("m-button--switch__li--active")) {
			labelling.showLabelling(cy);
		} else if($("[data-js='graph-view-minmax']").hasClass("m-button--switch__li--active")) {
			labelling.showMinMax(cy);
		}
	}

	$("[data-open-graph-file]").change(function() {
		openFile(this, callback);
	});

	return cy;
}

module.exports = {
	"parseCytoscapeInstance": parseCytoscapeInstance
}