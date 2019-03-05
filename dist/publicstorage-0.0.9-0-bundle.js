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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7OztBQ0FBLElBQU0sZUFBZSxHQUFHLHdEQUF4Qjs7SUFFTSxtQjs7O0FBRUosaUNBQWU7QUFBQTs7QUFDZCxTQUFLLEdBQUwsR0FBVyxLQUFLLFFBQUwsRUFBWDtBQUNBOzs7OytCQUVTO0FBQ1YsZUFBUyxJQUFULEdBQWU7QUFDZCxlQUFPLElBQUksQ0FBQyxNQUFMLEdBQWMsUUFBZCxDQUF1QixFQUF2QixFQUEyQixLQUEzQixDQUFpQyxDQUFDLENBQWxDLENBQVA7QUFDQzs7QUFDRixhQUFPLElBQUksS0FBSyxJQUFJLEVBQWIsR0FDTCxHQURLLEdBQ0MsSUFBSSxFQURMLEdBRUwsR0FGSyxHQUVDLElBQUksRUFGTCxHQUdMLEdBSEssR0FHQyxJQUFJLEVBSEwsR0FJTCxHQUpLLEdBSUMsSUFBSSxFQUpMLEdBSVUsSUFBSSxFQUpkLEdBSW1CLElBQUksRUFKOUI7QUFLQTs7O29DQUVnQjtBQUNoQixVQUFNLElBQUksR0FBRyxJQUFiO0FBQ0EsVUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsUUFBdkIsQ0FBZjtBQUNBLE1BQUEsTUFBTSxDQUFDLEVBQVAsR0FBVSxJQUFJLENBQUMsR0FBZjtBQUNBLE1BQUEsTUFBTSxDQUFDLEdBQVAsR0FBVyxlQUFlLEdBQUcsWUFBbEIsR0FBK0IsSUFBSSxDQUFDLEdBQS9DO0FBQ0EsTUFBQSxNQUFNLENBQUMsS0FBUCxHQUFhLGVBQWI7QUFDQSxhQUFPLElBQUksT0FBSixDQUFZLFVBQVMsT0FBVCxFQUFrQixNQUFsQixFQUEwQjtBQUM1QyxRQUFBLE9BQU8sQ0FBQyxLQUFSLENBQWMsZUFBZDtBQUNBLFFBQUEsTUFBTSxDQUFDLGdCQUFQLENBQXdCLFNBQXhCLEVBQW1DLFNBQVMsTUFBVCxDQUFnQixHQUFoQixFQUFxQjtBQUV2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QUFXO0FBQzVCLEVBQUEsTUFBTSxDQUFDLGFBQVAsR0FBdUIsYUFBdkI7QUFDQSxDQUZELEVBRUcsS0FGSCxDQUVTLFVBQUEsQ0FBQztBQUFBLFNBQUUsT0FBTyxDQUFDLEtBQVIsQ0FBYyxDQUFkLENBQUY7QUFBQSxDQUZWLEUsQ0FLQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IElGUkFNRV9ST09UX1VSTCA9IFwiaHR0cHM6Ly9wdWJsaWNzdG9yYWdlLm5lb2NpdGllcy5vcmcvc2hhcmVkLWlmcmFtZS5odG1sXCI7XHJcblxyXG5jbGFzcyBQdWJsaWNTdG9yYWdlQWNjZXNzIHtcclxuXHJcblx0IGNvbnN0cnVjdG9yICgpIHtcclxuXHRcdCB0aGlzLnVpZCA9IHRoaXMudW5pcXVlSWQoKTtcclxuXHQgfVxyXG5cdCBcclxuXHR1bmlxdWVJZCgpIHtcclxuXHRcdGZ1bmN0aW9uIGNocjQoKXtcclxuXHRcdFx0cmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMTYpLnNsaWNlKC00KTtcclxuXHRcdFx0fVxyXG5cdFx0cmV0dXJuIGNocjQoKSArIGNocjQoKSArXHJcblx0XHRcdFx0Jy0nICsgY2hyNCgpICtcclxuXHRcdFx0XHQnLScgKyBjaHI0KCkgK1xyXG5cdFx0XHRcdCctJyArIGNocjQoKSArXHJcblx0XHRcdFx0Jy0nICsgY2hyNCgpICsgY2hyNCgpICsgY2hyNCgpO1xyXG5cdH1cclxuXHJcblx0IHByZXBhcmVJRnJhbWUoKSB7XHJcblx0XHRjb25zdCB0aGF0ID0gdGhpcztcclxuXHRcdGNvbnN0IGlmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpZnJhbWVcIik7XHJcblx0XHRpZnJhbWUuaWQ9dGhhdC51aWQ7XHJcblx0XHRpZnJhbWUuc3JjPUlGUkFNRV9ST09UX1VSTCArIFwiP3VpZD1pbml0LVwiK3RoYXQudWlkO1xyXG5cdFx0aWZyYW1lLnN0eWxlPVwiZGlzcGxheTpub25lO1wiO1xyXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xyXG5cdFx0XHRjb25zb2xlLmRlYnVnKFwiSmUgZMOpbWFycmUuLi5cIik7XHJcblx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gbWFmdW5jKHRrbikge1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGNvbnNvbGUuZGVidWcoXCJwcmVwYXJlSUZyYW1lIFwiICsgdGhhdC51aWQgKyBcIiByZcOnb2l0IHVuIG1lc3NhZ2UuLi4gXCIgKyB0a24uZGF0YSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYgKElGUkFNRV9ST09UX1VSTC5pbmRleE9mKHRrbi5vcmlnaW4pPDApIHtcclxuXHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdGNvbnN0IHBhY2tldCA9IEpTT04ucGFyc2UodGtuLmRhdGEpO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRpZighKHBhY2tldC5mcmFtZUlkID09PSBcImluaXQtXCIgKyB0aGF0LnVpZCkpIHtcclxuXHRcdFx0XHRcdFx0Ly8gaWdub3JlXHJcblx0XHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0Y29uc29sZS5kZWJ1ZyhcInByZXBhcmVJRnJhbWUgXCIgKyB0aGF0LnVpZCArIFwiIGFjY2VwdGUgdW4gbWVzc2FnZS4uLiBcIiArIHRrbi5kYXRhKTtcclxuXHRcdFx0XHRcdGlmKHBhY2tldC5yZWFkeSkge1xyXG5cdFx0XHRcdFx0XHRyZXNvbHZlKGlmcmFtZSk7XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRcdHJlamVjdCh0a24uZGF0YSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgbWFmdW5jKTtcclxuXHRcdFx0XHQvLyB0aGF0LmJvZHkucmVtb3ZlQ2hpbGQodGhhdC5pZnJhbWUpO1xyXG5cdFx0ICAgIH0pO1xyXG5cdFx0XHRvbkxvYWRUaGVuKCkudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0Y29uc29sZS5kZWJ1ZyhcIkFkZGluZyB0aGUgaWZyYW1lIGZvciBcIiArIHRoYXQudWlkKTtcclxuXHRcdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImJvZHlcIilbMF0uYXBwZW5kQ2hpbGQoaWZyYW1lKTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRzZXRUaW1lb3V0KCgpPT5yZWplY3QoYFJlcXVlc3QgJHt0aGF0LnVpZH0gVElNRU9VVEVEIWApLCAyMDAwMCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0IFxyXG5cdCBhY2Nlc3MoYWNjZXNzLCBwcm9wLCB2YWx1ZSA9IG51bGwsIGxldmVsID0gXCJsb2NhbFwiKSB7XHJcblx0XHRcdFxyXG5cdFx0XHRpZighKGFjY2VzcyA9PT0gXCJnZXRcIiB8fCBhY2Nlc3MgPT09IFwic2V0XCIgfHwgYWNjZXNzID09PSBcImRlbGV0ZVwiKSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcImFjY2VzcyBjYW4gb25seSBiZSAnc2V0JywgJ2dldCcgb3IgJ2RlbGV0ZScgLSBub3QgJ1wiICsgYWNjZXNzICsgXCInXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAoIXByb3ApIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJQcm9wIG5hbWUgaXMgbWFuZGF0b3J5XCIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZighKGxldmVsID09PSBcImxvY2FsXCIgfHwgbGV2ZWwgPT09IFwic2Vzc2lvblwiKSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcImxldmVsIGNhbiBvbmx5IGJlICdzZXNzaW9uJyBvciAnbG9jYWwnIC0gbm90ICdcIiArIGFjY2VzcyArIFwiJ1wiKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRjb25zdCB0aGF0ID0gdGhpcztcclxuXHRcdFx0XHJcblx0XHRcdGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuXHRcdFx0XHR0aGF0LnByZXBhcmVJRnJhbWUoKS50aGVuKGlmcmFtZSA9PiB7XHJcblx0XHRcdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIG1hZnVuYyh0a24pIHtcclxuXHRcdFx0XHRcdFx0aWYgKElGUkFNRV9ST09UX1VSTC5pbmRleE9mKHRrbi5vcmlnaW4pPDApIHtcclxuXHRcdFx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdFx0XHR2YXIgcGFja2V0ID0gSlNPTi5wYXJzZSh0a24uZGF0YSk7XHJcblx0XHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdFx0aWYoIShwYWNrZXQudWlkID09PSB0aGF0LnVpZCkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdC8vIGlnbm9yZVxyXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuLy9cdFx0XHRcdFx0XHRcdFxyXG5cdFx0Ly8gaWYoIXBhY2tldC5ib2R5KSB7XHJcblx0XHQvLyAvLyBpZ25vcmVcclxuXHRcdC8vIHJldHVybjtcclxuXHRcdC8vIH1cclxuXHRcdFx0XHRcdFx0XHRjb25zb2xlLmRlYnVnKFwiQWNjZXNzIFwiICsgdGhhdC51aWQgKyBcIiByZcOnb2l0IHVuIG1lc3NhZ2UuLi4gXCIgKyB0a24uZGF0YSk7XHJcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZShwYWNrZXQuYm9keSk7XHJcblx0XHRcdFxyXG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUuZGVidWcoXCJKZSByw6lzb3VkcyFcIik7XHJcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRcdFx0XHRyZWplY3QodGtuLmRhdGEpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdC8vIHRoYXQuYm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiYm9keVwiKVswXTtcclxuXHRcdFx0XHRcdFx0aWZyYW1lLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoaWZyYW1lKTtcclxuXHRcdFx0XHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBtYWZ1bmMpO1xyXG5cdFx0XHRcdCAgICB9KTtcclxuXHRcdFx0XHJcblx0XHRcdFx0XHRjb25zb2xlLmRlYnVnKFwiT24gZW52b2l0IHVuZSByZXF1ZXN0Li4uIGZyYW1lSWQ6IGluaXQtXCIgKyB0aGF0LnVpZCArIFwiXFx0cmVxdWVzdElkOiBcIiArIHRoYXQudWlkKTtcclxuXHRcdFx0XHRcdGNvbnN0IHJlcXVlc3QgPSB7dWlkOnRoYXQudWlkLCBhY2Nlc3M6YWNjZXNzLCBwcm9wOnByb3AsIHZhbHVlOnZhbHVlLCBsZXZlbDpsZXZlbH07XHJcblx0XHRcdFx0XHRjb25zb2xlLmRlYnVnKHJlcXVlc3QpO1xyXG5cdFx0XHRcdFx0aWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoSlNPTi5zdHJpbmdpZnkocmVxdWVzdCksICcqJyk7XHJcblx0XHRcdFx0XHRzZXRUaW1lb3V0KCgpPT5yZWplY3QoXCJUSU1FT1VURUQhXCIpLCAyMDAwMCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRyZXR1cm4gcHJvbWlzZTtcclxuXHRcdH1cclxuXHRcclxufVxyXG5cclxuZnVuY3Rpb24gX19jcmVhdGVEZWJ1Z0lGcmFtZSgpIHtcclxuXHRvbkxvYWRUaGVuKCkudGhlbihmdW5jdGlvbigpe1xyXG5cdFx0Y29uc3QgaWZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlmcmFtZVwiKTtcclxuXHRcdGlmcmFtZS5zcmM9SUZSQU1FX1JPT1RfVVJMICsgXCI/Zm9yLWRlYnVnLW9ubHlcIjtcclxuXHRcdGlmcmFtZS5zdHlsZT1cImRpc3BsYXk6bm9uZTtcIjtcclxuXHRcdGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiYm9keVwiKVswXS5hcHBlbmRDaGlsZChpZnJhbWUpO1xyXG5cdH0pO1xyXG59XHJcblxyXG5jbGFzcyBQdWJsaWNTdG9yYWdlIHsgXHJcblx0XHJcblx0Y29uc3RydWN0b3Ioe2RlYnVnPWZhbHNlfT17fSkge1xyXG5cdFx0aWYoZGVidWcpIHtcclxuXHRcdFx0XHRfX2NyZWF0ZURlYnVnSUZyYW1lKCk7XHRcdFx0XHQgXHJcblx0XHR9XHRcdFxyXG5cdH1cclxuXHQgXHJcblx0c2Vzc2lvbkdldChwcm9wKSB7XHJcblx0XHQgcmV0dXJuIG5ldyBQdWJsaWNTdG9yYWdlQWNjZXNzKCkuYWNjZXNzKFwiZ2V0XCIsIHByb3AsIG51bGwsIFwic2Vzc2lvblwiKTtcclxuXHR9XHJcblx0c2Vzc2lvblNldChwcm9wLCB2YWx1ZSkge1xyXG5cdFx0IHJldHVybiBuZXcgUHVibGljU3RvcmFnZUFjY2VzcygpLmFjY2VzcyhcInNldFwiLCBwcm9wLCB2YWx1ZSwgXCJzZXNzaW9uXCIpO1xyXG5cdH1cclxuXHRzZXNzaW9uVW5zZXQocHJvcCwgdmFsdWUpIHtcclxuXHRcdCByZXR1cm4gbmV3IFB1YmxpY1N0b3JhZ2VBY2Nlc3MoKS5hY2Nlc3MoXCJkZWxldGVcIiwgcHJvcCwgbnVsbCwgXCJzZXNzaW9uXCIpO1xyXG5cdH1cclxuXHRsb2NhbEdldChwcm9wKSB7XHJcblx0XHQgcmV0dXJuIG5ldyBQdWJsaWNTdG9yYWdlQWNjZXNzKCkuYWNjZXNzKFwiZ2V0XCIsIHByb3AsIG51bGwsIFwibG9jYWxcIik7XHJcblx0fVxyXG5cdGxvY2FsU2V0KHByb3AsIHZhbHVlKSB7XHJcblx0XHQgcmV0dXJuIG5ldyBQdWJsaWNTdG9yYWdlQWNjZXNzKCkuYWNjZXNzKFwic2V0XCIsIHByb3AsIHZhbHVlLCBcImxvY2FsXCIpO1xyXG5cdH1cclxuXHRsb2NhbFVuc2V0KHByb3ApIHtcclxuXHRcdCByZXR1cm4gbmV3IFB1YmxpY1N0b3JhZ2VBY2Nlc3MoKS5hY2Nlc3MoXCJkZWxldGVcIiwgcHJvcCwgbnVsbCwgXCJsb2NhbFwiKTtcclxuXHR9XHJcblx0Z2V0KHByb3ApIHtcclxuXHRcdCByZXR1cm4gdGhpcy5sb2NhbEdldChwcm9wKTtcclxuXHR9XHJcblx0c2V0KHByb3AsIHZhbHVlKSB7XHJcblx0XHQgcmV0dXJuIHRoaXMubG9jYWxTZXQocHJvcCwgdmFsdWUpO1xyXG5cdH1cclxuXHR1bnNldChwcm9wKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5sb2NhbFVuc2V0KHByb3ApO1xyXG5cdH1cclxufVxyXG5cclxuY29uc3QgcHVibGljc3RvcmFnZSA9IG5ldyBQdWJsaWNTdG9yYWdlKCk7XHJcblxyXG5mdW5jdGlvbiBvbkxvYWRUaGVuKCkge1xyXG5cdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuXHRcdGlmICh3aW5kb3cpIHtcclxuXHRcdFx0aWYoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ0JPRFknKVswXSkge1xyXG5cdFx0XHRcdHJlc29sdmUoKTtcclxuXHRcdFx0fSBlbHNlIHtcdFx0XHRcdFxyXG5cdFx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24gdW5yZWdpc3Rlcm1lKCkge1xyXG5cdFx0XHRcdFx0cmVzb2x2ZSgpO1xyXG5cdFx0XHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWQnLCB1bnJlZ2lzdGVybWUpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge3JlamVjdChuZXcgRXJyb3IoXCJUaW1lb3V0IHdhaXRpbmcgZm9yIG9uTG9hZCFcIikpO30sIDEwMDAwKTtcclxuXHR9KTtcclxufVxyXG5cclxub25Mb2FkVGhlbigpLnRoZW4oZnVuY3Rpb24oKSB7XHJcblx0d2luZG93LnB1YmxpY3N0b3JhZ2UgPSBwdWJsaWNzdG9yYWdlO1xyXG59KS5jYXRjaChlPT5jb25zb2xlLmVycm9yKGUpKTtcclxuXHJcbmV4cG9ydCB7b25Mb2FkVGhlbiwgUHVibGljU3RvcmFnZSwgcHVibGljc3RvcmFnZSBhcyBkZWZhdWx0fVxyXG4vLyBtb2R1bGUuZXhwb3J0cyA9IG9uTG9hZFRoZW4oKTtcclxuIl19
