/**
 * Created by Kasun on 10/18/2015.
 */
var loggedIn;
var hadConnection = false;
var numOfAssignments;
var numOfQuizzes;
var numOfForumPosts;
var terminated;

document.addEventListener('DOMContentLoaded', function () {
    initialize();
});

function initialize() {
    loggedIn = false;
    terminated = false;
    initializeLocalStorage();

    var connection_check_timeout = 0.1;
    var preference_check_timeout = 0.1;
    chrome.browserAction.setIcon({path: "img/icon_inactive.png"});

    chrome.alarms.create('connectionChecker', {periodInMinutes: connection_check_timeout});
    chrome.alarms.create('preferenceChecker', {periodInMinutes: preference_check_timeout});
    chrome.alarms.onAlarm.addListener(onAlarmm);

    if (DataAccess.getData("notFirstRun") != "true") {
        chrome.tabs.create({
            "url": "options.html",
            "selected": true
        });
    }
}

function initializeLocalStorage() {
    if ((DataAccess.getData("hidden_events") + "").indexOf("undefined") != -1) {
        DataAccess.setData("hidden_events", "");
    }
}

function onAlarmm(alarm) {
    if (alarm && alarm.name == 'refresh') {
        runBackgroundProcess();
    }
    else if (alarm && alarm.name == 'connectionChecker') {
        checkConnection();
    }
    else if (alarm && alarm.name == 'preferenceChecker') {
        checkPreferences();
    }
}

function checkConnection() {
    var randomNum = Math.round(Math.random() * 10000);//Random number prevents loading cached data
    var sitePage = DataAccess.getData("moodle_url") + "login/index.php?" + randomNum;//Checks for login/index.php page

    $.ajax({
        url: sitePage,
        type: "HEAD",
        timeout: 5000,
        complete: function (xhr) {
            if (xhr.status == 200 && (!hadConnection || !loggedIn)) {
                hadConnection = true;
                terminated = false;
                console.log("Has connection. Initializing background process...");
                chrome.alarms.create('refresh', {periodInMinutes: parseInt(DataAccess.getData("poll_interval")      )});//
                runBackgroundProcess();
            }
            else if (xhr.status != 200 && !terminated) {
                hadConnection = false;
                terminated = true;
                console.log("No connection. Terminating background process...");
                chrome.alarms.clear('refresh');
                terminate();
            }
        }
    });
}

function checkPreferences() {
    if (DataAccess.getData("configured") == "true") {
        console.log("Preferences are changed!");
        DataAccess.setData("configured", "false");
        runBackgroundProcess();
    }
}

function runBackgroundProcess() {
    if (!loggedIn) {
        chrome.browserAction.setIcon({path: "img/icon_inactive.png"});
        chrome.browserAction.setBadgeText({text: "..."});
        chrome.browserAction.setTitle({title: "Connecting..."});
        login();
    }
    else if (loggedIn) {
        getMyHome();
    }
}

function login() {
    var randomNum = Math.round(Math.random() * 10000);//Random number prevents loading cached data
    var url = DataAccess.getData("moodle_url") + "login/index.php?" + randomNum;
    $.post(url,
        function (data) {
            if (data.search("You are logged in as") != -1) {
                loggedIn = true;
                console.log("Login detected!");
                chrome.browserAction.setIcon({path: "img/icon_active.png"});
                getMyHome();
            }
        }
    );
    if (!loggedIn && DataAccess.getData("remember") == "true") {
        var username = DataAccess.getData("username");
        var password = CryptoJS.RC4Drop.decrypt(DataAccess.getData("password"), "Vw7F3ZcPqJwLqerFoF3sNDAmIDsB", {drop: 3072 / 4}).toString(CryptoJS.enc.Utf8);//Decrypt password

        $.post(url,
            {
                username: username,
                password: password
            },
            function (data) {
                if (data.search("You are logged in as") != -1) {
                    loggedIn = true;
                    console.log("Logged in automatically");
                    chrome.browserAction.setIcon({path: "img/icon_active.png"});
                    getMyHome();
                }
                else {
                    loggedIn = false;
                    console.log("Login error!");
                }
            }
        );
    }
}

