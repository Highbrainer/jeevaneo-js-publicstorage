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
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$debug = _ref.debug,
        debug = _ref$debug === void 0 ? false : _ref$debug;

    _classCallCheck(this, PublicStorageAccess);

    this.uid = this.uniqueId();
    this.debug = debug;
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
    key: "_debug",
    value: function _debug(msg) {
      if (this.debug) {
        console.debug(msg);
      }
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
        window.addEventListener('message', function mafunc(tkn) {
          //that._debug("prepareIFrame " + that.uid + " reçoit un message... " + tkn.data);
          if (IFRAME_ROOT_URL.indexOf(tkn.origin) < 0) {
            return;
          }

          try {
            var packet = JSON.parse(tkn.data);

            if (!(packet.frameId === "init-" + that.uid)) {
              // ignore
              return;
            } //debug("prepareIFrame " + that.uid + " accepte un message... " + tkn.data);


            if (packet.ready) {
              resolve(iframe);
            }
          } catch (e) {
            reject(tkn.data);
          }

          window.removeEventListener('message', mafunc); // that.body.removeChild(that.iframe);
        });
        onLoadThen().then(function () {
          //that._debug("Adding the iframe for " + that.uid);
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
              //that._debug("Access " + that.uid + " reçoit un message... " + tkn.data);


              resolve(packet.body);
              console.debug("Je résouds!");
            } catch (e) {
              reject(tkn.data);
            } // that.body = document.getElementsByTagName("body")[0];


            iframe.parentNode.removeChild(iframe);
            window.removeEventListener('message', mafunc);
          }); //that._debug("On envoit une request... frameId: init-" + that.uid + "\trequestId: " + that.uid);

          var request = {
            uid: that.uid,
            access: _access,
            prop: prop,
            value: value,
            level: level
          }; //that._debug(request);

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
    console.debug("Creating an iframe for debugging...");
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
    var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref2$debug = _ref2.debug,
        debug = _ref2$debug === void 0 ? false : _ref2$debug;

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
    value: function sessionUnset(prop) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkaXN0L2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5vbkxvYWRUaGVuID0gb25Mb2FkVGhlbjtcbmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuUHVibGljU3RvcmFnZSA9IHZvaWQgMDtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfVxuXG5mdW5jdGlvbiBfY3JlYXRlQ2xhc3MoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfVxuXG52YXIgSUZSQU1FX1JPT1RfVVJMID0gXCJodHRwczovL3B1YmxpY3N0b3JhZ2UubmVvY2l0aWVzLm9yZy9zaGFyZWQtaWZyYW1lLmh0bWxcIjtcblxudmFyIFB1YmxpY1N0b3JhZ2VBY2Nlc3MgPVxuLyojX19QVVJFX18qL1xuZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBQdWJsaWNTdG9yYWdlQWNjZXNzKCkge1xuICAgIHZhciBfcmVmID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fSxcbiAgICAgICAgX3JlZiRkZWJ1ZyA9IF9yZWYuZGVidWcsXG4gICAgICAgIGRlYnVnID0gX3JlZiRkZWJ1ZyA9PT0gdm9pZCAwID8gZmFsc2UgOiBfcmVmJGRlYnVnO1xuXG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFB1YmxpY1N0b3JhZ2VBY2Nlc3MpO1xuXG4gICAgdGhpcy51aWQgPSB0aGlzLnVuaXF1ZUlkKCk7XG4gICAgdGhpcy5kZWJ1ZyA9IGRlYnVnO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKFB1YmxpY1N0b3JhZ2VBY2Nlc3MsIFt7XG4gICAga2V5OiBcInVuaXF1ZUlkXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVuaXF1ZUlkKCkge1xuICAgICAgZnVuY3Rpb24gY2hyNCgpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMTYpLnNsaWNlKC00KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNocjQoKSArIGNocjQoKSArICctJyArIGNocjQoKSArICctJyArIGNocjQoKSArICctJyArIGNocjQoKSArICctJyArIGNocjQoKSArIGNocjQoKSArIGNocjQoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiX2RlYnVnXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9kZWJ1Zyhtc2cpIHtcbiAgICAgIGlmICh0aGlzLmRlYnVnKSB7XG4gICAgICAgIGNvbnNvbGUuZGVidWcobXNnKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwicHJlcGFyZUlGcmFtZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBwcmVwYXJlSUZyYW1lKCkge1xuICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgdmFyIGlmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpZnJhbWVcIik7XG4gICAgICBpZnJhbWUuaWQgPSB0aGF0LnVpZDtcbiAgICAgIGlmcmFtZS5zcmMgPSBJRlJBTUVfUk9PVF9VUkwgKyBcIj91aWQ9aW5pdC1cIiArIHRoYXQudWlkO1xuICAgICAgaWZyYW1lLnN0eWxlID0gXCJkaXNwbGF5Om5vbmU7XCI7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIG1hZnVuYyh0a24pIHtcbiAgICAgICAgICAvL3RoYXQuX2RlYnVnKFwicHJlcGFyZUlGcmFtZSBcIiArIHRoYXQudWlkICsgXCIgcmXDp29pdCB1biBtZXNzYWdlLi4uIFwiICsgdGtuLmRhdGEpO1xuICAgICAgICAgIGlmIChJRlJBTUVfUk9PVF9VUkwuaW5kZXhPZih0a24ub3JpZ2luKSA8IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFyIHBhY2tldCA9IEpTT04ucGFyc2UodGtuLmRhdGEpO1xuXG4gICAgICAgICAgICBpZiAoIShwYWNrZXQuZnJhbWVJZCA9PT0gXCJpbml0LVwiICsgdGhhdC51aWQpKSB7XG4gICAgICAgICAgICAgIC8vIGlnbm9yZVxuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IC8vZGVidWcoXCJwcmVwYXJlSUZyYW1lIFwiICsgdGhhdC51aWQgKyBcIiBhY2NlcHRlIHVuIG1lc3NhZ2UuLi4gXCIgKyB0a24uZGF0YSk7XG5cblxuICAgICAgICAgICAgaWYgKHBhY2tldC5yZWFkeSkge1xuICAgICAgICAgICAgICByZXNvbHZlKGlmcmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmVqZWN0KHRrbi5kYXRhKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIG1hZnVuYyk7IC8vIHRoYXQuYm9keS5yZW1vdmVDaGlsZCh0aGF0LmlmcmFtZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBvbkxvYWRUaGVuKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgLy90aGF0Ll9kZWJ1ZyhcIkFkZGluZyB0aGUgaWZyYW1lIGZvciBcIiArIHRoYXQudWlkKTtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImJvZHlcIilbMF0uYXBwZW5kQ2hpbGQoaWZyYW1lKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiByZWplY3QoXCJSZXF1ZXN0IFwiLmNvbmNhdCh0aGF0LnVpZCwgXCIgVElNRU9VVEVEIVwiKSk7XG4gICAgICAgIH0sIDIwMDAwKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJhY2Nlc3NcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWNjZXNzKF9hY2Nlc3MsIHByb3ApIHtcbiAgICAgIHZhciB2YWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogbnVsbDtcbiAgICAgIHZhciBsZXZlbCA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogXCJsb2NhbFwiO1xuXG4gICAgICBpZiAoIShfYWNjZXNzID09PSBcImdldFwiIHx8IF9hY2Nlc3MgPT09IFwic2V0XCIgfHwgX2FjY2VzcyA9PT0gXCJkZWxldGVcIikpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYWNjZXNzIGNhbiBvbmx5IGJlICdzZXQnLCAnZ2V0JyBvciAnZGVsZXRlJyAtIG5vdCAnXCIgKyBfYWNjZXNzICsgXCInXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXByb3ApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUHJvcCBuYW1lIGlzIG1hbmRhdG9yeVwiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCEobGV2ZWwgPT09IFwibG9jYWxcIiB8fCBsZXZlbCA9PT0gXCJzZXNzaW9uXCIpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImxldmVsIGNhbiBvbmx5IGJlICdzZXNzaW9uJyBvciAnbG9jYWwnIC0gbm90ICdcIiArIF9hY2Nlc3MgKyBcIidcIik7XG4gICAgICB9XG5cbiAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICB0aGF0LnByZXBhcmVJRnJhbWUoKS50aGVuKGZ1bmN0aW9uIChpZnJhbWUpIHtcbiAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIG1hZnVuYyh0a24pIHtcbiAgICAgICAgICAgIGlmIChJRlJBTUVfUk9PVF9VUkwuaW5kZXhPZih0a24ub3JpZ2luKSA8IDApIHtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICB2YXIgcGFja2V0ID0gSlNPTi5wYXJzZSh0a24uZGF0YSk7XG5cbiAgICAgICAgICAgICAgaWYgKCEocGFja2V0LnVpZCA9PT0gdGhhdC51aWQpKSB7XG4gICAgICAgICAgICAgICAgLy8gaWdub3JlXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9IC8vXHRcdFx0XHRcdFx0XHRcbiAgICAgICAgICAgICAgLy8gaWYoIXBhY2tldC5ib2R5KSB7XG4gICAgICAgICAgICAgIC8vIC8vIGlnbm9yZVxuICAgICAgICAgICAgICAvLyByZXR1cm47XG4gICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgLy90aGF0Ll9kZWJ1ZyhcIkFjY2VzcyBcIiArIHRoYXQudWlkICsgXCIgcmXDp29pdCB1biBtZXNzYWdlLi4uIFwiICsgdGtuLmRhdGEpO1xuXG5cbiAgICAgICAgICAgICAgcmVzb2x2ZShwYWNrZXQuYm9keSk7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoXCJKZSByw6lzb3VkcyFcIik7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgIHJlamVjdCh0a24uZGF0YSk7XG4gICAgICAgICAgICB9IC8vIHRoYXQuYm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiYm9keVwiKVswXTtcblxuXG4gICAgICAgICAgICBpZnJhbWUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChpZnJhbWUpO1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBtYWZ1bmMpO1xuICAgICAgICAgIH0pOyAvL3RoYXQuX2RlYnVnKFwiT24gZW52b2l0IHVuZSByZXF1ZXN0Li4uIGZyYW1lSWQ6IGluaXQtXCIgKyB0aGF0LnVpZCArIFwiXFx0cmVxdWVzdElkOiBcIiArIHRoYXQudWlkKTtcblxuICAgICAgICAgIHZhciByZXF1ZXN0ID0ge1xuICAgICAgICAgICAgdWlkOiB0aGF0LnVpZCxcbiAgICAgICAgICAgIGFjY2VzczogX2FjY2VzcyxcbiAgICAgICAgICAgIHByb3A6IHByb3AsXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICBsZXZlbDogbGV2ZWxcbiAgICAgICAgICB9OyAvL3RoYXQuX2RlYnVnKHJlcXVlc3QpO1xuXG4gICAgICAgICAgaWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoSlNPTi5zdHJpbmdpZnkocmVxdWVzdCksICcqJyk7XG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KFwiVElNRU9VVEVEIVwiKTtcbiAgICAgICAgICB9LCAyMDAwMCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gUHVibGljU3RvcmFnZUFjY2Vzcztcbn0oKTtcblxuZnVuY3Rpb24gX19jcmVhdGVEZWJ1Z0lGcmFtZSgpIHtcbiAgb25Mb2FkVGhlbigpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUuZGVidWcoXCJDcmVhdGluZyBhbiBpZnJhbWUgZm9yIGRlYnVnZ2luZy4uLlwiKTtcbiAgICB2YXIgaWZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlmcmFtZVwiKTtcbiAgICBpZnJhbWUuc3JjID0gSUZSQU1FX1JPT1RfVVJMICsgXCI/Zm9yLWRlYnVnLW9ubHlcIjtcbiAgICBpZnJhbWUuc3R5bGUgPSBcImRpc3BsYXk6bm9uZTtcIjtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImJvZHlcIilbMF0uYXBwZW5kQ2hpbGQoaWZyYW1lKTtcbiAgfSk7XG59XG5cbnZhciBQdWJsaWNTdG9yYWdlID1cbi8qI19fUFVSRV9fKi9cbmZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gUHVibGljU3RvcmFnZSgpIHtcbiAgICB2YXIgX3JlZjIgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9LFxuICAgICAgICBfcmVmMiRkZWJ1ZyA9IF9yZWYyLmRlYnVnLFxuICAgICAgICBkZWJ1ZyA9IF9yZWYyJGRlYnVnID09PSB2b2lkIDAgPyBmYWxzZSA6IF9yZWYyJGRlYnVnO1xuXG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFB1YmxpY1N0b3JhZ2UpO1xuXG4gICAgaWYgKGRlYnVnKSB7XG4gICAgICBfX2NyZWF0ZURlYnVnSUZyYW1lKCk7XG4gICAgfVxuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKFB1YmxpY1N0b3JhZ2UsIFt7XG4gICAga2V5OiBcInNlc3Npb25HZXRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2Vzc2lvbkdldChwcm9wKSB7XG4gICAgICByZXR1cm4gbmV3IFB1YmxpY1N0b3JhZ2VBY2Nlc3MoKS5hY2Nlc3MoXCJnZXRcIiwgcHJvcCwgbnVsbCwgXCJzZXNzaW9uXCIpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJzZXNzaW9uU2V0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNlc3Npb25TZXQocHJvcCwgdmFsdWUpIHtcbiAgICAgIHJldHVybiBuZXcgUHVibGljU3RvcmFnZUFjY2VzcygpLmFjY2VzcyhcInNldFwiLCBwcm9wLCB2YWx1ZSwgXCJzZXNzaW9uXCIpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJzZXNzaW9uVW5zZXRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2Vzc2lvblVuc2V0KHByb3ApIHtcbiAgICAgIHJldHVybiBuZXcgUHVibGljU3RvcmFnZUFjY2VzcygpLmFjY2VzcyhcImRlbGV0ZVwiLCBwcm9wLCBudWxsLCBcInNlc3Npb25cIik7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImxvY2FsR2V0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGxvY2FsR2V0KHByb3ApIHtcbiAgICAgIHJldHVybiBuZXcgUHVibGljU3RvcmFnZUFjY2VzcygpLmFjY2VzcyhcImdldFwiLCBwcm9wLCBudWxsLCBcImxvY2FsXCIpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJsb2NhbFNldFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBsb2NhbFNldChwcm9wLCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIG5ldyBQdWJsaWNTdG9yYWdlQWNjZXNzKCkuYWNjZXNzKFwic2V0XCIsIHByb3AsIHZhbHVlLCBcImxvY2FsXCIpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJsb2NhbFVuc2V0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGxvY2FsVW5zZXQocHJvcCkge1xuICAgICAgcmV0dXJuIG5ldyBQdWJsaWNTdG9yYWdlQWNjZXNzKCkuYWNjZXNzKFwiZGVsZXRlXCIsIHByb3AsIG51bGwsIFwibG9jYWxcIik7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImdldFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXQocHJvcCkge1xuICAgICAgcmV0dXJuIHRoaXMubG9jYWxHZXQocHJvcCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInNldFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXQocHJvcCwgdmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLmxvY2FsU2V0KHByb3AsIHZhbHVlKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwidW5zZXRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gdW5zZXQocHJvcCkge1xuICAgICAgcmV0dXJuIHRoaXMubG9jYWxVbnNldChwcm9wKTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gUHVibGljU3RvcmFnZTtcbn0oKTtcblxuZXhwb3J0cy5QdWJsaWNTdG9yYWdlID0gUHVibGljU3RvcmFnZTtcbnZhciBwdWJsaWNzdG9yYWdlID0gbmV3IFB1YmxpY1N0b3JhZ2UoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IHB1YmxpY3N0b3JhZ2U7XG5cbmZ1bmN0aW9uIG9uTG9hZFRoZW4oKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgaWYgKHdpbmRvdykge1xuICAgICAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdCT0RZJylbMF0pIHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbiB1bnJlZ2lzdGVybWUoKSB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkJywgdW5yZWdpc3Rlcm1lKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICByZWplY3QobmV3IEVycm9yKFwiVGltZW91dCB3YWl0aW5nIGZvciBvbkxvYWQhXCIpKTtcbiAgICB9LCAxMDAwMCk7XG4gIH0pO1xufVxuXG5vbkxvYWRUaGVuKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gIHdpbmRvdy5wdWJsaWNzdG9yYWdlID0gcHVibGljc3RvcmFnZTtcbn0pLmNhdGNoKGZ1bmN0aW9uIChlKSB7XG4gIHJldHVybiBjb25zb2xlLmVycm9yKGUpO1xufSk7IC8vIG1vZHVsZS5leHBvcnRzID0gb25Mb2FkVGhlbigpOyJdfQ==
