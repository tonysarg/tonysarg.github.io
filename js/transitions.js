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
			$(".main").fadeOut(250, function () {
				const newPage = $(data).filter(".main").html()
        
        		$(".main").html(newPage)



				$(".main").fadeIn(250)
			})
		}
	})


})