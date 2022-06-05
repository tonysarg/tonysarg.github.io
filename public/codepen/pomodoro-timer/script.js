$(document).ready(function () {
// initialize static data
const alarmSound = $("#alarm")[0];
let targetTime = undefined;
let targetDelta = undefined;
let intervalId = undefined;
let reset = true;
let onSession = true;
let mute = false;
let breakLength;

// clock function
function checkCurrentTime(expr, ...rest) {
    document.querySelector("#time").innerHTML = `The time is
    ${new Date().toLocaleTimeString("en-US", {
    hour12: true,
    hour: "2-digit",
    minute: "2-digit"
    })}`;
    setTimeout(function () {
    expr(...rest);
    setInterval(expr, 60000, ...rest);
    }, 60000 - (new Date().getTime() % (60 * 1000)));
}

checkCurrentTime(
    () =>
    (document.querySelector("#time").innerHTML = `The time is
${new Date().toLocaleTimeString("en-US", {
    hour12: true,
    hour: "2-digit",
    minute: "2-digit"
})}`)
);


// main timer setup function
function setupTimerDisplay() {
    let config = {};
    let value = 0;

    if (onSession === true) {
    value = $("#session-knob").val() * 60;
    $("#timer-display").val(value);
    config.max = value;
    config.fgColor = "#81d0b8";
    config.inputColor = "#81d0b8";
    config.format = function (v) {
        let sec = parseInt(v);
        let min = Math.floor(sec / 60);
        sec -= min * 60;
        return min + ":" + (sec < 10 ? "0" + sec : sec);
    };
    } else {
    let max = $("#break-knob").val() * 60;
    config.max = max;
    config.fgColor = "#a33945";
    config.inputColor = "#a33945";
    config.format = function (v) {
        let sec = parseInt(v);
        sec = max - sec;
        let min = Math.floor(sec / 60);
        sec -= min * 60;
        return min + ":" + (sec < 10 ? "0" + sec : sec);
    };
    }

    $("#timer-display").trigger("configure", config);
    $("#timer-display").val(value);
    $("#timer-display").trigger("change");
}

// if knob failed to load, fall back to regular input display
if (jQuery().knob) {
    $("#session-knob").knob({
    min: 0,
    max: 120,
    step: 1,
    width: 100,
    height: 100,
    fgColor: "#81d0b8",
    bgColor: "#333",
    release: function () {
        if (reset) {
        targetDelta = $("#session-knob").val() * 60000;
        setupTimerDisplay();
        }
    }
    });

    $("#break-knob").knob({
    min: 0,
    max: 30,
    step: 1,
    width: 100,
    height: 100,
    fgColor: "#a33945",
    bgColor: "#333"
    });

    $("#timer-display").knob({
    min: 0,
    max: 1500,
    width: 200,
    height: 200,
    rotation: "anticlockwise",
    fgColor: "#57C",
    bgColor: "#222",
    readOnly: true
    });
}

// periodic timer function
function updateTimer() {
    let now = new Date();
    targetDelta = targetTime.getTime() - now.getTime();

    if (targetDelta > 0) {
    let sec = Math.ceil(targetDelta / 1000);
    if (!onSession) sec = breakLength - sec;
    $("#timer-display").val(sec);
    $("#timer-display").trigger("change");
    } else {
    if (onSession) {
        if (!mute) alarmSound.play();
        onSession = false;
        breakLength = $("#break-knob").val() * 60;
        targetDelta = breakLength * 1000;
    } else {
        if (!mute) alarmSound.play();
        onSession = true;
        targetDelta = $("#session-knob").val() * 60000;
    }
    targetTime = new Date(Date.now() + targetDelta);
    setupTimerDisplay();
    }
}

// button click events
$("#cmd-reset").click(function () {
    targetDelta = $("#session-knob").val() * 60000;
    if (intervalId) {
    window.clearInterval(intervalId);
    intervalId = undefined;
    }
    reset = true;
    onSession = true;
    $("#cmd-pause").addClass("hidden");
    $("#cmd-go").removeClass("hidden");
    setupTimerDisplay();
    return false;
});

$("#cmd-go").click(function () {
    targetTime = new Date(Date.now() + targetDelta);
    intervalId = window.setInterval(updateTimer, 200);
    reset = false;
    breakLength = $("#break-knob").val() * 60;
    $("#cmd-go").addClass("hidden");
    $("#cmd-pause").removeClass("hidden");
    return false;
});

$("#cmd-pause").click(function () {
    window.clearInterval(intervalId);
    intervalId = undefined;
    $("#cmd-pause").addClass("hidden");
    $("#cmd-go").removeClass("hidden");
    return false;
});

// mute button click events
$("#cmd-mute").click(function () {
    mute = true;
    $("#cmd-mute").addClass("hidden");
    $("#cmd-unmute").removeClass("hidden");
    return false;
});

$("#cmd-unmute").click(function () {
    mute = false;
    $("#cmd-unmute").addClass("hidden");
    $("#cmd-mute").removeClass("hidden");
    return false;
});

// initialize timer display
targetDelta = $("#session-knob").val() * 60000;
setupTimerDisplay();

// if the audio element is not supported, hide mute button
if (!$("#alarm")[0].play) {
    mute = true;
    $("#cmd-mute").addClass("hidden");
}

// click anywhere to stop alarm sound
document.querySelectorAll("*").forEach((element) =>
    element.addEventListener("click", (e) => {
    alarmSound.pause();
    alarmSound.currentTime = 0;
    })
);
});

const key = "6733562bc4333f87a61b05b7b631f97b";


// get local weather
$(document).ready(function () {
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;


    var api =
        "https://api.openweathermap.org/data/3.0/onecall?lat=" +
        latitude +
        "&lon=" +
        longitude +
        "&appid=" +
        key ;

    $.getJSON(api, function (data) {
        var conversion = data.main.temp * 1.8 + 32;
        var celsius = data.main.temp;
        $("#city").text(data.name);
        $("#status").text(data.weather[0].description);
        $("#temperature")
        .text(Math.round(conversion))
        .append(String.fromCharCode(176) + " Fahrenheit");
        $("#weather-icon").append("<img src=" + data.weather[0].icon + ">");
        var i = 0;
        $("#weather").click(function () {
        if (i === 0) {
            $("#temperature")
            .text(Math.round(celsius))
            .append(String.fromCharCode(176) + " Celsius");
            i++;
        } else {
            if (i === 1) {
            $("#temperature")
                .text(Math.round(conversion))
                .append(String.fromCharCode(176) + " Fahrenheit");
            i--;
            }
        }
        });
    });
    });
}
});
