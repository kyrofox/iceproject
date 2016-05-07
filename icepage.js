var fail = 0;


// Hey ya fuckin weirdos its ya boy shotty steve
// lets make some fuckin code boys

(function () { //this is pretty hacky- if you can, figure out how to do this less hacky u get 10 imaginary points
    var th = document.getElementsByTagName("body")[0];
    var s = document.createElement('script');
	s.setAttribute("id", "iceHack");
    s.innerHTML = 
		"var superHack = document.getElementById('iceHack');" +
		"superHack.setAttribute('signed', window.Imgur.Environment.signed);" +
		"superHack.setAttribute('userId', Imgur.Environment.auth.id);";
    th.appendChild(s);
	msgBg("load", {"signed": $("#iceHack").attr("signed"), "userId": $("#iceHack").attr("userId")});
})();

/*var 

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

var messages = [];
/*
payload format
*/


function makeTag(initialValue, tagName, tagNum) {
	var newTag = $('<span class="iceTag ' + (initialValue ? "checked" : "") + '"><span class="iceTagSquare">✔</span> <span class="iceTagText">' + tagName + '</span></span>' );
	newTag.click(function() {
		if (newTag.hasClass("checked")) {
			//send message to background to remove tag
			newTag.removeClass("checked");
			msgBg("removeTagFromPost", { "id": getGalleryId(), "tagNum": tagNum}); //ideally, we should not req tagName, but instead make sure that the tagList is always updated, so tagnum stays g
		} else {
			newTag.addClass("checked");
			msgBg("addTagToPost", { "id": getGalleryId(), "tagNum": tagNum });
			//send message to background to add tag
		}
	});
	return newTag;
}

function refreshTags() {
	// hide menu
	// get tags from BG
	msgBg("getAllTags", "", function(resp) {
		var allTags = resp;
		// get post's tags
		msgBg("getPost", {"id": getGalleryId()}, function(resp) {
			var post = resp;
			
			// for each tag in alltags, go through and create each one. if any of them are on the post, check them.
			var newTagElements = [];
			for(var i = 0; i < allTags.length; i++) {
				var checked = false;
				if (post) {
					for (var j = 0; j < post.tags.length; j++) {
						if (post.tags[j] === allTags[i].num) {
							checked = true;
						}
					}
				}
				newTagElements.push(makeTag(checked, allTags[i].name, allTags[i].num));
			}
			// clear tags
			$("#iceTagList").empty(); 

			// add to dom
			$("#iceTagList").append(newTagElements);
			var height = 0;
			for (var i = 0; i < newTagElements.length; i++) {
				height += newTagElements[i].outerHeight(true);
			}
			
			$("#iceTagList").height(height + "px");
		});
	});
	
	
	
	
}

function makeTagMenu(includeTags) {
	var iceTagMenu = 
		$(	'<div id="iceTagMenu">' +
				'<div id="iceTagList"></div>' +
			'</div>');
			
	if (includeTags) {
		refreshTags();
	}
	var iceTagInput = $('<input id="newTag" type="text" placeholder= "new tag? :P">');
	iceTagInput.keypress(function (e) {
		if (e.which == 13) {
			// check if it exists already
			// if it doesn't, add it to allTags
			if ($("#newTag").val().length > 0) { //basic validation
				msgBg("createTag", {"tagName": $("#newTag").val()}, function(resp) {
					if (resp.success === true) {
						msgBg("addTagToPost", {
							"id": getGalleryId(),
							"tagNum": resp.tag.num
						}, function(resp) {
							refreshTags();
							$("#newTag").val("");
							if (fail > 0) {
								$("#newTag").attr("placeholder", "thanks :)");
								fail = 0;
								window.setTimeout(function() {
									$("#newTag").attr("placeholder", "new tag? :P");
								}, 500);
							}
						});
						
						/*
						var newTag = makeTag(true, $("#newTag").val());
						
						$("#iceTagList").append(newTag);
						$("#iceTagList").height($("#iceTagList").height() + newTag.outerHeight(true) + "px");
						*/
						
						

						
					} else {
						if (resp.msg === "Tag already exists.") {
							msgBg("addTagToPost", {
								"id": getGalleryId(),
								"tagNum": resp.tag.num
							}, function(resp) {
								refreshTags();
								$("#newTag").val("");
							});
						}
						//bad stuff
					}
				});
			} else {
				whale = fail % 7;
				
				if (whale === 0) {
					$("#newTag").attr("placeholder", "what");
				} else if (whale === 1) {
					$("#newTag").attr("placeholder", "no, stop");
				} else if (whale === 2) {
					$("#newTag").attr("placeholder", "seriously");
				} else if (whale === 3) {
					$("#newTag").attr("placeholder", "why are you doing this");
				} else if (whale === 4) {
					$("#newTag").attr("placeholder", "just fucking type something");
				} else if (whale === 5) {
					$("#newTag").attr("placeholder", "please");
				} else if (whale === 6) {
					$("#newTag").attr("placeholder", "wow");
				}
				fail++;
				
				window.setTimeout(function() {
					$("#newTag").attr("placeholder", "new tag? :P");
				}, 500);
				
			}
			// update view
		}
	});
		
	iceTagMenu.append(iceTagInput);
	$('#under-image').append(iceTagMenu);
}

//run this on every page
function main() {
	msgBg("getPost", {"id": getGalleryId()}, function(resp) {
		var post = resp;
		if (!post) {
			//post is null, do nothing
		} else if (post.favorited === true) {
			makeTagMenu();
		} else {
			
		}
	
	});
}

