var looper;
var degrees = 0;

/*
 This function is called when popup page is loaded.
 */
document.addEventListener('DOMContentLoaded', function () {
    var refresh_button;
    var visit_moodle;
    var reload_notifications;
    var settings;
    
    refresh_button = document.getElementById('refresh');//Refreshbutton
    refresh_button.addEventListener('click', refresh);//Add event listener to refresh button

    visit_moodle = document.getElementById('visit_moodle');//Link to moodle page
    visit_moodle.addEventListener('click', visitMoodle);//Add event listener to refresh button

    reload_notifications = document.getElementById('reload_notifications');//Link to reload all notifications
    reload_notifications.addEventListener('click', reloadNotifications);//Add event listener to refresh button

    settings = document.getElementById('settings');//Link to options page
    settings.addEventListener('click', goToSettings);//Add event listener to refresh button

});

function refresh() {
    localStorage["configured"] = "true";
}

function visitMoodle() {
    chrome.tabs.create({
        "url": getData("moodle_url") + "my",
        "selected": true
    });
}

function reloadNotifications() {
    setData("reload", "true");
}

function goToSettings() {
    chrome.tabs.create({
        "url": "options.html",
        "selected": true
    });
}