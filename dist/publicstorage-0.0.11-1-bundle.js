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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7OztBQ0FBLElBQU0sZUFBZSxHQUFHLHdEQUF4Qjs7SUFFTSxtQjs7O0FBRUosaUNBQStCO0FBQUEsbUZBQUosRUFBSTtBQUFBLDBCQUFqQixLQUFpQjtBQUFBLFFBQWpCLEtBQWlCLDJCQUFYLEtBQVc7O0FBQUE7O0FBQzlCLFNBQUssR0FBTCxHQUFXLEtBQUssUUFBTCxFQUFYO0FBQ0EsU0FBSyxLQUFMLEdBQVcsS0FBWDtBQUNBOzs7OytCQUVTO0FBQ1YsZUFBUyxJQUFULEdBQWU7QUFDZCxlQUFPLElBQUksQ0FBQyxNQUFMLEdBQWMsUUFBZCxDQUF1QixFQUF2QixFQUEyQixLQUEzQixDQUFpQyxDQUFDLENBQWxDLENBQVA7QUFDQzs7QUFDRixhQUFPLElBQUksS0FBSyxJQUFJLEVBQWIsR0FDTCxHQURLLEdBQ0MsSUFBSSxFQURMLEdBRUwsR0FGSyxHQUVDLElBQUksRUFGTCxHQUdMLEdBSEssR0FHQyxJQUFJLEVBSEwsR0FJTCxHQUpLLEdBSUMsSUFBSSxFQUpMLEdBSVUsSUFBSSxFQUpkLEdBSW1CLElBQUksRUFKOUI7QUFLQTs7OzJCQUVNLEcsRUFBSztBQUNYLFVBQUcsS0FBSyxLQUFSLEVBQWU7QUFDZCxRQUFBLE9BQU8sQ0FBQyxLQUFSLENBQWMsR0FBZDtBQUNBO0FBQ0Q7OztvQ0FFZ0I7QUFDaEIsVUFBTSxJQUFJLEdBQUcsSUFBYjtBQUNBLFVBQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLFFBQXZCLENBQWY7QUFDQSxNQUFBLE1BQU0sQ0FBQyxFQUFQLEdBQVUsSUFBSSxDQUFDLEdBQWY7QUFDQSxNQUFBLE1BQU0sQ0FBQyxHQUFQLEdBQVcsZUFBZSxHQUFHLFlBQWxCLEdBQStCLElBQUksQ0FBQyxHQUEvQztBQUNBLE1BQUEsTUFBTSxDQUFDLEtBQVAs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LENBQWMsSUFBZCxDQUFQO0FBQ0Q7Ozt3QkFDRyxJLEVBQU0sSyxFQUFPO0FBQ2YsYUFBTyxLQUFLLFFBQUwsQ0FBYyxJQUFkLEVBQW9CLEtBQXBCLENBQVA7QUFDRDs7OzBCQUNLLEksRUFBTTtBQUNYLGFBQU8sS0FBSyxVQUFMLENBQWdCLElBQWhCLENBQVA7QUFDQTs7Ozs7OztBQUdGLElBQU0sYUFBYSxHQUFHLElBQUksYUFBSixFQUF0Qjs7O0FBRUEsU0FBUyxVQUFULEdBQXNCO0FBQ3JCLFNBQU8sSUFBSSxPQUFKLENBQVksVUFBUyxPQUFULEVBQWtCLE1BQWxCLEVBQTBCO0FBQzVDLFFBQUksTUFBSixFQUFZO0FBQ1gsVUFBRyxRQUFRLENBQUMsb0JBQVQsQ0FBOEIsTUFBOUIsRUFBc0MsQ0FBdEMsQ0FBSCxFQUE2QztBQUM1QyxRQUFBLE9BQU87QUFDUCxPQUZELE1BRU87QUFDTixRQUFBLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixNQUF4QixFQUFnQyxTQUFTLFlBQVQsR0FBd0I7QUFDdkQsVUFBQSxPQUFPO0FBQ1AsVUFBQSxNQUFNLENBQUMsbUJBQVAsQ0FBMkIsTUFBM0IsRUFBbUMsWUFBbkM7QUFDQSxTQUhEO0FBSUE7QUFDRDs7QUFDRCxJQUFBLFVBQVUsQ0FBQyxZQUFXO0FBQUMsTUFBQSxNQUFNLENBQUMsSUFBSSxLQUFKLENBQVUsNkJBQVYsQ0FBRCxDQUFOO0FBQWtELEtBQS9ELEVBQWlFLEtBQWpFLENBQVY7QUFDQSxHQVpNLENBQVA7QUFhQTs7QUFFRCxVQUFVLEdBQUcsSUFBYixDQUFrQixZQUFXO0FBQzVCLEVBQUEsTUFBTSxDQUFDLGFBQVAsR0FBdUIsYUFBdkI7QUFDQSxDQUZELEVBRUcsS0FGSCxDQUVTLFVBQUEsQ0FBQztBQUFBLFNBQUUsT0FBTyxDQUFDLEtBQVIsQ0FBYyxDQUFkLENBQUY7QUFBQSxDQUZWLEUsQ0FLQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IElGUkFNRV9ST09UX1VSTCA9IFwiaHR0cHM6Ly9wdWJsaWNzdG9yYWdlLm5lb2NpdGllcy5vcmcvc2hhcmVkLWlmcmFtZS5odG1sXCI7XHJcblxyXG5jbGFzcyBQdWJsaWNTdG9yYWdlQWNjZXNzIHtcclxuXHJcblx0IGNvbnN0cnVjdG9yICh7ZGVidWc9ZmFsc2V9PXt9KSB7XHJcblx0XHQgdGhpcy51aWQgPSB0aGlzLnVuaXF1ZUlkKCk7XHJcblx0XHQgdGhpcy5kZWJ1Zz1kZWJ1ZztcclxuXHQgfVxyXG5cdCBcclxuXHR1bmlxdWVJZCgpIHtcclxuXHRcdGZ1bmN0aW9uIGNocjQoKXtcclxuXHRcdFx0cmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMTYpLnNsaWNlKC00KTtcclxuXHRcdFx0fVxyXG5cdFx0cmV0dXJuIGNocjQoKSArIGNocjQoKSArXHJcblx0XHRcdFx0Jy0nICsgY2hyNCgpICtcclxuXHRcdFx0XHQnLScgKyBjaHI0KCkgK1xyXG5cdFx0XHRcdCctJyArIGNocjQoKSArXHJcblx0XHRcdFx0Jy0nICsgY2hyNCgpICsgY2hyNCgpICsgY2hyNCgpO1xyXG5cdH1cclxuXHJcblx0X2RlYnVnKG1zZykge1xyXG5cdFx0aWYodGhpcy5kZWJ1Zykge1xyXG5cdFx0XHRjb25zb2xlLmRlYnVnKG1zZyk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdCBwcmVwYXJlSUZyYW1lKCkge1xyXG5cdFx0Y29uc3QgdGhhdCA9IHRoaXM7XHJcblx0XHRjb25zdCBpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaWZyYW1lXCIpO1xyXG5cdFx0aWZyYW1lLmlkPXRoYXQudWlkO1xyXG5cdFx0aWZyYW1lLnNyYz1JRlJBTUVfUk9PVF9VUkwgKyBcIj91aWQ9aW5pdC1cIit0aGF0LnVpZDtcclxuXHRcdGlmcmFtZS5zdHlsZT1cImRpc3BsYXk6bm9uZTtcIjtcclxuXHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiBtYWZ1bmModGtuKSB7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Ly90aGF0Ll9kZWJ1ZyhcInByZXBhcmVJRnJhbWUgXCIgKyB0aGF0LnVpZCArIFwiIHJlw6dvaXQgdW4gbWVzc2FnZS4uLiBcIiArIHRrbi5kYXRhKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZiAoSUZSQU1FX1JPT1RfVVJMLmluZGV4T2YodGtuLm9yaWdpbik8MCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0Y29uc3QgcGFja2V0ID0gSlNPTi5wYXJzZSh0a24uZGF0YSk7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGlmKCEocGFja2V0LmZyYW1lSWQgPT09IFwiaW5pdC1cIiArIHRoYXQudWlkKSkge1xyXG5cdFx0XHRcdFx0XHQvLyBpZ25vcmVcclxuXHRcdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHQvL2RlYnVnKFwicHJlcGFyZUlGcmFtZSBcIiArIHRoYXQudWlkICsgXCIgYWNjZXB0ZSB1biBtZXNzYWdlLi4uIFwiICsgdGtuLmRhdGEpO1xyXG5cdFx0XHRcdFx0aWYocGFja2V0LnJlYWR5KSB7XHJcblx0XHRcdFx0XHRcdHJlc29sdmUoaWZyYW1lKTtcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRcdFx0cmVqZWN0KHRrbi5kYXRhKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBtYWZ1bmMpO1xyXG5cdFx0XHRcdC8vIHRoYXQuYm9keS5yZW1vdmVDaGlsZCh0aGF0LmlmcmFtZSk7XHJcblx0XHQgICAgfSk7XHJcblx0XHRcdG9uTG9hZFRoZW4oKS50aGVuKCgpID0+IHtcclxuXHRcdFx0XHQvL3RoYXQuX2RlYnVnKFwiQWRkaW5nIHRoZSBpZnJhbWUgZm9yIFwiICsgdGhhdC51aWQpO1xyXG5cdFx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiYm9keVwiKVswXS5hcHBlbmRDaGlsZChpZnJhbWUpO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHNldFRpbWVvdXQoKCk9PnJlamVjdChgUmVxdWVzdCAke3RoYXQudWlkfSBUSU1FT1VURUQhYCksIDIwMDAwKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHQgXHJcblx0IGFjY2VzcyhhY2Nlc3MsIHByb3AsIHZhbHVlID0gbnVsbCwgbGV2ZWwgPSBcImxvY2FsXCIpIHtcclxuXHRcdFx0XHJcblx0XHRcdGlmKCEoYWNjZXNzID09PSBcImdldFwiIHx8IGFjY2VzcyA9PT0gXCJzZXRcIiB8fCBhY2Nlc3MgPT09IFwiZGVsZXRlXCIpKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiYWNjZXNzIGNhbiBvbmx5IGJlICdzZXQnLCAnZ2V0JyBvciAnZGVsZXRlJyAtIG5vdCAnXCIgKyBhY2Nlc3MgKyBcIidcIik7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGlmICghcHJvcCkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlByb3AgbmFtZSBpcyBtYW5kYXRvcnlcIik7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGlmKCEobGV2ZWwgPT09IFwibG9jYWxcIiB8fCBsZXZlbCA9PT0gXCJzZXNzaW9uXCIpKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibGV2ZWwgY2FuIG9ubHkgYmUgJ3Nlc3Npb24nIG9yICdsb2NhbCcgLSBub3QgJ1wiICsgYWNjZXNzICsgXCInXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdGNvbnN0IHRoYXQgPSB0aGlzO1xyXG5cdFx0XHRcclxuXHRcdFx0Y29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xyXG5cdFx0XHRcdHRoYXQucHJlcGFyZUlGcmFtZSgpLnRoZW4oaWZyYW1lID0+IHtcclxuXHRcdFx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gbWFmdW5jKHRrbikge1xyXG5cdFx0XHRcdFx0XHRpZiAoSUZSQU1FX1JPT1RfVVJMLmluZGV4T2YodGtuLm9yaWdpbik8MCkge1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0XHRcdHZhciBwYWNrZXQgPSBKU09OLnBhcnNlKHRrbi5kYXRhKTtcclxuXHRcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0XHRpZighKHBhY2tldC51aWQgPT09IHRoYXQudWlkKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0Ly8gaWdub3JlXHJcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0XHRcdFx0fVxyXG4vL1x0XHRcdFx0XHRcdFx0XHJcblx0XHQvLyBpZighcGFja2V0LmJvZHkpIHtcclxuXHRcdC8vIC8vIGlnbm9yZVxyXG5cdFx0Ly8gcmV0dXJuO1xyXG5cdFx0Ly8gfVxyXG5cdFx0XHRcdFx0XHRcdC8vdGhhdC5fZGVidWcoXCJBY2Nlc3MgXCIgKyB0aGF0LnVpZCArIFwiIHJlw6dvaXQgdW4gbWVzc2FnZS4uLiBcIiArIHRrbi5kYXRhKTtcclxuXHRcdFx0XHRcdFx0XHRyZXNvbHZlKHBhY2tldC5ib2R5KTtcclxuXHRcdFx0XHJcblx0XHRcdFx0XHRcdFx0Y29uc29sZS5kZWJ1ZyhcIkplIHLDqXNvdWRzIVwiKTtcclxuXHRcdFx0XHRcdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRcdFx0XHRcdHJlamVjdCh0a24uZGF0YSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0Ly8gdGhhdC5ib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJib2R5XCIpWzBdO1xyXG5cdFx0XHRcdFx0XHRpZnJhbWUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChpZnJhbWUpO1xyXG5cdFx0XHRcdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIG1hZnVuYyk7XHJcblx0XHRcdFx0ICAgIH0pO1xyXG5cdFx0XHRcclxuXHRcdFx0XHRcdC8vdGhhdC5fZGVidWcoXCJPbiBlbnZvaXQgdW5lIHJlcXVlc3QuLi4gZnJhbWVJZDogaW5pdC1cIiArIHRoYXQudWlkICsgXCJcXHRyZXF1ZXN0SWQ6IFwiICsgdGhhdC51aWQpO1xyXG5cdFx0XHRcdFx0Y29uc3QgcmVxdWVzdCA9IHt1aWQ6dGhhdC51aWQsIGFjY2VzczphY2Nlc3MsIHByb3A6cHJvcCwgdmFsdWU6dmFsdWUsIGxldmVsOmxldmVsfTtcclxuXHRcdFx0XHRcdC8vdGhhdC5fZGVidWcocmVxdWVzdCk7XHJcblx0XHRcdFx0XHRpZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZShKU09OLnN0cmluZ2lmeShyZXF1ZXN0KSwgJyonKTtcclxuXHRcdFx0XHRcdHNldFRpbWVvdXQoKCk9PnJlamVjdChcIlRJTUVPVVRFRCFcIiksIDIwMDAwKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdHJldHVybiBwcm9taXNlO1xyXG5cdFx0fVxyXG5cdFxyXG59XHJcblxyXG5mdW5jdGlvbiBfX2NyZWF0ZURlYnVnSUZyYW1lKCkge1xyXG5cdG9uTG9hZFRoZW4oKS50aGVuKGZ1bmN0aW9uKCl7XHJcblx0XHRjb25zb2xlLmRlYnVnKFwiQ3JlYXRpbmcgYW4gaWZyYW1lIGZvciBkZWJ1Z2dpbmcuLi5cIik7XHJcblx0XHRjb25zdCBpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaWZyYW1lXCIpO1xyXG5cdFx0aWZyYW1lLnNyYz1JRlJBTUVfUk9PVF9VUkwgKyBcIj9mb3ItZGVidWctb25seVwiO1xyXG5cdFx0aWZyYW1lLnN0eWxlPVwiZGlzcGxheTpub25lO1wiO1xyXG5cdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJib2R5XCIpWzBdLmFwcGVuZENoaWxkKGlmcmFtZSk7XHJcblx0fSk7XHJcbn1cclxuXHJcbmNsYXNzIFB1YmxpY1N0b3JhZ2UgeyBcclxuXHRcclxuXHRjb25zdHJ1Y3Rvcih7ZGVidWc9ZmFsc2V9PXt9KSB7XHJcblx0XHRpZihkZWJ1Zykge1xyXG5cdFx0XHRcdF9fY3JlYXRlRGVidWdJRnJhbWUoKTtcdFx0XHRcdCBcclxuXHRcdH1cdFx0XHJcblx0fVxyXG5cdCBcclxuXHRzZXNzaW9uR2V0KHByb3ApIHtcclxuXHRcdCByZXR1cm4gbmV3IFB1YmxpY1N0b3JhZ2VBY2Nlc3MoKS5hY2Nlc3MoXCJnZXRcIiwgcHJvcCwgbnVsbCwgXCJzZXNzaW9uXCIpO1xyXG5cdH1cclxuXHRzZXNzaW9uU2V0KHByb3AsIHZhbHVlKSB7XHJcblx0XHQgcmV0dXJuIG5ldyBQdWJsaWNTdG9yYWdlQWNjZXNzKCkuYWNjZXNzKFwic2V0XCIsIHByb3AsIHZhbHVlLCBcInNlc3Npb25cIik7XHJcblx0fVxyXG5cdHNlc3Npb25VbnNldChwcm9wKSB7XHJcblx0XHQgcmV0dXJuIG5ldyBQdWJsaWNTdG9yYWdlQWNjZXNzKCkuYWNjZXNzKFwiZGVsZXRlXCIsIHByb3AsIG51bGwsIFwic2Vzc2lvblwiKTtcclxuXHR9XHJcblx0bG9jYWxHZXQocHJvcCkge1xyXG5cdFx0IHJldHVybiBuZXcgUHVibGljU3RvcmFnZUFjY2VzcygpLmFjY2VzcyhcImdldFwiLCBwcm9wLCBudWxsLCBcImxvY2FsXCIpO1xyXG5cdH1cclxuXHRsb2NhbFNldChwcm9wLCB2YWx1ZSkge1xyXG5cdFx0IHJldHVybiBuZXcgUHVibGljU3RvcmFnZUFjY2VzcygpLmFjY2VzcyhcInNldFwiLCBwcm9wLCB2YWx1ZSwgXCJsb2NhbFwiKTtcclxuXHR9XHJcblx0bG9jYWxVbnNldChwcm9wKSB7XHJcblx0XHQgcmV0dXJuIG5ldyBQdWJsaWNTdG9yYWdlQWNjZXNzKCkuYWNjZXNzKFwiZGVsZXRlXCIsIHByb3AsIG51bGwsIFwibG9jYWxcIik7XHJcblx0fVxyXG5cdGdldChwcm9wKSB7XHJcblx0XHQgcmV0dXJuIHRoaXMubG9jYWxHZXQocHJvcCk7XHJcblx0fVxyXG5cdHNldChwcm9wLCB2YWx1ZSkge1xyXG5cdFx0IHJldHVybiB0aGlzLmxvY2FsU2V0KHByb3AsIHZhbHVlKTtcclxuXHR9XHJcblx0dW5zZXQocHJvcCkge1xyXG5cdFx0cmV0dXJuIHRoaXMubG9jYWxVbnNldChwcm9wKTtcclxuXHR9XHJcbn1cclxuXHJcbmNvbnN0IHB1YmxpY3N0b3JhZ2UgPSBuZXcgUHVibGljU3RvcmFnZSgpO1xyXG5cclxuZnVuY3Rpb24gb25Mb2FkVGhlbigpIHtcclxuXHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XHJcblx0XHRpZiAod2luZG93KSB7XHJcblx0XHRcdGlmKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdCT0RZJylbMF0pIHtcclxuXHRcdFx0XHRyZXNvbHZlKCk7XHJcblx0XHRcdH0gZWxzZSB7XHRcdFx0XHRcclxuXHRcdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uIHVucmVnaXN0ZXJtZSgpIHtcclxuXHRcdFx0XHRcdHJlc29sdmUoKTtcclxuXHRcdFx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkJywgdW5yZWdpc3Rlcm1lKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtyZWplY3QobmV3IEVycm9yKFwiVGltZW91dCB3YWl0aW5nIGZvciBvbkxvYWQhXCIpKTt9LCAxMDAwMCk7XHJcblx0fSk7XHJcbn1cclxuXHJcbm9uTG9hZFRoZW4oKS50aGVuKGZ1bmN0aW9uKCkge1xyXG5cdHdpbmRvdy5wdWJsaWNzdG9yYWdlID0gcHVibGljc3RvcmFnZTtcclxufSkuY2F0Y2goZT0+Y29uc29sZS5lcnJvcihlKSk7XHJcblxyXG5leHBvcnQge29uTG9hZFRoZW4sIFB1YmxpY1N0b3JhZ2UsIHB1YmxpY3N0b3JhZ2UgYXMgZGVmYXVsdH1cclxuLy8gbW9kdWxlLmV4cG9ydHMgPSBvbkxvYWRUaGVuKCk7XHJcbiJdfQ==
