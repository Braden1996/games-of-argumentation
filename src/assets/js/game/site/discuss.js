let discuss = require("../discuss.js");
let discuss_log = require("./discuss_log.js");

function parse_cytoscape_instance(cy) {
	cy.on("tap", "node", function (evt) {
		if(evt.cy.play_game === true ) {
			console.log("Start game");
		} else {
			discuss.clear_discuss(evt.cy);
			discuss_log.append_log("Discussing argument '" + evt.cyTarget.id() + "'");
			discuss.discuss(evt.cy, evt.cyTarget);
		}
	});

	return cy;
}

module.exports = {
	"parse_cytoscape_instance": parse_cytoscape_instance
}