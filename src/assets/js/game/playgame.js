let rules = require("./logic/rules.js");
let playgame_site = require("./site/playgame.js");

// Save a little bit of screenspace...
let MOVES = rules.MOVES;
let getMoveClass = rules.getMoveClass;
let ROUND_STATES = rules.ROUND_STATES;

// We need our own 'min' function as Cytoscape JS internally uses 'Infinity',
// which doesn't work as our 'undec' nodes have a 'min_max_numbering' of 'Infinity'.
function getMinNode(nodes) {
	if (nodes.length === 0) {
		return undefined;
	} else {
		let last_node = nodes[0];
		for(let i = 1; i < nodes.length; i++ ){
			var node = nodes[i];
			if (node.data("min_max_numbering") < last_node.data("min_max_numbering")) {
				last_node = node;
			}
		}
		return last_node
	}
}

// Use the min-max numbering to intelligently determine the next move.
function strategyMove(move_stack, is_proponent) {
	if (move_stack.length > 0) {
		let the_move = undefined;
		let node = undefined;

		if (is_proponent) {
			let htb_nodes = rules.findMoveNodes(MOVES["HTB"], move_stack);
			console.log("HTB:", htb_nodes);
			if (htb_nodes.nonempty()) {
				the_move = MOVES["HTB"];
				node = getMinNode(htb_nodes);
			}
		} else {
			let last_node = move_stack.slice(-1)[0];
			
			// As we can only perform a CB move if no CONCEDE, or RETRACT,
			// move is possible; we check it last.
			let concede_nodes = rules.findMoveNodes(MOVES["CONCEDE"], move_stack);
			if (concede_nodes.nonempty()) {
				the_move = MOVES["CONCEDE"];
				node = getMinNode(concede_nodes);
			} else {
				let retract_nodes = rules.findMoveNodes(MOVES["RETRACT"], move_stack);
				if (retract_nodes.nonempty()) {
					the_move = MOVES["RETRACT"];
					node = getMinNode(retract_nodes);
				} else {
					let cb_nodes = rules.findMoveNodes(MOVES["CB"], move_stack);
						console.log("Shoper");
					if (cb_nodes.nonempty()) {
						console.log("Pooper", cb_nodes, cb_nodes[0].id());
						the_move = MOVES["CB"];
						node = getMinNode(cb_nodes);
						console.log(cb_nodes.min((ele, i, eles) => ele.data("min_max_numbering")));
					}
				}
			}
		}

		console.log(the_move, node);

		let move_valid = move(the_move, node);
		return {"move": the_move, "node": node, "valid": move_valid, "is_proponent": is_proponent};
	}

	return undefined;
}

// Determine the move to make, given a particular node and a
// boolean indicating if the proposer of the move is the
// proponent.
function easyMove(node, is_proponent) {
	let the_move = undefined;
	if (is_proponent) {
		the_move = MOVES["HTB"];
	} else {
		if (rules.hasPlayed(node, MOVES["HTB"])) {
			the_move = MOVES["CONCEDE"];
		} else if (rules.hasPlayed(node, MOVES["CB"])) {
			the_move = MOVES["RETRACT"];
		} else if (!(rules.hasPlayed(node, MOVES["CONCEDE"]) || rules.hasPlayed(node, MOVES["RETRACT"]))) {
			the_move = MOVES["CB"];
		}
	}

	let move_valid = move(the_move, node);
	return {"move": the_move, "node": node, "valid": move_valid, "is_proponent": is_proponent};
}

// Attempt to make the given move on the given node.
function specifcMove(the_move, node, is_proponent) {
	let move_valid = move(the_move, node);
	return {"move": the_move, "node": node, "valid": move_valid, "is_proponent": is_proponent};
}

function autoMove(node, is_proponent) {
	let move_stack = node.cy().game_play_stack;

	// Check if new game.
	if (move_stack.length === 0) {
		return easyMove(node, true);
	} else {
		if (rules.isProponentsTurn(move_stack) === is_proponent) {
			return easyMove(node, is_proponent);
		} else {
			return strategyMove(move_stack, !is_proponent);
		}
	}
}

// Perform the given move on the given node.
// This function does not check if the move is valid.
function makeMove(the_move, node) {
	let cy = node.cy();
	let move_stack = cy.game_play_stack;

	if(the_move === MOVES["HTB"]) {
		node.addClass(getMoveClass("HTB"));

	} else if(the_move === MOVES["CB"]) {
		node.addClass(getMoveClass("CB"));

	} else if(the_move === MOVES["CONCEDE"]) {
		node.removeClass(getMoveClass("HTB"));
		node.addClass(getMoveClass("CONCEDE"));

	} else if(the_move === MOVES["RETRACT"]) {
		node.removeClass(getMoveClass("CB"));
		node.addClass(getMoveClass("RETRACT"));
	}

	let last_node = move_stack.slice(-1)[0];
	if(node !== last_node) {
		move_stack.push(node);
		cy.game_play_stack = move_stack;
	}
}

// Check if the given move is valid. If so, perform the move
// and update the round state.
function move(the_move, node) {
	if (rules.isValidMove(the_move, node)) {
		makeMove(the_move, node);

		let cy = node.cy();
		let move_stack = cy.game_play_stack;
		cy.game_play_state = rules.getRoundState(move_stack);

		return true;
	} else {
		return false;
	}
}

// Initiate the game's start variables.
function startGame(cy) {
	cy.game_play_playing = true;
	cy.game_play_preparing = true;

	cy.game_play_stack = [];
	cy.game_play_state = ROUND_STATES["PLAYING"];  // Current round state
}

// Reset the game's start variables.
function endGame(cy) {
	cy.game_play_playing = false;
	cy.game_play_preparing = false;

	Object.keys(rules.MOVE_CLASSES).forEach((key) => {
		cy.nodes().removeClass(rules.MOVE_CLASSES[key]);
	});
}

function parse_cytoscape_instance(cy) {
	endGame(cy);

	let playgame_exports = {
		"move": specifcMove,
		"autoMove": autoMove,
		"strategyMove": strategyMove,
		"startGameCallback": startGame,
		"endGameCallback": endGame
	}

	cy = playgame_site.parse_cytoscape_instance(cy, playgame_exports);

	return cy;
}

module.exports = {
	"parse_cytoscape_instance": parse_cytoscape_instance
}