/*
 This function called when option page is loaded.
 Purpose: Add event listnets to navigate through menus, load, save and preview user preferences.
 */
document.addEventListener('DOMContentLoaded', function () {
    var menu;
    var save_button;
    var play_button;
    //var url_input;

    menu = document.querySelectorAll('li');//Get menu list
    save_button = document.getElementById('submit');//Save button
    play_button = document.getElementById('play');//Alert preview button
    //url_input = document.getElementById('url');//Alert preview button

    for (var i = 0; i < menu.length; ++i) {
        menu[i].addEventListener('click', showContent);//Add event listener to the menu
    }
    save_button.addEventListener('click', saveConfigData);//Add event listener to save button
    play_button.addEventListener('click', playAlert);//Add event listener to play alerts
    //url_input.addEventListener('focusout', autoformatURL);//Add event listener to play alerts

    defaultView(0);//Set default view of the menu: "General settings"
    loadConfigData();//Load saved preferences
});

/*
 JavaScript for navigate menu in options page.
 This controls the visibility of menus in options page.
 */
function showContent(event) {
    $('.content').filter(function() {return $(this).css('display') == 'block'}).slideUp("slow", function(){
        $("#content_"+event.target.id).slideDown("slow");
    });

    $('ul.menu > li').removeClass('active');
    $('#'+event.target.id).addClass('active');
}

/*
 Set default menu view in options page

 contentId: HTML ID of the element
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
     Add a back slash at the end of the URL
     */
    if (moodle_url.charAt(moodle_url.length - 1) != "/") {
        moodle_url = moodle_url + "/";
    }

    /*
     Validate URL
     */
    if (!isValidURL()) {
        alert("URL is invalid. Make sure you have entered full URL.\neg: https://online.mrt.ac.lk");
        return;
    }

    /*
     JavaScript function to save user preferences to local storage.
     */
    try {
        DataAccess.setData("moodle_url", moodle_url);
        DataAccess.setData("poll_interval", poll_interval);
        DataAccess.setData("mute", mute);
        DataAccess.setData("alert_sound", alert_sound);
        DataAccess.setData("popup", popup);
        DataAccess.setData("popup_time", popup_time);
        DataAccess.setData("username", username);
        DataAccess.setData("remember", remember);

        /*
         If the user need to save login data, encrypt the password and save in local storage.
         Otherwise clear previously saved password if available
         */
        if (remember)
            DataAccess.setData("password", CryptoJS.RC4Drop.encrypt(password, "Vw7F3ZcPqJwLqerFoF3sNDAmIDsB", {drop: 3072 / 4}));
        else
            DataAccess.setData("password", "");

        console.log("Preferences are saved!");//Print log on browser console
    } catch (e) {
        console.log("Save Error!");//Print error log on browser console
    }

    /*
     Set as preferences are changed. This causes reloading of the extension.
     */
    DataAccess.setData("configured", "true");
    /*
     Set as "Not First Run" after user completed confuguring preferences and saved.
     */
    DataAccess.setData("notFirstRun", "true");

    /*
     Alert user that preferences are saved.
     */
    showSaveAlert();

    /*
     Close the options page automatically after 2 seconds when preferences are saved.
     */
    setTimeout(function () {
        window.close();
    }, 5000);
}

/*
 JavaScript function to load configuration data to options page
 */
function loadConfigData() {
    testSavedData();
    document.getElementById('url').value = "https://online.mrt.ac.lk/";
    //Do not load config data during the first run of the extension.
    if (DataAccess.getData("notFirstRun") != "true") {
        console.log("First run");
    }
    /*
     Retrive user preferences from local storage.
     All the preferences except password are previewed in options page
     */
    else {
        try {
            document.getElementById('poll').value = DataAccess.getData("poll_interval");
            document.getElementById('popup_timeout').value = DataAccess.getData("popup_time");
            document.getElementById('alert').value = DataAccess.getData("alert_sound");
            document.getElementById('username').value = DataAccess.getData("username");

            if (DataAccess.getData("mute") == "false")
                document.getElementById('mute').checked = false;
            else
                document.getElementById('mute').checked = true;


            if (DataAccess.getData("popup") == "false")
                document.getElementById('popup').checked = false;
            else
                document.getElementById('popup').checked = true;


            if (DataAccess.getData("remember") == "false")
                document.getElementById('remember').checked = false;
            else
                document.getElementById('remember').checked = true;

            console.log("Preferences are loaded!");//Print log on console
        }
        catch (e) {
            console.log("Preferences loading error!");//Print error log on console
        }
    }
}

/*
 This function validates the URL given by the user.
 URL should contain 'http' or 'https' and length should be more than 15 characters.

 Returns true if URL is valid.
 Returns false in URL is invalid.
 */
function isValidURL() {
    moodle_url = document.getElementById('url').value;
    /*
     Reject invalid URLs and avoid saving given URL
     Invalid URL->   URLs without http or https
     */
    if (moodle_url.search("http") == -1 || moodle_url.length < 15) {
        return false;
    }
    return true;
}

/*
 This function obtains the base URL from the user input.

 Returns the base URL.
 */
function autoformatURL() {
    var url_array;
    var moodle_url;
    var rebuid_url;

    moodle_url = document.getElementById('url').value;

    if (moodle_url.split("/").length > 4) {
        url_array = (moodle_url.split("/"));
        rebuid_url = "";

        for (var i = url_array.length - 1; i > 2; --i) {
            url_array[i] = "";
            //console.log(url_array);
        }

        for (var i = 0; i < 3; ++i) {
            rebuid_url = rebuid_url + url_array[i] + "/";
        }
        console.log(rebuid_url);
    }
    document.getElementById('url').value = rebuid_url;
    return rebuid_url;
}

/*
 This is a test function for getting saved data and compare with given inputs.
 */
function testSavedData() {
    console.log("Moodle url: " + DataAccess.getData("moodle_url"));
    console.log("Polling interval: " + DataAccess.getData("poll_interval"));
    console.log("mute: " + DataAccess.getData("mute"));
    console.log("Alert sound: " + DataAccess.getData("alert_sound"));
    console.log("Desktop pop-up: " + DataAccess.getData("popup"));
    console.log("Desktop pop-up time out: " + DataAccess.getData("popup_time"));
    console.log("Username: " + DataAccess.getData("username"));
    //console.log("pw: " + CryptoJS.RC4Drop.decrypt(DataAccess.getData("password"), "Vw7F3ZcPqJwLqerFoF3sNDAmIDsB", { drop: 3072 / 4 }).toString(CryptoJS.enc.Utf8));
    console.log("Remember login: " + DataAccess.getData("remember"));
}

function showSaveAlert() {
    var item = document.getElementById('save_alert');
    if (item.className == 'hidden') {
        item.className = 'visible';
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