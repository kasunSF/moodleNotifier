var notification;

/*
 Show desktop notification for a specific period of time.
 title: Title of the notification
 body: Notification body
 url: Redirect url on click
 timeout: Notification period
 */
function notify(title, body, url, timeout) {
    if (window.webkitNotifications) {
        notification = webkitNotifications.createNotification(title, body, "/img/icon128.png");
    } else {
        notification = new Notification(title, {body: body, icon: "/img/icon128.png"});
    }

    /*
     Close the notification on click and redirect to url in a new tab.
     */
    notification.onclick = function () {
        chrome.tabs.create({ url: url });
        this.close();
    }

    /*
     Close the notification after timeout.
     */
    setTimeout(function () {
        if (notification) {
            if (window.webkitNotifications) {
                notification.cancel();
            } else {
                notification.close();
            }
        }
    }, timeout);
}

/*
 Show desktop notification until user closes it or clicks on it.
 title: Title of the notification
 body: Notification body
 url: Redirect url on click
 */
function notifyEver(title, body, url) {
    if (window.webkitNotifications) {
        notification = webkitNotifications.createNotification(title, body, "/img/icon128.png");
    } else {
        notification = new Notification(title, {body: body, icon: "/img/icon128.png"});
    }

    /*
     Close the notification on click and redirect to url in a new tab.
     */
    notification.onclick = function () {
        chrome.tabs.create({ url: url });
        this.close();
    }
}

/*
 Function to play notification sounds that are available in the extension as preview.
 */
function playAlert(alertID) {
    var source;
    source = "sounds/" + alertID;//Direct to the location of sound file

    try {
        var audioElement = new Audio();
        audioElement.src = source;
        audioElement.play();
    } catch (e) {
        console.error(e);
    }
}