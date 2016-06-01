// Hey ya fuckin weirdos its ya boy shotty steve
// lets make some fuckin code boys
console.log("global script running");
var fail = 0;
var GalleryRegex = /\w+(?=[^/]*$)/gm; // i hate regex


// This hack was done because content scripts are isolated from global page variables. The
// global "Imgur" variable cannot be accessed "normally", so this is how I implemented it for now.
(function () {
    var th = document.getElementsByTagName("body")[0];
    var s = document.createElement('script');
	s.setAttribute("id", "iceHack");
    s.innerHTML = //this hack is because the content script is isolated from the actual page's window object.
		"var superHack = document.getElementById('iceHack');" +
		"superHack.setAttribute('signed', window.Imgur.Environment.signed);" +
		"superHack.setAttribute('userId', Imgur.Environment.auth.id);";

    th.appendChild(s);
	var test = window.location.href.match(GalleryRegex);
	if (window.location.href.indexOf("imgur.com/account/favorites") > -1 && (test === null || test[0] === "favorites")) { //make sure its not a favorites/<id> page.
		var page = "favorites";
	} else {
		var page = "gallery";
	}
	msgBg("load", { "signed": $("#iceHack").attr("signed"), "userId": $("#iceHack").attr("userId"), "page": page});
})();

/* example of what the user looks like in storage
123332: {
	posts: [
		{
			galleryId: 12345
			favorited: true,
			tags: [0, 1, 2]
		}
	]
	allTags: [
		{"name": "one", "num": 0}
		{"name": "two", "num": 1}
		{"name": "three", "num": 2}
		{"name": "four", "num": 3}
	]
}*/

function msgBg(type, jsonInfo, callback) {
	var msg = {
		"from": "page",
		"type": type,
		"info": jsonInfo
	};
	//console.log("sending message: ");
	//console.log(msg);
	chrome.runtime.sendMessage(msg, function(resp) {
		//console.log("got reply: ");
		//console.log(resp);
		if (callback) {
			callback(resp);
		}
	});
}

function getGalleryId() {
	var url = window.location.href;
	var matches = url.match(GalleryRegex);
	if (matches) {
		return matches[0];
	} else {
		return url.substring(url.indexOf("gallery/") + 8).replace("?", "");
	}
}


