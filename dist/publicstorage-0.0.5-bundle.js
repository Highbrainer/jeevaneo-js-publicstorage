(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.onLoadThen = onLoadThen;
exports.publicstorage = exports.PublicStorageAccess = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var PublicStorageAccess =
/*#__PURE__*/
function () {
  function PublicStorageAccess() {
    _classCallCheck(this, PublicStorageAccess);

    this.IFRAME_ROOT_URL = "https://publicstorage.neocities.org/shared-iframe.html";
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
      iframe.src = that.IFRAME_ROOT_URL + "?uid=init-" + that.uid;
      iframe.style = "display:none;";
      return new Promise(function (resolve, reject) {
        console.debug("Je démarre...");
        window.addEventListener('message', function mafunc(tkn) {
          console.debug("prepareIFrame " + that.uid + " reçoit un message... " + tkn.data);

          if (that.IFRAME_ROOT_URL.indexOf(tkn.origin) < 0) {
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
        document.getElementsByTagName("body")[0].appendChild(iframe);
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
            if (that.IFRAME_ROOT_URL.indexOf(tkn.origin) < 0) {
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
            } //that.body = document.getElementsByTagName("body")[0];


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

exports.PublicStorageAccess = PublicStorageAccess;

var PublicStorage =
/*#__PURE__*/
function () {
  function PublicStorage() {
    _classCallCheck(this, PublicStorage);
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
    key: "get",
    value: function get(prop) {
      return this.localGet(prop);
    }
  }, {
    key: "set",
    value: function set(prop, value) {
      return this.localSet(prop, value);
    }
  }]);

  return PublicStorage;
}();

var publicstorage = new PublicStorage();
exports.publicstorage = publicstorage;

function onLoadThen() {
  return new Promise(function (resolve, reject) {
    if (window) {
      window.addEventListener('load', function unregisterme() {
        resolve(publicstorage);
        window.publicstorage = publicstorage;
        window.removeEventListener('load', unregisterme);
      });
    }

    setTimeout(function () {
      reject(new Error("Timeout waiting for onLoad!"));
    }, 10000);
  });
} //module.exports = onLoadThen();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7OztJQ0FhLG1COzs7QUFFWCxpQ0FBZTtBQUFBOztBQUNkLFNBQUssZUFBTCxHQUF1Qix3REFBdkI7QUFDQSxTQUFLLEdBQUwsR0FBVyxLQUFLLFFBQUwsRUFBWDtBQUNBOzs7OytCQUVTO0FBQ1YsZUFBUyxJQUFULEdBQWU7QUFDZCxlQUFPLElBQUksQ0FBQyxNQUFMLEdBQWMsUUFBZCxDQUF1QixFQUF2QixFQUEyQixLQUEzQixDQUFpQyxDQUFDLENBQWxDLENBQVA7QUFDQzs7QUFDRixhQUFPLElBQUksS0FBSyxJQUFJLEVBQWIsR0FDTCxHQURLLEdBQ0MsSUFBSSxFQURMLEdBRUwsR0FGSyxHQUVDLElBQUksRUFGTCxHQUdMLEdBSEssR0FHQyxJQUFJLEVBSEwsR0FJTCxHQUpLLEdBSUMsSUFBSSxFQUpMLEdBSVUsSUFBSSxFQUpkLEdBSW1CLElBQUksRUFKOUI7QUFLQTs7O29DQUVnQjtBQUNoQixVQUFJLElBQUksR0FBRyxJQUFYO0FBQ0EsVUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsUUFBdkIsQ0FBYjtBQUNBLE1BQUEsTUFBTSxDQUFDLEVBQVAsR0FBVSxJQUFJLENBQUMsR0FBZjtBQUNBLE1BQUEsTUFBTSxDQUFDLEdBQVAsR0FBVyxJQUFJLENBQUMsZUFBTCxHQUF1QixZQUF2QixHQUFvQyxJQUFJLENBQUMsR0FBcEQ7QUFDQSxNQUFBLE1BQU0sQ0FBQyxLQUFQLEdBQWEsZUFBYjtBQUNBLGFBQU8sSUFBSSxPQUFKLENBQVksVUFBUyxPQUFULEVBQWtCLE1BQWxCLEVBQTBCO0FBQzVDLFFBQUEsT0FBTyxDQUFDLEtBQVIsQ0FBYyxlQUFkO0FBQ0EsUUFBQSxNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsU0FBeEIsRUFBbUMsU0FBUyxNQUFULENBQWdCLEdBQWhC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QUosQ0FBVSw2QkFBVixDQUFELENBQU47QUFBa0QsS0FBL0QsRUFBaUUsS0FBakUsQ0FBVjtBQUNBLEdBVE0sQ0FBUDtBQVVBLEMsQ0FFRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImV4cG9ydCBjbGFzcyBQdWJsaWNTdG9yYWdlQWNjZXNzIHtcclxuXHJcblx0IGNvbnN0cnVjdG9yICgpIHtcclxuXHRcdCB0aGlzLklGUkFNRV9ST09UX1VSTCA9IFwiaHR0cHM6Ly9wdWJsaWNzdG9yYWdlLm5lb2NpdGllcy5vcmcvc2hhcmVkLWlmcmFtZS5odG1sXCI7XHJcblx0XHQgdGhpcy51aWQgPSB0aGlzLnVuaXF1ZUlkKCk7XHJcblx0IH1cclxuXHQgXHJcblx0dW5pcXVlSWQoKSB7XHJcblx0XHRmdW5jdGlvbiBjaHI0KCl7XHJcblx0XHRcdHJldHVybiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDE2KS5zbGljZSgtNCk7XHJcblx0XHRcdH1cclxuXHRcdHJldHVybiBjaHI0KCkgKyBjaHI0KCkgK1xyXG5cdFx0XHRcdCctJyArIGNocjQoKSArXHJcblx0XHRcdFx0Jy0nICsgY2hyNCgpICtcclxuXHRcdFx0XHQnLScgKyBjaHI0KCkgK1xyXG5cdFx0XHRcdCctJyArIGNocjQoKSArIGNocjQoKSArIGNocjQoKTtcclxuXHR9XHJcblxyXG5cdCBwcmVwYXJlSUZyYW1lKCkge1xyXG5cdFx0dmFyIHRoYXQgPSB0aGlzO1xyXG5cdFx0dmFyIGlmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpZnJhbWVcIik7XHJcblx0XHRpZnJhbWUuaWQ9dGhhdC51aWQ7XHJcblx0XHRpZnJhbWUuc3JjPXRoYXQuSUZSQU1FX1JPT1RfVVJMICsgXCI/dWlkPWluaXQtXCIrdGhhdC51aWQ7XHJcblx0XHRpZnJhbWUuc3R5bGU9XCJkaXNwbGF5Om5vbmU7XCI7XHJcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XHJcblx0XHRcdGNvbnNvbGUuZGVidWcoXCJKZSBkw6ltYXJyZS4uLlwiKTtcclxuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiBtYWZ1bmModGtuKSB7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Y29uc29sZS5kZWJ1ZyhcInByZXBhcmVJRnJhbWUgXCIgKyB0aGF0LnVpZCArIFwiIHJlw6dvaXQgdW4gbWVzc2FnZS4uLiBcIiArIHRrbi5kYXRhKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZiAodGhhdC5JRlJBTUVfUk9PVF9VUkwuaW5kZXhPZih0a24ub3JpZ2luKTwwKSB7XHJcblx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRyeSB7XHJcblx0XHRcdFx0XHR2YXIgcGFja2V0ID0gSlNPTi5wYXJzZSh0a24uZGF0YSk7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGlmKCEocGFja2V0LmZyYW1lSWQgPT09IFwiaW5pdC1cIiArIHRoYXQudWlkKSkge1xyXG5cdFx0XHRcdFx0XHQvLyBpZ25vcmVcclxuXHRcdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRjb25zb2xlLmRlYnVnKFwicHJlcGFyZUlGcmFtZSBcIiArIHRoYXQudWlkICsgXCIgYWNjZXB0ZSB1biBtZXNzYWdlLi4uIFwiICsgdGtuLmRhdGEpO1xyXG5cdFx0XHRcdFx0aWYocGFja2V0LnJlYWR5KSB7XHJcblx0XHRcdFx0XHRcdHJlc29sdmUoaWZyYW1lKTtcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRcdFx0cmVqZWN0KHRrbi5kYXRhKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBtYWZ1bmMpO1xyXG5cdFx0XHRcdC8vIHRoYXQuYm9keS5yZW1vdmVDaGlsZCh0aGF0LmlmcmFtZSk7XHJcblx0XHQgICAgfSk7XHJcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiYm9keVwiKVswXS5hcHBlbmRDaGlsZChpZnJhbWUpO1xyXG5cclxuXHRcdFx0c2V0VGltZW91dCgoKT0+cmVqZWN0KGBSZXF1ZXN0ICR7dGhhdC51aWR9IFRJTUVPVVRFRCFgKSwgMjAwMDApO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdCBcclxuXHQgYWNjZXNzKGFjY2VzcywgcHJvcCwgdmFsdWUgPSBudWxsLCBsZXZlbCA9IFwibG9jYWxcIikge1xyXG5cdFx0XHRcclxuXHRcdFx0aWYoIShhY2Nlc3MgPT09IFwiZ2V0XCIgfHwgYWNjZXNzID09PSBcInNldFwiIHx8IGFjY2VzcyA9PT0gXCJkZWxldGVcIikpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJhY2Nlc3MgY2FuIG9ubHkgYmUgJ3NldCcsICdnZXQnIG9yICdkZWxldGUnIC0gbm90ICdcIiArIGFjY2VzcyArIFwiJ1wiKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYgKCFwcm9wKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUHJvcCBuYW1lIGlzIG1hbmRhdG9yeVwiKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYoIShsZXZlbCA9PT0gXCJsb2NhbFwiIHx8IGxldmVsID09PSBcInNlc3Npb25cIikpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJsZXZlbCBjYW4gb25seSBiZSAnc2Vzc2lvbicgb3IgJ2xvY2FsJyAtIG5vdCAnXCIgKyBhY2Nlc3MgKyBcIidcIik7XHJcblx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0dmFyIHRoYXQgPSB0aGlzO1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuXHRcdFx0XHR0aGF0LnByZXBhcmVJRnJhbWUoKS50aGVuKGlmcmFtZSA9PiB7XHJcblx0XHRcdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIG1hZnVuYyh0a24pIHtcclxuXHRcdFx0XHRcdFx0aWYgKHRoYXQuSUZSQU1FX1JPT1RfVVJMLmluZGV4T2YodGtuLm9yaWdpbik8MCkge1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0XHRcdHZhciBwYWNrZXQgPSBKU09OLnBhcnNlKHRrbi5kYXRhKTtcclxuXHRcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0XHRpZighKHBhY2tldC51aWQgPT09IHRoYXQudWlkKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0Ly8gaWdub3JlXHJcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0XHRcdFx0fVxyXG4vL1x0XHRcdFx0XHRcdFx0XHJcblx0XHQvLyBpZighcGFja2V0LmJvZHkpIHtcclxuXHRcdC8vIC8vIGlnbm9yZVxyXG5cdFx0Ly8gcmV0dXJuO1xyXG5cdFx0Ly8gfVxyXG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUuZGVidWcoXCJBY2Nlc3MgXCIgKyB0aGF0LnVpZCArIFwiIHJlw6dvaXQgdW4gbWVzc2FnZS4uLiBcIiArIHRrbi5kYXRhKTtcclxuXHRcdFx0XHRcdFx0XHRyZXNvbHZlKHBhY2tldC5ib2R5KTtcclxuXHRcdFx0XHJcblx0XHRcdFx0XHRcdFx0Y29uc29sZS5kZWJ1ZyhcIkplIHLDqXNvdWRzIVwiKTtcclxuXHRcdFx0XHRcdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRcdFx0XHRcdHJlamVjdCh0a24uZGF0YSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0Ly90aGF0LmJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImJvZHlcIilbMF07XHJcblx0XHRcdFx0XHRcdGlmcmFtZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGlmcmFtZSk7XHJcblx0XHRcdFx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgbWFmdW5jKTtcclxuXHRcdFx0XHQgICAgfSk7XHJcblx0XHRcdFxyXG5cdFx0XHRcdFx0Y29uc29sZS5kZWJ1ZyhcIk9uIGVudm9pdCB1bmUgcmVxdWVzdC4uLiBmcmFtZUlkOiBpbml0LVwiICsgdGhhdC51aWQgKyBcIlxcdHJlcXVlc3RJZDogXCIgKyB0aGF0LnVpZCk7XHJcblx0XHRcdFx0XHR2YXIgcmVxdWVzdCA9IHt1aWQ6dGhhdC51aWQsIGFjY2VzczphY2Nlc3MsIHByb3A6cHJvcCwgdmFsdWU6dmFsdWUsIGxldmVsOmxldmVsfTtcclxuXHRcdFx0XHRcdGNvbnNvbGUuZGVidWcocmVxdWVzdCk7XHJcblx0XHRcdFx0XHRpZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZShKU09OLnN0cmluZ2lmeShyZXF1ZXN0KSwgJyonKTtcclxuXHRcdFx0XHRcdHNldFRpbWVvdXQoKCk9PnJlamVjdChcIlRJTUVPVVRFRCFcIiksIDIwMDAwKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdHJldHVybiBwcm9taXNlO1xyXG5cdFx0fVxyXG5cdFxyXG59XHJcblxyXG5jbGFzcyBQdWJsaWNTdG9yYWdlIHsgXHJcblxyXG4gc2Vzc2lvbkdldChwcm9wKSB7XHJcblx0IHJldHVybiBuZXcgUHVibGljU3RvcmFnZUFjY2VzcygpLmFjY2VzcyhcImdldFwiLCBwcm9wLCBudWxsLCBcInNlc3Npb25cIik7XHJcbiB9XHJcbiBzZXNzaW9uU2V0KHByb3AsIHZhbHVlKSB7XHJcblx0IHJldHVybiBuZXcgUHVibGljU3RvcmFnZUFjY2VzcygpLmFjY2VzcyhcInNldFwiLCBwcm9wLCB2YWx1ZSwgXCJzZXNzaW9uXCIpO1xyXG4gfVxyXG4gbG9jYWxHZXQocHJvcCkge1xyXG5cdCByZXR1cm4gbmV3IFB1YmxpY1N0b3JhZ2VBY2Nlc3MoKS5hY2Nlc3MoXCJnZXRcIiwgcHJvcCwgbnVsbCwgXCJsb2NhbFwiKTtcclxuIH1cclxuIGxvY2FsU2V0KHByb3AsIHZhbHVlKSB7XHJcblx0IHJldHVybiBuZXcgUHVibGljU3RvcmFnZUFjY2VzcygpLmFjY2VzcyhcInNldFwiLCBwcm9wLCB2YWx1ZSwgXCJsb2NhbFwiKTtcclxuIH1cclxuIGdldChwcm9wKSB7XHJcblx0IHJldHVybiB0aGlzLmxvY2FsR2V0KHByb3ApO1xyXG4gfVxyXG4gc2V0KHByb3AsIHZhbHVlKSB7XHJcblx0IHJldHVybiB0aGlzLmxvY2FsU2V0KHByb3AsIHZhbHVlKTsgXHJcbiB9XHJcblxyXG5cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IHB1YmxpY3N0b3JhZ2UgPSBuZXcgUHVibGljU3RvcmFnZSgpO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG9uTG9hZFRoZW4oKSB7XHJcblx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xyXG5cdFx0aWYgKHdpbmRvdykge1xyXG5cdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uIHVucmVnaXN0ZXJtZSgpIHtcclxuXHRcdFx0XHRyZXNvbHZlKHB1YmxpY3N0b3JhZ2UpO1xyXG5cdFx0XHRcdHdpbmRvdy5wdWJsaWNzdG9yYWdlID0gcHVibGljc3RvcmFnZTtcclxuXHRcdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbG9hZCcsIHVucmVnaXN0ZXJtZSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtyZWplY3QobmV3IEVycm9yKFwiVGltZW91dCB3YWl0aW5nIGZvciBvbkxvYWQhXCIpKTt9LCAxMDAwMCk7XHJcblx0fSk7XHJcbn1cclxuXHJcbi8vbW9kdWxlLmV4cG9ydHMgPSBvbkxvYWRUaGVuKCk7XHJcbiJdfQ==
