/*
 This function called during start up of the extension
 */
document.addEventListener('DOMContentLoaded', function () {
    var connectionChecker;
    var hasConnection;
    var loggedIn;

    hasConnectionhasConnection = false;
    loggedIn = false;
    //loggedIn = true;

    /*
     //Check for the first run of the extension.
     If first run, open th options page to set user preferences.
     */
    if (localStorage["notFirstRun"] != "true") {
        createTab("options.html");
    }

    connectionChecker = setInterval(function () {
        if(localStorage["configured"] == "true"){
            console.log("Preferences are changed!");
            location.reload(true);
            localStorage["configured"] = "false";
        }
        /*
         If automatic login is enabled, check availability of Moodle for each 10 seconds.
         */
        if (localStorage["remember"] == "true") {//If automatic login enabled
            console.log("Checking connection...");
            hasConnection = doesConnectionExist();//Check for connection to Moodle
            /*
             If Moodle is available and not logged in, login to the moodle automatically.
             */
            if (hasConnection && !loggedIn) {//If connection is avaiable
                automaticLogin();//Login automatically
                console.log("Logging in");
                loggedIn = isLoggedIn();
            }
            /*
             If Moodle is available and logged in, fetch upcoming events.
             */
            if (hasConnection && loggedIn) {//If connection is avaiable
                fetchEvents();//Show dektop and audible notifications

            }
            /*
             If Moodle is not available, set as not logged in.
             Then whenever the connection become available, this cause re-login.
             */
            else if (!hasConnection) {//If connection is not available, set as not logged in.
                loggedIn = false;
            }
        }
        /*
         If automatic login is disabled, check whether user is logged in to the moodle for every 10 seconds.
         This uses browser cookies.
         */
        else {
            console.log("Automatic login disabled");
        }
    }, localStorage["poll_interval"]);
});

/*
 This function creates an html form.
 Then fill it with login detils that are provided by the user and login to Moodle automatically.
 */
