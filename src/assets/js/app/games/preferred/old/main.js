let cyto_helpers = require("../../util/cytoscape-helpers.js");

let rules = require("./rules.js");
let strategy = require("./strategy.js");
let view = require("./view.js");

// Save a little bit of screen space.
let MOVES = rules.MOVES;
let getMoveClass = rules.getMoveClass;
let ROUND_STATES = rules.ROUND_STATES;
let TERMINATE_STATES = rules.TERMINATE_STATES;

// Strategically identify and play the best move possible for the player
// indicated by the boolean value 'is_socrates'.
function strategyMove(node_stack, is_socrates) {
	if (node_stack.length > 0) {
		let move_obj = strategy.getStrategyMove(node_stack, is_socrates);

		console.log("STRATEGY:", move_obj);

		let move_valid = move(move_obj["move"], move_obj["arg"]);
		return {"move": move_obj["move"], "node": move_obj["arg"], "valid": move_valid, "is_socrates": is_socrates};
	}

	return undefined;
}

// Determine the move to make, given a particular node and a
// boolean indicating if the proposer of the move is Socrates.
function easyMove(node, is_socrates) {
	let the_move = undefined;
	if (is_socrates) {
		the_move = MOVES["OUT"];
	} else {
		the_move = MOVES["IN"];
	}

	let move_valid = move(the_move, node);
	return {"move": the_move, "node": node, "valid": move_valid, "is_socrates": is_socrates};
}

// Attempt to make the given move on the given node.
function specificMove(the_move, node, is_socrates) {
	let move_valid = move(the_move, node);
	return {"move": the_move, "node": node, "valid": move_valid, "is_socrates": is_socrates};
}

function autoMove(node, is_socrates) {
	let cy = cyto_helpers.getCy(node);
	let node_stack = cy.app_data.preferred["node_stack"];
	let move_stack = cy.app_data.preferred["move_stack"];

	// Check if new game.
	if (node_stack.length === 0) {
		return easyMove(node, false);
	} else {
		if (rules.isSocratesTurn(move_stack) === is_socrates) {
			return easyMove(node, is_socrates);
		} else {
			return strategyMove(node_stack, !is_socrates);
		}
	}
}

// Perform the given move on the given node.
// This function does not check if the move is valid.
function makeMove(the_move, node) {
	let cy = cyto_helpers.getCy(node);
	let move_stack = cy.app_data.preferred["move_stack"];
	let node_stack = cy.app_data.preferred["node_stack"];

	move_stack.push(the_move);
	node_stack.push(node);
	cy.app_data.preferred["move_stack"] = move_stack;
	cy.app_data.preferred["node_stack"] = node_stack;

	node.addClass(rules.MOVE_CLASSES[the_move]);
}

// Undo the most-recently played move.
function undoLastMove(node_stack) {
	let cy = cyto_helpers.getCy(node_stack);
	let move_stack = cy.app_data.preferred["move_stack"];

	// As all other states are terminating states, 'PLAYING' will
	// ALWAYS be the previous state.
	if (cy.app_data.preferred["state"] !== ROUND_STATES["PLAYING"]) {
		cy.app_data.preferred["state"] = ROUND_STATES["PLAYING"];
	}

	let last_move = move_stack.pop();
	let last_node = node_stack.pop();
	cy.app_data.preferred["move_stack"] = move_stack;
	cy.app_data.preferred["node_stack"] = node_stack;

	if (!rules.hasPlayed(last_node, last_move)) {
		last_node.removeClass(rules.MOVE_CLASSES[last_move]);
	}
}

// Check if the given move is valid. If so, perform the move
// and update the round state.
function move(the_move, node) {
	let cy = cyto_helpers.getCy(node);
	if (rules.isValidMove(the_move, node)) {
		if (cy.app_data.preferred["state"] === ROUND_STATES["PLAYING"]) {
			makeMove(the_move, node);

			let node_stack = cy.app_data.preferred["node_stack"];

			let state_object = rules.getRoundState(node_stack);
			cy.app_data.preferred["state"] = state_object["state"];
			cy.app_data.preferred["terminate_state"] = state_object["terminate_state"];

			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

// Reset all our game's variables.
function resetGame(cy) {
	cy.app_data.preferred["move_stack"] = [];
	cy.app_data.preferred["node_stack"] = [];

	cy.app_data.preferred["state"] = ROUND_STATES["UNKNOWN"];
	cy.app_data.preferred["terminate_state"] = TERMINATE_STATES["UNKNOWN"];
}

// Initiate the game's start variables.
function startGame(cy) {
	resetGame(cy);
	cy.app_data.preferred["state"] = ROUND_STATES["PLAYING"];
}

function parseCytoscapeInstance(cy) {
	cy.app_data.preferred = {};
	cy.app_data.preferred["UNKNOWN_STATE"] = ROUND_STATES["UNKNOWN"];

	resetGame(cy);

	let preferred_exports = {
		"move": specificMove,
		"autoMove": autoMove,
		"strategyMove": strategyMove,
		"undoLastMove": undoLastMove,
		"startGameCallback": startGame
	};

	cy = view.parseCytoscapeInstance(cy, preferred_exports);
	cy = strategy.parseCytoscapeInstance(cy);

	return cy;
}

module.exports = {
	"parseCytoscapeInstance": parseCytoscapeInstance
}