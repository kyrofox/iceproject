// Hey ya fuckin weirdos its ya boy shotty steve
// lets make some fuckin code boys

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
	var imgurSentence = $(".sentence-sorting");
	
	var imgurCmbx = createImgurComboBox();
	imgurCmbx.setComboValues("all");
	var tagCmbx = createTagComboBox(imgurCmbx);
	
	tagCmbx.comboBox.hide(); //hide initially so i can fade it in like a mofo
	// append imgur sentence/combobox
	var withTagTxt = $('<span class="middle-text sorting-text-align">with tag </span>').hide();
	imgurSentence
		.append($('<div class="sort-options"></div>'))
		.append(withTagTxt)
		.append(tagCmbx.comboBox);
	withTagTxt.fadeIn(300);
	tagCmbx.comboBox.fadeIn(300);
	
	// add editmenu link
	var editMenuLink = $('<a id="editTagsLink">Edit tags!</a>');
	editMenuLink.click(function(e) {
		makeEditMenu();
	});
	$("#content > div.panel").prepend(editMenuLink);
	// run code that creates editmenu
}

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


function createImgurComboBox() {
	//td.append(document.createTextNode('are you sure?'))
	// menu html and styles. might still refactor css into a css class.
	var comboBox = $('<div id="tags" class="combobox sorting-text-align"></div>');
	var selection = $('<div class="selection"></div>');
	var selectionSpan = $('<span class="name"></span>')
		.click(function(e) {
			$("#tags").addClass("opened");
			options.css("height: 102px");
			e.stopPropagation();
		});
	var options = $('<div class="options"></div>');
	var currentWrap = $('<div class="combobox-header-current bold">current: </div>');
	var current = $('<div class="combobox-current green"></div>');
	var list = $('<ul/>'); //list items are generated.
	options
		.append(currentWrap.append(current))
		.append(list);
	var hiddenInput = $('<input type="hidden" name="tags" value="">');
	comboBox
		.append(selection.append(selectionSpan))
		.append(options)
		.append(hiddenInput)
		.css("text-align", "left")
		.css("margin-left", "10px");
	
	//functions for manipulating combo boxes
	
		
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
	
	function setComboValues(value) {
		current.text(value);
		hiddenInput.attr("value", value );
		selectionSpan.text(value);
	}

	// possible cases:
	// tag selected has been renamed
	// menu is outdated- on a seperate tab the user did stuff to tags.
	// tag has been deleted - refresh the whole page
	return {
		"comboBox": comboBox,
		"list": list,
		"selection": selection,
		"current": current,
		"hiddenInput": hiddenInput,
		"makeListItem": makeListItem,
		"setComboValues": setComboValues
	};
}

