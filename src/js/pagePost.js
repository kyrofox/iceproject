// Hey ya fuckin weirdos its ya boy shotty steve
// lets make some fuckin code boys

console.log("post script running")

var fail = 0;
var GalleryRegex = /\w+(?=[^/]*$)/gm; // i hate regex

// This function is run on every page that isn't the favorites page.
function galleryPage() {
    //try to create the tag menu.
    mapMenu();
    konamiCode();
    devtro();
    makeTagMenu(false);
    // this is the proest ux code btw
    // By default, if the post is favorited, the tag menu displays on page after a second.
    // Once the user scrolls the menu into view, it will set a timeout for 2 seconds to make the menu disappear.
    // If the post is not favorited, the tag menu will not display.
    // If the favorite button is hovered over and the post is favorited, the tag menu will display.
    // Once the cursor leaves the favorite button, the menu will close after .5 seconds, unless the cursor hovers over the favorite button
    // or the tag menu. Once the cursor leaves either of these, the menu will close after .5 seconds.
    var cool = function () {
        if ($(".favorite-image").hasClass("favorited")) {
            if (isScrolledIntoView("#iceTagMenu")) {//theres a slight slight edge case bug for long posts here.
                window.setTimeout(function () {
                    refreshTags();
                    $("#iceTagMenu").fadeIn(300);
                    //console.log("Fave button scrolled into view and post is faved. Displaying menu automatically.");
                    hoverTimeout = window.setTimeout(function () {
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
        hoverTimeout = window.setTimeout(function () {
            $("#iceTagMenu").fadeOut(300);
        }, 500);
    }

    //hovering over the heart will show and refresh the tag menu. hovering out of the heart will start the timeout.
    $(".favorite-image").hover(
        function (e) {
            if ($(".favorite-image").hasClass("favorited")) {
                cancelTimeout();
                refreshTags();
                $("#iceTagMenu").fadeIn(200);
            }
        }, function (e) { //make it so it sets a timeout to hide, unless the person is hovering on top of the tag menu. hide if not
            startHideTimeout();
        }
        //clicking on the heart will show the menu if the action was a favorite, otherwise, hides menu. 200ms fadein or fadeout.
    ).click(function (e) {
        e.stopPropagation();
        window.setTimeout(function () {
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
    $("#iceTagMenu").hover(cancelTimeout, startHideTimeout).click(function (e) {
        e.stopPropagation();
    });

    //clicking outside of the menu will make the menu hide.
    $(document).click(function () {
        $("#iceTagMenu").hide();
    });

    // end of pro ux code. seriously, like why dont people spend a lot of time on this, its kinda fun.
    var target = document.querySelector('#inside > div.left.post-pad > div.post-container > div.post-images');
    if (target) { // this is kinda dirty. should just check if the page is a gallery page first
        var observer = new MutationObserver(function (mutations) {
            //console.log("ok");
            refreshTags();

            //reset this shit and hide menu just in case
            $("#iceTagMenu").hide();
            cancelTimeout();
            hoverTimeout = window.setTimeout(cool, 500);
        });
        observer.observe(target, {attributes: true});
    }
}

//thanks, stack overflow!
function isScrolledIntoView(elem) {
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

function makeTag(initialValue, tagName, tagNum) {
    var newTag = $('<span class="iceTag ' + (initialValue ? "checked" : "") + '"><span class="iceTagSquare">✔</span> <span class="iceTagText">' + tagName + '</span></span>');
    newTag.click(function () {
        if (newTag.hasClass("checked")) {
            //send message to background to remove tag
            newTag.removeClass("checked");
            msgBg("removeTagFromPost", {"id": getGalleryId(), "tagNum": tagNum}); //ideally, we should not req tagName, but instead make sure that the tagList is always updated, so tagnum stays g
        } else {
            newTag.addClass("checked");
            msgBg("addTagToPost", {"id": getGalleryId(), "tagNum": tagNum});
            //send message to background to add tag
        }
    });
    return newTag;
}

function refreshTags() {
    // hide menu
    // get tags from BG
    msgBg("getAllTags", "", function (resp) {
        var allTags = resp;
        // get post's tags
        msgBg("getPost", {"id": getGalleryId()}, function (resp) {
            var post = resp;

            // for each tag in alltags, go through and create each one. if any of them are on the post, check them.
            var newTagElements = [];
            for (var i = 0; i < allTags.length; i++) {
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


function devtro() {
    function devs() {
        var dev = ["kyrofox", "MalwareExe"];
        for (var i = 0; i < dev.length; i++) {
            if (window.location.href.toString().toLowerCase().indexOf(dev[i].toLowerCase()) >= 0) {
                return true;
            }
        }
    }

    function overlay() {

    }

    if (window.location.href.toString().indexOf("imgur.com/user") >= 0 && devs()) {
        var noto = $('.notoriety-title');
        noto.append($("<h2 style='color:#85BF25'><img src='http://i.share.pho.to/d7a53620_c.png' " +
            "width='15' hight='15'>     Icegur Developer</h2>"));

        var notometal = $('.notoriety-title-medal');
        notometal.append($("</br><h3 style='color:#85BF25'> Icegur Developer</h3>"));

        var tro = $("#mycarousel");
        tro.append($("<li><img src='http://i.share.pho.to/c832035f_c.png' class='title' " +
            "title ='<h2>Icegur Developer</h2>Developed The Icegur extension for Imgur.'></li>"));
    }
}

function urlAdd(addition) {
// insert addition to the end of url in empty quotes
// if statement prevents looping calls from affecting the url
    if (window.location.href.indexOf(addition) === -1) {
        window.location.href = window.location.href + addition;
    }
}
function mapMenu() {
    // hold down h for 5 seconds :/ -k
    function isText() {
        if (document.activeElement.nodeName == "TEXTAREA") {
            console.log();
            return (true);
        }
    }

    $(document).keydown(function (e) {

        if (!isText() && checker(e.keyCode, 72)) {
            var esc = true;
            var texts = $("<div/>");
            var closeButton = $('<button type="button" id="cboxClose" class="icon-x-light icon" style="display: block;"></button>');
            texts.attr("id", "iceTagEditMenu")
                .append(closeButton)
                .append($("<h2 align='center'>Imgur Shortcuts</h2>"))

            var overlay = $('<div id="mapOverlay"></div>');
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
            texts.append(stable);

            $("body").append(overlay);
            $(overlay).append(texts);

            overlay.click(function () {
                overlay.fadeOut(200);
            });
            closeButton.click(function () {
                overlay.fadeOut(200);
            });
            $(document).keyup(function (e) {
                if (e.which == 27 && esc === true) {
                    overlay.fadeOut(200);
                }
            });

        }
    });
}


// seperate creating egg menu logic into seperate function for readability
function createEasterEggMenu() {

}

function konamiCode() {
    var konamis = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    var count = 0;
    $(document).keydown(function (e) {
        e.stopPropagation();
        var t = checker(konamis[count], e.which);
        if (t) {
            count++;
            console.log("count =" + count);
            if (count == 10) {
                count = 0;
                var x = document.createElement("STYLE");
                var t = document.createTextNode("body {font: 12px Comic Sans MS;}");
                x.appendChild(t);
                document.head.appendChild(x);

                var frame = $("<div/>");
                var closeButton = $('<button type="button" id="cboxClose" class="icon-x-light icon" style="display: block;"></button>');

                frame.attr("id", "iceTagEditMenu")
                    .append(closeButton)
                    .append($("<h2 align='center'>FUCK YEAH EASTER EGGS!</h2>"))
                    .append($("<h3 align='center'>I hope you like comic sans</h3>"));

                var overlay = $('<div id="editOverlay"></div>');
                var image = $('<img src="http://s33.postimg.org/jy9qb0gzz/forkonami.png" align="middle">')
                    .css("width", "100%");
                frame.append(image);

                overlay.click(function () {
                    overlay.fadeOut(300);
                });
                closeButton.click(function () {
                    overlay.fadeOut(300);
                });
                $(document).keyup(function (e) {
                    if (e.which == 27) {
                        overlay.fadeOut(300);
                    }
                });
                $("body").append(overlay)
                    .addClass("konami");
                $(overlay).append(frame);

                //$("body").addClass("konami");

            }
        } else {
            count = 0;
        }

    });
}

function checker(i, e) { //from kyro
    console.log(e == i);
    if (e == i) {
        return true;
    } else {
        return false;
    }

}