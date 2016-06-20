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

function parse_cytoscape_instance(cy) {
	update_dom(cy); // Inital update

	cy.on("graphSet", (evt) => {
		cy.game_play_possible = true;
		update_dom(cy);
	});

	cy.on("tap", "node", (evt) => {
		if(evt.cy.game_play_playing) {
			if(cy.game_play_preparing) {
				cy.game_play_preparing = false;
			}
		}
	});

	$("[data-playgame='start']").on("m-button-switched", (event, is_on) => {
		cy.game_play_playing = !is_on;
		cy.game_play_preparing = cy.game_play_playing;

		cy.trigger("playgameToggle", cy.game_play_playing);
	});

	cy.on("playgameToggle", (evt, is_playing) => {
		discuss.clear_discuss(cy);
		update_dom(cy);
	});

	return cy;
}

module.exports = {
	"update_dom": update_dom,
	"parse_cytoscape_instance": parse_cytoscape_instance
}