//creates the tag combobox
function createTagComboBox(comboBox) {
	var cmb = comboBox;
	var cachedFavePageArray;
	var imageList = $("#imagelist > div.posts.sub-gallery.br5.first-child");
	function updateFavoritesList(tag) {
		// refresh favorites section
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
			getFavoritesByTag(cachedFavePageArray, tag, function(allFavePosts) {
				imageList.empty();
				imageList.append($(allFavePosts).clone());
			});
		}
	}

	function updateCombo (allTags, currentTag) {
		console.log(allTags);
		console.log(currentTag);
		cmb.setComboValues(currentTag.name);
		cmb.list.empty();
		for (var i = 0; i < allTags.length; i++) {
			var li = cmb.makeListItem(allTags[i].num !== currentTag.num, allTags[i].name);
			if (allTags[i].num !== currentTag.num) {
				makeListListener(li, allTags[i]);
			}
			cmb.list.append(li);
		}
		var allListener = cmb.makeListItem(true, "all");
		allListener.click(function() {
			window.location.href = "http://imgur.com/account/favorites";
		});
		cmb.list.append(allListener);
	}
	
	function makeListListener(el, tag) {
		el.click(function() {
			msgBg("getAllTags", "", function(allTags) {
				updateCombo(allTags, tag);
				updateFavoritesList(tag);
			});
		});
	}
	
	var spinner = $('<img src="//s.imgur.com/images/loaders/ddddd1_181817/48.gif" original-title="">')
		.css("margin-left", "auto")
		.css("margin-right", "auto")
		.css("display", "block")
		.css("padding", "10px");
	var loadWrapper = $("<div/>");
	loadWrapper.append(spinner)
		.css("background-color", "#181817");
	
	//add onclicks for each selection
	msgBg("getAllTags", "", function(allTags) {
		for (var i = 0; i < allTags.length; i++) {
			var li = cmb.makeListItem(true, allTags[i].name);
			makeListListener(li, allTags[i]);
			cmb.list.append(li);
		}
		cmb.list.append(cmb.makeListItem(false, "all"));
	});
	return cmb;
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
				height += newTagElements[i].outerHeight(true); 
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
    var iceTagMenuWrapper = document.createElement("div");
    iceTagMenuWrapper.id = "iceTagMenuWrapper";

    var iceTagMenu = document.createElement("div");
    iceTagMenu.id = "iceTagMenu";

    var iceTagList = document.createElement("div");
    iceTagList.id = "iceTagList";

    iceTagMenu.appendChild(iceTagList);

    if (includeTags) {
        refreshTags();
    }

    var iceTagInput = document.createElement("input");
    iceTagInput.id = "newTag";
    iceTagInput.type = "text";
    iceTagInput.setAttribute("placeholder", "new tag? :P");

    iceTagInput.onkeydown = function (e) {
        if (e.which == 13) {
            // check if it exists already
            // if it doesn't, add it to allTags
            var newTag = document.getElementById("newTag");
            if (newTag.value.length > 0) { //basic validation
                msgBg("createTag", {"tagName": newTag.value}, function (resp) {
                    if (resp.success === true) {
                        msgBg("addTagToPost", {
                            "id": getGalleryId(),
                            "tagNum": resp.tag.num
                        }, function (resp) {
                            refreshTags();
                            newTag.value = "";
                            if (fail > 0) {
                                newTag.setAttribute("placeholder", "thanks :)");
                                fail = 0;
                                window.setTimeout(function () {
                                    document.getElementById("newTag").setAttribute("placeholder", "new tag? :P");
                                }, 500);
                            }
                        });
                    } else {
                        if (resp.msg === "Tag already exists.") {
                            msgBg("addTagToPost", {
                                "id": getGalleryId(),
                                "tagNum": resp.tag.num
                            }, function (resp) {
                                refreshTags();
                                newTag.value = "";
                            });
                        }
                        //bad stuff
                    }
                });
            } else {
                var messages = [
                    "what",
                    "no, stop",
                    "seriously",
                    "why are you doing this",
                    "just type something",
                    "please",
                    "wow"
                ];

                document.getElementById("newTag").setAttribute("placeholder", messages[fail % messages.length]);

                fail++;

                window.setTimeout(function () {
                    document.getElementById("newTag").setAttribute("placeholder", "new tag? :P");
                }, 500);
            }
        }
    };

    iceTagMenu.appendChild(iceTagInput);
    iceTagMenu.style.display = "none";
    iceTagMenuWrapper.appendChild(iceTagMenu);
    document.getElementById("under-image").appendChild(iceTagMenuWrapper);
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


