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