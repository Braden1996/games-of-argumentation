let playgame_site = require("./site/playgame.js");

let playgame_move_enums = {
	"HTB": 0,
	"CB": 1,
	"CONCEDE": 2,
	"RETRACT": 3
}

let playgame_move_class = {
	"HTB": "htb",
	"CB": "cb",
	"CONCEDE": "concede",
	"RETRACT": "retract"
}

function which_move(node, is_proponent) {
	let the_move = undefined;
	if(is_proponent) {
		the_move = playgame_move_enums["HTB"];
	} else if(!is_proponent) {
		if(node.hasClass(playgame_move_class["HTB"])) {
			the_move = playgame_move_enums["CONCEDE"];
		} else if(node.hasClass(playgame_move_class["CB"])) {
			the_move = playgame_move_enums["RETRACT"];
		} else if(!(node.hasClass(playgame_move_class["CONCEDE"]) || node.hasClass(playgame_move_class["RETRACT"]))) {
			the_move = playgame_move_enums["CB"];
		}
	}
	return the_move;
}

function valid_move(the_move, node, move_stack) {
	let last_node = move_stack.slice(-1)[0];

	// If first move, check if HTB
	if(last_node === undefined) {
		return the_move === playgame_move_enums["HTB"];
	} else {
		// Check if the proposed node is also the last_node
		if(node === last_node) {
			if(node.hasClass(playgame_move_class["HTB"])) {  // Check if node is HTB and the_move is CONCEDE
				return the_move === playgame_move_enums["CONCEDE"];
			} else if(node.hasClass(playgame_move_class["CB"])) {  // Check if node is CB and the_move is RETRACT
				return the_move === playgame_move_enums["RETRACT"];
			}
		} else {
			// Check if the proposed node actually attacks the last node
			let edge = node.edgesTo(last_node);
			if(edge.length !== 0) {
				if(the_move === playgame_move_enums["HTB"] && last_node.hasClass(playgame_move_class["CB"])){
					return true;
				} else if(the_move === playgame_move_enums["CB"] && last_node.hasClass(playgame_move_class["HTB"])) {
					return true;
				}
			}
		}
	}

	return false;
}

function make_move(the_move, node, move_stack) {
	if(the_move === playgame_move_enums["HTB"]) {
		node.addClass(playgame_move_class["HTB"]);
	} else if(the_move === playgame_move_enums["CB"]) {
		node.addClass(playgame_move_class["CB"]);
	} else if(the_move === playgame_move_enums["CONCEDE"]) {
		node.removeClass(playgame_move_class["HTB"]);
		node.addClass(playgame_move_class["CONCEDE"]);
	} else if(the_move === playgame_move_enums["RETRACT"]) {
		node.removeClass(playgame_move_class["CB"]);
		node.addClass(playgame_move_class["RETRACT"]);
	}

	let last_node = move_stack.slice(-1)[0];
	if(node === last_node) {
		move_stack.pop();
	} else {
		move_stack.push(node);
	}
}

function check_proponent_win(the_move, node, move_stack) {
	if(the_move === playgame_move_enums["CONCEDE"]) {
		let attackers = node.incomers().sources();
		let available_attackers = attackers.filter((i, ele) => {
			return !(ele.hasClass(playgame_move_class["CB"]) || ele.hasClass(playgame_move_class["RETRACT"]));
		});
		return available_attackers.length > 0;
	}
	return false;
}

function check_opponent_win(the_move, node, move_stack) {
	if(the_move === playgame_move_enums["CB"]) {
		let attackers = node.incomers().sources();
		let available_attackers = attackers.filter((i, ele) => {
			return !(ele.hasClass(playgame_move_class["HTB"]) || ele.hasClass(playgame_move_class["CONCEDE"]));
		});
		return available_attackers.length === 0;
	}
	return false;
}

function move(cy, node, is_proponent) {
	let new_game = cy.playgame_stack === undefined;

	let the_move = undefined;
	if(new_game) {
		cy.playgame_stack = [];
		the_move = playgame_move_enums["HTB"];
	} else {
		the_move = which_move(node, is_proponent);
	}

	if(valid_move(the_move, node, cy.playgame_stack)) {
		make_move(the_move, node, cy.playgame_stack);

		let proponent_win = check_proponent_win(the_move, node, cy.playgame_stack);
		let opponent_win = check_opponent_win(the_move, node, cy.playgame_stack);

		if(proponent_win || opponent_win) {
			if(!(proponent_win == is_proponent)) {
				alert("Proponent Won!");
			} else {
				alert("Opponent Won!");
			}
			playgame_site.end_game(cy, end_game);
		}
	} else {
		alert("Invalid move!");
	}
}

function end_game(cy) {
	cy.playgame_stack = undefined;
	cy.nodes().removeClass("htb cb concede retract");
}

function parse_cytoscape_instance(cy) {
	cy.game_play_possible = false;
	cy.game_play_playing = false;
	cy.game_play_preparing = false;

	cy = playgame_site.parse_cytoscape_instance(cy, move, end_game);

	return cy;
}

module.exports = {
	"parse_cytoscape_instance": parse_cytoscape_instance
}