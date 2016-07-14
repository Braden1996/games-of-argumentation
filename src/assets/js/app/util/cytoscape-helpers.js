let cytoscape = require("cytoscape");
let edgehandles = require("cytoscape-edgehandles");

function create_cytoscape_instance(container) {
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
		loopAllowed: function(node) {
			// for the specified node, return whether edges from itself to itself are allowed
			return true;
		}
	};

	// Create functionality to create new nodes
	cy.on("tap", (evt) => {
		if (evt.cyTarget === cy) {
			let finished = false;
			while (!finished) {
				let node_id = prompt("Please enter an id for your new argument:");
				if (node_id === "") {
					finished = true;
				} else if (cy.getElementById(node_id).empty()) {
					finished = true;

					let node = { "data": { "id": node_id }, "position": evt.cyPosition };
					cy.add(node);
				} else {
					alert("An argument already exists with the id '" + node_id + "'.\nPlease try again - or leave empty to cancel.");
				}
			}
		}
	});

	cy.edgehandles(defaults);

	return cy;
}

function clear_graph(cy) {
	cy.remove(cy.elements());
	cy.trigger("graphClear");
}

function set_graph(cy, graph) {
	clear_graph(cy);

	cy.add(graph);

	let position_elements = graph["nodes"].filter((ele, i, arr) => "position" in ele);
	let element_positions = {}

	position_elements.forEach((ele, i, arr) => element_positions[ele.data.id] = Object.assign({}, ele.position));

	if (position_elements.length !== graph.length) {
		let random_layout = cy.makeLayout({ name: "random" });
		random_layout.run();
		random_layout.stop();
	}

	let layout = cy.makeLayout({ name: "preset", positions: (node) => {
		return node.id() in element_positions ? element_positions[node.id()] : node.position();
	}});

	layout.run();
}

// To help prevent us from passing 'cy' around.
function get_cy(element) {
	let cy = undefined;

	if (Array.isArray(element)) {
		for(let ele of element) {
			cy = get_cy(ele);
			if (cy !== undefined) {
				break;
			}
		}
	} else if (typeof element.cy === "function") {
		cy = element.cy();
	}

	return cy;
}

function attacks(attacker, victim) {
	return attacker.edgesTo(victim).nonempty();
}

module.exports = {
	"create_cytoscape_instance": create_cytoscape_instance,
	"clear_graph": clear_graph,
	"set_graph": set_graph,
	"get_cy": get_cy,
	"attacks": attacks
}