let playgame_site = require("./site/playgame.js");

function parse_cytoscape_instance(cy) {
	cy.game_play_possible = false;
	cy.game_play_playing = false;
	cy.game_play_preparing = false;

	cy = playgame_site.parse_cytoscape_instance(cy);

	return cy;
}

module.exports = {
	"parse_cytoscape_instance": parse_cytoscape_instance
}