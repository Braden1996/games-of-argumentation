let cytoscape = require("cytoscape");
let cyto_helpers = require("./cytoscape-helpers.js");
let labelling = require("./labelling.js");


$(document).ready(function() {
	let cy = cytoscape({
		container: $("#l-grapharea__container"),

		boxSelectionEnabled: false,
		autounselectify: true,
	});

	let our_style = cyto_helpers.build_stylesheet();
	cy.style(our_style);

	cy.add(JSON.parse('{"nodes":[{"data":{"id":"a"}},{"data":{"id":"b"}},{"data":{"id":"c"}},{"data":{"id":"d"}},{"data":{"id":"e"}},{"data":{"id":"f"}},{"data":{"id":"g"}},{"data":{"id":"h"}}],"edges":[{"data":{"id":"ab","source":"a","target":"b"}},{"data":{"id":"bc","source":"b","target":"c"}},{"data":{"id":"ce","source":"c","target":"e"}},{"data":{"id":"de","source":"d","target":"e"}},{"data":{"id":"ef","source":"e","target":"f"}},{"data":{"id":"fe","source":"f","target":"e"}},{"data":{"id":"gh","source":"g","target":"h"}},{"data":{"id":"hb","source":"h","target":"b"}},{"data":{"id":"hg","source":"h","target":"g"}}]}'));

	cy.elements().layout({ name: 'grid' });
	
	let lab = labelling.get_labelling(cy);
	labelling.apply_labelling(lab);
});