function automaticLogin() {
    var password;
    var xmlhttp;

    password = CryptoJS.RC4Drop.decrypt(localStorage["password"], "Vw7F3ZcPqJwLqerFoF3sNDAmIDsB", { drop: 3072 / 4 }).toString(CryptoJS.enc.Utf8);
    if (window.XMLHttpRequest) {
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
 Availability of the web page is recognized as connection availability.
 */
function doesConnectionExist() {
    var xmlhttp;//XML http request
    var sitePage;//URL of the home page of the user
    var randomNum;
    var responseText;//Current response text of XML http request

    xmlhttp = new XMLHttpRequest();
    sitePage = localStorage["moodle_url"] + "login/index.php";//Checks for login/index.php page
    randomNum = Math.round(Math.random() * 10000);//Random number prevents loading cached data
    xmlhttp.open('HEAD', sitePage + "?rand=" + randomNum, false);//Fetch header information of the request

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
        console.log("Connection error!");//Log error
        return false;
    }
}

/*
 This function checks whether user is logged in or not.
 It is identified by scratching the response of login/index.php page.

 Returns true if logged in. Otherwise returns false.
 */
function isLoggedIn() {
    var xmlhttp;//XML http request
    var sitePage;//URL of the home page of the user
    var randomNum;
    var responseText;//Current response text of XML http request

    xmlhttp = new XMLHttpRequest();
    sitePage = localStorage["moodle_url"] + "login/index.php";
    randomNum = Math.round(Math.random() * 10000);//Random number prevents loading cached data.
    xmlhttp.open('GET', sitePage + "?rand=" + randomNum, false);//Fetch the response as an html string.

    try {
        xmlhttp.send();//Send http request
        responseText = xmlhttp.responseText;//Get response html page as a string
        if (responseText.search("Cookies must be enabled in your browser") > -1)//Scratch the html string.
            return false;
        else {
            console.log("Logged in")
            return true;
        }
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

function fetchEvents() {
    var xmlhttp;//XML http request
    var sitePage;//URL of the home page of the user
    var randomNum;
    var responseText;//Response text of XML http request
    var hasChanged;//Boolean variable for determining changes of the web page
    var num_of_events;//Number of available events
    var position;//Index of the occurance
    var url;//URL to the event
    var title;//Title of the event
    var name;//Name of the event
    var date;//Due date of the event
    var status;//Status of the event

    xmlhttp = new XMLHttpRequest();
    sitePage = localStorage["moodle_url"] + "my";
    randomNum = Math.round(Math.random() * 10000);//Random number prevents loading cached data.
    xmlhttp.open('GET', sitePage + "?rand=" + randomNum, false);//Fetch the response as an html string.

    try {
        xmlhttp.send();//Send http request
        responseText = xmlhttp.responseText;//Get response html page as a string
        hasChanged = false;

        num_of_events = responseText.match(/collapsibleregioninner/g).length;//Get number of available events
        localStorage["num_of_events"] = num_of_events;

        if (num_of_events > 0)
            chrome.browserAction.setBadgeText({text: "" + num_of_events});
        /*
         If there is at least one event, get title, name, url, due date and status of the event.
         This is done by processing the http response string.
         title, name, url, due date and status of the event is stored in local storage.
         Desktop notifications are shown only when there's a change in the event.
         */
        while (num_of_events > 0) {
            /*
             Remove unwanted string above the events
             */
            position = responseText.indexOf("collapsibleregioninner");
            responseText = responseText.slice(position);

            /*
             Get the title
             */
            position = responseText.indexOf("name");
            responseText = responseText.slice(position + 6);//position+6 = Starting index of the title of event in the string
            position = responseText.indexOf(":");
            title = responseText.slice(0, position);
            if (localStorage["eventTitle" + num_of_events] != title) {
                localStorage["eventTitle" + num_of_events] = title;//Save in local storage if there's any change
                hasChanged = true;//Set as changed
            }

            /*
             Get the url
             */
            position = responseText.indexOf("http");
            responseText = responseText.slice(position);//position = Starting index of the url to the event in the string
            position = responseText.indexOf("\">");
            url = responseText.slice(0, position);
            if (localStorage["eventUrl" + num_of_events] != url) {
                localStorage["eventUrl" + num_of_events] = url;//Save in local storage if there's any change
                hasChanged = true;//Set as changed
            }

            /*
             Get the name
             */
            responseText = responseText.slice(position + 2);//position+2 = Starting index of the name of event in the string
            position = responseText.indexOf("<");
            name = responseText.slice(0, position);
            if (localStorage["eventName" + num_of_events] != name) {
                localStorage["eventName" + num_of_events] = name;//Save in local storage if there's any change
                hasChanged = true;//Set as changed
            }

            /*
             Get the due date
             */
            position = responseText.indexOf("info");
            responseText = responseText.slice(position + 6);//position+6 = Due date of the event in the string
            position = responseText.indexOf("</div>");
            date = responseText.slice(0, position);
            if (localStorage["eventDate" + num_of_events] != date) {
                localStorage["eventDate" + num_of_events] = date;//Save in local storage if there's any change
                hasChanged = true;//Set as changed
            }

            if (title == "Assignment") {
                /*
                 Get the status of assignment
                 */
                position = responseText.indexOf("details");
                responseText = responseText.slice(position + 9);//position+9 = Status about the assignment in the string
                position = responseText.indexOf("</div>");
                status = responseText.slice(0, position);
                if (localStorage["eventStatus" + num_of_events] != status) {
                    localStorage["eventStatus" + num_of_events] = status;//Save in local storage if there's any change
                    hasChanged = true;//Set as changed
                }
            }
            else if (title == "Quiz") {
                /*
                 Get the status of the quiz
                 */
                position = responseText.indexOf("info");
                responseText = responseText.slice(position + 6);//position+2 = Status about the quiz in the string
                position = responseText.indexOf("</div>");
                status = responseText.slice(0, position);
                if (localStorage["eventStatus" + num_of_events] != status) {
                    localStorage["eventStatus" + num_of_events] = status;//Save in local storage if there's any change
                    hasChanged = true;//Set as changed
                }
            }

            if (hasChanged) {
                if (localStorage["popup"] == "true") {
                    if (localStorage["popup_time"] == "Indefinitely")
                        notifyEver(name, date + "\n" + status + "\n", url);
                    else
                        notify(name, date + "\n" + status + "\n", url, localStorage["popup_time"]);
                }
                if (localStorage["mute"] == "false") {
                    playAlert(localStorage["alert_sound"]);
                }
            }

            console.log(name);
            console.log(url);
            console.log(date);
            console.log(status + "\n");
            --num_of_events;
        }

    } catch (e) {
        console.log(e);//Log error
    }
}