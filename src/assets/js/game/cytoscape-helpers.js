let cytoscape = require("cytoscape");
let labelling = require("./labelling.js");
let stylesheet = require("./stylesheet.js");

function create_cytoscape_instance(container) {
	let cy = cytoscape({
		container: container,

		boxSelectionEnabled: false,
		autounselectify: true,

		style: stylesheet.build_stylesheet()
	});

	cy.on("mouseout", "node", () => container.css("cursor", "default"));
	cy.on("mouseover", "node", () => container.css("cursor", "pointer"));
	cy.on("grab", "node", () => container.css("cursor", "pointer"));

	return cy;
}

function clear_graph(cy) {
	cy.remove(cy.elements());
	cy.trigger("graphClear");
}

function set_graph(cy, graph) {
	clear_graph(cy);

	cy.add(graph);
	cy.elements().layout({ name: "grid" });

	cy.trigger("graphSet");
}

module.exports = {
	"create_cytoscape_instance": create_cytoscape_instance,
	"clear_graph": clear_graph,
	"set_graph": set_graph
}