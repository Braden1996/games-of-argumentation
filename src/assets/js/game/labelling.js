function get_labelling(cy) {
	// Note: 'cy.collection()', in this case, is just an empty set.
	let lab = {"in": cy.collection(), "out": cy.collection(), "undec": cy.collection()};

	var nodes = cy.nodes();

	// A node is labelled 'in' iff all attackers are already labelled 'out'.
	function should_label_in(node) {
		let attackers = node.incomers().sources();
		let out_attackers = attackers.intersection(lab["out"]);
		return out_attackers.same(attackers);
	}

	// A node is labelled 'out' iif it has at least one attacker that is already labelled 'in'
	function should_label_out(node) {
		let attackers = node.incomers().sources();
		let in_attackers = attackers.intersection(lab["in"]);
		return in_attackers.length >= 1;
	}

	let label_made = true;
	while (label_made) {
		label_made = false;
		for( let i = 0; i < nodes.length; i++ ) {
			let node = nodes[i];
			// Check that node isn't already labelled
			if (!(node.anySame(lab["in"]) || node.anySame(lab["out"]))) {
				if (should_label_in(node)) {
					lab["in"] = lab["in"].add(node);
					label_made = true;
				} else if (should_label_out(node)) {
					lab["out"] = lab["out"].add(node);
					label_made = true;
				}
			}
		}
	}

	// All nodes that aren't 'in' or 'out' must be 'undec'
	lab["undec"] = nodes.diff(lab["in"].union(lab["out"]))["left"];

	return lab;
}

function apply_labelling(lab) {
	lab["in"].addClass("in");
	lab["out"].addClass("out");
	lab["undec"].addClass("undec");
}

module.exports = {
	"get_labelling": get_labelling,
	"apply_labelling": apply_labelling
}