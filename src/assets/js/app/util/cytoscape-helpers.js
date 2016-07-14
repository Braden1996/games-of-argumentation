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
		},
		complete: function(sourceNode, targetNodes, addedEntities) {
			// fired when edgehandles is done and entities are added
			if (addedEntities.nonempty()) {
				cy.trigger("graphSet");
			}
		}
	};

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

	cy.trigger("graphSet");
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