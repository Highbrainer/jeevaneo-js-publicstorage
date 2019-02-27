(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
class PublicStorage {

	 constructor () {
		 this.IFRAME_ROOT_URL = "https://publicstorage.neocities.org/shared-iframe.html";
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
			that.iframe.src=that.IFRAME_ROOT_URL + "?uid="+that.iframe.id;
			that.iframe.style="display:none;";
			that.body = document.getElementsByTagName("body")[0]; 
			that.body.appendChild(that.iframe);

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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY2xhc3MgUHVibGljU3RvcmFnZSB7XHJcblxyXG5cdCBjb25zdHJ1Y3RvciAoKSB7XHJcblx0XHQgdGhpcy5JRlJBTUVfUk9PVF9VUkwgPSBcImh0dHBzOi8vcHVibGljc3RvcmFnZS5uZW9jaXRpZXMub3JnL3NoYXJlZC1pZnJhbWUuaHRtbFwiO1xyXG5cdCB9XHJcblxyXG5cdCB1bmlxdWVJZCgpe1xyXG5cdCAgZnVuY3Rpb24gY2hyNCgpe1xyXG5cdCAgICByZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygxNikuc2xpY2UoLTQpO1xyXG5cdCAgfVxyXG5cdCAgcmV0dXJuIGNocjQoKSArIGNocjQoKSArXHJcblx0ICAgICctJyArIGNocjQoKSArXHJcblx0ICAgICctJyArIGNocjQoKSArXHJcblx0ICAgICctJyArIGNocjQoKSArXHJcblx0ICAgICctJyArIGNocjQoKSArIGNocjQoKSArIGNocjQoKTtcclxuXHR9XHJcblxyXG5cdCBwcmVwYXJlSUZyYW1lKCkge1xyXG5cdFx0dmFyIHRoYXQgPSB0aGlzO1xyXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xyXG5cdFx0XHRjb25zb2xlLmRlYnVnKFwiSmUgZMOpbWFycmUuLi5cIik7XHJcblx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gbWFmdW5jKHRrbikge1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGNvbnNvbGUuZGVidWcoXCJwcmVwYXJlSUZyYW1lIFwiICsgdGhhdC5pZnJhbWUuaWQgKyBcIiByZcOnb2l0IHVuIG1lc3NhZ2UuLi4gXCIgKyB0a24uZGF0YSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYgKHRoYXQuSUZSQU1FX1JPT1RfVVJMLmluZGV4T2YodGtuLm9yaWdpbik8MCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0dmFyIHBhY2tldCA9IEpTT04ucGFyc2UodGtuLmRhdGEpO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRpZighKHBhY2tldC5mcmFtZUlkID09PSB0aGF0LmlmcmFtZS5pZCkpIHtcclxuXHRcdFx0XHRcdFx0Ly8gaWdub3JlXHJcblx0XHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0Y29uc29sZS5kZWJ1ZyhcInByZXBhcmVJRnJhbWUgXCIgKyB0aGF0LmlmcmFtZS5pZCArIFwiIGFjY2VwdGUgdW4gbWVzc2FnZS4uLiBcIiArIHRrbi5kYXRhKTtcclxuXHRcdFx0XHRcdGlmKHBhY2tldC5yZWFkeSkge1xyXG5cdFx0XHRcdFx0XHRyZXNvbHZlKHRoYXQuaWZyYW1lKTtcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRcdFx0cmVqZWN0KHRrbi5kYXRhKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBtYWZ1bmMpO1xyXG5cdFx0XHRcdC8vIHRoYXQuYm9keS5yZW1vdmVDaGlsZCh0aGF0LmlmcmFtZSk7XHJcblx0XHQgICAgfSk7XHJcblx0XHRcdHRoYXQuaWZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlmcmFtZVwiKTtcclxuXHRcdFx0dGhhdC5pZnJhbWUuaWQ9dGhhdC51bmlxdWVJZCgpO1xyXG5cdFx0XHR0aGF0LmlmcmFtZS5zcmM9dGhhdC5JRlJBTUVfUk9PVF9VUkwgKyBcIj91aWQ9XCIrdGhhdC5pZnJhbWUuaWQ7XHJcblx0XHRcdHRoYXQuaWZyYW1lLnN0eWxlPVwiZGlzcGxheTpub25lO1wiO1xyXG5cdFx0XHR0aGF0LmJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImJvZHlcIilbMF07IFxyXG5cdFx0XHR0aGF0LmJvZHkuYXBwZW5kQ2hpbGQodGhhdC5pZnJhbWUpO1xyXG5cclxuXHRcdFx0c2V0VGltZW91dCgoKT0+cmVqZWN0KFwiVElNRU9VVEVEIVwiKSwgMjAwMDApO1xyXG5cdFx0fSk7XHJcblx0fVxyXG4gYWNjZXNzKGFjY2VzcywgcHJvcCwgdmFsdWUgPSBudWxsLCBsZXZlbCA9IFwibG9jYWxcIikge1xyXG5cdFxyXG5cdGlmKCEoYWNjZXNzID09PSBcImdldFwiIHx8IGFjY2VzcyA9PT0gXCJzZXRcIiB8fCBhY2Nlc3MgPT09IFwiZGVsZXRlXCIpKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJhY2Nlc3MgY2FuIG9ubHkgYmUgJ3NldCcsICdnZXQnIG9yICdkZWxldGUnIC0gbm90ICdcIiArIGFjY2VzcyArIFwiJ1wiKTtcclxuXHR9XHJcblx0XHJcblx0aWYgKCFwcm9wKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJQcm9wIG5hbWUgaXMgbWFuZGF0b3J5XCIpO1xyXG5cdH1cclxuXHRcclxuXHRpZighKGxldmVsID09PSBcImxvY2FsXCIgfHwgbGV2ZWwgPT09IFwic2Vzc2lvblwiKSkge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwibGV2ZWwgY2FuIG9ubHkgYmUgJ3Nlc3Npb24nIG9yICdsb2NhbCcgLSBub3QgJ1wiICsgYWNjZXNzICsgXCInXCIpO1xyXG5cdH1cclxuXHRcdFxyXG5cdHZhciByZXF1ZXN0SWQgPSB0aGlzLnVuaXF1ZUlkKCk7IFxyXG5cdHZhciB0aGF0ID0gdGhpcztcclxuXHRcclxuXHR2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xyXG5cdFx0Y29uc29sZS5kZWJ1ZyhcIkplIGTDqW1hcnJlLi4uIFwiICsgdGhhdCk7XHJcblx0XHR0aGF0LnByZXBhcmVJRnJhbWUoKS50aGVuKGlmcmFtZSA9PiB7XHJcblx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gbWFmdW5jKHRrbikge1xyXG5cdFx0XHRcdGlmICh0aGF0LklGUkFNRV9ST09UX1VSTC5pbmRleE9mKHRrbi5vcmlnaW4pPDApIHtcclxuXHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdHZhciBwYWNrZXQgPSBKU09OLnBhcnNlKHRrbi5kYXRhKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aWYoIShwYWNrZXQudWlkID09PSByZXF1ZXN0SWQpKSB7XHJcblx0XHRcdFx0XHRcdC8vIGlnbm9yZVxyXG5cdFx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0XHR9XHJcbi8vXHRcdFx0XHRcdFxyXG4vL1x0XHRcdFx0XHRpZighcGFja2V0LmJvZHkpIHtcclxuLy9cdFx0XHRcdFx0XHQvLyBpZ25vcmVcclxuLy9cdFx0XHRcdFx0XHRyZXR1cm47XHJcbi8vXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGNvbnNvbGUuZGVidWcoXCJBY2Nlc3MgXCIgKyByZXF1ZXN0SWQgKyBcIiByZcOnb2l0IHVuIG1lc3NhZ2UuLi4gXCIgKyB0a24uZGF0YSk7XHJcblx0XHRcdFx0XHRyZXNvbHZlKHBhY2tldC5ib2R5KTtcclxuXHRcclxuXHRcdFx0XHRcdGNvbnNvbGUuZGVidWcoXCJKZSByw6lzb3VkcyFcIik7XHJcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRcdFx0cmVqZWN0KHRrbi5kYXRhKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0dGhhdC5ib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJib2R5XCIpWzBdO1xyXG5cdFx0XHRcdHRoYXQuYm9keS5yZW1vdmVDaGlsZCh0aGF0LmlmcmFtZSk7XHJcblx0XHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBtYWZ1bmMpO1xyXG5cdFx0ICAgIH0pO1xyXG5cdFxyXG5cdFx0XHRjb25zb2xlLmRlYnVnKFwiT24gZW52b2l0IHVuZSByZXF1ZXN0Li4uIGZyYW1lSWQ6IFwiICsgdGhhdC5pZnJhbWUuaWQgKyBcIlxcdHJlcXVlc3RJZDogXCIgKyByZXF1ZXN0SWQpO1xyXG5cdFx0XHR2YXIgcmVxdWVzdCA9IHt1aWQ6cmVxdWVzdElkLCBhY2Nlc3M6YWNjZXNzLCBwcm9wOnByb3AsIHZhbHVlOnZhbHVlLCBsZXZlbDpsZXZlbH07XHJcblx0XHRcdGNvbnNvbGUuZGVidWcocmVxdWVzdCk7XHJcblx0XHRcdHRoYXQuaWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoSlNPTi5zdHJpbmdpZnkocmVxdWVzdCksICcqJyk7XHJcblx0XHRcdHNldFRpbWVvdXQoKCk9PnJlamVjdChcIlRJTUVPVVRFRCFcIiksIDIwMDAwKTtcclxuXHRcdH0pO1xyXG5cdH0pO1xyXG5cdHJldHVybiBwcm9taXNlO1xyXG59XHJcblxyXG4gc2Vzc2lvbkdldChwcm9wKSB7XHJcblx0IHJldHVybiB0aGlzLmFjY2VzcyhcImdldFwiLCBwcm9wLCBudWxsLCBcInNlc3Npb25cIik7XHJcbiB9XHJcbiBzZXNzaW9uU2V0KHByb3AsIHZhbHVlKSB7XHJcblx0IHJldHVybiB0aGlzLmFjY2VzcyhcInNldFwiLCBwcm9wLCB2YWx1ZSwgXCJzZXNzaW9uXCIpO1xyXG4gfVxyXG4gbG9jYWxHZXQocHJvcCkge1xyXG5cdCByZXR1cm4gdGhpcy5hY2Nlc3MoXCJnZXRcIiwgcHJvcCwgbnVsbCwgXCJsb2NhbFwiKTtcclxuIH1cclxuIGxvY2FsU2V0KHByb3AsIHZhbHVlKSB7XHJcblx0IHJldHVybiB0aGlzLmFjY2VzcyhcInNldFwiLCBwcm9wLCB2YWx1ZSwgXCJsb2NhbFwiKTtcclxuIH1cclxuIGdldChwcm9wKSB7XHJcblx0IHJldHVybiB0aGlzLmxvY2FsR2V0KHByb3ApO1xyXG4gfVxyXG4gc2V0KHByb3AsIHZhbHVlKSB7XHJcblx0IHJldHVybiB0aGlzLmxvY2FsU2V0KHByb3AsIHZhbHVlKTsgXHJcbiB9XHJcblxyXG5cclxufVxyXG5cclxuY29uc3QgcHVibGljc3RvcmFnZSA9IG5ldyBQdWJsaWNTdG9yYWdlKCk7XHJcblxyXG53aW5kb3cucHVibGljc3RvcmFnZSA9IHB1YmxpY3N0b3JhZ2U7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHB1YmxpY3N0b3JhZ2U7XHJcbiJdfQ==
