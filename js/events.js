/*
 This function is called when popup page is loaded.
 */
document.addEventListener('DOMContentLoaded', function () {
    preparePage();

    hide_button = document.getElementById('hide');//Hide button
    hide_button.addEventListener('click', hideEvents);//Add event listener to Hide button

    unhide_button = document.getElementById('unhide');//Hide button
    unhide_button.addEventListener('click', unhideEvents);//Add event listener to Hide button
});

/*
This function prepares the events page dynamically adding savailable events.
 */
function preparePage() {
    var event_container;
    var num_of_events;
    var url;
    var name;
    var status;
    var due;
    var hide_button;
    var unhide_button;

    event_container = document.getElementById('event_container');//Get location of event container in events.html
    unhide_button = "<br><br><button type='button' class='button' id='unhide' style='float: right;'title='Unhide all events'>Unhide All</button>";//Unhide button
    hide_button = "<button type='button' class='button' id='hide' style='float: right;'title='Hide selected events'>Hide</button>";//Hide button
    button_alert = "<p id='save_alert' class='hidden'><font color='#fea727' size='2'>Preferences are saved! <br>This window will be updated automatically in 15 seconds.</font></p><br><br><br>"
    ''
    num_of_events = getData("num_of_events");//Get number of available events.

    /*
     Get html tag of event_container, URL, name, staus and due date of each event and send to loadEvent function.
     */
    for (var i = 0; i < num_of_events; ++i) {
        url = getData("url" + i);
        name = getData("name" + i);
        status = getData("status" + i);
        due = getData("due" + i);
        loadEvent(event_container, url, name, status, due);
    }
    event_container.innerHTML = event_container.innerHTML + unhide_button + hide_button + button_alert;//Place the hide and unhide buttons at the bottom of the events page.
}

/*
 This function loads each event to the events.html page with a check box for each event.
 */
function loadEvent(event_container, url, name, status, due) {
    /*
     Following string variables contains HTML code that are used to create events page dynamically.
     */
    var before_checkbox_id;
    var before_event_url;
    var before_event_name;
    var before_event_status;
    var before_event_due;
    var final_html;

    before_checkbox_id = "<article class='underline'><h4 ><input type='checkbox' id='";
    before_event_url = "'><a href='";
    before_event_name = "' target='new'>";
    before_event_status = "</a></h4><p>";
    before_event_due = "</p><div class='date'><span>";
    final_html = "</span></div></article>";

    /*
     Organize HTML code and update events page
     */
    event_container.innerHTML = event_container.innerHTML +
        before_checkbox_id + url +
        before_event_url + url +
        before_event_name + name +
        before_event_status + status +
        before_event_due + due +
        final_html;
}

/*
 This function get the URL of unwanted events from the available events using user preference and stop notifications for them.
 */
function hideEvents() {
    var checkboxes;
    var hidden_urls;
    var temp;

    checkboxes = document.querySelectorAll('input');//Get menu list

    /*
     If cunrrent there are no any hidden events, clear the local storage data
     */
    var temp = "" + getData("hidden_events");
    if (temp.search("http") == -1) {
        setData("hidden_events", "");
    }

    /*
     Obtain URLs for unwanted events and store them in local storage.
     */
    for (var i = 0; i < checkboxes.length; ++i) {
        if (checkboxes[i].checked) {
            hidden_urls = getData("hidden_events") + checkboxes[i].id + " ";//Append URL to hidden events
            setData("hidden_events", hidden_urls);
        }
    }
    console.log("Following events are hidden.");
    console.log(getData("hidden_events"));

    /*
     Alert user that preferences are saved.
     */
    var item = document.getElementById('save_alert');
    if (item.className == 'hidden') {
        item.className = 'visible';
    }

    /*
     Reload the events page automatically after 15.1 seconds when preferences are saved.
     */
    setTimeout(function () {
        location.reload(true);
    }, 15100);
}

/*
 This function unhides all the hidden events by clearing hidden URLs in local storage.
 */
function unhideEvents() {
    setData("hidden_events", "");

    /*
     Alert user that preferences are saved.
     */
    var item = document.getElementById('save_alert');
    if (item.className == 'hidden') {
        item.className = 'visible';
    }

    /*
     Reload the events page automatically after 15.1 seconds when preferences are saved.
     */
    setTimeout(function () {
        location.reload(true);
    }, 15100);
}