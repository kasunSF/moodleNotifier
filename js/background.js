/*
 This function called during start up of the extension
 */
document.addEventListener('DOMContentLoaded', function () {
    /*
     //Check for the first run of the extension.
     If first run, open th options page to set user preferences.
     */
    if (localStorage["firstRun"] != "false") {
        createTab("options.html");
        localStorage["firstRun"] = "false";
    }

    /*
     If automatic login is enabled, check availability of Moodle for each 10 seconds.
     If Moodle is available, login to the moodle automatically.
     */
    var hasConnection = false;
    var loggedIn = false;

    if (localStorage["remember"] == "true") {//If automatic login enabled

        var connectionChecker = setInterval(function () {
            console.log("Checking connection...");
            hasConnection = doesConnectionExist();//Check for connection to Moodle
            console.log("Connection is available.");

            if (hasConnection && !loggedIn) {//If connection is avaiable
                automaticLogin();//Login automatically
                loggedIn = isLoggedIn();
                console.log("Logged in");
            }
            else if (!hasConnection){//If connection is not available, set as not logged in.
                loggedIn = false;
                console.log("Not logged in");
            }
        }, 10000);
    }
    /*
    If automatic login is disabled, check whether user is logged in to the moodle for every 10 seconds.
    This uses browser cookies.

    else{

    }*/
});

/*
 This function creates an html form.
 Then fill it with login detils that are provided by the user and login to Moodle automatically.
 */
function automaticLogin() {
    var password = CryptoJS.RC4Drop.decrypt(localStorage["password"], "Vw7F3ZcPqJwLqerFoF3sNDAmIDsB", { drop: 3072 / 4 }).toString(CryptoJS.enc.Utf8);

    var xmlhttp;
    if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    }
    else {// code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.open("POST", localStorage["moodle_url"] + 'login/index.php', true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send("username= " + localStorage["username"] + "& password=" + password);

    console.log("Submitted!");
}

/*
 Check whether connection to moodle is available or not.
 Return true if connection is available.
 Otherwise returns false.

 Note: This function checks the availability of a page of Moodle using http header.
 Availability of the web pageis recognized as connection availability.
 */
function doesConnectionExist() {
    var xmlhttp = new XMLHttpRequest();
    var file = localStorage["moodle_url"] + "login/index.php";//Checks for login/index.php page
    var randomNum = Math.round(Math.random() * 10000);//Random number prevents loading cached data
    xmlhttp.open('HEAD', file + "?rand=" + randomNum, false);//Fetch header information of the request

    try {
        xmlhttp.send();//Send http request

        /*
         200 and 304 are http response codes. Any number above 304 is detected as connection unavaiability or error.
         */
        if (xmlhttp.status >= 200 && xmlhttp.status < 304) {
            console.log("Connection available");
            return true;
        } else {
            console.log("Connection unavailable");
            return false;
        }
    } catch (e) {
        console.log("Connection unavailable");//Log error
        return false;
    }
}

/*
 This function checks whether user is logged in or not.
 It is identified by scratching the response of login/index.php page.

 Returns true if logged in. Otherwise returns false.
 */
function isLoggedIn() {
    var xmlhttp = new XMLHttpRequest();
    var file = localStorage["moodle_url"] + "login/index.php";
    var randomNum = Math.round(Math.random() * 10000);//Random number prevents loading cached data.
    xmlhttp.open('GET', file + "?rand=" + randomNum, false);//Fetch the response as an html string.

    try {
        xmlhttp.send();//Send http request
        var responseText = xmlhttp.responseText;
        if (responseText.search("Cookies must be enabled in your browser") > -1)//Scratch the html string.
            return false;
        else
            return true;
    } catch (e) {
        return false;
    }
}

/*
 Function to create tab with given url in Chrome browser.
 url: Desired url
 */
function createTab(url) {
    chrome.tabs.create({
        "url": url,
        "selected": true
    });
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