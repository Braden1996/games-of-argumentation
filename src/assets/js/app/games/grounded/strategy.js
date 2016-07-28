// Given a collection of arguments, return the argument with the lowest min-max
// numbering.
// Sadly, we cannot use Cytoscape JS's 'eles.min()' function as it internally
// uses 'Infinity' - which conflicts with the 'min_max_numbering' of our 'undec'
// arguments.
function getMinMaxArg(args, max=false) {
	let arg;
	args.forEach((a) => {
		if (arg === undefined || (
			(max && a.data("min_max_numbering") > arg.data("min_max_numbering")) &&
			(!max && a.data("min_max_numbering") < arg.data("min_max_numbering")))) {
			arg = a;
		}
	});
	return arg;
}

// Strategically identify and play the best move possible proposed by the
// player indicated by the boolean value 'is_proponent'.
// This strategy makes use of our pre-calculated 'min_max_numbering'.
function getStrategicMove(game, is_proponent) {
	// Save some screen real-estate
	let MOVES = game.MOVES;

	let the_move, arg;

	if (is_proponent) {
		let htb_args = game.findMoveArgs(MOVES["HTB"]);
		if (htb_args.nonempty()) {
			the_move = MOVES["HTB"];
			arg = getMinMaxArg(htb_args);
		}
	} else {
		// As we can only perform a CB move if no CONCEDE, or RETRACT,
		// move is possible; we check it last.
		let concede_args = game.findMoveArgs(MOVES["CONCEDE"]);
		if (concede_args.nonempty()) {
			the_move = MOVES["CONCEDE"];
			arg = getMinMaxArg(concede_args, true);
		} else {
			let retract_args = game.findMoveArgs(MOVES["RETRACT"]);
			if (retract_args.nonempty()) {
				the_move = MOVES["RETRACT"];
				arg = getMinMaxArg(retract_args, true);
			} else {
				let cb_args = game.findMoveArgs(MOVES["CB"]);
				if (cb_args.nonempty()) {
					the_move = MOVES["CB"];

					// Check first if there exists a move with no HTB attackers.
					cb_args.forEach((maybe_cb) => {
						if (maybe_cb.incomers().sources()
							.filter((i, att) => game.isValidMove(att, MOVES["HTB"])).empty()
						) {
							arg = maybe_cb;
							return false;
						}
					});

					if (arg === undefined) {
						arg = getMinMaxArg(cb_args, true);
					}
				}
			}
		}
	}

	return {"arg": arg, "move": the_move};
}

module.exports = getStrategicMove;