let game = require("../base/game.js");

let TERMINATE_STATES = {
	"NONE": -1,  // Game has not terminated
	"UNKNOWN": 0,  // Game has terminated for an unknown reason.
	"INITIAL_CONCEDED": 1,  // Proponent's initial argument has been CONCEDE
	"HTB/CB_REPEAT": 2,  // HTB/CB repeat has occured
	"CB_EMPTY_ATTACKERS": 3  // No valid attacker for CB argument
};

let MOVES = {
	"HTB": 0,
	"CB": 1,
	"CONCEDE": 2,
	"RETRACT": 3
};


// Override our base game to provide the functionality required by the grounded
// discussion game.
class GroundedGame extends game.Game {
	constructor(createCollection, arg_stack=[], move_stack=[]) {
		super(createCollection, arg_stack, move_stack);

		// Attach our grounded game's enums to our class.
		this._TERMINATE_STATES = TERMINATE_STATES;
		this.MOVES = MOVES;
	}

	// Return the current termination state of the game.
	get terminate_state() {
		let last_move_obj = this.last();
		let last_arg = last_move_obj["arg"];
		let last_move = last_move_obj["move"];

		if (last_move === this.MOVES["HTB"] || last_move === this.MOVES["CB"]) {
			let cb_played = this.hasPlayed(last_arg, this.MOVES["CB"]);
			let htb_played = this.hasPlayed(last_arg, this.MOVES["HTB"]);
			if (htb_played + cb_played > 1) {
				return this._TERMINATE_STATES["HTB/CB_REPEAT"];
			}
		}

		if (last_move === this.MOVES["CB"]) {
			let available_attackers = last_arg.incomers().sources()
				.filter((i, arg) => this.isValidMove(arg, this.MOVES["HTB"]));

			if (available_attackers.empty() &&
				!this.isValidMove(last_arg, this.MOVES["RETRACT"])) {
				return this._TERMINATE_STATES["CB_EMPTY_ATTACKERS"];
			}

		} else if (last_move === this.MOVES["CONCEDE"]) {
			if (last_arg.same(this.first()["arg"])) {
				return this._TERMINATE_STATES["INITIAL_CONCEDED"];
			}
		}

		return this._TERMINATE_STATES["NONE"];
	}

	// Find all the arguments which can be used to play the given move.
	findMoveArgs(the_move) {
		// Find HTB arguments.
		// As we know a HTB move can only be played if the last move was CB,
		// we only need to filter the attackers of said previous CB move.
		if (the_move === this.MOVES["HTB"]) {
			let last_move_obj = this.last();
			let last_move = last_move_obj["move"];
			if (last_move === undefined) {
				return this._createCollection().absoluteComplement();
			} else if (last_move === this.MOVES["CB"]) {
				let last_arg = last_move_obj["arg"];
				return last_arg.incomers().sources()
					.filter((i, arg) => this.isValidMove(arg, this.MOVES["HTB"]));
			} else {
				return this._createCollection()
			}

		// Find CB arguments.
		// As we know a CB move can only be played against the last
		// non-conceded HTB move, we only need to filter the attackers of said
		// previous HTB move.
		} else if (the_move === this.MOVES["CB"]) {
			return this.getArgsMoved(this.MOVES["HTB"])
				.difference(this.getArgsMoved(this.MOVES["CONCEDE"]))
				.last() // Last HTB that hasn't been played CONCEDE
				.incomers().sources()
				.filter((i, arg) => this.isValidMove(arg, this.MOVES["CB"]));

		// Find CONCEDE arguments.
		// As we know a CONCEDE move can only be played against a HTB move,
		// we only need to filter from the existing HTB moves.
		} else if (the_move === this.MOVES["CONCEDE"]) {
			return this.getArgsMoved(this.MOVES["HTB"])
				.filter((i, arg) => this.isValidMove(arg, this.MOVES["CONCEDE"]));

		// Find RETRACT arguments.
		// As we know a RETRACT move can only be played against a CB move,
		// we only need to filter from the existing CB moves.
		} else if (the_move === this.MOVES["RETRACT"]) {
			return this.getArgsMoved(this.MOVES["CB"])
				.filter((i, arg) => this.isValidMove(arg, this.MOVES["RETRACT"]));
		}

		return undefined;
	}

	// Return true if the move is valid. Otherwise, return false.
	isValidMove(arg, the_move) {
		let basic = super.isValidMove(arg, the_move);  // Perform some basic checks.

		if (basic) {
			// Can HTB be played?
			// 	- No move has yet been made.
			//	OR
			// 	- Preceding move was CB(B), where A attacks B.
			//	- No CONCEDE or RETRACT move is applicable.
			if (the_move === this.MOVES["HTB"]) {
				let last_move_obj = this.last();
				let last_arg = last_move_obj["arg"];
				let last_move = last_move_obj["move"];

				return this.move_count === 0 || (
					(last_move === this.MOVES["CB"] &&
						arg.edgesTo(last_arg).nonempty()) &&
					(this.findMoveArgs(this.MOVES["CONCEDE"]).empty() &&
						this.findMoveArgs(this.MOVES["RETRACT"]).empty())
				);

			// Can CB be played?
			// 	- A is an attacker of the last HTB(B) statement,
			//		that has not yet been played CONCEDE.
			//	- B has not yet been played RETRACT.
			//	- No CONCEDE or RETRACT move is applicable.
			} else if (the_move === this.MOVES["CB"]) {
				let last_htb = this.getArgsMoved(this.MOVES["HTB"])
					.difference(this.getArgsMoved(this.MOVES["CONCEDE"]))
					.last();

				return last_htb.nonempty() && (
					arg.edgesTo(last_htb).nonempty() &&
					!this.hasPlayed(arg, this.MOVES["RETRACT"]) &&
					(this.findMoveArgs(this.MOVES["CONCEDE"]).empty() &&
						this.findMoveArgs(this.MOVES["RETRACT"]).empty())
				);

			// Can CONCEDE be played?
			// 	- HTB has been played on arg.
			// 	- Every attacker of arg is RETRACT.
			// 	- CONCEDE has not yet been played on arg.
			} else if (the_move === this.MOVES["CONCEDE"]) {
				if (this.hasPlayed(arg, this.MOVES["HTB"]) &&
					!this.hasPlayed(arg, this.MOVES["CONCEDE"])) {
					let attackers = arg.incomers().sources();

					// Check if all attackers have been RETRACTED.
					return attackers.filter((i, att) => {
							return !this.hasPlayed(att, this.MOVES["RETRACT"])
						})
						.empty();
				}

			// Can RETRACT be played?
			// 	- CB has been played on arg.
			// 	- Any attacker of arg is CONCEDE.
			// 	- RETRACT has not yet been played on arg.
			} else if (the_move === this.MOVES["RETRACT"]) {
				if (this.hasPlayed(arg, this.MOVES["CB"]) &&
					!this.hasPlayed(arg, this.MOVES["RETRACT"])) {

					// Check if any attacker has been CONCEDED.
					return arg.incomers().sources()
						.filter((i, att) => this.hasPlayed(att, this.MOVES["CONCEDE"]))
						.nonempty();
				}
			}
		}

		return false;
	}

	// Return true if the Proponent is expected to play the next move. Otherwise,
	// return false. This is the case when no previous moves have been made or
	// the previous move was a CB.
	isProponentsTurn() {
		return this.move_count === 0 || this.last()["move"] === this.MOVES["CB"];
	}
}

module.exports = {
	"TERMINATE_STATES": TERMINATE_STATES,
	"MOVES": MOVES,
	"Game": GroundedGame
};