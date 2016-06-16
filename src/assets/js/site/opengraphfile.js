let game = require("../game/main.js");
let labelling = require("../game/labelling.js");
let cyto_helpers = require("../game/cytoscape-helpers.js");
let cy = game.cytoscape_instance;

$("[data-js='open-graph-file']").change(function() {
	if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
		alert("The File APIs are not fully supported in this browser.");
		return;
	} else {
		let input = this;
		if (!input) {
		  alert("Can't find file-input element!");
		} else if (!input.files) {
		  alert("Browser doesn't seem to support 'files' property of file input");
		} else if (!input.files[0]) {
		  alert("Unable to find file");               
		} else {
			let graph_file = input.files[0];
			let reader = new FileReader();
			reader.addEventListener("load", function() {
				let graph_json = reader.result;
				let graph = JSON.parse(graph_json);
				cyto_helpers.set_graph(cy, graph);

				if($("[data-js='graph-view-labelling']").hasClass("m-button--switch__icon--active")) {
					labelling.show_labelling(cy);
				} else if($("[data-js='graph-view-minmax']").hasClass("m-button--switch__icon--active")) {
					labelling.show_minmax(cy);

				} else if($("[data-js='graph-view-labelling-minmax']").hasClass("m-button--switch__icon--active")) {
					labelling.show_labelling(cy);
					labelling.show_minmax(cy);
				}
			}, false);

			if (graph_file) {
				reader.readAsText(graph_file);
			}
		}
	}
});