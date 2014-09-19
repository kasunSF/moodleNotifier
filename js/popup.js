/*
 This function is called when popup page is loaded.
 */
document.addEventListener('DOMContentLoaded', function () {
    var refresh_button;
    var url;
    var name;
    var status;
    var due;
    var num_of_events;
    var edit_events;
    var settings;
    var visit_moodle;

    Popup.preparePage();
    try {
        refresh_button = document.getElementById('refresh');//Get refresh button
        refresh_button.addEventListener('click', Popup.refresh);//Add event listener to refresh button

        edit_events = document.getElementById('edit_events');//Get link to moodle page
        edit_events.addEventListener('click', Popup.allEvents);//Add event listener to the link

        visit_moodle = document.getElementById('visit_moodle');//Get link to moodle page
        visit_moodle.addEventListener('click', Popup.visitMoodle);//Add event listener to the link
    } catch (e) {
        console.log(e);
    }
});

var Popup = {

    /*
     This function prepares the popup page dynamically adding savailable events.
     */
    preparePage: function () {
        num_of_events = DataAccess.getData("num_of_events");//Get number of available events.

        /*
         Get html tag of event_container, URL, name, staus and due date of each event and send to loadEvent function.
         */
        for (var i = 0; i < num_of_events; ++i) {
            url = DataAccess.getData("url" + i);
            name = DataAccess.getData("name" + i);
            status = DataAccess.getData("status" + i);
            due = DataAccess.getData("due" + i);
            Popup.loadEvent(url, name, status, due);
        }
    },

    /*
     Load all available events to popup page
     */
    loadEvent: function (url, name, status, due) {
        before_event_url = "<article class='underline'><h4 ><a href='";
        before_event_name = "#' target='new'>";
        before_event_status = "</a></h4><p>";
        before_event_due = "</p><div class='date'><span>"
        final_html = "</span></div></article>";

        var event_container;
        event_container = document.getElementById('event_container');//Get location of event container
        event_container.innerHTML = event_container.innerHTML + before_event_url + url + before_event_name + name + before_event_status + status + before_event_due + due + final_html;
    },

    /*
     Write to the local storage that it is required to restart the extension.
     */
    refresh: function () {
        DataAccess.setData("configured", "true");
        window.close();
    },

    /*
     Create a new tab in Google Chrome and direct to the given moodle page.
     */
    allEvents: function () {
        chrome.tabs.create({
            "url": "events.html",
            "selected": true
        });
    },

    /*
     Create a new tab in Google Chrome and direct to the given moodle page.
     */
    visitMoodle: function () {
        chrome.tabs.create({
            "url": DataAccess.getData("moodle_url") + "my",
            "selected": true
        });
    }
}