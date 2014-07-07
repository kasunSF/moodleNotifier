//JavaScript for navigate menu in options page
function showContent(event) {
    $('.content').each(function (index) {
        if (!($(this).hasClass('invisible')))
            $(this).addClass('invisible');

        if (index == event.target.id)
            $(this).removeClass('invisible');
    });

    $('ul.menu > li > a').each(function (index) {
        $(this).removeClass('active');

        if (index == event.target.id)
            $(this).addClass('active');
    });
}

//JavaScript for set default menu in options page
function defaultView(contentId) {
    $('.content').each(function (index) {
        if (index == contentId)
            $(this).removeClass('invisible');
    });
}

//Event listener
document.addEventListener('DOMContentLoaded', function () {
  var menu = document.querySelectorAll('li');//Get menu list
  for (var i = 0; i < menu.length; ++i) {
    menu[i].addEventListener('click', showContent);//Add event listener to the menu
  }
  defaultView(0);//Set default view of the menu: "General settings"
});



function playNotificationSound() {
   var source;
	  source = "sounds/"+document.getElementById("alert").value;//Direct to the location of sound file

   try {
      var audioElement = new Audio();
      audioElement.src = source;
      audioElement.play();
   } catch (e) {
      console.error(e);
   }
}