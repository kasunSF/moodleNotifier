//JavaScript for navigate menu in options page
function showContent(event) {
    $('.content').each(function (index) {
        if (!($(this).hasClass('invisible')))
            $(this).addClass('invisible');

        if (index == event.target.id)
            $(this).removeClass('invisible');
    });

    $('ul.menu > li > a').each(function (index) {
        $(this).removeClass('active');

        if (index == event.target.id)
            $(this).addClass('active');
    });
}

//JavaScript for set default menu in options page
function defaultView(contentId) {
    $('.content').each(function (index) {
        if (index == contentId)
            $(this).removeClass('invisible');
    });
}

//JavaScript to save configuration data of options page
function saveConfigData() {
    var moodle_url = document.getElementById('url').value;
    var poll_interval = document.getElementById('poll').value;
    var mute = document.getElementById('mute').checked;
    var alert_sound = document.getElementById('alert').value;
    var popup = document.getElementById('popup').checked;
    var popup_time = document.getElementById('popup_timeout').value;
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var remember = document.getElementById('remember').checked;

    localStorage["moodle_url"] = moodle_url;
    localStorage["poll_interval"] = poll_interval;
    localStorage["mute"] = mute;
    localStorage["alert_sound"] = alert_sound;
    localStorage["popup"] = popup;
    localStorage["popup_time"] = popup_time;
    localStorage["username"] = username;
    localStorage["password"] = password;
    localStorage["remember"] = remember;

    console.log("Preferences are saved!");

    console.log("url: "+localStorage["moodle_url"]);
    console.log("intrvl: "+localStorage["poll_interval"]);
    console.log("mute: "+localStorage["mute"]);
    console.log("alert: "+localStorage["alert_sound"]);
    console.log("popup: "+localStorage["popup"]);
    console.log("time: "+localStorage["popup_time"]);
    console.log("un: "+localStorage["username"]);
    console.log("pw: "+localStorage["password"]);
    console.log("remember: "+localStorage["remember"]);

}
//JavaScript to load configuration data to options page
function loadConfigData() {
    if (localStorage["notFirstRun"] != "true") {
        localStorage["notFirstRun"] = "true";
        console.log("First run");	
    }
    else{
        document.getElementById('url').value = localStorage["moodle_url"];
        document.getElementById('poll').value = localStorage["poll_interval"];
        document.getElementById('mute').checked = localStorage["mute"];
        document.getElementById('alert').value = localStorage["alert_sound"];
        document.getElementById('popup').checked = localStorage["popup"];
        document.getElementById('popup_timeout').value = localStorage["popup_time"];
        document.getElementById('username').value = localStorage["username"];
        document.getElementById('password').value = localStorage["password"];
        document.getElementById('remember').checked = localStorage["remember"];

        console.log("Preferences are loaded!");	
    }
}

//Event listener
document.addEventListener('DOMContentLoaded', function () {
    var menu = document.querySelectorAll('li');//Get menu list
    var save_button = document.getElementById('submit');
    var play_button = document.getElementById('play');

    for (var i = 0; i < menu.length; ++i) {
        menu[i].addEventListener('click', showContent);//Add event listener to the menu
    }
    save_button.addEventListener('click', saveConfigData);//Add event listener to save button
    play_button.addEventListener('click', playAlert);//Add event listener to play alerts

    defaultView(0);//Set default view of the menu: "General settings"
    loadConfigData();
});




function playAlert() {
    var source;
    source = "sounds/"+document.getElementById("alert").value;//Direct to the location of sound file

    try {
        var audioElement = new Audio();
        audioElement.src = source;
        audioElement.play();
    } catch (e) {
        console.error(e);
    }
}