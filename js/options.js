/*
 This function called when option page is loaded.
 Purpose: Add event listnets to navigate through menus, load, save and preview user preferences.
 */
document.addEventListener('DOMContentLoaded', function () {
    var menu = document.querySelectorAll('li');//Get menu list
    var save_button = document.getElementById('submit');//Save button
    var play_button = document.getElementById('play');//Alert previewe button

    for (var i = 0; i < menu.length; ++i) {
        menu[i].addEventListener('click', showContent);//Add event listener to the menu
    }
    save_button.addEventListener('click', saveConfigData);//Add event listener to save button
    play_button.addEventListener('click', playAlert);//Add event listener to play alerts

    defaultView(0);//Set default view of the menu: "General settings"
    loadConfigData();
});

/*
 JavaScript for navigate menu in options page.
 */
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

/*
 JavaScript for set default menu in options page
 */
function defaultView(contentId) {
    $('.content').each(function (index) {
        if (index == contentId)
            $(this).removeClass('invisible');
    });
}

/*
 JavaScript to save configuration data of options page
 */
function saveConfigData() {
    /*
     Get input values by element IDs of the option page
     */
    var moodle_url = document.getElementById('url').value;
    var poll_interval = document.getElementById('poll').value;
    var mute = document.getElementById('mute').checked;
    var alert_sound = document.getElementById('alert').value;
    var popup = document.getElementById('popup').checked;
    var popup_time = document.getElementById('popup_timeout').value;
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var remember = document.getElementById('remember').checked;

    /*
     Save user preferences to local storage.
     */
    try {
        localStorage["moodle_url"] = moodle_url;
        localStorage["poll_interval"] = poll_interval;
        localStorage["mute"] = mute;
        localStorage["alert_sound"] = alert_sound;
        localStorage["popup"] = popup;
        localStorage["popup_time"] = popup_time;
        localStorage["username"] = username;
        localStorage["remember"] = remember;

        /*
         If the user need to save login data, encrypt the password and save in local storage.
         */
        if (remember)
            localStorage["password"] = CryptoJS.RC4Drop.encrypt(password, "Vw7F3ZcPqJwLqerFoF3sNDAmIDsB", { drop: 3072 / 4 });
        else
            localStorage["password"] = "";

        console.log("Preferences are saved!");//Print log on browser console
        automaticLogin();
    } catch (e) {
        console.log("Save Error!");//Print log on browser console
    }
    /*
     console.log("url: " + localStorage["moodle_url"]);
     console.log("intrvl: " + localStorage["poll_interval"]);
     console.log("mute: " + localStorage["mute"]);
     console.log("alert: " + localStorage["alert_sound"]);
     console.log("popup: " + localStorage["popup"]);
     console.log("time: " + localStorage["popup_time"]);
     console.log("un: " + localStorage["username"]);
     console.log("remember: " + localStorage["remember"]);
     */

}

/*
 This function create an html form.
 Then fill it with login detils that are provided by the user and login to Moodle automatically.
 */
function automaticLogin() {
    console.log("Awaaaaaa");
    var loginForm, textInput1, textInput2;

    // Create a form to login
    loginForm = document.createElement('form');
    loginForm.action = localStorage["moodle_url"] + 'login/index.php';
    loginForm.method = 'post';

    // Create the inputs in the form and give them names, ids and values
    textInput1 = document.createElement('input');
    textInput1.type = 'hidden';
    textInput1.name = 'username';
    textInput1.id = 'usernam';
    textInput1.value = localStorage["username"];

    textInput2 = document.createElement('input');
    textInput2.type = 'hidden';
    textInput2.name = 'password';
    textInput2.id = 'password';
    textInput2.value = CryptoJS.RC4Drop.decrypt(localStorage["password"], "Vw7F3ZcPqJwLqerFoF3sNDAmIDsB", { drop: 3072 / 4 }).toString(CryptoJS.enc.Utf8);
    ;

    // Add inputs to the form
    loginForm.appendChild(textInput1);
    loginForm.appendChild(textInput2);

    // Submit form
    loginForm.submit();

    console.log("Giya");
}

/*
 JavaScript to load configuration data to options page
 */
function loadConfigData() {
    //Do not load config data during the first run of the extension.
    if (localStorage["notFirstRun"] != "true") {
        localStorage["notFirstRun"] = "true";
        console.log("First run");
    }
    else {
        try {
            document.getElementById('url').value = localStorage["moodle_url"];
            document.getElementById('poll').value = localStorage["poll_interval"];
            document.getElementById('popup_timeout').value = localStorage["popup_time"];
            document.getElementById('alert').value = localStorage["alert_sound"];
            document.getElementById('username').value = localStorage["username"];
            //document.getElementById('password').value = localStorage["password"];

            if (localStorage["mute"] == "false")
                document.getElementById('mute').checked = false;
            else
                document.getElementById('mute').checked = true;


            if (localStorage["popup"] == "false")
                document.getElementById('popup').checked = false;
            else
                document.getElementById('popup').checked = true;


            if (localStorage["remember"] == "false")
                document.getElementById('remember').checked = false;
            else
                document.getElementById('remember').checked = true;

            console.log("Preferences are loaded!");//Print log on console
        }
        catch (e) {
            console.log("Preferences loading error!");//Print log on console
        }
    }
}

/*
 Check whether connection to moodle is available or not.
 Return true if connection is available.

 Note: This function checks the availability of an image in Moodle using http header.
 Availability of the image is recognized as connection availability.
 */
function doesConnectionExist() {
    var xhr = new XMLHttpRequest();
    var file = localStorage["moodle_url"] + "theme/image.php/clean/core/1403939604/help";
    var randomNum = Math.round(Math.random() * 10000);

    xhr.open('HEAD', file + "?rand=" + randomNum, false);

    try {
        xhr.send();

        if (xhr.status >= 200 && xhr.status < 304) {
            console.log("Connection available");
            return true;
        } else {
            console.log("Connection unavailable");
            return false;
        }
    } catch (e) {
        console.log("Connection unavailable");
        return false;
    }
}

/*
 Function to play notification sounds that are available in the extension as preview.
 */
function playAlert() {
    var source;
    source = "sounds/" + document.getElementById("alert").value;//Direct to the location of sound file

    try {
        var audioElement = new Audio();
        audioElement.src = source;
        audioElement.play();
    } catch (e) {
        console.error(e);
    }
}