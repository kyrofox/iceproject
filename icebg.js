

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
	console.log("Got message from: " + sender.tab.id);
	console.log(request);
	if (request["from"] === "page") {
		handlePageReq(request, sender, sendResponse);
	} else if (request["from"] === "popup") {
		//notyetbubs
	}
	return true;
});
/* prioritize tags based on how many use them

		/*
	console.log(sender.tab ?
				"from a content script:" + sender.tab.url :
				"from the extension");
	if (request.greeting == "hello")
		sendResponse({farewell: "goodbye"});
*/

function handlePageReq(req, sender, sendResponse) {
	function respond(resp) {
		console.log("Sending response:");
		console.log(resp);
		//debugger;
		sendResponse(resp);
	}
	
	if (req.type === "addTag") { // yeah yeah i need to rename this... lazy :/
		addTagToPost(req);
	} else if (req.type === "removeTag") {
		removeTagFromPost(req);
	} else if (req.type === "getGalleryPost") {
		getGalleryPost(req.info.galleryId, respond);
	} else if (req.type === "getAllTags") {
		getAllTags(respond);
	} else if (req.type === "addNewTag") {
		getAllTags(function(resp) {
			if (resp.indexOf(req.info.tag) > -1 ) {
				//tag already exists.
				respond("fuck you");
			} else {
				resp.push(req.info.tag);
				chrome.storage.local.set({"all_of_teh_tags": resp});
				respond({success: true});
			}
			
		});
	}
}

function addTagToPost(req) {
	getGalleryPost(req.info.galleryId, function(resp) {
		resp.tags.push(req.info.tag);
		chrome.storage.local.set({[req.info.galleryId]: {
			favorited: resp.favorited,
			tags: resp.tags,
			time: new Date().getTime()
		}});
	});
}

function removeTagFromPost(req) {
	getGalleryPost(req.info.galleryId, function(resp) {
		resp.tags.remove(req.info.tag);
		chrome.storage.local.set(
		{[req.info.galleryId]: {
			favorited: resp.favorited,
			tags: resp.tags,
			time: new Date().getTime()
		}});
	});
}

function getAllTags(callback) {
	chrome.storage.local.get("all_of_teh_tags", function(resp) {
		if (typeof resp["all_of_teh_tags"] === "undefined") {
			//debugger;
			//shit don't exist, create it
			chrome.storage.local.set({"all_of_teh_tags": []});
			getAllTags(callback);
		} else {
			callback(resp["all_of_teh_tags"]);
		}
	});
}
/*HAw0r1n: {
	favorited: true,
	tags: ["okay", "pls", "nty"],
	time: 123123123123213
}*/

function getGalleryPost(galleryId, callback) {
	chrome.storage.local.get(galleryId, function(resp) {
		console.log("ok")
		console.log(resp);
		if (typeof resp[galleryId] === "undefined") {
			//debugger;
			//shit don't exist, create it
			chrome.storage.local.set({[galleryId]: {
				favorited: null,
				tags: [],
				time: new Date().getTime()
			}});
			getGalleryPost(galleryId, callback);
			
		} else {
			callback(resp[galleryId]);
		}
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
