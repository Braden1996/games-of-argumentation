let labelling = require("../../logic/labelling.js");

// Calculate the grounded labelling for the given graph.
module.exports = function(game) {
	let cy = game.cy;
	let args = cy.nodes();
	let lab = labelling.createEmptyLabelling(game.cy);

	// Begin by labelling in to all those arguments with no attackers.
	let last_labelled = args.filter((i, arg) => {
		if (labelling.isLegallyIn(arg, lab)) {
			lab["in"] = lab["in"].add(arg);
			return true;
		} else {
			return false;
		};
	});

	while (last_labelled.nonempty()) {
		let newly_labelled = cy.collection();
		last_labelled.forEach((arg) => {
			let attacked = arg.outgoers().targets();

			newly_labelled = newly_labelled.union(attacked.filter((i, att_arg) => {
				// Check that we haven't already labelled 'attacked_arg'.
				if (!(att_arg.anySame(lab["in"]) || att_arg.anySame(lab["out"]))) {
					if (labelling.isLegallyIn(att_arg, lab)) {
						lab["in"] = lab["in"].add(att_arg);
						return true;
					} else if (labelling.isLegallyOut(att_arg, lab)) {
						lab["out"] = lab["out"].add(att_arg);
						return true;
					} else {
						return false;
					};
				};
			}));
		});

		last_labelled = newly_labelled;
	};

	// All args that aren't 'in' or 'out' must be 'undec'
	lab["undec"] = args.diff(lab["in"].union(lab["out"]))["left"];

	return lab;
};