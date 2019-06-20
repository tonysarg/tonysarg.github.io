$(".hero__nav a").on("click", function (event) {

	const href = $(this).attr('href')

	window.history.pushState(null, null, href)

});


$(document).ready(function(){
    $(".work").click(function(){
        $(".main").load("index.html .main1");
    });
});

$(document).ready(function(){
    $(".resume").click(function(){
        $(".main").load("resume.html .main2");
    });
});

$(document).ready(function(){
    $(".about").click(function(){
        $(".main").load("about.html .main3");
    });
});