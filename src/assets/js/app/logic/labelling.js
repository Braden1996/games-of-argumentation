let cyto_helpers = require("../util/cytoscape-helpers.js");

// A node is labelled 'out' iif it has at least one attacker that is already labelled 'in'
function shouldLabelOut(node, lab) {
	let attackers = node.incomers().sources();
	let in_attackers = attackers.intersection(lab["in"]);
	return in_attackers.length >= 1;
}

// A node is labelled 'in' iff all attackers are already labelled 'out'.
function shouldLabelIn(node, lab) {
	let attackers = node.incomers().sources();
	let out_attackers = attackers.intersection(lab["out"]);
	return out_attackers.same(attackers);
}

function getGroundedLabelling(nodes) {
	let cy = cyto_helpers.get_cy(nodes);

	// Note: 'cy.collection()', in this case, is just an empty set.
	let lab = {"in": cy.collection(), "out": cy.collection(), "undec": cy.collection()};

	if (nodes.length != 0) {
		// This array will store all the nodes that we labelled in the past iteration.
		// That is, at any point, all nodes in this array will have the same min-max numbering.
		let node_array = [];

		// A counter used to keep track of the min-max numbering.
		// This can be thought of as the distance (+1) from the nearest initial 'in' node.
		let min_max_counter = 1;

		// Perform an initial iteration over all the nodes, labelling 'in' for those with no attackers.
		for (let i = 0; i < nodes.length; i++) {
	    	let node = nodes[i];
	    	if (shouldLabelIn(node, lab)) {
				lab["in"] = lab["in"].add(node);
				node.data("min_max_numbering", min_max_counter);
				node_array.push(node);
			}
		}

		let next_node_array = node_array;
		let label_made = true;
		while (label_made) {
			label_made = false;

			node_array = next_node_array;
			next_node_array = [];
			min_max_counter++;

			for (let i = 0; i < node_array.length; i++) {
	    		let node = node_array[i];

				let attacked = node.outgoers().targets();

				for (let j = 0; j < attacked.length; j++) {
					let attacked_node = attacked[j];

					// Check that attacked_node isn't already labelled
					if (!(attacked_node.anySame(lab["in"]) || attacked_node.anySame(lab["out"]))) {
						let labelled = false;
						if (shouldLabelIn(attacked_node, lab)) {
							lab["in"] = lab["in"].add(attacked_node);
							labelled = true;
						} else if (shouldLabelOut(attacked_node, lab)) {
							lab["out"] = lab["out"].add(attacked_node);
							labelled = true;
						}

						if (labelled) {
							label_made = true;
							attacked_node.data("min_max_numbering", min_max_counter);
							next_node_array.push(attacked_node);
						}
					}
				}
			}
		}

		// All nodes that aren't 'in' or 'out' must be 'undec'
		lab["undec"] = nodes.diff(lab["in"].union(lab["out"]))["left"];
		lab["undec"].data("min_max_numbering", Infinity);
	}

	return lab;
}

function isLabellingShown(cy) {
	return cy.lab["in"].hasClass("in") || cy.lab["out"].hasClass("out") || cy.lab["undec"].hasClass("undec");
}

function isMinMaxShown(cy) {
	return cy.nodes().hasClass("minmax");
}

function showLabelling(cy) {
	if(!cy.lab) {
		return;
	} else {
		hideLabelling(cy);
		cy.lab["in"].addClass("in");
		cy.lab["out"].addClass("out");
		cy.lab["undec"].addClass("undec");
	}
}

function hideLabelling(cy) {
	if(!cy.lab) {
		return;
	} else {
		cy.nodes().removeClass("in out undec");
	}
}

function showMinMax(cy) {
	if(!cy.lab) {
		return;
	} else {
		hideMinMax(cy);
		showLabelling(cy)
		cy.nodes().addClass("minmax");
	}
}

function hideMinMax(cy) {
	if(!cy.lab) {
		return;
	} else {
		hideLabelling(cy)
		cy.nodes().removeClass("minmax");
	}
}

function parse_cytoscape_instance(cy) {
	let setLabelling = function(evt) {
		evt.cy.lab = getGroundedLabelling(evt.cy.nodes());
		if (isLabellingShown(cy)) {
			showLabelling(cy);
		}
	}

	cy.on("remove", setLabelling);
	cy.on("add", setLabelling);

	return cy;
}

module.exports = {
	"getGroundedLabelling": getGroundedLabelling,
	"isLabellingShown": isLabellingShown,
	"isMinMaxShown": isMinMaxShown,
	"showLabelling": showLabelling,
	"hideLabelling": hideLabelling,
	"showMinMax": showMinMax,
	"hideMinMax": hideMinMax,
	"parse_cytoscape_instance": parse_cytoscape_instance
}