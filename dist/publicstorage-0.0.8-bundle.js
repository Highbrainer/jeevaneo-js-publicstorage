(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.onLoadThen = onLoadThen;
exports.default = exports.PublicStorage = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var IFRAME_ROOT_URL = "https://publicstorage.neocities.org/shared-iframe.html";

var PublicStorageAccess =
/*#__PURE__*/
function () {
  function PublicStorageAccess() {
    _classCallCheck(this, PublicStorageAccess);

    this.uid = this.uniqueId();
  }

  _createClass(PublicStorageAccess, [{
    key: "uniqueId",
    value: function uniqueId() {
      function chr4() {
        return Math.random().toString(16).slice(-4);
      }

      return chr4() + chr4() + '-' + chr4() + '-' + chr4() + '-' + chr4() + '-' + chr4() + chr4() + chr4();
    }
  }, {
    key: "prepareIFrame",
    value: function prepareIFrame() {
      var that = this;
      var iframe = document.createElement("iframe");
      iframe.id = that.uid;
      iframe.src = IFRAME_ROOT_URL + "?uid=init-" + that.uid;
      iframe.style = "display:none;";
      return new Promise(function (resolve, reject) {
        console.debug("Je démarre...");
        window.addEventListener('message', function mafunc(tkn) {
          console.debug("prepareIFrame " + that.uid + " reçoit un message... " + tkn.data);

          if (IFRAME_ROOT_URL.indexOf(tkn.origin) < 0) {
            return;
          }

          try {
            var packet = JSON.parse(tkn.data);

            if (!(packet.frameId === "init-" + that.uid)) {
              // ignore
              return;
            }

            console.debug("prepareIFrame " + that.uid + " accepte un message... " + tkn.data);

            if (packet.ready) {
              resolve(iframe);
            }
          } catch (e) {
            reject(tkn.data);
          }

          window.removeEventListener('message', mafunc); // that.body.removeChild(that.iframe);
        });
        onLoadThen().then(function () {
          console.debug("Adding the iframe for " + that.uid);
          document.getElementsByTagName("body")[0].appendChild(iframe);
        });
        setTimeout(function () {
          return reject("Request ".concat(that.uid, " TIMEOUTED!"));
        }, 20000);
      });
    }
  }, {
    key: "access",
    value: function access(_access, prop) {
      var value = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var level = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "local";

      if (!(_access === "get" || _access === "set" || _access === "delete")) {
        throw new Error("access can only be 'set', 'get' or 'delete' - not '" + _access + "'");
      }

      if (!prop) {
        throw new Error("Prop name is mandatory");
      }

      if (!(level === "local" || level === "session")) {
        throw new Error("level can only be 'session' or 'local' - not '" + _access + "'");
      }

      var that = this;
      var promise = new Promise(function (resolve, reject) {
        that.prepareIFrame().then(function (iframe) {
          window.addEventListener('message', function mafunc(tkn) {
            if (IFRAME_ROOT_URL.indexOf(tkn.origin) < 0) {
              return;
            }

            try {
              var packet = JSON.parse(tkn.data);

              if (!(packet.uid === that.uid)) {
                // ignore
                return;
              } //							
              // if(!packet.body) {
              // // ignore
              // return;
              // }


              console.debug("Access " + that.uid + " reçoit un message... " + tkn.data);
              resolve(packet.body);
              console.debug("Je résouds!");
            } catch (e) {
              reject(tkn.data);
            } // that.body = document.getElementsByTagName("body")[0];


            iframe.parentNode.removeChild(iframe);
            window.removeEventListener('message', mafunc);
          });
          console.debug("On envoit une request... frameId: init-" + that.uid + "\trequestId: " + that.uid);
          var request = {
            uid: that.uid,
            access: _access,
            prop: prop,
            value: value,
            level: level
          };
          console.debug(request);
          iframe.contentWindow.postMessage(JSON.stringify(request), '*');
          setTimeout(function () {
            return reject("TIMEOUTED!");
          }, 20000);
        });
      });
      return promise;
    }
  }]);

  return PublicStorageAccess;
}();

function __createDebugIFrame() {
  onLoadThen().then(function () {
    var iframe = document.createElement("iframe");
    iframe.src = IFRAME_ROOT_URL + "?for-debug-only";
    iframe.style = "display:none;";
    document.getElementsByTagName("body")[0].appendChild(iframe);
  });
}

var PublicStorage =
/*#__PURE__*/
function () {
  function PublicStorage() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$debug = _ref.debug,
        debug = _ref$debug === void 0 ? false : _ref$debug;

    _classCallCheck(this, PublicStorage);

    if (debug) {
      __createDebugIFrame();
    }
  }

  _createClass(PublicStorage, [{
    key: "sessionGet",
    value: function sessionGet(prop) {
      return new PublicStorageAccess().access("get", prop, null, "session");
    }
  }, {
    key: "sessionSet",
    value: function sessionSet(prop, value) {
      return new PublicStorageAccess().access("set", prop, value, "session");
    }
  }, {
    key: "sessionUnset",
    value: function sessionUnset(prop, value) {
      return new PublicStorageAccess().access("delete", prop, null, "session");
    }
  }, {
    key: "localGet",
    value: function localGet(prop) {
      return new PublicStorageAccess().access("get", prop, null, "local");
    }
  }, {
    key: "localSet",
    value: function localSet(prop, value) {
      return new PublicStorageAccess().access("set", prop, value, "local");
    }
  }, {
    key: "localUnset",
    value: function localUnset(prop) {
      return new PublicStorageAccess().access("delete", prop, null, "local");
    }
  }, {
    key: "get",
    value: function get(prop) {
      return this.localGet(prop);
    }
  }, {
    key: "set",
    value: function set(prop, value) {
      return this.localSet(prop, value);
    }
  }, {
    key: "unset",
    value: function unset(prop) {
      return this.localUnset(prop);
    }
  }]);

  return PublicStorage;
}();

