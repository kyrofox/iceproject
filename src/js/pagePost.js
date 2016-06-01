// Hey ya fuckin weirdos its ya boy shotty steve
// lets make some fuckin code boys

console.log("post script running")

var fail = 0;
var GalleryRegex = /\w+(?=[^/]*$)/gm; // i hate regex

// This function is run on every page that isn't the favorites page.
function galleryPage() {
	//try to create the tag menu.
	makeTagMenu(false);
	// this is the proest ux code btw
	// By default, if the post is favorited, the tag menu displays on page after a second.
	// Once the user scrolls the menu into view, it will set a timeout for 2 seconds to make the menu disappear.
	// If the post is not favorited, the tag menu will not display.
	// If the favorite button is hovered over and the post is favorited, the tag menu will display.
	// Once the cursor leaves the favorite button, the menu will close after .5 seconds, unless the cursor hovers over the favorite button
	// or the tag menu. Once the cursor leaves either of these, the menu will close after .5 seconds.
	var cool = function() {
		if ($(".favorite-image").hasClass("favorited")) {
			if (isScrolledIntoView("#iceTagMenu")) {//theres a slight slight edge case bug for long posts here.
				window.setTimeout(function() {
					refreshTags();
					$("#iceTagMenu").fadeIn(300);
					//console.log("Fave button scrolled into view and post is faved. Displaying menu automatically.");
					hoverTimeout = window.setTimeout(function() {
						$("#iceTagMenu").fadeOut(300);
					}, 2000);
				}, 500);
			} else {
				window.setTimeout(cool, 500);
			}
		}
	}

	var hoverTimeout = window.setTimeout(cool, 1000);
	
	function cancelTimeout() {
		if (hoverTimeout) {
			window.clearTimeout(hoverTimeout);
			hoverTimeout = "";
		}
	}
	
	function startHideTimeout() {
		hoverTimeout = window.setTimeout(function() {
			$("#iceTagMenu").fadeOut(300);
		}, 500);
	}
	
	//hovering over the heart will show and refresh the tag menu. hovering out of the heart will start the timeout.
	$(".favorite-image").hover(
		function(e) {
			if ($(".favorite-image").hasClass("favorited")) {
				cancelTimeout();
				refreshTags();
				$("#iceTagMenu").fadeIn(200);
			}
		}, function(e) { //make it so it sets a timeout to hide, unless the person is hovering on top of the tag menu. hide if not
			startHideTimeout();
		}
	//clicking on the heart will show the menu if the action was a favorite, otherwise, hides menu. 200ms fadein or fadeout.
	).click(function(e) {
		e.stopPropagation();
		window.setTimeout(function() {
			if ($(".favorite-image").hasClass("favorited")) {
				cancelTimeout();
				refreshTags();
				$("#iceTagMenu").fadeIn(200);
			} else {
				$("#iceTagMenu").hide();
			}
		}, 100);
	});
	
	//hovering over the menu will cancel the timeout, unhovering the menu will start the timeout.
	$("#iceTagMenu").hover(cancelTimeout, startHideTimeout).click(function(e) { e.stopPropagation(); });
		
	//clicking outside of the menu will make the menu hide.
	$(document).click(function() { $("#iceTagMenu").hide(); });

	// end of pro ux code. seriously, like why dont people spend a lot of time on this, its kinda fun.
	var target = document.querySelector('#inside > div.left.post-pad > div.post-container > div.post-images');
	if (target) { // this is kinda dirty. should just check if the page is a gallery page first 
		var observer = new MutationObserver(function(mutations) {
			//console.log("ok");
			refreshTags();
			
			//reset this shit and hide menu just in case
			$("#iceTagMenu").hide();
			cancelTimeout();
			hoverTimeout = window.setTimeout(cool, 500);
		});
		observer.observe(target, { attributes: true });
	}
}

//thanks, stack overflow!
function isScrolledIntoView(elem)
{
    var $elem = $(elem);
    var $window = $(window);
    var docViewTop = $window.scrollTop();
    var docViewBottom = docViewTop + $window.height();
    var elemTop = $elem.offset().top;
    var elemBottom = elemTop + $elem.height();
    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

function makeTagMenu(includeTags) {
	var iceTagMenuWrapper = 
		$(	'<div id="iceTagMenuWrapper"></div>');
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
		}
	});

	iceTagMenu.append(iceTagInput);
	$('#under-image').append(iceTagMenuWrapper);
	iceTagMenuWrapper.append(iceTagMenu);
	iceTagMenu.hide();
}

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

	var parent  = $("#captions > form > div.summary.right");
	var fakeCharCount = $('<div class="counterz"></div>');
	parent.append(fakeCharCount);
	
	//var commentCounter = $('<div class="counterz"></div>');
	//parent.append(commentCounter);
	//commentCounter.text("/" + commCount);

	
	
	var target = $('#captions > form > div.summary.right > div.counter');
	target.hide();
	var commentSubmitBtn = $("#submit-comment");
	var commentTxb = $("#captions > form > textarea");
	var comments = [];
	var hacking = false;
	var observer = new MutationObserver(function(mutations) {
	  mutations.forEach(function(mutation) {
		console.log(mutation);
		var currentCharCount = 140 - parseInt(target.text(), 10);
		console.log(currentCharCount);
		var commCount = Math.floor(currentCharCount / 140) + 1;
		fakeCharCount.text(140 - currentCharCount % 140);
		//var count = mutation.addedNodes.data;
		//(1/X)
		if (currentCharCount > 0 && currentCharCount < 500) {
			commentSubmitBtn.prop("disabled", false); //
		} else {
			commentSubmitBtn.prop("disabled", true); //
		}
		if (currentCharCount > 140) {
			hacking = true;
			var futureComments = formatIntoComments(commentTxb.val());
			console.log(futureComments);
			fakeCharCount.text(135 - futureComments[futureComments.length - 1].length + 1 + "/" + futureComments.length);
		}
	  });
	});
		
	observer.observe(target[0], { childList:true });

	commentSubmitBtn.click(function(e) {
		e.stopPropagation();
		if (hacking) {

			
		}
	});
	var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'";
	//can expect string's length to be > 140
	
	var test1 = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH";
	var test2 = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy textsssssssssssssssssssssssssssssssssssssssssssssssssss ";
	var test3 = "They really are fake, the sparks and stuff he does would surely kill him in certain videos, he always has a charged capacitor to create the effects shown in his videos. Its basic electrical engineering and he actually explains this in some.of his pain tolerance videos."
	function formatIntoComments(longString) {
		var result = [];
		
		//var first = longString.substring(0, 135);
		var temp = 0;
		while(longString && temp < 100) {
			temp++;
			longString = longString.trim();
			var spaceInd = longString.substring(126, 136).lastIndexOf(" ");
			
			var chunkEndIndex = spaceInd > -1 ? spaceInd + 126 : 135;
			
			if (longString.length < 135) {
				result.push(longString);
				longString = "";
			} else if (chunkEndIndex <= 136) {
				var chunk = longString.substring(0, chunkEndIndex);
				console.log(chunk.length);
				result.push(chunk.trim());
				longString = longString.substring(chunkEndIndex);
				//console.log(longString);
				
				
			}
		}
		console.log(result.length);
		return result;
		
		
		/*
		if (chars.indexOf(longString.substring(134, 135)) > -1) {
			if (chars.indexOf(longString.substring(135, 136)) > -1
			var comm1 = first + "-" + "(1/2)"; 
				
		} else {
			var comm1 = first + "(1/2)";
		}*/
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



galleryPage();


