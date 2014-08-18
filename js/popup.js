var looper;
var degrees = 0;

/*
 This function is called when popup page is loaded.
 */
document.addEventListener('DOMContentLoaded', function () {
    var refresh_button = document.getElementById('refresh');//Refreshbutton

    refresh_button.addEventListener('click', refresh);//Add event listener to refresh button
});

function refresh() {
    console.log("Hello");
}