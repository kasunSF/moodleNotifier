/**
 * Created by Kasun on 10/18/2015.
 */
var loggedIn;
var hadConnection = false;

document.addEventListener('DOMContentLoaded', function () {
    initialize();
});

function initialize() {
    loggedIn = false;
    var connection_check_timeout = 0.1;
    var preference_check_timeout = 0.1;
    chrome.browserAction.setIcon({path: "img/icon_inactive.png"});

    chrome.alarms.create('connectionChecker', {periodInMinutes: connection_check_timeout});
    chrome.alarms.create('preferenceChecker', {periodInMinutes: preference_check_timeout});
    chrome.alarms.onAlarm.addListener(onAlarmm);
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
            if (xhr.status == 200 && !hadConnection) {
                hadConnection = true;
                console.log("Has connection. Initializing background process...");
                chrome.alarms.create('refresh', {periodInMinutes: 1000});//parseInt(DataAccess.getData("poll_interval"))
                runBackgroundProcess();
            }
            else if (xhr.status != 200 && hadConnection) {
                hadConnection = false;
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
        chrome.browserAction.setBadgeText({text: "..."});
        login();
    }
    if (loggedIn) {
        chrome.browserAction.setIcon({path: "img/icon_active.png"});
        chrome.browserAction.setBadgeText({text: ""});
        getMyHome();
    }
}

function login() {
    var randomNum = Math.round(Math.random() * 10000);//Random number prevents loading cached data
    var url = DataAccess.getData("moodle_url") + "login/index.php?" + randomNum;
    $.post(url,
        function (data) {
            if (data.search("You are logged in as") >= 0) {
                loggedIn = true;
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
                if (data.search("You are logged in as") >= 0) {
                    loggedIn = true;
                    console.log("Logged in automatically");
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
            if (data.search("You are logged in as") >= 0) {
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
var pppppppppppppppppp;
function processDocument(document) {
    pppppppppppppppppp = $(document).find(".assign");
    console.log(pppppppppppppppppp)
}

function terminate() {
}