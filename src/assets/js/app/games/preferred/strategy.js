//let discuss = require("../discuss/main.js");
let preferred_game = require("./game.js");

// Save some screen real-estate
let MOVES = preferred_game.MOVES;
let TERMINATE_STATES = preferred_game.TERMINATE_STATES;


// A winning strategy for Menexenus which suggests the move that should be
// played next, given Socrates' most-recently played argument.
// 	This function works by filtering out all the possible moves for Menexenus
// 	that do not lead to a winning strategy against the given 'out_argument'.
//	We do this by:
//		1). Filter out the moves that can't even be played IN.
//		2). Filter out the moves which have attackers that Socrates can then
//			play OUT which we are unable to counter.
function getWinningStrategyM(game, out_argument) {
	if (game.hasTerminated() &&
		game.terminate_state !== TERMINATE_STATES["S_NOMOVE"]) {
		return game._createCollection();
	} else {
		return out_argument.incomers().sources()
			.filter((i, a) => game.isValidMove(a, MOVES["IN"]))
			.filter((i, a) => {
				let trial_game = game.copy();
				trial_game.move(a, MOVES["IN"]);

				let out_moves = trial_game.findMoveArgs(MOVES["OUT"]);
				return out_moves.empty() || out_moves.filter((i, a2) => {
						let trial_game2 = trial_game.copy();
						trial_game2.move(a2, MOVES["OUT"]);
						return getWinningStrategyM(trial_game2, a2)
							.nonempty();
					}).nonempty();
			});
	};
};

// Strategically identify the best move possible for the player indicated by
// the boolean parameter 'is_socrates'.
function getStrategicMove(game, is_socrates) {
	let the_move, arg;

	if (is_socrates) {
		the_move = game.MOVES["OUT"];
		arg = game.findMoveArgs(game.MOVES["OUT"]).first();
	} else {
		let last_arg = game.last()["arg"];
		let args = getWinningStrategyM(game, last_arg);

		the_move = game.MOVES["IN"];
		arg = (args.empty() ? last_arg.incomers().sources() : args).first();
	}

	return {"move": the_move, "arg": arg};
}

module.exports = getStrategicMove;