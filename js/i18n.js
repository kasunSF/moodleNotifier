/*  
    Mail Checker Plus for Google Mail™
    - Localization file -   
*/

var languages = new Array();

// English
languages["en"] = {
    "id" : "en",
    "what" : "English",
    "months" : new Array("jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"),
    "readLink" : "Read",
    "readLinkTitle" : "Mark as read",
    "unreadLink": "Unread",
    "unreadLinkTitle" : "Mark as unread",
    "deleteLink" : "Delete",
    "deleteLinkTitle" : "Delete mail",
    "spamLink" : "Spam",
    "spamLinkTitle" : "Mark as spam",
    "archiveLink" : "Archive",
    "archiveLinkTitle" : "Archive mail",
    "starLinkTitle" : "Star mail",
    "openLinkTitle" : "Open in webmail",
    "replyLinkTitle" : "Reply to mail",
    "summaryLinkTitle" : "Show summary",
    "fullLinkTitle" : "Show full message",
    "refreshLinkTitle" : "Refresh all mailboxes",
    "optionsLinkTitle" : "Go to the options page",
    "sendPageLinkTitle" : "Send page link",
    "composeLinkTitle" : "Compose new mail",
    "noUnreadText" : "No unread mail",
    "oneUnreadText" : "unread mail", // One unread item: "1 unread mail"
    "severalUnreadText" : "unread mail", // Several unread items: "3 unread mail"
    "popupText" : "You have received new mail!"
};
    "noUnreadText" : "Ez duzu irakurri gabeko mezurik",
    "unreadText" : "Irakurri gabeko mezuak",
    "popupText" : "Mezu berria jaso duzu!"
};

if(localStorage["gc_language"] == null) {
    localStorage["gc_language"] = "en";
}

function get_lang_string(name)
{
	if ( this.selected_lang[name] == null)
	{
		return this.default_lang[name];	
	}
	else
	{
		return this.selected_lang[name];
	}

}

i18n = new Object();
i18n.selected_lang = languages[localStorage["gc_language"]];
i18n.default_lang = languages['en']; // Fall back to English if there is no translation
i18n.get = get_lang_string;

function reloadLanguage() {
    i18n.selected_lang = languages[localStorage["gc_language"]];
	i18n.default_lang = languages['en']; // Fall back to English if there is no translation
}