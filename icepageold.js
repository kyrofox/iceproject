/*
console.log("# # # # # # # # # # # # # # # # # # # # \n \n 			   IMAGES \n \n # # # # # # # # # # # # # # # # # # # #");



var postImagesDiv = document.getElementsByClassName("post-images"),
	urlList,
	count = 0;

if (postImagesDiv.length > 1) {
	throw("whaaaaaaat, how did this happen?");
}
postImagesDiv = postImagesDiv[0];


function updateUrlList() {
	console.log("ID: " + count);
	count++;
	var postImageElements = document.getElementsByClassName("post-image"),
		urlList = [];
		
	console.log("Image count:  " + postImageElements.length);
	
	for (var i = 0; i < postImageElements.length; i++) {
		var infoElement = postImageElements[i].children[0];
		if (postImageElements[i].classList.contains("video-container") || infoElement.classList.contains("video-container")) {
			console.log("video gifs not supported yet");
		} else {
			if (infoElement.tagName === "A") { //if an uploaded image has a large width, the image is wrapped in an anchor tag for zooming.
				urlList.push(makeImageItem(infoElement.children[0]));
			} else if (infoElement.tagName === "IMG") {
				urlList.push(makeImageItem(infoElement));
			} else {
				throw "yeah what?";
			}
		}
	}
	console.log(urlList);
}

var makeImageItem = function(imageNode) {
	var n = {};
	
	n.img = imageNode;
	n.url = "https:" + imageNode.getAttribute("src");
	
	var temp = n.url.substring(n.url.indexOf(".com/") + 5);
	n.id = temp.substring(0, temp.indexOf("."));
	return n;
}

var searchUrlPrefix = "https://www.google.com/searchbyimage?&image_url=";

var embedGoogleFrame = function() {
	var iFrame = document.createElement("iframe");
	return iFrame;
}



//var observeElement = document.querySelector("#inside > div.left.post-pad > div.post-container > div.post-images > div > div:nth-child(1)");
function makeObserver() {
	var observer = new MutationObserver(updateUrlList);

	var config = { childList: true, attributes: true, subtree: true};
	// pass in the target node, as well as the observer options
	observer.observe(postImagesDiv, config);
	return observer;
}

//window.document.appendChild(makeImageItem);
 
// later, you can stop observing
//observer.disconnect();

console.log(document.getElementsByClassName("post-image").length);
console.log(document.getElementsByClassName("post-image"));

if (window === window.top) {
	var iFrame = document.createElement("iframe");
	iFrame.setAttribute("src", "https://www.google.com/searchbyimage?&image_url=http://i.imgur.com/Ho0SQP4.jpg");
	document.getElementsByTagName("BODY")[0].appendChild(iFrame);
	// queue up a task for google frame
}

makeObserver();
updateUrlList();

*/

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            callback(xmlHttp.responseText);
		}
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

httpGetAsync("http://imgur.com/account/favorites/newest/page/1/miss?scrolled", function(response) {
	console.log(response);
});

var favBtn = document.querySelector("#under-image > div > span.favorite-image");
document.createElement("div");



