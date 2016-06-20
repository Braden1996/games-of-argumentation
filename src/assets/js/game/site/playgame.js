function parse_cytoscape_instance(cy) {
	cy.game_play_possible = false;
	cy.game_play_playing = false;
	cy.game_play_preparing = false;

	function update_dom() {
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
	update_dom(); // Inital update

	$("[data-playgame='start']").on("m-button-switched", (event, is_on) => {
		cy.game_play_playing = !is_on;
		cy.game_play_preparing = cy.game_play_playing;
		update_dom();
	});

	cy.on("graphSet", function(evt) {
		cy.game_play_possible = true;
		update_dom();
	});
}

module.exports = {
	"parse_cytoscape_instance": parse_cytoscape_instance
}