var loggedIn = false;
var tasks = [];
var user = {};
/*ex of user obj in page storage

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
(function() {
	
	user.posts = [];
	user.allTags = [];
	user.id = null;
	
	user.getPost = function(id) {
		for(var i = 0; i < user.posts.length; i++) {
			if (user.posts[i].id === id) {
				return user.posts[i];
			}
		}
		return null;
	}
	
	function checkIfTagExists(tag) {
		for (var i = 0; i < user.allTags.length; i++) {
			if (user.allTags[i].name === tag.name && user.allTags[i].num === tag.num) {
				// k cool.
				return true;
			}
		}
		return false;
	}
	
	user.getPosts = function(tag) {
		var resp = [];
		if (checkIfTagExists(tag)) {
			var tagNum = tag.num;
			for (var i =0; i < user.posts.length; i++) {
				if (user.posts[i].tags.indexOf(tagNum) > -1) {
					resp.push(user.posts[i]);
				}
			}
		}
		return resp;
	}
	
	user.getTag = function(tagNum) {
		return user.allTags[tagNum];
	}
	
	user.renameTag = function(renamedTag) {
		var success = true;
		// check if renamed tag is the same NAME as any of the tags that already exist.
		for (var i = 0; i < user.allTags.length; i++) {
			if (user.allTags[i].name === renamedTag.name) {
				if (user.allTags[i].num === renamedTag.num) {
					//same tag! we'll let em slide for now.
					success = true;
				} else {
					//what? same name, but dif num. odd.
					success = false;
				}
			}
		}
		
		if (!success) {
			return "no lol";
		} else {
			//we should be able to expect that this num isnt fucked up. if it is, there's a major bug
			var tag = user.getTag(renamedTag.num);
			if (!tag) {
				return "no lol"; // if here that's BAD.
			} else {
				//actually rename it now
				tag.name = renamedTag.name;
				user.store(); //temp
				return tag;
			}
		}
	}
	
	user.softDeleteTag = function(tagToBeDeleted) {
		var tag = user.getTag(tagToBeDeleted.num);
		if (tag.name !== tagToBeDeleted.name) {
			return "nope.jpg";
		} else {
			tag.name = "[deleted](" + tag.name + ")";
			tag.disabled = true;
			user.store(); //temp
			return "tag deleted";
		}
	}
	
	user.addPost = function(id, favorited) {
		var post = { "id": id, "favorited": favorited, tags:[] };
		user.posts.push(post);
		return post;
		user.store(); //temp
	}
	
	user.addTagToPost = function(id, tagNum) {
		var post = user.getPost(id);
		if (!post) {
			console.log("Post does not exist yet. Creating it.");
			post = user.addPost(id, true);
		}
		post.tags.push(tagNum);
		user.store();//temp
	}
	
	user.removeTagFromPost = function(id, tagNum)  {
		user.getPost(id).tags.remove(tagNum);
		user.store(); //temp
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
		user.store(); //temp
		return {success: true, tag: tag}; 
	};
	
	user.getAllTags = function() {
		var result = [];
		for (var i = 0; i < user.allTags.length; i++) {
			if (!user.allTags[i].disabled) {
				result.push(user.allTags[i]);
			} 
		}
		return result;
	} 
	
	user.store = function() {
		console.log("Storing everything.")
		chrome.storage.local.set({[user.id]: {posts: user.posts, allTags: user.allTags}});
	}
	
})();





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
		
		// just in case check
		// need to find a better way to check if user has logged out
		if (req.info.userId !== user.id) {
			console.log("User is not the same as stored user. Clearing info.");
			user.posts = [];
			user.allTags = [];
			user.id = null;
			loggedIn = false;
		}
		
		// if signed, this means the user is logged into imgur.
		if (req.info.signed !== "false" && req.info.userId) { //sometimes, imgur returns signed = true, but userId is undefined (if you log out).
			// loggedin is my way of storing that they are logged in and the extension is aware of it. not sure if i should replicate
			// this variable or just ride on the imgur one.
			if (!loggedIn) {
				loggedIn = true;
				//check if storage contains a user for the req.info.userId
				
				getOrCreateFromStorage(req.info.userId, {posts: [], allTags: []}, function(resp) {
					user.posts = resp.posts;
					user.allTags = resp.allTags;
					user.id = req.info.userId;
					//var  = resp[req.info.userId];
				});
			}

			// if not, create it
			//store the user into currentuser
		} else {
			loggedIn = false;
			console.log("User is logged out now, clearing info.");
			user.posts = [];
			user.allTags = [];
			user.id = null;
		}
		console.log(req.info.page);
		if (req.info.page === "favorites") {
			//run gallery
			chrome.tabs.executeScript(sender.tab.id,{
				file: "/js/pageFavorites.js"
			});
		} else {
			//run other
			chrome.tabs.executeScript(sender.tab.id,{
				file: "/js/pagePost.js"
			});
		}
		
		
	} else if(req.type === "setUser") {
		
	} else if (req.type === "addTagToPost") {
		user.addTagToPost(req.info.id, req.info.tagNum);
		respond("cool!");
	} else if (req.type === "removeTagFromPost") {
		user.removeTagFromPost(req.info.id, req.info.tagNum);
		respond("cool!");
	} else if (req.type === "getPost") {
		//getGalleryPost(req.info.galleryId, respond);
		respond(user.getPost(req.info.id));
	} else if (req.type === "getAllTags") {
		respond(user.getAllTags());
	} else if (req.type === "createTag") {
		respond(user.createTag(req.info.tagName));
	} else if (req.type === "getPostsByTag") {
		respond(user.getPosts(req.info.tag));
	} else if (req.type === "renameTag") {
		respond(user.renameTag(req.info.tag));
	} else if (req.type === "deleteTag") {
		respond(user.softDeleteTag(req.info.tag));
	}
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
