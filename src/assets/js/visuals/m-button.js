$(".m-button[data-button-target]").click(function() {
	let button = $(this);
	let target_id = button.attr("data-button-target");
	let target = $("[data-button-id='" + target_id + "']");

	if ((!target.length && button.hasClass("m-button--active")) || target.hasClass("m-button__target--active")) {
		button.removeClass("m-button--active");
		target.removeClass("m-button__target--active");
	} else {
		button.addClass("m-button--active");
		target.addClass("m-button__target--active");
	}
});

$(".m-button--switch").click(function() {
	let button = $(this);
	let items = button.children("ul").first().children("li");

	if(items.length > 1) {
		let current_item = button.find(".m-button--switch__icon--active");

		let last_current = false;
		let new_item = null;
		for(let item of items) {
			if(last_current) {
				new_item = $(item);
				break;
			} else {
				last_current = current_item.is(item);
			}
		}

		if(!new_item) {
			new_item = items.first();
		}

		current_item.removeClass("m-button--switch__icon--active");
		current_item.trigger("m-button-switched", false);
		new_item.addClass("m-button--switch__icon--active");
		new_item.trigger("m-button-switched", true);
	}
});