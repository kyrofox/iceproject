//create tag menu

//<on every page>
var iceTagMenu = $('<div id="iceTagMenu">' +
		'<div id="iceTagList">' +
		'</div>' +
		'<input type="text">' +
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
		} else {
			newTag.addClass("checked");
			//send message to background to add tag
		}
	});
	return newTag;
}

iceTagMenu.find("#iceTagList").append(makeTag(false, "yo"));


$('#under-image').append(iceTagMenu);



console.log("hello");





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