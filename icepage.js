//create tag menu

//<on every page>
var iceTagMenu = $('<div id="iceTagMenu">' +
		'<div id="iceTagList">' +
			'<span class="iceTag"> <span class="iceTagSquare">✔</span> <span class="iceTagText">tag example</span></span>' +
			'<span class="iceTag"> <span class="iceTagSquare">✔</span> <span class="iceTagText">tag example</span></span>' +
			'<span class="iceTag"> <span class="iceTagSquare"></span> <span class="iceTagText">tag example</span></span>' +
			'<span class="iceTag"> <span class="iceTagSquare"></span> <span class="iceTagText">tag example</span></span>' +
			'<span class="iceTag"> <span class="iceTagSquare"></span> <span class="iceTagText">tag example</span></span>' +
			'<input type="text">' +
		'</div>' +
'</div>');

$("#under-image > div > span.favorite-image").click(function() {
	if ($(this).hasClass("favorited")) {
		//display menu element, position it adjacent to the top right corner of favorites button
		//$('#under-image').append(iceTagMenu);
	
	}
});

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