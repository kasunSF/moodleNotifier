const NOTIFICATIONS_INTERVAL = 5000;

var feedUrl2contentLength = {};

function runNotificationsTimer(url, title, icon, text) {
    setInterval(function(){
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onload = function(e) {

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
        iconUrl : icon
    };

    chrome.notifications.create("alert-notification", opt, function(notificationId){
        setTimeout(function(){
            chrome.notifications.clear(notificationId, function(){});
        }, 5000);
    });
}

//Content load at startup
document.addEventListener('DOMContentLoaded', function () {
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
    textInput2.value = localStorage["password"];
    ;

    // Add inputs to the form
    loginForm.appendChild(textInput1);
    loginForm.appendChild(textInput2);

    // Submit form
    loginForm.submit();

    if (localStorage["notFirstRun"] != "true") {

        chrome.tabs.create({
            "url" : "options.html",
            "selected" : true
        });

        localStorage["notFirstRun"] = "true";
    }
});