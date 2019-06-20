$(".hero__nav a").on("click", function (event) {

	event.preventDefault()

	const href = $(this).attr('href')

	window.history.pushState(null, null, href)


	$(".hero__nav a").removeClass("hero__nav-link--active")
	$(".hero__nav a").removeClass("w--current")
	$(this).addClass("hero__nav-link--active")
	$(this).addClass("w--current"
});


$(document).ready(function(){
    $(".work").click(function(){
        $(".main").load("index.html .main");
    });
});

$(document).ready(function(){
    $(".resume").click(function(){
        $(".main").load("resume.html .main");
    });
});

$(document).ready(function(){
    $(".about").click(function(){
        $(".main").load("about.html .main");
    });
});