function getMyHome() {
    var document;
    var randomNum = Math.round(Math.random() * 10000);//Random number prevents loading cached data
    var url = DataAccess.getData("moodle_url") + "my?" + randomNum;
    $.post(url,
        function (data) {
            if (data.search("You are logged in as") != -1) {
                var parser = new DOMParser();
                document = parser.parseFromString(data, "text/html");
                processDocument(document);
            }
            else {
                loggedIn = false;
                console.log("Login expired!");
            }
        }
    );
}

function processDocument(document) {
    processAssignments($(document).find(".assign"));
    processQuizzes($(document).find(".quiz"));
    processForumPosts($(document).find(".forum"));
    if ((numOfAssignments + numOfQuizzes + numOfForumPosts) > 0) {
        chrome.browserAction.setBadgeText({text: "" + (numOfAssignments + numOfQuizzes + numOfForumPosts)});
    }
    else {
        chrome.browserAction.setBadgeText({text: ""});
    }

    chrome.browserAction.setTitle({title: "You have " + (numOfAssignments + numOfQuizzes + numOfForumPosts) + " tasks due"});
}

function processAssignments(assignments) {
    if (numOfAssignments != assignments.length) {
        numOfAssignments = assignments.length;
    }

    var assignmentIdList = "";
    var nameElement;
    var assignmentName;
    var assignmentUrl;
    var assignmentID;
    var assignmentDue;
    var assignmentStatus;
    var hasChanged;

    assignments.each(function (index) {
        assignmentStatus = $(this).find(".details").text();
        nameElement = $(this).find(".name");
        assignmentName = $(nameElement).text().replace("Assignment: ", "");
        assignmentUrl = $(nameElement).find("a").attr("href");
        assignmentID = "assign-" + assignmentUrl.split("=")[1];

        if (assignmentStatus.search("Not submitted yet") != -1) {
            assignmentDue = $(this).find(".info").text();
            hasChanged = false;

            if (DataAccess.getData("hidden_events").search(assignmentID) != -1) {
                --numOfAssignments;
            }

            if (assignmentIdList.search(assignmentID) == -1) {
                assignmentIdList = assignmentIdList + assignmentID + ",";
            }
            //showEvents("Assignment "+index, assignmentName, assignmentUrl, assignmentID, assignmentDue, assignmentStatus);

            if (DataAccess.getData(assignmentID + "-url") != assignmentUrl) {
                DataAccess.setData(assignmentID + "-url", assignmentUrl);//Save in local storage if there's any change
                hasChanged = true;//Set as changed
            }
            if (DataAccess.getData(assignmentID + "-name") != assignmentName) {
                DataAccess.setData(assignmentID + "-name", assignmentName);//Save in local storage if there's any change
                hasChanged = true;//Set as changed
            }
            if (DataAccess.getData(assignmentID + "-due") != assignmentDue) {
                DataAccess.setData(assignmentID + "-due", assignmentDue);//Save in local storage if there's any change
                hasChanged = true;//Set as changed
            }
            if (DataAccess.getData(assignmentID + "-status") != assignmentStatus) {
                DataAccess.setData(assignmentID + "-status", assignmentStatus);//Save in local storage if there's any change
                hasChanged = true;//Set as changed
            }

            if (hasChanged && DataAccess.getData("popup") == "true") {
                DataAccess.setData(assignmentID + "-notified", "true");
                showNotification(assignmentName, assignmentDue, assignmentStatus, assignmentUrl);
            }
        }else{
            --numOfAssignments;
        }
    });
    if (assignmentIdList != DataAccess.getData("assignment_id_list")) {
        DataAccess.setData("assignment_id_list", assignmentIdList);
    }
}

