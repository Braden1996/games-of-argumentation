let cyto_helpers = require("../util/cytoscape-helpers.js");

// We use arrays to keep track of all currently shown labellings and minmax.
let shown_labelling = [];
let shown_minmax = [];

let labelling = {
	// Create and return a new empty labelling.
	createEmptyLabelling: function(cy) {
		return {
			"in": cy.collection(),
			"out": cy.collection(),
			"undec": cy.collection()
		};
	},

	// Search the given minmax numbering for the given argument. If the argument
	// is found, return it's min-max number. Else, return undefined.
	searchMinMax: function(minmax, arg) {
		let value = undefined;
		minmax["args"].forEach((a, i) => {
			if (a === arg) {
				value = minmax["values"][i];
				return false;
			}
		});
		return value;
	},

	// Calculate the min-max numbering for the given labelling.
	getMinMaxNumbering: function(lab) {
		let minmax = {"args": lab["in"].cy().collection(), "values": []};

		let unnumbered_in = lab["in"];
		let unnumbered_out = lab["out"];

		// Save some screen real-estate.
		let s = this.searchMinMax;

		// Note: *.((max)|(min)) returns an object with the following fields:
		//	value : The maximum/minimum value found.
		//	ele : The element that corresponds to the maximum/minimum value.

		// Stop when a pass is made where no numbering occured.
		let last_length = -1;
		while (minmax.values.length !== last_length) {
			last_length = minmax.values.length;
			unnumbered_in = unnumbered_in.filter((i, arg) => {
				let out_attackers = arg.incomers().sources().intersection(lab["out"]);
				let numbered_out = out_attackers.filter((i, att) => !!s(minmax, att));
				if (out_attackers.same(numbered_out)) {
					let num_max = numbered_out.max((att) => s(minmax, att));
					let value = num_max["value"] === -Infinity ? 0 : num_max["value"];
					minmax["args"] = minmax["args"].add(arg);
					minmax["values"].push(1 + value);
					return false;
				}
				return true;
			});

			unnumbered_out = unnumbered_out.filter((i, arg) => {
				let numbered_in = arg.incomers().sources().intersection(lab["in"])
					.filter((i, att) => !!s(minmax, att));
				if (numbered_in.nonempty()) {
					let value = numbered_in.min((att) => s(minmax, att))["value"];
					minmax["args"] = minmax["args"].add(arg);
					minmax["values"].push(1 + value);
					return false;
				}
				return true;
			});
		};

		lab["in"].union(lab["out"]).filter((i, arg) => !s(minmax, arg))
			.union(lab["undec"])
			.forEach((arg) => {
				minmax["args"] = minmax["args"].add(arg);
				minmax["values"].push(Infinity);
			});

		return minmax;
	},

	// An in-labelled arg is said to be legally in iff all of its attackers are
	// labelled out.
	isLegallyIn: function(arg, lab) {
		let attackers = arg.incomers().sources();
		let out_attackers = attackers.intersection(lab["out"]);
		return out_attackers.same(attackers);
	},

	// An out-labelled arg is said to be legally out iff it has at least one
	// attacker that is labelled in.
	isLegallyOut: function(arg, lab) {
		let attackers = arg.incomers().sources();
		let in_attackers = attackers.intersection(lab["in"]);
		return in_attackers.length >= 1;
	},

	// Return true if the given labelling is shown. Otherwise, return false.
	isLabellingShown: function(lab) {
		return shown_labelling.indexOf(lab) !== -1;
	},

	// Show the given labelling.
	showLabelling: function(lab) {
			lab["in"].addClass("in");
			lab["out"].addClass("out");
			lab["undec"].addClass("undec");
			shown_labelling.push(lab);
	},

	// Hide the given labelling.
	hideLabelling: function(lab) {
		let idx = shown_labelling.indexOf(lab);
		if (idx !== -1) {
			shown_labelling = shown_labelling.splice(idx, idx);

			let lab_args = lab["in"].union(lab["out"]).union(lab["undec"]);
			lab_args.removeClass("in out undec");
		}
	},

	// Return true if the min-max numbering for the given labelling is shown.
	// Otherwise, return false.
	isMinMaxShown: function(minmax) {
		return shown_minmax.indexOf(minmax) !== -1;
	},

	// Show the min-max numbering for the given labelling.
	showMinMax: function(minmax) {
		if (this.isMinMaxShown(minmax)) { return false };

		minmax["args"].forEach((arg, i) => {
			arg.data("min_max_numbering", minmax["values"][i]);
		});

		minmax["args"].addClass("minmax");

		shown_minmax.push(minmax);

		return true;
	},

	// Hide the min-max numbering for the given labelling.
	hideMinMax: function(minmax) {
		let idx = shown_minmax.indexOf(minmax);
		if (idx !== -1) {
			shown_minmax = shown_minmax.splice(idx, idx);

			minmax["args"].removeClass("minmax");
			minmax["args"].removeData("min_max_numbering");
		}
	},

	// Attach our labelling functionality to a Cytoscape instance.
	parseCytoscapeInstance: function(cy) {
		cy.on("add remove", (evt) => {
			shown_labelling.forEach((lab) => {
				if (lab["in"].cy() === evt.cy) {
					this.hideLabelling(lab);
				};
			});

			shown_minmax.forEach((minmax) => {
				if (minmax["args"] && minmax["args"].cy() === evt.cy) {
					this.hideMinMax(minmax);
				};
			});
		});
		return cy;
	}
}

module.exports = labelling;