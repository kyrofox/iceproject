// Hey ya fuckin weirdos its ya boy shotty steve
// lets make some fuckin code boys

(function () { //this is pretty hacky- if you can, figure out how to do this less hacky ty
    var th = document.getElementsByTagName("body")[0];
    var s = document.createElement('script');
	s.setAttribute("id", "iceHack");
    s.innerHTML = 
	"var superHack = document.getElementById('iceHack');" +
	"superHack.setAttribute('signed', window.Imgur.Environment.signed);" +
	"superHack.setAttribute('userId', Imgur.Environment.auth.id);";
    th.appendChild(s);
})();

/*
function waitUntilImgurLoads(callback) {
	window.setTimeout(function() {
		try {
			var ok = window.Imgur.Environment.signed;
		} catch(e) {
			console.log("what");
			waitUntilImgurLoads(callback);
		
		}
	}, 100);
}*/
/*
(function () {
	currentUser = {};
	var msg = { 
			signed: Imgur.Environment.signed,
			currentUser: currentUser
		};
	
	if (window.Imgur.Environment.signed) {
		currentUser.id = Imgur.Environment.auth.id; //get this information to store the tags unique per user.
		currentUser.email = Imgur.Environment.auth.email;
	}
	
	if (true) { //
		msg.galleryId = getGalleryId();
		msgBg("gallery", msg, handleResponse);
	}

});
*/
function getAllTags(callback) {
	msgBg("getAllTags", "", callback);
}

function handleResponse(response) {
	if (response.type === "gallery") {
		
	}
}


function msgBg(type, jsonInfo, callback) {
	var msg = {
		"from": "page",
		"type": type,			
		"info": jsonInfo
	};
	console.log("sending message: ");
	console.log(msg);
	chrome.runtime.sendMessage(msg, callback);
}




// perhaps every week or so delete old favorites?

//<on every page>
var iceTagMenu = $('<div id="iceTagMenu">' +
		'<div id="iceTagList">' +
		'</div>' +
		'<input type="text" placeholder= "new tag? :P">' +
'</div>');

$("#under-image > div > span.favorite-image").click(function() {
	if ($(this).hasClass("favorited")) {
		//display menu element, position it adjacent to the top right corner of favorites button
		//$('#under-image').append(iceTagMenu);
	
	}
});

function makeTag(checked, tagName) {
	var newTag = $('<span class="iceTag ' + (checked ? "checked" : "") + '"><span class="iceTagSquare">✔</span> <span class="iceTagText">' + tagName + '</span></span>' );
	newTag.click(function() {
		if (newTag.hasClass("checked")) {
			newTag.removeClass("checked");
			//send message to background to remove tag
			msgBg("removeTag", {
				galleryId: getGalleryId(),
				tag: tagName
			});
		} else {
			newTag.addClass("checked");
			msgBg("addTag", {
				galleryId: getGalleryId(),
				tag: tagName
			});
			//send message to background to add tag
		}
	});
	return newTag;
}

msgBg("getGalleryPost", { galleryId: getGalleryId() }, function(galleryPost) {
	getAllTags(function(allTags) {
		for (var i = 0; i < allTags.length; i++) {
			iceTagMenu.find("#iceTagList").append( makeTag( 
				galleryPost.tags.indexOf(allTags[i]) > -1,
				allTags[i]
			));
		}
	});
	


});




/*
iceTagMenu.find("#iceTagList").append(makeTag(false, "yo"));
iceTagMenu.find("#iceTagList").append(makeTag(false, "HEYtherewhatsupdude"));
iceTagMenu.find("#iceTagList").append(makeTag(false, "goodfriendshipsmustberoutinely"));
iceTagMenu.find("#iceTagList").append(makeTag(false, "yo"));
*/

$('#under-image').append(iceTagMenu);
/*HAw0r1n: {
	favorited: true,
	tags: ["okay", "pls", "nty"],
	time: 123123123123213
}*/
console.log("hello");









function getGalleryId() {//figure out a better way to do this, then set multiple ways to do it so if one fails use next.
	var url = window.location.href;
	
	return url.substring(url.indexOf("gallery/") + 8);
}
// <display menu element>
//message background script and ask it for what tags exist
//
//get id
//message background script and ask it for what tags the id has
//

/*

httpGetAsync("http://imgur.com/account/favorites/newest/page/1/miss?scrolled", function(response) {
	console.log(response);
});

var favBtn = document.querySelector();
document.createElement("div");*/