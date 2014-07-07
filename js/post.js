function onLoad() {
    var form = document.forms[0];
    var params = getUrlVars(window.location.href);

    var url = decodeURIComponent(params["url"]);
    form.setAttribute("action", url);

    var postData = decodeURIComponent(params["postData"]);

    var parts = postData.split("&");

    for (var i=0; i < parts.length; i++) {

        var pair = parts[i].split("=");

        var input = document.createElement("input");

        input.setAttribute("type", "hidden");
        input.setAttribute("name", pair[0]);
        input.setAttribute("value", pair[1]);

        form.appendChild(input);
    }

    document.forms[0].submit();
}

function getUrlVars(url) {
    var map = {};
    url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
        map[key] = value;
    });
    return map;
}

document.addEventListener('DOMContentLoaded', function () {
    onLoad();
});