function processQuizzes(quizzes) {
    if (numOfQuizzes != quizzes.length) {
        numOfQuizzes = quizzes.length;
    }
    var quizIdList = "";
    var nameElement;
    var quizName;
    var quizUrl;
    var quizID;
    var quizDue;
    var quizStatus;
    var hasChanged;

    quizzes.each(function (index) {
        nameElement = $(this).find(".name");
        quizName = $(nameElement).text().replace("Quiz: ", "");
        quizUrl = $(nameElement).find("a").attr("href");
        quizID = "quiz-" + quizUrl.split("=")[1];
        quizDue = $(this).find(".info")[0].textContent;
        quizStatus = $(this).find(".info")[1].textContent;
        hasChanged = false;

        if (DataAccess.getData("hidden_events").search(quizID) != -1) {
            --numOfQuizzes;
        }

        if (quizIdList.search(quizID) == -1) {
            quizIdList = quizIdList + quizID + ",";
        }

        if (DataAccess.getData(quizID + "-url") != quizUrl) {
            DataAccess.setData(quizID + "-url", quizUrl);//Save in local storage if there's any change
            hasChanged = true;//Set as changed
        }
        if (DataAccess.getData(quizID + "-name") != quizName) {
            DataAccess.setData(quizID + "-name", quizName);//Save in local storage if there's any change
            hasChanged = true;//Set as changed
        }
        if (DataAccess.getData(quizID + "-due") != quizDue) {
            DataAccess.setData(quizID + "-due", quizDue);//Save in local storage if there's any change
            hasChanged = true;//Set as changed
        }
        if (DataAccess.getData(quizID + "-status") != quizStatus) {
            DataAccess.setData(quizID + "-status", quizStatus);//Save in local storage if there's any change
            hasChanged = true;//Set as changed
        }

        if (hasChanged && DataAccess.getData("popup") == "true") {
            DataAccess.setData(quizID + "-notified", "true");
            showNotification(quizName, quizDue, quizStatus, quizUrl);
        }

        //showEvents("Quiz "+index, quizName, quizUrl, quizID, quizInfo, quizStatus);
    });
    if (quizIdList != DataAccess.getData("quiz_id_list")) {
        DataAccess.setData("quiz_id_list", quizIdList);
    }
}

function processForumPosts(forumPosts) {
    if (numOfForumPosts != forumPosts.length) {
        numOfForumPosts = forumPosts.length;
    }

    var forumIdList = "";
    var nameElement;
    var forumName;
    var forumUrl;
    var forumID;
    var forumStatus;
    var hasChanged;
    forumPosts.each(function (index) {

        nameElement = $(this).find(".name");
        forumName = $(nameElement).text().replace("Forum: ", "");
        forumUrl = $(nameElement).find("a").attr("href");
        forumID = "forum-" + forumUrl.split("=")[1];
        forumStatus = $(this).find(".info").text();
        hasChanged = false;

        if (DataAccess.getData("hidden_events").search(forumID) != -1) {
            --numOfForumPosts;
        }

        if (forumIdList.search(forumID) == -1) {
            forumIdList = forumIdList + forumID + ",";
        }

        if (DataAccess.getData(forumID + "-url") != forumUrl) {
            DataAccess.setData(forumID + "-url", forumUrl);//Save in local storage if there's any change
            hasChanged = true;//Set as changed
        }
        if (DataAccess.getData(forumID + "-name") != forumName) {
            DataAccess.setData(forumID + "-name", forumName);//Save in local storage if there's any change
            hasChanged = true;//Set as changed
        }
        if (DataAccess.getData(forumID + "-status") != forumStatus) {
            DataAccess.setData(forumID + "-status", forumStatus);//Save in local storage if there's any change
            hasChanged = true;//Set as changed
        }
        DataAccess.setData(forumID + "-due", "");
        if (hasChanged && DataAccess.getData("popup") == "true") {
            DataAccess.setData(forumID + "-notified", "true");
            showNotification(forumName, "", forumStatus, forumUrl);
        }

        //showEvents("Forum "+index, forumName, forumUrl, forumID, "", forumInfo);
    });
    if (forumIdList != DataAccess.getData("forum_id_list")) {
        DataAccess.setData("forum_id_list", forumIdList);
    }
}

function showNotification(name, due, status, url) {
    /*
     Show desktop notification if enabled.
     */
    if (DataAccess.getData("popup") == "true") {
        if (DataAccess.getData("popup_time") == "Indefinitely") {
            notifyEvent(name, due + "\n" + status, url);
        }
        else {
            notify(name, due + "\n" + status, url, DataAccess.getData("popup_time"));
        }
    }
    /*
     Play audible notifications if enabled.
     */
    if (DataAccess.getData("mute") == "false") {
        playAlert(DataAccess.getData("alert_sound"));
    }
}

function showEvents(index, name, url, id, due, status) {
    console.log(index + ":");
    console.log(name);
    console.log(url);
    console.log(id);
    console.log(due);
    console.log(status);
}

function terminate() {
    chrome.browserAction.setIcon({path: "img/icon_sleep.png"});
    chrome.browserAction.setTitle({title: "No connection!"});
    loggedIn = false;
}