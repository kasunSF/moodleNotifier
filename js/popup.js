/*
 This function is called when popup page is loaded.
 */
document.addEventListener('DOMContentLoaded', function () {
    var refresh_button;
    var visit_moodle;
    var reload_notifications;
    var settings;

    refresh_button = document.getElementById('refresh');//Get refresh button
    refresh_button.addEventListener('click', refresh);//Add event listener to refresh button

    visit_moodle = document.getElementById('visit_moodle');//Get link to moodle page
    visit_moodle.addEventListener('click', visitMoodle);//Add event listener to the link

    reload_notifications = document.getElementById('reload_notifications');//Get link to reload all notifications
    reload_notifications.addEventListener('click', reloadNotifications);//Add event listener to the link

    settings = document.getElementById('settings');//Get link to options page
    settings.addEventListener('click', goToSettings);//Add event listener to the link

});

/*
Write to the local storage that it is required to restart the extension.
 */
function refresh() {
    localStorage["configured"] = "true";
    window.close();
}

/*
Create a new tab in Google Chrome and direct to the given moodle page.
 */
function visitMoodle() {
    chrome.tabs.create({
        "url": getData("moodle_url") + "my",
        "selected": true
    });
}

/*
Request to reload desktop notifications.
 */
function reloadNotifications() {
    setData("reload", "true");
    window.close();
}

/*
Go to options page of the Moodle Notifier
 */
function goToSettings() {
    chrome.tabs.create({
        "url": "options.html",
        "selected": true
    });
}