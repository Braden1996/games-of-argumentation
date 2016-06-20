let labelling = require("../labelling.js");
let cyto_helpers = require("../cytoscape-helpers.js");
let openFile = require("../util/openfile.js");

function parse_cytoscape_instance(cy) {
	let callback = function(reader, evt) {
		let graph_json = reader.result;
		let graph = JSON.parse(graph_json);
		cyto_helpers.set_graph(cy, graph);

		if($("[data-js='graph-view-labelling']").hasClass("m-button--switch__li--active")) {
			labelling.show_labelling(cy);
		} else if($("[data-js='graph-view-minmax']").hasClass("m-button--switch__li--active")) {
			labelling.show_minmax(cy);
		}
	}

	$("[data-opengraphfile]").change(function() {
		openFile(this, callback);
	});

	return cy;
}

module.exports = {
	"parse_cytoscape_instance": parse_cytoscape_instance
}