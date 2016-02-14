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
	var postImageElements = document.getElementsByClassName("post-image");
	var imageElement;
	var url;
	console.log("Image count:  " + postImageElements.length);
	console.log(postImageElements);
	urlList = [];
	
	for (var i = 0; i < postImageElements.length; i++) {
		console.log(postImageElements[i]);
		//console.log(postImageElements[i].children[0].tagName);
		if (postImageElements[i].classList.contains("video-container")) {
			console.log("gifs not supported yet");
		} else {
			var infoElement = postImageElements[i].children[0];
			if (infoElement.tagName === "A") { //if an uploaded image has a large width, the image is wrapped in an anchor tag for zooming.
				url = infoElement.getAttribute("href");
			} else if (infoElement.tagName === "IMG") {
				url = "https:" + infoElement.getAttribute("src");
			} else {
				throw "yeah what?";
			}
		}
		console.log(url);
		//console.log("URL: " + postImageElements[i].firstChild.getAttribute("href"));
		//urlList.push(postImageElements[i].firstChild.getAttribute("href"));
	}
}


function makeObserver() {
	var observer = new MutationObserver(updateUrlList);

	var config = { childList: true};
	count = 0;
	// pass in the target node, as well as the observer options
	observer.observe(postImagesDiv, config);
	return observer;
}


 
// later, you can stop observing
//observer.disconnect();

console.log(document.getElementsByClassName("post-image").length);
console.log(document.getElementsByClassName("post-image"));

makeObserver();
updateUrlList();