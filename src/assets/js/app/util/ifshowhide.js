// This isn't perfect, but it allows us show/hide DOM elements based upon
// arbitrary externally managed conditions.

let show_values = {};

let not_prefix = "!";

function canShow(ele) {
	for (let data_attribute in show_values) {
		let value = $(ele).data(data_attribute);

		if (value) {
			let is_not = false;
			if (value.substring(0, not_prefix.length) === not_prefix) {
				value = value.substring(not_prefix.length);
				is_not = true;
			}

			if (value in show_values[data_attribute]) {
				if (show_values[data_attribute][value] === is_not) {
					return false;
				}
			}
		}
	}

	return true;
}

function ifShowHide(data_attribute, value, show=true) {
	data_attribute = data_attribute.substring("data-".length);

	if(!(data_attribute in show_values)) {
		show_values[data_attribute] = {};
	}

	show_values[data_attribute][value] = show;

	let eles = $("[data-" + data_attribute + "='" + value + "']");
	eles.each((i) => canShow($(eles[i])) ? $(eles[i]).show() : $(eles[i]).hide());

	let not_eles = $("[data-" + data_attribute + "='" + not_prefix + value + "']");
	not_eles.each((i) => canShow($(not_eles[i])) ? $(not_eles[i]).show() : $(not_eles[i]).hide());
}

module.exports = ifShowHide;