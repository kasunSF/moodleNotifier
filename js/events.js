var eventElement = "<article class='underline' id='event_id'><button class='button' id='event_unhide' style='float: right;'>Unhide</button><h4><a href='' target='new' id='event_url'>Name</a></h4><p id='event_status'>Status</p><div class='date'><span id='event_due'>Date</span></div></article>";
var eventContainer;
/*
 This function is called when popup page is loaded.
 */
document.addEventListener('DOMContentLoaded', function () {
    eventContainer = $("#event_container");
    preparePage();

    try {
        $("button[id^='event_unhide']").bind("click", unhideEvent);
    } catch (e) {
        console.log(e);
    }
});

/*
 This function prepares the popup page dynamically adding savailable events.
 */
function preparePage() {
    prepareAssignments();
    prepareQuizzes();
    prepareForumPosts();
    showNoEvent();
}

function prepareAssignments() {
    eventContainer.append("<h3 id='assignment_header' style='text-align: center;color: #a8a8a8;display: none'>Assignments</h3>");
    var assignmentIdList = DataAccess.getData("assignment_id_list");
    assignmentIdList = assignmentIdList.substring(0, assignmentIdList.length - 1).split(",");
    assignmentIdList.forEach(function (assignmentID) {
        if (assignmentID != "" && DataAccess.getData("hidden_events").search(assignmentID) != -1) {
            loadEvent(assignmentID);
            $("#assignment_header").show();
        }
    });
}

function prepareQuizzes() {
    eventContainer.append("<h3 id='quiz_header' style='text-align: center;color: #a8a8a8;display: none;padding-top: 10px;'>Quizzes</h3>");
    var quizIdList = DataAccess.getData("quiz_id_list");
    quizIdList = quizIdList.substring(0, quizIdList.length - 1).split(",");
    quizIdList.forEach(function (quizID) {
        if (quizID != "" && DataAccess.getData("hidden_events").search(quizID) != -1) {
            loadEvent(quizID);
            $("#quiz_header").show();
        }
    });
}

function prepareForumPosts() {
    eventContainer.append("<h3 id='forum_header' style='text-align: center;color: #a8a8a8;display: none;padding-top: 10px;'>Forum Posts</h3>");
    var forumIdList = DataAccess.getData("forum_id_list");
    forumIdList = forumIdList.substring(0, forumIdList.length - 1).split(",");
    forumIdList.forEach(function (forumID) {
        if (forumID != "" && DataAccess.getData("hidden_events").search(forumID) != -1) {
            loadEvent(forumID);
            $("#forum_header").show();
        }
    });
}

/*
 Load all available events to popup page
 */
function loadEvent(eventId) {
    var event_url = DataAccess.getData(eventId + "-url");
    var event_name = DataAccess.getData(eventId + "-name");
    var event_status = DataAccess.getData(eventId + "-status");
    var event_due = DataAccess.getData(eventId + "-due");

    //console.log(event_url);
    //console.log(event_name);
    //console.log(event_status);
    //console.log(event_due);

    eventContainer.append(eventElement);
    $("#event_id").attr("id", eventId);
    $("#event_url").text(event_name).attr("href", event_url).attr("id", "event_url-" + eventId);
    $("#event_status").text(event_status).attr("id", "event_status-" + eventId);
    $("#event_due").text(event_due).attr("id", "event_due-" + eventId);
    $("#event_unhide").attr("id", "event_unhide_" + eventId).attr("event", eventId);
}

function unhideEvent(event) {
    var eventID = $(event.toElement).attr("event");
    var hiddenEventList = DataAccess.getData("hidden_events");
    if (hiddenEventList.search(eventID) != -1) {
        DataAccess.setData("hidden_events", hiddenEventList.replace(eventID + ",",""));
        DataAccess.setData("configured", "true");
    }
    var eventElement = $("#" + eventID);
    eventElement.slideUp("slow", function () {
        eventElement.remove();
        if (eventID.search("assign") != -1 && eventContainer.find("article[id^='assign']").length == 0) {
            $("#assignment_header").slideUp("slow", showNoEvent());
        }
        if (eventID.search("quiz") != -1 && eventContainer.find("article[id^='quiz']").length == 0) {
            $("#quiz_header").slideUp("slow", showNoEvent());
        }
        if (eventID.search("forum") != -1 && eventContainer.find("article[id^='forum']").length == 0) {
            $("#forum_header").slideUp("slow", showNoEvent());
        }
    });
}

function showNoEvent() {
    if (eventContainer.find("article").length == 0) {
        if (DataAccess.getData("hidden_events") == "") {
            eventContainer.append("<article class='underline' id='event_id'><h4>No hidden events!<br>You may hide any unwanted event.</h4></article>")
        }
    }
}