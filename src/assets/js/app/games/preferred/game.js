let game = require("../base/game.js");

let TERMINATE_STATES = {
	"NONE": -1,  // Game has not terminated
	"UNKNOWN": 0,  // Game has terminated for an unknown reason
	"SM_REPEAT": 1,  // Socrates has repeated Menexenus's move (S wins)
	"MS_REPEAT": 2,  // Menexenus has repeated Socrates's move (S wins)
	"M_NOMOVE": 3,  // Menexenus cannot make a move  (S wins)
	"S_NOMOVE": 4  // Socrates cannot make a move (M wins)
};

let MOVES = {
	"IN": 0,
	"OUT": 1,
};


// Override our base game to provide the functionality required by the
// preferred discussion game.
class PreferredGame extends game.Game {
	constructor(cy, arg_stack=[], move_stack=[]) {
		super(cy, arg_stack, move_stack);

		// Attach our preferred game's enums to our class.
		this._TERMINATE_STATES = TERMINATE_STATES;
		this.MOVES = MOVES;
	}

	// Return the current termination state of the game.
	get terminate_state() {
		let last_move_obj = this.last();
		let last_arg = last_move_obj["arg"];
		let last_move = last_move_obj["move"];

		if (last_move === this.MOVES["OUT"]) {
			// If S uses an argument previously used by M.
			if (this.hasPlayed(last_arg, this.MOVES["IN"])) {
				return this._TERMINATE_STATES["SM_REPEAT"];

			// If M cannot make a move.
			} else if (this.findMoveArgs(this.MOVES["IN"]).empty()) {
				return this._TERMINATE_STATES["M_NOMOVE"];
			}

		} else if (last_move === this.MOVES["IN"]) {
			// If M uses an argument previously used by S.
			if (this.hasPlayed(last_arg, this.MOVES["OUT"])) {
				return this._TERMINATE_STATES["MS_REPEAT"];

			// If S cannot make a move.
			} else  if (this.findMoveArgs(this.MOVES["OUT"]).empty()) {
				return this._TERMINATE_STATES["S_NOMOVE"];
			}
		}

		return this._TERMINATE_STATES["NONE"];
	}

	// Find all the arguments which can be used to play the given move.
	findMoveArgs(the_move) {
		// Find the arguments that can be used to play the IN move.
		//	As we know an IN move must attack the directly preceding OUT move, we
		//	only need to check the attackers of said OUT move. If no moves have yet
		//	been played, we can play any argument.
		if (the_move === this.MOVES["IN"]) {
			if (this.move_count === 0) {
				return this.cy.collection().absoluteComplement();
			} else {
				return this.getArgsMoved(MOVES["OUT"]).last()
					.incomers().sources();
			}

		// Find the nodes that can be used to play the OUT move.
		//	As we know an OUT move must attack any preceding IN move, we only need
		// 	to check the attackers of those IN moves. Also, no OUT move can be
		//	repeated.
		} else if (the_move === this.MOVES["OUT"]) {
			return this.getArgsMoved(MOVES["IN"])
				.incomers().sources()
				.filter((i, arg) => this.isValidMove(arg, MOVES["OUT"]));
		}

		return undefined;
	}

	// Return true if the move is valid. Otherwise, return false.
	isValidMove(arg, the_move) {
		let basic = super.isValidMove(arg, the_move);  // Perform basic checks.

		if (basic) {
			// An IN move is valid when:
			//	- No previous moves have been played.
			//	- Attacks the directly preceding OUT move.
			if (the_move === this.MOVES["IN"]) {
				return this.move_count === 0 ||
					arg.edgesTo(
						this.getArgsMoved(this.MOVES["OUT"])
						.last()
					).nonempty();

			// An OUT move is valid when:
			//	- Not yet been played.
			//	- Attacks any preceding IN move.
			} else if (the_move === this.MOVES["OUT"]) {
				return !this.hasPlayed(arg, the_move) &&
					this.getArgsMoved(this.MOVES["IN"])
					.filter((i, in_arg) => arg.edgesTo(in_arg).nonempty())
					.nonempty();
			}
		}

		return false;
	}

	// Return true if 'Socrates' is expected to play the next move.
	// This is the case when:
	//	- The directly preceding move was 'IN'.
	isSocratesTurn() {
		return this.last()["move"] === this.MOVES["IN"];
	}
}

module.exports = {
	"TERMINATE_STATES": TERMINATE_STATES,
	"MOVES": MOVES,
	"Game": PreferredGame
};