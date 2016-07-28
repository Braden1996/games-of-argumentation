let cyto_helpers = require("../util/cytoscape-helpers.js");

// Create and return a blank labelling.
// Note: 'cy.collection()', in this case, is just an empty collection.
function createEmptyLabelling(cy) {
	return {"in": cy.collection(), "out": cy.collection(), "undec": cy.collection()};
}

// An in-labelled arg is said to be legally in iff all of its attackers are
// labelled out.
function isLegallyIn(arg, lab) {
	let attackers = arg.incomers().sources();
	let out_attackers = attackers.intersection(lab["out"]);
	return out_attackers.same(attackers);
}

// An out-labelled arg is said to be legally out iff it has at least one
// attacker that is labelled in.
function isLegallyOut(arg, lab) {
	let attackers = arg.incomers().sources();
	let in_attackers = attackers.intersection(lab["in"]);
	return in_attackers.length >= 1;
}

// Calculate the grounded labelling for the given graph.
function getGroundedLabelling(args) {
	let cy = cyto_helpers.getCy(args);
	let lab = createEmptyLabelling(cy);

	// Begin by labelling in to all those arguments with no attackers.
	let newly_labelled = args.filter((i, arg) => {
		if (isLegallyIn(arg, lab)) {
			lab["in"] = lab["in"].add(arg);
			return true;
		} else {
			return false;
		}
	});

	// A counter used to keep track of the min-max numbering.
	let count = 1;
	let last_labelled = newly_labelled;
	while (newly_labelled.nonempty()) {
		newly_labelled.forEach((arg) => arg.data("min_max_numbering", count));
		count++;

		newly_labelled = cy.collection();
		last_labelled.forEach((arg) => {
			let attacked = arg.outgoers().targets();

			newly_labelled = newly_labelled.union(attacked.filter((i, att_arg) => {
				// Check that we haven't already labelled 'attacked_arg'.
				if (!(att_arg.anySame(lab["in"]) || att_arg.anySame(lab["out"]))) {
					if (isLegallyIn(att_arg, lab)) {
						lab["in"] = lab["in"].add(att_arg);
						return true;
					} else if (isLegallyOut(att_arg, lab)) {
						lab["out"] = lab["out"].add(att_arg);
						return true;
					} else {
						return false;
					}
				}
			}));
		});

		last_labelled = newly_labelled;
	}

	// All args that aren't 'in' or 'out' must be 'undec'
	lab["undec"] = args.diff(lab["in"].union(lab["out"]))["left"];
	lab["undec"].data("min_max_numbering", Infinity);

	return lab;
}

function isLabellingShown(cy) {
	return cy.app_data.labelling["grounded"]["in"].hasClass("in") ||
		cy.app_data.labelling["grounded"]["out"].hasClass("out") ||
		cy.app_data.labelling["grounded"]["undec"].hasClass("undec");
}

function isMinMaxShown(cy) {
	return cy.nodes().hasClass("minmax");
}

function showLabelling(cy) {
	if(!cy.app_data.labelling["grounded"]) {
		return;
	} else {
		hideLabelling(cy);
		cy.app_data.labelling["grounded"]["in"].addClass("in");
		cy.app_data.labelling["grounded"]["out"].addClass("out");
		cy.app_data.labelling["grounded"]["undec"].addClass("undec");
	}
}

function hideLabelling(cy) {
	if(!cy.app_data.labelling["grounded"]) {
		return;
	} else {
		cy.nodes().removeClass("in out undec");
	}
}

function showMinMax(cy) {
	if(!cy.app_data.labelling["grounded"]) {
		return;
	} else {
		hideMinMax(cy);
		showLabelling(cy)
		cy.nodes().addClass("minmax");
	}
}

function hideMinMax(cy) {
	if(!cy.app_data.labelling["grounded"]) {
		return;
	} else {
		hideLabelling(cy)
		cy.nodes().removeClass("minmax");
	}
}

function parseCytoscapeInstance(cy) {
	cy.app_data.labelling = {};

	let setLabelling = function(evt) {
		evt.cy.app_data.labelling["grounded"] = getGroundedLabelling(evt.cy.nodes());
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
	"parseCytoscapeInstance": parseCytoscapeInstance
}