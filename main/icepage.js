// Hey ya fuckin weirdos its ya boy shotty steve
// lets make some fuckin code boys

var fail = 0;
var GalleryRegex = /\w+(?=[^/]*$)/gm; // i hate regex

(function () { //this is pretty hacky- if you can, figure out how to do this less hacky u get 10 imaginary points
    var th = document.getElementsByTagName("body")[0];
    var s = document.createElement('script');
	s.setAttribute("id", "iceHack");
    s.innerHTML = //this hack is because this code doesnt run until the page is fully loaded, and thats when i know for sure if Imgur.Environment info is set.
		"var superHack = document.getElementById('iceHack');" +
		"superHack.setAttribute('signed', window.Imgur.Environment.signed);" +
		"superHack.setAttribute('userId', Imgur.Environment.auth.id);";
    th.appendChild(s);
	msgBg("load", {"signed": $("#iceHack").attr("signed"), "userId": $("#iceHack").attr("userId")}, function(resp) {
		if (resp === "notSigned") {
			//idk lol
			//console.log("Not signed in.")
		} else {
			var test = window.location.href.match(GalleryRegex);
			if (window.location.href.indexOf("imgur.com/account/favorites") > -1 && (test === null || test[0] === "favorites")) { //make sure its not a favorites/<id> page.
				favoritesPage();
			} else {
				galleryPage();
			}
		}
	});
})();

// This function is run whenever the user is on http://imgur.com/account/favorites.
function favoritesPage(){
	var editMenuLink = $('<a id="editTagsLink">Edit tags!</a>');
	editMenuLink.click(function(e) {
		makeEditMenu();
	});
	$("#content > div.panel").prepend(editMenuLink);
	msgBg("getAllTags", "", function(allTags) {
		function makeListItem (display, value) {
			var a = $('<a href="#">' + value + '</a>')
				.css("padding", "10px 20px")
				.css("display", "block")
				.css("line-height", "20px");
			var li = $('<li class="item ' + (display ? "" : "nodisplay") + '" data-value="' + value + '"></li>')
				.css("padding", "0")
				.append(a);
			return li;
		}
		
		var cachedFavePageArray;
		var spinner = $('<img src="//s.imgur.com/images/loaders/ddddd1_181817/48.gif" original-title="">')
			.css("margin-left", "auto")
			.css("margin-right", "auto")
			.css("display", "block")
			.css("padding", "10px")
		var loadWrapper = $("<div/>");
			loadWrapper.append(spinner)
			.css("background-color", "#181817");
			
		var imageList = $("#imagelist > div.posts.sub-gallery.br5.first-child");
		function makeListListener(el, tag) {
			el.click(function() {
				$("#tags").remove();
				makeList(tag);
				if (!cachedFavePageArray) {
					imageList.empty();
					imageList.append(loadWrapper);
					$("#imagelist > div:nth-child(n+3)").remove(); // this deals with if the user has scrolled down on the all page.
					getAllFavePosts(function(allFavePagesArray) {
						cachedFavePageArray = allFavePagesArray;
						getFavoritesByTag(allFavePagesArray, tag, function(allFavePosts) {
							imageList.empty();
							imageList.append($(allFavePosts).clone()); //clone first because for some reason when appending elements
							// they disappear from favepagearrays
						});
					});
				} else {
					imageList.empty();
					getFavoritesByTag(cachedFavePageArray, tag, function(allFavePosts) {
						imageList.empty();
						imageList.append($(allFavePosts).clone());
					});
				}
			});
		}
		var imgurSentence = $(".sentence-sorting");
		function makeList(currentTag) {
			var tagSortCombo = $('<div id="tags" class="combobox sorting-text-align"></div>');
			var list = $('<ul/>');
			//console.log(currentTag);
			//console.log(!currentTag);
			var current = $('<div class="combobox-header-current bold">current: <div class="combobox-current green">' + (currentTag ? currentTag.name :  "all")+ '</div></div>');
			
			if (!currentTag) { // no tag selected. this is the default scenario for page load
				for (var i = 0; i < allTags.length; i++) {
					var li = makeListItem(true, allTags[i].name);
					makeListListener(li, allTags[i]);
					list.append(li);
				}
				list.append(makeListItem(false, "all"));
			} else {
				for (var i = 0; i < allTags.length; i++) {
					if (allTags[i] !== currentTag) {
						var li = makeListItem(true, allTags[i].name);
						makeListListener(li, allTags[i]);
						list.append(li);
					} else {
						var li = makeListItem(false, allTags[i].name);
					}
				}
				var allListener = makeListItem(true, "all");
				allListener.click(function() {
					window.location.href = "http://imgur.com/account/favorites";
				});
				list.append(allListener);
			}
			
			var options = $('<div class="options"></div>')
				.append(current)
				.append(list);
			
			var selection = $('<div class="selection"></div>');
			var selectionSpan = $('<span class="name">'+ (currentTag ? currentTag.name :  "all")  + '</span>')
				.click(function(e) {
					$("#tags").addClass("opened");
					options.css("height: 102px");
					e.stopPropagation();
				});
				
			selection.append(selectionSpan);
			
			tagSortCombo
				.append(selection)
				.append(options)
				.append($('<input type="hidden" name="tags" value="' + (currentTag ? currentTag.name :  "all" ) + '">'))
				.css("text-align", "left")
				.css("margin-left", "10px")
			
			imgurSentence.append(tagSortCombo);
			imgurSentence.append($('<div class="sort-options"></div>'));
		}
		imgurSentence.append($('<span class="middle-text sorting-text-align">with tag </span>'));
		makeList();
	});
}

