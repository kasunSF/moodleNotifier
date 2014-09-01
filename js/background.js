var num_of_events;//This variable tracks the number of available events. This is used to show available events in extension button and prevent duplicated notifications.

/*
 This function called during start up of the extension
 */
document.addEventListener('DOMContentLoaded', function () {
    var connectionChecker;
    var hasConnection;
    var loggedIn;

    chrome.browserAction.setIcon({path: "img/icon_inactive.png"});
    chrome.browserAction.setBadgeText({text: ""});
    hasConnectionhasConnection = false;
    loggedIn = false;
    //loggedIn = true;

    /*
     //Check for the first run of the extension.
     If first run, open the options page to set user preferences.
     */
    if (localStorage["notFirstRun"] != "true") {
        createTab("options.html");
    }

    connectionChecker = setInterval(function () {
        if (localStorage["configured"] == "true") {
            location.reload(true);
            console.log("Preferences are changed!");
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
        }
        /*
         If automatic login is disabled, check whether user is logged in to the moodle for every 10 seconds.
         This uses browser cookies.
         */
        else {
            console.log("Automatic login disabled");
            console.log("Checking connection...");
            hasConnection = doesConnectionExist();//Check for connection to Moodle
            loggedIn = isLoggedIn();
        }

        /*
         If Moodle is available and logged in, fetch upcoming events.
         */
        if (hasConnection && loggedIn) {//If connection is avaiable
            chrome.browserAction.setIcon({path: "img/icon_active.png"});
            fetchEvents();//Show dektop and audible notifications
        }
        /*
         If Moodle is not available, set as not logged in.
         Then whenever the connection become available, this cause re-check for logged in.
         */
        else if (!hasConnection) {//If connection is not available, set as not logged in.
            chrome.browserAction.setIcon({path: "img/icon_inactive.png"});
            loggedIn = false;
        }
        else {
            chrome.browserAction.setIcon({path: "img/icon_inactive.png"});
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

    password = CryptoJS.RC4Drop.decrypt(localStorage["password"], "Vw7F3ZcPqJwLqerFoF3sNDAmIDsB", { drop: 3072 / 4 }).toString(CryptoJS.enc.Utf8);//Decrypt password
    xmlhttp = new XMLHttpRequest();
    /*
     Create XML http request to send login information to the Moodle.
     */
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

/*
 This function is called periodically in user preferred time intervals.
 This sends an XML http request to the "my home" page of the moodle page and get te response as a string.
 The response string is scratched to find available events.
 If events are available, rresponse string is sent to processing.
 */
function fetchEvents() {
    var xmlhttp;//XML http request
    var sitePage;//URL of the home page of the user
    var randomNum;
    var responseText;//Response text of XML http request
    var num_of_courses_with_event;//Number of courses that has events
    var position;//Index of the occurance

    num_of_events = 0;//Clear number of events to prevent over counting
    xmlhttp = new XMLHttpRequest();
    sitePage = localStorage["moodle_url"] + "my";
    randomNum = Math.round(Math.random() * 10000);//Random number prevents loading cached data.
    xmlhttp.open('GET', sitePage + "?rand=" + randomNum, false);//Fetch the response as an html string.

    try {
        xmlhttp.send();//Send http request
        responseText = xmlhttp.responseText;//Get response html page as a string
        hasChanged = false;

        /*
         Find the number of courses that have events
         */
        num_of_courses_with_event = (responseText.match(/box flush/g).length) / 2;//Get number of courses with events

        /*
         Separate the courses that have events and process the response string to get events.
         "box flush" separates the courses that have events.
         Events of a course is processed at a time.
         */
        while (num_of_courses_with_event-- > 0) {
            position = responseText.indexOf("box flush");
            responseText = responseText.slice(position);
            position = responseText.indexOf("<div");
            responseText = responseText.slice(position);
            position = responseText.indexOf("box flush");

            processEventTypes(responseText.slice(0, position));//Send dtring to process

            responseText = responseText.slice(position);
            position = responseText.indexOf("<div");
            responseText = responseText.slice(position);
            position = responseText.indexOf("box flush");
        }
        /*
         If there's at least one event, show number of available events at extension button.
         */
        if (num_of_events > 0)
            chrome.browserAction.setBadgeText({text: "" + num_of_events});
    } catch (e) {
        console.log(e);//Log error
    }
}

/*
 This function separates the events according to the category.
 "activity_overview" separates the event types.
 After separation, this send text strings for processing to obtain name, url, due date and status of the event and store them in local storage.
 */
function processEventTypes(textString) {
    var num_of_event_types;//number of available event types
    var eventString;//Substring of the events

    /*
     Find the number of event types that available in the course
     */
    num_of_event_types = textString.match(/activity_overview/g).length;//Get number of available event types

    /*
     Separate the event types that available in the course.
     "activity_overview" separates the event types.
     Then each event is sent for processing to get details of the event.
     */
    while (num_of_event_types-- > 0) {
        position = textString.indexOf("activity_overview");
        textString = textString.slice(position);
        position = textString.indexOf("<div");
        textString = textString.slice(position);
        position = textString.indexOf("activity_overview");
        eventString = textString.slice(0, position);
        /*
        If event is an assignment, send the string to process as an assignment.
         */
        if (eventString.search("Assignment: <a") != -1) {
            processAssignments(eventString);
        }
        /*
         If event is a quiz, send the string to process as a quiz.
         */
        else if (eventString.search("Quiz: <a") != -1) {
            processQuizzes(eventString);
        }
        /*
         If event is a forum post, send the string to process as a forum post.
         */
        else if (eventString.search("Forum: <a") != -1) {
            processForumPosts(eventString);
        }
    }
}

/*
 This function scratch the given string and separate the name, url, due date and status of the assignments and store them in local storage.
 */
function processAssignments(textString) {
    var events;
    var url;//URL to the assignment
    var name;//Name of the assignment
    var due;//Due date of the assignment
    var status;//Status of the assignment
    var hasChanged;//Boolean variable for determining changes of the assignment events

    hasChanged = false;
    events = textString.match(/assign overview/g).length;//Get number of available assignments

    while (events-- > 0) {

        /*
         Remove unwanted string above the assignment
         */
        position = textString.indexOf("assign overview");
        textString = textString.slice(position);

        /*
         Get the url of assignment
         */
        position = textString.indexOf("http");
        textString = textString.slice(position);//position = Starting index of the url to the assignment in the string
        position = textString.indexOf("\">");
        url = textString.slice(0, position);
        if (localStorage["assignmentUrl" + num_of_events] != url) {
            localStorage["assignmentUrl" + num_of_events] = url;//Save in local storage if there's any change
            hasChanged = true;//Set as changed
        }

        /*
         Get the name of assignment
         */
        textString = textString.slice(position + 2);//position+2 = Starting index of the name of assignment in the string
        position = textString.indexOf("<");
        name = textString.slice(0, position);
        if (localStorage["assignmentName" + num_of_events] != name) {
            localStorage["assignmentName" + num_of_events] = name;//Save in local storage if there's any change
            hasChanged = true;//Set as changed
        }

        /*
         Get the due date of assignment
         */
        position = textString.indexOf("info");
        textString = textString.slice(position + 6);//position+6 = Due date of the assignment in the string
        position = textString.indexOf("</div>");
        due = textString.slice(0, position);
        if (localStorage["assignmentDue" + num_of_events] != due) {
            localStorage["assignmentDue" + num_of_events] = due;//Save in local storage if there's any change
            hasChanged = true;//Set as changed
        }

        /*
         Get the status of assignment
         */
        position = textString.indexOf("details");
        textString = textString.slice(position + 9);//position+9 = Status about the assignment in the string
        position = textString.indexOf("</div>");
        status = textString.slice(0, position);
        if (localStorage["assignmentStatus" + num_of_events] != status) {
            localStorage["assignmentStatus" + num_of_events] = status;//Save in local storage if there's any change
            hasChanged = true;//Set as changed
        }

        /*
         If any change of the event is detected, notify to the user.
         Notifications are called only if the event page has been changed.
         */
        if (hasChanged) {
            showNotifications(name, due, status, url);
        }
        ++num_of_events;
        /*
         console.log(name);
         console.log(url);
         console.log(due);
         console.log(status + "\n");
         */
    }
}

/*
 This function scratch the given string and separate the name, url, due date and status of the Quizzes and store them in local storage.
 */
function processQuizzes(textString) {
    var url;//URL to the quiz
    var name;//Name of the quiz
    var due;//Due date of the quiz
    var status;//Status of the quiz
    var hasChanged;//Boolean variable for determining changes of the quiz events

    hasChanged = false;
    events = textString.match(/quiz overview/g).length;//Get number of available quiz event.

    while (events-- > 0) {

        /*
         Remove unwanted string above the quiz
         */
        position = textString.indexOf("quiz overview");
        textString = textString.slice(position);

        /*
         Get the url of quiz
         */
        position = textString.indexOf("http");
        textString = textString.slice(position);//position = Starting index of the url to the quiz in the string
        position = textString.indexOf("\">");
        url = textString.slice(0, position);
        if (localStorage["quizUrl" + num_of_events] != url) {
            localStorage["quizUrl" + num_of_events] = url;//Save in local storage if there's any change
            hasChanged = true;//Set as changed
        }

        /*
         Get the name of quiz
         */
        textString = textString.slice(position + 2);//position+2 = Starting index of the name of quiz in the string
        position = textString.indexOf("<");
        name = textString.slice(0, position);
        if (localStorage["quizName" + num_of_events] != name) {
            localStorage["quizName" + num_of_events] = name;//Save in local storage if there's any change
            hasChanged = true;//Set as changed
        }

        /*
         Get the due date of quiz
         */
        position = textString.indexOf("info");
        textString = textString.slice(position + 6);//position+6 = Due date of the quiz in the string
        position = textString.indexOf("</div>");
        due = textString.slice(0, position);
        if (localStorage["quizDue" + num_of_events] != due) {
            localStorage["quizDue" + num_of_events] = due;//Save in local storage if there's any change
            hasChanged = true;//Set as changed
        }

        /*
         Get the status of quiz
         */
        position = textString.indexOf("info");
        textString = textString.slice(position + 6);//position+2 = Status about the quiz in the string
        position = textString.indexOf("</div>");
        status = textString.slice(0, position);
        if (localStorage["quizStatus" + num_of_events] != status) {
            localStorage["quizStatus" + num_of_events] = status;//Save in local storage if there's any change
            hasChanged = true;//Set as changed
        }

        /*
         If any change of the event is detected, notify to the user.
         Notifications are called only if the event page has been changed.
         */
        if (hasChanged) {
            showNotifications(name, due, status, url);
        }
        ++num_of_events;
        /*
         console.log(name);
         console.log(url);
         console.log(due);
         console.log(status + "\n");
         */
    }

}

/*
 This function scratch the given string and separate the url of the forum posts and store them in local storage.
 */
function processForumPosts(textString) {
    var url;//URL to the forum
    var name;//Name of the forum
    var status;//Status of the forum
    var hasChanged;//Boolean variable for determining changes of the forum events

    hasChanged = false;
    events = textString.match(/overview forum/g).length;//Get number of available forum events

    while (events-- > 0) {

        /*
         Remove unwanted string above the forum
         */
        position = textString.indexOf("overview forum");
        textString = textString.slice(position);

        /*
         Get the url of forum
         */
        position = textString.indexOf("http");
        textString = textString.slice(position);//position = Starting index of the url to the forum in the string
        position = textString.indexOf("\">");
        url = textString.slice(0, position);
        if (localStorage["forumUrl" + num_of_events] != url) {
            localStorage["forumUrl" + num_of_events] = url;//Save in local storage if there's any change
            hasChanged = true;//Set as changed
        }

        /*
         Get the name of forum
         */
        textString = textString.slice(position + 2);//position+2 = Starting index of the name of forum in the string
        position = textString.indexOf("<");
        name = textString.slice(0, position);
        if (localStorage["forumName" + num_of_events] != name) {
            localStorage["forumName" + num_of_events] = name;//Save in local storage if there's any change
            hasChanged = true;//Set as changed
        }

        /*
         Get the status of forum
         */
        position = textString.indexOf("postsincelogin");
        textString = textString.slice(position + 16);//position+16 = Starting index of the status of forum in the string
        position = textString.indexOf("<");
        status = textString.slice(0, position);
        if (localStorage["forumStatus" + num_of_events] != status) {
            localStorage["forumStatus" + num_of_events] = status;//Save in local storage if there's any change
            hasChanged = true;//Set as changed
        }

        /*
         If any change of the event is detected, notify to the user.
         Notifications are called only if the event page has been changed.
         */
        if (hasChanged) {
            showForumNotifications(name, status, url);
        }
        ++num_of_events;
        /*
         console.log(url);
         console.log(status + "\n");
         */
    }
}

/*
 Snow desktop notifications and play audible notifications according to user preferences.
 This function is used for events that have a deadline such as assignmnets and quizzes.
 */
function showNotifications(name, due, status, url) {
    /*
     Show desktop notification if enabled.
     */
    if (localStorage["popup"] == "true") {
        if (localStorage["popup_time"] == "Indefinitely") {
            notifyEver(name, due + "\n" + status + "\n", url);
        }
        else {
            notify(name, due + "\n" + status + "\n", url, localStorage["popup_time"]);
        }
    }
    /*
     Play audible notifications if enabled.
     */
    if (localStorage["mute"] == "false") {
        playAlert(localStorage["alert_sound"]);
    }
}

/*
 Snow desktop notifications and play audible notifications according to user preferences.
 This function is used for events that do not have a deadline such as forum posts.
 */
function showForumNotifications(name, status, url) {
    /*
     Show desktop notification if enabled.
     */
    if (localStorage["popup"] == "true") {
        if (localStorage["popup_time"] == "Indefinitely") {
            notifyEver(name, status + "\n", url);
        }
        else {
            notify(name, status + "\n", url, localStorage["popup_time"]);
        }
    }
    /*
     Play audible notifications if enabled.
     */
    if (localStorage["mute"] == "false") {
        playAlert(localStorage["alert_sound"]);
    }
}