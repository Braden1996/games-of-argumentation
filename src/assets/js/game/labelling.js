function get_labelling(cy) {
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

	lab["undec"] = nodes.diff(lab["in"].union(lab["out"]))["left"];

	return lab;
}

module.exports = {
	"get_labelling": get_labelling
}