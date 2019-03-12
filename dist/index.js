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