$(".hero__nav a").on("click", function (event) {

	event.preventDefault()

	const href = $(this).attr('href')

	window.history.pushState(null, null, href)

});


$(document).ready(function(){
    $(".work").click(function(){
        $("html").load("index.html");
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