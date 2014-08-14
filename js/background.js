/*
 This function called during start up of the extension
 */
document.addEventListener('DOMContentLoaded', function () {
    /*
     //Check for the first run of the extension.
     If first run, open th options page to set user preferences.
     */
    if (localStorage["firstRun"] != "false") {

        chrome.tabs.create({
            "url": "options.html",
            "selected": true
        });

        localStorage["firstRun"] = "false";
    }

    /*
     Check availability of Moodle for 20 seconds.
     If Moodle is available, login to the moodle automatically
     */
    var checkTimes = 0;
    while (!doesConnectionExist() && checkTimes < 50) {
        ++checkTimes;
    }

    automaticLogin();

});

/*
 This function create an html form.
 Then fill it with login detils that are provided by the user and login to Moodle automatically.
 */
function automaticLogin() {
    var loginForm, textInput1, textInput2;

    // Create a form to login at chrome start-up
    loginForm = document.createElement('form');
    loginForm.action = localStorage["moodle_url"] + 'login/index.php';
    loginForm.method = 'post';

    // Create the inputs in the form and give them names, ids and values
    textInput1 = document.createElement('input');
    textInput1.type = 'hidden';
    textInput1.name = 'username';
    textInput1.id = 'username';
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
}

/*
 Check whether connection to moodle is available or not.
 Return true if connection is available.

 Note: This function checks the availability of an image in Moodle using http header.
 Availability of the image is recognized as connection availability.
 */
function doesConnectionExist() {
    var xhr = new XMLHttpRequest();
    var file = localStorage["moodle_url"] + "theme/image.php/clean/core/1403939604/help";//Check for image
    var randomNum = Math.round(Math.random() * 10000);//Random number prevents loading cached data

    xhr.open('HEAD', file + "?rand=" + randomNum, false);

    try {
        xhr.send();

        /*
         200 and 304 are http response codes. Any number above 304 is detected as connection unavaiability or error.
         */
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
 const NOTIFICATIONS_INTERVAL = 5000;

 var feedUrl2contentLength = {};

 function runNotificationsTimer(url, title, icon, text) {
 setInterval(function () {
 var xhr = new XMLHttpRequest();
 xhr.open("GET", url, true);
 xhr.onload = function (e) {

 var oldContentLength = feedUrl2contentLength[url];

 if (!oldContentLength || oldContentLength != e.target.responseText.length) {
 showNotification(title, icon, text);

 feedUrl2contentLength[url] = e.target.responseText.length;
 }

 };
 xhr.send(null);
 }, 20000);
 }

 function showNotification(title, icon, text) {
 var opt = {
 type: "basic",
 title: title,
 message: text,
 iconUrl: icon
 };

 chrome.notifications.create("alert-notification", opt, function (notificationId) {
 setTimeout(function () {
 chrome.notifications.clear(notificationId, function () {
 });
 }, 5000);
 });
 }
 */