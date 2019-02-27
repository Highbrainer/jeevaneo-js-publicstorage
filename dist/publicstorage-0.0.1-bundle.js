(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
class PublicStorage {

	 constructor () {
// const IFRAME_ROOT_URL = "http://localhost:8080/httpd/cache/iframe2.html";
		 this.IFRAME_ROOT_URL = "http://sl900311.maif.local:6084/shared-memory/shared-iframe.html";
	 }

	 uniqueId(){
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
		return new Promise(function(resolve, reject) {
			console.debug("Je démarre...");
			window.addEventListener('message', function mafunc(tkn) {
				
				console.debug("prepareIFrame " + that.iframe.id + " reçoit un message... " + tkn.data);
				
				if (that.IFRAME_ROOT_URL.indexOf(tkn.origin)<0) {
					return;
				}
				
				try {
					var packet = JSON.parse(tkn.data);
					
					if(!(packet.frameId === that.iframe.id)) {
						// ignore
						return;
					}
					
					console.debug("prepareIFrame " + that.iframe.id + " accepte un message... " + tkn.data);
					if(packet.ready) {
						resolve(that.iframe);					
					}
				} catch (e) {
					reject(tkn.data);
				}
				window.removeEventListener('message', mafunc);
				// that.body.removeChild(that.iframe);
		    });
			that.iframe = document.createElement("iframe");
			that.iframe.id=that.uniqueId();
// that.iframe.src="http://localhost:9999/iframe.html" + "?action=" +
// "fetchAllApplications";
// that.iframe.src="http://sl900311.maif.local:6084/iframe.html";
			that.iframe.src=that.IFRAME_ROOT_URL + "?uid="+that.iframe.id;
			that.iframe.style="display:none;";
			that.body = document.getElementsByTagName("body")[0]; 
			that.body.appendChild(that.iframe);

// console.log("J'envoie une request...");
// that.iframe.contentWindow.postMessage('fetchAllApplications', '*');
			setTimeout(()=>reject("TIMEOUTED!"), 20000);
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
		
	var requestId = this.uniqueId(); 
	var that = this;
	
	var promise = new Promise(function(resolve, reject) {
		console.debug("Je démarre... " + that);
		that.prepareIFrame().then(iframe => {
			window.addEventListener('message', function mafunc(tkn) {
				if (that.IFRAME_ROOT_URL.indexOf(tkn.origin)<0) {
					return;
				}
				try {
					var packet = JSON.parse(tkn.data);
					
					if(!(packet.uid === requestId)) {
						// ignore
						return;
					}
//					
//					if(!packet.body) {
//						// ignore
//						return;
//					}
					console.debug("Access " + requestId + " reçoit un message... " + tkn.data);
					resolve(packet.body);
	
					console.debug("Je résouds!");
				} catch (e) {
					reject(tkn.data);
				}
				that.body = document.getElementsByTagName("body")[0];
				that.body.removeChild(that.iframe);
				window.removeEventListener('message', mafunc);
		    });
	
			console.debug("On envoit une request... frameId: " + that.iframe.id + "\trequestId: " + requestId);
			var request = {uid:requestId, access:access, prop:prop, value:value, level:level};
			console.debug(request);
			that.iframe.contentWindow.postMessage(JSON.stringify(request), '*');
			setTimeout(()=>reject("TIMEOUTED!"), 20000);
		});
	});
	return promise;
}

 sessionGet(prop) {
	 return this.access("get", prop, null, "session");
 }
 sessionSet(prop, value) {
	 return this.access("set", prop, value, "session");
 }
 localGet(prop) {
	 return this.access("get", prop, null, "local");
 }
 localSet(prop, value) {
	 return this.access("set", prop, value, "local");
 }
 get(prop) {
	 return this.localGet(prop);
 }
 set(prop, value) {
	 return this.localSet(prop, value); 
 }


}

const publicstorage = new PublicStorage();

window.publicstorage = publicstorage;

module.exports = publicstorage;
},{}]},{},[1]);
