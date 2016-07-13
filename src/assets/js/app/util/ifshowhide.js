function ifShowHide(data_attribute, value, show=true) {
	let ele = $("[" + data_attribute + "='" + value + "']");
	let not_ele = $("[" + data_attribute + "='!" + value + "']");

	if (show) {
		ele.show();
		not_ele.hide();
	} else {
		ele.hide();
		not_ele.show();
	}
}

module.exports = ifShowHide;