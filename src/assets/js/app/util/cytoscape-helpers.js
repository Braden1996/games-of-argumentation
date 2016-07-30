let cytoscape = require("cytoscape");
let edgehandles = require("cytoscape-edgehandles");
let ifShowHide = require("./ifshowhide.js");

// Create a new instance of Cytoscape
function createCytoscapeInstance(container) {
	// Register cytoscape-edgehandles
	edgehandles(cytoscape, $);

	let cy = cytoscape({
		container: container,

		boxSelectionEnabled: false,
		autounselectify: true
	});

	cy.on("mouseout", "node", () => container.css("cursor", "default"));
	cy.on("mouseover", "node", () => container.css("cursor", "pointer"));
	cy.on("grab", "node", () => container.css("cursor", "pointer"));

	// Configure cytoscape-edgehandles
	var defaults = {
		toggleOffOnLeave: true,
		// Always allow the given node to create a loop with itself
		loopAllowed: (node) => true
	};
	cy.edgehandles(defaults);

	// Create functionality to create new nodes
	cy.on("tap", (evt) => {
		if (evt.cyTarget === cy) {
			let finished = false;
			while (!finished) {
				let node_id = prompt("Please enter an id for your new argument:");
				if (node_id === "" || node_id === null) {
					finished = true;
				} else if (cy.getElementById(node_id).empty()) {
					finished = true;

					let node = { "data": { "id": node_id }, "position": evt.cyPosition };
					cy.add(node);
				} else {
					alert("An argument already exists with the id '" + node_id + "'.\n" +
						"Please try again - or leave empty to cancel.");
				}
			}
		}
	});

	cy.on("add remove", (evt) => {
		ifShowHide("data-cytoscape", "ifgraphset", cy.nodes().nonempty());
	});
	ifShowHide("data-cytoscape", "ifgraphset", false);

	return cy;
}

// Set the graph to display the elements described within 'graph'.
// 	If an element does not have an explicitly described position, we make use
//	of Cytoscape's 'random' layout to generate an arbitrary position for said
// 	element.
function setGraph(cy, graph) {
	cy.remove(cy.elements());  // Clear the current graph

	cy.add(graph);

	let positions = {};
	graph["nodes"].filter((ele) => "position" in ele).forEach((ele) => {
		positions[ele.data.id] = Object.assign({}, ele.position);
	});

	if (positions.length !== graph.length) {
		let random_layout = cy.makeLayout({ name: "random" });
		random_layout.run();
		random_layout.stop();
	}

	let layout = cy.makeLayout({ name: "preset", positions: (node) => {
		return node.id() in positions ? positions[node.id()] : node.position();
	}});

	layout.run();
}

module.exports = {
	"createCytoscapeInstance": createCytoscapeInstance,
	"setGraph": setGraph
}