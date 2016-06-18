let cytoscape = require("cytoscape");
let labelling = require("./labelling.js");

function create_cytoscape_instance(container) {
	let cy = cytoscape({
		container: container,

		boxSelectionEnabled: false,
		autounselectify: true,
	});

	cy.on("mouseout", "node", () => container.css("cursor", "default"));
	cy.on("mouseover", "node", () => container.css("cursor", "pointer"));
	cy.on("grab", "node", () => container.css("cursor", "pointer"));

	return cy;
}

function build_stylesheet() {
	return cytoscape.stylesheet()
		.selector("node")
			.css({
				"padding-top": "18px",
				"padding-right": "18px",
				"padding-bottom": "18px",
				"padding-left": "18px",
				"color": "white",
				"content": "data(id)",
				"text-wrap": "wrap",
				"text-valign": "center",
				"text-halign": "center"
			})
		.selector("node.in")
			.css({
				"content": e => e.attr("id") + "\n(in)",
				"background-color": "#37d077",
			})
		.selector("node.out")
			.css({
				"content": e => e.attr("id") + "\n(out)",
				"background-color": "#e74c3c",
			})
		.selector("node.undec")
			.css({
				"content": e => e.attr("id") + "\n(undec)",
				"background-color": "#95a5a6",
			})
		.selector("node.minmax")
			.css({
				"content": e => {
					let min_max = e.attr("min_max_numbering");
					min_max = min_max  === undefined ? "\u221e" : min_max;
					return e.attr("id") + "\n(" + min_max + ")";
				}
			})
		.selector("edge")
			.css({
				"target-arrow-shape": "triangle",
				"width": 4,
				"line-color": "#ddd",
				"target-arrow-color": "#ddd",
				"curve-style": "bezier"
			})
}

function on_graph_change(cy) {
	cy.lab = labelling.get_labelling(cy);
}

function clear_graph(cy) {
	cy.remove(cy.elements());

	on_graph_change(cy);
}

function set_graph(cy, graph) {
	clear_graph(cy);

	cy.add(graph);
	cy.elements().layout({ name: "grid" });

	on_graph_change(cy);
}

module.exports = {
	"create_cytoscape_instance": create_cytoscape_instance,
	"build_stylesheet": build_stylesheet,
	"set_graph": set_graph
}