// This function is run on every page that isn't the favorites page.
function galleryPage() {
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

	var hoverTimeout = window.setTimeout(cool, 500);
	$(".favorite-image").hover( 
		function(e) {
			if ($(".favorite-image").hasClass("favorited")) {
				refreshTags();
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
	).click(function(e) {
		e.stopPropagation();
		window.setTimeout(function() {
			if ($(".favorite-image").hasClass("favorited")) {
				refreshTags();
				$("#iceTagMenu").show();
			} else {
				$("#iceTagMenu").hide();
			}
			if (hoverTimeout) {
				window.clearTimeout(hoverTimeout);
				hoverTimeout = "";
			}
		}, 100);
	});

	$("#iceTagMenu").hover( 
		function(e) {
			//console.log("hovered");
			if (hoverTimeout) {
				window.clearTimeout(hoverTimeout);
				hoverTimeout = "";
			}
		}, function(e) {
			hoverTimeout = window.setTimeout(function() {
				$("#iceTagMenu").fadeOut(300);
			}, 500);
		}
	).click(function(e) {
		e.stopPropagation();
	});

	$(document).click(function() { //clicking outside of the menu will make the menu hide.
		$("#iceTagMenu").hide();
	});
	// end of pro ux code. seriously, like why dont people spend a lot of time on this, its kinda fun.
	
	var target = document.querySelector('#inside > div.left.post-pad > div.post-container > div.post-images');
	if (target) { // this is kinda dirty. should just check if the page is a gallery page first 
		var observer = new MutationObserver(function(mutations) {
			//console.log("ok");
			refreshTags();
			
			//reset this shit and hide menu just in case
			$("#iceTagMenu").hide();
			if (hoverTimeout) {
				window.clearTimeout(hoverTimeout);
				hoverTimeout = "";
			}
			hoverTimeout = window.setTimeout(cool, 500);
		});
		observer.observe(target, { attributes: true });
	}
}


function getAllFavePosts(callback) {
	function getPostsFromPage(pageNum, allFaves) {
		$.get("http://imgur.com/account/favorites/newest/page/" + pageNum + "/miss?scrolled", function(htmlz) {
			var html = document.createElement("document");
			html.innerHTML = htmlz;
			var allPostsOnPage = html.getElementsByClassName("post");
			if (allPostsOnPage.length > 0) { //still more faves to add, continue
				allFaves.push( allPostsOnPage);// array of htmlCollections.
				getPostsFromPage(pageNum + 1, allFaves);
			} else { //otherwise call the callback
				callback(allFaves);
			}
		});
	}
	getPostsFromPage(0, []);
}



function getFavoritesByTag(allHtmlFavePages, tag, callback) {
	msgBg("getPostsByTag", {"tag": tag}, function(allPosts) {
		//first, get all posts on page. for now, assume this is first 50. that way we can skip the first get call to favorites page.
		// keep calling http://imgur.com/account/favorites/newest/page/x/miss?scrolled until all posts are found.
		var result = [];
		var num = 1;
		//pretty inefficient. need a good solution for this. might just cache everything in next iteration or somethin.
		for (var k = 0; k <allHtmlFavePages.length; k++) {
			var allHtmlFaves = allHtmlFavePages[k];
			for (var j = 0; j < allHtmlFaves.length; j++ ) {
				var currentId = allHtmlFaves[j].id;
				for (var i = 0; i < allPosts.length; i++) {
					if (allPosts[i].id === currentId) {
						//splice from allposts
						allPosts.splice(i, 1);
						//add to result array
						result.push(allHtmlFaves[j]);
					}
				}
			}
			
		}
		callback(result);
	});
}


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
				height += newTagElements[i].outerHeight(true); //todo: figure out how to not hardcode this. initial version i had had bugs.
				//console.log();
			}
			
			$("#iceTagList").height(height + "px");
		});
	});
}

