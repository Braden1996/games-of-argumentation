let discuss = require("../discuss.js");

function update_dom(cy) {
	if(cy.game_play_possible) {
		$("[data-playgame='ifcanplay']").show();
		if(cy.game_play_preparing) {
			$("[data-playgame='ifpreparing']").show();
		} else {
			$("[data-playgame='ifpreparing']").hide();
		}
	} else {
		$("[data-playgame='ifcanplay']").hide();
		$("[data-playgame='ifpreparing']").hide();
	}
}

function start_game(cy) {
	cy.game_play_playing = true;
	cy.game_play_preparing = true;

	cy.trigger("playgameToggle", cy.game_play_playing);
}

function end_game(cy, end_game_callback) {
	cy.game_play_playing = false;
	cy.game_play_preparing = false;

	end_game_callback(cy);

	if(!$("[data-playgame='start']").hasClass("m-button--switch__li--active")){
		$("[data-playgame='start']").closest(".m-button--switch").click();
	}

	cy.trigger("playgameToggle", cy.game_play_playing);
}

function parse_cytoscape_instance(cy, move_callback, end_game_callback) {
	update_dom(cy); // Inital update

	cy.on("graphSet", (evt) => {
		cy.game_play_possible = true;

		if(cy.game_play_playing) {
			end_game(cy, end_game_callback)
		} else {
			update_dom(cy);
		}
	});

	cy.on("tap", "node", (evt) => {
		if(evt.cy.game_play_playing) {
			if(evt.cy.game_play_preparing) {
				evt.cy.game_play_preparing = false;
				update_dom(evt.cy);
			}

			let is_proponent = $("[data-playgame='proponent']").hasClass("m-button--switch__li--active");
			let valid = move_callback(evt.cyTarget, is_proponent);

			if (!valid) {
				alert("Invalid move!");
			}
		}
	});

	$("[data-playgame='start']").on("m-button-switched", (evt, is_on) => {
		if(is_on) {
			end_game(cy, end_game_callback);
		} else {
			start_game(cy);
		}
	});

	cy.on("playgameToggle", (evt, is_playing) => {
		discuss.clear_discuss(evt.cy);
		update_dom(evt.cy);
	});

	return cy;
}

module.exports = {
	"update_dom": update_dom,
	"start_game": start_game,
	"end_game": end_game,
	"parse_cytoscape_instance": parse_cytoscape_instance
}