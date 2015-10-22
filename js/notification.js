/*
 Show desktop notification for a specific period of time.

 title: Title of the notification
 body: Notification body
 url: Redirect url on click
 timeout: Notification period
 */
function notify(title, body, url, timeout) {
    var notification = new Notification(title, {body: body, icon: "/img/icon_active.png"});

    /*
     Close the notification on click and redirect to url in a new tab.
     */
    notification.onclick = function () {
        chrome.tabs.create({url: url});
        this.close();
    };
    /*
     Close the notification after timeout.
     */
    setTimeout(function () {
        notification.close();
    }, timeout);
}

/*
 Show desktop notification until user closes it or clicks on it.

 title: Title of the notification
 body: Notification body
 url: Redirect url on click
 */
function notifyEvent(title, body, url) {
    var notification = new Notification(title, {body: body, icon: "/img/icon_active.png"});

    /*
     Close the notification on click and redirect to url in a new tab.
     */
    notification.onclick = function () {
        chrome.tabs.create({url: url});
        this.close();
    }
}

/*
 Function to play notification sounds that are available in the extension as preview.

 alertID: ID od the audio file which is chosen by user.
 */
function playAlert(alertID) {
    var source;
    var audioElement;

    source = "sounds/" + alertID;//Direct to the location of sound file

    try {
        audioElement = new Audio();
        audioElement.src = source;
        audioElement.play();
    } catch (e) {
        console.error(e);
    }
}