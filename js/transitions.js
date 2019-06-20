$(".hero__nav a").on("click", function (event) {

	event.preventDefault()

	const href = $(this).attr('href')

	window.history.pushState(null, null, href)


	$(".hero__nav a").removeClass("hero__nav-link--active")
	$(".hero__nav a").removeClass("w--current")
	$(this).addClass("hero__nav-link--active")
	$(this).addClass("w--current")


	$.ajax({
		url: href,
		success: function (data) {
			$(".container").fadeOut(250, function () {
				const newPage = $(data).filter("section").html()
        
        $("container").html(newPage)



				$(".container").fadeIn(250)
			})
		}
	})


})