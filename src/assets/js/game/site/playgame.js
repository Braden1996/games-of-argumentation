function parse_cytoscape_instance(cy) {
	if(cy.play_game === undefined) {
		cy.play_game = false;
	}

	function update_dom() {
		if(cy.play_game === true) {
			$("[data-playgame-ifon]").show();
			$("[data-playgame-ifoff]").hide();
		} else {
			$("[data-playgame-ifon]").hide();
			$("[data-playgame-ifoff]").show();
		}
	}
	update_dom(); // Inital update

	$("[data-playgame]").click(function() {
		cy.play_game = !cy.play_game;
		update_dom();
	});
}

module.exports = {
	"parse_cytoscape_instance": parse_cytoscape_instance
}