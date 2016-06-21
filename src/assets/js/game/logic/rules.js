let MOVES = {
	"HTB":     0,
	"CB":      1,
	"CONCEDE": 2,
	"RETRACT": 3
}

let MOVE_CLASSES = {}
MOVE_CLASSES[MOVES["HTB"]]     = "htb";
MOVE_CLASSES[MOVES["CB"]]      = "cb";
MOVE_CLASSES[MOVES["CONCEDE"]] = "concede";
MOVE_CLASSES[MOVES["RETRACT"]] = "retract";

function move_class(move) {
	return MOVE_CLASSES[MOVES[move]];
}

function has_played(node, move) {
	return node.hasClass(MOVE_CLASSES[move]);
}

function attacks(attacker, victim) {
	return attacker.edgesTo(victim).length > 0;
}

// Can HTB be played?
// 	- Preceding move was CB(B), where A attacks B.
//	- No CONCEDE or RETRACT move is applicable.
function can_htb(node, move_stack) {
	let last_node = move_stack.slice(-1)[0];
	if (last_node === undefined) {
		return true;
	} else {
		return (has_played(last_node, MOVES["CB"]) && attacks(node, last_node)) &&
			!(can_concede(node, move_stack) || can_retract(node, move_stack));
	}

	return false;
}

// Can CB be played?
// 	- A is an attacker of the last HTB(B) statement, that has not yet been encoded.
//	- No CONCEDE or RETRACT move is applicable.
function can_cb(node, move_stack) {
	let last_htb = undefined;
	for (let last_node of move_stack) {
		if (has_played(last_node, MOVES["HTB"])) {
			last_htb = last_node;
		}
	}

	if (last_htb !== undefined && attacks(node, last_htb)) {
		return !(can_concede(node, move_stack) || can_retract(node, move_stack));
	}

	return false;
}

// Can CONCEDE be played?
// 	- HTB has been played on node.
// 	- Every attacker of node is RETRACT.
// 	- CONCEDE has not yet been played on node.
function can_concede(node, move_stack) {
	if (has_played(node, MOVES["HTB"]) && !has_played(node, MOVES["CONCEDE"])) {
		let attackers = node.incomers().sources();
		let non_retracted_attackers = attackers.filter((i, ele) => {
			return !has_played(ele, MOVES["RETRACT"]);
		});

		return non_retracted_attackers.length === 0;
	}

	return false;
}

// Can RETRACT be played?
// 	- CB has been played on node.
// 	- Every attacker of node is CONCEDE.
// 	- RETRACT has not yet been played on node.
function can_retract(node, move_stack) {
	if (has_played(node, MOVES["CB"]) && !has_played(node, MOVES["RETRACT"])) {
		let attackers = node.incomers().sources();
		let conceded_attackers = attackers.filter((i, ele) => {
			return has_played(ele, MOVES["CONCEDE"]);
		});

		return conceded_attackers.length > 0;
	}

	return false;
}

// The discussion is terminated iff no next move is possible.
function check_termination(the_move, node, move_stack) {
	if (the_move === MOVES["HTB"]) {
		return false;

	} else if (the_move === MOVES["CB"]) {
		let attackers = node.incomers().sources();
		let available_attackers = attackers.filter((i, ele) => {
			return !(has_played(ele, MOVES["HTB"]) || has_played(ele, MOVES["CONCEDE"]));
		});
		return available_attackers.length === 0;

	} else if (the_move === MOVES["CONCEDE"]) {
		return has_played(move_stack[0], MOVES["CONCEDE"]);

	} else if  (the_move === MOVES["RETRACT"]) {
		return false;
	}
	return false;
}

// The proponent only wins when their initial HTB is CONCEDE.
function check_proponent_win(the_move, node, move_stack) {
	return the_move === MOVES["CONCEDE"] && has_played(move_stack[0], MOVES["CONCEDE"]);
}

module.exports = {
	"MOVES": MOVES,
	"MOVE_CLASSES": MOVE_CLASSES,
	"move_class": move_class,
	"has_played": has_played,
	"attacks": attacks,
	"can_htb": can_htb,
	"can_cb": can_cb,
	"can_concede": can_concede,
	"can_retract": can_retract,
	"check_termination": check_termination,
	"check_proponent_win": check_proponent_win
}