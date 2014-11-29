var num_of_events;//This variable tracks the number of available events. This is used to show available events in extension button and prevent duplicated notifications.
var const_num_of_events;
var loggedIn;


/*
 This function called during start up of the extension
 */
document.addEventListener('DOMContentLoaded', function () {
    var connectionChecker;

    loggedIn = false;

    Background.initialize();
    Background.backgroundProcess();

    /*
     Check for preferences change for each 10 seconds
     */
    preferenceChecker = setInterval(function () {
        /*
         If settings of the MoodleNotifier are changed, reload the extension and start to execute from the begining.
         */
        if (DataAccess.getData("configured") == "true") {
            console.log("Preferences are changed!");
            DataAccess.setData("configured", "false");
            Background.backgroundProcess();
        }
    }, 10000);

    /*
     Run background process repeatedly.
     */
    connectionChecker = setInterval(function () {
        Background.backgroundProcess();
    }, DataAccess.getData("poll_interval"));

});

var Background = {
    /*
     This function initilaizes the extension.
     */
    initialize: function () {
        var notified_urls;

        /*
         If currently there are no any notified events, clear the local storage data
         */
        notified_urls = "" + DataAccess.getData("notified_urls");
        if (notified_urls.search("http") == -1) {
            DataAccess.setData("notified_urls", "");
        }

        chrome.browserAction.setIcon({path: "img/icon_inactive.png"});
        chrome.browserAction.setBadgeText({text: ""});

        /*
         Check for the first run of the extension.
         If first run, open the options page to set user preferences.
         */
        if (DataAccess.getData("notFirstRun") != "true") {
            Background.createTab("options.html");
        }
    },

    /*
     This function is called repeatedly while extension is running.
     */
    backgroundProcess: function () {
        var hasConnection;
        hasConnection = false;

        if (DataAccess.getData("notFirstRun") == "true") {

            /*
             If automatic login is enabled, check availability of Moodle for each 10 seconds.
             */
            if (DataAccess.getData("remember") == "true") {//If automatic login enabled
                console.log("Checking connection...");
                hasConnection = Background.doesConnectionExist();//Check for connection to Moodle
                /*
                 If Moodle is available and not logged in, login to the moodle automatically.
                 */
                if (hasConnection && !loggedIn) {//If connection is avaiable
                    Background.automaticLogin();//Login automatically
                    console.log("Logging in");

                    Background.sleep(2000);//Wait 2 seconds before checking whether user is logged in or not
                    loggedIn = Background.isLoggedIn();//Check whether user is logged in or not
                }
            }
            /*
             If automatic login is disabled, check whether user is logged in to the moodle for every 10 seconds.
             This uses browser cookies.
             */
            else {
                console.log("Automatic login disabled");
                console.log("Checking connection...");
                hasConnection = Background.doesConnectionExist();//Check for connection to Moodle
                loggedIn = Background.isLoggedIn();
            }

            /*
             If Moodle is available and logged in, fetch upcoming events.
             */
            if (hasConnection && loggedIn) {//If connection is avaiable
                chrome.browserAction.setIcon({path: "img/icon_active.png"});

                if (DataAccess.getData("reload") == "true") {
                    Background.fetchEvents(true);//Show dektop and audible notifications
                    DataAccess.setData("reload", "false");
                    console.log("Desktop notifications are reloaded!");
                }
                else
                    Background.fetchEvents(false);//Show dektop and audible notifications
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
        }
    },

    /*
     This function creates an html form.
     Then fill it with login detils that are provided by the user and login to Moodle automatically.
     */
    automaticLogin: function () {
        var password;
        var xmlhttp;

        password = CryptoJS.RC4Drop.decrypt(DataAccess.getData("password"), "Vw7F3ZcPqJwLqerFoF3sNDAmIDsB", { drop: 3072 / 4 }).toString(CryptoJS.enc.Utf8);//Decrypt password
        xmlhttp = new XMLHttpRequest();

        /*
         Create XML http request to send login information to the Moodle.
         */
        xmlhttp.open("POST", DataAccess.getData("moodle_url") + 'login/index.php', true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send("username= " + DataAccess.getData("username") + "& password=" + password);

        console.log("Submitted!");
    },

    /*
     Check whether connection to moodle is available or not.
     Return true if connection is available.
     Otherwise returns false.

     Note: This function checks the availability of a page of Moodle using http header.
     Availability of the web page is recognized as connection availability.
     */
    doesConnectionExist: function () {
        var xmlhttp;//XML http request
        var sitePage;//URL of the home page of the user
        var randomNum;
        var responseText;//Current response text of XML http request

        xmlhttp = new XMLHttpRequest();
        sitePage = DataAccess.getData("moodle_url") + "login/index.php";//Checks for login/index.php page
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
    },

    /*
     This function checks whether user is logged in or not.
     It is identified by scratching the response of login/index.php page.

     Returns true if logged in. Otherwise returns false.
     */
    isLoggedIn: function () {
        var xmlhttp;//XML http request
        var sitePage;//URL of the home page of the user
        var randomNum;
        var responseText;//Current response text of XML http request

        xmlhttp = new XMLHttpRequest();
        sitePage = DataAccess.getData("moodle_url") + "login/index.php";
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
    },

    /*
     Function to create tab with given url in Chrome browser.
     url: Desired url
     */
    createTab: function (url) {
        chrome.tabs.create({
            "url": url,
            "selected": true
        });
    },

    /*
     This function is called periodically in user preferred time intervals.
     This sends an XML http request to the "my home" page of the moodle page and get te response as a string.
     The response string is scratched to find available events.
     If events are available, rresponse string is sent to processing.

     has_reload_request: Boolean variable to determine whether user has requested to reload notification(s)
     */
    fetchEvents: function (has_reload_request) {
        var xmlhttp;//XML http request
        var sitePage;//URL of the home page of the user
        var randomNum;
        var responseText;//Response text of XML http request
        var num_of_courses_with_event;//Number of courses that has events
        var position;//Index of the occurance

        num_of_events = 0;//Clear number of events to prevent over counting
        xmlhttp = new XMLHttpRequest();
        sitePage = DataAccess.getData("moodle_url") + "my";
        randomNum = Math.round(Math.random() * 10000);//Random number prevents loading cached data.
        xmlhttp.open('GET', sitePage + "?rand=" + randomNum, false);//Fetch the response as an html string.

        try {
            xmlhttp.send();//Send http request
            responseText = xmlhttp.responseText;//Get response html page as a string

            hasChanged = false;

            /*
             Find the number of courses that have events
             */
            num_of_courses_with_event = (responseText.match(/activity_info/g).length);//Get number of courses with events

            /*
             Separate the courses that have events and process the response string to get events.
             "box flush" separates the courses that have events.
             Events of a course is processed at a time.
             */
            while (num_of_courses_with_event-- > 0) {
                position = responseText.indexOf("activity_info");
                if (position > -1) {
                    responseText = responseText.slice(position);
                    position = responseText.indexOf("<div");
                    responseText = responseText.slice(position);
                    position = responseText.indexOf("box flush");

                    Background.processEventTypes(responseText.slice(0, position), has_reload_request);//Send string to process

                    responseText = responseText.slice(position);
                    position = responseText.indexOf("<div");
                    responseText = responseText.slice(position);
                    position = responseText.indexOf("box flush");
                }
            }
            /*
             If there's at least one event, show number of available events at extension button.
             */
            if (num_of_events > 0)
                chrome.browserAction.setBadgeText({text: "" + num_of_events});
            else if (num_of_events == 0)
                chrome.browserAction.setBadgeText({text: ""});

            /*
             Keep the track of available, unattempted events in a variable which is not subjected in incrementing/ decrementing/ resetting
             */
            if (const_num_of_events != num_of_events) {
                const_num_of_events = num_of_events;
                DataAccess.setData("num_of_events", const_num_of_events);
            }
        } catch (e) {
            console.log(e);//Log error
        }
    },

    /*
     This function separates the events according to the category.
     "activity_overview" separates the event types.
     After separation, this send text strings for processing to obtain name, url, due date and status of the event and store them in local storage.

     textString: A part of the html response text which includes info of event(s)
     has_reload_request: Boolean variable to determine whether user has requested to reload notification(s)
     */
    processEventTypes: function (textString, has_reload_request) {
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
                Background.processAssignments(eventString, has_reload_request);
            }
            /*
             If event is a quiz, send the string to process as a quiz.
             */
            else if (eventString.search("Quiz: <a") != -1) {
                Background.processQuizzes(eventString, has_reload_request);
            }
            /*
             If event is a forum post, send the string to process as a forum post.
             */
            else if (eventString.search("Forum: <a") != -1) {
                Background.processForumPosts(eventString, has_reload_request);
            }
        }
    },

    /*
     This function scratch the given string and separate the name, url, due date and status of the assignments and store them in local storage.

     textString: A part of the html response text which includes info of assignment(s)
     has_reload_request: Boolean variable to determine whether user has requested to reload notification(s)
     */
    processAssignments: function (textString, has_reload_request) {
        var events;
        var url;//URL to the assignment
        var name;//Name of the assignment
        var due;//Due date of the assignment
        var status;//Status of the assignment
        var hasChanged;//Boolean variable for determining changes of the assignment events
        var hidden_urls;
        var notified_urls;

        notified_urls = "" + DataAccess.getData("notified_urls");

        hidden_urls = DataAccess.getData("hidden_events") + "";
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

            /*
             Get the name of assignment
             */
            textString = textString.slice(position + 2);//position+2 = Starting index of the name of assignment in the string
            position = textString.indexOf("<");
            name = textString.slice(0, position);

            /*
             Get the due date of assignment
             */
            position = textString.indexOf("info");
            textString = textString.slice(position + 6);//position+6 = Due date of the assignment in the string
            position = textString.indexOf("</div>");
            due = textString.slice(0, position);

            /*
             Get the status of assignment
             */
            position = textString.indexOf("details");
            textString = textString.slice(position + 9);//position+9 = Status about the assignment in the string
            position = textString.indexOf("</div>");
            status = textString.slice(0, position);

            /*
             Check for assignments that are not sumbmitted yet and not hidden by the user.
             Then store them in local storage.
             */
            if (status.search("Not submitted yet") != -1 && hidden_urls.indexOf(url) == -1) {
                if (DataAccess.getData("url" + num_of_events) != url) {
                    DataAccess.setData("url" + num_of_events, url);//Save in local storage if there's any change
                    hasChanged = true;//Set as changed
                }
                if (DataAccess.getData("name" + num_of_events) != name) {
                    DataAccess.setData("name" + num_of_events, name);//Save in local storage if there's any change
                    hasChanged = true;//Set as changed
                }
                if (DataAccess.getData("due" + num_of_events) != due) {
                    DataAccess.setData("due" + num_of_events, due);//Save in local storage if there's any change
                    hasChanged = true;//Set as changed
                }
                if (DataAccess.getData("status" + num_of_events) != status) {
                    DataAccess.setData("status" + num_of_events, status);//Save in local storage if there's any change
                    hasChanged = true;//Set as changed
                }
                ++num_of_events;
                /*
                 Reload all desktop notifications.
                 This is done by changing the boolean variable value to 'true'.
                 As hasChanged == true, it shows the notification by executing code within 'if (hasChanged)' condition.
                 */
                if (has_reload_request) {
                    hasChanged = true;
                }

                console.log(name);
                console.log(url);
                console.log(due);
                console.log(status + "\n");
            }

            /*
             If any change of the event is detected, notify to the user.
             Notifications are called only if the event page has been changed.
             */
            if (hasChanged) {
                hasChanged = false;
                if (notified_urls.indexOf(url) == -1){
                    notified_urls = notified_urls + url +" ";
                    DataAccess.setData("notified_urls", notified_urls);
                    Background.showNotifications(name, due, status, url);
                }
            }
        }
    },

    /*
     This function scratch the given string and separate the name, url, due date and status of the Quizzes and store them in local storage.

     textString: A part of the html response text which includes info of quiz(zes)
     has_reload_request: Boolean variable to determine whether user has requested to reload notification(s)
     */
    processQuizzes: function (textString, has_reload_request) {
        var url;//URL to the quiz
        var name;//Name of the quiz
        var due;//Due date of the quiz
        var status;//Status of the quiz
        var hasChanged;//Boolean variable for determining changes of the quiz events
        var hidden_urls;
        var notified_urls;

        notified_urls = "" + DataAccess.getData("notified_urls");

        hidden_urls = DataAccess.getData("hidden_events") + "";
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

            /*
             Get the name of quiz
             */
            textString = textString.slice(position + 2);//position+2 = Starting index of the name of quiz in the string
            position = textString.indexOf("<");
            name = textString.slice(0, position);

            /*
             Get the due date of quiz
             */
            position = textString.indexOf("info");
            textString = textString.slice(position + 6);//position+6 = Due date of the quiz in the string
            position = textString.indexOf("</div>");
            due = textString.slice(0, position);

            /*
             Get the status of quiz
             */
            position = textString.indexOf("info");
            textString = textString.slice(position + 6);//position+2 = Status about the quiz in the string
            position = textString.indexOf("</div>");
            status = textString.slice(0, position);

            /*
             Check for quizzes that are not attempted yet and and not hidden by the user.
             Then store them in local storage.
             */
            if (status.search("No attempts have been made") != -1 && hidden_urls.indexOf(url) == -1) {
                if (DataAccess.getData("url" + num_of_events) != url) {
                    DataAccess.setData("url" + num_of_events, url);//Save in local storage if there's any change
                    hasChanged = true;//Set as changed
                }
                if (DataAccess.getData("name" + num_of_events) != name) {
                    DataAccess.setData("name" + num_of_events, name);//Save in local storage if there's any change
                    hasChanged = true;//Set as changed
                }
                if (DataAccess.getData("due" + num_of_events) != due) {
                    DataAccess.setData("due" + num_of_events, due);//Save in local storage if there's any change
                    hasChanged = true;//Set as changed
                }
                if (DataAccess.getData("status" + num_of_events) != status) {
                    DataAccess.setData("status" + num_of_events, status);//Save in local storage if there's any change
                    hasChanged = true;//Set as changed
                }
                ++num_of_events;

                /*
                 Reload all desktop notifications.
                 This is done by changing the boolean variable value to 'true'. As hasChanged == true, it shows the notification by executing code within 'if (hasChanged)' condition.
                 */
                if (has_reload_request) {
                    hasChanged = true;
                }

                console.log(name);
                console.log(url);
                console.log(due);
                console.log(status + "\n");
            }

            /*
             If any change of the event is detected, notify to the user.
             Notifications are called only if the event page has been changed.
             */
            if (hasChanged) {
                hasChanged = false;
                if (notified_urls.indexOf(url) == -1){
                    notified_urls = notified_urls + url +" ";
                    DataAccess.setData("notified_urls", notified_urls);
                    Background.showNotifications(name, due, status, url);
                }
            }
        }
    },

    /*
     This function scratch the given string and separate the url of the forum posts and store them in local storage.

     textString: A part of the html response text which includes info of forum post(s)
     has_reload_request: Boolean variable to determine whether user has requested to reload notification(s)
     */
    processForumPosts: function (textString, has_reload_request) {
        var url;//URL to the forum
        var name;//Name of the forum
        var status;//Status of the forum
        var hasChanged;//Boolean variable for determining changes of the forum events
        var hidden_urls;
        var notified_urls;

        notified_urls = "" + DataAccess.getData("notified_urls");

        hidden_urls = DataAccess.getData("hidden_events") + "";
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

            /*
             Get the name of forum
             */
            textString = textString.slice(position + 2);//position+2 = Starting index of the name of forum in the string
            position = textString.indexOf("<");
            name = textString.slice(0, position);
            /*
             Get the status of forum
             */
            position = textString.indexOf("postsincelogin");
            textString = textString.slice(position + 16);//position+16 = Starting index of the status of forum in the string
            position = textString.indexOf("<");
            status = textString.slice(0, position);

            /*
             Check for forum posts that are not hidden by the user.
             Then store them in local storage.
             */
            if (hidden_urls.indexOf(url) == -1) {
                if (DataAccess.getData("url" + num_of_events) != url) {
                    DataAccess.setData("url" + num_of_events, url);//Save in local storage if there's any change
                    hasChanged = true;//Set as changed
                }
                if (DataAccess.getData("name" + num_of_events) != name) {
                    DataAccess.setData("name" + num_of_events, name);//Save in local storage if there's any change
                    hasChanged = true;//Set as changed
                }

                if (DataAccess.getData("status" + num_of_events) != status) {
                    DataAccess.setData("status" + num_of_events, status);//Save in local storage if there's any change
                    hasChanged = true;//Set as changed
                    DataAccess.setData("due" + num_of_events, "");//Save in local storage if there's any change
                    console.log(url);
                    console.log(status + "\n");
                }
                ++num_of_events;

                /*
                 Reload all desktop notifications.
                 This is done by changing the boolean variable value to 'true'. As hasChanged == true, it shows the notification by executing code within 'if (hasChanged)' condition.
                 */
                if (has_reload_request) {
                    hasChanged = true;
                }

                console.log(name);
                console.log(url);
                console.log(status + "\n");
            }

            /*
             If any change of the event is detected, notify to the user.
             Notifications are called only if the event page has been changed.
             */
            if (hasChanged) {
                hasChanged = false;
                if (notified_urls.indexOf(url) == -1){
                    notified_urls = notified_urls + url +" ";
                    DataAccess.setData("notified_urls", notified_urls);
                    Background.showForumNotifications(name, status, url);
                }
            }
        }
    },

    /*
     Snow desktop notifications and play audible notifications according to user preferences.
     This function is used for events that have a deadline such as assignmnets and quizzes.

     name: Name of the assignment/quiz
     status: Status of the assignment/quiz
     url: URL to the assignment/quiz
     */
    showNotifications: function (name, due, status, url) {
        /*
         Show desktop notification if enabled.
         */
        if (DataAccess.getData("popup") == "true") {
            if (DataAccess.getData("popup_time") == "Indefinitely") {
                notifyEver(name, due + "\n" + status + "\n", url);
            }
            else {
                notify(name, due + "\n" + status + "\n", url, DataAccess.getData("popup_time"));
            }
        }
        /*
         Play audible notifications if enabled.
         */
        if (DataAccess.getData("mute") == "false") {
            playAlert(DataAccess.getData("alert_sound"));
        }
    },

    /*
     Snow desktop notifications and play audible notifications according to user preferences.
     This function is used for events that do not have a deadline such as forum posts.

     name: Name of the forum post
     status: Status of the forum post
     url: URL to the forum post
     */
    showForumNotifications: function (name, status, url) {
        /*
         Show desktop notification if enabled.
         */
        if (DataAccess.getData("popup") == "true") {
            if (DataAccess.getData("popup_time") == "Indefinitely") {
                notifyEver(name, status + "\n", url);
            }
            else {
                notify(name, status + "\n", url, DataAccess.getData("popup_time"));
            }
        }
        /*
         Play audible notifications if enabled.
         */
        if (DataAccess.getData("mute") == "false") {
            playAlert(DataAccess.getData("alert_sound"));
        }
    },

    /*
     This function is used to sleep the entire javascript for a specific number of miliseconds.
     This uses the system clock and check whether time difference is greater than given time.

     milliseconds: Sleep time
     */
    sleep: function (milliseconds) {
        var start = new Date().getTime();
        /*
         Do nothing until specified time period is expired
         */
        while ((new Date().getTime() - start) < milliseconds);
    },
}