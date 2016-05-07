var loggedIn = false;
var tasks = [];
var user = {};

(function() {
	
	user.posts = [];
	user.allTags = [];
	
	user.getPost = function(id) {
		for(var i = 0; i < user.posts.length; i++) {
			if (user.posts[i].id === id) {
				return user.posts[i];
			}
		}
		return null;
	}
	user.getTag = function(tagNum) {
		return allTags[tagNum];
		return null;
	}
	user.addPost = function(id, favorited) {
		var post = { "id": id, "favorited": favorited, tags:[] };
		user.posts.push(post);
		return post;
	}
	user.addTagToPost = function(id, tagNum) {
		var post = user.getPost(id);
		if (!post) {
			console.log("Post does not exist yet. Creating it.");
			post = user.addPost(id, true);
		}
		post.tags.push(tagNum);
	}
	user.removeTagFromPost = function(id, tagNum)  {
		user.getPost(id).tags.remove(tagNum);
	}
	user.createTag = function(tagName) {
		for (var i = 0; i < user.allTags.length; i++) {
			if (user.allTags[i].name === tagName) {
				return {success: false, msg: "Tag already exists.", tag: user.allTags[i]};
			}
		}
		var tag = {};
		tag.name = tagName;
		tag.num = (function() {
			for (var i = 0; i < 1000; i++) { //horrible code, please rewrite this please
				var a = true;
				for(var j = 0; j < user.allTags.length; j++) {
					if (user.allTags[j].num === i) {
						a = false;
						break;
					}
				}
				if (a) { //if a is still true we got a match
					return i
				}
			}
		})();
		user.allTags.push(tag);
		return {success: true, tag: tag}; 
	};
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

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
	console.log("Got message from: " + sender.tab.id);
	console.log(request);
	if (request["from"] === "page") {
		return handlePageReq(request, sender, sendResponse);
	} else if (request["from"] === "popup") {
		//notyetbubs
	}
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
	if (req.type === "load") {
		if (req.info.signed) { //current implementation will bug on sign-out or if different user logged in as.
			if (!loggedIn) {
				loggedIn = true;
				//check if storage contains a user for the req.info.userId
				
				getOrCreateFromStorage(req.info.userId, {posts: [], allTags: []}, function(resp) {
					user.posts = resp.posts;
					user.allTags = resp.allTags;
					//var  = resp[req.info.userId];
					respond(user);
				});
				return true;
			} else {
				respond(user);
			}
			
			// if not, create it
			//store the user into currentuser
		} else {
			respond("notSigned");
		}
	} else if(req.type === "setUser") {
		
	} else if (req.type === "addTagToPost") {
		
		
		user.addTagToPost(req.info.id, req.info.tagNum);
	} else if (req.type === "removeTagFromPost") {
		user.removeTagFromPost(req.info.id, req.info.tagNum);
	} else if (req.type === "getPost") {
		//getGalleryPost(req.info.galleryId, respond);
		respond(user.getPost(req.info.id));
	} else if (req.type === "getAllTags") {
		respond(user.allTags);
	} else if (req.type === "createTag") {
		respond(user.createTag(req.info.tagName));
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

function getOrCreateFromStorage(key, emptyObject, callback) {
	chrome.storage.local.get(key, function(resp) {
		if (typeof resp[key] === "undefined") {
			//shit dont exist, create it.
			chrome.storage.local.set({[key]: emptyObject});
			getOrCreateFromStorage(key, emptyObject, callback);
		} else {
			callback(resp[key])
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

function getGalleryPost(galleryId, callback) {
	//for(currentUserObject)
}

 
function saveToStorage(user) {
	
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
