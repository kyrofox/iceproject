

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
	console.log(request);
	if (request["from"] === "page") {
		handlePageReq(request, sender, sendResponse);
	} else if (request["from"] === "popup") {
		//notyetbubs
	}
});
		/*
	console.log(sender.tab ?
				"from a content script:" + sender.tab.url :
				"from the extension");
	if (request.greeting == "hello")
		sendResponse({farewell: "goodbye"});
*/

function handlePageReq(req, sender, sendResponse) {
		if (req.type === "addTag") {
			getGalleryPost(req.info.galleryId, function(resp) {
				resp.tags.append(req.info.tag);
				chrome.storage.local.set({[req.info.galleryId]: {
					favorited: resp.favorited,
					tags: resp.tags
					time: new Date()
				}});
			});
		} else if (req.type === "removeTag") {
			
			getGalleryPost(req.info.galleryId, function(resp) {
				resp.tags.remove(req.info.tag);
				chrome.storage.local.set({[req.info.galleryId]: {
					favorited: resp.favorited,
					tags: resp.tags,
					time: new Date()
				}});
			});
			
		} else if (req.type === "getGalleryPost") {
			getGalleryPost(request.info.galleryId, function(resp) {
				sendResponse(resp);
			};
		} else if (req.type === "getAllTags") {
			sendResponse(["one", "two", "three"]);
		}
}

function getAllTags() {
	
}

function getGalleryPost(galleryId, callback) {
	chrome.storage.local.get(galleryId, function(resp) {
		if (response.galleryId === undefined)
		callback(response[galleryId]);
	});
}

 


Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};
