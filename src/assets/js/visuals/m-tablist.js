$(".m-tablist__navlist > li").click(function() {
	let tab_id = $(this).attr("data-tablist-id");
	let tablist = $(this).closest(".m-tablist");

	let old_tab = tablist.find(".m-tablist__navlist--active").first();
	let old_pane = tablist.find(".m-tablist__panelist--active").first();

	if (old_tab.attr("data-tablist-id") != tab_id) {
		old_tab.removeClass("m-tablist__navlist--active");
		old_pane.removeClass("m-tablist__panelist--active");

		let panelist = tablist.find(".m-tablist__panelist").first();
		let pane = panelist.find("> [data-tablist-id='" + tab_id + "']").first();

		$(this).addClass("m-tablist__navlist--active");
		pane.addClass("m-tablist__panelist--active");
	}
});