function devtro() {

    function devs() {
        var dev = ["kyrofox", "MalwareExe"];
        for (var i = 0; i < dev.length; i++) {
            if (window.location.href.toString().indexOf(dev[i]) >= 0) {
                console.log(true);
                return true;
            } else {
                console.log(false);
            }
        }
    }

    if (window.location.href.toString().indexOf("imgur.com/user") >= 0 && devs()) {
        var noto = $('.notoriety-title');
        noto.append($("<h2 style='color:#85BF25'><img src='http://i.share.pho.to/d7a53620_c.png' width='15' hight='15'>     Icegur Developer</h2>"));
        //.css("color: green");
        var tro = $("#mycarousel");
        tro.append($("<li><img src='http://i.share.pho.to/c832035f_c.png' class='title' title='<h2>Icegur Developer</h2>Developed The icegur extension for Imgur.'></li>"));
    }
}
unction urlAdd(addition) {
// insert addition to the end of url in empty quotes
// if statement prevents looping calls from affecting the url
    if (window.location.href.indexOf(addition) === -1) {
        window.location.href = window.location.href + addition;
    }
}
function mapMenu() {
    function isText() {
        if (document.activeElement.nodeName == "TEXTAREA") {
            console.log();
            return (true);
        }
    }

    var kkeys = [];
    $(document).keydown(function (e) {
            kkeys.push(e.keyCode);
            if (kkeys[0].toString().indexOf("72") << 0) {
                kkeys.length = 0;
            } else if (!isText()) {
                var esc = true;
                kkeys = [];
                var editMenu = $("<div/>");
                var closeButton = $('<button type="button" id="cboxClose" class="icon-x-light icon" style="display: block;"></button>');
                kkeys.length = 0;
                console.log(kkeys.length)
                editMenu.attr("id", "iceTagEditMenu")
                    .append(closeButton)
                    .append($("<h2 align='center'>Imgur Shortcuts</h2>"))
                msgBg("getAllTags", "", function () {
                    var editOverlay = $('<div id="editOverlay"></div>');
                    var stable = $("<table>")

                    function sc(a, b, c, d) {
                        stable.append($("<tr>" +
                            "<td style='width:25%;'>" + a + "</td>" +
                            "<td style='width:40%;'>" + b + "</td>" +
                            "<td style='width:15%;'>" + c + "</td>" +
                            "<td style='width:30%;'>" + d + "</td>"));
                    }

                    sc("Ctrl + F9", "Auto-Browse", "Esc", "Exit Menus");
                    sc("Shift + Tab", "Comments", "` or ~", "Upload");
                    sc("S", "Image Stats", "▲▼", "Scroll");
                    sc("◄/►", "Next/ Previous", "[", "View replies");
                    sc("Enter", "Zoom", "]", "Close Replies");
                    sc("+/-", "Up/ Down vote", "9", "Expand Album");
                    sc("0 or Insert", "Favorite", "H", "Shortcuts");
                    stable.append($("</table>"));
                    editMenu.append(stable);
                    editOverlay.click(function () {
                        editOverlay.fadeOut(300);
                    });
                    closeButton.click(function () {
                        editOverlay.fadeOut(300);
                    });
                    $(document).keyup(function (e) {
                        if (e.which == 27 && esc === true) {
                            editOverlay.fadeOut(300);
                        }
                    });

                    $("body").append(editOverlay);
                    $(editOverlay).append(editMenu);
                });

            }
        }
    );

}

function konamiCode() {

    var kkeys = [], konami = "38,38,40,40,37,39,37,39,66,65";
    $(document).keydown(function (e) {
        kkeys.push(e.keyCode);

        if (kkeys.toString().indexOf(konami) >= 0) {
            $(document).unbind('keydown', arguments.callee);
            kkeys = [];
            var x = document.createElement("STYLE");
            var t = document.createTextNode("body {font: 12px Comic Sans MS;}");
            x.appendChild(t);
            document.head.appendChild(x);

            var editMenu = $("<div/>");
            var closeButton = $('<button type="button" id="cboxClose" class="icon-x-light icon" style="display: block;"></button>');

            editMenu.attr("id", "iceTagEditMenu")
                .append(closeButton)
                .append($("<h2 align='center'>FUCK YEAH EASTER EGGS!</h2>"))
                .append($("<h3 align='center'>I hope you like comic sans</h3>"));

            msgBg("getAllTags", "", function () {
                var editOverlay = $('<div id="editOverlay"></div>');
                var dickButt = $('<img src="http://s33.postimg.org/jy9qb0gzz/forkonami.png" align="middle">')
                    .css("width", "100%");
                editMenu.append(dickButt);

                editOverlay.click(function () {
                    editOverlay.fadeOut(300);
                });
                closeButton.click(function () {
                    editOverlay.fadeOut(300);
                });
                $(document).keyup(function (e) {
                    if (e.which == 27) {
                        editOverlay.fadeOut(300);
                    }
                });
                $("body").append(editOverlay);
                $(editOverlay).append(editMenu);
            });
            $("body").addClass("konami");
        }
    });
}