function makeEditMenu() {
	var editMenu = $("<div/>");
	var closeButton = $('<button type="button" id="cboxClose" class="icon-x-light icon" style="display: block;"></button>');
	editMenu.attr("id", "iceTagEditMenu")
		.append(closeButton)
		.append($("<h2>Tags. Tags. Tags. </h2>"))
		.append($("<p>Rename and delete tags here! :D</p>"));
	var table = $("<table/>");
	var tableScrollWrap = $('<div class="iceScroll"></div>');
	
	//note: if you're wondering why I don't just have this take tagname, i wanted it to point to the tag
	// reference, just in case something changed.
	function makeCleanup(tag, nameCol) {
		var cleanupFunc = function() {
			nameCol.empty();
			nameCol.text(tag.name);
		}
		return cleanupFunc;
	}
	
	var cleanups = [];
	
	editMenu.click(function(e) {
		e.stopPropagation();
		runCleanups(); // if they click outside, close all inputs or open prompts.
	});
	
	function runCleanups() {
		for(var i = 0; i < cleanups.length; i++) {
			cleanups[i]();
		}
	}
	var dickbutt = $('<div class="db"></div>');
	editMenu.append(dickbutt);
	msgBg("getAllTags", "", function(allTags) {
		
		for (var i = 0; i < allTags.length; i++) {
			var row = $("<tr/>");
			var nameCol = $("<td></td>");
			
			nameCol.text(allTags[i].name);
			//console.log(nameCol);
			var editBtn = $('<img src="http://i.imgur.com/bugnXFI.png">');
			var delBtn = $('<img src="http://i.imgur.com/ktWQi2y.png">');
			var btnCol = $("<td/>");
			
			btnCol
				.append(delBtn)
				.append(editBtn);
			row
				.append(nameCol)
				.append(btnCol);
			table.append(row);

			editBtn.click(function(td, tag) { //wrap in function factory because... js (classic js.)
				var handler = function(e) {
					e.stopPropagation();
					//run cleanups
					runCleanups();
					//add self to cleanup
					cleanups.push(makeCleanup(tag, td));
					var renameInput = $('<input type="text">');
					
					renameInput.keypress(function (e) {
						//console.log(tag);
						var val = renameInput.val();
						if (e.which == 13 && val.length !== 0) { //slight validation
							var renamedTag = {}; //make a "new" one to be safe.
							renamedTag.num = tag.num;
							renamedTag.name = val;
							msgBg("renameTag", {"tag": renamedTag}, function(resp) {
								if (resp !== "no lol") { //we can assume success, and we've been returned a tag obj
									// success
									tag = resp; //update stored obj.
									td.text(tag.name);						
								} else {
									// tell the user they're dumb or being dumb
								}
							});
						}
					});
					
					renameInput.click(function(e) {
						e.stopPropagation(); //this is for the click outside code
					});

					td.text("");
					renameInput.val(tag.name);
					var whenDoneText = $("<span>(hit enter when done)</span>");
					whenDoneText.css("font-size", "12px")
						.css("position", "fixed")
						.css("display", "none")
						.css("margin-top", "3px")
						.css("margin-left", "10px")
					td.append(renameInput)
						.append(whenDoneText);
					window.setTimeout(function() {
						whenDoneText.fadeIn(300);
					}, 1000);
					renameInput.focus();
				};
				return handler;
			}(nameCol, allTags[i]));
			
			delBtn.click(function(tag, tr, td) {

				var handler = function(e) {
					e.stopPropagation();
					//run cleanups
					runCleanups();
					//add self to cleanup
					cleanups.push(makeCleanup(tag, td));
					var renameInput = $('<input type="text">');
					
					//show delete confirm
					var yes = $("<b> yes </b>");
					yes.click(function(e) {
						e.stopPropagation();
						msgBg("deleteTag", {"tag": tag}, function(resp) {
							if (resp === "tag deleted") {
								tr.remove();
							}
						});
					});
					var no = $("<b> no </b>");
					no.click(function(e) {
						e.stopPropagation();
						runCleanups();
					});
					td.empty();
					td.append(document.createTextNode('are you sure?'))
						.append(yes)
						.append(document.createTextNode('/'))
						.append(no);
				}
				return handler;
			}(allTags[i], row, nameCol));
		}
		var dbTimeout = 5000;
		if (allTags.length === 0) {
			var placeholder = $("<p/>");
			placeholder.text("Wait a sec... You don't actually have any tags. What are you doin' here? Go tag some stuff!")
				.css("margin-top", "100px")
				.css("width", "100%");
			tableScrollWrap.append(placeholder);
			dbTimeout = 2000;
		} else {
			tableScrollWrap.append(table)
		}
		
		
		
		editMenu.append(tableScrollWrap);
		var nothin = $("<p style='position:absolute; margin-left: 280px; margin-top: 5px;'>nothing down here.</p>");
		editMenu.append(nothin);
		var editOverlay = $('<div id="editOverlay"></div>');
		editOverlay.click(function() {
			editOverlay.remove();
		});

		window.setTimeout(function() {
			dickbutt.css("background-position", "0px 80px");
			window.setTimeout(function() {
				dickbutt.css("background-position", "0px 200px");
				nothin.text("nothing down here?");
			}, 2000);
		}, dbTimeout);
		
		closeButton.click(function() {
			editOverlay.remove();
		});
		$("body").append(editOverlay);
		$(editOverlay).append(editMenu);
	});
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


function getGalleryId() {
	var url = window.location.href;
	var matches = url.match(GalleryRegex);
	if (matches) {
		return matches[0];
	} else {
		return url.substring(url.indexOf("gallery/") + 8).replace("?", "");
	}
}


