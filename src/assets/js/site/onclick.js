$("[data-onclick-redirect]").click(function() {
	let redirect_id = $(this).attr("data-onclick-redirect");
	let redirct_ele = $("[data-onclick-id" + "='" + redirect_id + "']");
	redirct_ele.click();
});