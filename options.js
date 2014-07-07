function showContent(contentId) {
    $('.content').each(function (index) {
        if (!($(this).hasClass('invisible')))
            $(this).addClass('invisible');

        if (index == contentId)
            $(this).removeClass('invisible');
    });

    $('ul.menu > li > a').each(function (index) {
        $(this).removeClass('active');

        if (index == contentId)
            $(this).addClass('active');
    });
}


//Preview alert sounds
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