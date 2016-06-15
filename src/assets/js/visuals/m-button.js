$(".m-button").click(function() {
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