exports.PublicStorage = PublicStorage;
var publicstorage = new PublicStorage();
exports.default = publicstorage;

function onLoadThen() {
  return new Promise(function (resolve, reject) {
    if (window) {
      if (document.getElementsByTagName('BODY')[0]) {
        resolve();
      } else {
        window.addEventListener('load', function unregisterme() {
          resolve();
          window.removeEventListener('load', unregisterme);
        });
      }
    }

    setTimeout(function () {
      reject(new Error("Timeout waiting for onLoad!"));
    }, 10000);
  });
}

onLoadThen().then(function () {
  window.publicstorage = publicstorage;
}).catch(function (e) {
  return console.error(e);
}); // module.exports = onLoadThen();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7OztBQ0FBLElBQU0sZUFBZSxHQUFHLHdEQUF4Qjs7SUFFTSxtQjs7O0FBRUosaUNBQWU7QUFBQTs7QUFDZCxTQUFLLEdBQUwsR0FBVyxLQUFLLFFBQUwsRUFBWDtBQUNBOzs7OytCQUVTO0FBQ1YsZUFBUyxJQUFULEdBQWU7QUFDZCxlQUFPLElBQUksQ0FBQyxNQUFMLEdBQWMsUUFBZCxDQUF1QixFQUF2QixFQUEyQixLQUEzQixDQUFpQyxDQUFDLENBQWxDLENBQVA7QUFDQzs7QUFDRixhQUFPLElBQUksS0FBSyxJQUFJLEVBQWIsR0FDTCxHQURLLEdBQ0MsSUFBSSxFQURMLEdBRUwsR0FGSyxHQUVDLElBQUksRUFGTCxHQUdMLEdBSEssR0FHQyxJQUFJLEVBSEwsR0FJTCxHQUpLLEdBSUMsSUFBSSxFQUpMLEdBSVUsSUFBSSxFQUpkLEdBSW1CLElBQUksRUFKOUI7QUFLQTs7O29DQUVnQjtBQUNoQixVQUFJLElBQUksR0FBRyxJQUFYO0FBQ0EsVUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsUUFBdkIsQ0FBYjtBQUNBLE1BQUEsTUFBTSxDQUFDLEVBQVAsR0FBVSxJQUFJLENBQUMsR0FBZjtBQUNBLE1BQUEsTUFBTSxDQUFDLEdBQVAsR0FBVyxlQUFlLEdBQUcsWUFBbEIsR0FBK0IsSUFBSSxDQUFDLEdBQS9DO0FBQ0EsTUFBQSxNQUFNLENBQUMsS0FBUCxHQUFhLGVBQWI7QUFDQSxhQUFPLElBQUksT0FBSixDQUFZLFVBQVMsT0FBVCxFQUFrQixNQUFsQixFQUEwQjtBQUM1QyxRQUFBLE9BQU8sQ0FBQyxLQUFSLENBQWMsZUFBZDtBQUNBLFFBQUEsTUFBTSxDQUFDLGdCQUFQLENBQXdCLFNBQXhCLEVBQW1DLFNBQVMsTUFBVCxDQUFnQixHQUFoQixFQUFxQjtBQUV2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VztBQUM1QixFQUFBLE1BQU0sQ0FBQyxhQUFQLEdBQXVCLGFBQXZCO0FBQ0EsQ0FGRCxFQUVHLEtBRkgsQ0FFUyxVQUFBLENBQUM7QUFBQSxTQUFFLE9BQU8sQ0FBQyxLQUFSLENBQWMsQ0FBZCxDQUFGO0FBQUEsQ0FGVixFLENBS0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBJRlJBTUVfUk9PVF9VUkwgPSBcImh0dHBzOi8vcHVibGljc3RvcmFnZS5uZW9jaXRpZXMub3JnL3NoYXJlZC1pZnJhbWUuaHRtbFwiO1xyXG5cclxuY2xhc3MgUHVibGljU3RvcmFnZUFjY2VzcyB7XHJcblxyXG5cdCBjb25zdHJ1Y3RvciAoKSB7XHJcblx0XHQgdGhpcy51aWQgPSB0aGlzLnVuaXF1ZUlkKCk7XHJcblx0IH1cclxuXHQgXHJcblx0dW5pcXVlSWQoKSB7XHJcblx0XHRmdW5jdGlvbiBjaHI0KCl7XHJcblx0XHRcdHJldHVybiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDE2KS5zbGljZSgtNCk7XHJcblx0XHRcdH1cclxuXHRcdHJldHVybiBjaHI0KCkgKyBjaHI0KCkgK1xyXG5cdFx0XHRcdCctJyArIGNocjQoKSArXHJcblx0XHRcdFx0Jy0nICsgY2hyNCgpICtcclxuXHRcdFx0XHQnLScgKyBjaHI0KCkgK1xyXG5cdFx0XHRcdCctJyArIGNocjQoKSArIGNocjQoKSArIGNocjQoKTtcclxuXHR9XHJcblxyXG5cdCBwcmVwYXJlSUZyYW1lKCkge1xyXG5cdFx0dmFyIHRoYXQgPSB0aGlzO1xyXG5cdFx0dmFyIGlmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpZnJhbWVcIik7XHJcblx0XHRpZnJhbWUuaWQ9dGhhdC51aWQ7XHJcblx0XHRpZnJhbWUuc3JjPUlGUkFNRV9ST09UX1VSTCArIFwiP3VpZD1pbml0LVwiK3RoYXQudWlkO1xyXG5cdFx0aWZyYW1lLnN0eWxlPVwiZGlzcGxheTpub25lO1wiO1xyXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xyXG5cdFx0XHRjb25zb2xlLmRlYnVnKFwiSmUgZMOpbWFycmUuLi5cIik7XHJcblx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gbWFmdW5jKHRrbikge1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGNvbnNvbGUuZGVidWcoXCJwcmVwYXJlSUZyYW1lIFwiICsgdGhhdC51aWQgKyBcIiByZcOnb2l0IHVuIG1lc3NhZ2UuLi4gXCIgKyB0a24uZGF0YSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYgKElGUkFNRV9ST09UX1VSTC5pbmRleE9mKHRrbi5vcmlnaW4pPDApIHtcclxuXHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdHZhciBwYWNrZXQgPSBKU09OLnBhcnNlKHRrbi5kYXRhKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aWYoIShwYWNrZXQuZnJhbWVJZCA9PT0gXCJpbml0LVwiICsgdGhhdC51aWQpKSB7XHJcblx0XHRcdFx0XHRcdC8vIGlnbm9yZVxyXG5cdFx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGNvbnNvbGUuZGVidWcoXCJwcmVwYXJlSUZyYW1lIFwiICsgdGhhdC51aWQgKyBcIiBhY2NlcHRlIHVuIG1lc3NhZ2UuLi4gXCIgKyB0a24uZGF0YSk7XHJcblx0XHRcdFx0XHRpZihwYWNrZXQucmVhZHkpIHtcclxuXHRcdFx0XHRcdFx0cmVzb2x2ZShpZnJhbWUpO1x0XHRcdFx0XHRcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9IGNhdGNoIChlKSB7XHJcblx0XHRcdFx0XHRyZWplY3QodGtuLmRhdGEpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIG1hZnVuYyk7XHJcblx0XHRcdFx0Ly8gdGhhdC5ib2R5LnJlbW92ZUNoaWxkKHRoYXQuaWZyYW1lKTtcclxuXHRcdCAgICB9KTtcclxuXHRcdFx0b25Mb2FkVGhlbigpLnRoZW4oKCkgPT4ge1xyXG5cdFx0XHRcdGNvbnNvbGUuZGVidWcoXCJBZGRpbmcgdGhlIGlmcmFtZSBmb3IgXCIgKyB0aGF0LnVpZCk7XHJcblx0XHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJib2R5XCIpWzBdLmFwcGVuZENoaWxkKGlmcmFtZSk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0c2V0VGltZW91dCgoKT0+cmVqZWN0KGBSZXF1ZXN0ICR7dGhhdC51aWR9IFRJTUVPVVRFRCFgKSwgMjAwMDApO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdCBcclxuXHQgYWNjZXNzKGFjY2VzcywgcHJvcCwgdmFsdWUgPSBudWxsLCBsZXZlbCA9IFwibG9jYWxcIikge1xyXG5cdFx0XHRcclxuXHRcdFx0aWYoIShhY2Nlc3MgPT09IFwiZ2V0XCIgfHwgYWNjZXNzID09PSBcInNldFwiIHx8IGFjY2VzcyA9PT0gXCJkZWxldGVcIikpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJhY2Nlc3MgY2FuIG9ubHkgYmUgJ3NldCcsICdnZXQnIG9yICdkZWxldGUnIC0gbm90ICdcIiArIGFjY2VzcyArIFwiJ1wiKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYgKCFwcm9wKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUHJvcCBuYW1lIGlzIG1hbmRhdG9yeVwiKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYoIShsZXZlbCA9PT0gXCJsb2NhbFwiIHx8IGxldmVsID09PSBcInNlc3Npb25cIikpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJsZXZlbCBjYW4gb25seSBiZSAnc2Vzc2lvbicgb3IgJ2xvY2FsJyAtIG5vdCAnXCIgKyBhY2Nlc3MgKyBcIidcIik7XHJcblx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0dmFyIHRoYXQgPSB0aGlzO1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuXHRcdFx0XHR0aGF0LnByZXBhcmVJRnJhbWUoKS50aGVuKGlmcmFtZSA9PiB7XHJcblx0XHRcdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIG1hZnVuYyh0a24pIHtcclxuXHRcdFx0XHRcdFx0aWYgKElGUkFNRV9ST09UX1VSTC5pbmRleE9mKHRrbi5vcmlnaW4pPDApIHtcclxuXHRcdFx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdFx0XHR2YXIgcGFja2V0ID0gSlNPTi5wYXJzZSh0a24uZGF0YSk7XHJcblx0XHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdFx0aWYoIShwYWNrZXQudWlkID09PSB0aGF0LnVpZCkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdC8vIGlnbm9yZVxyXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuLy9cdFx0XHRcdFx0XHRcdFxyXG5cdFx0Ly8gaWYoIXBhY2tldC5ib2R5KSB7XHJcblx0XHQvLyAvLyBpZ25vcmVcclxuXHRcdC8vIHJldHVybjtcclxuXHRcdC8vIH1cclxuXHRcdFx0XHRcdFx0XHRjb25zb2xlLmRlYnVnKFwiQWNjZXNzIFwiICsgdGhhdC51aWQgKyBcIiByZcOnb2l0IHVuIG1lc3NhZ2UuLi4gXCIgKyB0a24uZGF0YSk7XHJcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZShwYWNrZXQuYm9keSk7XHJcblx0XHRcdFxyXG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUuZGVidWcoXCJKZSByw6lzb3VkcyFcIik7XHJcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRcdFx0XHRyZWplY3QodGtuLmRhdGEpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdC8vIHRoYXQuYm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiYm9keVwiKVswXTtcclxuXHRcdFx0XHRcdFx0aWZyYW1lLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoaWZyYW1lKTtcclxuXHRcdFx0XHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBtYWZ1bmMpO1xyXG5cdFx0XHRcdCAgICB9KTtcclxuXHRcdFx0XHJcblx0XHRcdFx0XHRjb25zb2xlLmRlYnVnKFwiT24gZW52b2l0IHVuZSByZXF1ZXN0Li4uIGZyYW1lSWQ6IGluaXQtXCIgKyB0aGF0LnVpZCArIFwiXFx0cmVxdWVzdElkOiBcIiArIHRoYXQudWlkKTtcclxuXHRcdFx0XHRcdHZhciByZXF1ZXN0ID0ge3VpZDp0aGF0LnVpZCwgYWNjZXNzOmFjY2VzcywgcHJvcDpwcm9wLCB2YWx1ZTp2YWx1ZSwgbGV2ZWw6bGV2ZWx9O1xyXG5cdFx0XHRcdFx0Y29uc29sZS5kZWJ1ZyhyZXF1ZXN0KTtcclxuXHRcdFx0XHRcdGlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKEpTT04uc3RyaW5naWZ5KHJlcXVlc3QpLCAnKicpO1xyXG5cdFx0XHRcdFx0c2V0VGltZW91dCgoKT0+cmVqZWN0KFwiVElNRU9VVEVEIVwiKSwgMjAwMDApO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0cmV0dXJuIHByb21pc2U7XHJcblx0XHR9XHJcblx0XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9fY3JlYXRlRGVidWdJRnJhbWUoKSB7XHJcblx0b25Mb2FkVGhlbigpLnRoZW4oZnVuY3Rpb24oKXtcclxuXHRcdHZhciBpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaWZyYW1lXCIpO1xyXG5cdFx0aWZyYW1lLnNyYz1JRlJBTUVfUk9PVF9VUkwgKyBcIj9mb3ItZGVidWctb25seVwiO1xyXG5cdFx0aWZyYW1lLnN0eWxlPVwiZGlzcGxheTpub25lO1wiO1xyXG5cdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJib2R5XCIpWzBdLmFwcGVuZENoaWxkKGlmcmFtZSk7XHJcblx0fSk7XHJcbn1cclxuXHJcbmNsYXNzIFB1YmxpY1N0b3JhZ2UgeyBcclxuXHRcclxuXHRjb25zdHJ1Y3Rvcih7ZGVidWc9ZmFsc2V9PXt9KSB7XHJcblx0XHRpZihkZWJ1Zykge1xyXG5cdFx0XHRcdF9fY3JlYXRlRGVidWdJRnJhbWUoKTtcdFx0XHRcdCBcclxuXHRcdH1cdFx0XHJcblx0fVxyXG5cdCBcclxuXHRzZXNzaW9uR2V0KHByb3ApIHtcclxuXHRcdCByZXR1cm4gbmV3IFB1YmxpY1N0b3JhZ2VBY2Nlc3MoKS5hY2Nlc3MoXCJnZXRcIiwgcHJvcCwgbnVsbCwgXCJzZXNzaW9uXCIpO1xyXG5cdH1cclxuXHRzZXNzaW9uU2V0KHByb3AsIHZhbHVlKSB7XHJcblx0XHQgcmV0dXJuIG5ldyBQdWJsaWNTdG9yYWdlQWNjZXNzKCkuYWNjZXNzKFwic2V0XCIsIHByb3AsIHZhbHVlLCBcInNlc3Npb25cIik7XHJcblx0fVxyXG5cdHNlc3Npb25VbnNldChwcm9wLCB2YWx1ZSkge1xyXG5cdFx0IHJldHVybiBuZXcgUHVibGljU3RvcmFnZUFjY2VzcygpLmFjY2VzcyhcImRlbGV0ZVwiLCBwcm9wLCBudWxsLCBcInNlc3Npb25cIik7XHJcblx0fVxyXG5cdGxvY2FsR2V0KHByb3ApIHtcclxuXHRcdCByZXR1cm4gbmV3IFB1YmxpY1N0b3JhZ2VBY2Nlc3MoKS5hY2Nlc3MoXCJnZXRcIiwgcHJvcCwgbnVsbCwgXCJsb2NhbFwiKTtcclxuXHR9XHJcblx0bG9jYWxTZXQocHJvcCwgdmFsdWUpIHtcclxuXHRcdCByZXR1cm4gbmV3IFB1YmxpY1N0b3JhZ2VBY2Nlc3MoKS5hY2Nlc3MoXCJzZXRcIiwgcHJvcCwgdmFsdWUsIFwibG9jYWxcIik7XHJcblx0fVxyXG5cdGxvY2FsVW5zZXQocHJvcCkge1xyXG5cdFx0IHJldHVybiBuZXcgUHVibGljU3RvcmFnZUFjY2VzcygpLmFjY2VzcyhcImRlbGV0ZVwiLCBwcm9wLCBudWxsLCBcImxvY2FsXCIpO1xyXG5cdH1cclxuXHRnZXQocHJvcCkge1xyXG5cdFx0IHJldHVybiB0aGlzLmxvY2FsR2V0KHByb3ApO1xyXG5cdH1cclxuXHRzZXQocHJvcCwgdmFsdWUpIHtcclxuXHRcdCByZXR1cm4gdGhpcy5sb2NhbFNldChwcm9wLCB2YWx1ZSk7XHJcblx0fVxyXG5cdHVuc2V0KHByb3ApIHtcclxuXHRcdHJldHVybiB0aGlzLmxvY2FsVW5zZXQocHJvcCk7XHJcblx0fVxyXG59XHJcblxyXG5jb25zdCBwdWJsaWNzdG9yYWdlID0gbmV3IFB1YmxpY1N0b3JhZ2UoKTtcclxuXHJcbmZ1bmN0aW9uIG9uTG9hZFRoZW4oKSB7XHJcblx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xyXG5cdFx0aWYgKHdpbmRvdykge1xyXG5cdFx0XHRpZihkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnQk9EWScpWzBdKSB7XHJcblx0XHRcdFx0cmVzb2x2ZSgpO1xyXG5cdFx0XHR9IGVsc2Uge1x0XHRcdFx0XHJcblx0XHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbiB1bnJlZ2lzdGVybWUoKSB7XHJcblx0XHRcdFx0XHRyZXNvbHZlKCk7XHJcblx0XHRcdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbG9hZCcsIHVucmVnaXN0ZXJtZSk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7cmVqZWN0KG5ldyBFcnJvcihcIlRpbWVvdXQgd2FpdGluZyBmb3Igb25Mb2FkIVwiKSk7fSwgMTAwMDApO1xyXG5cdH0pO1xyXG59XHJcblxyXG5vbkxvYWRUaGVuKCkudGhlbihmdW5jdGlvbigpIHtcclxuXHR3aW5kb3cucHVibGljc3RvcmFnZSA9IHB1YmxpY3N0b3JhZ2U7XHJcbn0pLmNhdGNoKGU9PmNvbnNvbGUuZXJyb3IoZSkpO1xyXG5cclxuZXhwb3J0IHtvbkxvYWRUaGVuLCBQdWJsaWNTdG9yYWdlLCBwdWJsaWNzdG9yYWdlIGFzIGRlZmF1bHR9XHJcbi8vIG1vZHVsZS5leHBvcnRzID0gb25Mb2FkVGhlbigpO1xyXG4iXX0=
