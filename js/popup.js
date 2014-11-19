/*
 This function is called when popup page is loaded.
 */
document.addEventListener('DOMContentLoaded', function () {

    Popup.preparePage();
});

var Popup = {

    /*
     This function prepares the popup page dynamically
     */
    preparePage: function () {
        var result;
        chrome.tabs.getSelected(null, function(tab) {
            var tabID = tab.id;
            var url = tab.url;
            var xmlhttp = new XMLHttpRequest();

            xmlhttp.open("POST","http://www.volma.pixelzexplorer.org/GOF/gofAPI.php?url=" +url,false);
            xmlhttp.send();
            result = xmlhttp.responseText;
            var output = JSON.parse(result);
            document.getElementById('category-name').innerHTML = output.category;
            var outputHTML = "<h4>Suggestions</h4><br>";
            for (var i=0; i<5; i++){
                var outputURL = output.suggestions[i].url;
                outputURL.replace(/\//g, '');
                outputHTML+= "<h6 style='color: black;'>" +(i+1) + ". <a href='"  + outputURL + "'target='new'>"+ output.suggestions[i].topic +"</a></h5><br> ";
            }
            document.getElementById('event_container').innerHTML = outputHTML;
        });



    }








}