var hoverTimeout;
$(".favorite-image").hover( 
	function(e) {
		if ($(this).hasClass("favorited")) {
			$("#iceTagMenu").show()
		}
		if (hoverTimeout) {
			window.clearTimeout(hoverTimeout);
			hoverTimeout = "";
		}
	}, function(e) { //make it so it sets a timeout to hide, unless the person is hovering on top of the tag menu. hide if not
		hoverTimeout = window.setTimeout(function() {
			$("#iceTagMenu").hide();
		}, 500);
	}
).click(function() {
	if ($(this).hasClass("favorited")) {
		$("#iceTagMenu").show()
	} else {
		$("#iceTagMenu").hide();
	}
});

makeTagMenu(true);
$("#iceTagMenu").hide();

$("#iceTagMenu").hover( 
	function(e) {
		if (hoverTimeout) {
			window.clearTimeout(hoverTimeout);
			hoverTimeout = "";
		}
	}, function(e) {
		hoverTimeout = window.setTimeout(function() {
			$("#iceTagMenu").hide();
		}, 500);
	}
);



/*
function main() {
	$("#iceTagMenu").remove(); //if it already exists.
	var iceTagMenu = $('<div id="iceTagMenu">' +
		'<div id="iceTagList">' +
		'</div>' +
		'<input id="newTag" type="text" placeholder= "new tag? :P">' +
		'</div>');
	var tagList; //there can be a lot of bugs using tagList in this scope for makeTag... be careful
	function makeTag(checked, tagNum) {
		var tagName = tagList[tagNum];
		var newTag = $('<span class="iceTag ' + (checked ? "checked" : "") + '"><span class="iceTagSquare">✔</span> <span class="iceTagText">' + tagName + '</span></span>' );
		newTag.click(function() {
			if (newTag.hasClass("checked")) {
				//send message to background to remove tag
				newTag.removeClass("checked");
				msgBg("removeTag", { "postId": getGalleryId(), "tagNum": tagNum}); //ideally, we should not req tagName, but instead make sure that the tagList is always updated, so tagnum stays g
			} else {
				newTag.addClass("checked");
				msgBg("addTagToPost", { "postId": getGalleryId(), "tagNum": tagNum });
				//send message to background to add tag
			}
		});
		return newTag;
	}

	msgBg("getGalleryPost", { galleryId: getGalleryId() }, function(galleryPost) {
		console.log("galleryPost");
		console.log(galleryPost);
		msgBg("getAllTags", "", function(allTags) {
			console.log(allTags);
			for (var i = 0; i < allTags.length; i++) {
				iceTagMenu.find("#iceTagList").append( makeTag( 
					galleryPost.tags.indexOf(allTags[i]) > -1,
					allTags[i]));
			}
			
			iceTagMenu.find("#iceTagList").height(iceTagMenu.find("#iceTagList").find("span").outerHeight(true) * allTags.length + "px");
		});
	}); 
	
	$('#under-image').append(iceTagMenu);
	$("#iceTagMenu").find("input").keypress(function (e) {
		if (e.which == 13) {
			// check if it exists already
			// if it doesn't, add it to allTags
			if ($("#newTag").val().length > 0) {
				msgBg("createTag", {"tag": $("#newTag").val()}, function(resp) {
					if (resp.success === true) {
						msgBg("addTagToPost", {
							galleryId: getGalleryId(),
							tag: $("#newTag").val()
						});
						one way to do it
						var newTag = makeTag(true, $("#newTag").val());
						$("#iceTagList").append(newTag);
						$("#iceTagList").height($("#iceTagList").height() + newTag.outerHeight(true) + "px");
						
						
						refreshTags();
						$("#newTag").val("");
						
					} else {
						//bad stuff
					}
				});
			} else {
				//bad stuff
			}
			// update view
		}
	});

}
*/

// select the target node
var target = document.querySelector('#inside > div.left.post-pad > div.post-container > div.post-images');
// create an observer instance
var observer = new MutationObserver(function(mutations) {
	console.log("ok");
	refreshTags();
});

// configuration of the observer:
var config = { attributes: true };
// pass in the target node, as well as the observer options
observer.observe(target, config);

function msgBg(type, jsonInfo, callback) {
	var msg = {
		"from": "page",
		"type": type,
		"info": jsonInfo
	};
	console.log("sending message: ");
	console.log(msg);
	chrome.runtime.sendMessage(msg, function(resp) {
		console.log("got reply: ");
		console.log(resp);
		if (callback) {
			callback(resp);
		}
	});
}

function getGalleryId() {//figure out a better way to do this, then set multiple ways to do it so if one fails use next.
	var url = window.location.href;
	return url.substring(url.indexOf("gallery/") + 8);
}
//makeTagMenu(true);

// perhaps every week or so delete old favorites?
//<on every page>

/*
$("#under-image > div > span.favorite-image").click(function() {
	if ($(this).hasClass("favorited")) {
		//display menu element, position it adjacent to the top right corner of favorites button
		//$('#under-image').append(iceTagMenu);
	
	}
});
function handleResponse(response) {
	if (response.type === "gallery") {
		
	}
}

HAw0r1n: {
	favorited: true,
	tags: ["okay", "pls", "nty"],
	time: 123123123123213
}

function waitUntilImgurLoads(callback) {
	window.setTimeout(function() {
		try {
			var ok = window.Imgur.Environment.signed;
		} catch(e) {
			console.log("what");
			waitUntilImgurLoads(callback);
		
		}
	}, 100);
}

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


// <display menu element>
//message background script and ask it for what tags exist
//
//get id
//message background script and ask it for what tags the id has
//


httpGetAsync("http://imgur.com/account/favorites/newest/page/1/miss?scrolled", function(response) {
	console.log(response);
});

var favBtn = document.querySelector();
document.createElement("div");
*/