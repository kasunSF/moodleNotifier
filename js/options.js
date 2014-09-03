/*
 This function called when option page is loaded.
 Purpose: Add event listnets to navigate through menus, load, save and preview user preferences.
 */
document.addEventListener('DOMContentLoaded', function () {
    var menu
    var save_button;
    var play_button;

    menu = document.querySelectorAll('li');//Get menu list
    save_button = document.getElementById('submit');//Save button
    play_button = document.getElementById('play');//Alert previewe button

    for (var i = 0; i < menu.length; ++i) {
        menu[i].addEventListener('click', showContent);//Add event listener to the menu
    }
    save_button.addEventListener('click', saveConfigData);//Add event listener to save button
    play_button.addEventListener('click', playAlert);//Add event listener to play alerts

    defaultView(0);//Set default view of the menu: "General settings"
    loadConfigData();//Load saved preferences
});

/*
 JavaScript for navigate menu in options page.
 This controls the visibility of menus in options page.
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
 Set default menu view in options page
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
     JavaScript function to save user preferences to local storage.
     */
    try {
        setData("moodle_url", moodle_url);
        setData("poll_interval", poll_interval);
        setData("mute", mute);
        setData("alert_sound", alert_sound);
        setData("popup", popup);
        setData("popup_time", popup_time);
        setData("username", username);
        setData("remember", remember);

        /*
         If the user need to save login data, encrypt the password and save in local storage.
         Otherwise clear previously saved password if available
         */
        if (remember)
            setData("password", CryptoJS.RC4Drop.encrypt(password, "Vw7F3ZcPqJwLqerFoF3sNDAmIDsB", { drop: 3072 / 4 }));
        else
            setData("password", "");

        console.log("Preferences are saved!");//Print log on browser console
    } catch (e) {
        console.log("Save Error!");//Print error log on browser console
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
    setData("configured", "true");
}

/*
 JavaScript function to load configuration data to options page
 */
function loadConfigData() {
    //Do not load config data during the first run of the extension.
    if (getData("notFirstRun") != "true") {
        setData("notFirstRun", "true");
        console.log("First run");
    }
    /*
     Retrive user preferences from local storage.
     All the preferences except password are previewed in options page
     */
    else {
        try {
            document.getElementById('url').value = getData("moodle_url");
            document.getElementById('poll').value = getData("poll_interval");
            document.getElementById('popup_timeout').value = getData("popup_time");
            document.getElementById('alert').value = getData("alert_sound");
            document.getElementById('username').value = getData("username");

            if (getData("mute") == "false")
                document.getElementById('mute').checked = false;
            else
                document.getElementById('mute').checked = true;


            if (getData("popup") == "false")
                document.getElementById('popup').checked = false;
            else
                document.getElementById('popup').checked = true;


            if (getData("remember") == "false")
                document.getElementById('remember').checked = false;
            else
                document.getElementById('remember').checked = true;

            console.log("Preferences are loaded!");//Print log on console


            console.log("url: " + getData("moodle_url"));
            console.log("intrvl: " + getData("poll_interval"));
            console.log("mute: " + getData("mute"));
            console.log("alert: " + getData("alert_sound"));
            console.log("popup: " + getData("popup"));
            console.log("time: " + getData("popup_time"));
            console.log("un: " + getData("username"));
            console.log("pw: " + CryptoJS.RC4Drop.decrypt(getData("password"), "Vw7F3ZcPqJwLqerFoF3sNDAmIDsB", { drop: 3072 / 4 }).toString(CryptoJS.enc.Utf8));
            console.log("remember: " + getData("remember"));
        }
        catch (e) {
            console.log("Preferences loading error!");//Print error log on console
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
    var file = getData("moodle_url") + "theme/image.php/clean/core/1403939604/help";
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
    var audioElement;

    source = "sounds/" + document.getElementById("alert").value;//Direct to the location of sound file

    try {
        audioElement = new Audio();
        audioElement.src = source;
        audioElement.play();
    } catch (e) {
        console.error(e);
    }
}