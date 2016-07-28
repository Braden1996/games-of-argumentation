// Basic winning strategy algorithm is complete.
// However, it seems to end up in an infinite (recursive) loop.
// I believe this is due to the fact we are playing the 'trial',
// but out 'rules.IsValidMove' function is not taking this into account.
// Essentially, this results in Socrates being able to repeat their moves.
// To combat this, it is probably best to refactor the entire game architecture
// so that it is decoupled from our Cytoscape's 'app_data' game storage.

let cyto_helpers = require("../../util/cytoscape-helpers.js");
let rules = require("./rules.js");

let MOVES = rules.MOVES;

// A winning strategy for Menexenus which suggests the move that should be
// played next, given Socrates' most-recently played argument.
// 	This function works by filtering out all the possible moves for Menexenus
// 	that do not lead to a winning strategy against the given 'out_argument'.
//	We do this by:
//		1). Filter out the moves that can't even be played IN.
//		2). Filter out the moves which have attackers that Socrates can then
//			play OUT which we are unable to counter.
function getWinningStrategyM(out_argument) {
	return out_argument.incomers().sources()
		.filter((i, arg) => rules.isValidMove(MOVES["IN"], arg))
		.filter((i, arg) => arg.incomers().sources()
			.filter((i, arg) => rules.isValidMove(MOVES["OUT"], arg))
			.filter((i, arg) => getWinningStrategyM(arg).nonempty())
			.empty()
		);
}

// Strategically identify the best move possible for the player indicated by
// the boolean parameter 'is_socrates'.
function getStrategyMove(node_stack, is_socrates) {
	if (node_stack.length > 0) {
		let the_move = undefined;
		let node = undefined;

		let last_arg = node_stack.slice(-1)[0];

		if (is_socrates) {

		} else {
			the_move = MOVES["IN"];
			let winning_args = getWinningStrategyM(last_arg);

			// Pick an arbitrary winning node. If none exist, pick an arbitrary
			// loosing node.
			if (winning_args.empty()) {
				node = last_arg.incomers().sources().first();
			} else {
				node = winning_args.first();
			}
		}

		return {"move": the_move, "arg": node};
	}

	return undefined;
}

function parseCytoscapeInstance(cy) {
	cy.app_data.preferred.strategy = {};

	// To avoid us from having to recalculate a sub-tree after each move, we
	// keep a cache of each node's children.
	cy.app_data.preferred.strategy["root_tree"] = undefined;

	// When the graph is modified, the integrity of our cache becomes damaged.
	// Ideally, we should perform a scan on our cache and repair accordingly.
	// However, we just perform a full recalculation as it shouldn't result in
	// too much of a performance hit and is a lot easier to develop.
	cy.on("add remove", (evt) => {
		// TO BE COMPLETED
	});

	return cy;
}

module.exports = {

	"getStrategyMove": getStrategyMove,
	"parseCytoscapeInstance": parseCytoscapeInstance
}