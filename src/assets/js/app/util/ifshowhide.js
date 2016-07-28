// This isn't perfect, but it allows us show/hide DOM elements based upon
// arbitrary externally managed conditions.
// Modes:
//	- Strong: element will be shown if ALL conditions are true.
//	- Weak: element will be shown if ANY condition is true.

let show_values = {};

let not_prefix = "!";

function canShow(ele) {
	let mode = "strong";
	if (ele.data("ifshowhide-mode") === "weak") {
		mode = "weak";
	}

	for (let data_attribute in show_values) {
		let value = ele.data(data_attribute);

		if (value) {
			let is_not = false;
			if (value.substring(0, not_prefix.length) === not_prefix) {
				value = value.substring(not_prefix.length);
				is_not = true;
			}

			if (value in show_values[data_attribute]) {
				if (ele.hasClass("turd")) {console.log(data_attribute, value, show_values[data_attribute][value], is_not, mode);};
				if (show_values[data_attribute][value] === is_not) {
					if (mode === "strong") {
						return false;
					}
				} else {
					if (mode === "weak") {
						return true;
					}
				}
			}
		}
	}

	if (ele.hasClass("turd")) {console.log("DONE:", show_values, mode === "strong" ? true : false)}

	return mode === "strong" ? true : false;
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