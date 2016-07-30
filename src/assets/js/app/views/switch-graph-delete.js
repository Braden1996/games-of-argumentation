let delete_enabled = [];

function tryRemoveElement(evt) {
	let idx = delete_enabled.indexOf(evt.cy);
	if (idx !== -1) {
		evt.cyTarget.remove();
	};
}

function parseCytoscapeInstance(cy) {
	$("[data-switch-graph-delete]").on("m-button-switched", (evt, is_on) => {
		if (is_on) {
			delete_enabled.push(cy);
		} else {
			let idx = delete_enabled.indexOf(cy);
			if (idx !== -1) {
				delete_enabled = delete_enabled.splice(idx, idx);
			};
		};
	});

	cy.on("tap", "node, edge", tryRemoveElement);

	return cy;
}

module.exports = {
	"parseCytoscapeInstance": parseCytoscapeInstance
}