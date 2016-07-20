let rules = require("./rules.js");
let view = require("./view.js");

let ROUND_STATES = rules.ROUND_STATES;

// Attempt to make the given move on the given node.
function specificMove(the_move, node, is_socrates) {
	let move_valid = move(the_move, node);
	return {"move": the_move, "node": node, "valid": move_valid, "is_socrates": is_socrates};
}

function move(the_move, node) {
	return true;
}

// Initiate the game's start variables.
function startGame(cy) {
	cy.app_data.socratic["move_stack"] = [];
	cy.app_data.socratic["node_stack"] = [];

	cy.app_data.socratic["state"] = ROUND_STATES["PLAYING"];
}

// Reset the game's start variables.
function endGame(cy) {
	cy.app_data.socratic["state"] = ROUND_STATES["UNKNOWN"];
}

function parseCytoscapeInstance(cy) {
	cy.app_data.socratic = {};
	cy.app_data.socratic["UNKNOWN_STATE"] = ROUND_STATES["UNKNOWN"];

	startGame(cy);
	endGame(cy);

	let socratic_exports = {
		"move": specificMove,
		"startGameCallback": startGame,
		"endGameCallback": endGame
	};

	cy = view.parseCytoscapeInstance(cy, socratic_exports);

	return cy;
}

module.exports = {
	"parseCytoscapeInstance": parseCytoscapeInstance
}