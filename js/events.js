/*
 This function is called when popup page is loaded.
 */
document.addEventListener('DOMContentLoaded', function () {
    var event_container;
    var num_of_events;
    var url;
    var name;
    var status;
    var due;
    var button;


    event_container = document.getElementById('event_container');//Get location of event container in events.html
    button = "<br><button type='button' class='button' id='submit' style='float: right;'title='Hide selected events'>Hide</button><br>";//Submit button
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
    event_container.innerHTML = event_container.innerHTML + button;//Place the submit button at the bottom of the events page.
});

/*
This function loads each event to the events.html page with a check box for each event.
 */
function loadEvent(event_container, url, name, status, due) {
    var before_event_url;
    var before_event_name;
    var before_event_status;
    var before_event_due;
    var final_html;

    before_event_url = "<article class='underline'><h4 ><input type='checkbox'><a href='";
    before_event_name = "#' target='new'>";
    before_event_status = "</a></h4><p>";
    before_event_due = "</p><div class='date'><span>";
    final_html = "</span></div></article>";

    event_container.innerHTML = event_container.innerHTML + before_event_url + url + before_event_name + name + before_event_status + status + before_event_due + due + final_html;
}