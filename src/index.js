const IFRAME_ROOT_URL = "https://publicstorage.neocities.org/shared-iframe.html";

class PublicStorageAccess {

	 constructor () {
		 this.uid = this.uniqueId();
	 }
	 
	uniqueId() {
		function chr4(){
			return Math.random().toString(16).slice(-4);
			}
		return chr4() + chr4() +
				'-' + chr4() +
				'-' + chr4() +
				'-' + chr4() +
				'-' + chr4() + chr4() + chr4();
	}

	 prepareIFrame() {
		var that = this;
		var iframe = document.createElement("iframe");
		iframe.id=that.uid;
		iframe.src=IFRAME_ROOT_URL + "?uid=init-"+that.uid;
		iframe.style="display:none;";
		return new Promise(function(resolve, reject) {
			console.debug("Je démarre...");
			window.addEventListener('message', function mafunc(tkn) {
				
				console.debug("prepareIFrame " + that.uid + " reçoit un message... " + tkn.data);
				
				if (IFRAME_ROOT_URL.indexOf(tkn.origin)<0) {
					return;
				}
				
				try {
					var packet = JSON.parse(tkn.data);
					
					if(!(packet.frameId === "init-" + that.uid)) {
						// ignore
						return;
					}
					
					console.debug("prepareIFrame " + that.uid + " accepte un message... " + tkn.data);
					if(packet.ready) {
						resolve(iframe);					
					}
				} catch (e) {
					reject(tkn.data);
				}
				window.removeEventListener('message', mafunc);
				// that.body.removeChild(that.iframe);
		    });
			onLoadThen().then(() => {
				console.debug("Adding the iframe for " + that.uid);
				document.getElementsByTagName("body")[0].appendChild(iframe);
			});

			setTimeout(()=>reject(`Request ${that.uid} TIMEOUTED!`), 20000);
		});
	}
	 
	 access(access, prop, value = null, level = "local") {
			
			if(!(access === "get" || access === "set" || access === "delete")) {
				throw new Error("access can only be 'set', 'get' or 'delete' - not '" + access + "'");
			}
			
			if (!prop) {
				throw new Error("Prop name is mandatory");
			}
			
			if(!(level === "local" || level === "session")) {
				throw new Error("level can only be 'session' or 'local' - not '" + access + "'");
			}
				
			var that = this;
			
			var promise = new Promise(function(resolve, reject) {
				that.prepareIFrame().then(iframe => {
					window.addEventListener('message', function mafunc(tkn) {
						if (IFRAME_ROOT_URL.indexOf(tkn.origin)<0) {
							return;
						}
						try {
							var packet = JSON.parse(tkn.data);
							
							if(!(packet.uid === that.uid)) {
								// ignore
								return;
							}
//							
		// if(!packet.body) {
		// // ignore
		// return;
		// }
							console.debug("Access " + that.uid + " reçoit un message... " + tkn.data);
							resolve(packet.body);
			
							console.debug("Je résouds!");
						} catch (e) {
							reject(tkn.data);
						}
						// that.body = document.getElementsByTagName("body")[0];
						iframe.parentNode.removeChild(iframe);
						window.removeEventListener('message', mafunc);
				    });
			
					console.debug("On envoit une request... frameId: init-" + that.uid + "\trequestId: " + that.uid);
					var request = {uid:that.uid, access:access, prop:prop, value:value, level:level};
					console.debug(request);
					iframe.contentWindow.postMessage(JSON.stringify(request), '*');
					setTimeout(()=>reject("TIMEOUTED!"), 20000);
				});
			});
			return promise;
		}
	
}

function __createDebugIFrame() {
	onLoadThen().then(function(){
		var iframe = document.createElement("iframe");
		iframe.src=IFRAME_ROOT_URL + "?for-debug-only";
		iframe.style="display:none;";
		document.getElementsByTagName("body")[0].appendChild(iframe);
	});
}

class PublicStorage { 
	
	constructor({debug=false}={}) {
		if(debug) {
				__createDebugIFrame();				 
		}		
	}
	 
	sessionGet(prop) {
		 return new PublicStorageAccess().access("get", prop, null, "session");
	}
	sessionSet(prop, value) {
		 return new PublicStorageAccess().access("set", prop, value, "session");
	}
	localGet(prop) {
		 return new PublicStorageAccess().access("get", prop, null, "local");
	}
	localSet(prop, value) {
		 return new PublicStorageAccess().access("set", prop, value, "local");
	}
	get(prop) {
		 return this.localGet(prop);
	}
	set(prop, value) {
		 return this.localSet(prop, value);
	}
}

const publicstorage = new PublicStorage();

function onLoadThen() {
	return new Promise(function(resolve, reject) {
		if (window) {
			if(document.getElementsByTagName('BODY')[0]) {
				resolve();
			} else {				
				window.addEventListener('load', function unregisterme() {
					resolve();
					window.removeEventListener('load', unregisterme);
				});
			}
		}
		setTimeout(function() {reject(new Error("Timeout waiting for onLoad!"));}, 10000);
	});
}

onLoadThen().then(function() {
	window.publicstorage = publicstorage;
}).catch(e=>console.error(e));

export {onLoadThen, PublicStorage, publicstorage as default}
// module.exports = onLoadThen();
