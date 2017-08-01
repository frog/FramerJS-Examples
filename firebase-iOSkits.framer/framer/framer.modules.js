require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"firebase":[function(require,module,exports){
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

exports.Firebase = (function(superClass) {
  var request;

  extend(Firebase, superClass);

  Firebase.define("status", {
    get: function() {
      return this._status;
    }
  });

  function Firebase(options) {
    var base, base1, base2;
    this.options = options != null ? options : {};
    this.projectID = (base = this.options).projectID != null ? base.projectID : base.projectID = null;
    this.secret = (base1 = this.options).secret != null ? base1.secret : base1.secret = null;
    this.debug = (base2 = this.options).debug != null ? base2.debug : base2.debug = false;
    if (this._status == null) {
      this._status = "disconnected";
    }
    this.secretEndPoint = this.secret ? "?auth=" + this.secret : "";
    Firebase.__super__.constructor.apply(this, arguments);
    if (this.debug) {
      console.log("Firebase: Connecting to Firebase Project '" + this.projectID + "' ... \n URL: 'https://" + this.projectID + ".firebaseio.com'");
    }
    this.onChange("connection");
  }

  request = function(project, secret, path, callback, method, data, parameters, debug) {
    var url, xhttp;
    url = "https://" + project + ".firebaseio.com" + path + ".json" + secret;
    if (parameters !== void 0) {
      if (parameters.shallow) {
        url += "&shallow=true";
      }
      if (parameters.format === "export") {
        url += "&format=export";
      }
      switch (parameters.print) {
        case "pretty":
          url += "&print=pretty";
          break;
        case "silent":
          url += "&print=silent";
      }
      if (typeof parameters.download === "string") {
        url += "&download=" + parameters.download;
        window.open(url, "_self");
      }
      if (typeof parameters.orderBy === "string") {
        url += "&orderBy=" + '"' + parameters.orderBy + '"';
      }
      if (typeof parameters.limitToFirst === "number") {
        url += "&limitToFirst=" + parameters.limitToFirst;
      }
      if (typeof parameters.limitToLast === "number") {
        url += "&limitToLast=" + parameters.limitToLast;
      }
      if (typeof parameters.startAt === "number") {
        url += "&startAt=" + parameters.startAt;
      }
      if (typeof parameters.endAt === "number") {
        url += "&endAt=" + parameters.endAt;
      }
      if (typeof parameters.equalTo === "number") {
        url += "&equalTo=" + parameters.equalTo;
      }
    }
    xhttp = new XMLHttpRequest;
    if (debug) {
      console.log("Firebase: New '" + method + "'-request with data: '" + (JSON.stringify(data)) + "' \n URL: '" + url + "'");
    }
    xhttp.onreadystatechange = (function(_this) {
      return function() {
        if (parameters !== void 0) {
          if (parameters.print === "silent" || typeof parameters.download === "string") {
            return;
          }
        }
        switch (xhttp.readyState) {
          case 0:
            if (debug) {
              console.log("Firebase: Request not initialized \n URL: '" + url + "'");
            }
            break;
          case 1:
            if (debug) {
              console.log("Firebase: Server connection established \n URL: '" + url + "'");
            }
            break;
          case 2:
            if (debug) {
              console.log("Firebase: Request received \n URL: '" + url + "'");
            }
            break;
          case 3:
            if (debug) {
              console.log("Firebase: Processing request \n URL: '" + url + "'");
            }
            break;
          case 4:
            if (callback != null) {
              callback(JSON.parse(xhttp.responseText));
            }
            if (debug) {
              console.log("Firebase: Request finished, response: '" + (JSON.parse(xhttp.responseText)) + "' \n URL: '" + url + "'");
            }
        }
        if (xhttp.status === "404") {
          if (debug) {
            return console.warn("Firebase: Invalid request, page not found \n URL: '" + url + "'");
          }
        }
      };
    })(this);
    xhttp.open(method, url, true);
    xhttp.setRequestHeader("Content-type", "application/json; charset=utf-8");
    return xhttp.send(data = "" + (JSON.stringify(data)));
  };

  Firebase.prototype.get = function(path, callback, parameters) {
    return request(this.projectID, this.secretEndPoint, path, callback, "GET", null, parameters, this.debug);
  };

  Firebase.prototype.put = function(path, data, callback, parameters) {
    return request(this.projectID, this.secretEndPoint, path, callback, "PUT", data, parameters, this.debug);
  };

  Firebase.prototype.post = function(path, data, callback, parameters) {
    return request(this.projectID, this.secretEndPoint, path, callback, "POST", data, parameters, this.debug);
  };

  Firebase.prototype.patch = function(path, data, callback, parameters) {
    return request(this.projectID, this.secretEndPoint, path, callback, "PATCH", data, parameters, this.debug);
  };

  Firebase.prototype["delete"] = function(path, callback, parameters) {
    return request(this.projectID, this.secretEndPoint, path, callback, "DELETE", null, parameters, this.debug);
  };

  Firebase.prototype.onChange = function(path, callback) {
    var currentStatus, source, url;
    if (path === "connection") {
      url = "https://" + this.projectID + ".firebaseio.com/.json" + this.secretEndPoint;
      currentStatus = "disconnected";
      source = new EventSource(url);
      source.addEventListener("open", (function(_this) {
        return function() {
          if (currentStatus === "disconnected") {
            _this._status = "connected";
            if (callback != null) {
              callback("connected");
            }
            if (_this.debug) {
              console.log("Firebase: Connection to Firebase Project '" + _this.projectID + "' established");
            }
          }
          return currentStatus = "connected";
        };
      })(this));
      return source.addEventListener("error", (function(_this) {
        return function() {
          if (currentStatus === "connected") {
            _this._status = "disconnected";
            if (callback != null) {
              callback("disconnected");
            }
            if (_this.debug) {
              console.warn("Firebase: Connection to Firebase Project '" + _this.projectID + "' closed");
            }
          }
          return currentStatus = "disconnected";
        };
      })(this));
    } else {
      url = "https://" + this.projectID + ".firebaseio.com" + path + ".json" + this.secretEndPoint;
      source = new EventSource(url);
      if (this.debug) {
        console.log("Firebase: Listening to changes made to '" + path + "' \n URL: '" + url + "'");
      }
      source.addEventListener("put", (function(_this) {
        return function(ev) {
          if (callback != null) {
            callback(JSON.parse(ev.data).data, "put", JSON.parse(ev.data).path, _.tail(JSON.parse(ev.data).path.split("/"), 1));
          }
          if (_this.debug) {
            return console.log("Firebase: Received changes made to '" + path + "' via 'PUT': " + (JSON.parse(ev.data).data) + " \n URL: '" + url + "'");
          }
        };
      })(this));
      return source.addEventListener("patch", (function(_this) {
        return function(ev) {
          if (callback != null) {
            callback(JSON.parse(ev.data).data, "patch", JSON.parse(ev.data).path, _.tail(JSON.parse(ev.data).path.split("/"), 1));
          }
          if (_this.debug) {
            return console.log("Firebase: Received changes made to '" + path + "' via 'PATCH': " + (JSON.parse(ev.data).data) + " \n URL: '" + url + "'");
          }
        };
      })(this));
    }
  };

  return Firebase;

})(Framer.BaseClass);


},{}],"ios-kit-alert":[function(require,module,exports){
var ios;

ios = require('ios-kit');

exports.defaults = {
  title: "Title",
  message: "",
  actions: ["OK"]
};

exports.defaults.props = Object.keys(exports.defaults);

exports.create = function(obj) {
  var act, actLabel, actLabel2, action, action2, actionDivider, actions, alert, cleanName, i, index, j, len, len1, ref, setup;
  setup = ios.utils.setupComponent(obj, exports.defaults);
  alert = new ios.View({
    backgroundColor: "transparent",
    name: "alert",
    constraints: {
      leading: 0,
      trailing: 0,
      top: 0,
      bottom: 0
    }
  });
  alert.overlay = new ios.View({
    backgroundColor: "rgba(0,0,0,.3)",
    superLayer: alert,
    name: ".overlay",
    constraints: {
      leading: 0,
      trailing: 0,
      top: 0,
      bottom: 0
    }
  });
  alert.modal = new ios.View({
    backgroundColor: "white",
    superLayer: alert,
    borderRadius: ios.utils.px(10),
    name: ".modal",
    constraints: {
      align: "center",
      width: 280,
      height: 400
    }
  });
  alert.title = new ios.Text({
    superLayer: alert.modal,
    text: setup.title,
    fontWeight: "semibold",
    name: ".title",
    textAlign: "center",
    lineHeight: 20,
    constraints: {
      top: 20,
      width: 220,
      align: "horizontal"
    }
  });
  alert.message = new ios.Text({
    superLayer: alert.modal,
    text: setup.message,
    fontSize: 13,
    name: ".message",
    textAlign: "center",
    lineHeight: 16,
    constraints: {
      top: [alert.title, 10],
      align: "horizontal",
      width: 220
    }
  });
  if (setup.message.length === 0) {
    alert.message.height = -24;
  }
  alert.horiDivider = new ios.View({
    superLayer: alert.modal,
    backgroundColor: "#E2E8EB",
    name: ".horiDivider",
    constraints: {
      leading: 0,
      trailing: 0,
      height: 1,
      bottom: 44
    }
  });
  cleanName = function(n) {
    if (n[0] === "-") {
      return n.slice(9);
    } else {
      return n;
    }
  };
  alert.modal.constraints["height"] = 20 + ios.utils.pt(alert.title.height) + 10 + ios.utils.pt(alert.message.height) + 24 + 44;
  actions = [];
  switch (setup.actions.length) {
    case 1:
      actLabel = ios.utils.capitalize(setup.actions[0]);
      action = new ios.View({
        superLayer: alert.modal,
        backgroundColor: "white",
        name: cleanName(setup.actions[0]),
        borderRadius: ios.utils.px(10),
        constraints: {
          leading: 0,
          trailing: 0,
          bottom: 0,
          height: 44
        }
      });
      action.label = new ios.Text({
        color: ios.utils.color("blue"),
        superLayer: action,
        text: actLabel,
        name: "label",
        constraints: {
          align: "horizontal",
          bottom: 16
        }
      });
      actions.push(action);
      break;
    case 2:
      actLabel = ios.utils.capitalize(setup.actions[0]);
      action = new ios.View({
        superLayer: alert.modal,
        name: cleanName(setup.actions[0]),
        borderRadius: ios.utils.px(10),
        backgroundColor: "white",
        constraints: {
          leading: 0,
          trailing: ios.utils.pt(alert.modal.width / 2),
          bottom: 0,
          height: 44
        }
      });
      action.label = new ios.Text({
        color: ios.utils.color("blue"),
        superLayer: action,
        text: actLabel,
        name: "label",
        constraints: {
          align: "horizontal",
          bottom: 16
        }
      });
      actions.push(action);
      alert.vertDivider = new ios.View({
        superLayer: alert.modal,
        backgroundColor: "#E2E8EB",
        name: ".vertDivider",
        constraints: {
          width: 1,
          bottom: 0,
          height: 44,
          align: "horizontal"
        }
      });
      actLabel2 = ios.utils.capitalize(setup.actions[1]);
      action2 = new ios.View({
        superLayer: alert.modal,
        name: cleanName(setup.actions[1]),
        borderRadius: ios.utils.px(10),
        backgroundColor: "white",
        constraints: {
          leading: ios.utils.pt(alert.modal.width / 2),
          trailing: 0,
          bottom: 0,
          height: 44
        }
      });
      action2.label = new ios.Text({
        color: ios.utils.color("blue"),
        superLayer: action2,
        text: actLabel2,
        name: "label",
        constraints: {
          align: "horizontal",
          bottom: 16
        }
      });
      actions.push(action2);
      break;
    default:
      ref = setup.actions;
      for (index = i = 0, len = ref.length; i < len; index = ++i) {
        act = ref[index];
        actLabel = ios.utils.capitalize(act);
        action = new ios.View({
          superLayer: alert.modal,
          name: cleanName(act),
          borderRadius: ios.utils.px(10),
          backgroundColor: "white",
          constraints: {
            leading: 0,
            trailing: 0,
            bottom: 0 + ((setup.actions.length - index - 1) * 44),
            height: 44
          }
        });
        actionDivider = new ios.View({
          superLayer: alert.modal,
          backgroundColor: "#E2E8EB",
          name: "action divider",
          constraints: {
            leading: 0,
            trailing: 0,
            height: 1,
            bottom: 0 + ((setup.actions.length - index) * 44)
          }
        });
        action.label = new ios.Text({
          style: "alertAction",
          color: ios.utils.color("blue"),
          superLayer: action,
          text: actLabel,
          name: "label",
          constraints: {
            align: "horizontal",
            bottom: 14
          }
        });
        actions.push(action);
        alert.modal.constraints["height"] = alert.modal.constraints["height"] + 42 - 12;
      }
  }
  alert.actions = {};
  for (index = j = 0, len1 = actions.length; j < len1; index = ++j) {
    act = actions[index];
    act.type = "button";
    ios.utils.specialChar(act);
    if (setup.actions[index].indexOf("-r") === 0) {
      act.origColor = ios.utils.color("red");
    } else {
      act.origColor = ios.utils.color("blue");
    }
    ios.layout.set(act.label);
    act.on(Events.TouchStart, function() {
      this.backgroundColor = "white";
      this.animate({
        properties: {
          backgroundColor: act.backgroundColor.darken(5)
        },
        time: .25
      });
      return this.label.animate({
        properties: {
          color: this.origColor.lighten(10)
        },
        time: .25
      });
    });
    act.on(Events.TouchEnd, function() {
      this.animate({
        properties: {
          backgroundColor: "white"
        },
        time: .25
      });
      this.label.animate({
        properties: {
          color: this.origColor
        },
        time: .25
      });
      return alert.destroy();
    });
    alert.actions[act.name] = act;
  }
  ios.layout.set(actions[actions.length - 1]);
  return alert;
};


},{"ios-kit":"ios-kit"}],"ios-kit-banner":[function(require,module,exports){
var ios;

ios = require('ios-kit');

exports.defaults = {
  title: "Title",
  message: "Message",
  action: "Action",
  time: "now",
  app: "app",
  icon: void 0,
  duration: 7,
  animated: true,
  reply: true
};

exports.defaults.props = Object.keys(exports.defaults);

exports.create = function(obj) {
  var banner, setup, specs;
  setup = ios.utils.setupComponent(obj, exports.defaults);
  specs = {
    leadingIcon: 15,
    topIcon: 8,
    topTitle: 6,
    width: 0
  };
  switch (ios.device.name) {
    case "iphone-5":
      specs.width = 304;
      break;
    case "iphone-6s":
      specs.width = 359;
      break;
    case "iphone-6s-plus":
      specs.leadingIcon = 15;
      specs.topIcon = 12;
      specs.topTitle = 10;
      specs.width = 398;
      break;
    case "ipad":
      specs.leadingIcon = 8;
      specs.topIcon = 8;
      specs.topTitle = 11;
      specs.width = 398;
      break;
    case "ipad-pro":
      specs.leadingIcon = 8;
      specs.topIcon = 8;
      specs.topTitle = 9;
      specs.width = 556;
  }
  banner = new ios.View({
    backgroundColor: "rgba(255,255,255,.6)",
    name: "banner",
    borderRadius: ios.px(12),
    shadowColor: "rgba(0,0,0,.3)",
    shadowY: ios.px(2),
    shadowBlur: ios.px(10),
    clip: true,
    constraints: {
      align: 'horizontal',
      width: specs.width,
      top: 8,
      height: 93
    }
  });
  banner.header = new ios.View({
    backgroundColor: "rgba(255,255,255, .3)",
    name: ".header",
    superLayer: banner,
    constraints: {
      height: 36,
      leading: 0,
      trailing: 0
    }
  });
  if (setup.icon === void 0) {
    banner.icon = new ios.View({
      superLayer: banner.header
    });
    banner.icon.style["background"] = "linear-gradient(-180deg, #67FF81 0%, #01B41F 100%)";
  } else {
    banner.header.addSubLayer(setup.icon);
    banner.icon = setup.icon;
  }
  banner.icon.borderRadius = ios.utils.px(4.5);
  banner.icon.name = ".icon";
  banner.icon.constraints = {
    height: 20,
    width: 20,
    leading: specs.leadingIcon,
    align: "vertical"
  };
  ios.layout.set(banner.icon);
  banner.app = new ios.Text({
    text: setup.app.toUpperCase(),
    color: "rgba(0,0,0,.5)",
    fontSize: 13,
    letterSpacing: .5,
    superLayer: banner.header,
    constraints: {
      leading: [banner.icon, 6],
      align: "vertical"
    }
  });
  banner.title = new ios.Text({
    text: setup.title,
    color: "black",
    fontWeight: "semibold",
    fontSize: 15,
    superLayer: banner,
    name: ".title",
    constraints: {
      top: 45,
      leading: 15
    }
  });
  banner.message = new ios.Text({
    text: setup.message,
    color: "black",
    fontSize: 15,
    fontWeight: "light",
    superLayer: banner,
    name: ".message",
    constraints: {
      leadingEdges: banner.title,
      top: [banner.title, 6]
    }
  });
  banner.time = new ios.Text({
    text: setup.time,
    color: "rgba(0,0,0,.5)",
    fontSize: 13,
    superLayer: banner.header,
    name: ".time",
    constraints: {
      trailing: 16,
      align: "vertical"
    }
  });
  if (ios.device.name === "ipad" || ios.device.name === "ipad-pro") {
    banner.time.constraints = {
      bottomEdges: banner.title,
      trailing: specs.leadingIcon
    };
  }
  ios.utils.bgBlur(banner);
  banner.draggable = true;
  banner.draggable.horizontal = false;
  banner.draggable.constraints = {
    y: ios.px(8),
    x: ios.px(8)
  };
  banner.draggable.bounceOptions = {
    friction: 25,
    tension: 250
  };
  banner.on(Events.DragEnd, function() {
    if (banner.maxY < ios.utils.px(68)) {
      banner.animate({
        properties: {
          maxY: 0
        },
        time: .15,
        curve: "ease-in-out"
      });
      return Utils.delay(.25, function() {
        return banner.destroy();
      });
    }
  });
  if (setup.animated === true) {
    banner.y = 0 - banner.height;
    ios.layout.animate({
      target: banner,
      time: .25,
      curve: 'ease-in-out'
    });
  }
  if (setup.duration) {
    Utils.delay(setup.duration, function() {
      return banner.animate({
        properties: {
          maxY: 0
        },
        time: .25,
        curve: "ease-in-out"
      });
    });
    Utils.delay(setup.duration + .25, function() {
      return banner.destroy();
    });
  }
  return banner;
};


},{"ios-kit":"ios-kit"}],"ios-kit-button":[function(require,module,exports){
var ios;

ios = require('ios-kit');

exports.defaults = {
  text: "Button",
  type: "text",
  style: "light",
  backgroundColor: "white",
  color: "#007AFF",
  fontSize: 17,
  fontWeight: "regular",
  name: "button",
  blur: true,
  superLayer: void 0,
  constraints: void 0
};

exports.defaults.props = Object.keys(exports.defaults);

exports.create = function(array) {
  var backgroundColor, button, color, rgbString, rgbaString, setup;
  setup = ios.utils.setupComponent(array, exports.defaults);
  button = new ios.View({
    name: setup.name,
    constraints: setup.constraints,
    superLayer: setup.superLayer
  });
  button.type = setup.type;
  color = "";
  switch (setup.type) {
    case "big":
      setup.fontSize = 20;
      setup.fontWeight = "medium";
      button.borderRadius = ios.utils.px(12.5);
      backgroundColor = "";
      if (button.constraints === void 0) {
        button.constraints = {};
      }
      button.constraints.leading = 10;
      button.constraints.trailing = 10;
      button.constraints.height = 57;
      switch (setup.style) {
        case "light":
          color = ios.utils.color("blue");
          if (setup.blur) {
            backgroundColor = "rgba(255, 255, 255, .9)";
            ios.utils.bgBlur(button);
          } else {
            backgroundColor = "white";
          }
          break;
        case "dark":
          color = "#FFF";
          if (setup.blur) {
            backgroundColor = "rgba(43, 43, 43, .9)";
            ios.utils.bgBlur(button);
          } else {
            backgroundColor = "#282828";
          }
          break;
        default:
          if (setup.blur) {
            color = setup.color;
            backgroundColor = new Color(setup.backgroundColor);
            rgbString = backgroundColor.toRgbString();
            rgbaString = rgbString.replace(")", ", .9)");
            rgbaString = rgbaString.replace("rgb", "rgba");
            backgroundColor = rgbaString;
            ios.utils.bgBlur(button);
          } else {
            color = setup.color;
            backgroundColor = new Color(setup.backgroundColor);
          }
      }
      button.backgroundColor = backgroundColor;
      button.on(Events.TouchStart, function() {
        var newColor;
        newColor = "";
        if (setup.style === "dark") {
          newColor = button.backgroundColor.lighten(10);
        } else {
          newColor = button.backgroundColor.darken(10);
        }
        return button.animate({
          properties: {
            backgroundColor: newColor
          },
          time: .5
        });
      });
      button.on(Events.TouchEnd, function() {
        return button.animate({
          properties: {
            backgroundColor: backgroundColor
          },
          time: .5
        });
      });
      break;
    case "small":
      setup.fontSize = 14;
      setup.top = 4;
      button.borderRadius = ios.utils.px(2.5);
      setup.fontWeight = 500;
      setup.text = setup.text.toUpperCase();
      color = setup.color;
      button.borderColor = setup.color;
      button.backgroundColor = "transparent";
      button.borderWidth = ios.utils.px(1);
      break;
    default:
      button.backgroundColor = "transparent";
      button.origColor = ios.utils.specialChar(button);
      color = setup.color;
      button.labelOrigColor = color;
      button.on(Events.TouchStart, function() {
        var newColor;
        this.labelOrigColor = button.label.color;
        newColor = button.subLayers[0].color.lighten(30);
        return button.subLayers[0].animate({
          properties: {
            color: newColor
          },
          time: .5
        });
      });
      button.on(Events.TouchEnd, function() {
        return this.subLayers[0].animate({
          properties: {
            color: ios.utils.color(this.labelOrigColor)
          },
          time: .5
        });
      });
  }
  button.label = new ios.Text({
    name: ".label",
    text: setup.text,
    color: color,
    lineHeight: 16,
    superLayer: button,
    fontSize: setup.fontSize,
    fontWeight: setup.fontWeight,
    constraints: {
      align: "center"
    }
  });
  switch (setup.type) {
    case "small":
      button.props = {
        width: button.label.width + ios.utils.px(20),
        height: button.label.height + ios.utils.px(10)
      };
      button.on(Events.TouchStart, function() {
        button.animate({
          properties: {
            backgroundColor: color
          },
          time: .5
        });
        return button.label.animate({
          properties: {
            color: "#FFF"
          },
          time: .5
        });
      });
      button.on(Events.TouchEnd, function() {
        button.animate({
          properties: {
            backgroundColor: "transparent"
          },
          time: .5
        });
        return button.label.animate({
          properties: {
            color: color
          },
          time: .5
        });
      });
      break;
    default:
      button.props = {
        width: button.label.width,
        height: button.label.height
      };
  }
  ios.layout.set({
    target: button
  });
  ios.layout.set({
    target: button.label
  });
  return button;
};


},{"ios-kit":"ios-kit"}],"ios-kit-converter":[function(require,module,exports){
var genCSS, ios;

ios = require('ios-kit');

genCSS = function(cssArray) {
  var colonIndex, cssObj, i, j, key, len, prop, value;
  cssObj = {};
  for (i = j = 0, len = cssArray.length; j < len; i = ++j) {
    prop = cssArray[i];
    colonIndex = prop.indexOf(":");
    key = prop.slice(0, colonIndex);
    value = prop.slice(colonIndex + 2, prop.length - 1);
    cssObj[key] = value;
  }
  return cssObj;
};

exports.convert = function(obj) {
  var Artboard, artboards, b, children, device, found, genAlert, genBanner, genButton, genConstraints, genField, genKeyboard, genLayer, genNavBar, genSheet, genStatusBar, genTabBar, genText, getCSS, getColorString, getDesignedDevice, getImage, getLayer, getString, j, key, layerKeys, layers, len, len1, m, newArtboards, newLayers;
  getDesignedDevice = function(w) {
    var device;
    device = {};
    switch (w) {
      case 320:
      case 480:
      case 640:
      case 960:
      case 1280:
        device.scale = 2;
        device.height = 568;
        device.width = 320;
        device.name = 'iphone-5';
        break;
      case 375:
      case 562.5:
      case 750:
      case 1125:
      case 1500:
        device.scale = 2;
        device.height = 667;
        device.width = 375;
        device.name = 'iphone-6s';
        break;
      case 414:
      case 621:
      case 828:
      case 1242:
      case 1656:
        device.scale = 3;
        device.height = 736;
        device.width = 414;
        device.name = 'iphone-6s-plus';
        break;
      case 768:
      case 1152:
      case 1536:
      case 2304:
      case 3072:
        device.scale = 2;
        device.height = 1024;
        device.width = 768;
        device.name = 'ipad';
        break;
      case 1024:
      case 1536:
      case 2048:
      case 3072:
      case 4096:
        device.scale = 2;
        device.height = 1366;
        device.width = 1024;
        device.name = 'ipad-pro';
    }
    switch (w) {
      case 320:
      case 375:
      case 414:
      case 768:
      case 1024:
        device.iScale = 1;
        break;
      case 480:
      case 562.5:
      case 621:
      case 1152:
      case 1536:
        device.iScale = 1.5;
        break;
      case 640:
      case 750:
      case 828:
      case 1536:
      case 2048:
        device.iScale = 2;
        break;
      case 960:
      case 1125:
      case 1242:
      case 2304:
      case 3072:
        device.iScale = 3;
        break;
      case 1280:
      case 1500:
      case 1656:
      case 3072:
      case 4096:
        device.iScale = 4;
    }
    device.obj = 'device';
    return device;
  };
  layerKeys = Object.keys(obj);
  layers = [];
  artboards = [];
  newLayers = {};
  newArtboards = [];
  for (j = 0, len = layerKeys.length; j < len; j++) {
    key = layerKeys[j];
    if (obj[key]._info.kind === 'artboard') {
      artboards.push(obj[key]);
    }
  }
  for (m = 0, len1 = artboards.length; m < len1; m++) {
    b = artboards[m];
    device = getDesignedDevice(b.width);
    Artboard = function(artboard) {
      var board;
      board = new ios.View({
        name: artboard.name,
        backgroundColor: b.backgroundColor,
        constraints: {
          top: 0,
          bottom: 0,
          leading: 0,
          trailing: 0
        }
      });
      return board;
    };
    getString = function(l) {
      return l._info.metadata.string;
    };
    getCSS = function(l) {
      return genCSS(l._info.metadata.css);
    };
    getColorString = function(l) {
      return '-' + getCSS(l).color + ' ' + getString(l);
    };
    getImage = function(l) {
      return l.image;
    };
    getLayer = function(l) {
      return l.copy();
    };
    found = function(o, t) {
      if (o.indexOf(t) !== -1) {
        return true;
      }
    };
    genConstraints = function(l) {
      var bY, cX, cY, constraints, f, lX, r, s, tX, tY;
      constraints = {};
      s = device.iScale;
      cX = device.width / 2;
      cY = device.height / 2;
      tY = device.height / 4 * 3;
      bY = device.height / 4 * 3;
      lX = device.width / 4 * 3;
      tX = device.width / 4 * 3;
      r = function(n) {
        return Math.round(n);
      };
      f = function(n) {
        return Math.floor(n);
      };
      if (cX === l.midX / s || r(cX) === r(l.midX / s) || f(cX) === f(l.midX / s)) {
        constraints.align = 'horizontal';
      }
      if (cY === l.midY / s || r(cY) === r(l.midY / s) || f(cY) === f(l.midY / s)) {
        if (constraints.align === 'horizontal') {
          constraints.align = 'center';
        } else {
          constraints.align = 'vertical';
        }
      }
      if (l.x / s < lX) {
        constraints.leading = r(l.x / s);
      }
      if (l.x / s > tX) {
        constraints.trailing = r(l.parent.width / s - l.maxX / s);
      }
      if (l.y / s < tY) {
        constraints.top = r(l.y / s);
      }
      if (l.y / s > bY) {
        constraints.bottom = r(l.parent.height / s - l.maxY / s);
      }
      if (l.width / s === device.width) {
        constraints.leading = 0;
        constraints.trailing = 0;
      } else {
        constraints.width = l.width / s;
      }
      if (l.height / s === device.height) {
        constraints.top = 0;
        constraints.bottom = 0;
      } else {
        constraints.height = l.height / s;
      }
      return constraints;
    };
    genLayer = function(l, parent) {
      var props;
      props = {
        backgroundColor: 'transparent',
        name: l.name,
        image: l.image,
        superLayer: parent,
        constraints: genConstraints(l)
      };
      return new ios.View(props);
    };
    genAlert = function(l, nP) {
      var c, len2, n, props, q, ref;
      props = {
        actions: [],
        superLayer: nP
      };
      ref = l.children;
      for (q = 0, len2 = ref.length; q < len2; q++) {
        c = ref[q];
        n = c.name;
        if (found(n, 'title')) {
          props.title = getString(c);
        }
        if (found(n, 'message')) {
          props.message = getString(c);
        }
        if (found(n, 'action')) {
          props.actions.unshift(getColorString(c));
        }
        c.destroy();
      }
      return new ios.Alert(props);
    };
    genBanner = function(l, nP) {
      var c, len2, n, props, q, ref;
      props = {
        superLayer: nP
      };
      ref = l.children;
      for (q = 0, len2 = ref.length; q < len2; q++) {
        c = ref[q];
        n = c.name;
        if (found(n, 'app')) {
          props.app = getString(c);
        }
        if (found(n, 'title')) {
          props.title = getString(c);
        }
        if (found(n, 'message')) {
          props.message = getString(c);
        }
        if (found(n, 'time')) {
          props.time = getString(c);
        }
        if (found(n, 'icon')) {
          props.icon = getLayer(c);
        }
        c.destroy();
      }
      return new ios.Banner(props);
    };
    genButton = function(l, nP) {
      var c, len2, n, props, q, ref;
      props = {
        superLayer: nP,
        constraints: genConstraints(l)
      };
      ref = l.children;
      for (q = 0, len2 = ref.length; q < len2; q++) {
        c = ref[q];
        n = c.name;
        if (found(n, 'small')) {
          props.type = 'small';
        }
        if (found(n, 'big')) {
          props.type = 'big';
        }
        if (found(n, 'dark')) {
          props.style = 'dark';
        }
        if (found(n, 'label')) {
          props.text = getString(c);
          props.color = getCSS(c).color;
          props.fontSize = getCSS(c)['font-size'].replace('px', '');
        }
        c.destroy();
      }
      return new ios.Button(props);
    };
    genField = function(l, nP) {
      var c, len2, n, props, q, ref;
      props = {
        superLayer: nP,
        constraints: genConstraints(l)
      };
      ref = l.children;
      for (q = 0, len2 = ref.length; q < len2; q++) {
        c = ref[q];
        n = c.name;
        if (found(n, 'placeholder')) {
          props.placeholder = getString(c);
        }
        c.destroy();
      }
      return new ios.Field(props);
    };
    genKeyboard = function(l, nP) {
      var c, len2, n, props, q, ref;
      props = {
        superLayer: nP
      };
      ref = l.children;
      for (q = 0, len2 = ref.length; q < len2; q++) {
        c = ref[q];
        n = c.name;
        if (found(n, 'return')) {
          props.returnText = getString(c);
        }
        if (found(n, 'dark')) {
          props.style = 'dark';
        }
        c.destroy();
      }
      return new ios.Keyboard(props);
    };
    genNavBar = function(l, nP) {
      var c, len2, n, props, q, ref;
      props = {
        superLayer: nP
      };
      ref = l.children;
      for (q = 0, len2 = ref.length; q < len2; q++) {
        c = ref[q];
        n = c.name;
        if (found(n, 'title')) {
          props.title = getString(c);
          props.titleColor = getCSS(c).color;
        }
        if (found(n, 'right')) {
          props.right = getString(c);
          props.color = getCSS(c).color;
        }
        if (found(n, 'left')) {
          props.left = getString(c);
        }
        c.destroy();
      }
      return new ios.NavBar(props);
    };
    genSheet = function(l, nP) {
      var c, i, len2, n, props, q, ref;
      props = {
        actions: [],
        superLayer: nP
      };
      ref = l.children;
      for (i = q = 0, len2 = ref.length; q < len2; i = ++q) {
        c = ref[i];
        n = c.name;
        if (found(n, 'action')) {
          props.actions.push(getColorString(c));
        }
        if (found(n, 'exit')) {
          props.exit = getString(c);
        }
        c.destroy();
      }
      return new ios.Sheet(props);
    };
    genStatusBar = function(l, nP) {
      var c, len2, n, props, q, ref;
      props = {
        superLayer: nP
      };
      ref = l.children;
      for (q = 0, len2 = ref.length; q < len2; q++) {
        c = ref[q];
        n = c.name;
        if (found(n, 'carrier')) {
          props.carrier = getString(c);
        }
        if (found(n, 'battery')) {
          props.battery = getString(c).replace('%', '');
        }
        if (found(n, 'network')) {
          props.network = getString(c);
        }
        if (found(n, 'dark')) {
          props.style = 'light';
        }
        c.destroy();
      }
      return new ios.StatusBar(props);
    };
    genTabBar = function(l, nP) {
      var c, len2, len3, n, props, q, ref, ref1, t, tn, tprops, u;
      props = {
        tabs: [],
        superLayer: nP
      };
      ref = l.children;
      for (q = 0, len2 = ref.length; q < len2; q++) {
        c = ref[q];
        n = c.name;
        tprops = {};
        ref1 = c.children;
        for (u = 0, len3 = ref1.length; u < len3; u++) {
          t = ref1[u];
          tn = t.name;
          if (n === 'tab_active' && tn.indexOf('label') !== -1) {
            props.activeColor = getCSS(t).color;
          }
          if (n !== 'tab_active' && tn.indexOf('label') !== -1) {
            props.inactiveColor = getCSS(t).color;
          }
          if (found(tn, 'active') && tn.indexOf('inactive') === -1) {
            tprops.active = getLayer(t);
          }
          if (found(tn, 'inactive')) {
            tprops.inactive = getLayer(t);
          }
          if (found(tn, 'label')) {
            tprops.label = getString(t);
          }
          t.destroy();
        }
        props.tabs.unshift(new ios.Tab(tprops));
        c.destroy();
      }
      return new ios.TabBar(props);
    };
    genText = function(l, nP) {
      var css, k, keys, len2, props, q;
      props = {
        superLayer: nP,
        text: getString(l),
        constraints: genConstraints(l)
      };
      css = getCSS(l);
      keys = Object.keys(getCSS(l));
      for (q = 0, len2 = keys.length; q < len2; q++) {
        k = keys[q];
        if (found(k, 'font-family')) {
          props.fontFamily = css[k];
        }
        if (found(k, 'opacity')) {
          props.opacity = Number(css[k]);
        }
        if (found(k, 'color')) {
          props.color = css[k];
        }
        if (found(k, 'font-size')) {
          props.fontSize = css[k].replace('px', '');
        }
        if (found(k, 'letter-spacing')) {
          props.letterSpacing = css[k];
        }
        if (found(k, 'line-height')) {
          props.lineHeight = css[k].replace('px', '');
        }
      }
      return new ios.Text(props);
    };
    children = function(p, nP) {
      var c, len2, n, newLayer, q, ref, results;
      ref = p.children;
      results = [];
      for (q = 0, len2 = ref.length; q < len2; q++) {
        c = ref[q];
        n = c.name;
        newLayer = 0;
        if (c.name[0] === '_') {
          if (found(n, '_Alert')) {
            newLayer = genAlert(c, nP);
          }
          if (found(n, '_Banner')) {
            newLayer = genBanner(c, nP);
          }
          if (found(n, '_Button')) {
            newLayer = genButton(c, nP);
          }
          if (found(n, '_Field')) {
            newLayer = genField(c, nP);
          }
          if (found(n, '_Keyboard')) {
            newLayer = genKeyboard(c, nP);
          }
          if (found(n, '_NavBar')) {
            newLayer = genNavBar(c, nP);
          }
          if (found(n, '_Sheet')) {
            newLayer = genSheet(c, nP);
          }
          if (found(n, '_TabBar')) {
            newLayer = genTabBar(c, nP);
          }
          if (found(n, '_StatusBar')) {
            newLayer = new genStatusBar(c, nP);
          }
          if (found(n, '_Text')) {
            newLayer = genText(c, nP);
          }
          if (newLayer === void 0) {
            newLayer = genLayer(c, nP);
          }
        } else {
          newLayer = genLayer(c, nP);
        }
        newLayers[n] = newLayer;
        if (c.children) {
          children(c, newLayer);
        }
        results.push(c.destroy());
      }
      return results;
    };
    ios.l[b.name] = new Artboard(b);
    children(b, ios.l[b.name]);
    b.destroy();
    newArtboards.push(ios.l[b.name]);
    newLayers[b.name] = ios.l[b.name];
  }
  return newLayers;
};


},{"ios-kit":"ios-kit"}],"ios-kit-field":[function(require,module,exports){
var ios;

ios = require('ios-kit');

exports.defaults = {
  name: 'field',
  active: false,
  keyboard: true,
  text: void 0,
  placeholder: "Enter text",
  placeholderColor: "#999",
  superLayer: void 0,
  backgroundColor: "white",
  borderColor: "#CCCCCC",
  borderRadius: ios.px(5),
  borderWidth: ios.px(1),
  height: ios.px(30),
  width: ios.px(97),
  fontSize: 17,
  color: 'black',
  textConstraints: {
    leading: 4,
    align: "vertical"
  },
  constraints: {
    height: 30,
    width: 97,
    align: "center"
  }
};

exports.defaults.props = Object.keys(exports.defaults);

exports.create = function(array) {
  var field, setup;
  setup = ios.utils.setupComponent(array, exports.defaults);
  field = new ios.View({
    name: setup.name,
    constraints: setup.constraints,
    backgroundColor: setup.backgroundColor,
    borderColor: setup.borderColor,
    borderRadius: setup.borderRadius,
    borderWidth: setup.borderWidth,
    height: setup.height,
    width: setup.width,
    clip: true,
    superLayer: setup.superLayer
  });
  field.text = new ios.Text({
    superLayer: field,
    name: ".text",
    constraints: setup.textConstraints,
    text: setup.text ? setup.text : "",
    fontSize: 17,
    color: setup.color
  });
  field.text.placeholder = new ios.Text({
    superLayer: field,
    name: ".placeholder",
    constraints: setup.textConstraints,
    text: setup.text ? "" : setup.placeholder,
    fontSize: 17,
    color: setup.placeholderColor
  });
  field.active = setup.active;
  field.type = 'field';
  field.on(Events.TouchEnd, function() {
    if (field.active !== true) {
      field.active = true;
      if (setup.keyboard === true && field.keyboard === void 0) {
        field.keyboard = new ios.Keyboard({
          output: field.text,
          hidden: true
        });
      }
      if (typeof setup.keyboard === 'object') {
        field.input(setup.keyboard);
        field.keyboard = setup.keyboard;
      }
      field.keyboard.call();
      field.text.cursor = new ios.View({
        superLayer: field,
        name: "cursor",
        backgroundColor: ios.color("blue"),
        constraints: {
          width: 2,
          height: setup.fontSize + 6,
          leading: 4,
          align: "vertical"
        }
      });
      if (field.text.html !== setup.placeholder) {
        field.text.cursor.constraints.leading = field.text;
        ios.layout.set(field.text.cursor);
      }
      field.listeningToField = Utils.interval(.1, function() {
        if (field.active === false) {
          clearInterval(field.interval);
          clearInterval(field.listeningToField);
          return field.text.cursor.destroy();
        }
      });
      field.interval = Utils.interval(.6, function() {
        if (field.active) {
          if (field.text.cursor.opacity) {
            return field.text.cursor.animate({
              properties: {
                opacity: 0
              },
              time: .5
            });
          } else {
            return field.text.cursor.animate({
              properties: {
                opacity: 1
              },
              time: .5
            });
          }
        }
      });
      return field.text.on("change:html", function() {
        this.cursor.constraints.leading = this;
        if (this.html === '') {
          this.placeholder.visible = true;
        } else {
          this.placeholder.visible = false;
        }
        if (this.html.indexOf(this.placeholder) !== -1) {
          this.html = this.html.replace(this.placeholder, '');
        }
        return ios.layout.set(this.cursor);
      });
    }
  });
  field.input = function(keyboard) {
    return keyboard.output(field);
  };
  return field;
};


},{"ios-kit":"ios-kit"}],"ios-kit-keyboard":[function(require,module,exports){
var arrayOfCodes, codeMap, device, ios, letters, numbers, symbols;

ios = require('ios-kit');

exports.defaults = {
  style: "light",
  shift: true,
  output: void 0,
  returnText: "return",
  state: "letters",
  hidden: false,
  returnColor: "blue",
  superLayer: void 0
};

device = {
  "iphone-5": {
    popUpChar: 40,
    popUpTop: 4,
    height: 215,
    lineHeight: 36,
    letterKey: {
      keyTop: 6,
      height: 39,
      width: 26.5,
      borderRadius: 5,
      fontSize: 22.5
    },
    specialKeyWidth: 38.5,
    specialKeyHeight: 38.5,
    space: 5,
    row1: {
      leading: 0,
      top: 0
    },
    row2: {
      leading: 19,
      top: 16
    },
    row3: {
      top: 16,
      leading: 51
    },
    area: {
      top: 11,
      leading: 3,
      trailing: 3,
      bottom: 4
    },
    returnWidth: 75,
    popUpOffset: {
      x: 4,
      y: 30
    }
  },
  "iphone-6s": {
    popUpChar: 40,
    popUpTop: 6,
    height: 218,
    lineHeight: 40,
    letterKey: {
      keyTop: 10,
      height: 42,
      width: 31.5,
      borderRadius: 5,
      fontSize: 23,
      top: 10
    },
    specialKeyWidth: 42,
    specialKeyHeight: 42,
    space: 6,
    row1: {
      leading: 0,
      top: 0
    },
    row2: {
      leading: 22,
      top: 12
    },
    row3: {
      top: 12,
      leading: 59
    },
    area: {
      top: 12,
      leading: 3,
      trailing: 3,
      bottom: 4
    },
    returnWidth: 87,
    popUpOffset: {
      x: 5,
      y: 32
    }
  },
  "iphone-6s-plus": {
    popUpChar: 38,
    popUpTop: 6,
    height: 226,
    lineHeight: 42,
    letterKey: {
      keyTop: 12,
      height: 45,
      width: 36,
      borderRadius: 5,
      fontSize: 24,
      top: 10
    },
    specialKeyWidth: 45,
    specialKeyHeight: 45,
    space: 5,
    row1: {
      leading: 0,
      top: 0
    },
    row2: {
      leading: 20,
      top: 11
    },
    row3: {
      top: 11,
      leading: 63
    },
    area: {
      top: 8,
      leading: 4,
      trailing: 4,
      bottom: 5
    },
    returnWidth: 97,
    popUpOffset: {
      x: 10,
      y: 38
    }
  },
  "ipad": {
    height: 313,
    lineHeight: 55,
    letterKey: {
      height: 55,
      width: 56,
      borderRadius: 5,
      fontSize: 23
    },
    specialKeyWidth: 56,
    specialKeyHeight: 55,
    space: 12,
    returnWidth: 106,
    row1: {
      leading: 0,
      top: 0
    },
    row2: {
      leading: 30,
      top: 9
    },
    row3: {
      leading: 68,
      top: 9
    },
    area: {
      top: 55,
      leading: 6,
      trailing: 6,
      bottom: 8
    }
  },
  "ipad-pro": {
    height: 378,
    lineHeight: 61,
    letterKey: {
      height: 61,
      width: 63,
      borderRadius: 5,
      fontSize: 23
    },
    space: 7,
    returnWidth: 120,
    specialKeyHeight: 61,
    specialKeyWidth: 93,
    row1: {
      leading: 111,
      top: 53
    },
    row2: {
      leading: 126,
      top: 7
    },
    row3: {
      leading: 161,
      top: 7
    },
    area: {
      top: 56,
      leading: 4,
      trailing: 4,
      bottom: 4
    }
  }
};

codeMap = {
  8: 'delete',
  9: 'tab',
  13: 'return',
  16: 'shift',
  20: 'caps',
  32: 'space',
  27: "dismiss",
  33: "!",
  34: "\"",
  35: "#",
  36: "$",
  37: "%",
  38: "&",
  39: "\'",
  40: "(",
  41: ")",
  42: "*",
  43: "+",
  44: ",",
  45: "-",
  47: "/",
  46: ".",
  48: "0",
  49: "!",
  50: "@",
  51: "#",
  52: "$",
  53: "%",
  54: "^",
  55: "&",
  56: "*",
  57: "(",
  48: ")",
  59: "_",
  60: "<",
  61: "=",
  62: ">",
  63: "?",
  64: "@",
  65: "A",
  66: "B",
  67: "C",
  68: "D",
  69: "E",
  70: "F",
  71: "G",
  72: "H",
  73: "I",
  74: "J",
  75: "K",
  76: "L",
  77: "M",
  78: "N",
  79: "O",
  80: "P",
  81: "Q",
  82: "R",
  83: "S",
  84: "T",
  85: "U",
  86: "V",
  87: "W",
  88: "X",
  89: "Y",
  90: "Z",
  91: 'cmd',
  219: "[",
  92: "\\",
  221: "]",
  94: "^",
  95: "_",
  96: "`",
  97: "a",
  98: "b",
  99: "c",
  100: "d",
  101: "e",
  102: "f",
  103: "g",
  104: "h",
  105: "i",
  106: "j",
  107: "k",
  108: "l",
  109: "m",
  110: "n",
  111: "o",
  112: "p",
  113: "q",
  114: "r",
  115: "s",
  116: "t",
  117: "u",
  118: "v",
  119: "w",
  120: "x",
  121: "y",
  122: "z",
  123: "{",
  124: "|",
  125: "}",
  126: "~",
  186: ":",
  187: "+",
  188: "<",
  190: ">",
  191: "?",
  189: "_",
  192: "~",
  219: "{",
  220: "\|",
  221: "}",
  222: "&rdquo;"
};

arrayOfCodes = Object.keys(codeMap);

letters = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", "z", "x", "c", "v", "b", "n", "m"];

numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "/", ":", ";", "(", ")", "$", "&", "@", "\"", ".", ",", "?", "!", "′"];

symbols = ["[", "]", "{", "}", "#", "%", "^", "*", "+", "=", "_", "\\", "|", "~", "<", ">", "€", "£", "¥", "•"];

exports.defaults.props = Object.keys(exports.defaults);

exports.create = function(obj) {
  var Delete, Dismiss, Emoji, Icon, IconWithState, Key, Letter, Numbers, Return, Shift, Space, SpecialKey, Tab, board, capitalizeKeys, colors, handleKeyColor, popUp, setup, specs, style;
  setup = ios.utils.setupComponent(obj, exports.defaults);
  style = {
    light: {
      backgroundColor: "#D1D5DA",
      color: "#000",
      specialKeyBG: "#ACB3BD",
      keyBG: "#F7F7F7",
      shadowY: ios.px(1),
      shadowColor: "#898B8F",
      returnBG: ios.color(setup.returnColor)
    },
    dark: {
      backgroundColor: "rgba(0,0,0,.7)",
      color: "#FFF",
      specialKeyBG: "rgba(67,67,67,.8)",
      keyBG: "rgba(105,105,105,.8)",
      shadowY: ios.px(1),
      shadowColor: "rgba(0,0,0,.4)",
      returnBG: ios.color(setup.returnColor)
    }
  };
  specs = device[ios.device.name];
  colors = style[setup.style];
  device;
  board = new ios.View({
    name: "Keyboard",
    superLayer: setup.superLayer,
    backgroundColor: style[setup.style].backgroundColor,
    y: ios.device.height,
    constraints: {
      leading: 0,
      trailing: 0,
      bottom: -1 * specs.height,
      height: specs.height
    }
  });
  ios.utils.bgBlur(board);
  board.output = function(obj) {
    if (board.target) {
      if (board.target.type === 'field') {
        board.target.active = false;
      }
    }
    board.target = obj;
    if (board.target) {
      if (board.target.type === 'field') {
        return board.target.active = true;
      }
    }
  };
  board.hidden = setup.hidden;
  if (board.hidden === false) {
    board.constraints.bottom = 0;
    ios.layout.set(board);
  }
  board.call = function() {
    board.y = ios.device.height;
    board.constraints.bottom = 0;
    if (board.hidden) {
      board.hidden = false;
      ios.layout.animate({
        target: board,
        time: .5,
        curve: 'ease-in-out'
      });
    }
    return board.bringToFront();
  };
  board.dismiss = function() {
    board.constraints.bottom = -1 * ios.pt(board.height);
    board.hidden = true;
    board.target.active = false;
    return ios.layout.animate({
      target: board,
      time: .5,
      curve: 'ease-in-out'
    });
  };
  board["delete"] = function() {
    var isSpace, layer, text;
    layer = "";
    if (board.target) {
      if (board.target.type === 'field') {
        layer = board.target.text;
      } else {
        layer = board.target;
      }
      isSpace = layer.html.slice(layer.html.length - 5, +(layer.html.length - 1) + 1 || 9e9);
      if (isSpace !== 'nbsp;') {
        text = layer.html.slice(0, -1);
        return layer.html = text;
      } else {
        text = layer.html.slice(0, -6);
        return layer.html = text;
      }
    }
  };
  board.capsLock = function() {
    board.isCapsLock = true;
    board.isCapital = true;
    board.keys.shift.icon.toggle('off');
    handleKeyColor(board.keys.shift);
    if (ios.device.name === 'ipad-pro') {
      board.keys.shiftalt.icon.toggle('off');
      return handleKeyColor(board.keys.shiftalt);
    }
  };
  board.output(setup.output);
  board.keysArray = [];
  board.keys = {};
  board.isCapital = setup.shift;
  board.area = new ios.View({
    name: ".area",
    superLayer: board,
    constraints: specs.area,
    backgroundColor: "transparent"
  });
  Key = function(obj) {
    var key;
    key = new ios.View({
      name: ".keys." + obj.name,
      constraints: obj.constraints,
      superLayer: board.area,
      borderRadius: ios.px(specs.letterKey.borderRadius),
      shadowY: colors.shadowY,
      shadowColor: colors.shadowColor
    });
    key.style.fontFamily = "-apple-system, Helvetica, Arial, sans-serif";
    key.on(Events.TouchStart, function(event) {
      return event.preventDefault();
    });
    return key;
  };
  Letter = function(obj) {
    var key;
    key = new Key(obj);
    key.backgroundColor = colors.keyBG;
    key.html = obj.letter;
    key.color = colors.color;
    key.style.textAlign = "center";
    key.style.lineHeight = ios.px(specs.lineHeight) + "px";
    key.style.fontSize = ios.px(specs.letterKey.fontSize) + "px";
    key.value = obj.letter;
    if (key.value === "space") {
      key.value = "&nbsp;";
    }
    if (ios.isPad()) {
      key.down = function() {
        key.backgroundColor = colors.specialKeyBG;
        if (board.target) {
          return ios.utils.write(board.target, key.value);
        }
      };
      key.up = function() {
        key.backgroundColor = colors.keyBG;
        if (board.isCapital && board.isCapsLock !== true) {
          board.isCapital = false;
          capitalizeKeys();
          board.keys.shift.up();
          if (ios.isPad()) {
            return board.keys.shiftalt.up();
          }
        }
      };
      key.on(Events.TouchStart, function() {
        return key.down();
      });
      key.on(Events.TouchEnd, function() {
        return key.up();
      });
    } else {
      if (key.value !== '&nbsp;') {
        key.down = function() {
          board.popUp.visible = true;
          board.bringToFront();
          board.popUp.bringToFront();
          board.popUp.midX = key.midX;
          board.popUp.maxY = key.maxY;
          board.popUp.text.html = key.value;
          if (board.target) {
            return ios.utils.write(board.target, key.value);
          }
        };
        key.up = function() {
          board.popUp.visible = false;
          if (board.isCapital && board.capsLock !== true) {
            board.isCapital = false;
            capitalizeKeys();
            return board.keys.shift.up();
          }
        };
        key.on(Events.TouchStart, function() {
          return key.down();
        });
        key.on(Events.TouchEnd, function() {
          return key.up();
        });
      } else {
        key.down = function() {
          key.backgroundColor = colors.specialKeyBG;
          if (board.target) {
            return ios.utils.write(board.target, key.value);
          }
        };
        key.up = function() {
          return key.backgroundColor = colors.keyBG;
        };
        key.on(Events.TouchStart, function() {
          return key.down();
        });
        key.on(Events.TouchEnd, function() {
          return key.up();
        });
      }
    }
    return key;
  };
  SpecialKey = function(obj) {
    var key;
    key = new Key(obj);
    key.backgroundColor = colors.specialKeyBG;
    key.color = colors.color;
    key.style.textAlign = "center";
    if (ios.device.name === 'ipad-pro') {
      key.style.fontSize = ios.px(18) + "px";
    } else {
      key.style.fontSize = ios.px(16) + "px";
    }
    return key;
  };
  Icon = function(obj) {
    var icon;
    icon = new ios.View({
      name: 'icon',
      backgroundColor: "transparent",
      superLayer: obj.superLayer,
      constraints: {
        align: 'center'
      }
    });
    icon.props = {
      height: obj.icon.height,
      width: obj.icon.width,
      html: obj.icon.svg
    };
    ios.utils.changeFill(icon, colors.color);
    return icon;
  };
  IconWithState = function(obj) {
    var icon;
    icon = new ios.View({
      name: 'icon',
      backgroundColor: "transparent",
      superLayer: obj.superLayer,
      constraints: {
        align: 'center'
      }
    });
    icon.toggle = function(state) {
      if (state === void 0) {
        if (icon.state === 'on') {
          state = 'off';
        } else {
          state = 'on';
        }
      }
      if (state === "on") {
        if (ios.device.name !== 'ipad-pro') {
          icon.html = obj.on.svg;
          icon.width = obj.on.width;
          icon.height = obj.on.height;
        }
        icon.state = 'on';
      } else {
        if (ios.device.name !== 'ipad-pro') {
          icon.html = obj.off.svg;
          icon.width = obj.on.width;
          icon.height = obj.on.height;
        }
        icon.state = 'off';
      }
      return ios.utils.changeFill(icon, colors.color);
    };
    if (obj.state) {
      icon.toggle('on');
    } else {
      icon.toggle('off');
    }
    return icon;
  };
  capitalizeKeys = function() {
    var j, key, len, ref, results;
    ref = board.keysArray;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      key = ref[j];
      if (board.isCapital) {
        if (key.html.length === 1 && key.html.match(/[a-z]/i)) {
          key.html = key.html.toUpperCase();
          key.value = key.html;
        }
        if (key.alt) {
          key.alt.destroy();
          key.alt = void 0;
        }
        if (key.height > ios.px(46)) {
          key.style.lineHeight = ios.px(specs.letterKey.height) + 'px';
          key.style.fontSize = ios.px(23) + 'px';
        } else {
          if (ios.device.name === 'ipad-pro') {
            key.style.lineHeight = ios.px(46) + 'px';
          } else {
            key.style.lineHeight = ios.px(specs.lineHeight) + 'px';
          }
          key.style.fontSize = ios.px(20) + 'px';
        }
        results.push(key.value = key.html);
      } else {
        if (key.html.length === 1 && key.html.match(/[a-z]/i)) {
          key.html = key.html.toLowerCase();
          results.push(key.value = key.html);
        } else {
          if (key.alt === void 0) {
            key.alt = new ios.Text({
              text: "",
              superLayer: key,
              color: colors.color,
              constraints: {
                align: "horizontal",
                bottom: 4
              },
              fontSize: specs.letterKey.fontSize
            });
            if (board.topRow) {
              if (board.topRow.indexOf(key) !== -1) {
                key.style.lineHeight = ios.px(23) + 'px';
                key.style.fontSize = ios.px(16) + 'px';
                key.alt.style.fontSize = ios.px(16) + 'px';
              } else {
                key.style.lineHeight = ios.px(36) + 'px';
                key.style.fontSize = ios.px(20) + 'px';
                key.alt.style.fontSize = ios.px(20) + 'px';
                key.alt.constraints.bottom = 8;
              }
            }
            switch (key.value) {
              case "&lt;":
                key.alt.html = ".";
                break;
              case "&gt;":
                key.alt.html = ",";
                break;
              case "<":
                key.alt.html = ".";
                break;
              case ">":
                key.alt.html = ",";
                break;
              case "?":
                key.alt.html = ".";
                break;
              case "{":
                key.alt.html = "[";
                break;
              case "}":
                key.alt.html = "}";
                break;
              case "\|":
                key.alt.html = "\\";
                break;
              case "~":
                key.alt.html = "`";
                break;
              case "!":
                key.alt.html = ".";
                break;
              case "@":
                key.alt.html = "2";
                break;
              case "#":
                key.alt.html = "3";
                break;
              case "$":
                key.alt.html = "4";
                break;
              case "%":
                key.alt.html = "5";
                break;
              case "^":
                key.alt.html = "6";
                break;
              case "&amp;":
                key.alt.html = "7";
                break;
              case "&":
                key.alt.html = "7";
                break;
              case "*":
                key.alt.html = "8";
                break;
              case "(":
                key.alt.html = "9";
                break;
              case ")":
                key.alt.html = "0";
                break;
              case "_":
                key.alt.html = "-";
                break;
              case "+":
                key.alt.html = "=";
                break;
              default:
                key.alt.html = "&prime;";
            }
            ios.layout.set(key.alt);
            if (ios.device.name === 'ipad-pro' && key.value === '!') {
              key.alt.html = '1';
            }
            if (ios.device.name === 'ipad-pro' && key.value === '?') {
              key.alt.html = '/';
            }
            if (ios.device.name === 'ipad-pro' && key.value === ':') {
              key.alt.html = ';';
            }
            if (ios.device.name === 'ipad-pro' && key.value === '&rdquo;') {
              key.alt.html = '&prime;';
            }
            results.push(key.value = key.alt.html);
          } else {
            results.push(void 0);
          }
        }
      }
    }
    return results;
  };
  handleKeyColor = function(key) {
    if (ios.isPhone) {
      if (key.icon.state === 'on') {
        return key.backgroundColor = colors.keyBG;
      } else {
        return key.backgroundColor = colors.specialKeyBG;
      }
    }
  };
  Space = function(obj) {
    var key;
    key = new Letter(obj);
    key.html = 'space';
    key.backgroundColor = colors.keyBG;
    key.style.lineHeight = ios.px(specs.specialKeyHeight) + "px";
    key.style.fontSize = ios.px(16) + 'px';
    return key;
  };
  Shift = function(obj) {
    var key;
    key = new SpecialKey(obj);
    key.icon = new IconWithState({
      superLayer: key,
      state: obj.shift,
      on: ios.utils.svg(ios.assets.shift.on),
      off: ios.utils.svg(ios.assets.shift.off)
    });
    handleKeyColor(key);
    key.on(Events.TouchEnd, function() {
      this.icon.toggle();
      handleKeyColor(key);
      if (this.icon.state === 'on') {
        board.isCapital = true;
      } else {
        board.isCapital = false;
      }
      return capitalizeKeys();
    });
    key.down = function() {
      key.icon.toggle('on');
      handleKeyColor(key);
      board.isCapital = true;
      return capitalizeKeys();
    };
    key.up = function() {
      key.icon.toggle('off');
      handleKeyColor(key);
      board.isCapital = false;
      return capitalizeKeys();
    };
    ios.layout.set(key.icon);
    if (ios.isPad()) {
      key.on(Events.TouchEnd, function() {
        if (this.icon.state === 'on') {
          board.keys.shift.icon.toggle('on');
          board.keys.shiftalt.icon.toggle('on');
        } else {
          board.keys.shift.icon.toggle('off');
          board.keys.shiftalt.icon.toggle('off');
        }
        handleKeyColor(board.keys.shift);
        return handleKeyColor(board.keys.shiftalt);
      });
    }
    return key;
  };
  Delete = function(obj) {
    var key;
    key = new SpecialKey(obj);
    key.icon = new IconWithState({
      superLayer: key,
      on: ios.utils.svg(ios.assets["delete"].on),
      off: ios.utils.svg(ios.assets["delete"].off)
    });
    key.fire = function() {
      return board["delete"]();
    };
    key.down = function() {
      key.icon.toggle('on');
      handleKeyColor(key);
      return key.fire();
    };
    key.up = function() {
      key.icon.toggle('off');
      return handleKeyColor(key);
    };
    key.on(Events.TouchStart, function() {
      return key.down();
    });
    key.on(Events.TouchEnd, function() {
      return key.up();
    });
    return key;
  };
  Numbers = function(obj) {
    var key;
    key = new SpecialKey(obj);
    if (ios.isPhone()) {
      key.html = '123';
    } else {
      key.html = '.?123';
    }
    key.style.lineHeight = ios.px(specs.specialKeyHeight) + "px";
    return key;
  };
  Emoji = function(obj) {
    var key;
    key = new SpecialKey(obj);
    key.icon = new Icon({
      superLayer: key,
      icon: ios.utils.svg(ios.assets.emoji)
    });
    return key;
  };
  Return = function(obj) {
    var key;
    key = new SpecialKey(obj);
    key.backgroundColor = colors.returnBG;
    key.html = setup.returnText;
    key.style.lineHeight = ios.px(specs.specialKeyHeight) + "px";
    key.color = ios.utils.autoColor(colors.returnBG);
    key.down = function() {
      var nothingHappens;
      return nothingHappens = true;
    };
    key.up = function() {
      board.dismiss();
      if (board.target) {
        if (board.target.parent) {
          return board.target.parent.active = false;
        }
      }
    };
    key.on(Events.TouchEnd, function() {
      return key.down();
    });
    key.on(Events.TouchStart, function() {
      return key.up();
    });
    return key;
  };
  Dismiss = function(obj) {
    var key;
    key = new SpecialKey(obj);
    key.icon = new Icon({
      superLayer: key,
      icon: ios.utils.svg(ios.assets.keyboard)
    });
    key.icon.scale = .8;
    key.icon.constraints = {
      bottom: 12,
      trailing: 12
    };
    ios.layout.set(key.icon);
    key.down = function() {
      return board.dismiss();
    };
    key.up = function() {
      var nothingHappens;
      return nothingHappens = false;
    };
    key.on(Events.TouchEnd, function() {
      return key.down();
    });
    return key;
  };
  Tab = function(obj) {
    var key;
    key = new SpecialKey(obj);
    key.html = 'tab';
    key.style.lineHeight = ios.px(70) + 'px';
    key.style.textAlign = 'left';
    key.style.paddingLeft = ios.px(12) + 'px';
    return key;
  };
  board.switchLetters = function() {
    var i, j, k, key, l, len, len1, row1Break, row2Break, topKey, topLetters;
    row1Break = 10;
    row2Break = 19;
    if (ios.isPad()) {
      letters.push('!');
      letters.push('?');
    }
    if (ios.device.name === "ipad-pro") {
      letters = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "{", "}", "\|", "a", "s", "d", "f", "g", "h", "j", "k", "l", ":", "&rdquo;", "z", "x", "c", "v", "b", "n", "m", "<", ">", "?"];
      topLetters = ["~", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "+"];
      row1Break = 13;
      row2Break = 24;
    }
    for (i = j = 0, len = letters.length; j < len; i = ++j) {
      l = letters[i];
      key = new Letter({
        name: l,
        constraints: {
          height: specs.letterKey.height,
          width: specs.letterKey.width
        },
        letter: l
      });
      if (l === 'w' || l === 'r' || l === 'y' || l === 'i' || l === 'p') {
        key.constraints.width = key.constraints.width + 1;
      }
      board.keys[l] = key;
      board.keysArray.push(key);
      if (i === 0) {
        key.constraints.leading = specs.row1.leading;
        key.constraints.top = specs.row1.top;
      }
      if (i > 0 && i < row1Break) {
        key.constraints.leading = [board.keysArray[i - 1], specs.space];
        key.constraints.top = specs.row1.top;
      }
      if (i === row1Break) {
        key.constraints.leading = specs.row2.leading;
        key.constraints.top = [board.keysArray[0], specs.row2.top];
      }
      if (i > row1Break && i < row2Break) {
        key.constraints.leading = [board.keysArray[i - 1], specs.space];
        key.constraints.top = [board.keysArray[0], specs.row2.top];
      }
      if (i === row2Break) {
        key.constraints.leading = specs.row3.leading;
        key.constraints.top = [board.keysArray[row1Break], specs.row3.top];
      }
      if (i > row2Break) {
        key.constraints.leading = [board.keysArray[i - 1], specs.space];
        key.constraints.top = [board.keysArray[row1Break], specs.row3.top];
      }
      ios.layout.set(key);
    }
    board.keys.shift = new Shift({
      name: "shift",
      shift: setup.shift,
      constraints: {
        height: specs.specialKeyHeight,
        width: specs.specialKeyWidth,
        bottomEdges: board.keys.z
      }
    });
    board.keys["delete"] = new Delete({
      name: "delete",
      constraints: {
        height: specs.specialKeyHeight,
        width: specs.specialKeyWidth,
        bottomEdges: board.keys.z,
        trailing: 0
      }
    });
    board.keys.numbers = new Numbers({
      name: "numbers",
      constraints: {
        height: specs.specialKeyHeight,
        width: specs.specialKeyWidth,
        bottom: 0,
        leading: 0
      }
    });
    board.keys.emoji = new Emoji({
      name: "emoji",
      constraints: {
        height: specs.specialKeyHeight,
        width: specs.specialKeyWidth,
        leading: [board.keys.numbers, specs.space],
        bottom: 0
      }
    });
    board.keys["return"] = new Return({
      name: "return",
      constraints: {
        bottom: 0,
        trailing: 0,
        width: specs.returnWidth,
        height: specs.specialKeyHeight
      }
    });
    board.keys.space = new Space({
      name: "space",
      letter: "space",
      constraints: {
        leading: [board.keys.emoji, specs.space],
        trailing: [board.keys["return"], specs.space],
        bottom: 0,
        height: specs.specialKeyHeight
      }
    });
    if (ios.isPad()) {
      board.keys["return"].constraints.bottom = void 0;
      board.keys["return"].constraints.bottomEdges = board.keysArray[row1Break];
      board.keys["delete"].constraints.top = 0;
      board.keys["delete"].constraints.bottomEdges = void 0;
      board.keys["delete"].constraints.width = 61;
      board.keys.shiftalt = new Shift({
        name: "shiftalt",
        shift: setup.shift,
        constraints: {
          height: specs.specialKeyHeight,
          width: 76,
          bottomEdges: board.keys.z,
          trailing: 0
        }
      });
      board.keys.dismiss = new Dismiss({
        name: "dismiss",
        constraints: {
          height: specs.specialKeyHeight,
          width: specs.specialKeyWidth,
          bottom: 0,
          trailing: 0
        }
      });
      board.keys.numbersalt = new Numbers({
        name: "numbersalt",
        constraints: {
          height: specs.specialKeyHeight,
          width: 93,
          bottom: 0,
          trailing: [board.keys.dismiss, specs.space]
        }
      });
      board.keys.space.html = "";
      board.keys.space.constraints.trailing = [board.keys.numbersalt, specs.space];
      ios.layout.set();
    }
    board.topRow = [];
    if (ios.device.name === 'ipad-pro') {
      for (i = k = 0, len1 = topLetters.length; k < len1; i = ++k) {
        l = topLetters[i];
        topKey = new Letter({
          letter: l,
          name: l,
          constraints: {
            height: 46,
            width: 63,
            top: 0
          }
        });
        if (i === 0) {
          topKey.constraints.leading = 0;
        } else {
          topKey.constraints.leading = [board.topRow[i - 1], specs.space];
        }
        topKey.style.lineHeight = ios.px(46) + 'px';
        ios.layout.set(topKey);
        board.topRow.push(topKey);
        board.keysArray.push(topKey);
        board.keys[l] = topKey;
      }
      board.keys["delete"].icon.destroy();
      board.keys["delete"].html = 'delete';
      board.keys["delete"].style.lineHeight = ios.px(53) + 'px';
      board.keys["delete"].style.textAlign = 'right';
      board.keys["delete"].style.paddingRight = ios.px(12) + 'px';
      board.keys["delete"].constraints = {
        top: 0,
        trailing: 0,
        height: 46,
        width: 106
      };
      board.keys.shift.icon.destroy();
      board.keys.shift.html = 'shift';
      board.keys.shift.style.lineHeight = ios.px(70) + 'px';
      board.keys.shift.style.textAlign = 'left';
      board.keys.shift.style.paddingLeft = ios.px(12) + 'px';
      board.keys.shift.constraints.width = 154;
      board.keys.shiftalt.icon.destroy();
      board.keys.shiftalt.html = 'shift';
      board.keys.shiftalt.style.lineHeight = ios.px(70) + 'px';
      board.keys.shiftalt.style.textAlign = 'right';
      board.keys.shiftalt.style.paddingRight = ios.px(12) + 'px';
      board.keys.shiftalt.constraints.width = 155;
      board.keys.emoji.icon.constraints = {
        leading: 15,
        bottom: 11
      };
      board.keys.emoji.constraints = {
        width: 144,
        height: 61,
        leading: 0,
        bottom: 0
      };
      ios.layout.set();
      board.keys.numbersalt.constraints.width = 93;
      board.keys.dismiss.constraints.width = 93;
      board.keys.com = new Letter({
        name: '.com',
        letter: '.com',
        constraints: {
          height: specs.letterKey.height,
          width: specs.letterKey.width,
          bottom: 0,
          trailing: [board.keys.numbersalt, specs.space]
        }
      });
      board.keys.com.style.fontSize = ios.px(16) + 'px';
      board.keys.numbers.constraints = {
        width: 143,
        height: 61,
        leading: [board.keys.emoji, specs.space]
      };
      board.keys.numbers.style.lineHeight = ios.px(70) + 'px';
      board.keys.numbers.style.textAlign = 'left';
      board.keys.numbers.style.paddingLeft = ios.px(12) + 'px';
      board.keys["return"].style.lineHeight = ios.px(70) + 'px';
      board.keys["return"].style.textAlign = 'right';
      board.keys["return"].style.paddingRight = ios.px(12) + 'px';
      board.keys.space.constraints.leading = [board.keys.numbers, specs.space];
      board.keys.space.constraints.trailing = [board.keys.com, specs.space];
      board.keys.caps = new Shift({
        name: 'caps',
        caps: true,
        constraints: {
          height: specs.specialKeyHeight,
          width: 119,
          bottomEdges: board.keysArray[row1Break]
        }
      });
      board.keys.caps.icon.destroy();
      board.keys.caps.html = 'caps lock';
      board.keys.caps.style.lineHeight = ios.px(70) + 'px';
      board.keys.caps.style.textAlign = 'left';
      board.keys.caps.style.paddingLeft = ios.px(12) + 'px';
      board.keys.caps.down = function() {
        if (board.isCapsLock) {
          return board.isCapsLock = false;
        } else {
          return board.capsLock();
        }
      };
      board.keys.caps.on(Events.TouchEnd, function() {
        return board.keys.caps.down();
      });
      board.keys.caps.up = function() {
        var nothingHappens;
        return nothingHappens = true;
      };
      board.keys.tab = new Tab({
        name: 'tab',
        constraints: {
          height: specs.specialKeyHeight,
          width: 106,
          bottomEdges: board.keysArray[0]
        }
      });
      return ios.layout.set();
    }
  };
  if (ios.isPhone()) {
    popUp = ios.utils.svg(ios.assets.keyPopUp[setup.style][ios.device.name]);
    board.popUp = new Layer({
      height: popUp.height,
      width: popUp.width,
      backgroundColor: 'transparent',
      name: '.popUp',
      superLayer: board.area,
      visible: false
    });
    board.popUp.svg = new Layer({
      html: popUp.svg,
      height: popUp.height,
      width: popUp.width,
      superLayer: board.popUp,
      name: '.svg',
      backgroundColor: 'transparent'
    });
    board.popUp.text = new ios.Text({
      text: 'A',
      superLayer: board.popUp,
      fontSize: specs.popUpChar,
      fontWeight: 300,
      color: colors.color,
      textAlign: 'center',
      constraints: {
        align: 'horizontal',
        top: specs.popUpTop,
        width: ios.pt(popUp.width)
      }
    });
    board.popUp.center();
    switch (ios.device.name) {
      case 'iphone-6s-plus':
        board.popUp.width = board.popUp.width - 18;
        board.popUp.height = board.popUp.height - 24;
        board.popUp.svg.x = ios.px(-3);
        board.popUp.svg.y = ios.px(-3);
        break;
      case 'iphone-6s':
        board.popUp.width = board.popUp.width - 12;
        board.popUp.height = board.popUp.height - 12;
        board.popUp.svg.x = ios.px(-3);
        board.popUp.svg.y = ios.px(-2);
        break;
      case 'iphone-5':
        board.popUp.width = board.popUp.width - 12;
        board.popUp.height = board.popUp.height - 12;
        board.popUp.svg.x = ios.px(-3);
        board.popUp.svg.y = ios.px(-2);
    }
    capitalizeKeys();
  }
  board["switch"] = function(state) {
    switch (state) {
      case "letters":
        return board.switchLetters();
    }
  };
  board["switch"]("letters");
  document.addEventListener('keydown', function(e) {
    var key;
    if (arrayOfCodes.indexOf(e.keyCode.toString()) !== -1) {
      key = board.keys[codeMap[e.keyCode].toLowerCase()];
      if (key) {
        key.down();
      }
      if (ios.isPad()) {
        if (key === board.keys.shift || key === board.keys.shiftalt) {
          board.keys.shift.down();
          board.keys.shiftalt.icon.toggle('on');
          return handleKeyColor(board.keys.shiftalt);
        }
      }
    }
  });
  document.addEventListener('keyup', function(e) {
    var key;
    if (arrayOfCodes.indexOf(e.keyCode.toString()) !== -1) {
      key = board.keys[codeMap[e.keyCode].toLowerCase()];
      if (key) {
        key.up();
      }
      if (ios.isPad()) {
        if (key === board.keys.shift || key === board.keys.shiftalt) {
          board.keys.shift.up();
          board.keys.shiftalt.icon.toggle('off');
          return handleKeyColor(board.keys.shiftalt);
        }
      }
    }
  });
  capitalizeKeys();
  return board;
};


},{"ios-kit":"ios-kit"}],"ios-kit-layout":[function(require,module,exports){
var ios, layout;

ios = require('ios-kit');

exports.defaults = {
  animations: {
    target: void 0,
    constraints: void 0,
    curve: "ease-in-out",
    curveOptions: void 0,
    time: 1,
    delay: 0,
    repeat: void 0,
    colorModel: void 0,
    stagger: void 0,
    fadeOut: false,
    fadeIn: false
  }
};

layout = function(array) {
  var blueprint, i, index, j, k, l, layer, len, len1, len2, newConstraint, props, ref, ref1, setup, targetLayers;
  setup = {};
  targetLayers = [];
  blueprint = [];
  if (array) {
    ref = Object.keys(exports.defaults.animations);
    for (j = 0, len = ref.length; j < len; j++) {
      i = ref[j];
      if (array[i]) {
        setup[i] = array[i];
      } else {
        setup[i] = exports.defaults.animations[i];
      }
    }
  }
  if (setup.target) {
    if (setup.target.length) {
      targetLayers = setup.target;
    } else {
      targetLayers.push(setup.target);
    }
  } else {
    targetLayers = Framer.CurrentContext.layers;
  }
  if (setup.target) {
    if (setup.constraints) {
      ref1 = Object.keys(setup.constraints);
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        newConstraint = ref1[k];
        setup.target.constraints[newConstraint] = setup.constraints[newConstraint];
      }
    }
  }
  for (index = l = 0, len2 = targetLayers.length; l < len2; index = ++l) {
    layer = targetLayers[index];
    layer.calculatedPosition = {};
    if (layer.constraints) {
      props = {};
      layer.superFrame = {};
      if (layer.superLayer) {
        layer.superFrame.height = layer.superLayer.height;
        layer.superFrame.width = layer.superLayer.width;
      } else {
        layer.superFrame.height = ios.device.height;
        layer.superFrame.width = ios.device.width;
      }
      if (layer.constraints.leading !== void 0 && layer.constraints.trailing !== void 0) {
        layer.constraints.autoWidth = {};
      }
      if (layer.constraints.top !== void 0 && layer.constraints.bottom !== void 0) {
        layer.constraints.autoHeight = {};
      }
      if (layer.constraints.width !== void 0) {
        props.width = ios.utils.px(layer.constraints.width);
      } else {
        props.width = layer.width;
      }
      if (layer.constraints.height !== void 0) {
        props.height = ios.utils.px(layer.constraints.height);
      } else {
        props.height = layer.height;
      }
      if (layer.constraints.leading !== void 0) {
        if (layer.constraints.leading === parseInt(layer.constraints.leading, 10)) {
          props.x = ios.utils.px(layer.constraints.leading);
        } else {
          if (layer.constraints.leading.length === void 0) {
            props.x = layer.constraints.leading.calculatedPosition.x + layer.constraints.leading.calculatedPosition.width;
          } else {
            props.x = layer.constraints.leading[0].calculatedPosition.x + layer.constraints.leading[0].calculatedPosition.width + ios.utils.px(layer.constraints.leading[1]);
          }
        }
      }
      if (layer.constraints.autoWidth !== void 0) {
        layer.constraints.autoWidth.startX = props.x;
      }
      if (layer.constraints.trailing !== void 0) {
        if (layer.constraints.trailing === parseInt(layer.constraints.trailing, 10)) {
          props.x = layer.superFrame.width - ios.utils.px(layer.constraints.trailing) - props.width;
        } else {
          if (layer.constraints.trailing.length === void 0) {
            props.x = layer.constraints.trailing.calculatedPosition.x - props.width;
          } else {
            props.x = layer.constraints.trailing[0].calculatedPosition.x - ios.utils.px(layer.constraints.trailing[1]) - props.width;
          }
        }
      }
      if (layer.constraints.autoWidth !== void 0) {
        layer.constraints.autoWidth.calculatedPositionX = props.x;
        props.x = layer.constraints.autoWidth.startX;
        props.width = layer.constraints.autoWidth.calculatedPositionX - layer.constraints.autoWidth.startX + props.width;
      }
      if (layer.constraints.top !== void 0) {
        if (layer.constraints.top === parseInt(layer.constraints.top, 10)) {
          props.y = ios.utils.px(layer.constraints.top);
        } else {
          if (layer.constraints.top.length === void 0) {
            props.y = layer.constraints.top.calculatedPosition.y + layer.constraints.top.calculatedPosition.height;
          } else {
            props.y = layer.constraints.top[0].calculatedPosition.y + layer.constraints.top[0].calculatedPosition.height + ios.utils.px(layer.constraints.top[1]);
          }
        }
      }
      if (layer.constraints.autoHeight !== void 0) {
        layer.constraints.autoHeight.startY = props.y;
      }
      if (layer.constraints.bottom !== void 0) {
        if (layer.constraints.bottom === parseInt(layer.constraints.bottom, 10)) {
          props.y = layer.superFrame.height - ios.utils.px(layer.constraints.bottom) - props.height;
        } else {
          if (layer.constraints.bottom.length === void 0) {
            props.y = layer.constraints.bottom.calculatedPosition.y - props.height;
          } else {
            props.y = layer.constraints.bottom[0].calculatedPosition.y - ios.utils.px(layer.constraints.bottom[1]) - props.height;
          }
        }
      }
      if (layer.constraints.autoHeight !== void 0) {
        layer.constraints.autoHeight.calculatedPositionY = props.y;
        props.height = layer.constraints.autoHeight.calculatedPositionY - layer.constraints.autoHeight.startY + props.height;
        props.y = layer.constraints.autoHeight.startY;
      }
      if (layer.constraints.align !== void 0) {
        if (layer.constraints.align === "horizontal") {
          props.x = layer.superFrame.width / 2 - props.width / 2;
        }
        if (layer.constraints.align === "vertical") {
          props.y = layer.superFrame.height / 2 - props.height / 2;
        }
        if (layer.constraints.align === "center") {
          props.x = layer.superFrame.width / 2 - props.width / 2;
          props.y = layer.superFrame.height / 2 - props.height / 2;
        }
      }
      if (layer.constraints.horizontalCenter !== void 0) {
        props.x = layer.constraints.horizontalCenter.calculatedPosition.x + (layer.constraints.horizontalCenter.calculatedPosition.width - props.width) / 2;
      }
      if (layer.constraints.verticalCenter !== void 0) {
        props.y = layer.constraints.verticalCenter.calculatedPosition.y + (layer.constraints.verticalCenter.calculatedPosition.height - props.height) / 2;
      }
      if (layer.constraints.center !== void 0) {
        props.x = layer.constraints.center.calculatedPosition.x + (layer.constraints.center.calculatedPosition.width - props.width) / 2;
        props.y = layer.constraints.center.calculatedPosition.y + (layer.constraints.center.calculatedPosition.height - props.height) / 2;
      }
      if (layer.constraints.leadingEdges !== void 0) {
        props.x = layer.constraints.leadingEdges.calculatedPosition.x;
      }
      if (layer.constraints.trailingEdges !== void 0) {
        props.x = layer.constraints.trailingEdges.calculatedPosition.x - props.width + layer.constraints.trailingEdges.calculatedPosition.width;
      }
      if (layer.constraints.topEdges !== void 0) {
        props.y = layer.constraints.topEdges.calculatedPosition.y;
      }
      if (layer.constraints.bottomEdges !== void 0) {
        props.y = layer.constraints.bottomEdges.calculatedPosition.y - props.height + layer.constraints.bottomEdges.calculatedPosition.height;
      }
      layer.calculatedPosition = props;
    } else {
      layer.calculatedPosition = layer.props;
    }
    blueprint.push(layer);
  }
  return blueprint;
};

exports.set = function(array) {
  var blueprint, i, index, j, k, key, layer, len, len1, props, ref, results, setup;
  setup = {};
  props = {};
  if (array) {
    ref = Object.keys(exports.defaults.animations);
    for (j = 0, len = ref.length; j < len; j++) {
      i = ref[j];
      if (array[i]) {
        setup[i] = array[i];
      } else {
        setup[i] = exports.defaults.animations[i];
      }
    }
  }
  blueprint = layout(array);
  results = [];
  for (index = k = 0, len1 = blueprint.length; k < len1; index = ++k) {
    layer = blueprint[index];
    results.push((function() {
      var l, len2, ref1, results1;
      ref1 = Object.keys(layer.calculatedPosition);
      results1 = [];
      for (l = 0, len2 = ref1.length; l < len2; l++) {
        key = ref1[l];
        results1.push(layer[key] = layer.calculatedPosition[key]);
      }
      return results1;
    })());
  }
  return results;
};

exports.animate = function(array) {
  var blueprint, delay, i, index, j, k, layer, len, len1, props, ref, results, setup, stag;
  setup = {};
  props = {};
  if (array) {
    ref = Object.keys(exports.defaults.animations);
    for (j = 0, len = ref.length; j < len; j++) {
      i = ref[j];
      if (array[i]) {
        setup[i] = array[i];
      } else {
        setup[i] = exports.defaults.animations[i];
      }
    }
  }
  blueprint = layout(array);
  results = [];
  for (index = k = 0, len1 = blueprint.length; k < len1; index = ++k) {
    layer = blueprint[index];
    delay = setup.delay;
    if (setup.stagger) {
      stag = setup.stagger;
      delay = (index * stag) + delay;
    }
    if (setup.fadeOut) {
      if (layer === setup.fadeOut) {
        layer.calculatedPosition.opacity = 0;
      }
    }
    if (setup.fadeIn) {
      layer.calculatedPosition.opacity = 1;
    }
    layer.animate({
      properties: layer.calculatedPosition,
      time: setup.time,
      delay: delay,
      curve: setup.curve,
      repeat: setup.repeat,
      colorModel: setup.colorModel,
      curveOptions: setup.curveOptions
    });
    results.push(layer.calculatedPosition = props);
  }
  return results;
};


},{"ios-kit":"ios-kit"}],"ios-kit-library":[function(require,module,exports){
var ios, layer;

ios = require("ios-kit");

layer = new Layer;

exports.layerProps = Object.keys(layer.props);

exports.layerProps.push("superLayer");

exports.layerProps.push("constraints");

exports.layerStyles = Object.keys(layer.style);

layer.destroy();

exports.assets = {
  sheetTip: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='27px' height='13px' viewBox='0 0 27 13' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 39.1 (31720) - http://www.bohemiancoding.com/sketch --> <title>Triangle</title> <desc>Created with Sketch.</desc> <defs></defs> <g id='iOS-Kit' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'> <g id='Navigation-Bar-Copy' transform='translate(-2634.000000, -124.000000)' fill='#FFFFFF'> <path d='M2644.71916,125.883834 C2646.25498,124.291136 2648.74585,124.291992 2650.28084,125.883834 L2661,137 L2634,137 L2644.71916,125.883834 Z' id='Triangle'></path> </g> </g> </svg>",
  bluetooth: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='7px' height='13px' viewBox='0 0 8 15' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 3.6.1 (26313) - http://www.bohemiancoding.com/sketch --> <title>Bluetooth</title> <desc>Created with Sketch.</desc> <defs></defs> <g id='Status-Icons-(White)' transform='translate(-137.000000, 0.000000)' fill='#FFF'> <path d='M140.5,14.5 L145,10.25 L141.8,7.5 L145,4.75 L140.5,0.5 L140.5,6.07142857 L137.8,3.75 L137,4.5 L140.258333,7.375 L137,10.25 L137.8,11 L140.5,8.67857143 L140.5,14.5 Z M141.5,3 L143.366667,4.75 L141.5,6.25 L141.5,3 Z M141.5,8.5 L143.366667,10.25 L141.5,12 L141.5,8.5 Z' id='Bluetooth'></path> </g> </svg>",
  batteryHigh: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='25px' height='10px' viewBox='0 0 25 10' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 3.7.2 (28276) - http://www.bohemiancoding.com/sketch --> <title>Battery</title> <desc>Created with Sketch.</desc> <defs></defs> <g id='Symbols' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'> <g id='Status-Bar/Black/100%' transform='translate(-345.000000, -5.000000)' fill='#030303'> <path d='M346.493713,5.5 C345.668758,5.5 345,6.16802155 345,7.00530324 L345,13.4946968 C345,14.3260528 345.67338,15 346.493713,15 L366.006287,15 C366.831242,15 367.5,14.3319784 367.5,13.4946968 L367.5,7.00530324 C367.5,6.17394722 366.82662,5.5 366.006287,5.5 L346.493713,5.5 Z M368,8.5 L368,12 L368.75,12 C369.164214,12 369.5,11.6644053 369.5,11.25774 L369.5,9.24225998 C369.5,8.83232111 369.167101,8.5 368.75,8.5 L368,8.5 Z M346.508152,6 C345.951365,6 345.5,6.45699692 345.5,7.00844055 L345.5,13.4915594 C345.5,14.0485058 345.949058,14.5 346.508152,14.5 L365.991848,14.5 C366.548635,14.5 367,14.0430031 367,13.4915594 L367,7.00844055 C367,6.45149422 366.550942,6 365.991848,6 L346.508152,6 Z M346.506744,6.5 C346.226877,6.5 346,6.71637201 346,6.99209595 L346,13.5079041 C346,13.7796811 346.230225,14 346.506744,14 L365.993256,14 C366.273123,14 366.5,13.783628 366.5,13.5079041 L366.5,6.99209595 C366.5,6.72031886 366.269775,6.5 365.993256,6.5 L346.506744,6.5 Z' id='Battery'></path> </g> </g> </svg>",
  batteryMid: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='25px' height='10px' viewBox='0 0 25 10' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 3.7.2 (28276) - http://www.bohemiancoding.com/sketch --> <title>Battery</title> <desc>Created with Sketch.</desc> <defs></defs> <g id='Symbols' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'> <g id='Status-Bar/Black/Low-Power' transform='translate(-345.000000, -5.000000)' fill='#030303'> <path d='M346.493713,5.5 C345.668758,5.5 345,6.16802155 345,7.00530324 L345,13.4946968 C345,14.3260528 345.67338,15 346.493713,15 L366.006287,15 C366.831242,15 367.5,14.3319784 367.5,13.4946968 L367.5,7.00530324 C367.5,6.17394722 366.82662,5.5 366.006287,5.5 L346.493713,5.5 Z M368,8.5 L368,12 L368.75,12 C369.164214,12 369.5,11.6644053 369.5,11.25774 L369.5,9.24225998 C369.5,8.83232111 369.167101,8.5 368.75,8.5 L368,8.5 Z M346.508152,6 C345.951365,6 345.5,6.45699692 345.5,7.00844055 L345.5,13.4915594 C345.5,14.0485058 345.949058,14.5 346.508152,14.5 L365.991848,14.5 C366.548635,14.5 367,14.0430031 367,13.4915594 L367,7.00844055 C367,6.45149422 366.550942,6 365.991848,6 L346.508152,6 Z M346.50965,6.5 C346.228178,6.5 346,6.71637201 346,6.99209595 L346,13.5079041 C346,13.7796811 346.227653,14 346.50965,14 L356,14 L356,6.5 L346.50965,6.5 Z' id='Battery'></path> </g> </g> </svg>",
  batteryLow: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='25px' height='10px' viewBox='0 0 25 10' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 3.7.2 (28276) - http://www.bohemiancoding.com/sketch --> <title>Battery</title> <desc>Created with Sketch.</desc> <defs></defs> <g id='Symbols' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'> <g id='Status-Bar/Black/20%' transform='translate(-345.000000, -5.000000)' fill='#030303'> <path d='M346.493713,5.5 C345.668758,5.5 345,6.16802155 345,7.00530324 L345,13.4946968 C345,14.3260528 345.67338,15 346.493713,15 L366.006287,15 C366.831242,15 367.5,14.3319784 367.5,13.4946968 L367.5,7.00530324 C367.5,6.17394722 366.82662,5.5 366.006287,5.5 L346.493713,5.5 L346.493713,5.5 Z M368,8.5 L368,12 L368.75,12 C369.164214,12 369.5,11.6644053 369.5,11.25774 L369.5,9.24225998 C369.5,8.83232111 369.167101,8.5 368.75,8.5 L368,8.5 L368,8.5 Z M346.508152,6 C345.951365,6 345.5,6.45699692 345.5,7.00844055 L345.5,13.4915594 C345.5,14.0485058 345.949058,14.5 346.508152,14.5 L365.991848,14.5 C366.548635,14.5 367,14.0430031 367,13.4915594 L367,7.00844055 C367,6.45149422 366.550942,6 365.991848,6 L346.508152,6 Z M346.490479,6.5 C346.219595,6.5 346,6.71637201 346,6.99209595 L346,13.5079041 C346,13.7796811 346.215057,14 346.490479,14 L350,14 L350,6.5 L346.490479,6.5 Z' id='Battery'></path> </g> </g> </svg>",
  bannerBG: {
    "iphone-5": "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='320px' height='68px' viewBox='0 0 320 68' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 3.6.1 (26313) - http://www.bohemiancoding.com/sketch --> <title>iphone5</title> <desc>Created with Sketch.</desc> <defs></defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0.9'> <g id='iPhone-5/5S/5C' fill='#1A1A1C'> <path d='M0,0 L320,0 L320,68 L0,68 L0,0 Z M142,61.0048815 C142,59.897616 142.896279,59 144.0024,59 L176.9976,59 C178.103495,59 179,59.8938998 179,61.0048815 L179,61.9951185 C179,63.102384 178.103721,64 176.9976,64 L144.0024,64 C142.896505,64 142,63.1061002 142,61.9951185 L142,61.0048815 Z' id='iphone5'></path> </g> </g> </svg>",
    "iphone-6s": "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='375px' height='68px' viewBox='0 0 375 68' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 3.6 (26304) - http://www.bohemiancoding.com/sketch --> <title>Notification background</title> <desc>Created with Sketch.</desc> <defs></defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0.9'> <g id='iOS8-Push-Notification' transform='translate(-58.000000, -23.000000)' fill='#1A1A1C'> <g transform='translate(58.000000, 7.000000)' id='Notification-container'> <g> <path d='M0,16 L375,16 L375,84 L0,84 L0,16 Z M169,77.0048815 C169,75.897616 169.896279,75 171.0024,75 L203.9976,75 C205.103495,75 206,75.8938998 206,77.0048815 L206,77.9951185 C206,79.102384 205.103721,80 203.9976,80 L171.0024,80 C169.896505,80 169,79.1061002 169,77.9951185 L169,77.0048815 Z' id='Notification-background'></path> </g> </g> </g> </g> </svg>",
    "iphone-6s-plus": "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='414px' height='68px' viewBox='0 0 414 68' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 3.6 (26304) - http://www.bohemiancoding.com/sketch --> <title>Notification background Copy</title> <desc>Created with Sketch.</desc> <defs></defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0.9'> <g id='iOS8-Push-Notification' transform='translate(-43.000000, -74.000000)' fill='#1A1A1C'> <g transform='translate(43.000000, 74.000000)' id='Notification-container'> <g> <path d='M0,0 L414,0 L414,68 L0,68 L0,0 Z M189,61.0048815 C189,59.897616 189.896279,59 191.0024,59 L223.9976,59 C225.103495,59 226,59.8938998 226,61.0048815 L226,61.9951185 C226,63.102384 225.103721,64 223.9976,64 L191.0024,64 C189.896505,64 189,63.1061002 189,61.9951185 L189,61.0048815 Z' id='Notification-background-Copy'></path> </g> </g> </g> </g> </svg>",
    "ipad": "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='768px' height='68px' viewBox='0 0 768 68' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 3.6.1 (26313) - http://www.bohemiancoding.com/sketch --> <title>ipad-portrait</title> <desc>Created with Sketch.</desc> <defs></defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0.9'> <g id='iPad-Portrait' fill='#1A1A1C'> <path d='M0,0 L768,0 L768,68 L0,68 L0,0 Z M366,61.0048815 C366,59.897616 366.896279,59 368.0024,59 L400.9976,59 C402.103495,59 403,59.8938998 403,61.0048815 L403,61.9951185 C403,63.102384 402.103721,64 400.9976,64 L368.0024,64 C366.896505,64 366,63.1061002 366,61.9951185 L366,61.0048815 Z' id='ipad-portrait'></path> </g> </g> </svg>",
    "ipad-pro": "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='1024px' height='68px' viewBox='0 0 1024 68' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 3.6.1 (26313) - http://www.bohemiancoding.com/sketch --> <title>ipad-pro-portrait</title> <desc>Created with Sketch.</desc> <defs></defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0.9'> <g id='iPad-Pro-Portrait' fill='#1A1A1C'> <path d='M0,0 L1024,0 L1024,68 L0,68 L0,0 Z M494,61.0048815 C494,59.897616 494.896279,59 496.0024,59 L528.9976,59 C530.103495,59 531,59.8938998 531,61.0048815 L531,61.9951185 C531,63.102384 530.103721,64 528.9976,64 L496.0024,64 C494.896505,64 494,63.1061002 494,61.9951185 L494,61.0048815 Z' id='ipad-pro-portrait'></path> </g> </g> </svg>"
  },
  emojiCodes: ["98 80", "98 AC", "98 81", "98 82", "98 83", "98 84", "98 85", "98 86", "98 87", "98 89", "98 8a", "99 82", "99 83", "E2 98 BA EF B8 8F", "98 8B", "98 8C", "98 8D", "98 98", "98 97", "98 99", "98 9A", "98 9C", "98 9D", "98 9B", "A4 91", "A4 93", "98 8E", "A4 97", "98 8F", "98 B6", "98 90", "98 91", "98 92", "99 84", "A4 94", "98 B3", "98 9E", "98 9F", "98 A0", "98 A1", "98 94", "98 95", "99 81", "E2 98 B9 EF B8 8F", "98 A3", "98 96", "98 AB", "98 A9", "98 A4", "98 AE", "98 B1", "98 A8", "98 B0", "98 AF", "98 A6", "98 A7", "98 A2", "98 A5", "98 AA", "98 93", "98 AD", "98 B5", "98 B2", "A4 90", "98 B7", "A4 92", "A4 95", "98 B4", "92 A4", "92 A9", "98 88", "91 BF", "91 B9", "91 BA", "92 80", "91 BB", "91 BD", "A4 96", "98 BA", "98 B8", "98 B9", "98 BB", "98 BC", "98 BD", "99 80", "98 BF", "98 BE", "99 8C", "91 8F", "91 8B", "91 8D", "91 8E", "91 8A", "E2 9C 8A", "E2 9C 8C EF B8 8F", "91 8C", "E2 9C 8B", "91 90", "92 AA", "99 8F", "E2 98 9D EF B8 8F", "91 86", "91 87", "91 88", "91 89", "96 95", "96 90", "A4 98", "96 96", "E2 9C 8D EF B8 8F", "92 85", "91 84", "91 85", "91 82", "91 83", "91 81", "91 80", "91 A4", "91 A5", "97 A3", "91 B6", "91 A6", "91 A7", "91 A8", "91 A9", "91 B1", "91 B4", "91 B5", "91 B2", "91 B3", "91 AE", "91 B7", "92 82", "95 B5", "8E 85", "91 BC", "91 B8", "91 B0", "9A B6", "8F 83", "92 83", "91 AF", "91 AB", "91 AC", "91 AD", "99 87", "92 81", "99 85", "99 86", "99 8B", "99 8E", "99 8D", "92 87", "92 86", "92 91", "91 A9 E2 80 8D E2 9D A4 EF B8 8F E2 80 8D F0 9F 91 A9", "91 A8 E2 80 8D E2 9D A4 EF B8 8F E2 80 8D F0 9F 91 A8", "92 8F", "91 A9 E2 80 8D E2 9D A4 EF B8 8F E2 80 8D F0 9F 92 8B E2 80 8D F0 9F 91 A9", "91 A8 E2 80 8D E2 9D A4 EF B8 8F E2 80 8D F0 9F 92 8B E2 80 8D F0 9F 91 A8", "91 AA", "91 A8 E2 80 8D F0 9F 91 A9 E2 80 8D F0 9F 91 A7", "91 A8 E2 80 8D F0 9F 91 A9 E2 80 8D F0 9F 91 A7 E2 80 8D F0 9F 91 A6", "91 A8 E2 80 8D F0 9F 91 A9 E2 80 8D F0 9F 91 A6 E2 80 8D F0 9F 91 A6", "91 A8 E2 80 8D F0 9F 91 A9 E2 80 8D F0 9F 91 A7 E2 80 8D F0 9F 91 A7", "91 A9 E2 80 8D F0 9F 91 A9 E2 80 8D F0 9F 91 A6", "91 A9 E2 80 8D F0 9F 91 A9 E2 80 8D F0 9F 91 A7", "91 A9 E2 80 8D F0 9F 91 A9 E2 80 8D F0 9F 91 A7 E2 80 8D F0 9F 91 A6", "91 A9 E2 80 8D F0 9F 91 A9 E2 80 8D F0 9F 91 A6 E2 80 8D F0 9F 91 A6", "91 A9 E2 80 8D F0 9F 91 A9 E2 80 8D F0 9F 91 A7 E2 80 8D F0 9F 91 A7", "91 A8 E2 80 8D F0 9F 91 A8 E2 80 8D F0 9F 91 A6", "91 A8 E2 80 8D F0 9F 91 A8 E2 80 8D F0 9F 91 A7", "91 A8 E2 80 8D F0 9F 91 A8 E2 80 8D F0 9F 91 A7 E2 80 8D F0 9F 91 A6", "91 A8 E2 80 8D F0 9F 91 A8 E2 80 8D F0 9F 91 A6 E2 80 8D F0 9F 91 A6", "91 A8 E2 80 8D F0 9F 91 A8 E2 80 8D F0 9F 91 A7 E2 80 8D F0 9F 91 A7", "91 9A", "91 95", "91 96", "91 94", "91 97", "91 99", "91 98", "92 84", "92 8B", "91 A3", "91 A0", "91 A1", "91 A2", "91 9E", "91 9F", "91 92", "8E A9", "E2 9B 91", "8E 93", "91 91", "8E 92", "91 9D", "91 9B", "91 9C", "92 BC", "91 93", "95 B6", "92 8D", "8C 82", "9B 91", "90 B6", "90 B1", "90 AD", "90 B9", "90 B0", "90 BB", "90 BC", "90 A8", "90 AF", "A6 81", "90 AE", "90 B7", "90 BD", "90 B8", "90 99", "90 B5", "99 88", "99 89", "99 8A", "90 92", "90 94", "90 A7", "90 A6", "90 A4", "90 A3", "90 A5", "90 BA", "90 97", "90 B4", "A6 84", "90 9D", "90 9B", "90 8C", "90 9E", "90 9C", "95 B7", "A6 82", "A6 80", "90 8D", "90 A2", "90 A0", "90 9F", "90 A1", "90 AC", "90 B3", "90 8B", "90 8A", "90 86", "90 85", "90 83", "90 82", "90 84", "90 AA", "90 AB", "90 98", "90 90", "90 8F", "90 91", "90 8E", "90 96", "90 80", "90 81", "90 93", "A6 83", "95 8A", "90 95", "90 A9", "90 88", "90 87", "90 BF", "90 BE", "90 89", "90 B2", "8C B5", "8E 84", "8C B2", "8C B3", "8C B4", "8C B1", "8C BF", "E2 98 98", "8D 80", "8E 8D", "8E 8B", "8D 83", "8D 82", "8D 81", "8C BE", "8C BA", "8C BA", "8C BB", "8C B9", "8C B7", "8C BC", "8C B8", "92 90", "8D 84", "8C B0", "8E 83", "90 9A", "95 B8", "8C 8E", "8C 8D", "8C 8F", "8C 95", "8C 96", "8C 97", "8C 98", "8C 91", "8C 92", "8C 93", "8C 94", "8C 9A", "8C 9D", "8C 9B", "8C 9C", "8C 9E", "8C 99", "E2 AD 90 EF B8 8F", "8C 9F", "92 AB", "E2 9C A8", "E2 98 84 EF B8 8F", "E2 98 80 EF B8 8F", "8C A4", "E2 9B 85 EF B8 8F", "8C A5", "8C A6", "E2 98 81 EF B8 8F", "8C A7", "E2 9B 88", "8C A9", "E2 9A A1 EF B8 8F", "94 A5", "92 A5", "E2 9D 84 EF B8 8F", "8C A8", "E2 98 83 EF B8 8F", "E2 9B 84 EF B8 8F", "8C AC", "92 A8", "8C AA", "8C AB", "E2 98 82 EF B8 8F", "E2 98 94 EF B8 8F", "92 A7", "92 A6", "8C 8A", "9B 91", "9B 91", "8D 8F", "8D 8E", "8D 90", "8D 8A", "8D 8B", "8D 8C", "8D 89", "8D 87", "8D 93", "8D 88", "8D 92", "8D 91", "8D 8D", "8D 85", "8D 86", "8C B6", "8C BD", "8D A0", "8D AF", "8D 9E", "A7 80", "8D 97", "8D 96", "8D A4", "8D B3", "8D 94", "8D 9F", "8C AD", "8D 95", "8D 9D", "8C AE", "8C AF", "8D 9C", "8D B2", "8D A5", "8D A3", "8D B1", "8D 9B", "8D 99", "8D 9A", "8D 98", "8D A2", "8D A1", "8D A7", "8D A8", "8D A6", "8D B0", "8E 82", "8D AE", "8D AC", "8D AD", "8D AB", "8D BF", "8D A9", "8D AA", "8D BA", "8D BB", "8D B7", "8D B8", "8D B9", "8D BE", "8D B6", "8D B5", "E2 98 95 EF B8 8F", "8D BC", "8D B4", "8D BD", "9B 91", "9B 91", "9B 91", "E2 9A BD EF B8 8F", "8F 80", "8F 88", "E2 9A BE EF B8 8F", "8E BE", "8F 90", "8F 89", "8E B1", "E2 9B B3 EF B8 8F", "8F 8C", "8F 93", "8F B8", "8F 92", "8F 91", "8F 8F", "8E BF", "E2 9B B7", "8F 82", "E2 9B B8", "8F B9", "8E A3", "9A A3", "8F 8A", "8F 84", "9B 80", "E2 9B B9", "8F 8B", "9A B4", "9A B5", "8F 87", "95 B4", "8F 86", "8E BD", "8F 85", "8E 96", "8E 97", "8F B5", "8E AB", "8E 9F", "8E AD", "8E A8", "8E AA", "8E A4", "8E A7", "8E BC", "8E B9", "8E B7", "8E BA", "8E B8", "8E BB", "8E AC", "8E AE", "91 BE", "8E AF", "8E B2", "8E B0", "8E B3", "9B 91", "9B 91", "9B 91", "9A 97", "9A 95", "9A 99", "9A 8C", "9A 8E", "8F 8E", "9A 93", "9A 91", "9A 92", "9A 90", "9A 9A", "9A 9B", "9A 9C", "8F 8D", "9A B2", "9A A8", "9A 94", "9A 8D", "9A 98", "9A 96", "9A A1", "9A A0", "9A AF", "9A 83", "9A 8B", "9A 9D", "9A 84", "9A 85", "9A 88", "9A 9E", "9A 82", "9A 86", "9A 87", "9A 8A", "9A 89", "9A 81", "9B A9", "E2 9C 88 EF B8 8F", "9B AB", "9B AC", "E2 9B B5 EF B8 8F", "9B A5", "9A A4", "E2 9B B4", "9B B3", "9A 80", "9B B0", "92 BA", "E2 9A 93 EF B8 8F", "9A A7", "E2 9B BD EF B8 8F", "9A 8F", "9A A6", "9A A5", "8F 81", "9A A2", "8E A1", "8E A2", "8E A0", "8F 97", "8C 81", "97 BC", "8F AD", "E2 9B B2 EF B8 8F", "8E 91", "E2 9B B0", "8F 94", "97 BB", "8C 8B", "97 BE", "8F 95", "E2 9B BA EF B8 8F", "8F 9E", "9B A3", "9B A4", "8C 85", "8C 84", "8F 9C", "8F 96", "8F 9D", "8C 87", "8C 86", "8F 99", "8C 83", "8C 89", "8C 8C", "8C A0", "8E 87", "8E 86", "8C 88", "8F 98", "8F B0", "8F AF", "8F 9F", "97 BD", "8F A0", "8F A1", "8F 9A", "8F A2", "8F AC", "8F A3", "8F A4", "8F A5", "8F A6", "8F A8", "8F AA", "8F AB", "8F A9", "92 92", "8F 9B", "E2 9B AA EF B8 8F", "95 8C", "95 8D", "95 8B", "E2 9B A9", "E2 8C 9A EF B8 8F", "93 B1", "93 B2", "92 BB", "E2 8C A8 EF B8 8F", "96 A5", "96 A8", "96 B1", "96 B2", "95 B9", "97 9C", "92 BD", "92 BE", "92 BF", "93 80", "93 BC", "93 B7", "93 B8", "93 B9", "8E A5", "93 BD", "8E 9E", "93 9E", "E2 98 8E EF B8 8F", "93 9F", "93 A0", "93 BA", "93 BB", "8E 99", "8E 9A", "8E 9B", "E2 8F B1", "E2 8F B2", "E2 8F B0", "95 B0", "E2 8F B3", "E2 8C 9B EF B8 8F", "93 A1", "94 8B", "94 8C", "92 A1", "94 A6", "95 AF", "97 91", "9B A2", "92 B8", "92 B5", "92 B4", "92 B6", "92 B7", "92 B0", "92 B3", "92 8E", "E2 9A 96", "94 A7", "94 A8", "E2 9A 92", "9B A0", "E2 9B 8F", "94 A9", "E2 9A 99", "E2 9B 93", "94 AB", "92 A3", "94 AA", "97 A1", "E2 9A 94", "9B A1", "9A AC", "E2 98 A0 EF B8 8F", "E2 9A B0", "E2 9A B1", "8F BA", "94 AE", "93 BF", "92 88", "E2 9A 97", "94 AD", "94 AC", "95 B3", "92 8A", "92 89", "8C A1", "8F B7", "94 96", "9A BD", "9A BF", "9B 81", "94 91", "97 9D", "9B 8B", "9B 8C", "9B 8F", "9A AA", "9B 8E", "96 BC", "97 BA", "E2 9B B1", "97 BF", "9B 8D", "8E 88", "8E 8F", "8E 80", "8E 81", "8E 8A", "8E 89", "8E 8E", "8E 90", "8E 8C", "8F AE", "E2 9C 89 EF B8 8F", "93 A9", "93 A8", "93 A7", "92 8C", "93 AE", "93 AA", "93 AB", "93 AC", "93 AD", "93 A6", "93 AF", "93 A5", "93 A4", "93 9C", "93 83", "93 91", "93 8A", "93 88", "93 89", "93 84", "93 85", "93 86", "97 93", "93 87", "97 83", "97 B3", "97 84", "93 8B", "97 92", "93 81", "93 82", "97 82", "97 9E", "93 B0", "93 93", "93 95", "93 97", "93 98", "93 99", "93 94", "93 92", "93 9A", "93 96", "94 97", "93 8E", "96 87", "E2 9C 82 EF B8 8F", "93 90", "93 8F", "93 8C", "93 8D", "9A A9", "8F B3", "8F B4", "94 90", "94 92", "94 93", "94 8F", "96 8A", "96 8B", "E2 9C 92 EF B8 8F", "93 9D", "E2 9C 8F EF B8 8F", "96 8D", "96 8C", "94 8D", "94 8E", "9B 91", "9B 91", "E2 9D A4 EF B8 8F", "92 9B", "92 9A", "92 99", "92 9C", "92 94", "E2 9D A3 EF B8 8F", "92 95", "92 9E", "92 93", "92 97", "92 96", "92 98", "92 9D", "92 9F", "E2 98 AE EF B8 8F", "E2 9C 9D EF B8 8F", "E2 98 AA EF B8 8F", "95 89", "E2 98 B8 EF B8 8F", "E2 9C A1 EF B8 8F", "94 AF", "95 8E", "E2 98 AF EF B8 8F", "E2 98 A6 EF B8 8F", "9B 90", "E2 9B 8E", "E2 99 88 EF B8 8F", "E2 99 89 EF B8 8F", "E2 99 8A EF B8 8F", "E2 99 8B EF B8 8F", "E2 99 8C EF B8 8F", "E2 99 8D EF B8 8F", "E2 99 8E EF B8 8F", "E2 99 8F EF B8 8F", "E2 99 90 EF B8 8F", "E2 99 91 EF B8 8F", "E2 99 92 EF B8 8F", "E2 99 93 EF B8 8F", "86 94", "E2 9A 9B", "88 B3", "88 B9", "E2 98 A2 EF B8 8F", "E2 98 A3 EF B8 8F", "93 B4", "93 B3", "88 B6", "88 9A EF B8 8F", "88 B8", "88 BA", "88 B7 EF B8 8F", "E2 9C B4 EF B8 8F", "86 9A", "89 91", "92 AE", "89 90", "E3 8A 99 EF B8 8F", "E3 8A 97 EF B8 8F", "88 B4", "88 B5", "88 B2", "85 B0 EF B8 8F", "85 B1 EF B8 8F", "86 8E", "86 91", "85 BE EF B8 8F", "86 98", "E2 9B 94 EF B8 8F", "93 9B", "9A AB", "E2 9D 8C", "E2 AD 95 EF B8 8F", "92 A2", "E2 99 A8 EF B8 8F", "9A B7", "9A AF", "9A B3", "9A B1", "94 9E", "93 B5", "E2 9D 97 EF B8 8F", "E2 9D 95", "E2 9D 93", "E2 9D 94", "E2 80 BC EF B8 8F", "E2 81 89 EF B8 8F", "92 AF", "94 85", "94 86", "94 B1", "E2 9A 9C", "E3 80 BD EF B8 8F", "E2 9A A0 EF B8 8F", "9A B8", "94 B0", "E2 99 BB EF B8 8F", "88 AF EF B8 8F", "92 B9", "E2 9D 87 EF B8 8F", "E2 9C B3 EF B8 8F", "E2 9D 8E", "E2 9C 85", "92 A0", "8C 80", "E2 9E BF", "8C 90", "E2 93 82 EF B8 8F", "8F A7", "88 82 EF B8 8F", "9B 82", "9B 83", "9B 84", "9B 85", "E2 99 BF EF B8 8F", "9A AD", "9A BE", "85 BF EF B8 8F", "9A B0", "9A B9", "9A BA", "9A BC", "9A BB", "9A AE", "8E A6", "93 B6", "88 81", "86 96", "86 97", "86 99", "86 92", "86 95", "86 93", "30 EF B8 8F E2 83 A3", "31 EF B8 8F E2 83 A3", "32 EF B8 8F E2 83 A3", "33 EF B8 8F E2 83 A3", "34 EF B8 8F E2 83 A3", "35 EF B8 8F E2 83 A3", "36 EF B8 8F E2 83 A3", "37 EF B8 8F E2 83 A3", "38 EF B8 8F E2 83 A3", "39 EF B8 8F E2 83 A3", "94 9F", "94 A2", "E2 96 B6 EF B8 8F", "E2 8F B8", "E2 8F AF", "E2 8F B9", "E2 8F BA", "E2 8F AD", "E2 8F AE", "E2 8F A9", "E2 8F AA", "94 80", "94 81", "94 82", "E2 97 80 EF B8 8F", "94 BC", "94 BD", "E2 8F AB", "E2 8F AC", "E2 9E A1 EF B8 8F", "E2 AC 85 EF B8 8F", "E2 AC 86 EF B8 8F", "E2 AC 87 EF B8 8F", "E2 86 97 EF B8 8F", "E2 86 98 EF B8 8F", "E2 86 99 EF B8 8F", "E2 86 96 EF B8 8F", "E2 86 95 EF B8 8F", "E2 86 94 EF B8 8F", "94 84", "E2 86 AA EF B8 8F", "E2 86 A9 EF B8 8F", "E2 A4 B4 EF B8 8F", "E2 A4 B5 EF B8 8F", "23 EF B8 8F E2 83 A3", "2A EF B8 8F E2 83 A3", "E2 84 B9 EF B8 8F", "94 A4", "94 A1", "94 A0", "94 A3", "8E B5", "8E B6", "E3 80 B0 EF B8 8F", "E2 9E B0", "E2 9C 94 EF B8 8F", "94 83", "E2 9E 95", "E2 9E 96", "E2 9E 97", "E2 9C 96 EF B8 8F", "92 B2", "92 B1", "C2 A9 EF B8 8F", "C2 AE EF B8 8F", "E2 84 A2 EF B8 8F", "94 9A", "94 99", "94 9B", "94 9D", "94 9C", "E2 98 91 EF B8 8F", "94 98", "E2 9A AA EF B8 8F", "E2 9A AB EF B8 8F", "94 B4", "94 B5", "94 B8", "94 B9", "94 B6", "94 B7", "94 BA", "E2 96 AA EF B8 8F", "E2 96 AB EF B8 8F", "E2 AC 9B EF B8 8F", "E2 AC 9C EF B8 8F", "94 BB", "E2 97 BC EF B8 8F", "E2 97 BB EF B8 8F", "E2 97 BE EF B8 8F", "E2 97 BD EF B8 8F", "94 B2", "94 B3", "94 88", "94 89", "94 8A", "94 87", "93 A3", "93 A2", "94 94", "94 95", "83 8F", "80 84 EF B8 8F", "E2 99 A0 EF B8 8F", "E2 99 A3 EF B8 8F", "E2 99 A5 EF B8 8F", "E2 99 A6 EF B8 8F", "8E B4", "91 81 E2 80 8D F0 9F 97 A8", "92 AD", "97 AF", "92 AC", "95 90", "95 91", "95 92", "95 93", "95 94", "95 95", "95 96", "95 97", "95 98", "95 99", "95 9A", "95 9B", "95 9C", "95 9D", "95 9E", "95 9F", "95 A0", "95 A1", "95 A2", "95 A3", "95 A4", "95 A5", "95 A6", "95 A7", "9B 91", "87 A6 F0 9F 87 AB", "87 A6 F0 9F 87 BD", "87 A6 F0 9F 87 B1", "87 A9 F0 9F 87 BF", "87 A6 F0 9F 87 B8", "87 A6 F0 9F 87 A9", "87 A6 F0 9F 87 B4", "87 A6 F0 9F 87 AE", "87 A6 F0 9F 87 B6", "87 A6 F0 9F 87 AC", "87 A6 F0 9F 87 B7", "87 A6 F0 9F 87 B2", "87 A6 F0 9F 87 BC", "87 A6 F0 9F 87 BA", "87 A6 F0 9F 87 B9", "87 A6 F0 9F 87 BF", "87 A7 F0 9F 87 B8", "87 A7 F0 9F 87 AD", "87 A7 F0 9F 87 A9", "87 A7 F0 9F 87 A7", "87 A7 F0 9F 87 BE", "87 A7 F0 9F 87 AA", "87 A7 F0 9F 87 BF", "87 A7 F0 9F 87 AF", "87 A7 F0 9F 87 B2", "87 A7 F0 9F 87 B9", "87 A7 F0 9F 87 B4", "87 A7 F0 9F 87 B6", "87 A7 F0 9F 87 A6", "87 A7 F0 9F 87 BC", "87 A7 F0 9F 87 B7", "87 AE F0 9F 87 B4", "87 BB F0 9F 87 AC", "87 A7 F0 9F 87 B3", "87 A7 F0 9F 87 AC", "87 A7 F0 9F 87 AB", "87 A7 F0 9F 87 AE", "87 A8 F0 9F 87 BB", "87 B0 F0 9F 87 AD", "87 A8 F0 9F 87 B2", "87 A8 F0 9F 87 A6", "87 AE F0 9F 87 A8", "87 B0 F0 9F 87 BE", "87 A8 F0 9F 87 AB", "87 B9 F0 9F 87 A9", "87 A8 F0 9F 87 B1", "87 A8 F0 9F 87 B3", "87 A8 F0 9F 87 BD", "87 A8 F0 9F 87 A8", "87 A8 F0 9F 87 B4", "87 B0 F0 9F 87 B2", "87 A8 F0 9F 87 AC", "87 A8 F0 9F 87 A9", "87 A8 F0 9F 87 B0", "87 A8 F0 9F 87 B7", "87 AD F0 9F 87 B7", "87 A8 F0 9F 87 BA", "87 A8 F0 9F 87 BC", "87 A8 F0 9F 87 BE", "87 A8 F0 9F 87 BF", "87 A9 F0 9F 87 B0", "87 A9 F0 9F 87 AF", "87 A9 F0 9F 87 B2", "87 A9 F0 9F 87 B4", "87 AA F0 9F 87 A8", "87 AA F0 9F 87 AC", "87 B8 F0 9F 87 BB", "87 AC F0 9F 87 B6", "87 AA F0 9F 87 B7", "87 AA F0 9F 87 AA", "87 AA F0 9F 87 B9", "87 AA F0 9F 87 BA", "87 AB F0 9F 87 B0", "87 AB F0 9F 87 B4", "87 AB F0 9F 87 AF", "87 AB F0 9F 87 AE", "87 AB F0 9F 87 B7", "87 AC F0 9F 87 AB", "87 B5 F0 9F 87 AB", "87 B9 F0 9F 87 AB", "87 AC F0 9F 87 A6", "87 AC F0 9F 87 B2", "87 AC F0 9F 87 AA", "87 A9 F0 9F 87 AA", "87 AC F0 9F 87 AD", "87 AC F0 9F 87 AE", "87 AC F0 9F 87 B7", "87 AC F0 9F 87 B1", "87 AC F0 9F 87 A9", "87 AC F0 9F 87 B5", "87 AC F0 9F 87 BA", "87 AC F0 9F 87 B9", "87 AC F0 9F 87 AC", "87 AC F0 9F 87 B3", "87 AC F0 9F 87 BC", "87 AC F0 9F 87 BE", "87 AD F0 9F 87 B9", "87 AD F0 9F 87 B3", "87 AD F0 9F 87 B0", "87 AD F0 9F 87 BA", "87 AE F0 9F 87 B8", "87 AE F0 9F 87 B3", "87 AE F0 9F 87 A9", "87 AE F0 9F 87 B7", "87 AE F0 9F 87 B6", "87 AE F0 9F 87 AA", "87 AE F0 9F 87 B2", "87 AE F0 9F 87 B1", "87 AE F0 9F 87 B9", "87 A8 F0 9F 87 AE", "87 AF F0 9F 87 B2", "87 AF F0 9F 87 B5", "87 AF F0 9F 87 AA", "87 AF F0 9F 87 B4", "87 B0 F0 9F 87 BF", "87 B0 F0 9F 87 AA", "87 B0 F0 9F 87 AE", "87 BD F0 9F 87 B0", "87 B0 F0 9F 87 BC", "87 B0 F0 9F 87 AC", "87 B1 F0 9F 87 A6", "87 B1 F0 9F 87 BB", "87 B1 F0 9F 87 A7", "87 B1 F0 9F 87 B8", "87 B1 F0 9F 87 B7", "87 B1 F0 9F 87 BE", "87 B1 F0 9F 87 AE", "87 B1 F0 9F 87 B9", "87 B1 F0 9F 87 BA", "87 B2 F0 9F 87 B4", "87 B2 F0 9F 87 B0", "87 B2 F0 9F 87 AC", "87 B2 F0 9F 87 BC", "87 B2 F0 9F 87 BE", "87 B2 F0 9F 87 BB", "87 B2 F0 9F 87 B1", "87 B2 F0 9F 87 B9", "87 B2 F0 9F 87 AD", "87 B2 F0 9F 87 B6", "87 B2 F0 9F 87 B7", "87 B2 F0 9F 87 BA", "87 BE F0 9F 87 B9", "87 B2 F0 9F 87 BD", "87 AB F0 9F 87 B2", "87 B2 F0 9F 87 A9", "87 B2 F0 9F 87 A8", "87 B2 F0 9F 87 B3", "87 B2 F0 9F 87 AA", "87 B2 F0 9F 87 B8", "87 B2 F0 9F 87 A6", "87 B2 F0 9F 87 BF", "87 B2 F0 9F 87 B2", "87 B3 F0 9F 87 A6", "87 B3 F0 9F 87 B7", "87 B3 F0 9F 87 B5", "87 B3 F0 9F 87 B1", "87 B3 F0 9F 87 A8", "87 B3 F0 9F 87 BF", "87 B3 F0 9F 87 AE", "87 B3 F0 9F 87 AA", "87 B3 F0 9F 87 AC", "87 B3 F0 9F 87 BA", "87 B3 F0 9F 87 AB", "87 B2 F0 9F 87 B5", "87 B0 F0 9F 87 B5", "87 B3 F0 9F 87 B4", "87 B4 F0 9F 87 B2", "87 B5 F0 9F 87 B0", "87 B5 F0 9F 87 BC", "87 B5 F0 9F 87 B8", "87 B5 F0 9F 87 A6", "87 B5 F0 9F 87 AC", "87 B5 F0 9F 87 BE", "87 B5 F0 9F 87 AA", "87 B5 F0 9F 87 AD", "87 B5 F0 9F 87 B3", "87 B5 F0 9F 87 B1", "87 B5 F0 9F 87 B9", "87 B5 F0 9F 87 B7", "87 B6 F0 9F 87 A6", "87 B7 F0 9F 87 AA", "87 B7 F0 9F 87 B4", "87 B7 F0 9F 87 BA", "87 B7 F0 9F 87 BC", "87 A7 F0 9F 87 B1", "87 B8 F0 9F 87 AD", "87 B0 F0 9F 87 B3", "87 B1 F0 9F 87 A8", "87 B5 F0 9F 87 B2", "87 BB F0 9F 87 A8", "87 BC F0 9F 87 B8", "87 B8 F0 9F 87 B2", "87 B8 F0 9F 87 B9", "87 B8 F0 9F 87 A6", "87 B8 F0 9F 87 B3", "87 B7 F0 9F 87 B8", "87 B8 F0 9F 87 A8", "87 B8 F0 9F 87 B1", "87 B8 F0 9F 87 AC", "87 B8 F0 9F 87 BD", "87 B8 F0 9F 87 B0", "87 B8 F0 9F 87 AE", "87 B8 F0 9F 87 A7", "87 B8 F0 9F 87 B4", "87 BF F0 9F 87 A6", "87 AC F0 9F 87 B8", "87 B0 F0 9F 87 B7", "87 B8 F0 9F 87 B8", "87 AA F0 9F 87 B8", "87 B1 F0 9F 87 B0", "87 B8 F0 9F 87 A9", "87 B8 F0 9F 87 B7", "87 B8 F0 9F 87 BF", "87 B8 F0 9F 87 AA", "87 A8 F0 9F 87 AD", "87 B8 F0 9F 87 BE", "87 B9 F0 9F 87 BC", "87 B9 F0 9F 87 AF", "87 B9 F0 9F 87 BF", "87 B9 F0 9F 87 AD", "87 B9 F0 9F 87 B1", "87 B9 F0 9F 87 AC", "87 B9 F0 9F 87 B0", "87 B9 F0 9F 87 B4", "87 B9 F0 9F 87 B9", "87 B9 F0 9F 87 B3", "87 B9 F0 9F 87 B7", "87 B9 F0 9F 87 B2", "87 B9 F0 9F 87 A8", "87 B9 F0 9F 87 BB", "87 BA F0 9F 87 AC", "87 BA F0 9F 87 A6", "87 A6 F0 9F 87 AA", "87 AC F0 9F 87 A7", "87 BA F0 9F 87 B8", "87 BB F0 9F 87 AE", "87 BA F0 9F 87 BE", "87 BA F0 9F 87 BF", "87 BB F0 9F 87 BA", "87 BB F0 9F 87 A6", "87 BB F0 9F 87 AA", "87 BB F0 9F 87 B3", "87 BC F0 9F 87 AB", "87 AA F0 9F 87 AD", "87 BE F0 9F 87 AA", "87 BF F0 9F 87 B2", "87 BF F0 9F 87 BC"],
  network: "<svg width='14px' height='10px' viewBox='87 5 14 10' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 3.7.2 (28276) - http://www.bohemiancoding.com/sketch --> <desc>Created with Sketch.</desc> <defs></defs> <path d='M96.1444208,12.4385043 C95.626374,11.8454456 94.8523616,11.4689119 93.987563,11.4689119 C93.1390073,11.4689119 92.3778594,11.8314341 91.8601652,12.4053177 L94.0225391,14.5 L96.1444208,12.4385043 Z M98.3234964,10.3214425 C97.2447794,9.19174563 95.7014387,8.48445596 93.987563,8.48445596 C92.2882723,8.48445596 90.7566264,9.17975893 89.6792698,10.2926936 L90.7692987,11.3486 C91.567205,10.5053708 92.713648,9.97668394 93.987563,9.97668394 C95.2768836,9.97668394 96.4356305,10.518235 97.2346215,11.3793293 L98.3234964,10.3214425 L98.3234964,10.3214425 Z M100.5,8.20687933 C98.8629578,6.53943672 96.5505699,5.5 93.987563,5.5 C91.4375103,5.5 89.1355496,6.52895605 87.5,8.18164431 L88.5895579,9.23709441 C89.9460798,7.85431655 91.8628921,6.99222798 93.987563,6.99222798 C96.1260026,6.99222798 98.0538809,7.86552609 99.4118698,9.26404272 L100.5,8.20687933 Z' id='Wi-Fi' stroke='none' fill='#030303' fill-rule='evenodd'></path> </svg>",
  activity: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='16px' height='16px' viewBox='0 0 16 16' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:sketch='http://www.bohemiancoding.com/sketch/ns'> <!-- Generator: Sketch 3.5.2 (25235) - http://www.bohemiancoding.com/sketch --> <title>Soccer Ball</title> <desc>Created with Sketch.</desc> <defs> <circle id='path-1' cx='8' cy='8' r='8'></circle> </defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' sketch:type='MSPage'> <g id='iPhone-6' sketch:type='MSArtboardGroup' transform='translate(-179.000000, -639.000000)'> <g id='Soccer-Ball' sketch:type='MSLayerGroup' transform='translate(179.000000, 639.000000)'> <mask id='mask-2' sketch:name='Mask' fill='white'> <use xlink:href='#path-1'></use> </mask> <use id='Mask' stroke='#4A5361' sketch:type='MSShapeGroup' xlink:href='#path-1'></use> <path d='M6,12.1203046 L12.8573384,8 L13.3723765,8.8571673 L6.51503807,12.9774719 L6,12.1203046 L6,12.1203046 Z' id='Rectangle-47' fill='#4A5361' sketch:type='MSShapeGroup' mask='url(#mask-2)'></path> <path d='M11.849648,8.7260551 L19.1001103,5.34510901 L19.5227285,6.2514168 L12.2722662,9.63236289 L11.849648,8.7260551 L11.849648,8.7260551 Z' id='Rectangle-47-Copy-3' fill='#4A5361' sketch:type='MSShapeGroup' mask='url(#mask-2)'></path> <path d='M6,3.1203046 L12.8573384,-1 L13.3723765,-0.142832699 L6.51503807,3.9774719 L6,3.1203046 L6,3.1203046 Z' id='Rectangle-47-Copy-2' fill='#4A5361' sketch:type='MSShapeGroup' mask='url(#mask-2)'></path> <path d='M-1,7.1203046 L5.85733841,3 L6.37237648,3.8571673 L-0.484961925,7.9774719 L-1,7.1203046 L-1,7.1203046 Z' id='Rectangle-47-Copy-4' fill='#4A5361' sketch:type='MSShapeGroup' mask='url(#mask-2)'></path> <rect id='Rectangle-50' fill='#4A5361' sketch:type='MSShapeGroup' mask='url(#mask-2)' x='4' y='6' width='1' height='5'></rect> <rect id='Rectangle-51' fill='#4A5361' sketch:type='MSShapeGroup' mask='url(#mask-2)' x='11.5' y='3' width='1' height='12'></rect> <path d='M5,4.8571673 L11.8573384,8.9774719 L12.3723765,8.1203046 L5.51503807,4 L5,4.8571673' id='Rectangle-47-Copy' fill='#4A5361' sketch:type='MSShapeGroup' mask='url(#mask-2)'></path> <path d='M5,12.8571673 L11.8573384,16.9774719 L12.3723765,16.1203046 L5.51503807,12 L5,12.8571673' id='Rectangle-47-Copy-5' fill='#4A5361' sketch:type='MSShapeGroup' mask='url(#mask-2)'></path> <path d='M11.9048972,6.14766064 L13.8714227,8.33170849 L12.4019596,10.8768933 L9.52725589,10.2658562 L9.22005445,7.34302965 L11.9048972,6.14766064' id='Polygon-1' fill='#D8D8D8' sketch:type='MSShapeGroup' mask='url(#mask-2)'></path> <path d='M11.9048972,6.14766064 L13.8714227,8.33170849 L12.4019596,10.8768933 L9.52725589,10.2658562 L9.22005445,7.34302965 L11.9048972,6.14766064' id='Polygon-1-Copy' fill='#4A5361' sketch:type='MSShapeGroup' mask='url(#mask-2)'></path> <path d='M7.45771189,3.19504739 L7.35514484,6.13218333 L4.5300676,6.9422612 L2.88664089,4.5057809 L4.69602457,2.18987541 L7.45771189,3.19504739' id='Polygon-1-Copy-2' fill='#4A5361' sketch:type='MSShapeGroup' mask='url(#mask-2)'></path> <path d='M7.45771189,11.1950474 L7.35514484,14.1321833 L4.5300676,14.9422612 L2.88664089,12.5057809 L4.69602457,10.1898754 L7.45771189,11.1950474' id='Polygon-1-Copy-3' fill='#4A5361' sketch:type='MSShapeGroup' mask='url(#mask-2)'></path> <path d='M14.5431701,0.0725939314 L14.4406031,3.00972988 L11.6155258,3.81980774 L9.97209912,1.38332745 L11.7814828,-0.93257805 L14.5431701,0.0725939314' id='Polygon-1-Copy-4' fill='#4A5361' sketch:type='MSShapeGroup' mask='url(#mask-2)'></path> </g> </g> </g> </svg>",
  animals: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='17px' height='16px' viewBox='0 0 17 17' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:sketch='http://www.bohemiancoding.com/sketch/ns'> <!-- Generator: Sketch 3.5.2 (25235) - http://www.bohemiancoding.com/sketch --> <title>Group</title> <desc>Created with Sketch.</desc> <defs></defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' sketch:type='MSPage'> <g id='iPhone-6' sketch:type='MSArtboardGroup' transform='translate(-117.000000, -639.000000)' stroke='#4A5361'> <g id='ic_Food' sketch:type='MSLayerGroup' transform='translate(118.000000, 640.000000)'> <g id='Group' sketch:type='MSShapeGroup'> <path d='M5.68377537,1.38156646 C6.23926066,1.13624 6.85372005,1 7.5,1 C8.14627995,1 8.76073934,1.13624 9.31622463,1.38156646 C9.80879275,0.562359019 10.8255888,0 12,0 C13.6568542,0 15,1.11928813 15,2.5 C15,3.5571398 14.2126246,4.46102843 13.0999226,4.82662514 C14.2496528,5.64185422 15,6.98330062 15,8.5 C15,10.7167144 13.3971873,12.5590719 11.2872671,12.9313673 C10.4867248,14.1757703 9.08961696,15 7.5,15 C5.91038304,15 4.51327524,14.1757703 3.71273291,12.9313673 C1.60281268,12.5590719 0,10.7167144 0,8.5 C0,6.98330062 0.750347244,5.64185422 1.90007741,4.82662514 C0.787375445,4.46102843 0,3.5571398 0,2.5 C0,1.11928813 1.34314575,0 3,0 C4.17441122,0 5.19120725,0.562359019 5.68377537,1.38156646 Z' id='Oval-8'></path> <path d='M5.73834228,12 C5.86290979,12 6.14642353,12 6.14642353,12 C6.14642353,12 6.43215696,12.4426123 6.5246582,12.4919739 C6.66455601,12.5666277 7,12.4919739 7,12.4919739 L7,12 L8,12 L8,12.4919739 L8.49799228,12.4919739 L8.84301769,12 L9.3918457,12 C9.3918457,12 8.99598457,12.9839478 8.49799228,12.9839478 L6.60702407,12.9839478 C6.21404813,12.9839478 5.45996094,12 5.73834228,12 Z' id='Rectangle-44-Copy-2'></path> <circle id='Oval-14' cx='10.5' cy='7.5' r='0.5'></circle> <circle id='Oval-14-Copy' cx='4.5' cy='7.5' r='0.5'></circle> <path d='M12.6999969,5 C12.6999969,3.06700338 11.1329936,1.5 9.19999695,1.5' id='Oval-16'></path> <path d='M5.5,5 C5.5,3.06700338 3.93299662,1.5 2,1.5' id='Oval-16-Copy' transform='translate(3.750000, 3.250000) scale(-1, 1) translate(-3.750000, -3.250000) '></path> <rect id='Rectangle-44-Copy' x='7' y='11' width='1' height='1'></rect> <path d='M6,10 L6.5,10 L6.49999999,9.5 L8.50000005,9.5 L8.50000005,10 L9,10 L9,10.5 L8.5,10.5 L8.5,11 L6.5,11 L6.5,10.5 L6,10.5 L6,10 Z' id='Path'></path> </g> </g> </g> </g> </svg>",
  chevron: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='13px' height='22px' viewBox='0 0 13 22' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 3.6.1 (26313) - http://www.bohemiancoding.com/sketch --> <title>Back Chevron</title> <desc>Created with Sketch.</desc> <defs></defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'> <g id='Navigation-Bar/Back' transform='translate(-8.000000, -31.000000)' fill='#0076FF'> <path d='M8.5,42 L19,31.5 L21,33.5 L12.5,42 L21,50.5 L19,52.5 L8.5,42 Z' id='Back-Chevron'></path> </g> </g> </svg>",
  emojis: ["😀", "😬", "😁", "😂", "😃", "😄", "😅", "😆", "😇", "😉", "😊", "🙂", "🙃", "☺️", "😋", "😌", "😍", "😘", "😗", "😙", "😚", "😜", "😝", "😛", "🤑", "🤓", "😎", "🤗", "😏", "😶", "😐", "😑", "😒", "🙄", "🤔", "😳", "😞", "😟", "😠", "😡", "😔", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "😤", "😮", "😱", "😨", "😰", "😯", "😦", "😧", "😢", "😥", "😪", "😓", "😭", "😵", "😲", "🤐", "😷", "🤒", "🤕", "😴", "💤", "💩", "😈", "👿", "👹", "👺", "💀", "👻", "👽", "🤖", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🙌", "👏", "👋", "👍", "👎", "👊", "✊", "✌️", "👌", "✋", "👐", "💪", "🙏", "☝️", "👆", "👇", "👈", "👉", "🖕", "🖐", "🤘", "🖖", "✍️", "💅", "👄", "👅", "👂", "👃", "👁", "👀", "👤", "👥", "🗣", "👶", "👦", "👧", "👨", "👩", "👱", "👴", "👵", "👲", "👳", "👮", "👷", "💂", "🕵", "🎅", "👼", "👸", "👰", "🚶", "🏃", "💃", "👯", "👫", "👬", "👭", "🙇", "💁", "🙅", "🙆", "🙋", "🙎", "🙍", "💇", "💆", "💑", "👩‍❤️‍👩", "👨‍❤️‍👨", "💏", "👩‍❤️‍💋‍👩", "👨‍❤️‍💋‍👨", "👪", "👨‍👩‍👧", "👨‍👩‍👧‍👦", "👨‍👩‍👦‍👦", "👨‍👩‍👧‍👧", "👩‍👩‍👦", "👩‍👩‍👧", "👩‍👩‍👧‍👦", "👩‍👩‍👦‍👦", "👩‍👩‍👧‍👧", "👨‍👨‍👦", "👨‍👨‍👧", "👨‍👨‍👧‍👦", "👨‍👨‍👦‍👦", "👨‍👨‍👧‍👧", "👚", "👕", "👖", "👔", "👗", "👙", "👘", "💄", "💋", "👣", "👠", "👡", "👢", "👞", "👟", "👒", "🎩", "⛑", "🎓", "👑", "🎒", "👝", "👛", "👜", "💼", "👓", "🕶", "💍", "🌂", "🛑", "🐶", "🐱", "🐭", "🐹", "🐰", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐙", "🐵", "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🐌", "🐞", "🐜", "🕷", "🦂", "🦀", "🐍", "🐢", "🐠", "🐟", "🐡", "🐬", "🐳", "🐋", "🐊", "🐆", "🐅", "🐃", "🐂", "🐄", "🐪", "🐫", "🐘", "🐐", "🐏", "🐑", "🐎", "🐖", "🐀", "🐁", "🐓", "🦃", "🕊", "🐕", "🐩", "🐈", "🐇", "🐿", "🐾", "🐉", "🐲", "🌵", "🎄", "🌲", "🌳", "🌴", "🌱", "🌿", "☘", "🍀", "🎍", "🎋", "🍃", "🍂", "🍁", "🌾", "🌺", "🌺", "🌻", "🌹", "🌷", "🌼", "🌸", "💐", "🍄", "🌰", "🎃", "🐚", "🕸", "🌎", "🌍", "🌏", "🌕", "🌖", "🌗", "🌘", "🌑", "🌒", "🌓", "🌔", "🌚", "🌝", "🌛", "🌜", "🌞", "🌙", "⭐️", "🌟", "💫", "✨", "☄️", "☀️", "🌤", "⛅️", "🌥", "🌦", "☁️", "🌧", "⛈", "🌩", "⚡️", "🔥", "💥", "❄️", "🌨", "☃️", "⛄️", "🌬", "💨", "🌪", "🌫", "☂️", "☔️", "💧", "💦", "🌊", "🛑", "🛑", "🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🍍", "🍅", "🍆", "🌶", "🌽", "🍠", "🍯", "🍞", "🧀", "🍗", "🍖", "🍤", "🍳", "🍔", "🍟", "🌭", "🍕", "🍝", "🌮", "🌯", "🍜", "🍲", "🍥", "🍣", "🍱", "🍛", "🍙", "🍚", "🍘", "🍢", "🍡", "🍧", "🍨", "🍦", "🍰", "🎂", "🍮", "🍬", "🍭", "🍫", "🍿", "🍩", "🍪", "🍺", "🍻", "🍷", "🍸", "🍹", "🍾", "🍶", "🍵", "☕️", "🍼", "🍴", "🍽", "🛑", "🛑", "🛑", "⚽️", "🏀", "🏈", "⚾️", "🎾", "🏐", "🏉", "🎱", "⛳️", "🏌", "🏓", "🏸", "🏒", "🏑", "🏏", "🎿", "⛷", "🏂", "⛸", "🏹", "🎣", "🚣", "🏊", "🏄", "🛀", "⛹", "🏋", "🚴", "🚵", "🏇", "🕴", "🏆", "🎽", "🏅", "🎖", "🎗", "🏵", "🎫", "🎟", "🎭", "🎨", "🎪", "🎤", "🎧", "🎼", "🎹", "🎷", "🎺", "🎸", "🎻", "🎬", "🎮", "👾", "🎯", "🎲", "🎰", "🎳", "🛑", "🛑", "🛑", "🚗", "🚕", "🚙", "🚌", "🚎", "🏎", "🚓", "🚑", "🚒", "🚐", "🚚", "🚛", "🚜", "🏍", "🚲", "🚨", "🚔", "🚍", "🚘", "🚖", "🚡", "🚠", "🚯", "🚃", "🚋", "🚝", "🚄", "🚅", "🚈", "🚞", "🚂", "🚆", "🚇", "🚊", "🚉", "🚁", "🛩", "✈️", "🛫", "🛬", "⛵️", "🛥", "🚤", "⛴", "🛳", "🚀", "🛰", "💺", "⚓️", "🚧", "⛽️", "🚏", "🚦", "🚥", "🏁", "🚢", "🎡", "🎢", "🎠", "🏗", "🌁", "🗼", "🏭", "⛲️", "🎑", "⛰", "🏔", "🗻", "🌋", "🗾", "🏕", "⛺️", "🏞", "🛣", "🛤", "🌅", "🌄", "🏜", "🏖", "🏝", "🌇", "🌆", "🏙", "🌃", "🌉", "🌌", "🌠", "🎇", "🎆", "🌈", "🏘", "🏰", "🏯", "🏟", "🗽", "🏠", "🏡", "🏚", "🏢", "🏬", "🏣", "🏤", "🏥", "🏦", "🏨", "🏪", "🏫", "🏩", "💒", "🏛", "⛪️", "🕌", "🕍", "🕋", "⛩", "⌚️", "📱", "📲", "💻", "⌨️", "🖥", "🖨", "🖱", "🖲", "🕹", "🗜", "💽", "💾", "💿", "📀", "📼", "📷", "📸", "📹", "🎥", "📽", "🎞", "📞", "☎️", "📟", "📠", "📺", "📻", "🎙", "🎚", "🎛", "⏱", "⏲", "⏰", "🕰", "⏳", "⌛️", "📡", "🔋", "🔌", "💡", "🔦", "🕯", "🗑", "🛢", "💸", "💵", "💴", "💶", "💷", "💰", "💳", "💎", "⚖", "🔧", "🔨", "⚒", "🛠", "⛏", "🔩", "⚙", "⛓", "🔫", "💣", "🔪", "🗡", "⚔", "🛡", "🚬", "☠️", "⚰", "⚱", "🏺", "🔮", "📿", "💈", "⚗", "🔭", "🔬", "🕳", "💊", "💉", "🌡", "🏷", "🔖", "🚽", "🚿", "🛁", "🔑", "🗝", "🛋", "🛌", "🛏", "🚪", "🛎", "🖼", "🗺", "⛱", "🗿", "🛍", "🎈", "🎏", "🎀", "🎁", "🎊", "🎉", "🎎", "🎐", "🎌", "🏮", "✉️", "📩", "📨", "📧", "💌", "📮", "📪", "📫", "📬", "📭", "📦", "📯", "📥", "📤", "📜", "📃", "📑", "📊", "📈", "📉", "📄", "📅", "📆", "🗓", "📇", "🗃", "🗳", "🗄", "📋", "🗒", "📁", "📂", "🗂", "🗞", "📰", "📓", "📕", "📗", "📘", "📙", "📔", "📒", "📚", "📖", "🔗", "📎", "🖇", "✂️", "📐", "📏", "📌", "📍", "🚩", "🏳", "🏴", "🔐", "🔒", "🔓", "🔏", "🖊", "🖋", "✒️", "📝", "✏️", "🖍", "🖌", "🔍", "🔎", "🛑", "🛑", "❤️", "💛", "💚", "💙", "💜", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️", "✝️", "☪️", "🕉", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️", "🛐", "⛎", "♈️", "♉️", "♊️", "♋️", "♌️", "♍️", "♎️", "♏️", "♐️", "♑️", "♒️", "♓️", "🆔", "⚛", "🈳", "🈹", "☢️", "☣️", "📴", "📳", "🈶", "🈚️", "🈸", "🈺", "🈷️", "✴️", "🆚", "🉑", "💮", "🉐", "㊙️", "㊗️", "🈴", "🈵", "🈲", "🅰️", "🅱️", "🆎", "🆑", "🅾️", "🆘", "⛔️", "📛", "🚫", "❌", "⭕️", "💢", "♨️", "🚷", "🚯", "🚳", "🚱", "🔞", "📵", "❗️", "❕", "❓", "❔", "‼️", "⁉️", "💯", "🔅", "🔆", "🔱", "⚜", "〽️", "⚠️", "🚸", "🔰", "♻️", "🈯️", "💹", "❇️", "✳️", "❎", "✅", "💠", "🌀", "➿", "🌐", "Ⓜ️", "🏧", "🈂️", "🛂", "🛃", "🛄", "🛅", "♿️", "🚭", "🚾", "🅿️", "🚰", "🚹", "🚺", "🚼", "🚻", "🚮", "🎦", "📶", "🈁", "🆖", "🆗", "🆙", "🆒", "🆕", "🆓", "0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟", "🔢", "▶️", "⏸", "⏯", "⏹", "⏺", "⏭", "⏮", "⏩", "⏪", "🔀", "🔁", "🔂", "◀️", "🔼", "🔽", "⏫", "⏬", "➡️", "⬅️", "⬆️", "⬇️", "↗️", "↘️", "↙️", "↖️", "↕️", "↔️", "🔄", "↪️", "↩️", "⤴️", "⤵️", "#️⃣", "*️⃣", "ℹ️", "🔤", "🔡", "🔠", "🔣", "🎵", "🎶", "〰️", "➰", "✔️", "🔃", "➕", "➖", "➗", "✖️", "💲", "💱", "©️", "®️", "™️", "🔚", "🔙", "🔛", "🔝", "🔜", "☑️", "🔘", "⚪️", "⚫️", "🔴", "🔵", "🔸", "🔹", "🔶", "🔷", "🔺", "▪️", "▫️", "⬛️", "⬜️", "🔻", "◼️", "◻️", "◾️", "◽️", "🔲", "🔳", "🔈", "🔉", "🔊", "🔇", "📣", "📢", "🔔", "🔕", "🃏", "🀄️", "♠️", "♣️", "♥️", "♦️", "🎴", "👁‍🗨", "💭", "🗯", "💬", "🕐", "🕑", "🕒", "🕓", "🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚", "🕛", "🕜", "🕝", "🕞", "🕟", "🕠", "🕡", "🕢", "🕣", "🕤", "🕥", "🕦", "🕧", "🛑", "🇦🇫", "🇦🇽", "🇦🇱", "🇩🇿", "🇦🇸", "🇦🇩", "🇦🇴", "🇦🇮", "🇦🇶", "🇦🇬", "🇦🇷", "🇦🇲", "🇦🇼", "🇦🇺", "🇦🇹", "🇦🇿", "🇧🇸", "🇧🇭", "🇧🇩", "🇧🇧", "🇧🇾", "🇧🇪", "🇧🇿", "🇧🇯", "🇧🇲", "🇧🇹", "🇧🇴", "🇧🇶", "🇧🇦", "🇧🇼", "🇧🇷", "🇮🇴", "🇻🇬", "🇧🇳", "🇧🇬", "🇧🇫", "🇧🇮", "🇨🇻", "🇰🇭", "🇨🇲", "🇨🇦", "🇮🇨", "🇰🇾", "🇨🇫", "🇹🇩", "🇨🇱", "🇨🇳", "🇨🇽", "🇨🇨", "🇨🇴", "🇰🇲", "🇨🇬", "🇨🇩", "🇨🇰", "🇨🇷", "🇭🇷", "🇨🇺", "🇨🇼", "🇨🇾", "🇨🇿", "🇩🇰", "🇩🇯", "🇩🇲", "🇩🇴", "🇪🇨", "🇪🇬", "🇸🇻", "🇬🇶", "🇪🇷", "🇪🇪", "🇪🇹", "🇪🇺", "🇫🇰", "🇫🇴", "🇫🇯", "🇫🇮", "🇫🇷", "🇬🇫", "🇵🇫", "🇹🇫", "🇬🇦", "🇬🇲", "🇬🇪", "🇩🇪", "🇬🇭", "🇬🇮", "🇬🇷", "🇬🇱", "🇬🇩", "🇬🇵", "🇬🇺", "🇬🇹", "🇬🇬", "🇬🇳", "🇬🇼", "🇬🇾", "🇭🇹", "🇭🇳", "🇭🇰", "🇭🇺", "🇮🇸", "🇮🇳", "🇮🇩", "🇮🇷", "🇮🇶", "🇮🇪", "🇮🇲", "🇮🇱", "🇮🇹", "🇨🇮", "🇯🇲", "🇯🇵", "🇯🇪", "🇯🇴", "🇰🇿", "🇰🇪", "🇰🇮", "🇽🇰", "🇰🇼", "🇰🇬", "🇱🇦", "🇱🇻", "🇱🇧", "🇱🇸", "🇱🇷", "🇱🇾", "🇱🇮", "🇱🇹", "🇱🇺", "🇲🇴", "🇲🇰", "🇲🇬", "🇲🇼", "🇲🇾", "🇲🇻", "🇲🇱", "🇲🇹", "🇲🇭", "🇲🇶", "🇲🇷", "🇲🇺", "🇾🇹", "🇲🇽", "🇫🇲", "🇲🇩", "🇲🇨", "🇲🇳", "🇲🇪", "🇲🇸", "🇲🇦", "🇲🇿", "🇲🇲", "🇳🇦", "🇳🇷", "🇳🇵", "🇳🇱", "🇳🇨", "🇳🇿", "🇳🇮", "🇳🇪", "🇳🇬", "🇳🇺", "🇳🇫", "🇲🇵", "🇰🇵", "🇳🇴", "🇴🇲", "🇵🇰", "🇵🇼", "🇵🇸", "🇵🇦", "🇵🇬", "🇵🇾", "🇵🇪", "🇵🇭", "🇵🇳", "🇵🇱", "🇵🇹", "🇵🇷", "🇶🇦", "🇷🇪", "🇷🇴", "🇷🇺", "🇷🇼", "🇧🇱", "🇸🇭", "🇰🇳", "🇱🇨", "🇵🇲", "🇻🇨", "🇼🇸", "🇸🇲", "🇸🇹", "🇸🇦", "🇸🇳", "🇷🇸", "🇸🇨", "🇸🇱", "🇸🇬", "🇸🇽", "🇸🇰", "🇸🇮", "🇸🇧", "🇸🇴", "🇿🇦", "🇬🇸", "🇰🇷", "🇸🇸", "🇪🇸", "🇱🇰", "🇸🇩", "🇸🇷", "🇸🇿", "🇸🇪", "🇨🇭", "🇸🇾", "🇹🇼", "🇹🇯", "🇹🇿", "🇹🇭", "🇹🇱", "🇹🇬", "🇹🇰", "🇹🇴", "🇹🇹", "🇹🇳", "🇹🇷", "🇹🇲", "🇹🇨", "🇹🇻", "🇺🇬", "🇺🇦", "🇦🇪", "🇬🇧", "🇺🇸", "🇻🇮", "🇺🇾", "🇺🇿", "🇻🇺", "🇻🇦", "🇻🇪", "🇻🇳", "🇼🇫", "🇪🇭", "🇾🇪", "🇿🇲", "🇿🇼"],
  emoji: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='20px' height='20px' viewBox='0 0 20 20' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:sketch='http://www.bohemiancoding.com/sketch/ns'> <!-- Generator: Sketch 3.5.2 (25235) - http://www.bohemiancoding.com/sketch --> <title>Emoji</title> <desc>Created with Sketch.</desc> <defs></defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' sketch:type='MSPage'> <g id='Keyboard/Light/Lower' sketch:type='MSLayerGroup' transform='translate(-60.000000, -181.000000)' fill='#030303'> <g id='Bottom-Row' transform='translate(3.000000, 170.000000)' sketch:type='MSShapeGroup'> <path d='M66.75,30.5 C72.1347763,30.5 76.5,26.1347763 76.5,20.75 C76.5,15.3652237 72.1347763,11 66.75,11 C61.3652237,11 57,15.3652237 57,20.75 C57,26.1347763 61.3652237,30.5 66.75,30.5 Z M66.75,29.5 C71.5824916,29.5 75.5,25.5824916 75.5,20.75 C75.5,15.9175084 71.5824916,12 66.75,12 C61.9175084,12 58,15.9175084 58,20.75 C58,25.5824916 61.9175084,29.5 66.75,29.5 Z M63.75,19 C64.4403559,19 65,18.4403559 65,17.75 C65,17.0596441 64.4403559,16.5 63.75,16.5 C63.0596441,16.5 62.5,17.0596441 62.5,17.75 C62.5,18.4403559 63.0596441,19 63.75,19 Z M69.75,19 C70.4403559,19 71,18.4403559 71,17.75 C71,17.0596441 70.4403559,16.5 69.75,16.5 C69.0596441,16.5 68.5,17.0596441 68.5,17.75 C68.5,18.4403559 69.0596441,19 69.75,19 Z M59.8876334,22.1641444 C59.6390316,21.383134 60.065918,20.9785156 60.8530951,21.2329304 C60.8530951,21.2329304 63.0937503,22.2125 66.7500001,22.2125 C70.4062499,22.2125 72.6469047,21.2329304 72.6469047,21.2329304 C73.4287162,20.9662153 73.8812463,21.4044097 73.6058477,22.1807437 C73.6058477,22.1807437 72.6,27.575 66.75,27.575 C60.9,27.575 59.8876334,22.1641444 59.8876334,22.1641444 Z M66.75,23.1875 C64.06875,23.1875 61.8544055,22.4737821 61.8544055,22.4737821 C61.3273019,22.32948 61.1781233,22.5721615 61.5639555,22.957075 C61.5639555,22.957075 62.3625,24.65 66.75,24.65 C71.1375,24.65 71.9508503,22.9438304 71.9508503,22.9438304 C72.3093659,22.5399278 72.1690793,22.3359844 71.6354273,22.476349 C71.6354273,22.476349 69.43125,23.1875 66.75,23.1875 Z' id='Emoji'></path> </g> </g> </g> </svg>",
  "delete": {
    on: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='24px' height='18px' viewBox='0 0 24 18' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:sketch='http://www.bohemiancoding.com/sketch/ns'> <!-- Generator: Sketch 3.5.2 (25235) - http://www.bohemiancoding.com/sketch --> <title>Back</title> <desc>Created with Sketch.</desc> <defs></defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' sketch:type='MSPage'> <g id='Keyboard/Light/Upper' sketch:type='MSLayerGroup' transform='translate(-339.000000, -130.000000)' fill='#030303'> <g id='Third-Row' transform='translate(3.000000, 118.000000)' sketch:type='MSShapeGroup'> <path d='M351.642663,20.9776903 L354.466795,18.1535585 C354.760106,17.8602476 354.763983,17.3814962 354.47109,17.088603 C354.176155,16.7936677 353.7014,16.7976328 353.406135,17.0928983 L350.582003,19.9170301 L347.757871,17.0928983 C347.46456,16.7995874 346.985809,16.7957097 346.692916,17.088603 C346.39798,17.3835382 346.401945,17.858293 346.697211,18.1535585 L349.521343,20.9776903 L346.697211,23.801822 C346.4039,24.0951329 346.400022,24.5738843 346.692916,24.8667776 C346.987851,25.1617128 347.462606,25.1577477 347.757871,24.8624822 L350.582003,22.0383504 L353.406135,24.8624822 C353.699445,25.1557931 354.178197,25.1596708 354.47109,24.8667776 C354.766025,24.5718423 354.76206,24.0970875 354.466795,23.801822 L351.642663,20.9776903 Z M337.059345,22.0593445 C336.474285,21.4742847 336.481351,20.5186489 337.059345,19.9406555 L343.789915,13.2100853 C344.182084,12.817916 344.94892,12.5 345.507484,12.5 L356.002098,12.5 C357.933936,12.5 359.5,14.0688477 359.5,16.0017983 L359.5,25.9982017 C359.5,27.9321915 357.923088,29.5 356.002098,29.5 L345.507484,29.5 C344.951066,29.5 344.177169,29.1771693 343.789915,28.7899148 L337.059345,22.0593445 Z' id='Back'></path> </g> </g> </g> </svg>",
    off: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='24px' height='18px' viewBox='0 0 24 18' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:sketch='http://www.bohemiancoding.com/sketch/ns'> <!-- Generator: Sketch 3.5.2 (25235) - http://www.bohemiancoding.com/sketch --> <title>Back</title> <desc>Created with Sketch.</desc> <defs></defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' sketch:type='MSPage'> <g id='Keyboard/Light/Upper' sketch:type='MSLayerGroup' transform='translate(-339.000000, -130.000000)' fill='#030303'> <g id='Third-Row' transform='translate(3.000000, 118.000000)' sketch:type='MSShapeGroup'> <path d='M337.059345,22.0593445 C336.474285,21.4742847 336.481351,20.5186489 337.059345,19.9406555 L343.789915,13.2100853 C344.182084,12.817916 344.94892,12.5 345.507484,12.5 L356.002098,12.5 C357.933936,12.5 359.5,14.0688477 359.5,16.0017983 L359.5,25.9982017 C359.5,27.9321915 357.923088,29.5 356.002098,29.5 L345.507484,29.5 C344.951066,29.5 344.177169,29.1771693 343.789915,28.7899148 L337.059345,22.0593445 Z M351.642663,20.9776903 L354.466795,18.1535585 C354.760106,17.8602476 354.763983,17.3814962 354.47109,17.088603 C354.176155,16.7936677 353.7014,16.7976328 353.406135,17.0928983 L350.582003,19.9170301 L347.757871,17.0928983 C347.46456,16.7995874 346.985809,16.7957097 346.692916,17.088603 C346.39798,17.3835382 346.401945,17.858293 346.697211,18.1535585 L349.521343,20.9776903 L346.697211,23.801822 C346.4039,24.0951329 346.400022,24.5738843 346.692916,24.8667776 C346.987851,25.1617128 347.462606,25.1577477 347.757871,24.8624822 L350.582003,22.0383504 L353.406135,24.8624822 C353.699445,25.1557931 354.178197,25.1596708 354.47109,24.8667776 C354.766025,24.5718423 354.76206,24.0970875 354.466795,23.801822 L351.642663,20.9776903 Z M338.70972,21.7097195 C338.317752,21.3177522 338.318965,20.6810349 338.70972,20.2902805 L344.643245,14.3567547 C344.840276,14.1597245 345.225639,14 345.493741,14 L355.997239,14 C357.103333,14 357.999999,14.8970601 357.999999,16.0058586 L357.999999,25.9941412 C357.999999,27.1019464 357.106457,27.9999999 355.997239,27.9999999 L345.493741,28 C345.221056,28 344.840643,27.8406431 344.643246,27.6432453 L338.70972,21.7097195 Z' id='Back'></path> </g> </g> </g> </svg>"
  },
  food: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='17px' height='16px' viewBox='0 0 17 17' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:sketch='http://www.bohemiancoding.com/sketch/ns'> <!-- Generator: Sketch 3.5.2 (25235) - http://www.bohemiancoding.com/sketch --> <title>Food</title> <desc>Created with Sketch.</desc> <defs></defs> <g id='iOS-9-Keyboards' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' sketch:type='MSPage'> <g id='iPhone-6-Portrait-Light-Copy' sketch:type='MSArtboardGroup' transform='translate(-148.000000, -637.000000)'> <g id='Keyboards' sketch:type='MSLayerGroup' transform='translate(0.000000, 408.000000)'> <g id='Food' transform='translate(149.500000, 229.500000)' sketch:type='MSShapeGroup'> <path d='M5.5,15.5 L1,15.5 L0,5 L6.5,5 L6.26360933,7.48210202' id='Drink' stroke='#4A5461'></path> <path d='M6.01077545,1.96930098 L6.51571352,5.22270539 L5.71908184,5.67947812 L5.0389009,1.96930098 L4.85557247,1.96930098 L4.85557247,0.96930098 L8.85557247,0.96930098 L8.85557247,1.96930098 L6.01077545,1.96930098 Z' id='Straw' fill='#4A5461' transform='translate(6.855572, 3.324390) rotate(24.000000) translate(-6.855572, -3.324390) '></path> <rect id='Bottom-Bun' stroke='#4A5461' x='3' y='14' width='10.5' height='1.5' rx='1'></rect> <path d='M1.5,12.5024408 C1.5,11.948808 1.94916916,11.5 2.49268723,11.5 L14.0073128,11.5 C14.5555588,11.5 15,11.9469499 15,12.5024408 L15,12.9975592 C15,13.551192 14.5508308,14 14.0073128,14 L2.49268723,14 C1.94444121,14 1.5,13.5530501 1.5,12.9975592 L1.5,12.5024408 Z M3.93300003,11.8392727 C3.41771834,11.6518976 3.44483697,11.5 3.9955775,11.5 L13.0044225,11.5 C13.5542648,11.5 13.5866061,11.6503251 13.067,11.8392727 L8.5,13.5 L3.93300003,11.8392727 Z' id='&quot;Patty&quot;' fill='#4A5461'></path> <path d='M2.5,10.5 L13.5,10.5 L15,11.5 L1,11.5 L2.5,10.5 Z' id='Cheese' fill='#4A5461'></path> <path d='M8.25,10.5 C11.4256373,10.5 14,10.3284271 14,9.5 C14,8.67157288 11.4256373,8 8.25,8 C5.07436269,8 2.5,8.67157288 2.5,9.5 C2.5,10.3284271 5.07436269,10.5 8.25,10.5 Z' id='Top-Bun' stroke='#4A5461' stroke-width='0.75'></path> </g> </g> </g> </g> </svg>",
  flags: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='11px' height='15px' viewBox='0 0 11 15' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:sketch='http://www.bohemiancoding.com/sketch/ns'> <!-- Generator: Sketch 3.5.2 (25235) - http://www.bohemiancoding.com/sketch --> <title>Flag</title> <desc>Created with Sketch.</desc> <defs></defs> <g id='iOS-9-Keyboards' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' sketch:type='MSPage'> <g id='iPhone-6-Portrait-Light-Copy' sketch:type='MSArtboardGroup' transform='translate(-275.000000, -639.000000)'> <g id='Keyboards' sketch:type='MSLayerGroup' transform='translate(0.000000, 408.000000)'> <g id='Flag' transform='translate(275.000000, 231.500000)' sketch:type='MSShapeGroup'> <rect id='Pole' fill='#4A5461' x='0' y='0' width='1' height='14'></rect> <path d='M1,1 C1,1 1.25,2 3.5,2 C5.75,2 6,0.749999998 8,0.75 C10,0.749999998 10,1.5 10,1.5 L10,7.5 C10,7.5 10,6.5 8,6.5 C6,6.5 4.80623911,8 3.5,8 C2.19376089,8 1,7 1,7 L1,1 Z' stroke='#4A5461' stroke-linejoin='round'></path> </g> </g> </g> </g> </svg>",
  frequent: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='17px' height='16px' viewBox='0 0 17 16' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:sketch='http://www.bohemiancoding.com/sketch/ns'> <!-- Generator: Sketch 3.5.2 (25235) - http://www.bohemiancoding.com/sketch --> <title>Recent</title> <desc>Created with Sketch.</desc> <defs></defs> <g id='iOS-9-Keyboards' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' sketch:type='MSPage'> <g id='iPhone-6-Portrait-Light-Copy' sketch:type='MSArtboardGroup' transform='translate(-55.000000, -638.000000)'> <g id='Keyboards' sketch:type='MSLayerGroup' transform='translate(0.000000, 408.000000)'> <g id='Recent' transform='translate(55.500000, 230.000000)' sketch:type='MSShapeGroup'> <circle id='Body' stroke='#4A5461' cx='8' cy='8' r='8'></circle> <path d='M7.5,7.5 L7.5,8.5 L8.5,8.5 L8.5,2 L7.5,2 L7.5,7.5 L4,7.5 L4,8.5 L8.5,8.5 L8.5,7.5 L7.5,7.5 Z' id='Hands' fill='#4A5461'></path> </g> </g> </g> </g> </svg>",
  keyboard: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='32.5px' height='23.5px' viewBox='0 0 65 47' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 3.6.1 (26313) - http://www.bohemiancoding.com/sketch --> <title>Shape</title> <desc>Created with Sketch.</desc> <defs></defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'> <g id='iPad-Portrait' transform='translate(-1436.000000, -1956.000000)' fill='#000000'> <g id='Keyboard-Light' transform='translate(0.000000, 1422.000000)'> <g id='Keyboard-down' transform='translate(1412.000000, 500.000000)'> <path d='M87.001332,34 C88.1051659,34 89,34.8997127 89,35.9932874 L89,61.0067126 C89,62.1075748 88.1058759,63 87.001332,63 L25.998668,63 C24.8948341,63 24,62.1002873 24,61.0067126 L24,35.9932874 C24,34.8924252 24.8941241,34 25.998668,34 L87.001332,34 Z M26,36 L26,61 L87,61 L87,36 L26,36 Z M79,40 L83,40 L83,44 L79,44 L79,40 Z M72,40 L76,40 L76,44 L72,44 L72,40 Z M65,40 L69,40 L69,44 L65,44 L65,40 Z M58,40 L62,40 L62,44 L58,44 L58,40 Z M51,40 L55,40 L55,44 L51,44 L51,40 Z M44,40 L48,40 L48,44 L44,44 L44,40 Z M37,40 L41,40 L41,44 L37,44 L37,40 Z M30,40 L34,40 L34,44 L30,44 L30,40 Z M79,47 L83,47 L83,51 L79,51 L79,47 Z M72,47 L76,47 L76,51 L72,51 L72,47 Z M65,47 L69,47 L69,51 L65,51 L65,47 Z M58,47 L62,47 L62,51 L58,51 L58,47 Z M51,47 L55,47 L55,51 L51,51 L51,47 Z M44,47 L48,47 L48,51 L44,51 L44,47 Z M37,47 L41,47 L41,51 L37,51 L37,47 Z M30,47 L34,47 L34,51 L30,51 L30,47 Z M79,54 L83,54 L83,58 L79,58 L79,54 Z M72,54 L76,54 L76,58 L72,58 L72,54 Z M44,54 L69,54 L69,58 L44,58 L44,54 Z M37,54 L41,54 L41,58 L37,58 L37,54 Z M30,54 L34,54 L34,58 L30,58 L30,54 Z M44.3163498,69.9771047 C43.3684225,70.5420342 43.3338721,71.5096495 44.2378217,72.1373912 L55.3621539,79.8626088 C56.2667113,80.4907726 57.7338965,80.4903505 58.6378461,79.8626088 L69.7621783,72.1373912 C70.6667357,71.5092274 70.648012,70.5205204 69.7115187,69.9234166 L69.9825731,70.0962396 C69.5181333,69.800115 68.7782557,69.8126493 68.3261307,70.1269323 L57.8154999,77.4331263 C57.3651117,77.746202 56.628165,77.7381786 56.1762103,77.4199424 L45.8386137,70.1408977 C45.3836472,69.8205407 44.6375039,69.7857088 44.1566393,70.0722862 L44.3163498,69.9771047 Z' id='Shape'></path> </g> </g> </g> </g> </svg>",
  keyPopUp: {
    light: {
      "iphone-5": "<svg width='55px' height='92px' viewBox='53 316 55 92' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 3.7.2 (28276) - http://www.bohemiancoding.com/sketch --> <desc>Created with Sketch.</desc> <defs> <filter x='-50%' y='-50%' width='200%' height='200%' filterUnits='objectBoundingBox' id='filter-1'> <feOffset dx='0' dy='1' in='SourceAlpha' result='shadowOffsetOuter1'></feOffset> <feGaussianBlur stdDeviation='1.5' in='shadowOffsetOuter1' result='shadowBlurOuter1'></feGaussianBlur> <feColorMatrix values='0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.4 0' type='matrix' in='shadowBlurOuter1' result='shadowMatrixOuter1'></feColorMatrix> <feMerge> <feMergeNode in='shadowMatrixOuter1'></feMergeNode> <feMergeNode in='SourceGraphic'></feMergeNode> </feMerge> </filter> <path d='M1.34173231,40.9391701 C0.517466128,40.20589 0,39.1374251 0,37.9477635 L0,4.00345598 C0,1.78917136 1.79528248,0 4.00987566,0 L44.9901243,0 C47.2125608,0 49,1.7924083 49,4.00345598 L49,37.9477635 C49,38.9124051 48.6592798,39.7963659 48.0916041,40.4868665 C48.0414233,40.9032289 47.7111888,41.4074672 47.0825908,41.95225 C47.0825908,41.95225 38.5299145,49.0643362 38.5299145,51.1526424 C38.5299145,61.6497561 38.1770099,82.0025406 38.1770099,82.0025406 C38.1412304,84.2024354 36.3210284,86 34.1128495,86 L15.3059539,86 C13.10796,86 11.2781884,84.2100789 11.2417936,82.0020993 C11.2417936,82.0020993 10.8888889,61.6470852 10.8888889,51.1486361 C10.8888889,49.0616654 2.34143662,42.238655 2.34143662,42.238655 C1.77827311,41.7641365 1.44881354,41.3204237 1.34173231,40.9391701 Z' id='path-2'></path> <mask id='mask-3' maskContentUnits='userSpaceOnUse' maskUnits='objectBoundingBox' x='0' y='0' width='49' height='86' fill='white'> <use xlink:href='#path-2'></use> </mask> </defs> <g id='Popover' filter='url(#filter-1)' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' transform='translate(56.000000, 318.000000)'> <use id='Rectangle-14' stroke='#B2B4B9' mask='url(#mask-3)' fill='#FCFCFC' xlink:href='#path-2'></use> </g> </svg>",
      "iphone-6s": "<svg width='64px' height='107px' viewBox='24 387 64 107' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 3.7.2 (28276) - http://www.bohemiancoding.com/sketch --> <desc>Created with Sketch.</desc> <defs> <filter x='-50%' y='-50%' width='200%' height='200%' filterUnits='objectBoundingBox' id='filter-1'> <feOffset dx='0' dy='1' in='SourceAlpha' result='shadowOffsetOuter1'></feOffset> <feGaussianBlur stdDeviation='1.5' in='shadowOffsetOuter1' result='shadowBlurOuter1'></feGaussianBlur> <feColorMatrix values='0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.4 0' type='matrix' in='shadowBlurOuter1' result='shadowMatrixOuter1'></feColorMatrix> <feMerge> <feMergeNode in='shadowMatrixOuter1'></feMergeNode> <feMergeNode in='SourceGraphic'></feMergeNode> </feMerge> </filter> <path d='M1.48647646,48.3779947 C0.58026649,47.6464296 0,46.529587 0,45.2781948 L0,3.99009787 C0,1.7825912 1.79509577,0 4.00945862,0 L53.9905414,0 C56.2005746,0 58,1.78642767 58,3.99009787 L58,45.2781948 C58,46.1833004 57.6982258,47.0169733 57.1895097,47.6856325 C57.0396865,48.0212497 56.7360098,48.3972834 56.2718363,48.7950661 C56.2718363,48.7950661 45.6068376,57.6220693 45.6068376,60.0746149 C45.6068376,72.4026205 45.177967,96.9923164 45.177967,96.9923164 C45.1413748,99.2122214 43.3193065,101 41.1090035,101 L17.386723,101 C15.1812722,101 13.354683,99.2055009 13.3177595,96.9918741 C13.3177595,96.9918741 12.8888889,72.3994838 12.8888889,60.0699099 C12.8888889,57.6189326 2.22673437,49.1462936 2.22673437,49.1462936 C1.90524087,48.8788327 1.65911655,48.620733 1.48647646,48.3779947 Z' id='path-2'></path> <mask id='mask-3' maskContentUnits='userSpaceOnUse' maskUnits='objectBoundingBox' x='0' y='0' width='58' height='101' fill='white'> <use xlink:href='#path-2'></use> </mask> </defs> <g id='Popover' filter='url(#filter-1)' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' transform='translate(27.000000, 389.000000)'> <use id='Rectangle-14' stroke='#B2B4B9' mask='url(#mask-3)' fill='#FCFCFC' xlink:href='#path-2'></use> </g> </svg>",
      "iphone-6s-plus": "<svg width='70px' height='119px' viewBox='28 450 70 119' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 3.7.2 (28276) - http://www.bohemiancoding.com/sketch --> <desc>Created with Sketch.</desc> <defs> <filter x='-50%' y='-50%' width='200%' height='200%' filterUnits='objectBoundingBox' id='filter-1'> <feOffset dx='0' dy='1' in='SourceAlpha' result='shadowOffsetOuter1'></feOffset> <feGaussianBlur stdDeviation='1.5' in='shadowOffsetOuter1' result='shadowBlurOuter1'></feGaussianBlur> <feColorMatrix values='0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.4 0' type='matrix' in='shadowBlurOuter1' result='shadowMatrixOuter1'></feColorMatrix> <feMerge> <feMergeNode in='shadowMatrixOuter1'></feMergeNode> <feMergeNode in='SourceGraphic'></feMergeNode> </feMerge> </filter> <path d='M1.95729395,54.0728304 C0.785911132,53.3757699 0,52.098776 0,50.6389022 L0,3.99524419 C0,1.78671428 1.79242202,0 4.00348663,0 L59.9965134,0 C62.2046235,0 64,1.78873175 64,3.99524419 L64,50.6389022 C64,51.9233686 63.3937116,53.0651556 62.451391,53.795754 C62.4427752,53.8032433 62.4341019,53.8107404 62.4253709,53.8182454 C62.4253709,53.8182454 50.3247863,63.8977402 50.3247863,66.6173947 C50.3247863,80.2880544 49.8443049,108.002007 49.8443049,108.002007 C49.8079665,110.210234 47.9874232,112 45.7789089,112 L18.7680997,112 C16.5534397,112 14.7394456,110.20984 14.7027037,108.001566 C14.7027037,108.001566 14.2222222,80.2845761 14.2222222,66.6121773 C14.2222222,63.8942619 2.14081422,54.2321337 2.14081422,54.2321337 C2.07664913,54.1786298 2.01548111,54.1255134 1.95729395,54.0728304 Z' id='path-2'></path> <mask id='mask-3' maskContentUnits='userSpaceOnUse' maskUnits='objectBoundingBox' x='0' y='0' width='64' height='112' fill='white'> <use xlink:href='#path-2'></use> </mask> </defs> <g id='Popover' filter='url(#filter-1)' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' transform='translate(31.000000, 452.000000)'> <use id='Rectangle-14' stroke='#B2B4B9' mask='url(#mask-3)' fill='#FCFCFC' xlink:href='#path-2'></use> </g> </svg>"
    },
    dark: {
      "iphone-5": "<svg width='55px' height='92px' viewBox='53 316 55 92' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 3.7.2 (28276) - http://www.bohemiancoding.com/sketch --> <desc>Created with Sketch.</desc> <defs> <filter x='-50%' y='-50%' width='200%' height='200%' filterUnits='objectBoundingBox' id='filter-1'> <feOffset dx='0' dy='1' in='SourceAlpha' result='shadowOffsetOuter1'></feOffset> <feGaussianBlur stdDeviation='1.5' in='shadowOffsetOuter1' result='shadowBlurOuter1'></feGaussianBlur> <feColorMatrix values='0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.4 0' type='matrix' in='shadowBlurOuter1' result='shadowMatrixOuter1'></feColorMatrix> <feMerge> <feMergeNode in='shadowMatrixOuter1'></feMergeNode> <feMergeNode in='SourceGraphic'></feMergeNode> </feMerge> </filter> <path d='M1.34173231,40.9391701 C0.517466128,40.20589 0,39.1374251 0,37.9477635 L0,4.00345598 C0,1.78917136 1.79528248,0 4.00987566,0 L44.9901243,0 C47.2125608,0 49,1.7924083 49,4.00345598 L49,37.9477635 C49,38.9124051 48.6592798,39.7963659 48.0916041,40.4868665 C48.0414233,40.9032289 47.7111888,41.4074672 47.0825908,41.95225 C47.0825908,41.95225 38.5299145,49.0643362 38.5299145,51.1526424 C38.5299145,61.6497561 38.1770099,82.0025406 38.1770099,82.0025406 C38.1412304,84.2024354 36.3210284,86 34.1128495,86 L15.3059539,86 C13.10796,86 11.2781884,84.2100789 11.2417936,82.0020993 C11.2417936,82.0020993 10.8888889,61.6470852 10.8888889,51.1486361 C10.8888889,49.0616654 2.34143662,42.238655 2.34143662,42.238655 C1.77827311,41.7641365 1.44881354,41.3204237 1.34173231,40.9391701 Z' id='path-2'></path> <mask id='mask-3' maskContentUnits='userSpaceOnUse' maskUnits='objectBoundingBox' x='0' y='0' width='49' height='86' fill='white'> <use xlink:href='#path-2'></use> </mask> </defs> <g id='Popover' filter='url(#filter-1)' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' transform='translate(56.000000, 318.000000)'> <use id='Rectangle-14' stroke='#636363' mask='url(#mask-3)' fill='#636363' xlink:href='#path-2'></use> </g> </svg>",
      "iphone-6s": "<svg width='64px' height='107px' viewBox='24 387 64 107' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 3.7.2 (28276) - http://www.bohemiancoding.com/sketch --> <desc>Created with Sketch.</desc> <defs> <filter x='-50%' y='-50%' width='200%' height='200%' filterUnits='objectBoundingBox' id='filter-1'> <feOffset dx='0' dy='1' in='SourceAlpha' result='shadowOffsetOuter1'></feOffset> <feGaussianBlur stdDeviation='1.5' in='shadowOffsetOuter1' result='shadowBlurOuter1'></feGaussianBlur> <feColorMatrix values='0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.4 0' type='matrix' in='shadowBlurOuter1' result='shadowMatrixOuter1'></feColorMatrix> <feMerge> <feMergeNode in='shadowMatrixOuter1'></feMergeNode> <feMergeNode in='SourceGraphic'></feMergeNode> </feMerge> </filter> <path d='M1.48647646,48.3779947 C0.58026649,47.6464296 0,46.529587 0,45.2781948 L0,3.99009787 C0,1.7825912 1.79509577,0 4.00945862,0 L53.9905414,0 C56.2005746,0 58,1.78642767 58,3.99009787 L58,45.2781948 C58,46.1833004 57.6982258,47.0169733 57.1895097,47.6856325 C57.0396865,48.0212497 56.7360098,48.3972834 56.2718363,48.7950661 C56.2718363,48.7950661 45.6068376,57.6220693 45.6068376,60.0746149 C45.6068376,72.4026205 45.177967,96.9923164 45.177967,96.9923164 C45.1413748,99.2122214 43.3193065,101 41.1090035,101 L17.386723,101 C15.1812722,101 13.354683,99.2055009 13.3177595,96.9918741 C13.3177595,96.9918741 12.8888889,72.3994838 12.8888889,60.0699099 C12.8888889,57.6189326 2.22673437,49.1462936 2.22673437,49.1462936 C1.90524087,48.8788327 1.65911655,48.620733 1.48647646,48.3779947 Z' id='path-2'></path> <mask id='mask-3' maskContentUnits='userSpaceOnUse' maskUnits='objectBoundingBox' x='0' y='0' width='58' height='101' fill='white'> <use xlink:href='#path-2'></use> </mask> </defs> <g id='Popover' filter='url(#filter-1)' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' transform='translate(27.000000, 389.000000)'> <use id='Rectangle-14' stroke='##636363' mask='url(#mask-3)' fill='#636363' xlink:href='#path-2'></use> </g> </svg>",
      "iphone-6s-plus": "<svg width='70px' height='119px' viewBox='28 450 70 119' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 3.7.2 (28276) - http://www.bohemiancoding.com/sketch --> <desc>Created with Sketch.</desc> <defs> <filter x='-50%' y='-50%' width='200%' height='200%' filterUnits='objectBoundingBox' id='filter-1'> <feOffset dx='0' dy='1' in='SourceAlpha' result='shadowOffsetOuter1'></feOffset> <feGaussianBlur stdDeviation='1.5' in='shadowOffsetOuter1' result='shadowBlurOuter1'></feGaussianBlur> <feColorMatrix values='0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.4 0' type='matrix' in='shadowBlurOuter1' result='shadowMatrixOuter1'></feColorMatrix> <feMerge> <feMergeNode in='shadowMatrixOuter1'></feMergeNode> <feMergeNode in='SourceGraphic'></feMergeNode> </feMerge> </filter> <path d='M1.95729395,54.0728304 C0.785911132,53.3757699 0,52.098776 0,50.6389022 L0,3.99524419 C0,1.78671428 1.79242202,0 4.00348663,0 L59.9965134,0 C62.2046235,0 64,1.78873175 64,3.99524419 L64,50.6389022 C64,51.9233686 63.3937116,53.0651556 62.451391,53.795754 C62.4427752,53.8032433 62.4341019,53.8107404 62.4253709,53.8182454 C62.4253709,53.8182454 50.3247863,63.8977402 50.3247863,66.6173947 C50.3247863,80.2880544 49.8443049,108.002007 49.8443049,108.002007 C49.8079665,110.210234 47.9874232,112 45.7789089,112 L18.7680997,112 C16.5534397,112 14.7394456,110.20984 14.7027037,108.001566 C14.7027037,108.001566 14.2222222,80.2845761 14.2222222,66.6121773 C14.2222222,63.8942619 2.14081422,54.2321337 2.14081422,54.2321337 C2.07664913,54.1786298 2.01548111,54.1255134 1.95729395,54.0728304 Z' id='path-2'></path> <mask id='mask-3' maskContentUnits='userSpaceOnUse' maskUnits='objectBoundingBox' x='0' y='0' width='64' height='112' fill='white'> <use xlink:href='#path-2'></use> </mask> </defs> <g id='Popover' filter='url(#filter-1)' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' transform='translate(31.000000, 452.000000)'> <use id='Rectangle-14' stroke='#636363' mask='url(#mask-3)' fill='#636363' xlink:href='#path-2'></use> </g> </svg>"
    }
  },
  objects: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='11px' height='16px' viewBox='0 0 11 16' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:sketch='http://www.bohemiancoding.com/sketch/ns'> <!-- Generator: Sketch 3.5.2 (25235) - http://www.bohemiancoding.com/sketch --> <title>Lightbulb</title> <desc>Created with Sketch.</desc> <defs></defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' sketch:type='MSPage'> <g id='iPhone-6' sketch:type='MSArtboardGroup' transform='translate(-244.000000, -639.000000)' stroke='#4A5361'> <g id='Lightbulb' sketch:type='MSLayerGroup' transform='translate(244.000000, 639.000000)'> <path d='M8,10.4002904 C9.78083795,9.48993491 11,7.63734273 11,5.5 C11,2.46243388 8.53756612,0 5.5,0 C2.46243388,0 0,2.46243388 0,5.5 C0,7.63734273 1.21916205,9.48993491 3,10.4002904 L3,14.0020869 C3,15.1017394 3.89761602,16 5.0048815,16 L5.9951185,16 C7.1061002,16 8,15.1055038 8,14.0020869 L8,10.4002904 Z' id='Oval-17' sketch:type='MSShapeGroup'></path> <rect id='Rectangle-50' sketch:type='MSShapeGroup' x='3' y='12' width='5' height='1'></rect> <rect id='Rectangle-51' sketch:type='MSShapeGroup' x='4' y='13.5' width='1.5' height='1'></rect> <path d='M5,8.5 C5,8.5 3.49999999,7.50000001 4,7 C4.50000001,6.49999999 5,7.66666667 5.5,8 C5.5,8 6.5,6.50000001 7,7 C7.5,7.49999999 6,8.5 6,8.5 L6,11 L5,11 L5,8.5 Z' id='Rectangle-52' sketch:type='MSShapeGroup'></path> </g> </g> </g> </svg>",
  shift: {
    on: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='20px' height='18px' viewBox='0 0 20 17' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:sketch='http://www.bohemiancoding.com/sketch/ns'> <!-- Generator: Sketch 3.5.2 (25235) - http://www.bohemiancoding.com/sketch --> <title>Shift</title> <desc>Created with Sketch.</desc> <defs></defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' sketch:type='MSPage'> <g id='Keyboard/Light/Upper' sketch:type='MSLayerGroup' transform='translate(-14.000000, -130.000000)' fill='#030303'> <g id='Third-Row' transform='translate(3.000000, 118.000000)' sketch:type='MSShapeGroup'> <path d='M21.7052388,13.2052388 C21.3157462,12.8157462 20.6857559,12.8142441 20.2947612,13.2052388 L11.9160767,21.5839233 C11.1339991,22.3660009 11.3982606,23 12.4979131,23 L16.5,23 L16.5,28.009222 C16.5,28.5564136 16.9463114,29 17.4975446,29 L24.5024554,29 C25.053384,29 25.5,28.5490248 25.5,28.009222 L25.5,23 L29.5020869,23 C30.6055038,23 30.866824,22.366824 30.0839233,21.5839233 L21.7052388,13.2052388 Z' id='Shift'></path> </g> </g> </g> </svg>",
    off: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='20px' height='18px' viewBox='0 0 20 19' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:sketch='http://www.bohemiancoding.com/sketch/ns'> <!-- Generator: Sketch 3.5.2 (25235) - http://www.bohemiancoding.com/sketch --> <title>Shift</title> <desc>Created with Sketch.</desc> <defs></defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' sketch:type='MSPage'> <g id='Keyboard/Light/Lower' sketch:type='MSLayerGroup' transform='translate(-14.000000, -129.000000)' fill='#030303'> <g id='Third-Row' transform='translate(3.000000, 118.000000)' sketch:type='MSShapeGroup'> <path d='M21.6719008,12.2325898 C21.301032,11.8279916 20.6946892,11.8334731 20.3288195,12.2325898 L11.6947023,21.6512983 C10.7587441,22.672308 11.1285541,23.5 12.5097751,23.5 L15.9999999,23.5000002 L15.9999999,28.0014241 C15.9999999,28.8290648 16.6716559,29.5000001 17.497101,29.5000001 L24.5028992,29.5000001 C25.3297253,29.5000001 26.0000003,28.8349703 26.0000003,28.0014241 L26.0000003,23.5000001 L29.4902251,23.5000002 C30.8763357,23.5000002 31.2439521,22.6751916 30.3054161,21.6512985 L21.6719008,12.2325898 Z M21.341748,14.3645316 C21.1530056,14.1632064 20.8433515,14.1670914 20.6582514,14.3645316 L13.5,21.9999998 L17.5000001,21.9999999 L17.5000002,27.5089956 C17.5000002,27.7801703 17.7329027,28.0000008 18.0034229,28.0000008 L23.996577,28.0000008 C24.2746097,28.0000008 24.4999997,27.7721203 24.4999997,27.5089956 L24.4999997,21.9999999 L28.5,21.9999999 L21.341748,14.3645316 Z' id='Shift'></path> </g> </g> </g> </svg>"
  },
  messages_app: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='60px' height='60px' viewBox='0 0 60 60' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 39.1 (31720) - http://www.bohemiancoding.com/sketch --> <title>Messages Copy</title> <desc>Created with Sketch.</desc> <defs> <linearGradient x1='50%' y1='0%' x2='50%' y2='100%' id='linearGradient-1'> <stop stop-color='#66FD7F' offset='0%'></stop> <stop stop-color='#09B826' offset='100%'></stop> </linearGradient> </defs> <g id='iOS-Kit' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'> <g id='Home-Screen' transform='translate(-1452.000000, -853.000000)'> <g id='Home-Screen-•-iPhone-6s-Plus' transform='translate(1417.000000, 812.000000)'> <g id='Messages-Copy' transform='translate(35.000000, 41.000000)'> <rect id='BG' fill='url(#linearGradient-1)' x='0' y='0' width='60' height='60' rx='14'></rect> <path d='M19.4223976,44.3088006 C13.1664228,41.1348949 9,35.4655421 9,29 C9,19.0588745 18.8497355,11 31,11 C43.1502645,11 53,19.0588745 53,29 C53,38.9411255 43.1502645,47 31,47 C28.6994588,47 26.4813914,46.7110897 24.3970409,46.1751953 C23.9442653,46.8838143 21.9065377,49.5 16.5,49.5 C15.6150187,49.5 17.1834749,48.5915921 18,47.5 C18.7894286,46.4446326 19.2505625,44.9480362 19.4223976,44.3088006 Z' id='Bubble' fill='#FFFFFF'></path> </g> </g> </g> </g> </svg>",
  calendar_app: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='60px' height='60px' viewBox='0 0 60 60' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 39.1 (31720) - http://www.bohemiancoding.com/sketch --> <title>Calendar</title> <desc>Created with Sketch.</desc> <defs></defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'> <g id='Home-Screen-•-iPhone-SE' transform='translate(-92.000000, -27.000000)'> <g id='Home-Screen-•-iPhone-6s-Copy' transform='translate(0.000000, 27.000000)'> <g id='Calendar' transform='translate(92.000000, 0.000000)'> <rect id='BG' fill='#FFFFFF' x='0' y='0' width='60' height='60' rx='14'></rect> <text id='25' font-family='SFUIDisplay-Ultralight, SF UI Display' font-size='40' font-weight='200' letter-spacing='0.379999995' fill='#000000'> <tspan x='7.10828125' y='49'>25</tspan> </text> <text id='Monday' font-family='SFUIDisplay-Medium, SF UI Display' font-size='11' font-weight='400' letter-spacing='0.379999995' fill='#FF3B30'> <tspan x='9.02992189' y='15'>Monday</tspan> </text> </g> </g> </g> </g> </svg>",
  photos_app: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='60px' height='60px' viewBox='0 0 60 60' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 39.1 (31720) - http://www.bohemiancoding.com/sketch --> <title>Photos</title> <desc>Created with Sketch.</desc> <defs></defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'> <g id='Home-Screen-•-iPhone-SE' transform='translate(-168.000000, -27.000000)'> <g id='Home-Screen-•-iPhone-6s-Copy' transform='translate(0.000000, 27.000000)'> <g id='Photos' transform='translate(168.000000, 0.000000)'> <rect id='BG' fill='#FFFFFF' x='0' y='0' width='60' height='60' rx='14'></rect> <rect id='Pedal' fill='#F26E64' style='mix-blend-mode: multiply;' transform='translate(20.142136, 20.142136) rotate(45.000000) translate(-20.142136, -20.142136) ' x='8.14213562' y='12.1421356' width='24' height='16' rx='8'></rect> <rect id='Pedal' fill='#F0E22A' style='mix-blend-mode: multiply;' transform='translate(39.142136, 19.142136) rotate(135.000000) translate(-39.142136, -19.142136) ' x='27.1421356' y='11.1421356' width='24' height='16' rx='8'></rect> <rect id='Pedal' fill='#D288B1' style='mix-blend-mode: multiply;' x='4' y='22' width='24' height='16' rx='8'></rect> <rect id='Pedal' fill='#FBAD31' style='mix-blend-mode: multiply;' transform='translate(30.000000, 16.000000) rotate(90.000000) translate(-30.000000, -16.000000) ' x='18' y='8' width='24' height='16' rx='8'></rect> <rect id='Pedal' fill='#A58EC2' style='mix-blend-mode: multiply;' transform='translate(20.142136, 40.142136) scale(1, -1) rotate(45.000000) translate(-20.142136, -40.142136) ' x='8.14213562' y='32.1421356' width='24' height='16' rx='8'></rect> <rect id='Pedal' fill='#6CC199' style='mix-blend-mode: multiply;' transform='translate(40.142136, 40.142136) scale(1, -1) rotate(135.000000) translate(-40.142136, -40.142136) ' x='28.1421356' y='32.1421356' width='24' height='16' rx='8'></rect> <rect id='Pedal' fill='#77AEDD' style='mix-blend-mode: multiply;' transform='translate(30.000000, 44.000000) scale(1, -1) rotate(90.000000) translate(-30.000000, -44.000000) ' x='18' y='36' width='24' height='16' rx='8'></rect> <rect id='Pedal' fill='#B5D655' style='mix-blend-mode: multiply;' transform='translate(44.000000, 30.000000) rotate(180.000000) translate(-44.000000, -30.000000) ' x='32' y='22' width='24' height='16' rx='8'></rect> </g> </g> </g> </g> </svg>",
  camera_app: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='60px' height='60px' viewBox='0 0 60 60' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 39.1 (31720) - http://www.bohemiancoding.com/sketch --> <title>Camera</title> <desc>Created with Sketch.</desc> <defs> <linearGradient x1='50%' y1='0%' x2='50%' y2='100%' id='linearGradient-1'> <stop stop-color='#DBDDDE' offset='0%'></stop> <stop stop-color='#898B91' offset='100%'></stop> </linearGradient> <linearGradient x1='50%' y1='0%' x2='50%' y2='100%' id='linearGradient-2'> <stop stop-color='#474747' offset='0%'></stop> <stop stop-color='#2B2B2B' offset='100%'></stop> </linearGradient> <path d='M9,20 L51,20 L51,42 L9,42 L9,20 Z M9,42.9975722 C9,44.3795877 10.1199653,45.5 11.5015125,45.5 L48.4984875,45.5 C49.8766015,45.5 51,44.3796249 51,42.9975722 L51,42.5 L9,42.5 L9,42.9975722 Z M9,19.5 L9,19.0024278 C9,17.6203751 10.1233985,16.5 11.5015125,16.5 L17.5304496,16.5 C18.4572011,16.4180186 19.3218208,16.2416313 19.9205322,15.8902588 C21.8326425,14.7680772 21.9641113,11.5 24.996205,11.5 L30.026083,11.5 L35.0559611,11.5 C38.0880548,11.5 38.2195236,14.7680772 40.1316339,15.8902588 C40.7303453,16.2416313 41.594965,16.4180186 42.5217165,16.5 L48.4984875,16.5 C49.8800347,16.5 51,17.6204123 51,19.0024278 L51,19.5 L9,19.5 L9,19.5 Z M39.25,31 C39.25,25.8913661 35.1086339,21.75 30,21.75 C24.8913661,21.75 20.75,25.8913661 20.75,31 C20.75,36.1086339 24.8913661,40.25 30,40.25 C35.1086339,40.25 39.25,36.1086339 39.25,31 L39.25,31 Z M22.25,31 C22.25,26.7197932 25.7197932,23.25 30,23.25 C34.2802068,23.25 37.75,26.7197932 37.75,31 C37.75,35.2802068 34.2802068,38.75 30,38.75 C25.7197932,38.75 22.25,35.2802068 22.25,31 L22.25,31 Z' id='path-3'></path> <filter x='-50%' y='-50%' width='200%' height='200%' filterUnits='objectBoundingBox' id='filter-4'> <feOffset dx='0' dy='1' in='SourceAlpha' result='shadowOffsetOuter1'></feOffset> <feColorMatrix values='0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.5 0' type='matrix' in='shadowOffsetOuter1'></feColorMatrix> </filter> <filter x='-50%' y='-50%' width='200%' height='200%' filterUnits='objectBoundingBox' id='filter-5'> <feGaussianBlur stdDeviation='1' in='SourceAlpha' result='shadowBlurInner1'></feGaussianBlur> <feOffset dx='0' dy='1' in='shadowBlurInner1' result='shadowOffsetInner1'></feOffset> <feComposite in='shadowOffsetInner1' in2='SourceAlpha' operator='arithmetic' k2='-1' k3='1' result='shadowInnerInner1'></feComposite> <feColorMatrix values='0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.3 0' type='matrix' in='shadowInnerInner1' result='shadowMatrixInner1'></feColorMatrix> <feGaussianBlur stdDeviation='0.5' in='SourceAlpha' result='shadowBlurInner2'></feGaussianBlur> <feOffset dx='0' dy='1' in='shadowBlurInner2' result='shadowOffsetInner2'></feOffset> <feComposite in='shadowOffsetInner2' in2='SourceAlpha' operator='arithmetic' k2='-1' k3='1' result='shadowInnerInner2'></feComposite> <feColorMatrix values='0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.3 0' type='matrix' in='shadowInnerInner2' result='shadowMatrixInner2'></feColorMatrix> <feGaussianBlur stdDeviation='0.5' in='SourceAlpha' result='shadowBlurInner3'></feGaussianBlur> <feOffset dx='0' dy='0' in='shadowBlurInner3' result='shadowOffsetInner3'></feOffset> <feComposite in='shadowOffsetInner3' in2='SourceAlpha' operator='arithmetic' k2='-1' k3='1' result='shadowInnerInner3'></feComposite> <feColorMatrix values='0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.3 0' type='matrix' in='shadowInnerInner3' result='shadowMatrixInner3'></feColorMatrix> <feGaussianBlur stdDeviation='0.5' in='SourceAlpha' result='shadowBlurInner4'></feGaussianBlur> <feOffset dx='-0' dy='0' in='shadowBlurInner4' result='shadowOffsetInner4'></feOffset> <feComposite in='shadowOffsetInner4' in2='SourceAlpha' operator='arithmetic' k2='-1' k3='1' result='shadowInnerInner4'></feComposite> <feColorMatrix values='0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.3 0' type='matrix' in='shadowInnerInner4' result='shadowMatrixInner4'></feColorMatrix> <feMerge> <feMergeNode in='shadowMatrixInner1'></feMergeNode> <feMergeNode in='shadowMatrixInner2'></feMergeNode> <feMergeNode in='shadowMatrixInner3'></feMergeNode> <feMergeNode in='shadowMatrixInner4'></feMergeNode> </feMerge> </filter> <path d='M13,15.25 C13,14.8357864 13.3355947,14.5 13.7508378,14.5 L15.7491622,14.5 C16.1638385,14.5 16.5,14.8328986 16.5,15.25 L16.5,16 L13,16 L13,15.25 L13,15.25 Z' id='path-6'></path> <filter x='-50%' y='-50%' width='200%' height='200%' filterUnits='objectBoundingBox' id='filter-7'> <feOffset dx='0' dy='0' in='SourceAlpha' result='shadowOffsetOuter1'></feOffset> <feColorMatrix values='0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.5 0' type='matrix' in='shadowOffsetOuter1'></feColorMatrix> </filter> <filter x='-50%' y='-50%' width='200%' height='200%' filterUnits='objectBoundingBox' id='filter-8'> <feOffset dx='0' dy='1' in='SourceAlpha' result='shadowOffsetInner1'></feOffset> <feComposite in='shadowOffsetInner1' in2='SourceAlpha' operator='arithmetic' k2='-1' k3='1' result='shadowInnerInner1'></feComposite> <feColorMatrix values='0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.5 0' type='matrix' in='shadowInnerInner1'></feColorMatrix> </filter> <circle id='path-9' cx='39.5' cy='23' r='1'></circle> <filter x='-50%' y='-50%' width='200%' height='200%' filterUnits='objectBoundingBox' id='filter-10'> <feOffset dx='0' dy='0' in='SourceAlpha' result='shadowOffsetOuter1'></feOffset> <feColorMatrix values='0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.5 0' type='matrix' in='shadowOffsetOuter1'></feColorMatrix> </filter> <filter x='-50%' y='-50%' width='200%' height='200%' filterUnits='objectBoundingBox' id='filter-11'> <feGaussianBlur stdDeviation='0.5' in='SourceAlpha' result='shadowBlurInner1'></feGaussianBlur> <feOffset dx='0' dy='0' in='shadowBlurInner1' result='shadowOffsetInner1'></feOffset> <feComposite in='shadowOffsetInner1' in2='SourceAlpha' operator='arithmetic' k2='-1' k3='1' result='shadowInnerInner1'></feComposite> <feColorMatrix values='0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.3 0' type='matrix' in='shadowInnerInner1'></feColorMatrix> </filter> </defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'> <g id='Home-Screen-•-iPhone-SE' transform='translate(-244.000000, -27.000000)'> <g id='Home-Screen-•-iPhone-6s-Copy' transform='translate(0.000000, 27.000000)'> <g id='Camera' transform='translate(244.000000, 0.000000)'> <g id='icon'> <path d='M39.0815,0 C45.105,0 48.116,0 51.3585,1.025 C54.8985,2.3135 57.6865,5.1015 58.975,8.6415 C60,11.8835 60,14.8955 60,20.9185 L60,39.0815 C60,45.105 60,48.116 58.975,51.3585 C57.6865,54.8985 54.8985,57.6865 51.3585,58.9745 C48.116,60 45.105,60 39.0815,60 L20.9185,60 C14.895,60 11.8835,60 8.6415,58.9745 C5.1015,57.6865 2.3135,54.8985 1.025,51.3585 C0,48.116 0,45.105 0,39.0815 L0,20.9185 C0,14.8955 0,11.8835 1.025,8.6415 C2.3135,5.1015 5.1015,2.3135 8.6415,1.025 C11.8835,0 14.895,0 20.9185,0 L39.0815,0 Z' id='Icon' fill='url(#linearGradient-1)'></path> <g id='Camera'> <use fill='black' fill-opacity='1' filter='url(#filter-4)' xlink:href='#path-3'></use> <use fill='url(#linearGradient-2)' fill-rule='evenodd' xlink:href='#path-3'></use> <use fill='black' fill-opacity='1' filter='url(#filter-5)' xlink:href='#path-3'></use> </g> <g id='Path'> <use fill='black' fill-opacity='1' filter='url(#filter-7)' xlink:href='#path-6'></use> <use fill='url(#linearGradient-2)' fill-rule='evenodd' xlink:href='#path-6'></use> <use fill='black' fill-opacity='1' filter='url(#filter-8)' xlink:href='#path-6'></use> </g> <g id='Oval-16'> <use fill='black' fill-opacity='1' filter='url(#filter-10)' xlink:href='#path-9'></use> <use fill='#FFC209' fill-rule='evenodd' xlink:href='#path-9'></use> <use fill='black' fill-opacity='1' filter='url(#filter-11)' xlink:href='#path-9'></use> </g> </g> </g> </g> </g> </g> </svg>",
  weather_app: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='60px' height='60px' viewBox='0 0 60 60' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 39.1 (31720) - http://www.bohemiancoding.com/sketch --> <title>Wealther</title> <desc>Created with Sketch.</desc> <defs> <linearGradient x1='50%' y1='0%' x2='50%' y2='100%' id='linearGradient-1'> <stop stop-color='#1D62F0' offset='0%'></stop> <stop stop-color='#19D5FD' offset='100%'></stop> </linearGradient> </defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'> <g id='Home-Screen-•-iPhone-SE' transform='translate(-16.000000, -115.000000)'> <g id='Home-Screen-•-iPhone-6s-Copy' transform='translate(0.000000, 27.000000)'> <g id='Wealther' transform='translate(16.000000, 88.000000)'> <path d='M39.0815,0 C45.105,0 48.116,0 51.3585,1.025 C54.8985,2.3135 57.6865,5.1015 58.975,8.6415 C60,11.8835 60,14.8955 60,20.9185 L60,39.0815 C60,45.105 60,48.116 58.975,51.3585 C57.6865,54.8985 54.8985,57.6865 51.3585,58.9745 C48.116,60 45.105,60 39.0815,60 L20.9185,60 C14.895,60 11.8835,60 8.6415,58.9745 C5.1015,57.6865 2.3135,54.8985 1.025,51.3585 C0,48.116 0,45.105 0,39.0815 L0,20.9185 C0,14.8955 0,11.8835 1.025,8.6415 C2.3135,5.1015 5.1015,2.3135 8.6415,1.025 C11.8835,0 14.895,0 20.9185,0 L39.0815,0 Z' id='BG' fill='url(#linearGradient-1)'></path> <circle id='Sun' fill='#FFD800' cx='19.75' cy='24.25' r='11.25'></circle> <path d='M41.5,43.996687 C46.4930625,43.8642035 50.5,39.775037 50.5,34.75 C50.5,29.6413661 46.3586339,25.5 41.25,25.5 C41.0574549,25.5 40.8662838,25.505883 40.6766567,25.5174791 C39.0043353,21.4018889 34.9660539,18.5 30.25,18.5 C24.0367966,18.5 19,23.5367966 19,29.75 C19,30.0391915 19.0109117,30.3258344 19.032346,30.6095395 C15.8856244,31.1828157 13.5,33.9378116 13.5,37.25 C13.5,40.8942242 16.3879002,43.8639431 20,43.9954562 L20,44 L41.5,44 L41.5,43.996687 L41.5,43.996687 Z' id='Cloud' fill='#FFFFFF' opacity='0.900536381'></path> </g> </g> </g> </g> </svg>",
  clock_app: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='60px' height='60px' viewBox='0 0 60 60' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 39.1 (31720) - http://www.bohemiancoding.com/sketch --> <title>Clock</title> <desc>Created with Sketch.</desc> <defs> <linearGradient x1='50%' y1='0%' x2='50%' y2='100%' id='linearGradient-1'> <stop stop-color='#F1F1F1' offset='0%'></stop> <stop stop-color='#EEEEEE' offset='100%'></stop> </linearGradient> </defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'> <g id='Home-Screen-•-iPhone-SE' transform='translate(-92.000000, -115.000000)'> <g id='Home-Screen-•-iPhone-6s-Copy' transform='translate(0.000000, 27.000000)'> <g id='Clock' transform='translate(92.000000, 88.000000)'> <path d='M39.0815,0 C45.105,0 48.116,0 51.3585,1.025 C54.8985,2.3135 57.6865,5.1015 58.975,8.6415 C60,11.8835 60,14.8955 60,20.9185 L60,39.0815 C60,45.105 60,48.116 58.975,51.3585 C57.6865,54.8985 54.8985,57.6865 51.3585,58.9745 C48.116,60 45.105,60 39.0815,60 L20.9185,60 C14.895,60 11.8835,60 8.6415,58.9745 C5.1015,57.6865 2.3135,54.8985 1.025,51.3585 C0,48.116 0,45.105 0,39.0815 L0,20.9185 C0,14.8955 0,11.8835 1.025,8.6415 C2.3135,5.1015 5.1015,2.3135 8.6415,1.025 C11.8835,0 14.895,0 20.9185,0 L39.0815,0 Z' id='Icon' fill='#1E1E1F'></path> <circle id='Oval-12' fill='url(#linearGradient-1)' cx='30' cy='30' r='26'></circle> <g id='Digits' transform='translate(8.000000, 7.000000)' fill='#616161'> <path d='M32.468,8 L32.468,3.746 L32.078,3.746 C32.0499999,3.9060008 31.9980004,4.03799948 31.922,4.142 C31.8459996,4.24600052 31.7530005,4.3279997 31.643,4.388 C31.5329994,4.4480003 31.4100007,4.48899989 31.274,4.511 C31.1379993,4.53300011 30.9980007,4.544 30.854,4.544 L30.854,4.952 L31.958,4.952 L31.958,8 L32.468,8 Z' id='1'></path> <path d='M38.096,12.752 L38.606,12.752 C38.602,12.6239994 38.6149999,12.4970006 38.645,12.371 C38.6750002,12.2449994 38.7239997,12.1320005 38.792,12.032 C38.8600003,11.9319995 38.9469995,11.8510003 39.053,11.789 C39.1590005,11.7269997 39.2859993,11.696 39.434,11.696 C39.5460006,11.696 39.6519995,11.7139998 39.752,11.75 C39.8520005,11.7860002 39.9389996,11.8379997 40.013,11.906 C40.0870004,11.9740003 40.1459998,12.0549995 40.19,12.149 C40.2340002,12.2430005 40.256,12.3479994 40.256,12.464 C40.256,12.6120007 40.2330002,12.7419994 40.187,12.854 C40.1409998,12.9660006 40.0730005,13.0699995 39.983,13.166 C39.8929996,13.2620005 39.7800007,13.3569995 39.644,13.451 C39.5079993,13.5450005 39.3500009,13.6479994 39.17,13.76 C39.0219993,13.8480004 38.8800007,13.9419995 38.744,14.042 C38.6079993,14.1420005 38.4860005,14.2579993 38.378,14.39 C38.2699995,14.5220007 38.1810004,14.6769991 38.111,14.855 C38.0409997,15.0330009 37.9960001,15.2479987 37.976,15.5 L40.754,15.5 L40.754,15.05 L38.57,15.05 C38.5940001,14.9179993 38.6449996,14.8010005 38.723,14.699 C38.8010004,14.5969995 38.8949995,14.5020004 39.005,14.414 C39.1150006,14.3259996 39.2359993,14.2430004 39.368,14.165 C39.5000007,14.0869996 39.6319993,14.0080004 39.764,13.928 C39.8960007,13.8439996 40.0239994,13.7560005 40.148,13.664 C40.2720006,13.5719995 40.3819995,13.4690006 40.478,13.355 C40.5740005,13.2409994 40.6509997,13.1120007 40.709,12.968 C40.7670003,12.8239993 40.796,12.6580009 40.796,12.47 C40.796,12.269999 40.7610004,12.0940008 40.691,11.942 C40.6209997,11.7899992 40.5260006,11.6630005 40.406,11.561 C40.2859994,11.4589995 40.1450008,11.3810003 39.983,11.327 C39.8209992,11.2729997 39.6480009,11.246 39.464,11.246 C39.2399989,11.246 39.0400009,11.2839996 38.864,11.36 C38.6879991,11.4360004 38.5410006,11.5409993 38.423,11.675 C38.3049994,11.8090007 38.2180003,11.9679991 38.162,12.152 C38.1059997,12.3360009 38.0839999,12.5359989 38.096,12.752 L38.096,12.752 Z' id='2'></path> <path d='M42.14,22.57 L42.14,23.002 C42.2360005,22.9899999 42.3379995,22.984 42.446,22.984 C42.5740006,22.984 42.6929995,23.0009998 42.803,23.035 C42.9130006,23.0690002 43.0079996,23.1209997 43.088,23.191 C43.1680004,23.2610004 43.2319998,23.3469995 43.28,23.449 C43.3280002,23.5510005 43.352,23.6679993 43.352,23.8 C43.352,23.9280006 43.3270003,24.0429995 43.277,24.145 C43.2269998,24.2470005 43.1600004,24.3329997 43.076,24.403 C42.9919996,24.4730004 42.8940006,24.5269998 42.782,24.565 C42.6699994,24.6030002 42.5520006,24.622 42.428,24.622 C42.1359985,24.622 41.9140008,24.5350009 41.762,24.361 C41.6099992,24.1869991 41.53,23.9620014 41.522,23.686 L41.012,23.686 C41.008,23.9060011 41.0389997,24.1019991 41.105,24.274 C41.1710003,24.4460009 41.2659994,24.5909994 41.39,24.709 C41.5140006,24.8270006 41.6639991,24.9159997 41.84,24.976 C42.0160009,25.0360003 42.2119989,25.066 42.428,25.066 C42.628001,25.066 42.8169991,25.0390003 42.995,24.985 C43.1730009,24.9309997 43.3279993,24.8500005 43.46,24.742 C43.5920007,24.6339995 43.6969996,24.4990008 43.775,24.337 C43.8530004,24.1749992 43.892,23.9880011 43.892,23.776 C43.892,23.5199987 43.8290006,23.2980009 43.703,23.11 C43.5769994,22.9219991 43.3840013,22.8000003 43.124,22.744 L43.124,22.732 C43.2920008,22.6559996 43.4319994,22.5440007 43.544,22.396 C43.6560006,22.2479993 43.712,22.078001 43.712,21.886 C43.712,21.689999 43.6790003,21.5200007 43.613,21.376 C43.5469997,21.2319993 43.4560006,21.1140005 43.34,21.022 C43.2239994,20.9299995 43.0870008,20.8610002 42.929,20.815 C42.7709992,20.7689998 42.6000009,20.746 42.416,20.746 C42.2039989,20.746 42.0170008,20.7799997 41.855,20.848 C41.6929992,20.9160003 41.5580005,21.0099994 41.45,21.13 C41.3419995,21.2500006 41.2590003,21.3939992 41.201,21.562 C41.1429997,21.7300008 41.11,21.915999 41.102,22.12 L41.612,22.12 C41.612,21.9959994 41.6279998,21.8780006 41.66,21.766 C41.6920002,21.6539994 41.7409997,21.5560004 41.807,21.472 C41.8730003,21.3879996 41.9569995,21.3210003 42.059,21.271 C42.1610005,21.2209998 42.2799993,21.196 42.416,21.196 C42.6320011,21.196 42.8119993,21.2529994 42.956,21.367 C43.1000007,21.4810006 43.172,21.6519989 43.172,21.88 C43.172,21.9920006 43.1500002,22.0919996 43.106,22.18 C43.0619998,22.2680004 43.0030004,22.3409997 42.929,22.399 C42.8549996,22.4570003 42.7690005,22.5009999 42.671,22.531 C42.5729995,22.5610002 42.4700005,22.576 42.362,22.576 L42.254,22.576 L42.194,22.576 C42.1779999,22.576 42.1600001,22.574 42.14,22.57 L42.14,22.57 Z' id='3'></path> <path d='M40.366,34.054 L38.938,34.054 L40.354,31.972 L40.366,31.972 L40.366,34.054 Z M40.846,34.054 L40.846,31.246 L40.438,31.246 L38.5,34.012 L38.5,34.504 L40.366,34.504 L40.366,35.5 L40.846,35.5 L40.846,34.504 L41.422,34.504 L41.422,34.054 L40.846,34.054 Z' id='4'></path> <path d='M33.652,38.768 L33.652,38.318 L31.552,38.318 L31.156,40.526 L31.594,40.55 C31.6940005,40.4299994 31.8089993,40.3330004 31.939,40.259 C32.0690006,40.1849996 32.2179992,40.148 32.386,40.148 C32.5300007,40.148 32.6609994,40.1719998 32.779,40.22 C32.8970006,40.2680002 32.9979996,40.3349996 33.082,40.421 C33.1660004,40.5070004 33.2309998,40.6089994 33.277,40.727 C33.3230002,40.8450006 33.346,40.9739993 33.346,41.114 C33.346,41.2820008 33.3220002,41.4289994 33.274,41.555 C33.2259998,41.6810006 33.1610004,41.7859996 33.079,41.87 C32.9969996,41.9540004 32.9010005,42.0169998 32.791,42.059 C32.6809994,42.1010002 32.5660006,42.122 32.446,42.122 C32.3179994,42.122 32.2010005,42.1030002 32.095,42.065 C31.9889995,42.0269998 31.8970004,41.9730004 31.819,41.903 C31.7409996,41.8329997 31.6790002,41.7510005 31.633,41.657 C31.5869998,41.5629995 31.56,41.4620005 31.552,41.354 L31.042,41.354 C31.046,41.546001 31.0839996,41.7179992 31.156,41.87 C31.2280004,42.0220008 31.3259994,42.1489995 31.45,42.251 C31.5740006,42.3530005 31.7169992,42.4309997 31.879,42.485 C32.0410008,42.5390003 32.2139991,42.566 32.398,42.566 C32.6460012,42.566 32.8629991,42.5270004 33.049,42.449 C33.2350009,42.3709996 33.3899994,42.2660007 33.514,42.134 C33.6380006,42.0019993 33.7309997,41.8510009 33.793,41.681 C33.8550003,41.5109992 33.886,41.3360009 33.886,41.156 C33.886,40.9119988 33.8500004,40.6990009 33.778,40.517 C33.7059996,40.3349991 33.6080006,40.1830006 33.484,40.061 C33.3599994,39.9389994 33.2140008,39.8480003 33.046,39.788 C32.8779992,39.7279997 32.7000009,39.698 32.512,39.698 C32.3679993,39.698 32.2230007,39.7229998 32.077,39.773 C31.9309993,39.8230003 31.8120005,39.8999995 31.72,40.004 L31.708,39.992 L31.936,38.768 L33.652,38.768 Z' id='5'></path> <path d='M22.816,42.332 L23.326,42.332 C23.2939998,41.9799982 23.174001,41.7110009 22.966,41.525 C22.757999,41.3389991 22.4780018,41.246 22.126,41.246 C21.8219985,41.246 21.570001,41.3099994 21.37,41.438 C21.169999,41.5660006 21.0100006,41.7359989 20.89,41.948 C20.7699994,42.1600011 20.6850002,42.4029986 20.635,42.677 C20.5849997,42.9510014 20.56,43.2339985 20.56,43.526 C20.56,43.7500011 20.5769998,43.9819988 20.611,44.222 C20.6450002,44.4620012 20.7139995,44.681999 20.818,44.882 C20.9220005,45.082001 21.069999,45.2459994 21.262,45.374 C21.454001,45.5020006 21.7079984,45.566 22.024,45.566 C22.2920013,45.566 22.5169991,45.5210005 22.699,45.431 C22.8810009,45.3409996 23.0269994,45.2270007 23.137,45.089 C23.2470005,44.9509993 23.3259998,44.7980008 23.374,44.63 C23.4220002,44.4619992 23.446,44.3000008 23.446,44.144 C23.446,43.947999 23.4160003,43.7660008 23.356,43.598 C23.2959997,43.4299992 23.2110005,43.2840006 23.101,43.16 C22.9909994,43.0359994 22.8550008,42.9390004 22.693,42.869 C22.5309992,42.7989997 22.348001,42.764 22.144,42.764 C21.9119988,42.764 21.7070009,42.8079996 21.529,42.896 C21.3509991,42.9840004 21.2020006,43.125999 21.082,43.322 L21.07,43.31 C21.074,43.1459992 21.0899999,42.9700009 21.118,42.782 C21.1460001,42.5939991 21.1969996,42.4190008 21.271,42.257 C21.3450004,42.0949992 21.4479993,41.9610005 21.58,41.855 C21.7120007,41.7489995 21.8859989,41.696 22.102,41.696 C22.306001,41.696 22.4699994,41.7539994 22.594,41.87 C22.7180006,41.9860006 22.7919999,42.139999 22.816,42.332 L22.816,42.332 Z M22.048,43.214 C22.1920007,43.214 22.3179995,43.2399997 22.426,43.292 C22.5340005,43.3440003 22.6239996,43.4129996 22.696,43.499 C22.7680004,43.5850004 22.8209998,43.6869994 22.855,43.805 C22.8890002,43.9230006 22.906,44.0479993 22.906,44.18 C22.906,44.3040006 22.8870002,44.4229994 22.849,44.537 C22.8109998,44.6510006 22.7560004,44.7519996 22.684,44.84 C22.6119996,44.9280004 22.5230005,44.9969998 22.417,45.047 C22.3109995,45.0970003 22.1880007,45.122 22.048,45.122 C21.9079993,45.122 21.7830005,45.0970003 21.673,45.047 C21.5629994,44.9969998 21.4710004,44.9300004 21.397,44.846 C21.3229996,44.7619996 21.2660002,44.6620006 21.226,44.546 C21.1859998,44.4299994 21.166,44.3060007 21.166,44.174 C21.166,44.0419993 21.1849998,43.9170006 21.223,43.799 C21.2610002,43.6809994 21.3179996,43.5790004 21.394,43.493 C21.4700004,43.4069996 21.5619995,43.3390003 21.67,43.289 C21.7780005,43.2389998 21.9039993,43.214 22.048,43.214 L22.048,43.214 Z' id='6'></path> <path d='M12.886,38.756 L12.886,38.318 L10.132,38.318 L10.132,38.798 L12.364,38.798 C12.1399989,39.0340012 11.931001,39.2919986 11.737,39.572 C11.542999,39.8520014 11.3720007,40.1489984 11.224,40.463 C11.0759993,40.7770016 10.9550005,41.1049983 10.861,41.447 C10.7669995,41.7890017 10.7080001,42.1399982 10.684,42.5 L11.254,42.5 C11.2740001,42.1679983 11.3299995,41.8260018 11.422,41.474 C11.5140005,41.1219982 11.6329993,40.7800017 11.779,40.448 C11.9250007,40.1159983 12.0919991,39.8040015 12.28,39.512 C12.4680009,39.2199985 12.6699989,38.9680011 12.886,38.756 L12.886,38.756 Z' id='7'></path> <path d='M3.262,32.35 C3.262,32.2419995 3.2819998,32.1480004 3.322,32.068 C3.3620002,31.9879996 3.41499967,31.9200003 3.481,31.864 C3.54700033,31.8079997 3.62599954,31.7660001 3.718,31.738 C3.81000046,31.7099999 3.9059995,31.696 4.006,31.696 C4.21400104,31.696 4.38499933,31.7509995 4.519,31.861 C4.65300067,31.9710006 4.72,32.1339989 4.72,32.35 C4.72,32.5660011 4.65400066,32.7339994 4.522,32.854 C4.38999934,32.9740006 4.22200102,33.034 4.018,33.034 C3.91399948,33.034 3.81600046,33.0200001 3.724,32.992 C3.63199954,32.9639999 3.55200034,32.9220003 3.484,32.866 C3.41599966,32.8099997 3.3620002,32.7390004 3.322,32.653 C3.2819998,32.5669996 3.262,32.4660006 3.262,32.35 L3.262,32.35 Z M2.722,32.332 C2.722,32.524001 2.77599946,32.7009992 2.884,32.863 C2.99200054,33.0250008 3.1359991,33.1419996 3.316,33.214 C3.0759988,33.2980004 2.89200064,33.4329991 2.764,33.619 C2.63599936,33.8050009 2.572,34.0239987 2.572,34.276 C2.572,34.4920011 2.60899963,34.6809992 2.683,34.843 C2.75700037,35.0050008 2.85899935,35.1399995 2.989,35.248 C3.11900065,35.3560005 3.27199912,35.4359997 3.448,35.488 C3.62400088,35.5400003 3.81399898,35.566 4.018,35.566 C4.21400098,35.566 4.39799914,35.5380003 4.57,35.482 C4.74200086,35.4259997 4.89099937,35.3430006 5.017,35.233 C5.14300063,35.1229995 5.24299963,34.9880008 5.317,34.828 C5.39100037,34.6679992 5.428,34.484001 5.428,34.276 C5.428,34.0119987 5.36600062,33.7890009 5.242,33.607 C5.11799938,33.4249991 4.92800128,33.2940004 4.672,33.214 C4.8520009,33.1339996 4.99499947,33.0150008 5.101,32.857 C5.20700053,32.6989992 5.26,32.524001 5.26,32.332 C5.26,32.1959993 5.23600024,32.0630007 5.188,31.933 C5.13999976,31.8029994 5.06500051,31.6870005 4.963,31.585 C4.86099949,31.4829995 4.72800082,31.4010003 4.564,31.339 C4.39999918,31.2769997 4.20200116,31.246 3.97,31.246 C3.80599918,31.246 3.64900075,31.2699998 3.499,31.318 C3.34899925,31.3660002 3.21600058,31.4359995 3.1,31.528 C2.98399942,31.6200005 2.89200034,31.7329993 2.824,31.867 C2.75599966,32.0010007 2.722,32.1559991 2.722,32.332 L2.722,32.332 Z M3.112,34.3 C3.112,34.1759994 3.13499977,34.0640005 3.181,33.964 C3.22700023,33.8639995 3.29099959,33.7780004 3.373,33.706 C3.45500041,33.6339996 3.55099945,33.5790002 3.661,33.541 C3.77100055,33.5029998 3.88799938,33.484 4.012,33.484 C4.1320006,33.484 4.24499947,33.5049998 4.351,33.547 C4.45700053,33.5890002 4.5499996,33.6459996 4.63,33.718 C4.7100004,33.7900004 4.77299977,33.8749995 4.819,33.973 C4.86500023,34.0710005 4.888,34.1779994 4.888,34.294 C4.888,34.4140006 4.86700021,34.5239995 4.825,34.624 C4.78299979,34.7240005 4.72300039,34.8109996 4.645,34.885 C4.56699961,34.9590004 4.47500053,35.0169998 4.369,35.059 C4.26299947,35.1010002 4.14600064,35.122 4.018,35.122 C3.75399868,35.122 3.53700085,35.0490007 3.367,34.903 C3.19699915,34.7569993 3.112,34.5560013 3.112,34.3 L3.112,34.3 Z' id='8'></path> <path d='M1.136,23.974 L0.626,23.974 C0.65800016,24.3420018 0.79199882,24.6159991 1.028,24.796 C1.26400118,24.9760009 1.55999822,25.066 1.916,25.066 C2.43200258,25.066 2.80699883,24.869002 3.041,24.475 C3.27500117,24.080998 3.392,23.5160037 3.392,22.78 C3.392,22.375998 3.35300039,22.0430013 3.275,21.781 C3.19699961,21.5189987 3.09200066,21.3120008 2.96,21.16 C2.82799934,21.0079992 2.67400088,20.9010003 2.498,20.839 C2.32199912,20.7769997 2.134001,20.746 1.934,20.746 C1.72999898,20.746 1.54200086,20.7799997 1.37,20.848 C1.19799914,20.9160003 1.05000062,21.0109994 0.926,21.133 C0.80199938,21.2550006 0.70600034,21.4009992 0.638,21.571 C0.56999966,21.7410009 0.536,21.927999 0.536,22.132 C0.536,22.340001 0.56499971,22.5319991 0.623,22.708 C0.68100029,22.8840009 0.76699943,23.0339994 0.881,23.158 C0.99500057,23.2820006 1.13599916,23.3789997 1.304,23.449 C1.47200084,23.5190004 1.66399892,23.554 1.88,23.554 C2.08800104,23.554 2.27999912,23.5010005 2.456,23.395 C2.63200088,23.2889995 2.76799952,23.1460009 2.864,22.966 L2.876,22.978 C2.85999992,23.5340028 2.77400078,23.9469987 2.618,24.217 C2.46199922,24.4870014 2.22800156,24.622 1.916,24.622 C1.71199898,24.622 1.53600074,24.5660006 1.388,24.454 C1.23999926,24.3419994 1.1560001,24.182001 1.136,23.974 L1.136,23.974 Z M2.786,22.168 C2.786,22.2920006 2.7660002,22.4109994 2.726,22.525 C2.6859998,22.6390006 2.62800038,22.7389996 2.552,22.825 C2.47599962,22.9110004 2.38400054,22.9789998 2.276,23.029 C2.16799946,23.0790003 2.04800066,23.104 1.916,23.104 C1.79199938,23.104 1.67900051,23.0790003 1.577,23.029 C1.47499949,22.9789998 1.38700037,22.9120004 1.313,22.828 C1.23899963,22.7439996 1.18100021,22.6480005 1.139,22.54 C1.09699979,22.4319995 1.076,22.3200006 1.076,22.204 C1.076,22.0719993 1.09099985,21.9460006 1.121,21.826 C1.15100015,21.7059994 1.19899967,21.5990005 1.265,21.505 C1.33100033,21.4109995 1.41699947,21.3360003 1.523,21.28 C1.62900053,21.2239997 1.75799924,21.196 1.91,21.196 C2.05400072,21.196 2.17999946,21.2219997 2.288,21.274 C2.39600054,21.3260003 2.48699963,21.3969996 2.561,21.487 C2.63500037,21.5770005 2.69099981,21.6799994 2.729,21.796 C2.76700019,21.9120006 2.786,22.0359993 2.786,22.168 L2.786,22.168 Z' id='9'></path> <path d='M2.8,15.5 L2.8,11.246 L2.41,11.246 C2.38199986,11.4060008 2.33000038,11.5379995 2.254,11.642 C2.17799962,11.7460005 2.08500055,11.8279997 1.975,11.888 C1.86499945,11.9480003 1.74200068,11.9889999 1.606,12.011 C1.46999932,12.0330001 1.33000072,12.044 1.186,12.044 L1.186,12.452 L2.29,12.452 L2.29,15.5 L2.8,15.5 Z M4.792,13.406 C4.792,13.3019995 4.79299999,13.1870006 4.795,13.061 C4.79700001,12.9349994 4.80699991,12.8090006 4.825,12.683 C4.84300009,12.5569994 4.86899983,12.4340006 4.903,12.314 C4.93700017,12.1939994 4.98699967,12.0890005 5.053,11.999 C5.11900033,11.9089996 5.2019995,11.8360003 5.302,11.78 C5.4020005,11.7239997 5.52399928,11.696 5.668,11.696 C5.81200072,11.696 5.9339995,11.7239997 6.034,11.78 C6.1340005,11.8360003 6.21699967,11.9089996 6.283,11.999 C6.34900033,12.0890005 6.39899983,12.1939994 6.433,12.314 C6.46700017,12.4340006 6.49299991,12.5569994 6.511,12.683 C6.52900009,12.8090006 6.53899999,12.9349994 6.541,13.061 C6.54300001,13.1870006 6.544,13.3019995 6.544,13.406 C6.544,13.5660008 6.53900005,13.744999 6.529,13.943 C6.51899995,14.141001 6.48700027,14.3269991 6.433,14.501 C6.37899973,14.6750009 6.2920006,14.8219994 6.172,14.942 C6.0519994,15.0620006 5.88400108,15.122 5.668,15.122 C5.45199892,15.122 5.2840006,15.0620006 5.164,14.942 C5.0439994,14.8219994 4.95700027,14.6750009 4.903,14.501 C4.84899973,14.3269991 4.81700005,14.141001 4.807,13.943 C4.79699995,13.744999 4.792,13.5660008 4.792,13.406 L4.792,13.406 Z M4.252,13.412 C4.252,13.5680008 4.25599996,13.7299992 4.264,13.898 C4.27200004,14.0660008 4.29199984,14.2299992 4.324,14.39 C4.35600016,14.5500008 4.4019997,14.7009993 4.462,14.843 C4.5220003,14.9850007 4.60399948,15.1099995 4.708,15.218 C4.81200052,15.3260005 4.94299921,15.4109997 5.101,15.473 C5.25900079,15.5350003 5.4479989,15.566 5.668,15.566 C5.89200112,15.566 6.08199922,15.5350003 6.238,15.473 C6.39400078,15.4109997 6.52399948,15.3260005 6.628,15.218 C6.73200052,15.1099995 6.8139997,14.9850007 6.874,14.843 C6.9340003,14.7009993 6.97999984,14.5500008 7.012,14.39 C7.04400016,14.2299992 7.06399996,14.0660008 7.072,13.898 C7.08000004,13.7299992 7.084,13.5680008 7.084,13.412 C7.084,13.2559992 7.08000004,13.0940008 7.072,12.926 C7.06399996,12.7579992 7.04400016,12.5940008 7.012,12.434 C6.97999984,12.2739992 6.9340003,12.1220007 6.874,11.978 C6.8139997,11.8339993 6.73200052,11.7080005 6.628,11.6 C6.52399948,11.4919995 6.39300079,11.4060003 6.235,11.342 C6.07699921,11.2779997 5.8880011,11.246 5.668,11.246 C5.4479989,11.246 5.25900079,11.2779997 5.101,11.342 C4.94299921,11.4060003 4.81200052,11.4919995 4.708,11.6 C4.60399948,11.7080005 4.5220003,11.8339993 4.462,11.978 C4.4019997,12.1220007 4.35600016,12.2739992 4.324,12.434 C4.29199984,12.5940008 4.27200004,12.7579992 4.264,12.926 C4.25599996,13.0940008 4.252,13.2559992 4.252,13.412 L4.252,13.412 Z' id='10'></path> <path d='M10.8,8 L10.8,3.746 L10.41,3.746 C10.3819999,3.9060008 10.3300004,4.03799948 10.254,4.142 C10.1779996,4.24600052 10.0850005,4.3279997 9.975,4.388 C9.86499945,4.4480003 9.74200068,4.48899989 9.606,4.511 C9.46999932,4.53300011 9.33000072,4.544 9.186,4.544 L9.186,4.952 L10.29,4.952 L10.29,8 L10.8,8 Z M14.136,8 L14.136,3.746 L13.746,3.746 C13.7179999,3.9060008 13.6660004,4.03799948 13.59,4.142 C13.5139996,4.24600052 13.4210005,4.3279997 13.311,4.388 C13.2009994,4.4480003 13.0780007,4.48899989 12.942,4.511 C12.8059993,4.53300011 12.6660007,4.544 12.522,4.544 L12.522,4.952 L13.626,4.952 L13.626,8 L14.136,8 Z' id='11'></path> <path d='M20.8,5 L20.8,0.746 L20.41,0.746 C20.3819999,0.9060008 20.3300004,1.03799948 20.254,1.142 C20.1779996,1.24600052 20.0850005,1.3279997 19.975,1.388 C19.8649994,1.4480003 19.7420007,1.48899989 19.606,1.511 C19.4699993,1.53300011 19.3300007,1.544 19.186,1.544 L19.186,1.952 L20.29,1.952 L20.29,5 L20.8,5 Z M22.264,2.252 L22.774,2.252 C22.77,2.12399936 22.7829998,1.99700063 22.813,1.871 C22.8430001,1.74499937 22.8919997,1.6320005 22.96,1.532 C23.0280003,1.4319995 23.1149995,1.35100031 23.221,1.289 C23.3270005,1.22699969 23.4539993,1.196 23.602,1.196 C23.7140006,1.196 23.8199995,1.21399982 23.92,1.25 C24.0200005,1.28600018 24.1069996,1.33799966 24.181,1.406 C24.2550004,1.47400034 24.3139998,1.55499953 24.358,1.649 C24.4020002,1.74300047 24.424,1.84799942 24.424,1.964 C24.424,2.11200074 24.4010002,2.24199944 24.355,2.354 C24.3089998,2.46600056 24.2410004,2.56999952 24.151,2.666 C24.0609995,2.76200048 23.9480007,2.85699953 23.812,2.951 C23.6759993,3.04500047 23.5180009,3.14799944 23.338,3.26 C23.1899993,3.34800044 23.0480007,3.4419995 22.912,3.542 C22.7759993,3.6420005 22.6540005,3.75799934 22.546,3.89 C22.4379995,4.02200066 22.3490003,4.17699911 22.279,4.355 C22.2089996,4.53300089 22.1640001,4.74799874 22.144,5 L24.922,5 L24.922,4.55 L22.738,4.55 C22.7620001,4.41799934 22.8129996,4.30100051 22.891,4.199 C22.9690004,4.09699949 23.0629994,4.00200044 23.173,3.914 C23.2830005,3.82599956 23.4039993,3.74300039 23.536,3.665 C23.6680007,3.58699961 23.7999993,3.5080004 23.932,3.428 C24.0640007,3.34399958 24.1919994,3.25600046 24.316,3.164 C24.4400006,3.07199954 24.5499995,2.96900057 24.646,2.855 C24.7420005,2.74099943 24.8189997,2.61200072 24.877,2.468 C24.9350003,2.32399928 24.964,2.15800094 24.964,1.97 C24.964,1.769999 24.9290003,1.59400076 24.859,1.442 C24.7889996,1.28999924 24.6940006,1.16300051 24.574,1.061 C24.4539994,0.95899949 24.3130008,0.88100027 24.151,0.827 C23.9889992,0.77299973 23.8160009,0.746 23.632,0.746 C23.4079989,0.746 23.2080009,0.78399962 23.032,0.86 C22.8559991,0.93600038 22.7090006,1.04099933 22.591,1.175 C22.4729994,1.30900067 22.3860003,1.46799908 22.33,1.652 C22.2739997,1.83600092 22.2519999,2.03599892 22.264,2.252 L22.264,2.252 Z' id='12'></path> </g> <polygon id='Hour' fill='#2A2929' transform='translate(25.319297, 23.611917) rotate(-38.000000) translate(-25.319297, -23.611917) ' points='24.8192972 15.6119168 25.8192972 15.6119168 25.8192972 31.6119168 24.8192972 31.6119168'></polygon> <polygon id='Minute' fill='#2A2929' transform='translate(19.329949, 35.730028) rotate(62.000000) translate(-19.329949, -35.730028) ' points='19.0494321 24.2986991 19.9184363 24.2986991 19.7874404 47.2986991 18.9184363 47.2986991'></polygon> <polygon id='Second' fill='#DD4524' transform='translate(39.644621, 32.129480) rotate(-76.000000) translate(-39.644621, -32.129480) ' points='38.9523565 18.2482315 39.9221138 18.2482315 39.9523565 46.2482315 38.9825992 46.2482315'></polygon> <circle id='Oval-13' fill='#2A2929' cx='30' cy='30' r='1.25'></circle> <circle id='Oval-14' fill='#DD4524' cx='30' cy='30' r='0.75'></circle> </g> </g> </g> </g> </svg>",
  maps_app: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='60px' height='60px' viewBox='0 0 60 60' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 39.1 (31720) - http://www.bohemiancoding.com/sketch --> <title>Maps</title> <desc>Created with Sketch.</desc> <defs> <path d='M39.0815,0 C45.105,0 48.116,0 51.3585,1.025 C54.8985,2.3135 57.6865,5.1015 58.975,8.6415 C60,11.8835 60,14.8955 60,20.9185 L60,39.0815 C60,45.105 60,48.116 58.975,51.3585 C57.6865,54.8985 54.8985,57.6865 51.3585,58.9745 C48.116,60 45.105,60 39.0815,60 L20.9185,60 C14.895,60 11.8835,60 8.6415,58.9745 C5.1015,57.6865 2.3135,54.8985 1.025,51.3585 C0,48.116 0,45.105 0,39.0815 L0,20.9185 C0,14.8955 0,11.8835 1.025,8.6415 C2.3135,5.1015 5.1015,2.3135 8.6415,1.025 C11.8835,0 14.895,0 20.9185,0 L39.0815,0 Z' id='path-1'></path> <path d='M-4.5,30 C-4.5,30 -4.47462625,30.4967807 -4.42511695,30.4912401 C-3.44229055,30.3812506 9.10445696,28.4946923 17.5075684,34.5092773 C23.2683105,38.6325684 26.42078,43.7490087 31,48.1848145 C36.7919922,53.7954102 44.3314042,55.6680664 50.4058144,56.250293 C56.4802246,56.8325195 65,56 65,56 L65,66 C65,66 53.5489633,65.3769385 47.8234863,64.6784668 C42.0980093,63.9799951 33.2470703,62.026123 27.392334,57.927002 C17.9909668,50.1728516 19.277874,47.8193763 12.291748,43.2246094 C5.24072266,38.5871582 -4.5,40.5 -4.5,40.5 L-4.5,30 Z' id='path-3'></path> <mask id='mask-4' maskContentUnits='userSpaceOnUse' maskUnits='objectBoundingBox' x='-0.5' y='-0.5' width='70.5' height='37'> <rect x='-5' y='29.5' width='70.5' height='37' fill='white'></rect> <use xlink:href='#path-3' fill='black'></use> </mask> <polygon id='path-5' points='50.5 60 41.5 60 41.5 18.8429752 0 18.8429752 0 9.91735537 41.5 9.91735537 41.5 0 50.5 0 50.5 9.91735537 60 9.91735537 60 18.8429752 50.5 18.8429752 50.5 36.6942149 60 36.6942149 60 45.6198347 50.5 45.6198347'></polygon> <mask id='mask-6' maskContentUnits='userSpaceOnUse' maskUnits='objectBoundingBox' x='-0.5' y='-0.5' width='61' height='61'> <rect x='-0.5' y='-0.5' width='61' height='61' fill='white'></rect> <use xlink:href='#path-5' fill='black'></use> </mask> <path d='M0.5,7.5 C0.814961548,13.8459051 5.03679656,19.5 12.75,19.5 C20.4632034,19.5 24.6314755,13.8439381 25,7.5 C25.1235352,5.37341309 24.3674316,2.56555176 23.5068131,1.2710142 C22.4549565,2.02599285 20.4373562,2.5 18.75,2.5 C16.1596631,2.5 13.4693848,1.88292106 12.75,0.347133799 C12.0306152,1.88292106 9.34033689,2.5 6.75,2.5 C5.06264383,2.5 3.04504346,2.02599285 1.99318686,1.2710142 C1.13293457,2.76416016 0.392089844,5.32580566 0.5,7.5 Z' id='path-7'></path> <mask id='mask-8' maskContentUnits='userSpaceOnUse' maskUnits='objectBoundingBox' x='0' y='0' width='24.5237787' height='19.1528662' fill='white'> <use xlink:href='#path-7'></use> </mask> <mask id='mask-10' maskContentUnits='userSpaceOnUse' maskUnits='objectBoundingBox' x='0' y='0' width='24.5237787' height='19.1528662' fill='white'> <use xlink:href='#path-7'></use> </mask> <rect id='path-11' x='0' y='0.5' width='25' height='5'></rect> <filter x='-50%' y='-50%' width='200%' height='200%' filterUnits='objectBoundingBox' id='filter-12'> <feOffset dx='0' dy='1' in='SourceAlpha' result='shadowOffsetOuter1'></feOffset> <feColorMatrix values='0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 1 0' type='matrix' in='shadowOffsetOuter1'></feColorMatrix> </filter> <path d='M0.5,7.5 C0.814961548,13.8459051 5.03679656,19.5 12.75,19.5 C20.4632034,19.5 24.6314755,13.8439381 25,7.5 C25.1235352,5.37341309 24.3674316,2.56555176 23.5068131,1.2710142 C22.4549565,2.02599285 20.4373562,2.5 18.75,2.5 C16.1596631,2.5 13.4693848,1.88292106 12.75,0.347133799 C12.0306152,1.88292106 9.34033689,2.5 6.75,2.5 C5.06264383,2.5 3.04504346,2.02599285 1.99318686,1.2710142 C1.13293457,2.76416016 0.392089844,5.32580566 0.5,7.5 Z' id='path-13'></path> <mask id='mask-14' maskContentUnits='userSpaceOnUse' maskUnits='objectBoundingBox' x='0' y='0' width='24.5237787' height='19.1528662' fill='white'> <use xlink:href='#path-13'></use> </mask> </defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'> <g id='Home-Screen-•-iPhone-SE' transform='translate(-168.000000, -115.000000)'> <g id='Home-Screen-•-iPhone-6s-Copy' transform='translate(0.000000, 27.000000)'> <g id='Maps' transform='translate(168.000000, 88.000000)'> <mask id='mask-2' fill='white'> <use xlink:href='#path-1'></use> </mask> <use id='BG' fill='#E4DDC9' xlink:href='#path-1'></use> <rect id='Block' fill='#76C63B' mask='url(#mask-2)' x='0' y='0' width='42' height='10'></rect> <rect id='Block' fill='#FBC6D1' mask='url(#mask-2)' x='45' y='0.5' width='15' height='10'></rect> <g id='Highway' mask='url(#mask-2)'> <use fill='#FFDE02' fill-rule='evenodd' xlink:href='#path-3'></use> <use stroke='#FEB312' mask='url(#mask-4)' stroke-width='1' xlink:href='#path-3'></use> </g> <g id='Map' mask='url(#mask-2)'> <use fill='#FFFFFF' fill-rule='evenodd' xlink:href='#path-5'></use> <use stroke-opacity='0.1' stroke='#000000' mask='url(#mask-6)' stroke-width='1' xlink:href='#path-5'></use> </g> <path d='M43.6565914,35.5 L43.4489796,35.5 L43.4489796,17 L-1,17 L-1,12 L48.5,12 L48.5,14.5 L48.5,14.5 L48.5,35.5 L48.2923882,35.5 C47.586899,35.178996 46.801811,35 45.9744898,35 C45.1471685,35 44.3620806,35.178996 43.6565914,35.5 L43.6565914,35.5 Z' id='Route' fill='#409BFF' mask='url(#mask-2)'></path> <g id='Indicator' mask='url(#mask-2)'> <g transform='translate(40.500000, 35.500000)'> <circle id='Circle' fill='#007AFF' cx='5.5' cy='5.5' r='5.5'></circle> <polygon id='Arrow' fill='#FFFFFF' points='7.75 8.75 5.5 1.65380592 3.25 8.75 5.5 6.65380592'></polygon> </g> </g> <g id='280' mask='url(#mask-2)'> <g transform='translate(8.000000, 22.500000)'> <mask id='mask-9' fill='white'> <use xlink:href='#path-7'></use> </mask> <g id='Oval-20' stroke='#FFFFFF' mask='url(#mask-8)' stroke-width='1' fill='#007AFF' fill-rule='evenodd'> <use mask='url(#mask-10)' xlink:href='#path-7'></use> </g> <g id='Top' stroke='none' fill='none' mask='url(#mask-9)'> <use fill='black' fill-opacity='1' filter='url(#filter-12)' xlink:href='#path-11'></use> <use fill='#DE1D26' fill-rule='evenodd' xlink:href='#path-11'></use> </g> <g id='Shield' stroke='none' fill='none' mask='url(#mask-9)' stroke-width='1.5'> <use stroke='#FFFFFF' mask='url(#mask-14)' xlink:href='#path-13'></use> </g> <path d='M5.64,9.378 L6.405,9.378 C6.39899997,9.18599904 6.41849978,8.99550095 6.4635,8.8065 C6.50850023,8.61749906 6.58199949,8.44800075 6.684,8.298 C6.78600051,8.14799925 6.91649921,8.02650047 7.0755,7.9335 C7.2345008,7.84049954 7.42499889,7.794 7.647,7.794 C7.81500084,7.794 7.97399925,7.82099973 8.124,7.875 C8.27400075,7.92900027 8.40449945,8.00699949 8.5155,8.109 C8.62650056,8.21100051 8.71499967,8.3324993 8.781,8.4735 C8.84700033,8.61450071 8.88,8.77199913 8.88,8.946 C8.88,9.16800111 8.84550035,9.36299916 8.7765,9.531 C8.70749966,9.69900084 8.60550068,9.85499928 8.4705,9.999 C8.33549933,10.1430007 8.16600102,10.2854993 7.962,10.4265 C7.75799898,10.5675007 7.52100135,10.7219992 7.251,10.89 C7.02899889,11.0220007 6.81600102,11.1629993 6.612,11.313 C6.40799898,11.4630008 6.22500081,11.636999 6.063,11.835 C5.90099919,12.033001 5.76750053,12.2654987 5.6625,12.5325 C5.55749948,12.7995013 5.49000015,13.1219981 5.46,13.5 L9.627,13.5 L9.627,12.825 L6.351,12.825 C6.38700018,12.626999 6.46349942,12.4515008 6.5805,12.2985 C6.69750059,12.1454992 6.83849918,12.0030007 7.0035,11.871 C7.16850083,11.7389993 7.34999901,11.6145006 7.548,11.4975 C7.74600099,11.3804994 7.94399901,11.2620006 8.142,11.142 C8.34000099,11.0159994 8.53199907,10.8840007 8.718,10.746 C8.90400093,10.6079993 9.06899928,10.4535009 9.213,10.2825 C9.35700072,10.1114991 9.47249957,9.91800108 9.5595,9.702 C9.64650044,9.48599892 9.69,9.23700141 9.69,8.955 C9.69,8.6549985 9.63750053,8.39100114 9.5325,8.163 C9.42749948,7.93499886 9.2850009,7.74450077 9.105,7.5915 C8.9249991,7.43849924 8.71350122,7.32150041 8.4705,7.2405 C8.22749879,7.1594996 7.96800138,7.119 7.692,7.119 C7.35599832,7.119 7.05600132,7.17599943 6.792,7.29 C6.52799868,7.40400057 6.30750089,7.561499 6.1305,7.7625 C5.95349912,7.96350101 5.82300042,8.20199862 5.739,8.478 C5.65499958,8.75400138 5.62199991,9.05399838 5.64,9.378 L5.64,9.378 Z M11.643,8.775 C11.643,8.61299919 11.6729997,8.4720006 11.733,8.352 C11.7930003,8.2319994 11.8724995,8.13000042 11.9715,8.046 C12.0705005,7.96199958 12.1889993,7.89900021 12.327,7.857 C12.4650007,7.81499979 12.6089993,7.794 12.759,7.794 C13.0710016,7.794 13.327499,7.87649918 13.5285,8.0415 C13.729501,8.20650083 13.83,8.45099838 13.83,8.775 C13.83,9.09900162 13.731001,9.3509991 13.533,9.531 C13.334999,9.7110009 13.0830015,9.801 12.777,9.801 C12.6209992,9.801 12.4740007,9.78000021 12.336,9.738 C12.1979993,9.69599979 12.0780005,9.63300042 11.976,9.549 C11.8739995,9.46499958 11.7930003,9.35850065 11.733,9.2295 C11.6729997,9.10049936 11.643,8.94900087 11.643,8.775 L11.643,8.775 Z M10.833,8.748 C10.833,9.03600144 10.9139992,9.30149879 11.076,9.5445 C11.2380008,9.78750122 11.4539987,9.96299946 11.724,10.071 C11.3639982,10.1970006 11.088001,10.3994986 10.896,10.6785 C10.703999,10.9575014 10.608,11.2859981 10.608,11.664 C10.608,11.9880016 10.6634994,12.2714988 10.7745,12.5145 C10.8855006,12.7575012 11.038499,12.9599992 11.2335,13.122 C11.428501,13.2840008 11.6579987,13.4039996 11.922,13.482 C12.1860013,13.5600004 12.4709985,13.599 12.777,13.599 C13.0710015,13.599 13.3469987,13.5570004 13.605,13.473 C13.8630013,13.3889996 14.0864991,13.2645008 14.2755,13.0995 C14.4645009,12.9344992 14.6144994,12.7320012 14.7255,12.492 C14.8365006,12.2519988 14.892,11.9760016 14.892,11.664 C14.892,11.267998 14.7990009,10.9335014 14.613,10.6605 C14.4269991,10.3874986 14.1420019,10.1910006 13.758,10.071 C14.0280014,9.9509994 14.2424992,9.77250119 14.4015,9.5355 C14.5605008,9.29849882 14.64,9.03600144 14.64,8.748 C14.64,8.54399898 14.6040004,8.34450098 14.532,8.1495 C14.4599996,7.95449903 14.3475008,7.78050077 14.1945,7.6275 C14.0414992,7.47449924 13.8420012,7.35150047 13.596,7.2585 C13.3499988,7.16549954 13.0530017,7.119 12.705,7.119 C12.4589988,7.119 12.2235011,7.15499964 11.9985,7.227 C11.7734989,7.29900036 11.5740009,7.40399931 11.4,7.542 C11.2259991,7.68000069 11.0880005,7.849499 10.986,8.0505 C10.8839995,8.25150101 10.833,8.48399868 10.833,8.748 L10.833,8.748 Z M11.418,11.7 C11.418,11.5139991 11.4524997,11.3460008 11.5215,11.196 C11.5905003,11.0459993 11.6864994,10.9170005 11.8095,10.809 C11.9325006,10.7009995 12.0764992,10.6185003 12.2415,10.5615 C12.4065008,10.5044997 12.5819991,10.476 12.768,10.476 C12.9480009,10.476 13.1174992,10.5074997 13.2765,10.5705 C13.4355008,10.6335003 13.5749994,10.7189995 13.695,10.827 C13.8150006,10.9350005 13.9094997,11.0624993 13.9785,11.2095 C14.0475003,11.3565007 14.082,11.5169991 14.082,11.691 C14.082,11.8710009 14.0505003,12.0359993 13.9875,12.186 C13.9244997,12.3360008 13.8345006,12.4664994 13.7175,12.5775 C13.6004994,12.6885006 13.4625008,12.7754997 13.3035,12.8385 C13.1444992,12.9015003 12.969001,12.933 12.777,12.933 C12.380998,12.933 12.0555013,12.8235011 11.8005,12.6045 C11.5454987,12.3854989 11.418,12.0840019 11.418,11.7 L11.418,11.7 Z M16.44,10.359 C16.44,10.2029992 16.4415,10.0305009 16.4445,9.8415 C16.4475,9.65249906 16.4624999,9.46350095 16.4895,9.2745 C16.5165001,9.08549906 16.5554997,8.9010009 16.6065,8.721 C16.6575003,8.5409991 16.7324995,8.38350068 16.8315,8.2485 C16.9305005,8.11349933 17.0549993,8.00400042 17.205,7.92 C17.3550008,7.83599958 17.5379989,7.794 17.754,7.794 C17.9700011,7.794 18.1529993,7.83599958 18.303,7.92 C18.4530008,8.00400042 18.5774995,8.11349933 18.6765,8.2485 C18.7755005,8.38350068 18.8504997,8.5409991 18.9015,8.721 C18.9525003,8.9010009 18.9914999,9.08549906 19.0185,9.2745 C19.0455001,9.46350095 19.0605,9.65249906 19.0635,9.8415 C19.0665,10.0305009 19.068,10.2029992 19.068,10.359 C19.068,10.5990012 19.0605001,10.8674985 19.0455,11.1645 C19.0304999,11.4615015 18.9825004,11.7404987 18.9015,12.0015 C18.8204996,12.2625013 18.6900009,12.4829991 18.51,12.663 C18.3299991,12.8430009 18.0780016,12.933 17.754,12.933 C17.4299984,12.933 17.1780009,12.8430009 16.998,12.663 C16.8179991,12.4829991 16.6875004,12.2625013 16.6065,12.0015 C16.5254996,11.7404987 16.4775001,11.4615015 16.4625,11.1645 C16.4474999,10.8674985 16.44,10.5990012 16.44,10.359 L16.44,10.359 Z M15.63,10.368 C15.63,10.6020012 15.6359999,10.8449987 15.648,11.097 C15.6600001,11.3490013 15.6899998,11.5949988 15.738,11.835 C15.7860002,12.0750012 15.8549996,12.3014989 15.945,12.5145 C16.0350005,12.7275011 16.1579992,12.9149992 16.314,13.077 C16.4700008,13.2390008 16.6664988,13.3664995 16.9035,13.4595 C17.1405012,13.5525005 17.4239984,13.599 17.754,13.599 C18.0900017,13.599 18.3749988,13.5525005 18.609,13.4595 C18.8430012,13.3664995 19.0379992,13.2390008 19.194,13.077 C19.3500008,12.9149992 19.4729996,12.7275011 19.563,12.5145 C19.6530005,12.3014989 19.7219998,12.0750012 19.77,11.835 C19.8180002,11.5949988 19.8479999,11.3490013 19.86,11.097 C19.8720001,10.8449987 19.878,10.6020012 19.878,10.368 C19.878,10.1339988 19.8720001,9.89100126 19.86,9.639 C19.8479999,9.38699874 19.8180002,9.1410012 19.77,8.901 C19.7219998,8.6609988 19.6530005,8.43300108 19.563,8.217 C19.4729996,8.00099892 19.3500008,7.81200081 19.194,7.65 C19.0379992,7.48799919 18.8415012,7.35900048 18.6045,7.263 C18.3674988,7.16699952 18.0840017,7.119 17.754,7.119 C17.4239984,7.119 17.1405012,7.16699952 16.9035,7.263 C16.6664988,7.35900048 16.4700008,7.48799919 16.314,7.65 C16.1579992,7.81200081 16.0350005,8.00099892 15.945,8.217 C15.8549996,8.43300108 15.7860002,8.6609988 15.738,8.901 C15.6899998,9.1410012 15.6600001,9.38699874 15.648,9.639 C15.6359999,9.89100126 15.63,10.1339988 15.63,10.368 L15.63,10.368 Z' id='280' stroke='none' fill='#FFFFFF' fill-rule='evenodd' mask='url(#mask-9)'></path> </g> </g> </g> </g> </g> </g> </svg>",
  news_app: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='60px' height='60px' viewBox='0 0 60 60' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 39.1 (31720) - http://www.bohemiancoding.com/sketch --> <title>News</title> <desc>Created with Sketch.</desc> <defs> <linearGradient x1='50%' y1='0%' x2='50%' y2='100%' id='linearGradient-1'> <stop stop-color='#FC5363' offset='0%'></stop> <stop stop-color='#FC3359' offset='100%'></stop> </linearGradient> <path d='M10.136624,47.3823853 C11,47.3823853 11,46.5 11,46.5 L11,12.0052617 C11,11.450071 11.4532303,11 11.9968754,11 L48.0031246,11 C48.5536837,11 49,11.4413032 49,12.0088498 L49,46.9911502 C49,47.5483226 48.543925,48.0029034 47.9964076,48.0062782 C47.9964076,48.0062782 18.6084831,48.1997544 11.0000001,48 C10.1174113,47.9768284 9.41662598,47.668457 9.05755615,47.3823853 C8.69848633,47.0963135 8.36309815,46.7116462 8.36309814,46.6607056 C8.36309814,46.457472 9.27324796,47.3823853 10.136624,47.3823853 Z' id='path-2'></path> <filter x='-50%' y='-50%' width='200%' height='200%' filterUnits='objectBoundingBox' id='filter-4'> <feOffset dx='-1' dy='0' in='SourceAlpha' result='shadowOffsetOuter1'></feOffset> <feGaussianBlur stdDeviation='1' in='shadowOffsetOuter1' result='shadowBlurOuter1'></feGaussianBlur> <feColorMatrix values='0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.25 0' type='matrix' in='shadowBlurOuter1'></feColorMatrix> </filter> </defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'> <g id='Home-Screen-•-iPhone-SE' transform='translate(-244.000000, -115.000000)'> <g id='Home-Screen-•-iPhone-6s-Copy' transform='translate(0.000000, 27.000000)'> <g id='News' transform='translate(244.000000, 88.000000)'> <rect id='BG' fill='url(#linearGradient-1)' x='0' y='0' width='60' height='60' rx='14'></rect> <path d='M8,45.9165262 L8,16.9953764 C8,16.4456452 8.45526288,16 8.99545703,16 L32.004543,16 C32.5543187,16 33,16.4523621 33,16.9927864 L33,47.0072136 C33,47.5555144 32.5447371,48 32.004543,48 L10.9907522,48 C9.33900538,48 8,46.6569475 8,45.9165262 L8,45.9165262 Z' id='Fold' fill='#FFFFFF'></path> <mask id='mask-3' fill='white'> <use xlink:href='#path-2'></use> </mask> <g id='Mask'> <use fill='black' fill-opacity='1' filter='url(#filter-4)' xlink:href='#path-2'></use> <use fill='#FFFFFF' fill-rule='evenodd' xlink:href='#path-2'></use> </g> <rect id='lines' fill='#BDBDBD' mask='url(#mask-3)' x='17' y='35' width='33' height='2' rx='1'></rect> <rect id='lines' fill='#BDBDBD' mask='url(#mask-3)' x='17' y='39' width='33' height='2' rx='1'></rect> <rect id='lines' fill='#BDBDBD' mask='url(#mask-3)' x='17' y='43' width='33' height='2' rx='1'></rect> <path d='M16,20.1213203 L16,16.9976567 C16,16.4466661 16.4410535,16 16.9976567,16 L20.1213203,16 L20,16.1213203 L31,27.1213203 L31,30.0011436 C31,30.5527968 30.5550661,31 30.0011436,31 L27.1213203,31 L16.1213203,20 L16,20.1213203 L16,20.1213203 Z M16,29.9997809 C16,30.5521867 16.4513294,31 17.0002191,31 L21.8784606,31 C22.4308663,31 22.5652427,30.6865631 22.1684484,30.2897688 L16.7102312,24.8315516 C16.3179814,24.4393017 16,24.5726497 16,25.1215394 L16,29.9997809 Z M29.9997809,16 C30.5521867,16 31,16.4513294 31,17.0002191 L31,21.8784606 C31,22.4308663 30.6873855,22.5660652 30.2956989,22.1743785 L29.5913977,21.4700774 L24.825239,16.7039186 C24.4364754,16.3151551 24.5726497,16 25.1215394,16 L29.9997809,16 Z' id='Logo' fill='#FD4C61' mask='url(#mask-3)'></path> </g> </g> </g> </g> </svg>",
  wallet_app: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='60px' height='60px' viewBox='0 0 60 60' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 39.1 (31720) - http://www.bohemiancoding.com/sketch --> <title>Wallet</title> <desc>Created with Sketch.</desc> <defs> <linearGradient x1='50%' y1='0%' x2='50%' y2='100%' id='linearGradient-1'> <stop stop-color='#1E1E1F' offset='0%'></stop> <stop stop-color='#1E1E1F' offset='100%'></stop> </linearGradient> <rect id='path-2' x='9' y='15' width='42' height='13' rx='2'></rect> <filter x='-50%' y='-50%' width='200%' height='200%' filterUnits='objectBoundingBox' id='filter-3'> <feOffset dx='0' dy='0' in='SourceAlpha' result='shadowOffsetOuter1'></feOffset> <feGaussianBlur stdDeviation='0.5' in='shadowOffsetOuter1' result='shadowBlurOuter1'></feGaussianBlur> <feColorMatrix values='0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.1 0' type='matrix' in='shadowBlurOuter1'></feColorMatrix> </filter> <rect id='path-4' x='9' y='18' width='42' height='13' rx='2'></rect> <filter x='-50%' y='-50%' width='200%' height='200%' filterUnits='objectBoundingBox' id='filter-5'> <feOffset dx='0' dy='0' in='SourceAlpha' result='shadowOffsetOuter1'></feOffset> <feGaussianBlur stdDeviation='0.5' in='shadowOffsetOuter1' result='shadowBlurOuter1'></feGaussianBlur> <feColorMatrix values='0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.1 0' type='matrix' in='shadowBlurOuter1'></feColorMatrix> </filter> <rect id='path-6' x='9' y='21' width='42' height='13' rx='2'></rect> <filter x='-50%' y='-50%' width='200%' height='200%' filterUnits='objectBoundingBox' id='filter-7'> <feOffset dx='0' dy='0' in='SourceAlpha' result='shadowOffsetOuter1'></feOffset> <feGaussianBlur stdDeviation='0.5' in='shadowOffsetOuter1' result='shadowBlurOuter1'></feGaussianBlur> <feColorMatrix values='0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.1 0' type='matrix' in='shadowBlurOuter1'></feColorMatrix> </filter> <rect id='path-8' x='9' y='25' width='42' height='13' rx='2'></rect> <filter x='-50%' y='-50%' width='200%' height='200%' filterUnits='objectBoundingBox' id='filter-9'> <feOffset dx='0' dy='0' in='SourceAlpha' result='shadowOffsetOuter1'></feOffset> <feGaussianBlur stdDeviation='0.5' in='shadowOffsetOuter1' result='shadowBlurOuter1'></feGaussianBlur> <feColorMatrix values='0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.1 0' type='matrix' in='shadowBlurOuter1'></feColorMatrix> </filter> <path d='M7,28 L7,42 L53,42 L53,28 L38.9065073,28 C37.7983339,28 36.3057558,28.6722229 35.5501237,29.4784882 C35.5501237,29.4784882 32.4189579,33.3076923 30,33.3076923 C27.5810421,33.3076923 24.4498763,29.4784882 24.4498763,29.4784882 C23.7043702,28.6619417 22.2114781,28 21.0934927,28 L7,28 Z' id='path-10'></path> <filter x='-50%' y='-50%' width='200%' height='200%' filterUnits='objectBoundingBox' id='filter-11'> <feOffset dx='0' dy='-1' in='SourceAlpha' result='shadowOffsetOuter1'></feOffset> <feGaussianBlur stdDeviation='1' in='shadowOffsetOuter1' result='shadowBlurOuter1'></feGaussianBlur> <feColorMatrix values='0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.1 0' type='matrix' in='shadowBlurOuter1'></feColorMatrix> </filter> </defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'> <g id='Home-Screen-•-iPhone-SE' transform='translate(-16.000000, -203.000000)'> <g id='Home-Screen-•-iPhone-6s-Copy' transform='translate(0.000000, 27.000000)'> <g id='Wallet' transform='translate(16.000000, 176.000000)'> <rect id='BG' fill='url(#linearGradient-1)' x='0' y='0' width='60' height='60' rx='14'></rect> <rect id='wallet' fill='#D9D6CC' x='7' y='12' width='46' height='34' rx='4'></rect> <g id='cards'> <use fill='black' fill-opacity='1' filter='url(#filter-3)' xlink:href='#path-2'></use> <use fill='#3B99C9' fill-rule='evenodd' xlink:href='#path-2'></use> </g> <g id='cards'> <use fill='black' fill-opacity='1' filter='url(#filter-5)' xlink:href='#path-4'></use> <use fill='#FFB003' fill-rule='evenodd' xlink:href='#path-4'></use> </g> <g id='cards'> <use fill='black' fill-opacity='1' filter='url(#filter-7)' xlink:href='#path-6'></use> <use fill='#50BE3D' fill-rule='evenodd' xlink:href='#path-6'></use> </g> <g id='cards'> <use fill='black' fill-opacity='1' filter='url(#filter-9)' xlink:href='#path-8'></use> <use fill='#F16C5E' fill-rule='evenodd' xlink:href='#path-8'></use> </g> <g id='Combined-Shape'> <use fill='black' fill-opacity='1' filter='url(#filter-11)' xlink:href='#path-10'></use> <use fill='#D9D6CC' fill-rule='evenodd' xlink:href='#path-10'></use> </g> </g> </g> </g> </g> </svg>",
  notes_app: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='60px' height='60px' viewBox='0 0 60 60' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 39.1 (31720) - http://www.bohemiancoding.com/sketch --> <title>Notes</title> <desc>Created with Sketch.</desc> <defs> <linearGradient x1='50%' y1='0%' x2='50%' y2='100%' id='linearGradient-1'> <stop stop-color='#F8F8F8' offset='0%'></stop> <stop stop-color='#EDEDED' offset='100%'></stop> </linearGradient> <path d='M39.0815,0 C45.105,0 48.116,0 51.3585,1.025 C54.8985,2.3135 57.6865,5.1015 58.975,8.6415 C60,11.8835 60,14.8955 60,20.9185 L60,39.0815 C60,45.105 60,48.116 58.975,51.3585 C57.6865,54.8985 54.8985,57.6865 51.3585,58.9745 C48.116,60 45.105,60 39.0815,60 L20.9185,60 C14.895,60 11.8835,60 8.6415,58.9745 C5.1015,57.6865 2.3135,54.8985 1.025,51.3585 C0,48.116 0,45.105 0,39.0815 L0,20.9185 C0,14.8955 0,11.8835 1.025,8.6415 C2.3135,5.1015 5.1015,2.3135 8.6415,1.025 C11.8835,0 14.895,0 20.9185,0 L39.0815,0 Z' id='path-2'></path> <linearGradient x1='50%' y1='0%' x2='50%' y2='100%' id='linearGradient-4'> <stop stop-color='#FFDF63' offset='0%'></stop> <stop stop-color='#FFCD02' offset='100%'></stop> </linearGradient> <rect id='path-5' x='0' y='-1' width='60' height='20'></rect> <filter x='-50%' y='-50%' width='200%' height='200%' filterUnits='objectBoundingBox' id='filter-6'> <feOffset dx='0' dy='0.5' in='SourceAlpha' result='shadowOffsetOuter1'></feOffset> <feGaussianBlur stdDeviation='0.5' in='shadowOffsetOuter1' result='shadowBlurOuter1'></feGaussianBlur> <feColorMatrix values='0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.3 0' type='matrix' in='shadowBlurOuter1'></feColorMatrix> </filter> <filter x='-50%' y='-50%' width='200%' height='200%' filterUnits='objectBoundingBox' id='filter-7'> <feOffset dx='0' dy='-0.5' in='SourceAlpha' result='shadowOffsetInner1'></feOffset> <feComposite in='shadowOffsetInner1' in2='SourceAlpha' operator='arithmetic' k2='-1' k3='1' result='shadowInnerInner1'></feComposite> <feColorMatrix values='0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.2 0' type='matrix' in='shadowInnerInner1'></feColorMatrix> </filter> </defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'> <g id='Home-Screen-•-iPhone-SE' transform='translate(-92.000000, -203.000000)'> <g id='Home-Screen-•-iPhone-6s-Copy' transform='translate(0.000000, 27.000000)'> <g id='Notes' transform='translate(92.000000, 176.000000)'> <mask id='mask-3' fill='white'> <use xlink:href='#path-2'></use> </mask> <use id='BG' fill='url(#linearGradient-1)' xlink:href='#path-2'></use> <g id='header' mask='url(#mask-3)'> <use fill='black' fill-opacity='1' filter='url(#filter-6)' xlink:href='#path-5'></use> <use fill='url(#linearGradient-4)' fill-rule='evenodd' xlink:href='#path-5'></use> <use fill='black' fill-opacity='1' filter='url(#filter-7)' xlink:href='#path-5'></use> </g> <polygon id='line' fill='#B7B7B7' mask='url(#mask-3)' points='59.75 30.5 60 30.5 60 30 59.75 30 -0.25 30 -0.5 30 -0.5 30.5 -0.25 30.5'></polygon> <polygon id='line' fill='#B7B7B7' mask='url(#mask-3)' points='59.75 41.5 60 41.5 60 41 59.75 41 -0.25 41 -0.5 41 -0.5 41.5 -0.25 41.5'></polygon> <polygon id='line' fill='#B7B7B7' mask='url(#mask-3)' points='59.75 53 60 53 60 52.5 59.75 52.5 -0.25 52.5 -0.5 52.5 -0.5 53 -0.25 53'></polygon> <path d='M58.5,22 L59.5,22 L59.5,23 L58.5,23 L58.5,22 L58.5,22 Z M56.5,22 L57.5,22 L57.5,23 L56.5,23 L56.5,22 L56.5,22 Z M54.5,22 L55.5,22 L55.5,23 L54.5,23 L54.5,22 L54.5,22 Z M52.5,22 L53.5,22 L53.5,23 L52.5,23 L52.5,22 L52.5,22 Z M50.5,22 L51.5,22 L51.5,23 L50.5,23 L50.5,22 L50.5,22 Z M48.5,22 L49.5,22 L49.5,23 L48.5,23 L48.5,22 L48.5,22 Z M46.5,22 L47.5,22 L47.5,23 L46.5,23 L46.5,22 L46.5,22 Z M44.5,22 L45.5,22 L45.5,23 L44.5,23 L44.5,22 L44.5,22 Z M42.5,22 L43.5,22 L43.5,23 L42.5,23 L42.5,22 L42.5,22 Z M40.5,22 L41.5,22 L41.5,23 L40.5,23 L40.5,22 L40.5,22 Z M38.5,22 L39.5,22 L39.5,23 L38.5,23 L38.5,22 L38.5,22 Z M36.5,22 L37.5,22 L37.5,23 L36.5,23 L36.5,22 L36.5,22 Z M34.5,22 L35.5,22 L35.5,23 L34.5,23 L34.5,22 L34.5,22 Z M32.5,22 L33.5,22 L33.5,23 L32.5,23 L32.5,22 L32.5,22 Z M30.5,22 L31.5,22 L31.5,23 L30.5,23 L30.5,22 L30.5,22 Z M28.5,22 L29.5,22 L29.5,23 L28.5,23 L28.5,22 L28.5,22 Z M26.5,22 L27.5,22 L27.5,23 L26.5,23 L26.5,22 L26.5,22 Z M24.5,22 L25.5,22 L25.5,23 L24.5,23 L24.5,22 L24.5,22 Z M22.5,22 L23.5,22 L23.5,23 L22.5,23 L22.5,22 L22.5,22 Z M20.5,22 L21.5,22 L21.5,23 L20.5,23 L20.5,22 L20.5,22 Z M18.5,22 L19.5,22 L19.5,23 L18.5,23 L18.5,22 L18.5,22 Z M16.5,22 L17.5,22 L17.5,23 L16.5,23 L16.5,22 L16.5,22 Z M14.5,22 L15.5,22 L15.5,23 L14.5,23 L14.5,22 L14.5,22 Z M12.5,22 L13.5,22 L13.5,23 L12.5,23 L12.5,22 L12.5,22 Z M10.5,22 L11.5,22 L11.5,23 L10.5,23 L10.5,22 L10.5,22 Z M8.5,22 L9.5,22 L9.5,23 L8.5,23 L8.5,22 L8.5,22 Z M6.5,22 L7.5,22 L7.5,23 L6.5,23 L6.5,22 L6.5,22 Z M4.5,22 L5.5,22 L5.5,23 L4.5,23 L4.5,22 L4.5,22 Z M2.5,22 L3.5,22 L3.5,23 L2.5,23 L2.5,22 L2.5,22 Z M0.5,22 L1.5,22 L1.5,23 L0.5,23 L0.5,22 L0.5,22 Z' id='Rectangle-37' fill='#AAAAAA' mask='url(#mask-3)'></path> </g> </g> </g> </g> </svg>",
  reminders_app: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='60px' height='60px' viewBox='0 0 60 60' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 39.1 (31720) - http://www.bohemiancoding.com/sketch --> <title>min</title> <desc>Created with Sketch.</desc> <defs> <rect id='path-1' x='0' y='0' width='60' height='60' rx='14'></rect> <circle id='path-3' cx='10' cy='12' r='4'></circle> <mask id='mask-4' maskContentUnits='userSpaceOnUse' maskUnits='objectBoundingBox' x='0' y='0' width='8' height='8' fill='white'> <use xlink:href='#path-3'></use> </mask> <mask id='mask-5' maskContentUnits='userSpaceOnUse' maskUnits='objectBoundingBox' x='-0.5' y='-0.5' width='9' height='9'> <rect x='5.5' y='7.5' width='9' height='9' fill='white'></rect> <use xlink:href='#path-3' fill='black'></use> </mask> <circle id='path-6' cx='10' cy='23' r='4'></circle> <mask id='mask-7' maskContentUnits='userSpaceOnUse' maskUnits='objectBoundingBox' x='0' y='0' width='8' height='8' fill='white'> <use xlink:href='#path-6'></use> </mask> <mask id='mask-8' maskContentUnits='userSpaceOnUse' maskUnits='objectBoundingBox' x='-0.5' y='-0.5' width='9' height='9'> <rect x='5.5' y='18.5' width='9' height='9' fill='white'></rect> <use xlink:href='#path-6' fill='black'></use> </mask> <circle id='path-9' cx='10' cy='35' r='4'></circle> <mask id='mask-10' maskContentUnits='userSpaceOnUse' maskUnits='objectBoundingBox' x='0' y='0' width='8' height='8' fill='white'> <use xlink:href='#path-9'></use> </mask> <mask id='mask-11' maskContentUnits='userSpaceOnUse' maskUnits='objectBoundingBox' x='-0.5' y='-0.5' width='9' height='9'> <rect x='5.5' y='30.5' width='9' height='9' fill='white'></rect> <use xlink:href='#path-9' fill='black'></use> </mask> <circle id='path-12' cx='10' cy='46' r='4'></circle> <mask id='mask-13' maskContentUnits='userSpaceOnUse' maskUnits='objectBoundingBox' x='0' y='0' width='8' height='8' fill='white'> <use xlink:href='#path-12'></use> </mask> <mask id='mask-14' maskContentUnits='userSpaceOnUse' maskUnits='objectBoundingBox' x='-0.5' y='-0.5' width='9' height='9'> <rect x='5.5' y='41.5' width='9' height='9' fill='white'></rect> <use xlink:href='#path-12' fill='black'></use> </mask> </defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'> <g id='Home-Screen-•-iPhone-SE' transform='translate(-168.000000, -203.000000)'> <g id='Home-Screen-•-iPhone-6s-Copy' transform='translate(0.000000, 27.000000)'> <g id='min' transform='translate(168.000000, 176.000000)'> <mask id='mask-2' fill='white'> <use xlink:href='#path-1'></use> </mask> <use id='BG' fill='#FFFFFF' xlink:href='#path-1'></use> <g id='circle' mask='url(#mask-2)'> <use stroke='#FFFFFF' mask='url(#mask-4)' fill='#FF9500' fill-rule='evenodd' xlink:href='#path-3'></use> <use stroke='#FF9500' mask='url(#mask-5)' xlink:href='#path-3'></use> </g> <g id='circle' mask='url(#mask-2)'> <use stroke='#FFFFFF' mask='url(#mask-7)' fill='#1BADF8' fill-rule='evenodd' xlink:href='#path-6'></use> <use stroke='#1BADF8' mask='url(#mask-8)' xlink:href='#path-6'></use> </g> <g id='circle' mask='url(#mask-2)'> <use stroke='#FFFFFF' mask='url(#mask-10)' fill='#63DA38' fill-rule='evenodd' xlink:href='#path-9'></use> <use stroke='#63DA38' mask='url(#mask-11)' xlink:href='#path-9'></use> </g> <g id='circle' mask='url(#mask-2)'> <use stroke='#FFFFFF' mask='url(#mask-13)' fill='#CC73E1' fill-rule='evenodd' xlink:href='#path-12'></use> <use stroke='#CC73E1' mask='url(#mask-14)' xlink:href='#path-12'></use> </g> <rect id='line' fill='#AEAEAE' mask='url(#mask-2)' x='19' y='17.5' width='41' height='0.5'></rect> <rect id='line' fill='#AEAEAE' mask='url(#mask-2)' x='19' y='6' width='41' height='0.5'></rect> <rect id='line' fill='#AEAEAE' mask='url(#mask-2)' x='19' y='29' width='41' height='0.5'></rect> <rect id='line' fill='#AEAEAE' mask='url(#mask-2)' x='19' y='40' width='41' height='0.5'></rect> <rect id='line' fill='#AEAEAE' mask='url(#mask-2)' x='19' y='51.5' width='41' height='0.5'></rect> </g> </g> </g> </g> </svg>",
  stocks_app: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='60px' height='60px' viewBox='0 0 60 60' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 39.1 (31720) - http://www.bohemiancoding.com/sketch --> <title>Stocks</title> <desc>Created with Sketch.</desc> <defs> <path d='M39.0815,0 C45.105,0 48.116,0 51.3585,1.025 C54.8985,2.3135 57.6865,5.1015 58.975,8.6415 C60,11.8835 60,14.8955 60,20.9185 L60,39.0815 C60,45.105 60,48.116 58.975,51.3585 C57.6865,54.8985 54.8985,57.6865 51.3585,58.9745 C48.116,60 45.105,60 39.0815,60 L20.9185,60 C14.895,60 11.8835,60 8.6415,58.9745 C5.1015,57.6865 2.3135,54.8985 1.025,51.3585 C0,48.116 0,45.105 0,39.0815 L0,20.9185 C0,14.8955 0,11.8835 1.025,8.6415 C2.3135,5.1015 5.1015,2.3135 8.6415,1.025 C11.8835,0 14.895,0 20.9185,0 L39.0815,0 Z' id='path-1'></path> <linearGradient x1='50%' y1='0%' x2='50%' y2='100%' id='linearGradient-3'> <stop stop-color='#454545' offset='0%'></stop> <stop stop-color='#111112' offset='100%'></stop> </linearGradient> <path d='M41.5,16.0112108 L41.5,-1.5 L41,-1.5 L41,16.0112108 C41.0823405,16.0037907 41.1657276,16 41.25,16 C41.3342724,16 41.4176595,16.0037907 41.5,16.0112108 Z M41.5,21.4887892 L41.5,63 L41,63 L41,21.4887892 C41.0823405,21.4962093 41.1657276,21.5 41.25,21.5 C41.3342724,21.5 41.4176595,21.4962093 41.5,21.4887892 Z M41.25,21 C42.4926407,21 43.5,19.9926407 43.5,18.75 C43.5,17.5073593 42.4926407,16.5 41.25,16.5 C40.0073593,16.5 39,17.5073593 39,18.75 C39,19.9926407 40.0073593,21 41.25,21 Z' id='path-4'></path> <filter x='-50%' y='-50%' width='200%' height='200%' filterUnits='objectBoundingBox' id='filter-5'> <feOffset dx='0' dy='1' in='SourceAlpha' result='shadowOffsetOuter1'></feOffset> <feColorMatrix values='0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.5 0' type='matrix' in='shadowOffsetOuter1'></feColorMatrix> </filter> </defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'> <g id='Home-Screen-•-iPhone-SE' transform='translate(-244.000000, -203.000000)'> <g id='Home-Screen-•-iPhone-6s-Copy' transform='translate(0.000000, 27.000000)'> <g id='Stocks' transform='translate(244.000000, 176.000000)'> <mask id='mask-2' fill='white'> <use xlink:href='#path-1'></use> </mask> <use id='BG' fill='#141416' xlink:href='#path-1'></use> <path d='M-0.484863281,34.0537109 C-0.484863281,34.0537109 1.27239211,34.0644686 3.11938477,34.6320801 C4.70794495,35.120271 6.30098176,36.2523786 7.23388672,36.1945801 C9.25146484,36.0695801 11.3344727,35.3759766 11.3344727,35.3759766 L15.1208496,30.4450684 L18.7275391,33.5263672 L22.4941406,24.6245117 L26.1196289,34.3369141 L30.25,36.8659668 L33.9467773,30.2084961 L37.5385742,29.276123 L41.4316406,18.1323242 L45.1474609,27.2033691 L48.9438477,24.6655273 L52.7734375,31.9936523 L56.3422852,23.8173828 L60.3457031,19.65625 L60.3457031,60.4791166 L-0.304989325,60.4791166 L-0.484863281,34.0537109 Z' id='graph' stroke='#FFFFFF' stroke-width='0.75' fill='url(#linearGradient-3)' mask='url(#mask-2)'></path> <g id='mark' mask='url(#mask-2)'> <use fill='black' fill-opacity='1' filter='url(#filter-5)' xlink:href='#path-4'></use> <use fill='#01A6F1' fill-rule='evenodd' xlink:href='#path-4'></use> </g> <g id='Spark-line' mask='url(#mask-2)' fill='#777778'> <g transform='translate(7.000000, -1.500000)' id='mark'> <rect x='0' y='0' width='0.5' height='64.5'></rect> <rect x='11.5' y='0' width='0.5' height='64.5'></rect> <rect x='23' y='0' width='0.5' height='64.5'></rect> <rect x='45.5' y='0' width='0.5' height='64.5'></rect> </g> </g> </g> </g> </g> </g> </svg>"
};

exports.frames = {
  "fullscreen": {
    height: window.innerHeight,
    width: window.innerWidth,
    scale: 1,
    mobile: false,
    platform: "web"
  },
  "apple-iphone-5s-space-gray": {
    height: 1136,
    width: 640,
    scale: 2,
    mobile: true,
    platform: "iOS"
  },
  "apple-iphone-5s-silver": {
    height: 1136,
    width: 640,
    scale: 2,
    mobile: true,
    platform: "iOS"
  },
  "apple-iphone-5s-gold": {
    height: 1136,
    width: 640,
    scale: 2,
    mobile: true,
    platform: "iOS"
  },
  "apple-iphone-5c-green": {
    height: 1136,
    width: 640,
    scale: 2,
    mobile: true,
    platform: "iOS"
  },
  "apple-iphone-5c-blue": {
    height: 1136,
    width: 640,
    scale: 2,
    mobile: true,
    platform: "iOS"
  },
  "apple-iphone-5c-red": {
    height: 1136,
    width: 640,
    scale: 2,
    mobile: true,
    platform: "iOS"
  },
  "apple-iphone-5c-white": {
    height: 1136,
    width: 640,
    scale: 2,
    mobile: true,
    platform: "iOS"
  },
  "apple-iphone-5c-yellow": {
    height: 1136,
    width: 640,
    scale: 2,
    mobile: true,
    platform: "iOS"
  },
  "apple-iphone-5c-pink": {
    height: 1136,
    width: 640,
    scale: 2,
    mobile: true,
    platform: "iOS"
  },
  "apple-iphone-6s-space-gray": {
    height: 1334,
    width: 750,
    scale: 2,
    mobile: true,
    platform: "iOS"
  },
  "apple-iphone-6s-silver": {
    height: 1334,
    width: 750,
    scale: 2,
    mobile: true,
    platform: "iOS"
  },
  "apple-iphone-6s-gold": {
    height: 1334,
    width: 750,
    scale: 2,
    mobile: true,
    platform: "iOS"
  },
  "apple-iphone-6s-rose-gold": {
    height: 1334,
    width: 750,
    scale: 2,
    mobile: true,
    platform: "iOS"
  },
  "apple-iphone-6s-plus-gold": {
    height: 2208,
    width: 1242,
    scale: 3,
    mobile: true,
    platform: "iOS"
  },
  "apple-iphone-6s-plus-silver": {
    height: 2208,
    width: 1242,
    scale: 3,
    mobile: true,
    platform: "iOS"
  },
  "apple-iphone-6s-plus-space-gray": {
    height: 2208,
    width: 1242,
    scale: 3,
    mobile: true,
    platform: "iOS"
  },
  "apple-iphone-6s-plus": {
    height: 2208,
    width: 1242,
    scale: 3,
    mobile: true,
    platform: "iOS"
  },
  "apple-iphone-6s-plus-rose-gold": {
    height: 2208,
    width: 1242,
    scale: 3,
    mobile: true,
    platform: "iOS"
  },
  "apple-ipad-air-2-gold": {
    height: 2048,
    width: 1536,
    scale: 2,
    mobile: true,
    platform: "iOS"
  },
  "apple-ipad-air-2-silver": {
    height: 2048,
    width: 1536,
    scale: 2,
    mobile: true,
    platform: "iOS"
  },
  "apple-ipad-air-2-space-gray": {
    height: 2048,
    width: 1536,
    scale: 2,
    mobile: true,
    platform: "iOS"
  },
  "apple-ipad-mini-4-gold": {
    height: 2048,
    width: 1536,
    scale: 2,
    mobile: true,
    platform: "iOS"
  },
  "apple-ipad-mini-4-space-gray": {
    height: 2048,
    width: 1536,
    scale: 2,
    mobile: true,
    platform: "iOS"
  },
  "apple-ipad-mini-4-silver": {
    height: 2048,
    width: 1536,
    scale: 2,
    mobile: true,
    platform: "iOS"
  },
  "apple-ipad-pro-gold": {
    height: 2732,
    width: 2048,
    scale: 2,
    mobile: true,
    platform: "iOS"
  },
  "apple-ipad-pro-silver": {
    height: 2732,
    width: 2048,
    scale: 2,
    mobile: true,
    platform: "iOS"
  },
  "apple-ipad-pro-space-gray": {
    height: 2732,
    width: 2048,
    scale: 2,
    mobile: true,
    platform: "iOS"
  }
};

exports.framerFrames = {
  640: 2,
  750: 2,
  768: 2,
  1080: 3,
  1242: 3,
  1440: 4,
  1536: 2
};

exports.realDevices = {
  320: {
    480: {
      name: "iphone",
      display_name: "iPhone",
      width: 320,
      height: 480,
      scale: 1
    }
  },
  480: {
    854: {
      name: "Android One",
      width: 480,
      height: 854,
      scale: 1.5
    }
  },
  640: {
    960: {
      name: "iphone-5",
      display_name: "iPhone 4",
      width: 640,
      height: 960,
      scale: 2
    },
    1136: {
      name: "iphone-5",
      display_name: "iPhone 5",
      width: 640,
      height: 1136,
      scale: 2
    }
  },
  720: {
    1280: {
      name: "XHDPI",
      width: 720,
      height: 1280,
      scale: 2
    }
  },
  750: {
    1118: {
      name: "iphone-6s",
      display_name: "iPhone 6s",
      width: 750,
      height: 1118,
      scale: 2
    },
    1334: {
      name: "iphone-6s",
      display_name: "iPhone 6s",
      width: 750,
      height: 1334,
      scale: 2
    }
  },
  768: {
    1024: {
      name: "ipad",
      display_name: "iPad",
      width: 768,
      height: 1024,
      scale: 1
    },
    1280: {
      name: "Nexus 4",
      width: 768,
      height: 1280,
      scale: 2
    }
  },
  800: {
    1280: {
      name: "Nexus 7",
      width: 800,
      height: 1280,
      scale: 1
    }
  },
  1080: {
    1920: {
      name: "XXHDPI",
      width: 1080,
      height: 1920,
      scale: 3
    }
  },
  1200: {
    1920: {
      name: "Nexus 7",
      width: 1200,
      height: 1920,
      scale: 2
    }
  },
  1242: {
    2208: {
      name: "iphone-6s-plus",
      display_name: "iPhone 6 Plus",
      width: 1242,
      height: 2208,
      scale: 3
    }
  },
  1334: {
    750: {
      name: "iphone-6s",
      display_name: "iPhone 6s",
      width: 750,
      height: 1334,
      scale: 2
    }
  },
  1440: {
    2560: {
      name: "XXXHDPI",
      width: 1440,
      height: 2560,
      scale: 4
    }
  },
  1441: {
    2561: {
      name: "Nexus 6",
      width: 1440,
      height: 2560,
      scale: 4
    }
  },
  1536: {
    2048: {
      name: "ipad",
      display_name: "iPad",
      width: 1536,
      height: 2048,
      scale: 2
    }
  },
  1600: {
    2056: {
      name: "Nexus 10",
      width: 1600,
      height: 2056,
      scale: 2
    }
  },
  2208: {
    1242: {
      name: "iphone-6s-plus",
      display_name: "iPhone 6 Plus",
      width: 1242,
      height: 2208,
      scale: 3
    }
  },
  2048: {
    1536: {
      name: "Nexus 9",
      width: 2048,
      height: 1536,
      scale: 2
    },
    2732: {
      name: "ipad-pro",
      display_name: "iPad Pro",
      width: 2048,
      height: 2732,
      scale: 2
    }
  },
  2560: {
    1600: {
      name: "Nexus 10",
      width: 2560,
      height: 1600,
      scale: 2
    }
  },
  2732: {
    2048: {
      name: "ipad-pro",
      display_name: "iPad Pro",
      width: 2732,
      height: 2048,
      scale: 2
    }
  }
};


},{"ios-kit":"ios-kit"}],"ios-kit-nav-bar":[function(require,module,exports){
var ios;

ios = require('ios-kit');

exports.defaults = {
  title: "Title",
  left: void 0,
  right: "Edit",
  blur: true,
  superLayer: void 0,
  type: "navBar",
  color: 'blue',
  titleColor: 'black',
  backgroundColor: "rgba(255, 255, 255, .8)",
  dividerBackgroundColor: "#B2B2B2"
};

exports.defaults.props = Object.keys(exports.defaults);

exports.create = function(array) {
  var bar, i, layer, len, ref, setLeading, setup, svg;
  setup = ios.utils.setupComponent(array, exports.defaults);
  bar = new ios.View({
    name: "navBar",
    backgroundColor: setup.backgroundColor,
    constraints: {
      leading: 0,
      trailing: 0,
      top: 0,
      height: 64
    }
  });
  bar.bg = new ios.View({
    superLayer: bar,
    backgroundColor: 'transparent',
    name: ".bg",
    constraints: {
      leading: 0,
      trailing: 0,
      height: 44,
      bottom: 0
    }
  });
  bar.divider = new ios.View({
    backgroundColor: setup.dividerBackgroundColor,
    name: ".divider",
    superLayer: bar.bg,
    constraints: {
      height: .5,
      bottom: 0,
      leading: 0,
      trailing: 0
    }
  });
  if (setup.superLayer) {
    setup.superLayer.addSubLayer(bar);
  }
  if (setup.blur) {
    ios.utils.bgBlur(bar);
  }
  if (setup.blur === false && setup.backgroundColor === "rgba(255, 255, 255, .8)") {
    bar.backgroundColor = 'white';
  }
  bar.type = setup.type;
  ref = Framer.CurrentContext.layers;
  for (i = 0, len = ref.length; i < len; i++) {
    layer = ref[i];
    if (layer.type === "statusBar") {
      this.statusBar = layer;
      bar.placeBehind(this.statusBar);
    }
  }
  if (typeof setup.title === "object") {
    setup.title = setup.title.label.html;
  }
  bar.title = new ios.Text({
    fontWeight: "semibold",
    superLayer: bar.bg,
    text: setup.title,
    name: ".title",
    color: setup.titleColor,
    constraints: {
      align: "horizontal",
      bottom: 12
    }
  });
  ios.utils.specialChar(bar.title);
  if (typeof setup.right === "string" && typeof setup.right !== "boolean") {
    bar.right = new ios.Button({
      name: ".right",
      superLayer: bar.bg,
      text: setup.right,
      color: setup.color,
      fontWeight: 500,
      constraints: {
        bottom: 12,
        trailing: 8
      }
    });
    bar.right.type = "button";
    ios.utils.specialChar(bar.right);
  }
  if (typeof setup.right === "object") {
    bar.right = setup.right;
    bar.right.name = ".right";
    bar.right.superLayer = bar.bg;
    bar.right.constraints = {
      trailing: 8,
      bottom: 12
    };
    ios.layout.set(bar.right);
  }
  if (typeof setup.left === "string" && typeof setup.left !== "boolean") {
    setLeading = 8;
    if (setup.left.indexOf("<") !== -1) {
      svg = ios.utils.svg(ios.assets.chevron);
      bar.chevron = new ios.View({
        name: ".chevron",
        width: svg.width,
        height: svg.height,
        backgroundColor: "transparent",
        superLayer: bar.bg
      });
      bar.chevron.html = svg.svg;
      bar.chevron.constraints = {
        bottom: 9,
        leading: 8
      };
      setup.left = setup.left.replace("<", "");
      ios.utils.changeFill(bar.chevron, setup.color);
      setLeading = [bar.chevron, 4];
      ios.layout.set(bar.chevron);
    }
    bar.left = new ios.Button({
      name: ".left",
      superLayer: bar.bg,
      text: setup.left,
      color: setup.color,
      fontWeight: 500,
      constraints: {
        bottom: 12,
        leading: setLeading
      }
    });
    bar.left.type = "button";
    ios.utils.specialChar(bar.left);
    bar.left.on(Events.TouchStart, function() {
      if (bar.chevron) {
        return bar.chevron.animate({
          properties: {
            opacity: .25
          },
          time: .5
        });
      }
    });
    bar.left.on(Events.TouchEnd, function() {
      if (bar.chevron) {
        return bar.chevron.animate({
          properties: {
            opacity: 1
          },
          time: .5
        });
      }
    });
  }
  if (typeof setup.left === "object") {
    bar.left = setup.left;
    bar.left.name = ".left";
    bar.left.superLayer = bar.bg;
    bar.left.constraints = {
      leading: 8,
      bottom: 12
    };
  }
  ios.layout.set(bar.left);
  return bar;
};


},{"ios-kit":"ios-kit"}],"ios-kit-sheet":[function(require,module,exports){
var ios;

ios = require('ios-kit');

exports.defaults = {
  actions: ["Reply", "Reply All", "Forward", "Print"],
  exit: "Cancel",
  animated: true,
  description: void 0,
  target: void 0
};

exports.defaults.props = Object.keys(exports.defaults);

exports.create = function(array) {
  var a, action, i, j, k, l, len, len1, place, ref, ref1, setup, sheet, sheetTip;
  setup = ios.utils.setupComponent(array, exports.defaults);
  ref = Framer.CurrentContext.layers;
  for (j = 0, len = ref.length; j < len; j++) {
    l = ref[j];
    if (l.type === 'sheet') {
      l.dismiss();
    }
  }
  sheet = new ios.View({
    name: "sheet",
    backgroundColor: "transparent",
    constraints: {
      top: 0,
      leading: 0,
      trailing: 0,
      bottom: 0
    }
  });
  sheet.type = 'sheet';
  sheet.menu = new Layer({
    name: "menu",
    superLayer: sheet,
    backgroundColor: "transparent",
    borderRadius: ios.px(12),
    clip: true
  }, ios.isPad() ? (sheetTip = ios.utils.svg(ios.assets.sheetTip), sheet.tip = new ios.View({
    name: '.tip',
    color: 'black',
    superLayer: sheet,
    html: sheetTip.svg,
    height: sheetTip.height - 4,
    width: sheetTip.width,
    backgroundColor: 'transparent',
    constraints: {
      horizontalCenter: setup.target
    }
  }), sheet.linked = setup.target, sheet.linked.ignoreEvents = true) : void 0);
  place = function(t, l) {
    var centerX, h, w;
    w = ios.device.width;
    h = ios.device.height;
    centerX = w / 2;
    if (w - t.x > centerX) {
      if (t.x - ios.px(150) < 0) {
        l.constraints.leading = 10;
      } else {
        l.constraints.horizontalCenter = t;
      }
    } else {
      if (t.x + ios.px(150) > w) {
        l.constraints.trailing = 10;
      } else {
        l.constraints.horizontalCenter = t;
      }
    }
    if (t.y + l.height < h) {
      l.constraints.top = [t, 40];
      if (ios.isPad()) {
        sheet.tip.constraints.bottom = [l, 1];
      }
    } else {
      l.constraints.bottom = [t, 40];
      if (ios.isPad()) {
        sheet.tip.constraints.top = [l, 1];
        sheet.tip.rotation = 180;
      }
    }
    if (ios.isPad()) {
      return ios.layout.set(sheet.tip);
    }
  };
  sheet.dismiss = function() {
    if (ios.isPhone()) {
      sheet.menu.animate({
        properties: {
          y: ios.device.height
        },
        time: .25
      });
      sheet.cancel.animate({
        properties: {
          y: ios.device.height + ios.px(75)
        },
        time: .25
      });
      sheet.overlay.animate({
        properties: {
          opacity: 0
        },
        time: .25
      });
      return Utils.delay(.25, function() {
        return sheet.destroy();
      });
    } else {
      sheet.linked.ignoreEvents = false;
      return Utils.delay(.15, function() {
        return sheet.destroy();
      });
    }
  };
  sheet.call = function() {
    if (ios.isPhone()) {
      sheet.menu.y = ios.device.height;
      sheet.cancel.y = ios.device.height + ios.px(75);
      sheet.overlay.opacity = 0;
      sheet.overlay.animate({
        properties: {
          opacity: .5
        },
        time: .25
      });
      return ios.layout.animate({
        target: [sheet.menu, sheet.cancel],
        time: .25
      });
    } else {
      place(setup.target, sheet.menu);
      return ios.layout.set(sheet.menu);
    }
  };
  if (ios.device.name.indexOf("ipad") === -1) {
    sheet.overlay = new ios.View({
      name: ".overlay",
      backgroundColor: "black",
      opacity: .5,
      superLayer: sheet,
      constraints: {
        top: 0,
        leading: 0,
        trailing: 0,
        bottom: 0
      }
    });
    sheet.overlay.sendToBack();
    sheet.menu.constraints = {
      leading: 10,
      trailing: 10,
      bottom: 57 + 8 + 10,
      height: setup.actions.length * 57
    };
    sheet.cancel = new ios.Button({
      name: ".cancel",
      type: "big",
      text: setup.exit,
      superLayer: sheet,
      constraints: {
        bottom: 10,
        leading: 0,
        trailing: 0
      }
    });
    sheet.cancel.on(Events.TouchEnd, function() {
      return sheet.dismiss();
    });
  } else {
    sheet.menu.constraints = {
      width: 300,
      height: setup.actions.length * 57
    };
    sheet.menu.props = {
      shadowY: 2,
      shadowBlur: ios.px(100),
      shadowColor: "rgba(0,0,0,0.1)"
    };
  }
  ios.layout.set(sheet);
  sheet.actionsArray = [];
  sheet.actions = {};
  ref1 = setup.actions;
  for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
    a = ref1[i];
    action = new ios.View({
      name: ".actions.[\"" + a.toLowerCase() + "\"]",
      backgroundColor: "rgba(255,255,255,1)",
      superLayer: sheet.menu,
      constraints: {
        leading: 0,
        trailing: 0,
        height: 57
      }
    });
    action.style["-webkit-box-shadow"] = "inset 0 0 " + ios.px(.5) + "px rgba(0,0,0,.25)";
    action.label = new ios.Text({
      text: a,
      color: ios.color("blue"),
      fontSize: 20,
      superLayer: action,
      constraints: {
        align: "center"
      }
    });
    ios.utils.specialChar(action.label);
    if (i === 0) {
      action.constraints.top = 0;
    } else {
      action.constraints.top = sheet.actionsArray[i - 1];
    }
    action.on(Events.TouchStart, function() {
      return this.animate({
        properties: {
          backgroundColor: this.backgroundColor.darken(10),
          time: .2
        }
      });
    });
    action.on(Events.TouchEnd, function() {
      this.animate({
        properties: {
          backgroundColor: "rgba(255,255,255, .8)"
        },
        time: .2
      });
      return sheet.dismiss();
    });
    ios.layout.set(action);
    sheet.actionsArray.push(action);
    sheet.actions[a.toLowerCase()] = action;
  }
  if (setup.animated) {
    sheet.call();
  }
  if (ios.isPad()) {
    sheet.tip.bringToFront();
  }
  return sheet;
};


},{"ios-kit":"ios-kit"}],"ios-kit-status-bar":[function(require,module,exports){
var ios;

ios = require('ios-kit');

exports.defaults = {
  carrier: "",
  network: "LTE",
  battery: 100,
  signal: 5,
  style: "dark",
  clock24: false,
  type: "statusBar",
  superLayer: void 0
};

exports.defaults.props = Object.keys(exports.defaults);

exports.create = function(array) {
  var batteryIcon, batteryPercent, bluetooth, bluetoothSVG, carrier, dot, gripper, highBattery, i, j, k, l, layer, len, lowBattery, midBattery, network, networkIcon, noNetwork, nonDot, nonDots, ref, ref1, ref2, setup, signal, statusBar, time;
  setup = ios.utils.setupComponent(array, exports.defaults);
  statusBar = new Layer({
    backgroundColor: "transparent",
    name: "statusBar.all",
    superLayer: setup.superLayer
  });
  statusBar.type = setup.type;
  statusBar.constraints = {
    leading: 0,
    trailing: 0,
    height: 20
  };
  switch (ios.device.name) {
    case "iphone-6s-plus":
      this.topConstraint = 5;
      this.batteryIcon = 5;
      this.bluetooth = 5;
      break;
    case "fullscreen":
      this.topConstraint = 5;
      this.batteryIcon = -12;
      this.bluetooth = -10;
      break;
    default:
      this.topConstraint = 3;
      this.batteryIcon = 2;
      this.bluetooth = 3;
  }
  if (setup.style === "light") {
    this.color = "white";
  } else {
    this.color = "black";
  }
  ref = Framer.CurrentContext.layers;
  for (j = 0, len = ref.length; j < len; j++) {
    layer = ref[j];
    if (layer.type === "lockScreen") {
      this.isLockScreenPutilsent = true;
    }
  }
  if (this.isLockScreenPutilsent) {
    gripper = new Layer({
      superLayer: statusBar,
      width: utils.px(37),
      height: utils.px(5),
      name: "gripper",
      backgroundColor: "transparent",
      opacity: .5,
      name: "gripper"
    });
    gripper.html = "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='" + (utils.px(37)) + "px' height='" + (utils.px(5)) + "px' viewBox='0 0 37 5' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 3.6.1 (26313) - http://www.bohemiancoding.com/sketch --> <title>Gripper</title> <desc>Created with Sketch.</desc> <defs></defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'> <g id='Keyboard/Auto-Complete-Bar-Closed' transform='translate(-169.000000, -2.000000)' fill='#FFFFFF'> <rect id='Gripper' x='169.5' y='2.5' width='36' height='4' rx='2.5'></rect> </g> </g> </svg>";
    gripper.constraints = {
      align: "horizontal",
      top: 2
    };
  } else {
    this.time = ios.utils.getTime();
    if (setup.clock24 === false) {
      if (this.time.hours > 11) {
        this.time.stamp = "PM";
      } else {
        this.time.stamp = "AM";
      }
    } else {
      this.time.stamp = "";
    }
    time = new ios.Text({
      style: "statusBarTime",
      text: ios.utils.timeFormatter(this.time, setup.clock24) + " " + this.time.stamp,
      fontSize: 12,
      fontWeight: "semibold",
      superLayer: statusBar,
      color: this.color,
      name: "time"
    });
    time.constraints = {
      align: "horizontal",
      top: this.topConstraint
    };
  }
  signal = [];
  if (setup.signal < 1) {
    noNetwork = new ios.Text({
      superLayer: statusBar,
      fontSize: 12,
      text: "No Network"
    });
    noNetwork.constraints = {
      leading: 7,
      top: 3
    };
  } else {
    for (i = k = 0, ref1 = setup.signal; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
      dot = new Layer({
        height: ios.utils.px(5.5),
        width: ios.utils.px(5.5),
        backgroundColor: "black",
        superLayer: statusBar,
        borderRadius: ios.utils.px(5.5) / 2,
        backgroundColor: this.color,
        name: "signal[" + i + "]"
      });
      if (i === 0) {
        dot.constraints = {
          leading: 7,
          top: 7
        };
      } else {
        dot.constraints = {
          leading: [signal[i - 1], 1],
          top: 7
        };
      }
      signal.push(dot);
      ios.layout.set();
    }
    if (setup.signal < 5) {
      nonDots = 5 - setup.signal;
      for (i = l = 0, ref2 = nonDots; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        nonDot = new Layer({
          height: ios.utils.px(5.5),
          width: ios.utils.px(5.5),
          superLayer: statusBar,
          borderRadius: ios.utils.px(5.5) / 2,
          backgroundColor: "transparent",
          name: "signal[" + signal.length + "]"
        });
        nonDot.style.border = (ios.utils.px(1)) + "px solid " + this.color;
        nonDot.constraints = {
          leading: [signal[signal.length - 1], 1],
          top: 7
        };
        signal.push(nonDot);
        ios.layout.set();
      }
    }
    carrier = new ios.Text({
      style: "statusBarCarrier",
      text: setup.carrier,
      superLayer: statusBar,
      fontSize: 12,
      color: this.color,
      name: "carrier",
      textTransform: "capitalize"
    });
    carrier.constraints = {
      leading: [signal[signal.length - 1], 7],
      top: 3
    };
    ios.layout.set();
    if (setup.carrier) {
      network = new ios.Text({
        style: "statusBarNetwork",
        text: setup.network,
        superLayer: statusBar,
        fontSize: 12,
        color: this.color,
        name: "network",
        textTransform: "uppercase"
      });
      network.constraints = {
        leading: [carrier, 5],
        top: 3
      };
    }
    if (setup.carrier === "" || setup.carrier === "wifi") {
      networkIcon = ios.utils.svg(ios.assets.network, this.color);
      network = new Layer({
        width: networkIcon.width,
        height: networkIcon.height,
        superLayer: statusBar,
        backgroundColor: "transparent",
        name: "network"
      });
      network.html = networkIcon.svg;
      ios.utils.changeFill(network, this.color);
      network.constraints = {
        leading: [signal[signal.length - 1], 5],
        top: this.topConstraint
      };
    }
  }
  batteryIcon = new Layer({
    width: ios.utils.px(25),
    height: ios.utils.px(10),
    superLayer: statusBar,
    backgroundColor: "transparent",
    name: "batteryIcon"
  });
  if (setup.battery > 70) {
    highBattery = ios.utils.svg(ios.assets.batteryHigh);
    batteryIcon.html = highBattery.svg;
    ios.utils.changeFill(batteryIcon, this.color);
  }
  if (setup.battery <= 70 && setup.battery > 20) {
    midBattery = ios.utils.svg(ios.assets.batteryMid);
    batteryIcon.html = midBattery.svg;
    ios.utils.changeFill(batteryIcon, this.color);
  }
  if (setup.battery <= 20) {
    lowBattery = ios.utils.svg(ios.assets.batteryLow);
    batteryIcon.html = lowBattery.svg;
    ios.utils.changeFill(batteryIcon, this.color);
  }
  batteryIcon.constraints = {
    trailing: 7,
    top: this.batteryIcon
  };
  batteryPercent = new ios.Text({
    style: "statusBarBatteryPercent",
    text: setup.battery + "%",
    superLayer: statusBar,
    fontSize: 12,
    color: this.color,
    name: "batteryPercent"
  });
  batteryPercent.constraints = {
    trailing: [batteryIcon, 3],
    verticalCenter: time
  };
  bluetoothSVG = ios.utils.svg(ios.assets.bluetooth);
  bluetooth = new Layer({
    width: bluetoothSVG.width,
    height: bluetoothSVG.height,
    superLayer: statusBar,
    opacity: .5,
    backgroundColor: "transparent",
    name: "bluetooth"
  });
  bluetooth.html = bluetoothSVG.svg;
  ios.utils.changeFill(bluetooth, this.color);
  bluetooth.constraints = {
    top: this.bluetooth,
    trailing: [batteryPercent, 7]
  };
  ios.layout.set();
  statusBar.battery = {};
  statusBar.battery.percent = batteryPercent;
  statusBar.battery.icon = batteryIcon;
  statusBar.bluetooth = bluetooth;
  statusBar.time = time;
  statusBar.network = network;
  statusBar.carrier = carrier;
  statusBar.signal = signal;
  return statusBar;
};


},{"ios-kit":"ios-kit"}],"ios-kit-tab-bar":[function(require,module,exports){
var ios;

ios = require('ios-kit');

exports.defaults = {
  tab: {
    label: "label",
    icon: "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='25px' height='25px' viewBox='0 0 25 25' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <!-- Generator: Sketch 3.6.1 (26313) - http://www.bohemiancoding.com/sketch --> <title>1</title> <desc>Created with Sketch.</desc> <defs></defs> <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='1'> <g id='Bottom-Bar/Tab-Bar' transform='translate(-25.000000, -7.000000)' fill='#0076FF'> <g id='Placeholders' transform='translate(25.000000, 7.000000)'> <rect id='1' x='0' y='0' width='25' height='25' rx='3'></rect> </g> </g> </g> </svg>",
    active: void 0,
    inactive: void 0,
    tabBar: void 0,
    type: "tab"
  },
  bar: {
    tabs: [],
    start: 0,
    type: "tabBar",
    backgroundColor: "white",
    activeColor: "blue",
    inactiveColor: "gray",
    blur: true
  }
};

exports.defaults.tab.props = Object.keys(exports.defaults.tab);

exports.defaults.bar.props = Object.keys(exports.defaults.bar);

exports.tab = function(array) {
  var setup, specs, svgFrame, tab;
  setup = ios.utils.setupComponent(array, exports.defaults.tab);
  specs = {
    width: 75
  };
  switch (ios.device.name) {
    case "iphone-5":
      specs.width = 55;
  }
  tab = new ios.View({
    backgroundColor: "transparent",
    name: setup.label,
    constraints: {
      width: specs.width,
      height: 49
    }
  });
  tab.view = new ios.View({
    name: setup.label + ".view",
    backgroundColor: "transparent",
    constraints: {
      top: 0,
      bottom: 0,
      leading: 0,
      trailing: 0
    }
  });
  tab.active = new ios.View({
    name: ".active",
    backgroundColor: "transparent",
    constraints: {
      top: 0,
      bottom: 0,
      leading: 0,
      trailing: 0
    },
    superLayer: tab
  });
  tab.active.icon = new ios.View({
    name: ".active.icon",
    constraints: {
      width: 25,
      height: 25,
      align: "horizontal",
      top: 7
    },
    backgroundColor: "transparent",
    superLayer: tab.active
  });
  if (setup.active === void 0) {
    svgFrame = ios.utils.svg(setup.icon);
    tab.active.icon.html = svgFrame.svg;
    tab.active.icon.width = svgFrame.width;
    tab.active.icon.height = svgFrame.height;
  } else {
    setup.active.superLayer = tab.active.icon;
    setup.active.props = {
      width: tab.active.icon.width,
      height: tab.active.icon.height
    };
  }
  tab.inactive = new ios.View({
    backgroundColor: "transparent",
    name: ".inactive",
    constraints: {
      top: 0,
      bottom: 0,
      leading: 0,
      trailing: 0
    },
    superLayer: tab
  });
  tab.inactive.icon = new ios.View({
    constraints: {
      width: 25,
      height: 25,
      align: "horizontal",
      top: 7
    },
    backgroundColor: "transparent",
    name: ".inactive.icon",
    superLayer: tab.inactive
  });
  tab.label = new ios.Text({
    text: setup.label,
    superLayer: tab,
    color: "#929292",
    fontSize: 10,
    name: ".label",
    textTransform: "capitalize"
  });
  tab.label.constraints = {
    bottom: 2,
    horizontalCenter: tab.active.icon
  };
  if (setup.inactive === void 0) {
    svgFrame = ios.utils.svg(setup.icon);
    tab.inactive.icon.html = svgFrame.svg;
    tab.inactive.icon.width = svgFrame.width;
    tab.inactive.icon.height = svgFrame.height;
  } else {
    setup.inactive.superLayer = tab.inactive.icon;
    setup.inactive.props = {
      width: tab.inactive.icon.width,
      height: tab.inactive.icon.height
    };
  }
  return tab;
};

exports.bar = function(array) {
  var bar, dummyTab, dummyTab2, i, index, len, ref, setActive, setup, specs, tab;
  setup = ios.utils.setupComponent(array, exports.defaults.bar);
  if (setup.tabs.length === 0) {
    dummyTab = new exports.tab;
    dummyTab2 = new exports.tab;
    setup.tabs.push(dummyTab);
    setup.tabs.push(dummyTab2);
  }
  specs = {
    width: 75
  };
  switch (ios.device.name) {
    case "iphone-5":
      specs.width = 55;
  }
  bar = new ios.View({
    backgroundColor: "transparent",
    name: "tabBar",
    constraints: {
      leading: 0,
      trailing: 0,
      bottom: 0,
      height: 49
    }
  });
  bar.bg = new ios.View({
    superLayer: bar,
    name: ".bg",
    constraints: {
      leading: 0,
      trailing: 0,
      bottom: 0,
      height: 49
    }
  });
  bar.divider = new ios.View({
    backgroundColor: "#B2B2B2",
    name: ".divider",
    superLayer: bar,
    constraints: {
      top: 0,
      leading: 0,
      trailing: 0,
      height: .5
    }
  });
  bar.box = new ios.View({
    superLayer: bar,
    backgroundColor: "transparent",
    name: ".box",
    constraints: {
      height: 49,
      width: setup.tabs.length * specs.width
    }
  });
  setActive = function(tabIndex) {
    var i, index, len, ref, results, tab;
    ref = setup.tabs;
    results = [];
    for (index = i = 0, len = ref.length; i < len; index = ++i) {
      tab = ref[index];
      if (index === tabIndex) {
        tab.label.color = ios.utils.color(setup.activeColor);
        tab.active.visible = true;
        tab.inactive.visible = false;
        results.push(tab.view.visible = true);
      } else {
        tab.label.color = ios.utils.color(setup.inactiveColor);
        tab.active.visible = false;
        tab.inactive.visible = true;
        results.push(tab.view.visible = false);
      }
    }
    return results;
  };
  ref = setup.tabs;
  for (index = i = 0, len = ref.length; i < len; index = ++i) {
    tab = ref[index];
    bar.box.addSubLayer(tab);
    ios.utils.changeFill(tab.active.icon, ios.utils.color(setup.activeColor));
    ios.utils.changeFill(tab.inactive.icon, ios.utils.color(setup.inactiveColor));
    tab.label.color = ios.utils.color(setup.inactiveColor);
    bar.bg.backgroundColor = setup.backgroundColor;
    if (setup.blur) {
      bar.bg.backgroundColor = "rgba(255,255,255, .9)";
      ios.utils.bgBlur(bar.bg);
    }
    if (index === 0) {
      tab.constraints.leading = 0;
    } else {
      tab.constraints.leading = setup.tabs[index - 1];
    }
    ios.layout.set(tab);
    tab.on(Events.TouchStart, function() {
      var tabIndex;
      tabIndex = this.x / ios.utils.px(specs.width);
      return setActive(tabIndex);
    });
  }
  bar.box.constraints = {
    align: "horizontal"
  };
  ios.layout.set(bar.box);
  setActive(setup.start);
  bar.tabs = setup.tabs;
  return bar;
};


},{"ios-kit":"ios-kit"}],"ios-kit-temp":[function(require,module,exports){
var ios;

ios = require('ios-kit');

exports.defaults = {
  key: "value"
};

exports.defaults.props = Object.keys(exports.defaults);

exports.create = function(array) {
  var setup;
  setup = ios.utils.setupComponent(array, exports.defaults);
};


},{"ios-kit":"ios-kit"}],"ios-kit-text":[function(require,module,exports){
var ios;

ios = require('ios-kit');

exports.defaults = {
  editable: true,
  constraints: void 0,
  text: "iOS Text Layer",
  type: "text",
  x: 0,
  y: 0,
  width: -1,
  height: -1,
  superLayer: void 0,
  style: "default",
  lines: 1,
  textAlign: "left",
  backgroundColor: "transparent",
  color: "black",
  fontSize: 17,
  fontFamily: "-apple-system, Helvetica, Arial, sans-serif",
  fontWeight: "regular",
  lineHeight: "auto",
  name: "text layer",
  opacity: 1,
  textTransform: "none",
  letterSpacing: 0,
  name: "text layer",
  selectable: true,
  selectColor: "rgba(0, 118, 255, .2)",
  selectControls: "#0076FF"
};

exports.defaults.props = Object.keys(exports.defaults);

exports.create = function(array) {
  var exceptions, i, j, len, len1, prop, ref, ref1, setup, textFrame, textLayer;
  setup = ios.utils.setupComponent(array, exports.defaults);
  exceptions = Object.keys(setup);
  textLayer = new ios.View({
    backgroundColor: "transparent",
    name: setup.name,
    superLayer: setup.superLayer,
    constraints: setup.constraints
  });
  textLayer.type = "text";
  textLayer.html = setup.text;
  ref = ios.lib.layerProps;
  for (i = 0, len = ref.length; i < len; i++) {
    prop = ref[i];
    if (setup[prop]) {
      if (prop === "color") {
        setup[prop] = ios.utils.color(setup[prop]);
      }
      textLayer[prop] = setup[prop];
    }
  }
  ref1 = ios.lib.layerStyles;
  for (j = 0, len1 = ref1.length; j < len1; j++) {
    prop = ref1[j];
    if (setup[prop]) {
      if (prop === "lineHeight" && setup[prop] === "auto") {
        textLayer.style.lineHeight = setup.fontSize;
      }
      if (prop === "fontWeight") {
        switch (setup[prop]) {
          case "ultrathin":
            setup[prop] = 100;
            break;
          case "thin":
            setup[prop] = 200;
            break;
          case "light":
            setup[prop] = 300;
            break;
          case "regular":
            setup[prop] = 400;
            break;
          case "medium":
            setup[prop] = 500;
            break;
          case "semibold":
            setup[prop] = 600;
            break;
          case "bold":
            setup[prop] = 700;
            break;
          case "black":
            setup[prop] = 800;
        }
      }
      if (prop === "fontSize" || prop === "lineHeight" || prop === "letterSpacing") {
        setup[prop] = ios.utils.px(setup[prop]) + "px";
      }
      textLayer.style[prop] = setup[prop];
    }
  }
  textFrame = ios.utils.textAutoSize(textLayer);
  textLayer.props = {
    height: textFrame.height,
    width: textFrame.width
  };
  if (setup.editable) {
    textLayer.on("change:html", function() {
      textFrame = ios.utils.textAutoSize(textLayer);
      return textLayer.props = {
        height: textFrame.height,
        width: textFrame.width
      };
    });
  }
  ios.layout.set({
    target: textLayer
  });
  return textLayer;
};


},{"ios-kit":"ios-kit"}],"ios-kit-utils":[function(require,module,exports){
var ios;

ios = require('ios-kit');

exports.pt = function(px) {
  var pt;
  pt = px / ios.device.scale;
  pt = Math.round(pt);
  return pt;
};

exports.px = function(pt) {
  var px;
  px = pt * ios.device.scale;
  px = Math.round(px);
  return px;
};

exports.color = function(colorString) {
  var color;
  color = "";
  if (typeof colorString === "string") {
    colorString = colorString.toLowerCase();
    if (colorString.slice(0, 4) === "rgba") {
      return colorString;
    }
  }
  switch (colorString) {
    case "red":
      color = new Color("#FE3824");
      break;
    case "blue":
      color = new Color("#0076FF");
      break;
    case "pink":
      color = new Color("#FE2851");
      break;
    case "grey":
      color = new Color("#929292");
      break;
    case "gray":
      color = new Color("#929292");
      break;
    case "black":
      color = new Color("#030303");
      break;
    case "white":
      color = new Color("#EFEFF4");
      break;
    case "orange":
      color = new Color("#FF9600");
      break;
    case "green":
      color = new Color("#44DB5E");
      break;
    case "light blue":
      color = new Color("#54C7FC");
      break;
    case "light-blue":
      color = new Color("#54C7FC");
      break;
    case "yellow":
      color = new Color("#FFCD00");
      break;
    case "light key":
      color = new Color("#9DA7B3");
      break;
    case "light-key":
      color = new Color("#9DA7B3");
      break;
    default:
      if (colorString[0] === "#" || colorString.toHexString()[0] === "#") {
        color = new Color(colorString);
      } else {
        color = new Color("#929292");
      }
  }
  return color;
};

exports.clean = function(string) {
  string = string.replace(/[&]nbsp[;]/gi, " ").replace(/[<]br[>]/gi, "");
  return string;
};

exports.svg = function(svg) {
  var endIndex, hEndIndex, hStartIndex, height, heightString, newHeight, newString, newWidth, startIndex, string, wEndIndex, wStartIndex, width;
  startIndex = svg.search("<svg width=");
  endIndex = svg.search(" viewBox");
  string = svg.slice(startIndex, endIndex);
  wStartIndex = string.search("=") + 2;
  wEndIndex = string.search("px");
  width = string.slice(wStartIndex, wEndIndex);
  newWidth = exports.px(width);
  heightString = string.slice(wEndIndex + 4, string.length);
  hStartIndex = heightString.search("=") + 2;
  hEndIndex = heightString.search("px");
  height = heightString.slice(hStartIndex, hEndIndex);
  newHeight = exports.px(height);
  newString = string.replace(width, newWidth);
  newString = newString.replace(height, newHeight);
  svg = svg.replace(string, newString);
  return {
    svg: svg,
    width: newWidth,
    height: newHeight
  };
};

exports.changeFill = function(layer, color) {
  var endIndex, fillString, newString, startIndex, string;
  startIndex = layer.html.search("fill=\"#");
  fillString = layer.html.slice(startIndex, layer.html.length);
  endIndex = fillString.search("\">");
  string = fillString.slice(0, endIndex);
  newString = "fill=\"" + exports.color(color);
  return layer.html = layer.html.replace(string, newString);
};

exports.capitalize = function(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

exports.getTime = function() {
  var date, dateObj, day, daysOfTheWeek, hours, mins, month, monthsOfTheYear, secs;
  daysOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  monthsOfTheYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  dateObj = new Date();
  month = monthsOfTheYear[dateObj.getMonth()];
  date = dateObj.getDate();
  day = daysOfTheWeek[dateObj.getDay()];
  hours = dateObj.getHours();
  mins = dateObj.getMinutes();
  secs = dateObj.getSeconds();
  return {
    month: month,
    date: date,
    day: day,
    hours: hours,
    mins: mins,
    secs: secs
  };
};

exports.bgBlur = function(layer) {
  layer.style["-webkit-backdrop-filter"] = "blur(" + (exports.px(5)) + "px)";
  return layer;
};

exports.textAutoSize = function(textLayer) {
  var constraints, styles, textFrame;
  constraints = {};
  if (textLayer.constraints) {
    if (textLayer.constraints.height) {
      constraints.height = exports.px(textLayer.constraints.height);
    }
    if (textLayer.constraints.width) {
      constraints.width = exports.px(textLayer.constraints.width);
    }
  }
  styles = {
    fontSize: textLayer.style.fontSize,
    fontFamily: textLayer.style.fontFamily,
    fontWeight: textLayer.style.fontWeight,
    lineHeight: textLayer.style.lineHeight,
    letterSpacing: textLayer.style.letterSpacing,
    textTransform: textLayer.style.textTransform
  };
  textFrame = Utils.textSize(textLayer.html, styles, constraints);
  return {
    width: textFrame.width,
    height: textFrame.height
  };
};

exports.getDevice = function() {
  var device, frame, nameFormatter;
  nameFormatter = function(name) {
    var j, len, removeTerms, term;
    removeTerms = ["apple-", "-gold", "-silver", "-rose", "-space-gray", "-yellow", "-green", "-red", "-white", "-blue", "-mini", "-air", "-2", "-4"];
    for (j = 0, len = removeTerms.length; j < len; j++) {
      term = removeTerms[j];
      name = name.replace(term, "");
    }
    if (name.indexOf("-5s") !== -1) {
      name = name.replace("-5s", "-5");
    }
    if (name.indexOf("-5c") !== -1) {
      name = name.replace("-5c", "-5");
    }
    return name;
  };
  device = "";
  frame = true;
  if (ios.lib.realDevices[innerWidth] && ios.lib.realDevices[innerWidth][innerHeight]) {
    device = ios.lib.realDevices[innerWidth][innerHeight];
    frame = false;
    Framer.Device.deviceType = "fullscreen";
  }
  if (frame) {
    device = {
      name: nameFormatter(Framer.Device.deviceType),
      display_name: Framer.DeviceView.Devices[Framer.Device.deviceType].display_name,
      width: Framer.DeviceView.Devices[Framer.Device.deviceType].screenWidth,
      height: Framer.DeviceView.Devices[Framer.Device.deviceType].screenHeight,
      scale: ios.lib.framerFrames[Framer.DeviceView.Devices[Framer.Device.deviceType].screenWidth]
    };
  }
  if (device.scale === void 0) {
    device.scale = 2;
  }
  if (device.width === void 0) {
    device.width = innerWidth;
  }
  if (device.height === void 0) {
    device.height = innerHeight;
  }
  return device;
  exports.scale = ios.lib.frames[device].scale;
  if (device === "fullscreen") {
    exports.width = window.innerWidth;
    exports.height = window.innerHeight;
  } else {
    exports.width = ios.lib.frames[device].width;
    exports.height = ios.lib.frames[device].height;
    if (window.innerWidth === 1242 || window.innerWidth === 2208) {
      exports.width = window.innerWidth;
      exports.height = window.innerHeight;
      exports.scale = 3;
    }
  }
  exports.mobile = ios.lib.frames[device].mobile;
  exports.platform = ios.lib.frames[device].platform;
  exports.orientation = Framer.Device.orientation;
  device = device.replace("apple-", "");
  device = device.replace("-gold", "");
  device = device.replace("-green", "");
  device = device.replace("-blue", "");
  device = device.replace("-red", "");
  device = device.replace("-white", "");
  device = device.replace("-yellow", "");
  device = device.replace("-pink", "");
  device = device.replace("-space-grey", "");
  device = device.replace("-rose", "");
  device = device.replace("5s", "5");
  device = device.replace("5c", "5");
  device = device.replace("-mini", "");
  device = device.replace("-air", "");
  device = device.replace("-2", "");
  device = device.replace("-4", "");
  device = device.replace("-silver", "");
  capturedDevice.name = device;
  return capturedDevice;
};

exports.specialChar = function(layer) {
  var chosenColor, newText, text;
  text = layer;
  if (layer.type === "button") {
    text = layer.label;
  }
  if (text.html.indexOf("-b") !== -1) {
    newText = text.html.replace("-b ", "");
    exports.update(text, [
      {
        text: newText
      }, {
        fontWeight: 600
      }
    ]);
  }
  if (text.html.indexOf("-r") !== -1) {
    newText = text.html.replace("-r ", "");
    exports.update(text, [
      {
        text: newText
      }, {
        color: "red"
      }
    ]);
  }
  if (text.html.indexOf("-rb") !== -1) {
    newText = text.html.replace("-rb ", "");
    exports.update(text, [
      {
        text: newText
      }, {
        color: "blue"
      }
    ]);
  }
  if (text.html.indexOf("-lb") !== -1) {
    newText = text.html.replace("-lb ", "");
    exports.update(text, [
      {
        text: newText
      }, {
        color: "light-blue"
      }
    ]);
  }
  if (text.html.indexOf("-g") !== -1) {
    newText = text.html.replace("-g ", "");
    exports.update(text, [
      {
        text: newText
      }, {
        color: "green"
      }
    ]);
  }
  if (text.html.indexOf("-o") !== -1) {
    newText = text.html.replace("-o ", "");
    exports.update(text, [
      {
        text: newText
      }, {
        color: "orange"
      }
    ]);
  }
  if (text.html.indexOf("-p") !== -1) {
    newText = text.html.replace("-p ", "");
    exports.update(text, [
      {
        text: newText
      }, {
        color: "orange"
      }
    ]);
  }
  if (text.html.indexOf("-y") !== -1) {
    newText = text.html.replace("-y ", "");
    exports.update(text, [
      {
        text: newText
      }, {
        color: "yellow"
      }
    ]);
  }
  if (text.html.indexOf("-#") !== -1) {
    chosenColor = text.html.slice(1, 8);
    newText = text.html.slice(9, text.html.length);
    exports.update(text, [
      {
        text: newText
      }, {
        color: chosenColor
      }
    ]);
  }
  if (text.html.indexOf("-") !== -1) {
    newText = text.html.replace("- ", "");
    exports.update(text, [
      {
        text: newText
      }
    ]);
  }
  if (layer.buttonType === "text") {
    layer.width = text.width;
  }
  ios.layout.set(layer);
  if (layer.type === "button") {
    layer.width = text.width;
  }
  return text.color;
};

exports.update = function(layer, array) {
  var change, j, key, len, textFrame, value;
  if (array === void 0) {
    array = [];
  }
  if (layer.type === "text") {
    for (j = 0, len = array.length; j < len; j++) {
      change = array[j];
      key = Object.keys(change)[0];
      value = change[key];
      if (key === "text") {
        layer.html = value;
      }
      if (key === "fontWeight") {
        layer.style[key] = value;
      }
      if (key === "color") {
        layer.color = exports.color(value);
      }
    }
    textFrame = exports.textAutoSize(layer);
    layer.width = textFrame.width;
    layer.height = textFrame.height;
  }
  return ios.layout.set();
};

exports.autoColor = function(colorObject) {
  var blue, color, green, red, rgb;
  rgb = colorObject.toRgbString();
  rgb = rgb.substring(4, rgb.length - 1);
  rgb = rgb.replace(/ /g, '');
  rgb = rgb.replace(/ /g, '');
  rgb = rgb.split(',');
  red = rgb[0];
  green = rgb[1];
  blue = rgb[2];
  color = "";
  if ((red * 0.299 + green * 0.587 + blue * 0.114) > 186) {
    color = "#000";
  } else {
    color = "#FFF";
  }
  return color;
};

exports.sameParent = function(layer1, layer2) {
  var parentOne, parentTwo;
  parentOne = layer1.superLayer;
  parentTwo = layer2.superLayer;
  if (parentOne === parentTwo) {
    return true;
  } else {
    return false;
  }
};

exports.timeDelegate = function(layer, clockType) {
  this.time = exports.getTime();
  return Utils.delay(60 - this.time.secs, function() {
    this.time = exports.getTime();
    exports.update(layer, [
      {
        text: exports.timeFormatter(this.time, clockType)
      }
    ]);
    return Utils.interval(60, function() {
      this.time = exports.getTime();
      return exports.update(layer, [
        {
          text: exports.timeFormatter(this.time, clockType)
        }
      ]);
    });
  });
};

exports.timeFormatter = function(timeObj, clockType) {
  if (clockType === false) {
    if (timeObj.hours > 12) {
      timeObj.hours = timeObj.hours - 12;
    }
    if (timeObj.hours === 0) {
      timeObj.hours = 12;
    }
  }
  if (timeObj.mins < 10) {
    timeObj.mins = "0" + timeObj.mins;
  }
  return timeObj.hours + ":" + timeObj.mins;
};

exports.setupComponent = function(array, defaults) {
  var i, j, len, obj, ref;
  if (array === void 0) {
    array = [];
  }
  obj = {};
  ref = defaults.props;
  for (j = 0, len = ref.length; j < len; j++) {
    i = ref[j];
    if (array[i] !== void 0) {
      obj[i] = array[i];
    } else {
      obj[i] = defaults[i];
    }
  }
  return obj;
};

exports.emojiFormatter = function(string) {
  var arrayOfCodes, code, decoded, j, k, len, len1, unicodeFormat;
  unicodeFormat = "";
  if (string[0] === "E" || string[0] === "3" || string[0] === "2" || string[0] === "C") {
    arrayOfCodes = string.split(" ");
    for (j = 0, len = arrayOfCodes.length; j < len; j++) {
      code = arrayOfCodes[j];
      unicodeFormat = unicodeFormat + "%" + code;
    }
  } else {
    arrayOfCodes = string.split(" ");
    unicodeFormat = "%F0%9F";
    for (k = 0, len1 = arrayOfCodes.length; k < len1; k++) {
      code = arrayOfCodes[k];
      unicodeFormat = unicodeFormat + "%" + code;
    }
  }
  decoded = decodeURIComponent(unicodeFormat);
  return decoded;
};

exports.buildEmojisObject = function() {
  var code, emoji, emojis, index, j, len, ref, results;
  emojis = [];
  ref = ios.assets.emojiCodes;
  results = [];
  for (index = j = 0, len = ref.length; j < len; index = ++j) {
    code = ref[index];
    emoji = exports.emojiFormatter(code);
    results.push(emojis.push(emoji));
  }
  return results;
};

exports.write = function(obj, text) {
  if (obj.type === 'field') {
    return obj.text.html = obj.text.html + text;
  } else {
    return obj.html = obj.html + text;
  }
};


},{"ios-kit":"ios-kit"}],"ios-kit-view":[function(require,module,exports){
var ios;

ios = require('ios-kit');

exports.create = function(obj) {
  var i, len, prop, ref, view;
  if (obj === void 0) {
    obj = {};
  }
  view = new Layer;
  view.constraints = {};
  ref = ios.lib.layerProps;
  for (i = 0, len = ref.length; i < len; i++) {
    prop = ref[i];
    if (obj[prop]) {
      view[prop] = obj[prop];
    }
  }
  if (obj["constraints"]) {
    view.constraints = obj["constraints"];
    ios.layout.set(view);
  }
  return view;
};


},{"ios-kit":"ios-kit"}],"ios-kit":[function(require,module,exports){
var conv, layout, library, utils;

exports.layout = layout = require('ios-kit-layout');

exports.lib = library = require('ios-kit-library');

exports.utils = utils = require('ios-kit-utils');

exports.converter = conv = require('ios-kit-converter');

exports.device = utils.getDevice();

exports.assets = library.assets;

exports.isPad = function() {
  if (exports.device.name.indexOf('ipad') !== -1) {
    return true;
  } else {
    return false;
  }
};

exports.isPhone = function() {
  if (exports.device.name.indexOf('iphone') !== -1) {
    return true;
  } else {
    return false;
  }
};

exports.convert = function(sketchObj) {
  return conv.convert(sketchObj);
};

exports.color = function(string) {
  return utils.color(string);
};

exports.px = function(num) {
  return utils.px(num);
};

exports.pt = function(num) {
  return utils.pt(num);
};

exports.alert = require('ios-kit-alert');

exports.banner = require('ios-kit-banner');

exports.button = require('ios-kit-button');

exports.field = require('ios-kit-field');

exports.keyboard = require('ios-kit-keyboard');

exports.nav = require('ios-kit-nav-bar');

exports.sheet = require('ios-kit-sheet');

exports.status = require('ios-kit-status-bar');

exports.tab = require('ios-kit-tab-bar');

exports.text = require('ios-kit-text');

exports.view = require('ios-kit-view');

exports.Alert = exports.alert.create;

exports.Banner = exports.banner.create;

exports.Button = exports.button.create;

exports.Field = exports.field.create;

exports.Keyboard = exports.keyboard.create;

exports.NavBar = exports.nav.create;

exports.Sheet = exports.sheet.create;

exports.StatusBar = exports.status.create;

exports.Tab = exports.tab.tab;

exports.TabBar = exports.tab.bar;

exports.Text = exports.text.create;

exports.View = exports.view.create;

exports.l = {};


},{"ios-kit-alert":"ios-kit-alert","ios-kit-banner":"ios-kit-banner","ios-kit-button":"ios-kit-button","ios-kit-converter":"ios-kit-converter","ios-kit-field":"ios-kit-field","ios-kit-keyboard":"ios-kit-keyboard","ios-kit-layout":"ios-kit-layout","ios-kit-library":"ios-kit-library","ios-kit-nav-bar":"ios-kit-nav-bar","ios-kit-sheet":"ios-kit-sheet","ios-kit-status-bar":"ios-kit-status-bar","ios-kit-tab-bar":"ios-kit-tab-bar","ios-kit-text":"ios-kit-text","ios-kit-utils":"ios-kit-utils","ios-kit-view":"ios-kit-view"}]},{},[])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWVyLm1vZHVsZXMuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1VzZXJzL3h5L0Rlc2t0b3AvR3VydS9jb2RlL0NvbnRyb2xsZXIuZnJhbWVyL21vZHVsZXMvaW9zLWtpdC5jb2ZmZWUiLCIuLi8uLi8uLi8uLi8uLi8uLi9Vc2Vycy94eS9EZXNrdG9wL0d1cnUvY29kZS9Db250cm9sbGVyLmZyYW1lci9tb2R1bGVzL2lvcy1raXQtdmlldy5jb2ZmZWUiLCIuLi8uLi8uLi8uLi8uLi8uLi9Vc2Vycy94eS9EZXNrdG9wL0d1cnUvY29kZS9Db250cm9sbGVyLmZyYW1lci9tb2R1bGVzL2lvcy1raXQtdXRpbHMuY29mZmVlIiwiLi4vLi4vLi4vLi4vLi4vLi4vVXNlcnMveHkvRGVza3RvcC9HdXJ1L2NvZGUvQ29udHJvbGxlci5mcmFtZXIvbW9kdWxlcy9pb3Mta2l0LXRleHQuY29mZmVlIiwiLi4vLi4vLi4vLi4vLi4vLi4vVXNlcnMveHkvRGVza3RvcC9HdXJ1L2NvZGUvQ29udHJvbGxlci5mcmFtZXIvbW9kdWxlcy9pb3Mta2l0LXRlbXAuY29mZmVlIiwiLi4vLi4vLi4vLi4vLi4vLi4vVXNlcnMveHkvRGVza3RvcC9HdXJ1L2NvZGUvQ29udHJvbGxlci5mcmFtZXIvbW9kdWxlcy9pb3Mta2l0LXRhYi1iYXIuY29mZmVlIiwiLi4vLi4vLi4vLi4vLi4vLi4vVXNlcnMveHkvRGVza3RvcC9HdXJ1L2NvZGUvQ29udHJvbGxlci5mcmFtZXIvbW9kdWxlcy9pb3Mta2l0LXN0YXR1cy1iYXIuY29mZmVlIiwiLi4vLi4vLi4vLi4vLi4vLi4vVXNlcnMveHkvRGVza3RvcC9HdXJ1L2NvZGUvQ29udHJvbGxlci5mcmFtZXIvbW9kdWxlcy9pb3Mta2l0LXNoZWV0LmNvZmZlZSIsIi4uLy4uLy4uLy4uLy4uLy4uL1VzZXJzL3h5L0Rlc2t0b3AvR3VydS9jb2RlL0NvbnRyb2xsZXIuZnJhbWVyL21vZHVsZXMvaW9zLWtpdC1uYXYtYmFyLmNvZmZlZSIsIi4uLy4uLy4uLy4uLy4uLy4uL1VzZXJzL3h5L0Rlc2t0b3AvR3VydS9jb2RlL0NvbnRyb2xsZXIuZnJhbWVyL21vZHVsZXMvaW9zLWtpdC1saWJyYXJ5LmNvZmZlZSIsIi4uLy4uLy4uLy4uLy4uLy4uL1VzZXJzL3h5L0Rlc2t0b3AvR3VydS9jb2RlL0NvbnRyb2xsZXIuZnJhbWVyL21vZHVsZXMvaW9zLWtpdC1sYXlvdXQuY29mZmVlIiwiLi4vLi4vLi4vLi4vLi4vLi4vVXNlcnMveHkvRGVza3RvcC9HdXJ1L2NvZGUvQ29udHJvbGxlci5mcmFtZXIvbW9kdWxlcy9pb3Mta2l0LWtleWJvYXJkLmNvZmZlZSIsIi4uLy4uLy4uLy4uLy4uLy4uL1VzZXJzL3h5L0Rlc2t0b3AvR3VydS9jb2RlL0NvbnRyb2xsZXIuZnJhbWVyL21vZHVsZXMvaW9zLWtpdC1maWVsZC5jb2ZmZWUiLCIuLi8uLi8uLi8uLi8uLi8uLi9Vc2Vycy94eS9EZXNrdG9wL0d1cnUvY29kZS9Db250cm9sbGVyLmZyYW1lci9tb2R1bGVzL2lvcy1raXQtY29udmVydGVyLmNvZmZlZSIsIi4uLy4uLy4uLy4uLy4uLy4uL1VzZXJzL3h5L0Rlc2t0b3AvR3VydS9jb2RlL0NvbnRyb2xsZXIuZnJhbWVyL21vZHVsZXMvaW9zLWtpdC1idXR0b24uY29mZmVlIiwiLi4vLi4vLi4vLi4vLi4vLi4vVXNlcnMveHkvRGVza3RvcC9HdXJ1L2NvZGUvQ29udHJvbGxlci5mcmFtZXIvbW9kdWxlcy9pb3Mta2l0LWJhbm5lci5jb2ZmZWUiLCIuLi8uLi8uLi8uLi8uLi8uLi9Vc2Vycy94eS9EZXNrdG9wL0d1cnUvY29kZS9Db250cm9sbGVyLmZyYW1lci9tb2R1bGVzL2lvcy1raXQtYWxlcnQuY29mZmVlIiwiLi4vLi4vLi4vLi4vLi4vLi4vVXNlcnMveHkvRGVza3RvcC9HdXJ1L2NvZGUvQ29udHJvbGxlci5mcmFtZXIvbW9kdWxlcy9maXJlYmFzZS5jb2ZmZWUiLCJub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiNpT1NLaXQgTW9kdWxlXG4jQnkgS2V2eW4gQXJub3R0XG5cbiMgSW1wb3J0IGZyYW1ld29ya1xuZXhwb3J0cy5sYXlvdXQgPSBsYXlvdXQgPSByZXF1aXJlICdpb3Mta2l0LWxheW91dCdcbmV4cG9ydHMubGliID0gbGlicmFyeSA9IHJlcXVpcmUgJ2lvcy1raXQtbGlicmFyeSdcbmV4cG9ydHMudXRpbHMgPSB1dGlscyA9IHJlcXVpcmUgJ2lvcy1raXQtdXRpbHMnXG5leHBvcnRzLmNvbnZlcnRlciA9IGNvbnYgPSByZXF1aXJlICdpb3Mta2l0LWNvbnZlcnRlcidcblxuIyBTZXR1cCByZXNvdXJjZXNcbmV4cG9ydHMuZGV2aWNlID0gdXRpbHMuZ2V0RGV2aWNlKClcbmV4cG9ydHMuYXNzZXRzID0gbGlicmFyeS5hc3NldHNcbmV4cG9ydHMuaXNQYWQgPSAtPiBpZiBleHBvcnRzLmRldmljZS5uYW1lLmluZGV4T2YoJ2lwYWQnKSAhPSAtMSB0aGVuIHJldHVybiB0cnVlIGVsc2UgcmV0dXJuIGZhbHNlXG5leHBvcnRzLmlzUGhvbmUgPSAtPiBpZiBleHBvcnRzLmRldmljZS5uYW1lLmluZGV4T2YoJ2lwaG9uZScpICE9IC0xIHRoZW4gcmV0dXJuIHRydWUgZWxzZSByZXR1cm4gZmFsc2VcblxuIyBTaG9ydGN1dHNcbmV4cG9ydHMuY29udmVydCA9IChza2V0Y2hPYmopIC0+XG4gIGNvbnYuY29udmVydChza2V0Y2hPYmopXG5cbmV4cG9ydHMuY29sb3IgPSAoc3RyaW5nKSAtPlxuICByZXR1cm4gdXRpbHMuY29sb3Ioc3RyaW5nKVxuXG5leHBvcnRzLnB4ID0gKG51bSkgLT5cbiAgcmV0dXJuIHV0aWxzLnB4KG51bSlcblxuZXhwb3J0cy5wdCA9IChudW0pIC0+XG4gIHJldHVybiB1dGlscy5wdChudW0pXG5cbiNJbXBvcnQgQ29tcG9uZW50c1xuZXhwb3J0cy5hbGVydCA9IHJlcXVpcmUgJ2lvcy1raXQtYWxlcnQnXG5leHBvcnRzLmJhbm5lciA9IHJlcXVpcmUgJ2lvcy1raXQtYmFubmVyJ1xuZXhwb3J0cy5idXR0b24gPSByZXF1aXJlICdpb3Mta2l0LWJ1dHRvbidcbmV4cG9ydHMuZmllbGQgPSByZXF1aXJlICdpb3Mta2l0LWZpZWxkJ1xuZXhwb3J0cy5rZXlib2FyZCA9IHJlcXVpcmUgJ2lvcy1raXQta2V5Ym9hcmQnXG5leHBvcnRzLm5hdiA9IHJlcXVpcmUgJ2lvcy1raXQtbmF2LWJhcidcbmV4cG9ydHMuc2hlZXQgPSByZXF1aXJlICdpb3Mta2l0LXNoZWV0J1xuZXhwb3J0cy5zdGF0dXMgPSByZXF1aXJlICdpb3Mta2l0LXN0YXR1cy1iYXInXG5leHBvcnRzLnRhYiA9IHJlcXVpcmUgJ2lvcy1raXQtdGFiLWJhcidcbmV4cG9ydHMudGV4dCA9IHJlcXVpcmUgJ2lvcy1raXQtdGV4dCdcbmV4cG9ydHMudmlldyA9IHJlcXVpcmUgJ2lvcy1raXQtdmlldydcblxuXG4jI1NldHVwIENvbXBvbmVudHNcbmV4cG9ydHMuQWxlcnQgPSBleHBvcnRzLmFsZXJ0LmNyZWF0ZVxuZXhwb3J0cy5CYW5uZXIgPSBleHBvcnRzLmJhbm5lci5jcmVhdGVcbmV4cG9ydHMuQnV0dG9uID0gZXhwb3J0cy5idXR0b24uY3JlYXRlXG5leHBvcnRzLkZpZWxkID0gZXhwb3J0cy5maWVsZC5jcmVhdGVcbmV4cG9ydHMuS2V5Ym9hcmQgPSBleHBvcnRzLmtleWJvYXJkLmNyZWF0ZVxuZXhwb3J0cy5OYXZCYXIgPSBleHBvcnRzLm5hdi5jcmVhdGVcbmV4cG9ydHMuU2hlZXQgPSBleHBvcnRzLnNoZWV0LmNyZWF0ZVxuZXhwb3J0cy5TdGF0dXNCYXIgPSBleHBvcnRzLnN0YXR1cy5jcmVhdGVcbmV4cG9ydHMuVGFiID0gZXhwb3J0cy50YWIudGFiXG5leHBvcnRzLlRhYkJhciA9IGV4cG9ydHMudGFiLmJhclxuZXhwb3J0cy5UZXh0ID0gZXhwb3J0cy50ZXh0LmNyZWF0ZVxuZXhwb3J0cy5WaWV3ID0gZXhwb3J0cy52aWV3LmNyZWF0ZVxuXG5cbiMgTGF5ZXJzIGZyb20gY29udmVydGluZ1xuZXhwb3J0cy5sID0ge31cbiIsImlvcyA9IHJlcXVpcmUgJ2lvcy1raXQnXG5cbmV4cG9ydHMuY3JlYXRlID0gKG9iaikgLT5cblx0aWYgb2JqID09IHVuZGVmaW5lZCB0aGVuIG9iaiA9IHt9XG5cblx0dmlldyA9IG5ldyBMYXllclxuXHR2aWV3LmNvbnN0cmFpbnRzID0ge31cblxuXHQjIFNldCBmcmFtZXIgcHJvcHNcblx0Zm9yIHByb3AgaW4gaW9zLmxpYi5sYXllclByb3BzXG5cdFx0XHRpZiBvYmpbcHJvcF0gdGhlbiB2aWV3W3Byb3BdID0gb2JqW3Byb3BdXG5cblx0IyBTZXQgY29uc3RyYWludHNcblx0aWYgb2JqW1wiY29uc3RyYWludHNcIl1cblx0XHR2aWV3LmNvbnN0cmFpbnRzID0gb2JqW1wiY29uc3RyYWludHNcIl1cblx0XHRpb3MubGF5b3V0LnNldCh2aWV3KVxuXG5cdHJldHVybiB2aWV3XG4iLCJpb3MgPSByZXF1aXJlICdpb3Mta2l0J1xuXG4jIyBDb252ZXJ0cyBweCB0byBwdFxuZXhwb3J0cy5wdCA9IChweCkgLT5cblx0cHQgPSBweC9pb3MuZGV2aWNlLnNjYWxlXG5cdHB0ID0gTWF0aC5yb3VuZChwdClcblx0cmV0dXJuIHB0XG5cbiMjIENvbnZlcnRzIHB0IHRvIHB4XG5leHBvcnRzLnB4ID0gKHB0KSAtPlxuXHRweCA9IHB0ICogaW9zLmRldmljZS5zY2FsZVxuXHRweCA9IE1hdGgucm91bmQocHgpXG5cdHJldHVybiBweFxuXG4jIyBpT1MgQ29sb3Ig4oCTIFRoaXMgd2lsbCBzdG9yZSBhbGwgb2YgdGhlIGRlZmF1bHQgaU9TIGNvbG9ycyBpbnRlYWQgb2YgdGhlIGRlZmF1bHQgQ1NTIGNvbG9ycy4gKlRoaXMgaXMgb25seSB1cCBoZXJlIGJlY2F1c2UgSSByZWZlciB0byBpdCBpbiB0aGUgZGVmYXVsdHMuKlxuZXhwb3J0cy5jb2xvciA9IChjb2xvclN0cmluZykgLT5cblx0Y29sb3IgPSBcIlwiXG5cdGlmIHR5cGVvZiBjb2xvclN0cmluZyA9PSBcInN0cmluZ1wiXG5cdFx0Y29sb3JTdHJpbmcgPSBjb2xvclN0cmluZy50b0xvd2VyQ2FzZSgpXG5cdFx0aWYgY29sb3JTdHJpbmdbMC4uLjRdID09IFwicmdiYVwiXG5cdFx0XHRyZXR1cm4gY29sb3JTdHJpbmdcblx0c3dpdGNoIGNvbG9yU3RyaW5nXG5cdFx0d2hlbiBcInJlZFwiXG5cdFx0XHRjb2xvciA9IG5ldyBDb2xvcihcIiNGRTM4MjRcIilcblx0XHR3aGVuIFwiYmx1ZVwiXG5cdFx0XHRjb2xvciA9IG5ldyBDb2xvcihcIiMwMDc2RkZcIilcblx0XHR3aGVuIFwicGlua1wiXG5cdFx0XHRjb2xvciA9IG5ldyBDb2xvcihcIiNGRTI4NTFcIilcblx0XHR3aGVuIFwiZ3JleVwiXG5cdFx0XHRjb2xvciA9IG5ldyBDb2xvcihcIiM5MjkyOTJcIilcblx0XHR3aGVuIFwiZ3JheVwiXG5cdFx0XHRjb2xvciA9IG5ldyBDb2xvcihcIiM5MjkyOTJcIilcblx0XHR3aGVuIFwiYmxhY2tcIlxuXHRcdFx0Y29sb3IgPSBuZXcgQ29sb3IoXCIjMDMwMzAzXCIpXG5cdFx0d2hlbiBcIndoaXRlXCJcblx0XHRcdGNvbG9yID0gbmV3IENvbG9yKFwiI0VGRUZGNFwiKVxuXHRcdHdoZW4gXCJvcmFuZ2VcIlxuXHRcdFx0Y29sb3IgPSBuZXcgQ29sb3IoXCIjRkY5NjAwXCIpXG5cdFx0d2hlbiBcImdyZWVuXCJcblx0XHRcdGNvbG9yID0gbmV3IENvbG9yKFwiIzQ0REI1RVwiKVxuXHRcdHdoZW4gXCJsaWdodCBibHVlXCJcblx0XHRcdGNvbG9yID0gbmV3IENvbG9yKFwiIzU0QzdGQ1wiKVxuXHRcdHdoZW4gXCJsaWdodC1ibHVlXCJcblx0XHRcdGNvbG9yID0gbmV3IENvbG9yKFwiIzU0QzdGQ1wiKVxuXHRcdHdoZW4gXCJ5ZWxsb3dcIlxuXHRcdFx0Y29sb3IgPSBuZXcgQ29sb3IoXCIjRkZDRDAwXCIpXG5cdFx0d2hlbiBcImxpZ2h0IGtleVwiXG5cdFx0XHRjb2xvciA9IG5ldyBDb2xvcihcIiM5REE3QjNcIilcblx0XHR3aGVuIFwibGlnaHQta2V5XCJcblx0XHRcdGNvbG9yID0gbmV3IENvbG9yKFwiIzlEQTdCM1wiKVxuXHRcdGVsc2Vcblx0XHRcdGlmIGNvbG9yU3RyaW5nWzBdID09IFwiI1wiIHx8IGNvbG9yU3RyaW5nLnRvSGV4U3RyaW5nKClbMF0gPT0gXCIjXCJcblx0XHRcdFx0Y29sb3IgPSBuZXcgQ29sb3IoY29sb3JTdHJpbmcpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGNvbG9yID0gbmV3IENvbG9yKFwiIzkyOTI5MlwiKVxuXHRyZXR1cm4gY29sb3JcblxuIyBTdXBwb3J0aW5nIEZ1bmN0aW9uc1xuIyBVdGlsc1xuXG4jIENsZWFucyBhIHN0cmluZyBvZiA8YnI+IGFuZCAmbmJzcDtcbmV4cG9ydHMuY2xlYW4gPSAoc3RyaW5nKSAtPlxuXHQjIyByZW1vdmUgd2hpdGUgc3BhY2Vcblx0c3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoL1smXW5ic3BbO10vZ2ksIFwiIFwiKS5yZXBsYWNlKC9bPF1icls+XS9naSwgXCJcIilcblx0cmV0dXJuIHN0cmluZ1xuXG4jIENvbnZlcnRzIHB4J3Mgb2YgYW4gU1ZHIHRvIHNjYWxhYmxlIHZhcmlhYmxlc1xuZXhwb3J0cy5zdmcgPSAoc3ZnKSAtPlxuXHQjIEZpbmQgU3RyaW5nXG5cdHN0YXJ0SW5kZXggPSBzdmcuc2VhcmNoKFwiPHN2ZyB3aWR0aD1cIilcblx0ZW5kSW5kZXggPSBzdmcuc2VhcmNoKFwiIHZpZXdCb3hcIilcblx0c3RyaW5nID0gc3ZnLnNsaWNlKHN0YXJ0SW5kZXgsIGVuZEluZGV4KVxuXG5cdCNGaW5kIHdpZHRoXG5cdHdTdGFydEluZGV4ID0gc3RyaW5nLnNlYXJjaChcIj1cIikgKyAyXG5cdHdFbmRJbmRleCA9ICBzdHJpbmcuc2VhcmNoKFwicHhcIilcblx0d2lkdGggPSBzdHJpbmcuc2xpY2Uod1N0YXJ0SW5kZXgsIHdFbmRJbmRleClcblx0bmV3V2lkdGggPSBleHBvcnRzLnB4KHdpZHRoKVxuXG5cdCMgRmluZCBIZWlnaHRcblx0aGVpZ2h0U3RyaW5nID0gc3RyaW5nLnNsaWNlKHdFbmRJbmRleCArIDQsIHN0cmluZy5sZW5ndGgpXG5cdGhTdGFydEluZGV4ID0gaGVpZ2h0U3RyaW5nLnNlYXJjaChcIj1cIikrIDJcblx0aEVuZEluZGV4ID0gaGVpZ2h0U3RyaW5nLnNlYXJjaChcInB4XCIpXG5cdGhlaWdodCA9IGhlaWdodFN0cmluZy5zbGljZShoU3RhcnRJbmRleCwgaEVuZEluZGV4KVxuXHRuZXdIZWlnaHQgPSBleHBvcnRzLnB4KGhlaWdodClcblxuXHQjQ3JlYXRlIG5ldyBzdHJpbmdcblx0bmV3U3RyaW5nID0gc3RyaW5nLnJlcGxhY2Uod2lkdGgsIG5ld1dpZHRoKVxuXHRuZXdTdHJpbmcgPSBuZXdTdHJpbmcucmVwbGFjZShoZWlnaHQsIG5ld0hlaWdodClcblxuXHQjUmVwbGFjZSBzdHJpbmdzXG5cdHN2ZyA9IHN2Zy5yZXBsYWNlKHN0cmluZywgbmV3U3RyaW5nKVxuXG5cdHJldHVybiB7XG5cdFx0c3ZnOnN2Z1xuXHRcdHdpZHRoOm5ld1dpZHRoXG5cdFx0aGVpZ2h0Om5ld0hlaWdodFxuXHR9XG5cbiMgQ2hhbmdlcyB0aGUgZmlsbCBvZiBhbiBTVkdcbmV4cG9ydHMuY2hhbmdlRmlsbCA9IChsYXllciwgY29sb3IpIC0+XG5cdHN0YXJ0SW5kZXggPSBsYXllci5odG1sLnNlYXJjaChcImZpbGw9XFxcIiNcIilcblx0ZmlsbFN0cmluZyA9IGxheWVyLmh0bWwuc2xpY2Uoc3RhcnRJbmRleCwgbGF5ZXIuaHRtbC5sZW5ndGgpXG5cdGVuZEluZGV4ID0gZmlsbFN0cmluZy5zZWFyY2goXCJcXFwiPlwiKVxuXHRzdHJpbmcgPSBmaWxsU3RyaW5nLnNsaWNlKDAsIGVuZEluZGV4KVxuXHRuZXdTdHJpbmcgPSBcImZpbGw9XFxcIlwiICsgZXhwb3J0cy5jb2xvcihjb2xvcilcblx0bGF5ZXIuaHRtbCA9IGxheWVyLmh0bWwucmVwbGFjZShzdHJpbmcsIG5ld1N0cmluZylcblxuZXhwb3J0cy5jYXBpdGFsaXplID0gKHN0cmluZykgLT5cblx0cmV0dXJuIHN0cmluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0cmluZy5zbGljZSgxKVxuXG4jIFJldHVybnMgdGhlIGN1cnJlbnQgdGltZVxuZXhwb3J0cy5nZXRUaW1lID0gLT5cblx0ZGF5c09mVGhlV2VlayA9IFtcIlN1bmRheVwiLCBcIk1vbmRheVwiLCBcIlR1ZXNkYXlcIiwgXCJXZWRuZXNkYXlcIiwgXCJUaHVyc2RheVwiLCBcIkZyaWRheVwiLCBcIlNhdHVyZGF5XCJdXG5cdG1vbnRoc09mVGhlWWVhciA9IFtcIkphbnVhcnlcIiwgXCJGZWJydWFyeVwiLCBcIk1hcmNoXCIsIFwiQXByaWxcIiwgXCJNYXlcIiwgXCJKdW5lXCIsIFwiSnVseVwiLCBcIkF1Z3VzdFwiLCBcIlNlcHRlbWJlclwiLCBcIk9jdG9iZXJcIiwgXCJOb3ZlbWJlclwiLCBcIkRlY2VtYmVyXCJdXG5cdGRhdGVPYmogPSBuZXcgRGF0ZSgpXG5cdG1vbnRoID0gbW9udGhzT2ZUaGVZZWFyW2RhdGVPYmouZ2V0TW9udGgoKV1cblx0ZGF0ZSA9IGRhdGVPYmouZ2V0RGF0ZSgpXG5cdGRheSA9IGRheXNPZlRoZVdlZWtbZGF0ZU9iai5nZXREYXkoKV1cblx0aG91cnMgPSBkYXRlT2JqLmdldEhvdXJzKClcblx0bWlucyA9IGRhdGVPYmouZ2V0TWludXRlcygpXG5cdHNlY3MgPSBkYXRlT2JqLmdldFNlY29uZHMoKVxuXHRyZXR1cm4ge1xuXHRcdG1vbnRoOm1vbnRoXG5cdFx0ZGF0ZTpkYXRlXG5cdFx0ZGF5OmRheVxuXHRcdGhvdXJzOmhvdXJzXG5cdFx0bWluczptaW5zXG5cdFx0c2VjczpzZWNzXG5cdH1cblxuZXhwb3J0cy5iZ0JsdXIgPSAobGF5ZXIpIC0+XG5cdGxheWVyLnN0eWxlW1wiLXdlYmtpdC1iYWNrZHJvcC1maWx0ZXJcIl0gPSBcImJsdXIoI3tleHBvcnRzLnB4KDUpfXB4KVwiXG5cdHJldHVybiBsYXllclxuXG5leHBvcnRzLnRleHRBdXRvU2l6ZSA9ICh0ZXh0TGF5ZXIpIC0+XG5cdCNEZWZpbmUgV2lkdGhcblx0Y29uc3RyYWludHMgPSB7fVxuXHRpZiB0ZXh0TGF5ZXIuY29uc3RyYWludHNcblx0XHRpZiB0ZXh0TGF5ZXIuY29uc3RyYWludHMuaGVpZ2h0XG5cdFx0XHRjb25zdHJhaW50cy5oZWlnaHQgPSBleHBvcnRzLnB4KHRleHRMYXllci5jb25zdHJhaW50cy5oZWlnaHQpXG5cdFx0aWYgdGV4dExheWVyLmNvbnN0cmFpbnRzLndpZHRoXG5cdFx0XHRjb25zdHJhaW50cy53aWR0aCA9IGV4cG9ydHMucHgodGV4dExheWVyLmNvbnN0cmFpbnRzLndpZHRoKVxuXG5cdHN0eWxlcyA9XG5cdFx0Zm9udFNpemU6IHRleHRMYXllci5zdHlsZS5mb250U2l6ZVxuXHRcdGZvbnRGYW1pbHk6IHRleHRMYXllci5zdHlsZS5mb250RmFtaWx5XG5cdFx0Zm9udFdlaWdodDogdGV4dExheWVyLnN0eWxlLmZvbnRXZWlnaHRcblx0XHRsaW5lSGVpZ2h0OiB0ZXh0TGF5ZXIuc3R5bGUubGluZUhlaWdodFxuXHRcdGxldHRlclNwYWNpbmc6IHRleHRMYXllci5zdHlsZS5sZXR0ZXJTcGFjaW5nXG5cdFx0dGV4dFRyYW5zZm9ybTogdGV4dExheWVyLnN0eWxlLnRleHRUcmFuc2Zvcm1cblx0dGV4dEZyYW1lID0gVXRpbHMudGV4dFNpemUodGV4dExheWVyLmh0bWwsIHN0eWxlcywgY29uc3RyYWludHMpXG5cdHJldHVybiB7XG5cdFx0d2lkdGggOiB0ZXh0RnJhbWUud2lkdGhcblx0XHRoZWlnaHQ6IHRleHRGcmFtZS5oZWlnaHRcblx0fVxuXG4jIGV4cG9ydHMuZ2V0RGV2aWNlID0gLT5cbiNcbiMgXHQjIExvYWRzIHRoZSBpbml0aWFsIGZyYW1lXG4jIFx0ZGV2aWNlID0gRnJhbWVyLkRldmljZS5kZXZpY2VUeXBlXG4jXG4jIFx0IyMjIFRoaXMgc3dpdGNoIGxvb2tzIGF0IHRoZSBpbm5lcldpZHRoIHRvIGRldGVybWluZSBpZiB0aGUgcHJvdG90eXBlIGlzIGJlaW5nIG9wZW5lZCBvbiBhIGRldmljZS5cbiMgXHRJZiBzbywgaXQnbGwgb3ZlcnJpZGUgdGhlIGRldmljZSwgYW5kIGl0J2xsIGFkanVzdCB0aGUgdmlldyB0byBmdWxsc2NyZWVuLiMjI1xuIyBcdGNhcHR1cmVkRGV2aWNlID0ge1xuIyBcdFx0d2lkdGg6aW9zLmxpYi5mcmFtZXNbZGV2aWNlXS53aWR0aFxuIyBcdFx0aGVpZ2h0Omlvcy5saWIuZnJhbWVzW2RldmljZV0uaGVpZ2h0XG4jIFx0XHRzY2FsZTppb3MubGliLmZyYW1lc1tkZXZpY2VdLnNjYWxlXG4jIFx0XHRtb2JpbGU6aW9zLmxpYi5mcmFtZXNbZGV2aWNlXS5tb2JpbGVcbiMgXHRcdHBsYXRmb3JtOmlvcy5saWIuZnJhbWVzW2RldmljZV0ucGxhdGZvcm1cbiMgXHR9XG4jXG4jIFx0c3dpdGNoIGlubmVyV2lkdGhcbiMgXHRcdCMgaVBob25lIDVjLzVzL1NFXG4jIFx0XHR3aGVuIDY0MFxuIyBcdFx0XHRkZXZpY2UgPSBcImFwcGxlLWlwaG9uZS01cy1zaWx2ZXJcIlxuIyBcdFx0XHRGcmFtZXIuRGV2aWNlLmRldmljZVR5cGUgPSBcImZ1bGxzY3JlZW5cIlxuI1xuIyBcdFx0IyBpUGhvbmUgNnNcbiMgXHRcdHdoZW4gNzUwXG4jIFx0XHRcdGRldmljZSA9IFwiYXBwbGUtaXBob25lLTZzLXNpbHZlclwiXG4jIFx0XHRcdEZyYW1lci5EZXZpY2UuZGV2aWNlVHlwZSA9IFwiZnVsbHNjcmVlblwiXG4jXG4jIFx0XHQjIGlQaG9uZSA2cytcbiMgXHRcdHdoZW4gMTI0MlxuIyBcdFx0XHRpZiBpbm5lckhlaWdodCA9PSAyMjA4XG4jIFx0XHRcdFx0ZGV2aWNlID0gXCJhcHBsZS1pcGhvbmUtNnMtcGx1cy1zaWx2ZXJcIlxuIyBcdFx0XHRcdEZyYW1lci5EZXZpY2UuZGV2aWNlVHlwZSA9IFwiZnVsbHNjcmVlblwiXG4jIFx0XHRcdFx0cHJpbnQgXCJ5b1wiXG4jXG4jIFx0XHQjIGlQYWQgaW4gcG9ydHJhaXRcbiMgXHRcdHdoZW4gMTUzNlxuIyBcdFx0XHRpZiBpbm5lckhlaWdodCA9PSAyMDQ4XG4jIFx0XHRcdFx0ZGV2aWNlID0gXCJhcHBsZS1pcGFkLWFpci0yLXNpbHZlclwiXG4jIFx0XHRcdFx0RnJhbWVyLkRldmljZS5kZXZpY2VUeXBlID0gXCJmdWxsc2NyZWVuXCJcbiNcbiMgXHRcdCMgaVBhZFxuIyBcdFx0d2hlbiAyMDQ4XG4jXG4jIFx0XHRcdCMgaVBhZCBQcm8gaW4gcG9ydHJhaXRcbiMgXHRcdFx0aWYgaW5uZXJIZWlnaHQgPT0gMjczMlxuIyBcdFx0XHRcdGRldmljZSA9IFwiYXBwbGUtaXBhZC1wcm8tc2lsdmVyXCJcbiNcbiMgXHRcdFx0IyBpUGFkIGluIGxhbmRzY2NhcGVcbiMgXHRcdFx0aWYgaW5uZXJIZWlnaHQgPT0gMTUzNlxuIyBcdFx0XHRcdGRldmljZSA9IFwiYXBwbGUtaXBhZC1haXItMi1zaWx2ZXJcIlxuIyBcdFx0XHRGcmFtZXIuRGV2aWNlLmRldmljZVR5cGUgPSBcImZ1bGxzY3JlZW5cIlxuI1xuIyBcdFx0IyBpUGFkIFByb1xuIyBcdFx0d2hlbiAyNzMyXG4jIFx0XHRcdGlmIGlubmVySGVpZ2h0ID09IDIwNDhcbiMgXHRcdFx0XHRkZXZpY2UgPSBcImFwcGxlLWlwYWQtcHJvLXNpbHZlclwiXG4jIFx0XHRcdFx0RnJhbWVyLkRldmljZS5kZXZpY2VUeXBlID0gXCJmdWxsc2NyZWVuXCJcbmV4cG9ydHMuZ2V0RGV2aWNlID0gLT5cblx0IyBMb2FkcyB0aGUgaW5pdGlhbCBmcmFtZVxuXHRuYW1lRm9ybWF0dGVyID0gKG5hbWUpIC0+XG5cdFx0cmVtb3ZlVGVybXMgPSBbXCJhcHBsZS1cIiwgXCItZ29sZFwiLCBcIi1zaWx2ZXJcIiwgXCItcm9zZVwiLCBcIi1zcGFjZS1ncmF5XCIsIFwiLXllbGxvd1wiLCBcIi1ncmVlblwiLCBcIi1yZWRcIiwgXCItd2hpdGVcIiwgXCItYmx1ZVwiLCBcIi1taW5pXCIsIFwiLWFpclwiLCBcIi0yXCIsIFwiLTRcIl1cblx0XHRmb3IgdGVybSBpbiByZW1vdmVUZXJtc1xuXHRcdFx0bmFtZSA9IG5hbWUucmVwbGFjZSh0ZXJtLCBcIlwiKVxuXHRcdGlmIG5hbWUuaW5kZXhPZihcIi01c1wiKSAhPSAtMSB0aGVuIG5hbWUgPSBuYW1lLnJlcGxhY2UoXCItNXNcIiwgXCItNVwiKVxuXHRcdGlmIG5hbWUuaW5kZXhPZihcIi01Y1wiKSAhPSAtMSB0aGVuIG5hbWUgPSBuYW1lLnJlcGxhY2UoXCItNWNcIiwgXCItNVwiKVxuXHRcdHJldHVybiBuYW1lXG5cdGRldmljZSA9IFwiXCJcblx0ZnJhbWUgPSB0cnVlXG5cdGlmIGlvcy5saWIucmVhbERldmljZXNbaW5uZXJXaWR0aF0gJiYgaW9zLmxpYi5yZWFsRGV2aWNlc1tpbm5lcldpZHRoXVtpbm5lckhlaWdodF1cblx0XHRkZXZpY2UgPSBpb3MubGliLnJlYWxEZXZpY2VzW2lubmVyV2lkdGhdW2lubmVySGVpZ2h0XVxuXHRcdGZyYW1lID0gZmFsc2Vcblx0XHRGcmFtZXIuRGV2aWNlLmRldmljZVR5cGUgPSBcImZ1bGxzY3JlZW5cIlxuXG5cdGlmIGZyYW1lXG5cdFx0ZGV2aWNlID1cblx0XHRcdG5hbWU6IG5hbWVGb3JtYXR0ZXIoRnJhbWVyLkRldmljZS5kZXZpY2VUeXBlKVxuXHRcdFx0ZGlzcGxheV9uYW1lIDogIEZyYW1lci5EZXZpY2VWaWV3LkRldmljZXNbRnJhbWVyLkRldmljZS5kZXZpY2VUeXBlXS5kaXNwbGF5X25hbWVcblx0XHRcdHdpZHRoIDogIEZyYW1lci5EZXZpY2VWaWV3LkRldmljZXNbRnJhbWVyLkRldmljZS5kZXZpY2VUeXBlXS5zY3JlZW5XaWR0aFxuXHRcdFx0aGVpZ2h0OiAgRnJhbWVyLkRldmljZVZpZXcuRGV2aWNlc1tGcmFtZXIuRGV2aWNlLmRldmljZVR5cGVdLnNjcmVlbkhlaWdodFxuXHRcdFx0c2NhbGU6IGlvcy5saWIuZnJhbWVyRnJhbWVzW0ZyYW1lci5EZXZpY2VWaWV3LkRldmljZXNbRnJhbWVyLkRldmljZS5kZXZpY2VUeXBlXS5zY3JlZW5XaWR0aF1cblxuXHRpZiBkZXZpY2Uuc2NhbGUgPT0gdW5kZWZpbmVkXG5cdFx0ZGV2aWNlLnNjYWxlID0gMlxuXHRpZiBkZXZpY2Uud2lkdGggPT0gdW5kZWZpbmVkXG5cdFx0ZGV2aWNlLndpZHRoID0gaW5uZXJXaWR0aFxuXHRpZiBkZXZpY2UuaGVpZ2h0ID09IHVuZGVmaW5lZFxuXHRcdGRldmljZS5oZWlnaHQgPSBpbm5lckhlaWdodFxuXG5cdHJldHVybiBkZXZpY2VcblxuXHRleHBvcnRzLnNjYWxlID0gaW9zLmxpYi5mcmFtZXNbZGV2aWNlXS5zY2FsZVxuXG5cdGlmIGRldmljZSA9PSBcImZ1bGxzY3JlZW5cIlxuXHRcdGV4cG9ydHMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuXHRcdGV4cG9ydHMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG5cdGVsc2Vcblx0XHRleHBvcnRzLndpZHRoID0gaW9zLmxpYi5mcmFtZXNbZGV2aWNlXS53aWR0aFxuXHRcdGV4cG9ydHMuaGVpZ2h0ID0gaW9zLmxpYi5mcmFtZXNbZGV2aWNlXS5oZWlnaHRcblx0XHRpZiB3aW5kb3cuaW5uZXJXaWR0aCA9PSAxMjQyIHx8IHdpbmRvdy5pbm5lcldpZHRoID09IDIyMDhcblx0XHRcdGV4cG9ydHMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuXHRcdFx0ZXhwb3J0cy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcblx0XHRcdGV4cG9ydHMuc2NhbGUgPSAzXG5cdGV4cG9ydHMubW9iaWxlID0gaW9zLmxpYi5mcmFtZXNbZGV2aWNlXS5tb2JpbGVcblx0ZXhwb3J0cy5wbGF0Zm9ybSA9IGlvcy5saWIuZnJhbWVzW2RldmljZV0ucGxhdGZvcm1cblx0ZXhwb3J0cy5vcmllbnRhdGlvbiA9ICBGcmFtZXIuRGV2aWNlLm9yaWVudGF0aW9uXG5cblx0IyBEZXZpY2UgU3RyaW5nIFNjcnViYmVyXG5cdGRldmljZSA9IGRldmljZS5yZXBsYWNlKFwiYXBwbGUtXCIsIFwiXCIpXG5cdGRldmljZSA9IGRldmljZS5yZXBsYWNlKFwiLWdvbGRcIiwgXCJcIilcblx0ZGV2aWNlID0gZGV2aWNlLnJlcGxhY2UoXCItZ3JlZW5cIiwgXCJcIilcblx0ZGV2aWNlID0gZGV2aWNlLnJlcGxhY2UoXCItYmx1ZVwiLCBcIlwiKVxuXHRkZXZpY2UgPSBkZXZpY2UucmVwbGFjZShcIi1yZWRcIiwgXCJcIilcblx0ZGV2aWNlID0gZGV2aWNlLnJlcGxhY2UoXCItd2hpdGVcIiwgXCJcIilcblx0ZGV2aWNlID0gZGV2aWNlLnJlcGxhY2UoXCIteWVsbG93XCIsIFwiXCIpXG5cdGRldmljZSA9IGRldmljZS5yZXBsYWNlKFwiLXBpbmtcIiwgXCJcIilcblx0ZGV2aWNlID0gZGV2aWNlLnJlcGxhY2UoXCItc3BhY2UtZ3JleVwiLCBcIlwiKVxuXHRkZXZpY2UgPSBkZXZpY2UucmVwbGFjZShcIi1yb3NlXCIsIFwiXCIpXG5cdGRldmljZSA9IGRldmljZS5yZXBsYWNlKFwiNXNcIiwgXCI1XCIpXG5cdGRldmljZSA9IGRldmljZS5yZXBsYWNlKFwiNWNcIiwgXCI1XCIpXG5cdGRldmljZSA9IGRldmljZS5yZXBsYWNlKFwiLW1pbmlcIiwgXCJcIilcblx0ZGV2aWNlID0gZGV2aWNlLnJlcGxhY2UoXCItYWlyXCIsIFwiXCIpXG5cdGRldmljZSA9IGRldmljZS5yZXBsYWNlKFwiLTJcIiwgXCJcIilcblx0ZGV2aWNlID0gZGV2aWNlLnJlcGxhY2UoXCItNFwiLCBcIlwiKVxuXHRkZXZpY2UgPSBkZXZpY2UucmVwbGFjZShcIi1zaWx2ZXJcIiwgXCJcIilcblxuXHRjYXB0dXJlZERldmljZS5uYW1lID0gZGV2aWNlXG5cblx0IyBleHBvcnRzLmRldmljZSBiZWNvbWVzIGVpdGhlciBpcGFkLCBpcGFkLXBybywgaXBob25lLTUsIGlwaG9uZS02cywgaXBob25lLTZzLXBsdXNcblx0cmV0dXJuIGNhcHR1cmVkRGV2aWNlXG5cblxuIyBTcGVjaWFsIENoYXJhY3RlcnNcbmV4cG9ydHMuc3BlY2lhbENoYXIgPSAobGF5ZXIpIC0+XG5cdHRleHQgPSBsYXllclxuXHRpZiBsYXllci50eXBlID09IFwiYnV0dG9uXCIgdGhlbiB0ZXh0ID0gbGF5ZXIubGFiZWxcblx0aWYgdGV4dC5odG1sLmluZGV4T2YoXCItYlwiKSAhPSAtMVxuXHRcdG5ld1RleHQgPSB0ZXh0Lmh0bWwucmVwbGFjZShcIi1iIFwiLCBcIlwiKVxuXHRcdGV4cG9ydHMudXBkYXRlKHRleHQsIFt7dGV4dDpuZXdUZXh0fSwge2ZvbnRXZWlnaHQ6NjAwfV0pXG5cdGlmIHRleHQuaHRtbC5pbmRleE9mKFwiLXJcIikgIT0gLTFcblx0XHRuZXdUZXh0ID0gdGV4dC5odG1sLnJlcGxhY2UoXCItciBcIiwgXCJcIilcblx0XHRleHBvcnRzLnVwZGF0ZSh0ZXh0LCBbe3RleHQ6bmV3VGV4dH0sIHtjb2xvcjpcInJlZFwifV0pXG5cdGlmIHRleHQuaHRtbC5pbmRleE9mKFwiLXJiXCIpICE9IC0xXG5cdFx0bmV3VGV4dCA9IHRleHQuaHRtbC5yZXBsYWNlKFwiLXJiIFwiLCBcIlwiKVxuXHRcdGV4cG9ydHMudXBkYXRlKHRleHQsIFt7dGV4dDpuZXdUZXh0fSwge2NvbG9yOlwiYmx1ZVwifV0pXG5cdGlmIHRleHQuaHRtbC5pbmRleE9mKFwiLWxiXCIpICE9IC0xXG5cdFx0bmV3VGV4dCA9IHRleHQuaHRtbC5yZXBsYWNlKFwiLWxiIFwiLCBcIlwiKVxuXHRcdGV4cG9ydHMudXBkYXRlKHRleHQsIFt7dGV4dDpuZXdUZXh0fSwge2NvbG9yOlwibGlnaHQtYmx1ZVwifV0pXG5cdGlmIHRleHQuaHRtbC5pbmRleE9mKFwiLWdcIikgIT0gLTFcblx0XHRuZXdUZXh0ID0gdGV4dC5odG1sLnJlcGxhY2UoXCItZyBcIiwgXCJcIilcblx0XHRleHBvcnRzLnVwZGF0ZSh0ZXh0LCBbe3RleHQ6bmV3VGV4dH0sIHtjb2xvcjpcImdyZWVuXCJ9XSlcblx0aWYgdGV4dC5odG1sLmluZGV4T2YoXCItb1wiKSAhPSAtMVxuXHRcdG5ld1RleHQgPSB0ZXh0Lmh0bWwucmVwbGFjZShcIi1vIFwiLCBcIlwiKVxuXHRcdGV4cG9ydHMudXBkYXRlKHRleHQsIFt7dGV4dDpuZXdUZXh0fSwge2NvbG9yOlwib3JhbmdlXCJ9XSlcblx0aWYgdGV4dC5odG1sLmluZGV4T2YoXCItcFwiKSAhPSAtMVxuXHRcdG5ld1RleHQgPSB0ZXh0Lmh0bWwucmVwbGFjZShcIi1wIFwiLCBcIlwiKVxuXHRcdGV4cG9ydHMudXBkYXRlKHRleHQsIFt7dGV4dDpuZXdUZXh0fSwge2NvbG9yOlwib3JhbmdlXCJ9XSlcblx0aWYgdGV4dC5odG1sLmluZGV4T2YoXCIteVwiKSAhPSAtMVxuXHRcdG5ld1RleHQgPSB0ZXh0Lmh0bWwucmVwbGFjZShcIi15IFwiLCBcIlwiKVxuXHRcdGV4cG9ydHMudXBkYXRlKHRleHQsIFt7dGV4dDpuZXdUZXh0fSwge2NvbG9yOlwieWVsbG93XCJ9XSlcblx0aWYgdGV4dC5odG1sLmluZGV4T2YoXCItI1wiKSAhPSAtMVxuXHRcdGNob3NlbkNvbG9yID0gdGV4dC5odG1sLnNsaWNlKDEsIDgpXG5cdFx0bmV3VGV4dCA9IHRleHQuaHRtbC5zbGljZSg5LCB0ZXh0Lmh0bWwubGVuZ3RoKVxuXHRcdGV4cG9ydHMudXBkYXRlKHRleHQsIFt7dGV4dDpuZXdUZXh0fSwge2NvbG9yOmNob3NlbkNvbG9yfV0pXG5cdGlmIHRleHQuaHRtbC5pbmRleE9mKFwiLVwiKSAhPSAtMVxuXHRcdG5ld1RleHQgPSB0ZXh0Lmh0bWwucmVwbGFjZShcIi0gXCIsIFwiXCIpXG5cdFx0ZXhwb3J0cy51cGRhdGUodGV4dCwgW3t0ZXh0Om5ld1RleHR9XSlcblx0aWYgbGF5ZXIuYnV0dG9uVHlwZSA9PSBcInRleHRcIlxuXHRcdGxheWVyLndpZHRoID0gdGV4dC53aWR0aFxuXHRpb3MubGF5b3V0LnNldChsYXllcilcblx0aWYgbGF5ZXIudHlwZSA9PSBcImJ1dHRvblwiIHRoZW4gbGF5ZXIud2lkdGggPSB0ZXh0LndpZHRoXG5cdHJldHVybiB0ZXh0LmNvbG9yXG5cbmV4cG9ydHMudXBkYXRlID0gKGxheWVyLCBhcnJheSkgLT5cblx0aWYgYXJyYXkgPT0gdW5kZWZpbmVkXG5cdFx0YXJyYXkgPSBbXVxuXHRpZiBsYXllci50eXBlID09IFwidGV4dFwiXG5cdFx0Zm9yIGNoYW5nZSBpbiBhcnJheVxuXHRcdFx0a2V5ID0gT2JqZWN0LmtleXMoY2hhbmdlKVswXVxuXHRcdFx0dmFsdWUgPSBjaGFuZ2Vba2V5XVxuXHRcdFx0aWYga2V5ID09IFwidGV4dFwiXG5cdFx0XHRcdGxheWVyLmh0bWwgPSB2YWx1ZVxuXHRcdFx0aWYga2V5ID09IFwiZm9udFdlaWdodFwiXG5cdFx0XHRcdGxheWVyLnN0eWxlW2tleV0gPSB2YWx1ZVxuXHRcdFx0aWYga2V5ID09IFwiY29sb3JcIlxuXHRcdFx0XHRsYXllci5jb2xvciA9IGV4cG9ydHMuY29sb3IodmFsdWUpXG5cblx0XHR0ZXh0RnJhbWUgPSBleHBvcnRzLnRleHRBdXRvU2l6ZShsYXllcilcblx0XHRsYXllci53aWR0aCA9IHRleHRGcmFtZS53aWR0aFxuXHRcdGxheWVyLmhlaWdodCA9IHRleHRGcmFtZS5oZWlnaHRcblxuXG5cdGlvcy5sYXlvdXQuc2V0KClcblxuIyBEZWNpZGVzIGlmIGl0IHNob3VsZCBiZSB3aGl0ZS9ibGFjayB0ZXh0XG5leHBvcnRzLmF1dG9Db2xvciA9IChjb2xvck9iamVjdCkgLT5cblx0cmdiID0gY29sb3JPYmplY3QudG9SZ2JTdHJpbmcoKVxuXHRyZ2IgPSByZ2Iuc3Vic3RyaW5nKDQsIHJnYi5sZW5ndGgtMSlcblx0cmdiID0gcmdiLnJlcGxhY2UoLyAvZywgJycpXG5cdHJnYiA9IHJnYi5yZXBsYWNlKC8gL2csICcnKVxuXHRyZ2IgPSByZ2Iuc3BsaXQoJywnKVxuXHRyZWQgPSByZ2JbMF1cblx0Z3JlZW4gPSByZ2JbMV1cblx0Ymx1ZSA9IHJnYlsyXVxuXHRjb2xvciA9IFwiXCJcblx0aWYgKHJlZCowLjI5OSArIGdyZWVuKjAuNTg3ICsgYmx1ZSowLjExNCkgPiAxODZcblx0XHRjb2xvciA9IFwiIzAwMFwiXG5cdGVsc2Vcblx0XHRjb2xvciA9IFwiI0ZGRlwiXG5cdHJldHVybiBjb2xvclxuXG5leHBvcnRzLnNhbWVQYXJlbnQgPSAobGF5ZXIxLCBsYXllcjIpIC0+XG5cdHBhcmVudE9uZSA9IGxheWVyMS5zdXBlckxheWVyXG5cdHBhcmVudFR3byA9IGxheWVyMi5zdXBlckxheWVyXG5cdGlmIHBhcmVudE9uZSA9PSBwYXJlbnRUd29cblx0XHRyZXR1cm4gdHJ1ZVxuXHRlbHNlXG5cdFx0cmV0dXJuIGZhbHNlXG5cblxuZXhwb3J0cy50aW1lRGVsZWdhdGUgPSAobGF5ZXIsIGNsb2NrVHlwZSkgLT5cblx0QHRpbWUgPSBleHBvcnRzLmdldFRpbWUoKVxuXHRVdGlscy5kZWxheSA2MCAtIEB0aW1lLnNlY3MsIC0+XG5cdFx0QHRpbWUgPSBleHBvcnRzLmdldFRpbWUoKVxuXHRcdGV4cG9ydHMudXBkYXRlKGxheWVyLCBbdGV4dDpleHBvcnRzLnRpbWVGb3JtYXR0ZXIoQHRpbWUsIGNsb2NrVHlwZSldKVxuXHRcdFV0aWxzLmludGVydmFsIDYwLCAtPlxuXHRcdFx0QHRpbWUgPSBleHBvcnRzLmdldFRpbWUoKVxuXHRcdFx0ZXhwb3J0cy51cGRhdGUobGF5ZXIsIFt0ZXh0OmV4cG9ydHMudGltZUZvcm1hdHRlcihAdGltZSwgY2xvY2tUeXBlKV0pXG5cbmV4cG9ydHMudGltZUZvcm1hdHRlciA9ICh0aW1lT2JqLCBjbG9ja1R5cGUpIC0+XG5cdGlmIGNsb2NrVHlwZSA9PSBmYWxzZVxuXHRcdGlmIHRpbWVPYmouaG91cnMgPiAxMlxuXHRcdFx0dGltZU9iai5ob3VycyA9IHRpbWVPYmouaG91cnMgLSAxMlxuXHRcdGlmIHRpbWVPYmouaG91cnMgPT0gMCB0aGVuIHRpbWVPYmouaG91cnMgPSAxMlxuXHRpZiB0aW1lT2JqLm1pbnMgPCAxMFxuXHRcdHRpbWVPYmoubWlucyA9IFwiMFwiICsgdGltZU9iai5taW5zXG5cdHJldHVybiB0aW1lT2JqLmhvdXJzICsgXCI6XCIgKyB0aW1lT2JqLm1pbnNcblxuZXhwb3J0cy5zZXR1cENvbXBvbmVudCA9IChhcnJheSwgZGVmYXVsdHMpIC0+XG5cdGlmIGFycmF5ID09IHVuZGVmaW5lZFxuXHRcdGFycmF5ID0gW11cblx0b2JqID0ge31cblx0Zm9yIGkgaW4gZGVmYXVsdHMucHJvcHNcblx0XHRpZiBhcnJheVtpXSAhPSB1bmRlZmluZWRcblx0XHRcdG9ialtpXSA9IGFycmF5W2ldXG5cdFx0ZWxzZVxuXHRcdFx0b2JqW2ldID0gZGVmYXVsdHNbaV1cblx0cmV0dXJuIG9ialxuXG5cbmV4cG9ydHMuZW1vamlGb3JtYXR0ZXIgPSAoc3RyaW5nKSAtPlxuXHRcdHVuaWNvZGVGb3JtYXQgPSBcIlwiXG5cdFx0aWYgc3RyaW5nWzBdID09IFwiRVwiIHx8IHN0cmluZ1swXSA9PSBcIjNcIiB8fCBzdHJpbmdbMF0gPT0gXCIyXCIgfHwgc3RyaW5nWzBdID09IFwiQ1wiXG5cdFx0XHRhcnJheU9mQ29kZXMgPSBzdHJpbmcuc3BsaXQoXCIgXCIpXG5cdFx0XHRmb3IgY29kZSBpbiBhcnJheU9mQ29kZXNcblx0XHRcdFx0dW5pY29kZUZvcm1hdCA9IHVuaWNvZGVGb3JtYXQgKyBcIiVcIiArIGNvZGVcblx0XHRlbHNlXG5cdFx0XHRhcnJheU9mQ29kZXMgPSBzdHJpbmcuc3BsaXQoXCIgXCIpXG5cdFx0XHR1bmljb2RlRm9ybWF0ID0gXCIlRjAlOUZcIlxuXHRcdFx0Zm9yIGNvZGUgaW4gYXJyYXlPZkNvZGVzXG5cdFx0XHRcdHVuaWNvZGVGb3JtYXQgPSB1bmljb2RlRm9ybWF0ICsgXCIlXCIgKyBjb2RlXG5cdFx0ZGVjb2RlZCA9IGRlY29kZVVSSUNvbXBvbmVudCh1bmljb2RlRm9ybWF0KVxuXHRcdHJldHVybiBkZWNvZGVkXG5cbmV4cG9ydHMuYnVpbGRFbW9qaXNPYmplY3QgPSAoKSAtPlxuXHRlbW9qaXMgPSBbXVxuXHRmb3IgY29kZSwgaW5kZXggaW4gaW9zLmFzc2V0cy5lbW9qaUNvZGVzXG5cdFx0ZW1vamkgPSBleHBvcnRzLmVtb2ppRm9ybWF0dGVyKGNvZGUpXG5cdFx0ZW1vamlzLnB1c2ggZW1vamlcblxuZXhwb3J0cy53cml0ZSA9IChvYmosIHRleHQpIC0+XG5cdGlmIG9iai50eXBlID09ICdmaWVsZCdcblx0XHRvYmoudGV4dC5odG1sID0gb2JqLnRleHQuaHRtbCArIHRleHRcblx0ZWxzZVxuXHRcdG9iai5odG1sID0gb2JqLmh0bWwgKyB0ZXh0XG4iLCJpb3MgPSByZXF1aXJlICdpb3Mta2l0J1xuXG5cbmV4cG9ydHMuZGVmYXVsdHMgPVxuXHRlZGl0YWJsZTp0cnVlXG5cdGNvbnN0cmFpbnRzOnVuZGVmaW5lZFxuXHR0ZXh0OiBcImlPUyBUZXh0IExheWVyXCJcblx0dHlwZTpcInRleHRcIlxuXHR4OjBcblx0eTowXG5cdHdpZHRoOi0xXG5cdGhlaWdodDotMVxuXHRzdXBlckxheWVyOnVuZGVmaW5lZFxuXHRzdHlsZTpcImRlZmF1bHRcIlxuXHRsaW5lczoxXG5cdHRleHRBbGlnbjpcImxlZnRcIlxuXHRiYWNrZ3JvdW5kQ29sb3I6XCJ0cmFuc3BhcmVudFwiXG5cdGNvbG9yOlwiYmxhY2tcIlxuXHRmb250U2l6ZTogMTdcblx0Zm9udEZhbWlseTpcIi1hcHBsZS1zeXN0ZW0sIEhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWZcIlxuXHRmb250V2VpZ2h0OlwicmVndWxhclwiXG5cdGxpbmVIZWlnaHQ6XCJhdXRvXCJcblx0bmFtZTpcInRleHQgbGF5ZXJcIlxuXHRvcGFjaXR5OjFcblx0dGV4dFRyYW5zZm9ybTpcIm5vbmVcIlxuXHRsZXR0ZXJTcGFjaW5nOjBcblx0bmFtZTpcInRleHQgbGF5ZXJcIlxuXHRzZWxlY3RhYmxlOnRydWVcblx0c2VsZWN0Q29sb3I6XCJyZ2JhKDAsIDExOCwgMjU1LCAuMilcIlxuXHRzZWxlY3RDb250cm9sczpcIiMwMDc2RkZcIlxuXG5leHBvcnRzLmRlZmF1bHRzLnByb3BzID0gT2JqZWN0LmtleXMoZXhwb3J0cy5kZWZhdWx0cylcblxuXG5leHBvcnRzLmNyZWF0ZSA9IChhcnJheSkgLT5cblx0c2V0dXAgPSBpb3MudXRpbHMuc2V0dXBDb21wb25lbnQoYXJyYXksIGV4cG9ydHMuZGVmYXVsdHMpXG5cdGV4Y2VwdGlvbnMgPSBPYmplY3Qua2V5cyhzZXR1cClcblxuXHR0ZXh0TGF5ZXIgPSBuZXcgaW9zLlZpZXdcblx0XHRiYWNrZ3JvdW5kQ29sb3I6XCJ0cmFuc3BhcmVudFwiXG5cdFx0bmFtZTpzZXR1cC5uYW1lXG5cdFx0c3VwZXJMYXllcjpzZXR1cC5zdXBlckxheWVyXG5cdFx0Y29uc3RyYWludHM6c2V0dXAuY29uc3RyYWludHNcblxuXHR0ZXh0TGF5ZXIudHlwZSA9IFwidGV4dFwiXG5cdHRleHRMYXllci5odG1sID0gc2V0dXAudGV4dFxuXHRmb3IgcHJvcCBpbiBpb3MubGliLmxheWVyUHJvcHNcblx0XHRpZiBzZXR1cFtwcm9wXVxuXHRcdFx0aWYgcHJvcCA9PSBcImNvbG9yXCJcblx0XHRcdFx0c2V0dXBbcHJvcF0gPSBpb3MudXRpbHMuY29sb3Ioc2V0dXBbcHJvcF0pXG5cdFx0XHR0ZXh0TGF5ZXJbcHJvcF0gPSBzZXR1cFtwcm9wXVxuXHRmb3IgcHJvcCBpbiBpb3MubGliLmxheWVyU3R5bGVzXG5cdFx0aWYgc2V0dXBbcHJvcF1cblx0XHRcdGlmIHByb3AgPT0gXCJsaW5lSGVpZ2h0XCIgJiYgc2V0dXBbcHJvcF0gPT0gXCJhdXRvXCJcblx0XHRcdFx0dGV4dExheWVyLnN0eWxlLmxpbmVIZWlnaHQgPSAgc2V0dXAuZm9udFNpemVcblx0XHRcdGlmIHByb3AgPT0gXCJmb250V2VpZ2h0XCJcblx0XHRcdFx0c3dpdGNoIHNldHVwW3Byb3BdXG5cdFx0XHRcdFx0d2hlbiBcInVsdHJhdGhpblwiIHRoZW4gc2V0dXBbcHJvcF0gPSAxMDBcblx0XHRcdFx0XHR3aGVuIFwidGhpblwiIHRoZW4gc2V0dXBbcHJvcF0gPSAyMDBcblx0XHRcdFx0XHR3aGVuIFwibGlnaHRcIiB0aGVuIHNldHVwW3Byb3BdID0gMzAwXG5cdFx0XHRcdFx0d2hlbiBcInJlZ3VsYXJcIiB0aGVuIHNldHVwW3Byb3BdID0gNDAwXG5cdFx0XHRcdFx0d2hlbiBcIm1lZGl1bVwiIHRoZW4gc2V0dXBbcHJvcF0gPSA1MDBcblx0XHRcdFx0XHR3aGVuIFwic2VtaWJvbGRcIiB0aGVuIHNldHVwW3Byb3BdID0gNjAwXG5cdFx0XHRcdFx0d2hlbiBcImJvbGRcIiB0aGVuIHNldHVwW3Byb3BdID0gNzAwXG5cdFx0XHRcdFx0d2hlbiBcImJsYWNrXCIgdGhlbiBzZXR1cFtwcm9wXSA9IDgwMFxuXHRcdFx0aWYgcHJvcCA9PSBcImZvbnRTaXplXCIgfHwgcHJvcCA9PSBcImxpbmVIZWlnaHRcIiB8fCBwcm9wID09IFwibGV0dGVyU3BhY2luZ1wiXG5cdFx0XHRcdHNldHVwW3Byb3BdID0gaW9zLnV0aWxzLnB4KHNldHVwW3Byb3BdKSArIFwicHhcIlxuXHRcdFx0dGV4dExheWVyLnN0eWxlW3Byb3BdID0gc2V0dXBbcHJvcF1cblxuXHR0ZXh0RnJhbWUgPSBpb3MudXRpbHMudGV4dEF1dG9TaXplKHRleHRMYXllcilcblx0dGV4dExheWVyLnByb3BzID0gKGhlaWdodDp0ZXh0RnJhbWUuaGVpZ2h0LCB3aWR0aDp0ZXh0RnJhbWUud2lkdGgpXG5cblx0aWYgc2V0dXAuZWRpdGFibGVcblx0XHR0ZXh0TGF5ZXIub24gXCJjaGFuZ2U6aHRtbFwiLCAtPlxuXHRcdFx0dGV4dEZyYW1lID0gaW9zLnV0aWxzLnRleHRBdXRvU2l6ZSh0ZXh0TGF5ZXIpXG5cdFx0XHR0ZXh0TGF5ZXIucHJvcHMgPSAoaGVpZ2h0OnRleHRGcmFtZS5oZWlnaHQsIHdpZHRoOnRleHRGcmFtZS53aWR0aClcblxuXG5cdGlvcy5sYXlvdXQuc2V0XG5cdFx0dGFyZ2V0OnRleHRMYXllclxuXHRyZXR1cm4gdGV4dExheWVyXG4iLCJpb3MgPSByZXF1aXJlICdpb3Mta2l0J1xuXG5cbmV4cG9ydHMuZGVmYXVsdHMgPVxuICBrZXk6XCJ2YWx1ZVwiXG5cbmV4cG9ydHMuZGVmYXVsdHMucHJvcHMgPSBPYmplY3Qua2V5cyhleHBvcnRzLmRlZmF1bHRzKVxuXG5leHBvcnRzLmNyZWF0ZSA9IChhcnJheSkgLT5cbiAgc2V0dXAgPSBpb3MudXRpbHMuc2V0dXBDb21wb25lbnQoYXJyYXksIGV4cG9ydHMuZGVmYXVsdHMpXG4gIHJldHVyblxuIiwiaW9zID0gcmVxdWlyZSAnaW9zLWtpdCdcblxuZXhwb3J0cy5kZWZhdWx0cyA9IHtcblx0dGFiOiB7XG5cdFx0bGFiZWw6IFwibGFiZWxcIlxuXHRcdGljb246XCI8P3htbCB2ZXJzaW9uPScxLjAnIGVuY29kaW5nPSdVVEYtOCcgc3RhbmRhbG9uZT0nbm8nPz5cblx0XHRcdDxzdmcgd2lkdGg9JzI1cHgnIGhlaWdodD0nMjVweCcgdmlld0JveD0nMCAwIDI1IDI1JyB2ZXJzaW9uPScxLjEnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgeG1sbnM6eGxpbms9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnPlxuXHRcdFx0XHQ8IS0tIEdlbmVyYXRvcjogU2tldGNoIDMuNi4xICgyNjMxMykgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+XG5cdFx0XHRcdDx0aXRsZT4xPC90aXRsZT5cblx0XHRcdFx0PGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+XG5cdFx0XHRcdDxkZWZzPjwvZGVmcz5cblx0XHRcdFx0PGcgaWQ9J1BhZ2UtMScgc3Ryb2tlPSdub25lJyBzdHJva2Utd2lkdGg9JzEnIGZpbGw9J25vbmUnIGZpbGwtcnVsZT0nZXZlbm9kZCcgZmlsbC1vcGFjaXR5PScxJz5cblx0XHRcdFx0XHQ8ZyBpZD0nQm90dG9tLUJhci9UYWItQmFyJyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSgtMjUuMDAwMDAwLCAtNy4wMDAwMDApJyBmaWxsPScjMDA3NkZGJz5cblx0XHRcdFx0XHRcdDxnIGlkPSdQbGFjZWhvbGRlcnMnIHRyYW5zZm9ybT0ndHJhbnNsYXRlKDI1LjAwMDAwMCwgNy4wMDAwMDApJz5cblx0XHRcdFx0XHRcdFx0PHJlY3QgaWQ9JzEnIHg9JzAnIHk9JzAnIHdpZHRoPScyNScgaGVpZ2h0PScyNScgcng9JzMnPjwvcmVjdD5cblx0XHRcdFx0XHRcdDwvZz5cblx0XHRcdFx0XHQ8L2c+XG5cdFx0XHRcdDwvZz5cblx0XHRcdDwvc3ZnPlwiXG5cdFx0YWN0aXZlOiB1bmRlZmluZWRcblx0XHRpbmFjdGl2ZTogdW5kZWZpbmVkXG5cdFx0dGFiQmFyOiB1bmRlZmluZWRcblx0XHR0eXBlOiBcInRhYlwiXG5cdH1cblx0YmFyOiB7XG5cdFx0dGFiczogW11cblx0XHRzdGFydDowXG5cdFx0dHlwZTpcInRhYkJhclwiXG5cdFx0YmFja2dyb3VuZENvbG9yOlwid2hpdGVcIlxuXHRcdGFjdGl2ZUNvbG9yOlwiYmx1ZVwiXG5cdFx0aW5hY3RpdmVDb2xvcjpcImdyYXlcIlxuXHRcdGJsdXI6dHJ1ZVxuXHR9XG59XG5cbmV4cG9ydHMuZGVmYXVsdHMudGFiLnByb3BzID0gT2JqZWN0LmtleXMoZXhwb3J0cy5kZWZhdWx0cy50YWIpXG5leHBvcnRzLmRlZmF1bHRzLmJhci5wcm9wcyA9IE9iamVjdC5rZXlzKGV4cG9ydHMuZGVmYXVsdHMuYmFyKVxuXG5leHBvcnRzLnRhYiA9IChhcnJheSkgLT5cblx0c2V0dXAgPSBpb3MudXRpbHMuc2V0dXBDb21wb25lbnQoYXJyYXksIGV4cG9ydHMuZGVmYXVsdHMudGFiKVxuXHRzcGVjcyA9XG5cdFx0d2lkdGg6IDc1XG5cblx0c3dpdGNoIGlvcy5kZXZpY2UubmFtZVxuXHRcdHdoZW4gXCJpcGhvbmUtNVwiXG5cdFx0XHRzcGVjcy53aWR0aCA9IDU1XG5cblx0dGFiID0gbmV3IGlvcy5WaWV3XG5cdFx0YmFja2dyb3VuZENvbG9yOlwidHJhbnNwYXJlbnRcIlxuXHRcdG5hbWU6c2V0dXAubGFiZWxcblx0XHRjb25zdHJhaW50czpcblx0XHRcdHdpZHRoOnNwZWNzLndpZHRoXG5cdFx0XHRoZWlnaHQ6NDlcblxuXHR0YWIudmlldyA9IG5ldyBpb3MuVmlld1xuXHRcdG5hbWU6c2V0dXAubGFiZWwgKyBcIi52aWV3XCJcblx0XHRiYWNrZ3JvdW5kQ29sb3I6XCJ0cmFuc3BhcmVudFwiXG5cdFx0Y29uc3RyYWludHM6XG5cdFx0XHR0b3A6MFxuXHRcdFx0Ym90dG9tOjBcblx0XHRcdGxlYWRpbmc6MFxuXHRcdFx0dHJhaWxpbmc6MFxuXG5cdCMgQ3JlYXRlIEFjdGl2ZVxuXHR0YWIuYWN0aXZlID0gbmV3IGlvcy5WaWV3XG5cdFx0bmFtZTpcIi5hY3RpdmVcIlxuXHRcdGJhY2tncm91bmRDb2xvcjpcInRyYW5zcGFyZW50XCJcblx0XHRjb25zdHJhaW50czpcblx0XHRcdHRvcDowXG5cdFx0XHRib3R0b206MFxuXHRcdFx0bGVhZGluZzowXG5cdFx0XHR0cmFpbGluZzowXG5cdFx0c3VwZXJMYXllcjp0YWJcblxuXHR0YWIuYWN0aXZlLmljb24gPSBuZXcgaW9zLlZpZXdcblx0XHRuYW1lOlwiLmFjdGl2ZS5pY29uXCJcblx0XHRjb25zdHJhaW50czpcblx0XHRcdHdpZHRoOjI1XG5cdFx0XHRoZWlnaHQ6MjVcblx0XHRcdGFsaWduOlwiaG9yaXpvbnRhbFwiXG5cdFx0XHR0b3A6N1xuXHRcdGJhY2tncm91bmRDb2xvcjpcInRyYW5zcGFyZW50XCJcblx0XHRzdXBlckxheWVyOnRhYi5hY3RpdmVcblx0aWYgc2V0dXAuYWN0aXZlID09IHVuZGVmaW5lZFxuXHRcdHN2Z0ZyYW1lID0gaW9zLnV0aWxzLnN2ZyhzZXR1cC5pY29uKVxuXHRcdHRhYi5hY3RpdmUuaWNvbi5odG1sID0gc3ZnRnJhbWUuc3ZnXG5cdFx0dGFiLmFjdGl2ZS5pY29uLndpZHRoID0gc3ZnRnJhbWUud2lkdGhcblx0XHR0YWIuYWN0aXZlLmljb24uaGVpZ2h0ID0gc3ZnRnJhbWUuaGVpZ2h0XG5cdGVsc2Vcblx0XHRzZXR1cC5hY3RpdmUuc3VwZXJMYXllciA9IHRhYi5hY3RpdmUuaWNvblxuXHRcdHNldHVwLmFjdGl2ZS5wcm9wcyA9XG5cdFx0XHR3aWR0aDp0YWIuYWN0aXZlLmljb24ud2lkdGhcblx0XHRcdGhlaWdodDp0YWIuYWN0aXZlLmljb24uaGVpZ2h0XG5cblx0IyBDcmVhdGUgSW5hY3RpdmVcblx0dGFiLmluYWN0aXZlID0gbmV3IGlvcy5WaWV3XG5cdFx0YmFja2dyb3VuZENvbG9yOlwidHJhbnNwYXJlbnRcIlxuXHRcdG5hbWU6XCIuaW5hY3RpdmVcIlxuXHRcdGNvbnN0cmFpbnRzOlxuXHRcdFx0dG9wOjBcblx0XHRcdGJvdHRvbTowXG5cdFx0XHRsZWFkaW5nOjBcblx0XHRcdHRyYWlsaW5nOjBcblx0XHRzdXBlckxheWVyOnRhYlxuXG5cdHRhYi5pbmFjdGl2ZS5pY29uID0gbmV3IGlvcy5WaWV3XG5cdFx0Y29uc3RyYWludHM6XG5cdFx0XHR3aWR0aDoyNVxuXHRcdFx0aGVpZ2h0OjI1XG5cdFx0XHRhbGlnbjpcImhvcml6b250YWxcIlxuXHRcdFx0dG9wOjdcblx0XHRiYWNrZ3JvdW5kQ29sb3I6XCJ0cmFuc3BhcmVudFwiXG5cdFx0bmFtZTpcIi5pbmFjdGl2ZS5pY29uXCJcblx0XHRzdXBlckxheWVyOnRhYi5pbmFjdGl2ZVxuXG5cdHRhYi5sYWJlbCA9IG5ldyBpb3MuVGV4dFxuXHRcdHRleHQ6c2V0dXAubGFiZWxcblx0XHRzdXBlckxheWVyOnRhYlxuXHRcdGNvbG9yOlwiIzkyOTI5MlwiXG5cdFx0Zm9udFNpemU6MTBcblx0XHRuYW1lOlwiLmxhYmVsXCJcblx0XHR0ZXh0VHJhbnNmb3JtOlwiY2FwaXRhbGl6ZVwiXG5cblx0dGFiLmxhYmVsLmNvbnN0cmFpbnRzID1cblx0XHRib3R0b206MlxuXHRcdGhvcml6b250YWxDZW50ZXI6dGFiLmFjdGl2ZS5pY29uXG5cblx0aWYgc2V0dXAuaW5hY3RpdmUgPT0gdW5kZWZpbmVkXG5cdFx0c3ZnRnJhbWUgPSBpb3MudXRpbHMuc3ZnKHNldHVwLmljb24pXG5cdFx0dGFiLmluYWN0aXZlLmljb24uaHRtbCA9IHN2Z0ZyYW1lLnN2Z1xuXHRcdHRhYi5pbmFjdGl2ZS5pY29uLndpZHRoID0gc3ZnRnJhbWUud2lkdGhcblx0XHR0YWIuaW5hY3RpdmUuaWNvbi5oZWlnaHQgPSBzdmdGcmFtZS5oZWlnaHRcblxuXHRlbHNlXG5cdFx0c2V0dXAuaW5hY3RpdmUuc3VwZXJMYXllciA9IHRhYi5pbmFjdGl2ZS5pY29uXG5cdFx0c2V0dXAuaW5hY3RpdmUucHJvcHMgPVxuXHRcdFx0d2lkdGg6dGFiLmluYWN0aXZlLmljb24ud2lkdGhcblx0XHRcdGhlaWdodDp0YWIuaW5hY3RpdmUuaWNvbi5oZWlnaHRcblxuXHRyZXR1cm4gdGFiXG5cbmV4cG9ydHMuYmFyID0gKGFycmF5KSAtPlxuXHRzZXR1cCA9IGlvcy51dGlscy5zZXR1cENvbXBvbmVudChhcnJheSwgZXhwb3J0cy5kZWZhdWx0cy5iYXIpXG5cblx0IyBJZiBubyB0YWJzLCBtYWtlIGR1bW15IHRhYnNcblx0aWYgc2V0dXAudGFicy5sZW5ndGggPT0gMFxuXHRcdGR1bW15VGFiID0gbmV3IGV4cG9ydHMudGFiXG5cdFx0ZHVtbXlUYWIyID0gbmV3IGV4cG9ydHMudGFiXG5cdFx0c2V0dXAudGFicy5wdXNoIGR1bW15VGFiXG5cdFx0c2V0dXAudGFicy5wdXNoIGR1bW15VGFiMlxuXG5cdHNwZWNzID1cblx0XHR3aWR0aDogNzVcblx0c3dpdGNoIGlvcy5kZXZpY2UubmFtZVxuXHRcdHdoZW4gXCJpcGhvbmUtNVwiXG5cdFx0XHRzcGVjcy53aWR0aCA9IDU1XG5cblx0YmFyID0gbmV3IGlvcy5WaWV3XG5cdFx0YmFja2dyb3VuZENvbG9yOlwidHJhbnNwYXJlbnRcIlxuXHRcdG5hbWU6XCJ0YWJCYXJcIlxuXHRcdGNvbnN0cmFpbnRzOlxuXHRcdFx0bGVhZGluZzowXG5cdFx0XHR0cmFpbGluZzowXG5cdFx0XHRib3R0b206MFxuXHRcdFx0aGVpZ2h0OjQ5XG5cblx0YmFyLmJnID0gbmV3IGlvcy5WaWV3XG5cdFx0c3VwZXJMYXllcjpiYXJcblx0XHRuYW1lOlwiLmJnXCJcblx0XHRjb25zdHJhaW50czpcblx0XHRcdGxlYWRpbmc6MFxuXHRcdFx0dHJhaWxpbmc6MFxuXHRcdFx0Ym90dG9tOjBcblx0XHRcdGhlaWdodDo0OVxuXG5cdGJhci5kaXZpZGVyID0gbmV3IGlvcy5WaWV3XG5cdFx0YmFja2dyb3VuZENvbG9yOlwiI0IyQjJCMlwiXG5cdFx0bmFtZTpcIi5kaXZpZGVyXCJcblx0XHRzdXBlckxheWVyOmJhclxuXHRcdGNvbnN0cmFpbnRzOlxuXHRcdFx0dG9wOjBcblx0XHRcdGxlYWRpbmc6MFxuXHRcdFx0dHJhaWxpbmc6MFxuXHRcdFx0aGVpZ2h0Oi41XG5cdGJhci5ib3ggPSBuZXcgaW9zLlZpZXdcblx0XHRzdXBlckxheWVyOmJhclxuXHRcdGJhY2tncm91bmRDb2xvcjpcInRyYW5zcGFyZW50XCJcblx0XHRuYW1lOlwiLmJveFwiXG5cdFx0Y29uc3RyYWludHM6XG5cdFx0XHRoZWlnaHQ6NDlcblx0XHRcdHdpZHRoOnNldHVwLnRhYnMubGVuZ3RoICogc3BlY3Mud2lkdGhcblxuXG5cdHNldEFjdGl2ZSA9ICh0YWJJbmRleCkgLT5cblx0XHRmb3IgdGFiLCBpbmRleCBpbiBzZXR1cC50YWJzXG5cdFx0XHRpZiBpbmRleCA9PSB0YWJJbmRleFxuXHRcdFx0XHR0YWIubGFiZWwuY29sb3IgPSBpb3MudXRpbHMuY29sb3Ioc2V0dXAuYWN0aXZlQ29sb3IpXG5cdFx0XHRcdHRhYi5hY3RpdmUudmlzaWJsZSA9IHRydWVcblx0XHRcdFx0dGFiLmluYWN0aXZlLnZpc2libGUgPSBmYWxzZVxuXHRcdFx0XHR0YWIudmlldy52aXNpYmxlID0gdHJ1ZVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHR0YWIubGFiZWwuY29sb3IgPSBpb3MudXRpbHMuY29sb3Ioc2V0dXAuaW5hY3RpdmVDb2xvcilcblx0XHRcdFx0dGFiLmFjdGl2ZS52aXNpYmxlID0gZmFsc2Vcblx0XHRcdFx0dGFiLmluYWN0aXZlLnZpc2libGUgPSB0cnVlXG5cdFx0XHRcdHRhYi52aWV3LnZpc2libGUgPSBmYWxzZVxuXG5cblx0Zm9yIHRhYiwgaW5kZXggaW4gc2V0dXAudGFic1xuXHRcdCNDaGVjayBmb3IgdmFpbGQgdGFiIG9iamVjdFxuXHRcdGJhci5ib3guYWRkU3ViTGF5ZXIodGFiKVxuXHRcdCMgQ2hhbmdlIGNvbG9yc1xuXHRcdGlvcy51dGlscy5jaGFuZ2VGaWxsKHRhYi5hY3RpdmUuaWNvbiwgaW9zLnV0aWxzLmNvbG9yKHNldHVwLmFjdGl2ZUNvbG9yKSlcblx0XHRpb3MudXRpbHMuY2hhbmdlRmlsbCh0YWIuaW5hY3RpdmUuaWNvbiwgaW9zLnV0aWxzLmNvbG9yKHNldHVwLmluYWN0aXZlQ29sb3IpKVxuXHRcdHRhYi5sYWJlbC5jb2xvciA9IGlvcy51dGlscy5jb2xvcihzZXR1cC5pbmFjdGl2ZUNvbG9yKVxuXHRcdGJhci5iZy5iYWNrZ3JvdW5kQ29sb3IgPSBzZXR1cC5iYWNrZ3JvdW5kQ29sb3JcblxuXHRcdGlmIHNldHVwLmJsdXJcblx0XHRcdGJhci5iZy5iYWNrZ3JvdW5kQ29sb3IgPSBcInJnYmEoMjU1LDI1NSwyNTUsIC45KVwiXG5cdFx0XHRpb3MudXRpbHMuYmdCbHVyKGJhci5iZylcblxuXHRcdGlmIGluZGV4ID09IDBcblx0XHRcdHRhYi5jb25zdHJhaW50cy5sZWFkaW5nID0gMFxuXHRcdGVsc2Vcblx0XHRcdHRhYi5jb25zdHJhaW50cy5sZWFkaW5nID0gc2V0dXAudGFic1tpbmRleCAtIDFdXG5cblx0XHRpb3MubGF5b3V0LnNldCh0YWIpXG5cblx0XHR0YWIub24gRXZlbnRzLlRvdWNoU3RhcnQsIC0+XG5cdFx0XHR0YWJJbmRleCA9IEAueCAvIGlvcy51dGlscy5weChzcGVjcy53aWR0aClcblx0XHRcdHNldEFjdGl2ZSh0YWJJbmRleClcblxuXHRiYXIuYm94LmNvbnN0cmFpbnRzID1cblx0XHRhbGlnbjpcImhvcml6b250YWxcIlxuXG5cdGlvcy5sYXlvdXQuc2V0KGJhci5ib3gpXG5cdHNldEFjdGl2ZShzZXR1cC5zdGFydClcblxuXHRiYXIudGFicyA9IHNldHVwLnRhYnNcblxuXHRyZXR1cm4gYmFyXG4iLCJpb3MgPSByZXF1aXJlICdpb3Mta2l0J1xuXG5leHBvcnRzLmRlZmF1bHRzID0ge1xuXHRjYXJyaWVyOlwiXCJcblx0bmV0d29yazpcIkxURVwiXG5cdGJhdHRlcnk6MTAwXG5cdHNpZ25hbDo1XG5cdHN0eWxlOlwiZGFya1wiXG5cdGNsb2NrMjQ6ZmFsc2Vcblx0dHlwZTpcInN0YXR1c0JhclwiXG5cdHN1cGVyTGF5ZXI6dW5kZWZpbmVkXG59XG5cbmV4cG9ydHMuZGVmYXVsdHMucHJvcHMgPSBPYmplY3Qua2V5cyhleHBvcnRzLmRlZmF1bHRzKVxuXG5leHBvcnRzLmNyZWF0ZSA9IChhcnJheSkgLT5cblx0c2V0dXAgPSBpb3MudXRpbHMuc2V0dXBDb21wb25lbnQoYXJyYXksIGV4cG9ydHMuZGVmYXVsdHMpXG5cdHN0YXR1c0JhciA9IG5ldyBMYXllclxuXHRcdGJhY2tncm91bmRDb2xvcjpcInRyYW5zcGFyZW50XCJcblx0XHRuYW1lOlwic3RhdHVzQmFyLmFsbFwiXG5cdFx0c3VwZXJMYXllcjpzZXR1cC5zdXBlckxheWVyXG5cdHN0YXR1c0Jhci50eXBlID0gc2V0dXAudHlwZVxuXHRzdGF0dXNCYXIuY29uc3RyYWludHMgPVxuXHRcdGxlYWRpbmc6MFxuXHRcdHRyYWlsaW5nOjBcblx0XHRoZWlnaHQ6MjBcblxuXHRzd2l0Y2ggaW9zLmRldmljZS5uYW1lXG5cdFx0d2hlbiBcImlwaG9uZS02cy1wbHVzXCJcblx0XHRcdEB0b3BDb25zdHJhaW50ID0gNVxuXHRcdFx0QGJhdHRlcnlJY29uID0gNVxuXHRcdFx0QGJsdWV0b290aCA9IDVcblxuXHRcdHdoZW4gXCJmdWxsc2NyZWVuXCJcblx0XHRcdEB0b3BDb25zdHJhaW50ID0gNVxuXHRcdFx0QGJhdHRlcnlJY29uID0gLSAxMlxuXHRcdFx0QGJsdWV0b290aCA9IC0gMTBcblx0XHRlbHNlXG5cdFx0XHRAdG9wQ29uc3RyYWludCA9IDNcblx0XHRcdEBiYXR0ZXJ5SWNvbiA9IDJcblx0XHRcdEBibHVldG9vdGggPSAzXG5cblx0aWYgc2V0dXAuc3R5bGUgPT0gXCJsaWdodFwiXG5cdFx0QGNvbG9yID0gXCJ3aGl0ZVwiXG5cdGVsc2Vcblx0XHRAY29sb3IgPSBcImJsYWNrXCJcblx0Zm9yIGxheWVyIGluIEZyYW1lci5DdXJyZW50Q29udGV4dC5sYXllcnNcblx0XHRpZiBsYXllci50eXBlID09IFwibG9ja1NjcmVlblwiXG5cdFx0XHRAaXNMb2NrU2NyZWVuUHV0aWxzZW50ID0gdHJ1ZVxuXHRpZiBAaXNMb2NrU2NyZWVuUHV0aWxzZW50XG5cdFx0Z3JpcHBlciA9IG5ldyBMYXllciBzdXBlckxheWVyOnN0YXR1c0Jhciwgd2lkdGg6dXRpbHMucHgoMzcpLCBoZWlnaHQ6dXRpbHMucHgoNSksIG5hbWU6XCJncmlwcGVyXCIsIGJhY2tncm91bmRDb2xvcjpcInRyYW5zcGFyZW50XCIsIG9wYWNpdHk6LjUsIG5hbWU6XCJncmlwcGVyXCJcblx0XHRncmlwcGVyLmh0bWwgPSBcIjw/eG1sIHZlcnNpb249JzEuMCcgZW5jb2Rpbmc9J1VURi04JyBzdGFuZGFsb25lPSdubyc/PlxuXHRcdFx0PHN2ZyB3aWR0aD0nI3t1dGlscy5weCgzNyl9cHgnIGhlaWdodD0nI3t1dGlscy5weCg1KX1weCcgdmlld0JveD0nMCAwIDM3IDUnIHZlcnNpb249JzEuMScgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB4bWxuczp4bGluaz0naHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayc+XG5cdFx0XHRcdDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggMy42LjEgKDI2MzEzKSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT5cblx0XHRcdFx0PHRpdGxlPkdyaXBwZXI8L3RpdGxlPlxuXHRcdFx0XHQ8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz5cblx0XHRcdFx0PGRlZnM+PC9kZWZzPlxuXHRcdFx0XHQ8ZyBpZD0nUGFnZS0xJyBzdHJva2U9J25vbmUnIHN0cm9rZS13aWR0aD0nMScgZmlsbD0nbm9uZScgZmlsbC1ydWxlPSdldmVub2RkJz5cblx0XHRcdFx0XHQ8ZyBpZD0nS2V5Ym9hcmQvQXV0by1Db21wbGV0ZS1CYXItQ2xvc2VkJyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSgtMTY5LjAwMDAwMCwgLTIuMDAwMDAwKScgZmlsbD0nI0ZGRkZGRic+XG5cdFx0XHRcdFx0XHQ8cmVjdCBpZD0nR3JpcHBlcicgeD0nMTY5LjUnIHk9JzIuNScgd2lkdGg9JzM2JyBoZWlnaHQ9JzQnIHJ4PScyLjUnPjwvcmVjdD5cblx0XHRcdFx0XHQ8L2c+XG5cdFx0XHRcdDwvZz5cblx0XHRcdDwvc3ZnPlwiXG5cdFx0Z3JpcHBlci5jb25zdHJhaW50cyA9XG5cdFx0XHRhbGlnbjpcImhvcml6b250YWxcIlxuXHRcdFx0dG9wOjJcblx0ZWxzZVxuXHRcdEB0aW1lID0gaW9zLnV0aWxzLmdldFRpbWUoKVxuXHRcdGlmIHNldHVwLmNsb2NrMjQgPT0gZmFsc2Vcblx0XHRcdGlmIEB0aW1lLmhvdXJzID4gMTFcblx0XHRcdFx0QHRpbWUuc3RhbXAgPSBcIlBNXCJcblx0XHRcdGVsc2Vcblx0XHRcdFx0QHRpbWUuc3RhbXAgPSBcIkFNXCJcblx0XHRlbHNlXG5cdFx0XHRAdGltZS5zdGFtcCA9IFwiXCJcblx0XHR0aW1lID0gbmV3IGlvcy5UZXh0IHN0eWxlOlwic3RhdHVzQmFyVGltZVwiLCB0ZXh0Omlvcy51dGlscy50aW1lRm9ybWF0dGVyKEB0aW1lLCBzZXR1cC5jbG9jazI0KSArIFwiIFwiICsgQHRpbWUuc3RhbXAsIGZvbnRTaXplOjEyLCBmb250V2VpZ2h0Olwic2VtaWJvbGRcIiwgc3VwZXJMYXllcjpzdGF0dXNCYXIsIGNvbG9yOkBjb2xvciwgbmFtZTpcInRpbWVcIlxuXHRcdHRpbWUuY29uc3RyYWludHMgPVxuXHRcdFx0YWxpZ246XCJob3Jpem9udGFsXCJcblx0XHRcdHRvcDpAdG9wQ29uc3RyYWludFxuXHRzaWduYWwgPSBbXVxuXHRpZiBzZXR1cC5zaWduYWwgPCAxXG5cdFx0bm9OZXR3b3JrID0gbmV3IGlvcy5UZXh0IHN1cGVyTGF5ZXI6c3RhdHVzQmFyLCBmb250U2l6ZToxMiwgdGV4dDpcIk5vIE5ldHdvcmtcIlxuXHRcdG5vTmV0d29yay5jb25zdHJhaW50cyA9XG5cdFx0XHRsZWFkaW5nOjdcblx0XHRcdHRvcDozXG5cdGVsc2Vcblx0XHRmb3IgaSBpbiBbMC4uLnNldHVwLnNpZ25hbF1cblx0XHRcdGRvdCA9IG5ldyBMYXllciBoZWlnaHQ6aW9zLnV0aWxzLnB4KDUuNSksIHdpZHRoOmlvcy51dGlscy5weCg1LjUpLCBiYWNrZ3JvdW5kQ29sb3I6XCJibGFja1wiLCBzdXBlckxheWVyOnN0YXR1c0JhciwgYm9yZGVyUmFkaXVzOmlvcy51dGlscy5weCg1LjUpLzIsIGJhY2tncm91bmRDb2xvcjpAY29sb3IsIG5hbWU6XCJzaWduYWxbI3tpfV1cIlxuXHRcdFx0aWYgaSA9PSAwXG5cdFx0XHRcdGRvdC5jb25zdHJhaW50cyA9XG5cdFx0XHRcdFx0bGVhZGluZzo3XG5cdFx0XHRcdFx0dG9wOjdcblx0XHRcdGVsc2Vcblx0XHRcdFx0ZG90LmNvbnN0cmFpbnRzID1cblx0XHRcdFx0XHRsZWFkaW5nOltzaWduYWxbaSAtIDEgXSwgMV1cblx0XHRcdFx0XHR0b3A6N1xuXHRcdFx0c2lnbmFsLnB1c2ggZG90XG5cdFx0XHRpb3MubGF5b3V0LnNldCgpXG5cdFx0aWYgc2V0dXAuc2lnbmFsIDwgNVxuXHRcdFx0bm9uRG90cyA9IDUgLSBzZXR1cC5zaWduYWxcblx0XHRcdGZvciBpIGluIFswLi4ubm9uRG90c11cblx0XHRcdFx0bm9uRG90ID0gbmV3IExheWVyIGhlaWdodDppb3MudXRpbHMucHgoNS41KSwgd2lkdGg6aW9zLnV0aWxzLnB4KDUuNSksIHN1cGVyTGF5ZXI6c3RhdHVzQmFyLCBib3JkZXJSYWRpdXM6aW9zLnV0aWxzLnB4KDUuNSkvMiwgYmFja2dyb3VuZENvbG9yOlwidHJhbnNwYXJlbnRcIiwgbmFtZTpcInNpZ25hbFsje3NpZ25hbC5sZW5ndGh9XVwiXG5cdFx0XHRcdG5vbkRvdC5zdHlsZS5ib3JkZXIgPSBcIiN7aW9zLnV0aWxzLnB4KDEpfXB4IHNvbGlkICN7QGNvbG9yfVwiXG5cdFx0XHRcdG5vbkRvdC5jb25zdHJhaW50cyA9XG5cdFx0XHRcdFx0bGVhZGluZzpbc2lnbmFsW3NpZ25hbC5sZW5ndGggLSAxXSwgMV1cblx0XHRcdFx0XHR0b3A6N1xuXHRcdFx0XHRzaWduYWwucHVzaCBub25Eb3Rcblx0XHRcdFx0aW9zLmxheW91dC5zZXQoKVxuXHRcdGNhcnJpZXIgPSBuZXcgaW9zLlRleHQgc3R5bGU6XCJzdGF0dXNCYXJDYXJyaWVyXCIsIHRleHQ6c2V0dXAuY2Fycmllciwgc3VwZXJMYXllcjpzdGF0dXNCYXIsIGZvbnRTaXplOjEyLCBjb2xvcjpAY29sb3IsIG5hbWU6XCJjYXJyaWVyXCIsIHRleHRUcmFuc2Zvcm06XCJjYXBpdGFsaXplXCJcblx0XHRjYXJyaWVyLmNvbnN0cmFpbnRzID1cblx0XHRcdGxlYWRpbmc6W3NpZ25hbFtzaWduYWwubGVuZ3RoIC0gMV0sIDddXG5cdFx0XHR0b3A6M1xuXHRcdGlvcy5sYXlvdXQuc2V0KClcblx0XHRpZiBzZXR1cC5jYXJyaWVyXG5cdFx0XHRuZXR3b3JrID0gbmV3IGlvcy5UZXh0IHN0eWxlOlwic3RhdHVzQmFyTmV0d29ya1wiLCB0ZXh0OnNldHVwLm5ldHdvcmssIHN1cGVyTGF5ZXI6c3RhdHVzQmFyLCBmb250U2l6ZToxMiwgY29sb3I6QGNvbG9yLCBuYW1lOlwibmV0d29ya1wiLCB0ZXh0VHJhbnNmb3JtOlwidXBwZXJjYXNlXCJcblx0XHRcdG5ldHdvcmsuY29uc3RyYWludHMgPVxuXHRcdFx0XHRsZWFkaW5nOltjYXJyaWVyLCA1XVxuXHRcdFx0XHR0b3A6M1xuXG5cdFx0aWYgc2V0dXAuY2FycmllciA9PSBcIlwiIHx8IHNldHVwLmNhcnJpZXIgPT0gXCJ3aWZpXCJcblx0XHRcdG5ldHdvcmtJY29uID0gaW9zLnV0aWxzLnN2Zyhpb3MuYXNzZXRzLm5ldHdvcmssIEBjb2xvcilcblx0XHRcdG5ldHdvcmsgPSBuZXcgTGF5ZXIgd2lkdGg6bmV0d29ya0ljb24ud2lkdGgsIGhlaWdodDpuZXR3b3JrSWNvbi5oZWlnaHQsIHN1cGVyTGF5ZXI6c3RhdHVzQmFyLCBiYWNrZ3JvdW5kQ29sb3I6XCJ0cmFuc3BhcmVudFwiLCBuYW1lOlwibmV0d29ya1wiXG5cdFx0XHRuZXR3b3JrLmh0bWwgPSBuZXR3b3JrSWNvbi5zdmdcblx0XHRcdGlvcy51dGlscy5jaGFuZ2VGaWxsKG5ldHdvcmssIEBjb2xvcilcblx0XHRcdG5ldHdvcmsuY29uc3RyYWludHMgPVxuXHRcdFx0XHRsZWFkaW5nOltzaWduYWxbc2lnbmFsLmxlbmd0aCAtIDFdLCA1XVxuXHRcdFx0XHR0b3A6QHRvcENvbnN0cmFpbnRcblxuXHRiYXR0ZXJ5SWNvbiA9IG5ldyBMYXllciB3aWR0aDppb3MudXRpbHMucHgoMjUpLCBoZWlnaHQ6aW9zLnV0aWxzLnB4KDEwKSwgc3VwZXJMYXllcjpzdGF0dXNCYXIsIGJhY2tncm91bmRDb2xvcjpcInRyYW5zcGFyZW50XCIsIG5hbWU6XCJiYXR0ZXJ5SWNvblwiXG5cdGlmIHNldHVwLmJhdHRlcnkgPiA3MFxuXHRcdGhpZ2hCYXR0ZXJ5ID0gaW9zLnV0aWxzLnN2Zyhpb3MuYXNzZXRzLmJhdHRlcnlIaWdoKVxuXHRcdGJhdHRlcnlJY29uLmh0bWwgPSBoaWdoQmF0dGVyeS5zdmdcblx0XHRpb3MudXRpbHMuY2hhbmdlRmlsbChiYXR0ZXJ5SWNvbiwgQGNvbG9yKVxuXG5cdGlmIHNldHVwLmJhdHRlcnkgPD0gNzAgJiYgc2V0dXAuYmF0dGVyeSA+IDIwXG5cdFx0bWlkQmF0dGVyeSA9IGlvcy51dGlscy5zdmcoaW9zLmFzc2V0cy5iYXR0ZXJ5TWlkKVxuXHRcdGJhdHRlcnlJY29uLmh0bWwgPSBtaWRCYXR0ZXJ5LnN2Z1xuXHRcdGlvcy51dGlscy5jaGFuZ2VGaWxsKGJhdHRlcnlJY29uLCBAY29sb3IpXG5cblx0aWYgc2V0dXAuYmF0dGVyeSA8PSAyMFxuXHRcdGxvd0JhdHRlcnkgPSBpb3MudXRpbHMuc3ZnKGlvcy5hc3NldHMuYmF0dGVyeUxvdylcblx0XHRiYXR0ZXJ5SWNvbi5odG1sID0gbG93QmF0dGVyeS5zdmdcblx0XHRpb3MudXRpbHMuY2hhbmdlRmlsbChiYXR0ZXJ5SWNvbiwgQGNvbG9yKVxuXG5cdGJhdHRlcnlJY29uLmNvbnN0cmFpbnRzID1cblx0XHR0cmFpbGluZyA6IDdcblx0XHR0b3A6QGJhdHRlcnlJY29uXG5cblx0YmF0dGVyeVBlcmNlbnQgPSBuZXcgaW9zLlRleHQgc3R5bGU6XCJzdGF0dXNCYXJCYXR0ZXJ5UGVyY2VudFwiLCB0ZXh0OnNldHVwLmJhdHRlcnkgKyBcIiVcIiwgc3VwZXJMYXllcjpzdGF0dXNCYXIsIGZvbnRTaXplOjEyLCBjb2xvcjpAY29sb3IsIG5hbWU6XCJiYXR0ZXJ5UGVyY2VudFwiXG5cdGJhdHRlcnlQZXJjZW50LmNvbnN0cmFpbnRzID1cblx0XHR0cmFpbGluZzogW2JhdHRlcnlJY29uLCAzXVxuXHRcdHZlcnRpY2FsQ2VudGVyOnRpbWVcblxuXHRibHVldG9vdGhTVkcgPSBpb3MudXRpbHMuc3ZnKGlvcy5hc3NldHMuYmx1ZXRvb3RoKVxuXHRibHVldG9vdGggPSBuZXcgTGF5ZXIgd2lkdGg6Ymx1ZXRvb3RoU1ZHLndpZHRoLCBoZWlnaHQ6Ymx1ZXRvb3RoU1ZHLmhlaWdodCwgc3VwZXJMYXllcjpzdGF0dXNCYXIsIG9wYWNpdHk6LjUsIGJhY2tncm91bmRDb2xvcjpcInRyYW5zcGFyZW50XCIsIG5hbWU6XCJibHVldG9vdGhcIlxuXHRibHVldG9vdGguaHRtbCA9IGJsdWV0b290aFNWRy5zdmdcblx0aW9zLnV0aWxzLmNoYW5nZUZpbGwoYmx1ZXRvb3RoLCBAY29sb3IpXG5cdGJsdWV0b290aC5jb25zdHJhaW50cyA9XG5cdFx0dG9wOiBAYmx1ZXRvb3RoXG5cdFx0dHJhaWxpbmc6IFtiYXR0ZXJ5UGVyY2VudCwgN11cblxuXHRpb3MubGF5b3V0LnNldCgpXG5cblx0IyBFeHBvcnQgc3RhdHVzQmFyXG5cdHN0YXR1c0Jhci5iYXR0ZXJ5ID0ge31cblx0c3RhdHVzQmFyLmJhdHRlcnkucGVyY2VudCA9IGJhdHRlcnlQZXJjZW50XG5cdHN0YXR1c0Jhci5iYXR0ZXJ5Lmljb24gPSBiYXR0ZXJ5SWNvblxuXHRzdGF0dXNCYXIuYmx1ZXRvb3RoID0gYmx1ZXRvb3RoXG5cdHN0YXR1c0Jhci50aW1lID0gdGltZVxuXHRzdGF0dXNCYXIubmV0d29yayA9IG5ldHdvcmtcblx0c3RhdHVzQmFyLmNhcnJpZXIgPSBjYXJyaWVyXG5cdHN0YXR1c0Jhci5zaWduYWwgPSBzaWduYWxcblx0cmV0dXJuIHN0YXR1c0JhclxuIiwiaW9zID0gcmVxdWlyZSAnaW9zLWtpdCdcblxuZXhwb3J0cy5kZWZhdWx0cyA9IHtcblx0YWN0aW9uczpbXCJSZXBseVwiLCBcIlJlcGx5IEFsbFwiLCBcIkZvcndhcmRcIiwgXCJQcmludFwiXVxuXHRleGl0OlwiQ2FuY2VsXCJcblx0YW5pbWF0ZWQ6dHJ1ZVxuXHRkZXNjcmlwdGlvbjp1bmRlZmluZWRcblx0dGFyZ2V0OnVuZGVmaW5lZFxufVxuXG5leHBvcnRzLmRlZmF1bHRzLnByb3BzID0gT2JqZWN0LmtleXMoZXhwb3J0cy5kZWZhdWx0cylcblxuZXhwb3J0cy5jcmVhdGUgPSAoYXJyYXkpIC0+XG5cdHNldHVwID0gaW9zLnV0aWxzLnNldHVwQ29tcG9uZW50KGFycmF5LCBleHBvcnRzLmRlZmF1bHRzKVxuXHRmb3IgbCBpbiBGcmFtZXIuQ3VycmVudENvbnRleHQubGF5ZXJzXG5cdFx0aWYgbC50eXBlID09ICdzaGVldCdcblx0XHRcdGwuZGlzbWlzcygpXG5cblx0c2hlZXQgPSBuZXcgaW9zLlZpZXdcblx0XHRuYW1lOlwic2hlZXRcIlxuXHRcdGJhY2tncm91bmRDb2xvcjpcInRyYW5zcGFyZW50XCJcblx0XHRjb25zdHJhaW50czpcblx0XHRcdHRvcDowXG5cdFx0XHRsZWFkaW5nOjBcblx0XHRcdHRyYWlsaW5nOjBcblx0XHRcdGJvdHRvbTowXG5cblx0c2hlZXQudHlwZSA9ICdzaGVldCdcblxuXHRzaGVldC5tZW51ID0gbmV3IExheWVyXG5cdFx0bmFtZTpcIm1lbnVcIlxuXHRcdHN1cGVyTGF5ZXI6c2hlZXRcblx0XHRiYWNrZ3JvdW5kQ29sb3I6XCJ0cmFuc3BhcmVudFwiXG5cdFx0Ym9yZGVyUmFkaXVzOmlvcy5weCgxMilcblx0XHRjbGlwOnRydWVcblxuXHRcdGlmIGlvcy5pc1BhZCgpXG5cdFx0XHRzaGVldFRpcCA9IGlvcy51dGlscy5zdmcoaW9zLmFzc2V0cy5zaGVldFRpcClcblx0XHRcdHNoZWV0LnRpcCA9IG5ldyBpb3MuVmlld1xuXHRcdFx0XHRuYW1lOicudGlwJ1xuXHRcdFx0XHRjb2xvcjonYmxhY2snXG5cdFx0XHRcdHN1cGVyTGF5ZXI6c2hlZXRcblx0XHRcdFx0aHRtbDpzaGVldFRpcC5zdmdcblx0XHRcdFx0aGVpZ2h0OnNoZWV0VGlwLmhlaWdodCAtIDRcblx0XHRcdFx0d2lkdGg6c2hlZXRUaXAud2lkdGhcblx0XHRcdFx0YmFja2dyb3VuZENvbG9yOid0cmFuc3BhcmVudCdcblx0XHRcdFx0Y29uc3RyYWludHM6XG5cdFx0XHRcdFx0aG9yaXpvbnRhbENlbnRlcjpzZXR1cC50YXJnZXRcblx0XHRcdHNoZWV0LmxpbmtlZCA9IHNldHVwLnRhcmdldFxuXHRcdFx0c2hlZXQubGlua2VkLmlnbm9yZUV2ZW50cyA9IHRydWVcblxuXHRwbGFjZSA9ICh0LCBsKS0+XG5cdFx0dyA9IGlvcy5kZXZpY2Uud2lkdGhcblx0XHRoID0gaW9zLmRldmljZS5oZWlnaHRcblx0XHRjZW50ZXJYID0gdy8yXG5cdFx0IyB4IC0gYXhpc1xuXHRcdGlmIHcgLSB0LnggPiBjZW50ZXJYICNsZWZ0XG5cdFx0XHRpZiB0LnggLSBpb3MucHgoMTUwKSA8IDBcblx0XHRcdFx0bC5jb25zdHJhaW50cy5sZWFkaW5nID0gMTBcblx0XHRcdGVsc2Vcblx0XHRcdFx0bC5jb25zdHJhaW50cy5ob3Jpem9udGFsQ2VudGVyID0gdFxuXG5cdFx0ZWxzZSAjcmlnaHRcblx0XHRcdGlmIHQueCArIGlvcy5weCgxNTApID4gd1xuXHRcdFx0XHRsLmNvbnN0cmFpbnRzLnRyYWlsaW5nID0gMTBcblx0XHRcdGVsc2Vcblx0XHRcdFx0bC5jb25zdHJhaW50cy5ob3Jpem9udGFsQ2VudGVyID0gdFxuXG5cdFx0aWYgdC55ICsgbC5oZWlnaHQgPCBoICN0b3Bcblx0XHRcdFx0bC5jb25zdHJhaW50cy50b3AgPSBbdCwgNDBdXG5cdFx0XHRcdGlmIGlvcy5pc1BhZCgpXG5cdFx0XHRcdFx0c2hlZXQudGlwLmNvbnN0cmFpbnRzLmJvdHRvbSA9IFtsLCAxXVxuXHRcdGVsc2UgI2JvdHRvbVxuXHRcdFx0XHRsLmNvbnN0cmFpbnRzLmJvdHRvbSA9IFt0LCA0MF1cblx0XHRcdFx0aWYgaW9zLmlzUGFkKClcblx0XHRcdFx0XHRzaGVldC50aXAuY29uc3RyYWludHMudG9wID0gW2wsIDFdXG5cdFx0XHRcdFx0c2hlZXQudGlwLnJvdGF0aW9uID0gMTgwXG5cdFx0aWYgaW9zLmlzUGFkKClcblx0XHRcdGlvcy5sYXlvdXQuc2V0KHNoZWV0LnRpcClcblx0c2hlZXQuZGlzbWlzcyA9IC0+XG5cblx0XHRpZiBpb3MuaXNQaG9uZSgpXG5cdFx0XHRzaGVldC5tZW51LmFuaW1hdGVcblx0XHRcdFx0cHJvcGVydGllczpcblx0XHRcdFx0XHR5Omlvcy5kZXZpY2UuaGVpZ2h0XG5cdFx0XHRcdHRpbWU6LjI1XG5cblx0XHRcdHNoZWV0LmNhbmNlbC5hbmltYXRlXG5cdFx0XHRcdHByb3BlcnRpZXM6XG5cdFx0XHRcdFx0eTppb3MuZGV2aWNlLmhlaWdodCArIGlvcy5weCg3NSlcblx0XHRcdFx0dGltZTouMjVcblx0XHRcdHNoZWV0Lm92ZXJsYXkuYW5pbWF0ZVxuXHRcdFx0XHRwcm9wZXJ0aWVzOlxuXHRcdFx0XHRcdG9wYWNpdHk6MFxuXHRcdFx0XHR0aW1lOi4yNVxuXHRcdFx0VXRpbHMuZGVsYXkgLjI1LCAtPlxuXHRcdFx0XHRzaGVldC5kZXN0cm95KClcblx0XHRlbHNlXG5cdFx0XHRzaGVldC5saW5rZWQuaWdub3JlRXZlbnRzID0gZmFsc2Vcblx0XHRcdFV0aWxzLmRlbGF5IC4xNSwgLT5cblx0XHRcdFx0c2hlZXQuZGVzdHJveSgpXG5cblxuXHRzaGVldC5jYWxsID0gLT5cblx0XHRpZiBpb3MuaXNQaG9uZSgpXG5cdFx0XHRzaGVldC5tZW51LnkgPSBpb3MuZGV2aWNlLmhlaWdodFxuXHRcdFx0c2hlZXQuY2FuY2VsLnkgPSBpb3MuZGV2aWNlLmhlaWdodCArIGlvcy5weCg3NSlcblx0XHRcdHNoZWV0Lm92ZXJsYXkub3BhY2l0eSA9IDBcblxuXHRcdFx0c2hlZXQub3ZlcmxheS5hbmltYXRlXG5cdFx0XHRcdHByb3BlcnRpZXM6XG5cdFx0XHRcdFx0b3BhY2l0eTouNVxuXHRcdFx0XHR0aW1lOi4yNVxuXHRcdFx0aW9zLmxheW91dC5hbmltYXRlXG5cdFx0XHRcdHRhcmdldDpbc2hlZXQubWVudSwgc2hlZXQuY2FuY2VsXVxuXHRcdFx0XHR0aW1lOi4yNVxuXHRcdGVsc2Vcblx0XHRcdHBsYWNlKHNldHVwLnRhcmdldCwgc2hlZXQubWVudSlcblx0XHRcdGlvcy5sYXlvdXQuc2V0KHNoZWV0Lm1lbnUpXG5cblxuXG5cdGlmIGlvcy5kZXZpY2UubmFtZS5pbmRleE9mKFwiaXBhZFwiKSA9PSAtMVxuXHRcdHNoZWV0Lm92ZXJsYXkgPSBuZXcgaW9zLlZpZXdcblx0XHRcdG5hbWU6XCIub3ZlcmxheVwiXG5cdFx0XHRiYWNrZ3JvdW5kQ29sb3I6XCJibGFja1wiXG5cdFx0XHRvcGFjaXR5Oi41XG5cdFx0XHRzdXBlckxheWVyOnNoZWV0XG5cdFx0XHRjb25zdHJhaW50czpcblx0XHRcdFx0dG9wOjBcblx0XHRcdFx0bGVhZGluZzowXG5cdFx0XHRcdHRyYWlsaW5nOjBcblx0XHRcdFx0Ym90dG9tOjBcblx0XHRzaGVldC5vdmVybGF5LnNlbmRUb0JhY2soKVxuXG5cdFx0c2hlZXQubWVudS5jb25zdHJhaW50cyA9XG5cdFx0XHRsZWFkaW5nOjEwXG5cdFx0XHR0cmFpbGluZzoxMFxuXHRcdFx0Ym90dG9tOjU3ICsgOCArIDEwXG5cdFx0XHRoZWlnaHQ6KHNldHVwLmFjdGlvbnMubGVuZ3RoKSAqIDU3XG5cblx0XHRzaGVldC5jYW5jZWwgPSBuZXcgaW9zLkJ1dHRvblxuXHRcdFx0bmFtZTpcIi5jYW5jZWxcIlxuXHRcdFx0dHlwZTpcImJpZ1wiXG5cdFx0XHR0ZXh0OnNldHVwLmV4aXRcblx0XHRcdHN1cGVyTGF5ZXI6c2hlZXRcblx0XHRcdGNvbnN0cmFpbnRzOlxuXHRcdFx0XHRib3R0b206MTBcblx0XHRcdFx0bGVhZGluZzowXG5cdFx0XHRcdHRyYWlsaW5nOjBcblx0XHRzaGVldC5jYW5jZWwub24gRXZlbnRzLlRvdWNoRW5kLCAtPlxuXHRcdFx0c2hlZXQuZGlzbWlzcygpXG5cdGVsc2Vcblx0XHRzaGVldC5tZW51LmNvbnN0cmFpbnRzID1cblx0XHRcdHdpZHRoOjMwMFxuXHRcdFx0aGVpZ2h0OihzZXR1cC5hY3Rpb25zLmxlbmd0aCkgKiA1N1xuXG5cdFx0c2hlZXQubWVudS5wcm9wcyA9XG5cdFx0XHRzaGFkb3dZOjJcblx0XHRcdHNoYWRvd0JsdXI6aW9zLnB4KDEwMClcblx0XHRcdHNoYWRvd0NvbG9yOlwicmdiYSgwLDAsMCwwLjEpXCJcblxuXHRpb3MubGF5b3V0LnNldChzaGVldClcblxuXHRzaGVldC5hY3Rpb25zQXJyYXkgPSBbXVxuXHRzaGVldC5hY3Rpb25zID0ge31cblx0Zm9yIGEsaSBpbiBzZXR1cC5hY3Rpb25zXG5cdFx0YWN0aW9uID0gbmV3IGlvcy5WaWV3XG5cdFx0XHRuYW1lOiBcIi5hY3Rpb25zLltcXFwiXCIgKyBhLnRvTG93ZXJDYXNlKCkgKyBcIlxcXCJdXCJcblx0XHRcdGJhY2tncm91bmRDb2xvcjpcInJnYmEoMjU1LDI1NSwyNTUsMSlcIlxuXHRcdFx0c3VwZXJMYXllcjpzaGVldC5tZW51XG5cdFx0XHRjb25zdHJhaW50czpcblx0XHRcdFx0bGVhZGluZzowXG5cdFx0XHRcdHRyYWlsaW5nOjBcblx0XHRcdFx0aGVpZ2h0OjU3XG5cdFx0YWN0aW9uLnN0eWxlW1wiLXdlYmtpdC1ib3gtc2hhZG93XCJdID0gXCJpbnNldCAwIDAgXCIgKyBpb3MucHgoLjUpICsgXCJweCByZ2JhKDAsMCwwLC4yNSlcIlxuXG5cdFx0YWN0aW9uLmxhYmVsID0gbmV3IGlvcy5UZXh0XG5cdFx0XHR0ZXh0OmFcblx0XHRcdGNvbG9yOmlvcy5jb2xvcihcImJsdWVcIilcblx0XHRcdGZvbnRTaXplOjIwXG5cdFx0XHRzdXBlckxheWVyOmFjdGlvblxuXHRcdFx0Y29uc3RyYWludHM6XG5cdFx0XHRcdGFsaWduOlwiY2VudGVyXCJcblxuXHRcdGlvcy51dGlscy5zcGVjaWFsQ2hhcihhY3Rpb24ubGFiZWwpXG5cblx0XHRpZiBpID09IDBcblx0XHRcdGFjdGlvbi5jb25zdHJhaW50cy50b3AgPSAwXG5cdFx0ZWxzZVxuXHRcdFx0YWN0aW9uLmNvbnN0cmFpbnRzLnRvcCA9IHNoZWV0LmFjdGlvbnNBcnJheVtpIC0gMV1cblxuXHRcdGFjdGlvbi5vbiBFdmVudHMuVG91Y2hTdGFydCwgLT5cblx0XHRcdEAuYW5pbWF0ZVxuXHRcdFx0XHRwcm9wZXJ0aWVzOlxuXHRcdFx0XHRcdGJhY2tncm91bmRDb2xvcjpALmJhY2tncm91bmRDb2xvci5kYXJrZW4oMTApXG5cdFx0XHRcdFx0dGltZTouMlxuXG5cdFx0YWN0aW9uLm9uIEV2ZW50cy5Ub3VjaEVuZCwgLT5cblx0XHRcdEAuYW5pbWF0ZVxuXHRcdFx0XHRwcm9wZXJ0aWVzOlxuXHRcdFx0XHRcdGJhY2tncm91bmRDb2xvcjpcInJnYmEoMjU1LDI1NSwyNTUsIC44KVwiXG5cdFx0XHRcdHRpbWU6LjJcblx0XHRcdHNoZWV0LmRpc21pc3MoKVxuXG5cblxuXHRcdGlvcy5sYXlvdXQuc2V0KGFjdGlvbilcblxuXHRcdHNoZWV0LmFjdGlvbnNBcnJheS5wdXNoIGFjdGlvblxuXHRcdHNoZWV0LmFjdGlvbnNbYS50b0xvd2VyQ2FzZSgpXSA9IGFjdGlvblxuXG5cblx0aWYgc2V0dXAuYW5pbWF0ZWRcblx0XHRzaGVldC5jYWxsKClcblx0aWYgaW9zLmlzUGFkKClcblx0XHRzaGVldC50aXAuYnJpbmdUb0Zyb250KClcblx0cmV0dXJuIHNoZWV0XG4iLCJpb3MgPSByZXF1aXJlICdpb3Mta2l0J1xuXG5leHBvcnRzLmRlZmF1bHRzID1cblx0dGl0bGU6XCJUaXRsZVwiXG5cdGxlZnQ6dW5kZWZpbmVkXG5cdHJpZ2h0OlwiRWRpdFwiXG5cdGJsdXI6dHJ1ZVxuXHRzdXBlckxheWVyOnVuZGVmaW5lZFxuXHR0eXBlOlwibmF2QmFyXCJcblx0Y29sb3I6J2JsdWUnXG5cdHRpdGxlQ29sb3I6J2JsYWNrJ1xuXHRiYWNrZ3JvdW5kQ29sb3I6XCJyZ2JhKDI1NSwgMjU1LCAyNTUsIC44KVwiXG5cdGRpdmlkZXJCYWNrZ3JvdW5kQ29sb3I6XCIjQjJCMkIyXCJcblxuZXhwb3J0cy5kZWZhdWx0cy5wcm9wcyA9IE9iamVjdC5rZXlzKGV4cG9ydHMuZGVmYXVsdHMpXG5cbmV4cG9ydHMuY3JlYXRlID0gKGFycmF5KSAtPlxuXHRzZXR1cCA9IGlvcy51dGlscy5zZXR1cENvbXBvbmVudChhcnJheSwgZXhwb3J0cy5kZWZhdWx0cylcblxuXHRiYXIgPSBuZXcgaW9zLlZpZXdcblx0XHRuYW1lOlwibmF2QmFyXCJcblx0XHRiYWNrZ3JvdW5kQ29sb3I6IHNldHVwLmJhY2tncm91bmRDb2xvclxuXHRcdGNvbnN0cmFpbnRzOlxuXHRcdFx0bGVhZGluZzowXG5cdFx0XHR0cmFpbGluZzowXG5cdFx0XHR0b3A6MFxuXHRcdFx0aGVpZ2h0OjY0XG5cblx0YmFyLmJnID0gbmV3IGlvcy5WaWV3XG5cdFx0c3VwZXJMYXllcjpiYXJcblx0XHRiYWNrZ3JvdW5kQ29sb3I6J3RyYW5zcGFyZW50J1xuXHRcdG5hbWU6XCIuYmdcIlxuXHRcdGNvbnN0cmFpbnRzOlxuXHRcdFx0bGVhZGluZzowXG5cdFx0XHR0cmFpbGluZzowXG5cdFx0XHRoZWlnaHQ6NDRcblx0XHRcdGJvdHRvbTowXG5cblx0YmFyLmRpdmlkZXIgPSBuZXcgaW9zLlZpZXdcblx0XHRiYWNrZ3JvdW5kQ29sb3I6c2V0dXAuZGl2aWRlckJhY2tncm91bmRDb2xvclxuXHRcdG5hbWU6XCIuZGl2aWRlclwiXG5cdFx0c3VwZXJMYXllcjpiYXIuYmdcblx0XHRjb25zdHJhaW50czpcblx0XHRcdGhlaWdodDouNVxuXHRcdFx0Ym90dG9tOjBcblx0XHRcdGxlYWRpbmc6MFxuXHRcdFx0dHJhaWxpbmc6MFxuXG5cdGlmIHNldHVwLnN1cGVyTGF5ZXJcblx0XHRzZXR1cC5zdXBlckxheWVyLmFkZFN1YkxheWVyKGJhcilcblxuXG5cdGlmIHNldHVwLmJsdXJcblx0XHRpb3MudXRpbHMuYmdCbHVyKGJhcilcblxuXHRpZiBzZXR1cC5ibHVyID09IGZhbHNlICYmIHNldHVwLmJhY2tncm91bmRDb2xvciA9PSBcInJnYmEoMjU1LCAyNTUsIDI1NSwgLjgpXCJcblx0XHRiYXIuYmFja2dyb3VuZENvbG9yID0gJ3doaXRlJ1xuXG5cdGJhci50eXBlID0gc2V0dXAudHlwZVxuXG5cdGZvciBsYXllciBpbiBGcmFtZXIuQ3VycmVudENvbnRleHQubGF5ZXJzXG5cdFx0aWYgbGF5ZXIudHlwZSA9PSBcInN0YXR1c0JhclwiXG5cdFx0XHRAc3RhdHVzQmFyID0gbGF5ZXJcblx0XHRcdGJhci5wbGFjZUJlaGluZChAc3RhdHVzQmFyKVxuXG5cblx0aWYgdHlwZW9mIHNldHVwLnRpdGxlID09IFwib2JqZWN0XCJcblx0XHRzZXR1cC50aXRsZSA9IHNldHVwLnRpdGxlLmxhYmVsLmh0bWxcblxuXG5cdGJhci50aXRsZSA9IG5ldyBpb3MuVGV4dFxuXHRcdGZvbnRXZWlnaHQ6XCJzZW1pYm9sZFwiXG5cdFx0c3VwZXJMYXllcjpiYXIuYmdcblx0XHR0ZXh0OnNldHVwLnRpdGxlXG5cdFx0bmFtZTpcIi50aXRsZVwiXG5cdFx0Y29sb3I6c2V0dXAudGl0bGVDb2xvclxuXHRcdGNvbnN0cmFpbnRzOlxuXHRcdFx0YWxpZ246XCJob3Jpem9udGFsXCJcblx0XHRcdGJvdHRvbToxMlxuXG5cdGlvcy51dGlscy5zcGVjaWFsQ2hhcihiYXIudGl0bGUpXG5cblx0IyBIYW5kbGUgUmlnaHRcblx0aWYgdHlwZW9mIHNldHVwLnJpZ2h0ID09IFwic3RyaW5nXCIgJiYgdHlwZW9mIHNldHVwLnJpZ2h0ICE9IFwiYm9vbGVhblwiXG5cdFx0YmFyLnJpZ2h0ID0gbmV3IGlvcy5CdXR0b25cblx0XHRcdG5hbWU6XCIucmlnaHRcIlxuXHRcdFx0c3VwZXJMYXllcjpiYXIuYmdcblx0XHRcdHRleHQ6c2V0dXAucmlnaHRcblx0XHRcdGNvbG9yOnNldHVwLmNvbG9yXG5cdFx0XHRmb250V2VpZ2h0OjUwMFxuXHRcdFx0Y29uc3RyYWludHM6XG5cdFx0XHRcdGJvdHRvbToxMlxuXHRcdFx0XHR0cmFpbGluZzo4XG5cdFx0YmFyLnJpZ2h0LnR5cGUgPSBcImJ1dHRvblwiXG5cdFx0aW9zLnV0aWxzLnNwZWNpYWxDaGFyKGJhci5yaWdodClcblx0aWYgdHlwZW9mIHNldHVwLnJpZ2h0ID09IFwib2JqZWN0XCJcblx0XHRiYXIucmlnaHQgPSBzZXR1cC5yaWdodFxuXHRcdGJhci5yaWdodC5uYW1lID0gXCIucmlnaHRcIlxuXHRcdGJhci5yaWdodC5zdXBlckxheWVyID0gYmFyLmJnXG5cdFx0YmFyLnJpZ2h0LmNvbnN0cmFpbnRzID1cblx0XHRcdHRyYWlsaW5nOjhcblx0XHRcdGJvdHRvbToxMlxuXHRcdGlvcy5sYXlvdXQuc2V0KGJhci5yaWdodClcblxuXHQjIEhhbmRsZSBMZWZ0XG5cdGlmIHR5cGVvZiBzZXR1cC5sZWZ0ID09IFwic3RyaW5nXCIgJiYgdHlwZW9mIHNldHVwLmxlZnQgIT0gXCJib29sZWFuXCJcblx0XHRzZXRMZWFkaW5nID0gOFxuXHRcdGlmIHNldHVwLmxlZnQuaW5kZXhPZihcIjxcIikgIT0gLTFcblx0XHRcdHN2ZyA9IGlvcy51dGlscy5zdmcoaW9zLmFzc2V0cy5jaGV2cm9uKVxuXHRcdFx0YmFyLmNoZXZyb24gPSBuZXcgaW9zLlZpZXdcblx0XHRcdFx0bmFtZTpcIi5jaGV2cm9uXCJcblx0XHRcdFx0d2lkdGg6c3ZnLndpZHRoXG5cdFx0XHRcdGhlaWdodDpzdmcuaGVpZ2h0XG5cdFx0XHRcdGJhY2tncm91bmRDb2xvcjpcInRyYW5zcGFyZW50XCJcblx0XHRcdFx0c3VwZXJMYXllcjpiYXIuYmdcblx0XHRcdGJhci5jaGV2cm9uLmh0bWwgPSBzdmcuc3ZnXG5cdFx0XHRiYXIuY2hldnJvbi5jb25zdHJhaW50cyA9XG5cdFx0XHRcdFx0Ym90dG9tOjlcblx0XHRcdFx0XHRsZWFkaW5nOjhcblx0XHRcdHNldHVwLmxlZnQgPSBzZXR1cC5sZWZ0LnJlcGxhY2UoXCI8XCIsIFwiXCIpXG5cdFx0XHRpb3MudXRpbHMuY2hhbmdlRmlsbChiYXIuY2hldnJvbiwgc2V0dXAuY29sb3IpXG5cdFx0XHRzZXRMZWFkaW5nID0gW2Jhci5jaGV2cm9uLCA0XVxuXHRcdFx0aW9zLmxheW91dC5zZXQoYmFyLmNoZXZyb24pXG5cblx0XHRiYXIubGVmdCA9IG5ldyBpb3MuQnV0dG9uXG5cdFx0XHRuYW1lOlwiLmxlZnRcIlxuXHRcdFx0c3VwZXJMYXllcjpiYXIuYmdcblx0XHRcdHRleHQ6c2V0dXAubGVmdFxuXHRcdFx0Y29sb3I6c2V0dXAuY29sb3Jcblx0XHRcdGZvbnRXZWlnaHQ6NTAwXG5cdFx0XHRjb25zdHJhaW50czpcblx0XHRcdFx0Ym90dG9tOjEyXG5cdFx0XHRcdGxlYWRpbmc6c2V0TGVhZGluZ1xuXHRcdGJhci5sZWZ0LnR5cGUgPSBcImJ1dHRvblwiXG5cdFx0aW9zLnV0aWxzLnNwZWNpYWxDaGFyKGJhci5sZWZ0KVxuXG5cdFx0YmFyLmxlZnQub24gRXZlbnRzLlRvdWNoU3RhcnQsIC0+XG5cdFx0XHRpZiBiYXIuY2hldnJvblxuXHRcdFx0XHRiYXIuY2hldnJvbi5hbmltYXRlXG5cdFx0XHRcdFx0cHJvcGVydGllczoob3BhY2l0eTouMjUpXG5cdFx0XHRcdFx0dGltZTouNVxuXHRcdGJhci5sZWZ0Lm9uIEV2ZW50cy5Ub3VjaEVuZCwgLT5cblx0XHRcdGlmIGJhci5jaGV2cm9uXG5cdFx0XHRcdGJhci5jaGV2cm9uLmFuaW1hdGVcblx0XHRcdFx0XHRwcm9wZXJ0aWVzOihvcGFjaXR5OjEpXG5cdFx0XHRcdFx0dGltZTouNVxuXG5cdGlmIHR5cGVvZiBzZXR1cC5sZWZ0ID09IFwib2JqZWN0XCJcblx0XHRiYXIubGVmdCA9IHNldHVwLmxlZnRcblx0XHRiYXIubGVmdC5uYW1lID0gXCIubGVmdFwiXG5cdFx0YmFyLmxlZnQuc3VwZXJMYXllciA9IGJhci5iZ1xuXHRcdGJhci5sZWZ0LmNvbnN0cmFpbnRzID1cblx0XHRcdGxlYWRpbmc6OFxuXHRcdFx0Ym90dG9tOjEyXG5cblx0aW9zLmxheW91dC5zZXQoYmFyLmxlZnQpXG5cdHJldHVybiBiYXJcbiIsImlvcyA9IHJlcXVpcmUgXCJpb3Mta2l0XCJcblxuIyBCdWlsZCBMaWJyYXJ5ICBQcm9wZXJ0aWVzXG5sYXllciA9IG5ldyBMYXllclxuZXhwb3J0cy5sYXllclByb3BzID0gT2JqZWN0LmtleXMobGF5ZXIucHJvcHMpXG5leHBvcnRzLmxheWVyUHJvcHMucHVzaCBcInN1cGVyTGF5ZXJcIlxuZXhwb3J0cy5sYXllclByb3BzLnB1c2ggXCJjb25zdHJhaW50c1wiXG5leHBvcnRzLmxheWVyU3R5bGVzID0gT2JqZWN0LmtleXMobGF5ZXIuc3R5bGUpXG5sYXllci5kZXN0cm95KClcblxuZXhwb3J0cy5hc3NldHMgPSB7XG5cdHNoZWV0VGlwOlwiPD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0nVVRGLTgnIHN0YW5kYWxvbmU9J25vJz8+XG5cdDxzdmcgd2lkdGg9JzI3cHgnIGhlaWdodD0nMTNweCcgdmlld0JveD0nMCAwIDI3IDEzJyB2ZXJzaW9uPScxLjEnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgeG1sbnM6eGxpbms9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnPlxuXHQgICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCAzOS4xICgzMTcyMCkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+XG5cdCAgICA8dGl0bGU+VHJpYW5nbGU8L3RpdGxlPlxuXHQgICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+XG5cdCAgICA8ZGVmcz48L2RlZnM+XG5cdCAgICA8ZyBpZD0naU9TLUtpdCcgc3Ryb2tlPSdub25lJyBzdHJva2Utd2lkdGg9JzEnIGZpbGw9J25vbmUnIGZpbGwtcnVsZT0nZXZlbm9kZCc+XG5cdCAgICAgICAgPGcgaWQ9J05hdmlnYXRpb24tQmFyLUNvcHknIHRyYW5zZm9ybT0ndHJhbnNsYXRlKC0yNjM0LjAwMDAwMCwgLTEyNC4wMDAwMDApJyBmaWxsPScjRkZGRkZGJz5cblx0ICAgICAgICAgICAgPHBhdGggZD0nTTI2NDQuNzE5MTYsMTI1Ljg4MzgzNCBDMjY0Ni4yNTQ5OCwxMjQuMjkxMTM2IDI2NDguNzQ1ODUsMTI0LjI5MTk5MiAyNjUwLjI4MDg0LDEyNS44ODM4MzQgTDI2NjEsMTM3IEwyNjM0LDEzNyBMMjY0NC43MTkxNiwxMjUuODgzODM0IFonIGlkPSdUcmlhbmdsZSc+PC9wYXRoPlxuXHQgICAgICAgIDwvZz5cblx0ICAgIDwvZz5cblx0PC9zdmc+XCJcblx0Ymx1ZXRvb3RoOiBcIjw/eG1sIHZlcnNpb249JzEuMCcgZW5jb2Rpbmc9J1VURi04JyBzdGFuZGFsb25lPSdubyc/PlxuXHRcdDxzdmcgd2lkdGg9JzdweCcgaGVpZ2h0PScxM3B4JyB2aWV3Qm94PScwIDAgOCAxNScgdmVyc2lvbj0nMS4xJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHhtbG5zOnhsaW5rPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJz5cblx0XHRcdDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggMy42LjEgKDI2MzEzKSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT5cblx0XHRcdDx0aXRsZT5CbHVldG9vdGg8L3RpdGxlPlxuXHRcdFx0PGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+XG5cdFx0XHQ8ZGVmcz48L2RlZnM+XG5cdFx0XHRcdDxnIGlkPSdTdGF0dXMtSWNvbnMtKFdoaXRlKScgdHJhbnNmb3JtPSd0cmFuc2xhdGUoLTEzNy4wMDAwMDAsIDAuMDAwMDAwKScgZmlsbD0nI0ZGRic+XG5cdFx0XHRcdFx0PHBhdGggZD0nTTE0MC41LDE0LjUgTDE0NSwxMC4yNSBMMTQxLjgsNy41IEwxNDUsNC43NSBMMTQwLjUsMC41IEwxNDAuNSw2LjA3MTQyODU3IEwxMzcuOCwzLjc1IEwxMzcsNC41IEwxNDAuMjU4MzMzLDcuMzc1IEwxMzcsMTAuMjUgTDEzNy44LDExIEwxNDAuNSw4LjY3ODU3MTQzIEwxNDAuNSwxNC41IFogTTE0MS41LDMgTDE0My4zNjY2NjcsNC43NSBMMTQxLjUsNi4yNSBMMTQxLjUsMyBaIE0xNDEuNSw4LjUgTDE0My4zNjY2NjcsMTAuMjUgTDE0MS41LDEyIEwxNDEuNSw4LjUgWicgaWQ9J0JsdWV0b290aCc+PC9wYXRoPlxuXHRcdFx0XHQ8L2c+XG5cdFx0PC9zdmc+XCJcblx0YmF0dGVyeUhpZ2ggOiBcIjw/eG1sIHZlcnNpb249JzEuMCcgZW5jb2Rpbmc9J1VURi04JyBzdGFuZGFsb25lPSdubyc/PlxuXHRcdDxzdmcgd2lkdGg9JzI1cHgnIGhlaWdodD0nMTBweCcgdmlld0JveD0nMCAwIDI1IDEwJyB2ZXJzaW9uPScxLjEnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgeG1sbnM6eGxpbms9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnPlxuXHRcdCAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDMuNy4yICgyODI3NikgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+XG5cdFx0ICAgIDx0aXRsZT5CYXR0ZXJ5PC90aXRsZT5cblx0XHQgICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+XG5cdFx0ICAgIDxkZWZzPjwvZGVmcz5cblx0XHQgICAgPGcgaWQ9J1N5bWJvbHMnIHN0cm9rZT0nbm9uZScgc3Ryb2tlLXdpZHRoPScxJyBmaWxsPSdub25lJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnPlxuXHRcdCAgICAgICAgPGcgaWQ9J1N0YXR1cy1CYXIvQmxhY2svMTAwJScgdHJhbnNmb3JtPSd0cmFuc2xhdGUoLTM0NS4wMDAwMDAsIC01LjAwMDAwMCknIGZpbGw9JyMwMzAzMDMnPlxuXHRcdCAgICAgICAgICAgIDxwYXRoIGQ9J00zNDYuNDkzNzEzLDUuNSBDMzQ1LjY2ODc1OCw1LjUgMzQ1LDYuMTY4MDIxNTUgMzQ1LDcuMDA1MzAzMjQgTDM0NSwxMy40OTQ2OTY4IEMzNDUsMTQuMzI2MDUyOCAzNDUuNjczMzgsMTUgMzQ2LjQ5MzcxMywxNSBMMzY2LjAwNjI4NywxNSBDMzY2LjgzMTI0MiwxNSAzNjcuNSwxNC4zMzE5Nzg0IDM2Ny41LDEzLjQ5NDY5NjggTDM2Ny41LDcuMDA1MzAzMjQgQzM2Ny41LDYuMTczOTQ3MjIgMzY2LjgyNjYyLDUuNSAzNjYuMDA2Mjg3LDUuNSBMMzQ2LjQ5MzcxMyw1LjUgWiBNMzY4LDguNSBMMzY4LDEyIEwzNjguNzUsMTIgQzM2OS4xNjQyMTQsMTIgMzY5LjUsMTEuNjY0NDA1MyAzNjkuNSwxMS4yNTc3NCBMMzY5LjUsOS4yNDIyNTk5OCBDMzY5LjUsOC44MzIzMjExMSAzNjkuMTY3MTAxLDguNSAzNjguNzUsOC41IEwzNjgsOC41IFogTTM0Ni41MDgxNTIsNiBDMzQ1Ljk1MTM2NSw2IDM0NS41LDYuNDU2OTk2OTIgMzQ1LjUsNy4wMDg0NDA1NSBMMzQ1LjUsMTMuNDkxNTU5NCBDMzQ1LjUsMTQuMDQ4NTA1OCAzNDUuOTQ5MDU4LDE0LjUgMzQ2LjUwODE1MiwxNC41IEwzNjUuOTkxODQ4LDE0LjUgQzM2Ni41NDg2MzUsMTQuNSAzNjcsMTQuMDQzMDAzMSAzNjcsMTMuNDkxNTU5NCBMMzY3LDcuMDA4NDQwNTUgQzM2Nyw2LjQ1MTQ5NDIyIDM2Ni41NTA5NDIsNiAzNjUuOTkxODQ4LDYgTDM0Ni41MDgxNTIsNiBaIE0zNDYuNTA2NzQ0LDYuNSBDMzQ2LjIyNjg3Nyw2LjUgMzQ2LDYuNzE2MzcyMDEgMzQ2LDYuOTkyMDk1OTUgTDM0NiwxMy41MDc5MDQxIEMzNDYsMTMuNzc5NjgxMSAzNDYuMjMwMjI1LDE0IDM0Ni41MDY3NDQsMTQgTDM2NS45OTMyNTYsMTQgQzM2Ni4yNzMxMjMsMTQgMzY2LjUsMTMuNzgzNjI4IDM2Ni41LDEzLjUwNzkwNDEgTDM2Ni41LDYuOTkyMDk1OTUgQzM2Ni41LDYuNzIwMzE4ODYgMzY2LjI2OTc3NSw2LjUgMzY1Ljk5MzI1Niw2LjUgTDM0Ni41MDY3NDQsNi41IFonIGlkPSdCYXR0ZXJ5Jz48L3BhdGg+XG5cdFx0ICAgICAgICA8L2c+XG5cdFx0ICAgIDwvZz5cblx0XHQ8L3N2Zz5cIlxuXHRiYXR0ZXJ5TWlkIDogXCI8P3htbCB2ZXJzaW9uPScxLjAnIGVuY29kaW5nPSdVVEYtOCcgc3RhbmRhbG9uZT0nbm8nPz5cblx0XHQ8c3ZnIHdpZHRoPScyNXB4JyBoZWlnaHQ9JzEwcHgnIHZpZXdCb3g9JzAgMCAyNSAxMCcgdmVyc2lvbj0nMS4xJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHhtbG5zOnhsaW5rPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJz5cblx0XHQgICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCAzLjcuMiAoMjgyNzYpIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPlxuXHRcdCAgICA8dGl0bGU+QmF0dGVyeTwvdGl0bGU+XG5cdFx0ICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPlxuXHRcdCAgICA8ZGVmcz48L2RlZnM+XG5cdFx0ICAgIDxnIGlkPSdTeW1ib2xzJyBzdHJva2U9J25vbmUnIHN0cm9rZS13aWR0aD0nMScgZmlsbD0nbm9uZScgZmlsbC1ydWxlPSdldmVub2RkJz5cblx0XHQgICAgICAgIDxnIGlkPSdTdGF0dXMtQmFyL0JsYWNrL0xvdy1Qb3dlcicgdHJhbnNmb3JtPSd0cmFuc2xhdGUoLTM0NS4wMDAwMDAsIC01LjAwMDAwMCknIGZpbGw9JyMwMzAzMDMnPlxuXHRcdCAgICAgICAgICAgIDxwYXRoIGQ9J00zNDYuNDkzNzEzLDUuNSBDMzQ1LjY2ODc1OCw1LjUgMzQ1LDYuMTY4MDIxNTUgMzQ1LDcuMDA1MzAzMjQgTDM0NSwxMy40OTQ2OTY4IEMzNDUsMTQuMzI2MDUyOCAzNDUuNjczMzgsMTUgMzQ2LjQ5MzcxMywxNSBMMzY2LjAwNjI4NywxNSBDMzY2LjgzMTI0MiwxNSAzNjcuNSwxNC4zMzE5Nzg0IDM2Ny41LDEzLjQ5NDY5NjggTDM2Ny41LDcuMDA1MzAzMjQgQzM2Ny41LDYuMTczOTQ3MjIgMzY2LjgyNjYyLDUuNSAzNjYuMDA2Mjg3LDUuNSBMMzQ2LjQ5MzcxMyw1LjUgWiBNMzY4LDguNSBMMzY4LDEyIEwzNjguNzUsMTIgQzM2OS4xNjQyMTQsMTIgMzY5LjUsMTEuNjY0NDA1MyAzNjkuNSwxMS4yNTc3NCBMMzY5LjUsOS4yNDIyNTk5OCBDMzY5LjUsOC44MzIzMjExMSAzNjkuMTY3MTAxLDguNSAzNjguNzUsOC41IEwzNjgsOC41IFogTTM0Ni41MDgxNTIsNiBDMzQ1Ljk1MTM2NSw2IDM0NS41LDYuNDU2OTk2OTIgMzQ1LjUsNy4wMDg0NDA1NSBMMzQ1LjUsMTMuNDkxNTU5NCBDMzQ1LjUsMTQuMDQ4NTA1OCAzNDUuOTQ5MDU4LDE0LjUgMzQ2LjUwODE1MiwxNC41IEwzNjUuOTkxODQ4LDE0LjUgQzM2Ni41NDg2MzUsMTQuNSAzNjcsMTQuMDQzMDAzMSAzNjcsMTMuNDkxNTU5NCBMMzY3LDcuMDA4NDQwNTUgQzM2Nyw2LjQ1MTQ5NDIyIDM2Ni41NTA5NDIsNiAzNjUuOTkxODQ4LDYgTDM0Ni41MDgxNTIsNiBaIE0zNDYuNTA5NjUsNi41IEMzNDYuMjI4MTc4LDYuNSAzNDYsNi43MTYzNzIwMSAzNDYsNi45OTIwOTU5NSBMMzQ2LDEzLjUwNzkwNDEgQzM0NiwxMy43Nzk2ODExIDM0Ni4yMjc2NTMsMTQgMzQ2LjUwOTY1LDE0IEwzNTYsMTQgTDM1Niw2LjUgTDM0Ni41MDk2NSw2LjUgWicgaWQ9J0JhdHRlcnknPjwvcGF0aD5cblx0XHQgICAgICAgIDwvZz5cblx0XHQgICAgPC9nPlxuXHRcdDwvc3ZnPlwiXG5cdGJhdHRlcnlMb3cgOiBcIjw/eG1sIHZlcnNpb249JzEuMCcgZW5jb2Rpbmc9J1VURi04JyBzdGFuZGFsb25lPSdubyc/PlxuXHRcdDxzdmcgd2lkdGg9JzI1cHgnIGhlaWdodD0nMTBweCcgdmlld0JveD0nMCAwIDI1IDEwJyB2ZXJzaW9uPScxLjEnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgeG1sbnM6eGxpbms9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnPlxuXHRcdCAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDMuNy4yICgyODI3NikgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+XG5cdFx0ICAgIDx0aXRsZT5CYXR0ZXJ5PC90aXRsZT5cblx0XHQgICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+XG5cdFx0ICAgIDxkZWZzPjwvZGVmcz5cblx0XHQgICAgPGcgaWQ9J1N5bWJvbHMnIHN0cm9rZT0nbm9uZScgc3Ryb2tlLXdpZHRoPScxJyBmaWxsPSdub25lJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnPlxuXHRcdCAgICAgICAgPGcgaWQ9J1N0YXR1cy1CYXIvQmxhY2svMjAlJyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSgtMzQ1LjAwMDAwMCwgLTUuMDAwMDAwKScgZmlsbD0nIzAzMDMwMyc+XG5cdFx0ICAgICAgICAgICAgPHBhdGggZD0nTTM0Ni40OTM3MTMsNS41IEMzNDUuNjY4NzU4LDUuNSAzNDUsNi4xNjgwMjE1NSAzNDUsNy4wMDUzMDMyNCBMMzQ1LDEzLjQ5NDY5NjggQzM0NSwxNC4zMjYwNTI4IDM0NS42NzMzOCwxNSAzNDYuNDkzNzEzLDE1IEwzNjYuMDA2Mjg3LDE1IEMzNjYuODMxMjQyLDE1IDM2Ny41LDE0LjMzMTk3ODQgMzY3LjUsMTMuNDk0Njk2OCBMMzY3LjUsNy4wMDUzMDMyNCBDMzY3LjUsNi4xNzM5NDcyMiAzNjYuODI2NjIsNS41IDM2Ni4wMDYyODcsNS41IEwzNDYuNDkzNzEzLDUuNSBMMzQ2LjQ5MzcxMyw1LjUgWiBNMzY4LDguNSBMMzY4LDEyIEwzNjguNzUsMTIgQzM2OS4xNjQyMTQsMTIgMzY5LjUsMTEuNjY0NDA1MyAzNjkuNSwxMS4yNTc3NCBMMzY5LjUsOS4yNDIyNTk5OCBDMzY5LjUsOC44MzIzMjExMSAzNjkuMTY3MTAxLDguNSAzNjguNzUsOC41IEwzNjgsOC41IEwzNjgsOC41IFogTTM0Ni41MDgxNTIsNiBDMzQ1Ljk1MTM2NSw2IDM0NS41LDYuNDU2OTk2OTIgMzQ1LjUsNy4wMDg0NDA1NSBMMzQ1LjUsMTMuNDkxNTU5NCBDMzQ1LjUsMTQuMDQ4NTA1OCAzNDUuOTQ5MDU4LDE0LjUgMzQ2LjUwODE1MiwxNC41IEwzNjUuOTkxODQ4LDE0LjUgQzM2Ni41NDg2MzUsMTQuNSAzNjcsMTQuMDQzMDAzMSAzNjcsMTMuNDkxNTU5NCBMMzY3LDcuMDA4NDQwNTUgQzM2Nyw2LjQ1MTQ5NDIyIDM2Ni41NTA5NDIsNiAzNjUuOTkxODQ4LDYgTDM0Ni41MDgxNTIsNiBaIE0zNDYuNDkwNDc5LDYuNSBDMzQ2LjIxOTU5NSw2LjUgMzQ2LDYuNzE2MzcyMDEgMzQ2LDYuOTkyMDk1OTUgTDM0NiwxMy41MDc5MDQxIEMzNDYsMTMuNzc5NjgxMSAzNDYuMjE1MDU3LDE0IDM0Ni40OTA0NzksMTQgTDM1MCwxNCBMMzUwLDYuNSBMMzQ2LjQ5MDQ3OSw2LjUgWicgaWQ9J0JhdHRlcnknPjwvcGF0aD5cblx0XHQgICAgICAgIDwvZz5cblx0XHQgICAgPC9nPlxuXHRcdDwvc3ZnPlwiXG5cdGJhbm5lckJHIDoge1xuXHRcdFwiaXBob25lLTVcIjogXCI8P3htbCB2ZXJzaW9uPScxLjAnIGVuY29kaW5nPSdVVEYtOCcgc3RhbmRhbG9uZT0nbm8nPz5cblx0XHRcdDxzdmcgd2lkdGg9JzMyMHB4JyBoZWlnaHQ9JzY4cHgnIHZpZXdCb3g9JzAgMCAzMjAgNjgnIHZlcnNpb249JzEuMScgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB4bWxuczp4bGluaz0naHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayc+XG5cdFx0XHQgICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCAzLjYuMSAoMjYzMTMpIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPlxuXHRcdFx0ICAgIDx0aXRsZT5pcGhvbmU1PC90aXRsZT5cblx0XHRcdCAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz5cblx0XHRcdCAgICA8ZGVmcz48L2RlZnM+XG5cdFx0XHQgICAgPGcgaWQ9J1BhZ2UtMScgc3Ryb2tlPSdub25lJyBzdHJva2Utd2lkdGg9JzEnIGZpbGw9J25vbmUnIGZpbGwtcnVsZT0nZXZlbm9kZCcgZmlsbC1vcGFjaXR5PScwLjknPlxuXHRcdFx0ICAgICAgICA8ZyBpZD0naVBob25lLTUvNVMvNUMnIGZpbGw9JyMxQTFBMUMnPlxuXHRcdFx0ICAgICAgICAgICAgPHBhdGggZD0nTTAsMCBMMzIwLDAgTDMyMCw2OCBMMCw2OCBMMCwwIFogTTE0Miw2MS4wMDQ4ODE1IEMxNDIsNTkuODk3NjE2IDE0Mi44OTYyNzksNTkgMTQ0LjAwMjQsNTkgTDE3Ni45OTc2LDU5IEMxNzguMTAzNDk1LDU5IDE3OSw1OS44OTM4OTk4IDE3OSw2MS4wMDQ4ODE1IEwxNzksNjEuOTk1MTE4NSBDMTc5LDYzLjEwMjM4NCAxNzguMTAzNzIxLDY0IDE3Ni45OTc2LDY0IEwxNDQuMDAyNCw2NCBDMTQyLjg5NjUwNSw2NCAxNDIsNjMuMTA2MTAwMiAxNDIsNjEuOTk1MTE4NSBMMTQyLDYxLjAwNDg4MTUgWicgaWQ9J2lwaG9uZTUnPjwvcGF0aD5cblx0XHRcdCAgICAgICAgPC9nPlxuXHRcdFx0ICAgIDwvZz5cblx0XHRcdDwvc3ZnPlwiXG5cdFx0XCJpcGhvbmUtNnNcIjogXCI8P3htbCB2ZXJzaW9uPScxLjAnIGVuY29kaW5nPSdVVEYtOCcgc3RhbmRhbG9uZT0nbm8nPz5cblx0XHRcdFx0PHN2ZyB3aWR0aD0nMzc1cHgnIGhlaWdodD0nNjhweCcgdmlld0JveD0nMCAwIDM3NSA2OCcgdmVyc2lvbj0nMS4xJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHhtbG5zOnhsaW5rPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJz5cblx0XHRcdFx0XHQ8IS0tIEdlbmVyYXRvcjogU2tldGNoIDMuNiAoMjYzMDQpIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPlxuXHRcdFx0XHRcdDx0aXRsZT5Ob3RpZmljYXRpb24gYmFja2dyb3VuZDwvdGl0bGU+XG5cdFx0XHRcdFx0PGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+XG5cdFx0XHRcdFx0PGRlZnM+PC9kZWZzPlxuXHRcdFx0XHRcdDxnIGlkPSdQYWdlLTEnIHN0cm9rZT0nbm9uZScgc3Ryb2tlLXdpZHRoPScxJyBmaWxsPSdub25lJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnIGZpbGwtb3BhY2l0eT0nMC45Jz5cblx0XHRcdFx0XHRcdDxnIGlkPSdpT1M4LVB1c2gtTm90aWZpY2F0aW9uJyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSgtNTguMDAwMDAwLCAtMjMuMDAwMDAwKScgZmlsbD0nIzFBMUExQyc+XG5cdFx0XHRcdFx0XHRcdDxnIHRyYW5zZm9ybT0ndHJhbnNsYXRlKDU4LjAwMDAwMCwgNy4wMDAwMDApJyBpZD0nTm90aWZpY2F0aW9uLWNvbnRhaW5lcic+XG5cdFx0XHRcdFx0XHRcdFx0PGc+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8cGF0aCBkPSdNMCwxNiBMMzc1LDE2IEwzNzUsODQgTDAsODQgTDAsMTYgWiBNMTY5LDc3LjAwNDg4MTUgQzE2OSw3NS44OTc2MTYgMTY5Ljg5NjI3OSw3NSAxNzEuMDAyNCw3NSBMMjAzLjk5NzYsNzUgQzIwNS4xMDM0OTUsNzUgMjA2LDc1Ljg5Mzg5OTggMjA2LDc3LjAwNDg4MTUgTDIwNiw3Ny45OTUxMTg1IEMyMDYsNzkuMTAyMzg0IDIwNS4xMDM3MjEsODAgMjAzLjk5NzYsODAgTDE3MS4wMDI0LDgwIEMxNjkuODk2NTA1LDgwIDE2OSw3OS4xMDYxMDAyIDE2OSw3Ny45OTUxMTg1IEwxNjksNzcuMDA0ODgxNSBaJyBpZD0nTm90aWZpY2F0aW9uLWJhY2tncm91bmQnPjwvcGF0aD5cblx0XHRcdFx0XHRcdFx0XHQ8L2c+XG5cdFx0XHRcdFx0XHRcdDwvZz5cblx0XHRcdFx0XHRcdDwvZz5cblx0XHRcdFx0XHQ8L2c+XG5cdFx0XHRcdDwvc3ZnPlwiXG5cdFx0XCJpcGhvbmUtNnMtcGx1c1wiIDogXCI8P3htbCB2ZXJzaW9uPScxLjAnIGVuY29kaW5nPSdVVEYtOCcgc3RhbmRhbG9uZT0nbm8nPz5cblx0XHRcdFx0PHN2ZyB3aWR0aD0nNDE0cHgnIGhlaWdodD0nNjhweCcgdmlld0JveD0nMCAwIDQxNCA2OCcgdmVyc2lvbj0nMS4xJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHhtbG5zOnhsaW5rPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJz5cblx0XHRcdFx0PCEtLSBHZW5lcmF0b3I6IFNrZXRjaCAzLjYgKDI2MzA0KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT5cblx0XHRcdFx0PHRpdGxlPk5vdGlmaWNhdGlvbiBiYWNrZ3JvdW5kIENvcHk8L3RpdGxlPlxuXHRcdFx0XHQ8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz5cblx0XHRcdFx0PGRlZnM+PC9kZWZzPlxuXHRcdFx0XHQ8ZyBpZD0nUGFnZS0xJyBzdHJva2U9J25vbmUnIHN0cm9rZS13aWR0aD0nMScgZmlsbD0nbm9uZScgZmlsbC1ydWxlPSdldmVub2RkJyBmaWxsLW9wYWNpdHk9JzAuOSc+XG5cdFx0XHRcdFx0PGcgaWQ9J2lPUzgtUHVzaC1Ob3RpZmljYXRpb24nIHRyYW5zZm9ybT0ndHJhbnNsYXRlKC00My4wMDAwMDAsIC03NC4wMDAwMDApJyBmaWxsPScjMUExQTFDJz5cblx0XHRcdFx0XHRcdDxnIHRyYW5zZm9ybT0ndHJhbnNsYXRlKDQzLjAwMDAwMCwgNzQuMDAwMDAwKScgaWQ9J05vdGlmaWNhdGlvbi1jb250YWluZXInPlxuXHRcdFx0XHRcdFx0XHQ8Zz5cblx0XHRcdFx0XHRcdFx0XHQ8cGF0aCBkPSdNMCwwIEw0MTQsMCBMNDE0LDY4IEwwLDY4IEwwLDAgWiBNMTg5LDYxLjAwNDg4MTUgQzE4OSw1OS44OTc2MTYgMTg5Ljg5NjI3OSw1OSAxOTEuMDAyNCw1OSBMMjIzLjk5NzYsNTkgQzIyNS4xMDM0OTUsNTkgMjI2LDU5Ljg5Mzg5OTggMjI2LDYxLjAwNDg4MTUgTDIyNiw2MS45OTUxMTg1IEMyMjYsNjMuMTAyMzg0IDIyNS4xMDM3MjEsNjQgMjIzLjk5NzYsNjQgTDE5MS4wMDI0LDY0IEMxODkuODk2NTA1LDY0IDE4OSw2My4xMDYxMDAyIDE4OSw2MS45OTUxMTg1IEwxODksNjEuMDA0ODgxNSBaJyBpZD0nTm90aWZpY2F0aW9uLWJhY2tncm91bmQtQ29weSc+PC9wYXRoPlxuXHRcdFx0XHRcdFx0XHQ8L2c+XG5cdFx0XHRcdFx0XHQ8L2c+XG5cdFx0XHRcdFx0PC9nPlxuXHRcdFx0XHQ8L2c+XG5cdFx0XHQ8L3N2Zz5cIlxuXHRcdFwiaXBhZFwiIDogXCI8P3htbCB2ZXJzaW9uPScxLjAnIGVuY29kaW5nPSdVVEYtOCcgc3RhbmRhbG9uZT0nbm8nPz5cblx0XHRcdFx0PHN2ZyB3aWR0aD0nNzY4cHgnIGhlaWdodD0nNjhweCcgdmlld0JveD0nMCAwIDc2OCA2OCcgdmVyc2lvbj0nMS4xJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHhtbG5zOnhsaW5rPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJz5cblx0XHRcdFx0ICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggMy42LjEgKDI2MzEzKSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT5cblx0XHRcdFx0ICAgIDx0aXRsZT5pcGFkLXBvcnRyYWl0PC90aXRsZT5cblx0XHRcdFx0ICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPlxuXHRcdFx0XHQgICAgPGRlZnM+PC9kZWZzPlxuXHRcdFx0XHQgICAgPGcgaWQ9J1BhZ2UtMScgc3Ryb2tlPSdub25lJyBzdHJva2Utd2lkdGg9JzEnIGZpbGw9J25vbmUnIGZpbGwtcnVsZT0nZXZlbm9kZCcgZmlsbC1vcGFjaXR5PScwLjknPlxuXHRcdFx0XHQgICAgICAgIDxnIGlkPSdpUGFkLVBvcnRyYWl0JyBmaWxsPScjMUExQTFDJz5cblx0XHRcdFx0ICAgICAgICAgICAgPHBhdGggZD0nTTAsMCBMNzY4LDAgTDc2OCw2OCBMMCw2OCBMMCwwIFogTTM2Niw2MS4wMDQ4ODE1IEMzNjYsNTkuODk3NjE2IDM2Ni44OTYyNzksNTkgMzY4LjAwMjQsNTkgTDQwMC45OTc2LDU5IEM0MDIuMTAzNDk1LDU5IDQwMyw1OS44OTM4OTk4IDQwMyw2MS4wMDQ4ODE1IEw0MDMsNjEuOTk1MTE4NSBDNDAzLDYzLjEwMjM4NCA0MDIuMTAzNzIxLDY0IDQwMC45OTc2LDY0IEwzNjguMDAyNCw2NCBDMzY2Ljg5NjUwNSw2NCAzNjYsNjMuMTA2MTAwMiAzNjYsNjEuOTk1MTE4NSBMMzY2LDYxLjAwNDg4MTUgWicgaWQ9J2lwYWQtcG9ydHJhaXQnPjwvcGF0aD5cblx0XHRcdFx0ICAgICAgICA8L2c+XG5cdFx0XHRcdCAgICA8L2c+XG5cdFx0XHRcdDwvc3ZnPlwiXG5cdFx0XCJpcGFkLXByb1wiIDogXCI8P3htbCB2ZXJzaW9uPScxLjAnIGVuY29kaW5nPSdVVEYtOCcgc3RhbmRhbG9uZT0nbm8nPz5cblx0XHRcdFx0PHN2ZyB3aWR0aD0nMTAyNHB4JyBoZWlnaHQ9JzY4cHgnIHZpZXdCb3g9JzAgMCAxMDI0IDY4JyB2ZXJzaW9uPScxLjEnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgeG1sbnM6eGxpbms9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnPlxuXHRcdFx0XHQgICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCAzLjYuMSAoMjYzMTMpIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPlxuXHRcdFx0XHQgICAgPHRpdGxlPmlwYWQtcHJvLXBvcnRyYWl0PC90aXRsZT5cblx0XHRcdFx0ICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPlxuXHRcdFx0XHQgICAgPGRlZnM+PC9kZWZzPlxuXHRcdFx0XHQgICAgPGcgaWQ9J1BhZ2UtMScgc3Ryb2tlPSdub25lJyBzdHJva2Utd2lkdGg9JzEnIGZpbGw9J25vbmUnIGZpbGwtcnVsZT0nZXZlbm9kZCcgZmlsbC1vcGFjaXR5PScwLjknPlxuXHRcdFx0XHQgICAgICAgIDxnIGlkPSdpUGFkLVByby1Qb3J0cmFpdCcgZmlsbD0nIzFBMUExQyc+XG5cdFx0XHRcdCAgICAgICAgICAgIDxwYXRoIGQ9J00wLDAgTDEwMjQsMCBMMTAyNCw2OCBMMCw2OCBMMCwwIFogTTQ5NCw2MS4wMDQ4ODE1IEM0OTQsNTkuODk3NjE2IDQ5NC44OTYyNzksNTkgNDk2LjAwMjQsNTkgTDUyOC45OTc2LDU5IEM1MzAuMTAzNDk1LDU5IDUzMSw1OS44OTM4OTk4IDUzMSw2MS4wMDQ4ODE1IEw1MzEsNjEuOTk1MTE4NSBDNTMxLDYzLjEwMjM4NCA1MzAuMTAzNzIxLDY0IDUyOC45OTc2LDY0IEw0OTYuMDAyNCw2NCBDNDk0Ljg5NjUwNSw2NCA0OTQsNjMuMTA2MTAwMiA0OTQsNjEuOTk1MTE4NSBMNDk0LDYxLjAwNDg4MTUgWicgaWQ9J2lwYWQtcHJvLXBvcnRyYWl0Jz48L3BhdGg+XG5cdFx0XHRcdCAgICAgICAgPC9nPlxuXHRcdFx0XHQgICAgPC9nPlxuXHRcdFx0XHQ8L3N2Zz5cIlxuXHR9XG5cdGVtb2ppQ29kZXM6IFtcIjk4IDgwXCIsIFwiOTggQUNcIiwgXCI5OCA4MVwiLCBcIjk4IDgyXCIsIFwiOTggODNcIiwgXCI5OCA4NFwiLCBcIjk4IDg1XCIsIFwiOTggODZcIiwgXCI5OCA4N1wiLCBcIjk4IDg5XCIsIFwiOTggOGFcIiwgXCI5OSA4MlwiLCBcIjk5IDgzXCIsIFwiRTIgOTggQkEgRUYgQjggOEZcIiwgXCI5OCA4QlwiICwgXCI5OCA4Q1wiLCBcIjk4IDhEXCIsIFwiOTggOThcIiwgXCI5OCA5N1wiLCBcIjk4IDk5XCIsIFwiOTggOUFcIiwgXCI5OCA5Q1wiLCBcIjk4IDlEXCIsIFwiOTggOUJcIiwgXCJBNCA5MVwiLCBcIkE0IDkzXCIsIFwiOTggOEVcIiwgXCJBNCA5N1wiLCBcIjk4IDhGXCIsIFwiOTggQjZcIiwgXCI5OCA5MFwiLCBcIjk4IDkxXCIsIFwiOTggOTJcIiwgXCI5OSA4NFwiLCBcIkE0IDk0XCIsIFwiOTggQjNcIiwgXCI5OCA5RVwiLCBcIjk4IDlGXCIsIFwiOTggQTBcIiwgXCI5OCBBMVwiLCBcIjk4IDk0XCIsIFwiOTggOTVcIiwgXCI5OSA4MVwiLCBcIkUyIDk4IEI5IEVGIEI4IDhGXCIsIFwiOTggQTNcIiwgXCI5OCA5NlwiLCBcIjk4IEFCXCIsIFwiOTggQTlcIiwgXCI5OCBBNFwiLCBcIjk4IEFFXCIsIFwiOTggQjFcIiwgXCI5OCBBOFwiLCBcIjk4IEIwXCIsIFwiOTggQUZcIiwgXCI5OCBBNlwiLCBcIjk4IEE3XCIsIFwiOTggQTJcIiwgXCI5OCBBNVwiLCBcIjk4IEFBXCIsIFwiOTggOTNcIiwgXCI5OCBBRFwiLCBcIjk4IEI1XCIsIFwiOTggQjJcIiwgXCJBNCA5MFwiLCBcIjk4IEI3XCIsIFwiQTQgOTJcIiwgXCJBNCA5NVwiLCBcIjk4IEI0XCIsIFwiOTIgQTRcIiwgXCI5MiBBOVwiLCBcIjk4IDg4XCIsIFwiOTEgQkZcIiwgXCI5MSBCOVwiLCBcIjkxIEJBXCIsIFwiOTIgODBcIiwgXCI5MSBCQlwiLCBcIjkxIEJEXCIsIFwiQTQgOTZcIiwgXCI5OCBCQVwiLCBcIjk4IEI4XCIsIFwiOTggQjlcIiwgXCI5OCBCQlwiLCBcIjk4IEJDXCIsIFwiOTggQkRcIiwgXCI5OSA4MFwiLCBcIjk4IEJGXCIsIFwiOTggQkVcIiwgXCI5OSA4Q1wiLCBcIjkxIDhGXCIsIFwiOTEgOEJcIiwgXCI5MSA4RFwiLCBcIjkxIDhFXCIsIFwiOTEgOEFcIiwgXCJFMiA5QyA4QVwiLCBcIkUyIDlDIDhDIEVGIEI4IDhGXCIsIFwiOTEgOENcIiwgXCJFMiA5QyA4QlwiLCBcIjkxIDkwXCIsIFwiOTIgQUFcIiwgXCI5OSA4RlwiLCBcIkUyIDk4IDlEIEVGIEI4IDhGXCIsIFwiOTEgODZcIiwgXCI5MSA4N1wiLCBcIjkxIDg4XCIsIFwiOTEgODlcIiwgXCI5NiA5NVwiLCBcIjk2IDkwXCIsIFwiQTQgOThcIiwgXCI5NiA5NlwiLCBcIkUyIDlDIDhEIEVGIEI4IDhGXCIsIFwiOTIgODVcIiwgXCI5MSA4NFwiLCBcIjkxIDg1XCIsIFwiOTEgODJcIiwgXCI5MSA4M1wiLCBcIjkxIDgxXCIsIFwiOTEgODBcIiwgXCI5MSBBNFwiLCBcIjkxIEE1XCIsIFwiOTcgQTNcIiwgXCI5MSBCNlwiLCBcIjkxIEE2XCIsIFwiOTEgQTdcIiwgXCI5MSBBOFwiLCBcIjkxIEE5XCIsIFwiOTEgQjFcIiwgXCI5MSBCNFwiLCBcIjkxIEI1XCIsIFwiOTEgQjJcIiwgXCI5MSBCM1wiLCBcIjkxIEFFXCIsIFwiOTEgQjdcIiwgXCI5MiA4MlwiLCBcIjk1IEI1XCIsIFwiOEUgODVcIiwgXCI5MSBCQ1wiLCBcIjkxIEI4XCIsIFwiOTEgQjBcIiwgXCI5QSBCNlwiLCBcIjhGIDgzXCIsIFwiOTIgODNcIiwgXCI5MSBBRlwiLCBcIjkxIEFCXCIsIFwiOTEgQUNcIiwgXCI5MSBBRFwiLCBcIjk5IDg3XCIsIFwiOTIgODFcIiwgXCI5OSA4NVwiLCBcIjk5IDg2XCIsIFwiOTkgOEJcIiwgXCI5OSA4RVwiLCBcIjk5IDhEXCIsIFwiOTIgODdcIiwgXCI5MiA4NlwiLCBcIjkyIDkxXCIsIFwiOTEgQTkgRTIgODAgOEQgRTIgOUQgQTQgRUYgQjggOEYgRTIgODAgOEQgRjAgOUYgOTEgQTlcIiwgXCI5MSBBOCBFMiA4MCA4RCBFMiA5RCBBNCBFRiBCOCA4RiBFMiA4MCA4RCBGMCA5RiA5MSBBOFwiLCBcIjkyIDhGXCIsIFwiOTEgQTkgRTIgODAgOEQgRTIgOUQgQTQgRUYgQjggOEYgRTIgODAgOEQgRjAgOUYgOTIgOEIgRTIgODAgOEQgRjAgOUYgOTEgQTlcIiwgXCI5MSBBOCBFMiA4MCA4RCBFMiA5RCBBNCBFRiBCOCA4RiBFMiA4MCA4RCBGMCA5RiA5MiA4QiBFMiA4MCA4RCBGMCA5RiA5MSBBOFwiLCBcIjkxIEFBXCIsIFwiOTEgQTggRTIgODAgOEQgRjAgOUYgOTEgQTkgRTIgODAgOEQgRjAgOUYgOTEgQTdcIiwgXCI5MSBBOCBFMiA4MCA4RCBGMCA5RiA5MSBBOSBFMiA4MCA4RCBGMCA5RiA5MSBBNyBFMiA4MCA4RCBGMCA5RiA5MSBBNlwiLCBcIjkxIEE4IEUyIDgwIDhEIEYwIDlGIDkxIEE5IEUyIDgwIDhEIEYwIDlGIDkxIEE2IEUyIDgwIDhEIEYwIDlGIDkxIEE2XCIsIFwiOTEgQTggRTIgODAgOEQgRjAgOUYgOTEgQTkgRTIgODAgOEQgRjAgOUYgOTEgQTcgRTIgODAgOEQgRjAgOUYgOTEgQTdcIiwgXCI5MSBBOSBFMiA4MCA4RCBGMCA5RiA5MSBBOSBFMiA4MCA4RCBGMCA5RiA5MSBBNlwiLCBcIjkxIEE5IEUyIDgwIDhEIEYwIDlGIDkxIEE5IEUyIDgwIDhEIEYwIDlGIDkxIEE3XCIsIFwiOTEgQTkgRTIgODAgOEQgRjAgOUYgOTEgQTkgRTIgODAgOEQgRjAgOUYgOTEgQTcgRTIgODAgOEQgRjAgOUYgOTEgQTZcIiwgXCI5MSBBOSBFMiA4MCA4RCBGMCA5RiA5MSBBOSBFMiA4MCA4RCBGMCA5RiA5MSBBNiBFMiA4MCA4RCBGMCA5RiA5MSBBNlwiLCBcIjkxIEE5IEUyIDgwIDhEIEYwIDlGIDkxIEE5IEUyIDgwIDhEIEYwIDlGIDkxIEE3IEUyIDgwIDhEIEYwIDlGIDkxIEE3XCIsIFwiOTEgQTggRTIgODAgOEQgRjAgOUYgOTEgQTggRTIgODAgOEQgRjAgOUYgOTEgQTZcIiwgXCI5MSBBOCBFMiA4MCA4RCBGMCA5RiA5MSBBOCBFMiA4MCA4RCBGMCA5RiA5MSBBN1wiLCBcIjkxIEE4IEUyIDgwIDhEIEYwIDlGIDkxIEE4IEUyIDgwIDhEIEYwIDlGIDkxIEE3IEUyIDgwIDhEIEYwIDlGIDkxIEE2XCIsIFwiOTEgQTggRTIgODAgOEQgRjAgOUYgOTEgQTggRTIgODAgOEQgRjAgOUYgOTEgQTYgRTIgODAgOEQgRjAgOUYgOTEgQTZcIiwgXCI5MSBBOCBFMiA4MCA4RCBGMCA5RiA5MSBBOCBFMiA4MCA4RCBGMCA5RiA5MSBBNyBFMiA4MCA4RCBGMCA5RiA5MSBBN1wiLCBcIjkxIDlBXCIsIFwiOTEgOTVcIiwgXCI5MSA5NlwiLCBcIjkxIDk0XCIsIFwiOTEgOTdcIiwgXCI5MSA5OVwiLCBcIjkxIDk4XCIsIFwiOTIgODRcIiwgXCI5MiA4QlwiLCBcIjkxIEEzXCIsIFwiOTEgQTBcIiwgXCI5MSBBMVwiLCBcIjkxIEEyXCIsIFwiOTEgOUVcIiwgXCI5MSA5RlwiLCBcIjkxIDkyXCIsIFwiOEUgQTlcIiwgXCJFMiA5QiA5MVwiLCBcIjhFIDkzXCIsIFwiOTEgOTFcIiwgXCI4RSA5MlwiLCBcIjkxIDlEXCIsIFwiOTEgOUJcIiwgXCI5MSA5Q1wiLCBcIjkyIEJDXCIsIFwiOTEgOTNcIiwgXCI5NSBCNlwiLCBcIjkyIDhEXCIsIFwiOEMgODJcIiwgXCI5QiA5MVwiLCBcIjkwIEI2XCIsIFwiOTAgQjFcIiwgXCI5MCBBRFwiLCBcIjkwIEI5XCIsIFwiOTAgQjBcIiwgXCI5MCBCQlwiLCBcIjkwIEJDXCIsIFwiOTAgQThcIiwgXCI5MCBBRlwiLCBcIkE2IDgxXCIsIFwiOTAgQUVcIiwgXCI5MCBCN1wiLCBcIjkwIEJEXCIsIFwiOTAgQjhcIiwgXCI5MCA5OVwiLCBcIjkwIEI1XCIsIFwiOTkgODhcIiwgXCI5OSA4OVwiLCBcIjk5IDhBXCIsIFwiOTAgOTJcIiwgXCI5MCA5NFwiLCBcIjkwIEE3XCIsIFwiOTAgQTZcIiwgXCI5MCBBNFwiLCBcIjkwIEEzXCIsIFwiOTAgQTVcIiwgXCI5MCBCQVwiLCBcIjkwIDk3XCIsIFwiOTAgQjRcIiwgXCJBNiA4NFwiLCBcIjkwIDlEXCIsIFwiOTAgOUJcIiwgXCI5MCA4Q1wiLCBcIjkwIDlFXCIsIFwiOTAgOUNcIiwgXCI5NSBCN1wiLCBcIkE2IDgyXCIsIFwiQTYgODBcIiwgXCI5MCA4RFwiLCBcIjkwIEEyXCIsIFwiOTAgQTBcIiwgXCI5MCA5RlwiLCBcIjkwIEExXCIsIFwiOTAgQUNcIiwgXCI5MCBCM1wiLCBcIjkwIDhCXCIsIFwiOTAgOEFcIiwgXCI5MCA4NlwiLCBcIjkwIDg1XCIsIFwiOTAgODNcIiwgXCI5MCA4MlwiLCBcIjkwIDg0XCIsIFwiOTAgQUFcIiwgXCI5MCBBQlwiLCBcIjkwIDk4XCIsIFwiOTAgOTBcIiwgXCI5MCA4RlwiLCBcIjkwIDkxXCIsIFwiOTAgOEVcIiwgXCI5MCA5NlwiLCBcIjkwIDgwXCIsIFwiOTAgODFcIiwgXCI5MCA5M1wiLCBcIkE2IDgzXCIsIFwiOTUgOEFcIiwgXCI5MCA5NVwiLCBcIjkwIEE5XCIsIFwiOTAgODhcIiwgXCI5MCA4N1wiLCBcIjkwIEJGXCIsIFwiOTAgQkVcIiwgXCI5MCA4OVwiLCBcIjkwIEIyXCIsIFwiOEMgQjVcIiwgXCI4RSA4NFwiLCBcIjhDIEIyXCIsIFwiOEMgQjNcIiwgXCI4QyBCNFwiLCBcIjhDIEIxXCIsIFwiOEMgQkZcIiwgXCJFMiA5OCA5OFwiLCBcIjhEIDgwXCIsIFwiOEUgOERcIiwgXCI4RSA4QlwiLCBcIjhEIDgzXCIsIFwiOEQgODJcIiwgXCI4RCA4MVwiLCBcIjhDIEJFXCIsIFwiOEMgQkFcIiwgXCI4QyBCQVwiLCBcIjhDIEJCXCIsIFwiOEMgQjlcIiwgXCI4QyBCN1wiLCBcIjhDIEJDXCIsIFwiOEMgQjhcIiwgXCI5MiA5MFwiLCBcIjhEIDg0XCIsIFwiOEMgQjBcIiwgXCI4RSA4M1wiLCBcIjkwIDlBXCIsIFwiOTUgQjhcIiwgXCI4QyA4RVwiLCBcIjhDIDhEXCIsIFwiOEMgOEZcIiwgXCI4QyA5NVwiLCBcIjhDIDk2XCIsIFwiOEMgOTdcIiwgXCI4QyA5OFwiLCBcIjhDIDkxXCIsIFwiOEMgOTJcIiwgXCI4QyA5M1wiLCBcIjhDIDk0XCIsIFwiOEMgOUFcIiwgXCI4QyA5RFwiLCBcIjhDIDlCXCIsIFwiOEMgOUNcIiwgXCI4QyA5RVwiLCBcIjhDIDk5XCIsIFwiRTIgQUQgOTAgRUYgQjggOEZcIiwgXCI4QyA5RlwiLCBcIjkyIEFCXCIsIFwiRTIgOUMgQThcIiwgXCJFMiA5OCA4NCBFRiBCOCA4RlwiLCBcIkUyIDk4IDgwIEVGIEI4IDhGXCIsIFwiOEMgQTRcIiwgXCJFMiA5QiA4NSBFRiBCOCA4RlwiLCBcIjhDIEE1XCIsIFwiOEMgQTZcIiwgXCJFMiA5OCA4MSBFRiBCOCA4RlwiLCBcIjhDIEE3XCIsIFwiRTIgOUIgODhcIiwgXCI4QyBBOVwiLCBcIkUyIDlBIEExIEVGIEI4IDhGXCIsIFwiOTQgQTVcIiwgXCI5MiBBNVwiLCBcIkUyIDlEIDg0IEVGIEI4IDhGXCIsIFwiOEMgQThcIiwgXCJFMiA5OCA4MyBFRiBCOCA4RlwiLCBcIkUyIDlCIDg0IEVGIEI4IDhGXCIsIFwiOEMgQUNcIiwgXCI5MiBBOFwiLCBcIjhDIEFBXCIsIFwiOEMgQUJcIiwgXCJFMiA5OCA4MiBFRiBCOCA4RlwiLCBcIkUyIDk4IDk0IEVGIEI4IDhGXCIsIFwiOTIgQTdcIiwgXCI5MiBBNlwiLCBcIjhDIDhBXCIsIFwiOUIgOTFcIiwgXCI5QiA5MVwiLCBcIjhEIDhGXCIsIFwiOEQgOEVcIiwgXCI4RCA5MFwiLCBcIjhEIDhBXCIsIFwiOEQgOEJcIiwgXCI4RCA4Q1wiLCBcIjhEIDg5XCIsIFwiOEQgODdcIiwgXCI4RCA5M1wiLCBcIjhEIDg4XCIsIFwiOEQgOTJcIiwgXCI4RCA5MVwiLCBcIjhEIDhEXCIsIFwiOEQgODVcIiwgXCI4RCA4NlwiLCBcIjhDIEI2XCIsIFwiOEMgQkRcIiwgXCI4RCBBMFwiLCBcIjhEIEFGXCIsIFwiOEQgOUVcIiwgXCJBNyA4MFwiLCBcIjhEIDk3XCIsIFwiOEQgOTZcIiwgXCI4RCBBNFwiLCBcIjhEIEIzXCIsIFwiOEQgOTRcIiwgXCI4RCA5RlwiLCBcIjhDIEFEXCIsIFwiOEQgOTVcIiwgXCI4RCA5RFwiLCBcIjhDIEFFXCIsIFwiOEMgQUZcIiwgXCI4RCA5Q1wiLCBcIjhEIEIyXCIsIFwiOEQgQTVcIiwgXCI4RCBBM1wiLCBcIjhEIEIxXCIsIFwiOEQgOUJcIiwgXCI4RCA5OVwiLCBcIjhEIDlBXCIsIFwiOEQgOThcIiwgXCI4RCBBMlwiLCBcIjhEIEExXCIsIFwiOEQgQTdcIiwgXCI4RCBBOFwiLCBcIjhEIEE2XCIsIFwiOEQgQjBcIiwgXCI4RSA4MlwiLCBcIjhEIEFFXCIsIFwiOEQgQUNcIiwgXCI4RCBBRFwiLCBcIjhEIEFCXCIsIFwiOEQgQkZcIiwgXCI4RCBBOVwiLCBcIjhEIEFBXCIsIFwiOEQgQkFcIiwgXCI4RCBCQlwiLCBcIjhEIEI3XCIsIFwiOEQgQjhcIiwgXCI4RCBCOVwiLCBcIjhEIEJFXCIsIFwiOEQgQjZcIiwgXCI4RCBCNVwiLCBcIkUyIDk4IDk1IEVGIEI4IDhGXCIsIFwiOEQgQkNcIiwgXCI4RCBCNFwiLCBcIjhEIEJEXCIsXCI5QiA5MVwiLCBcIjlCIDkxXCIsIFwiOUIgOTFcIiwgXCJFMiA5QSBCRCBFRiBCOCA4RlwiLCBcIjhGIDgwXCIsIFwiOEYgODhcIiwgXCJFMiA5QSBCRSBFRiBCOCA4RlwiLCBcIjhFIEJFXCIsIFwiOEYgOTBcIiwgXCI4RiA4OVwiLCBcIjhFIEIxXCIsIFwiRTIgOUIgQjMgRUYgQjggOEZcIiwgXCI4RiA4Q1wiLCBcIjhGIDkzXCIsIFwiOEYgQjhcIiwgXCI4RiA5MlwiLCBcIjhGIDkxXCIsIFwiOEYgOEZcIiwgXCI4RSBCRlwiLCBcIkUyIDlCIEI3XCIsIFwiOEYgODJcIiwgXCJFMiA5QiBCOFwiLCBcIjhGIEI5XCIsIFwiOEUgQTNcIiwgXCI5QSBBM1wiLCBcIjhGIDhBXCIsIFwiOEYgODRcIiwgXCI5QiA4MFwiLCBcIkUyIDlCIEI5XCIsIFwiOEYgOEJcIiwgXCI5QSBCNFwiLCBcIjlBIEI1XCIsIFwiOEYgODdcIiwgXCI5NSBCNFwiLCBcIjhGIDg2XCIsIFwiOEUgQkRcIiwgXCI4RiA4NVwiLCBcIjhFIDk2XCIsIFwiOEUgOTdcIiwgXCI4RiBCNVwiLCBcIjhFIEFCXCIsIFwiOEUgOUZcIiwgXCI4RSBBRFwiLCBcIjhFIEE4XCIsIFwiOEUgQUFcIiwgXCI4RSBBNFwiLCBcIjhFIEE3XCIsIFwiOEUgQkNcIiwgXCI4RSBCOVwiLCBcIjhFIEI3XCIsIFwiOEUgQkFcIiwgXCI4RSBCOFwiLCBcIjhFIEJCXCIsIFwiOEUgQUNcIiwgXCI4RSBBRVwiLCBcIjkxIEJFXCIsIFwiOEUgQUZcIiwgXCI4RSBCMlwiLCBcIjhFIEIwXCIsIFwiOEUgQjNcIiwgXCI5QiA5MVwiLCBcIjlCIDkxXCIsIFwiOUIgOTFcIiwgXCI5QSA5N1wiLCBcIjlBIDk1XCIsIFwiOUEgOTlcIiwgXCI5QSA4Q1wiLCBcIjlBIDhFXCIsIFwiOEYgOEVcIiwgXCI5QSA5M1wiLCBcIjlBIDkxXCIsIFwiOUEgOTJcIiwgXCI5QSA5MFwiLCBcIjlBIDlBXCIsIFwiOUEgOUJcIiwgXCI5QSA5Q1wiLFwiOEYgOERcIiwgXCI5QSBCMlwiLCBcIjlBIEE4XCIsIFwiOUEgOTRcIiwgXCI5QSA4RFwiLCBcIjlBIDk4XCIsIFwiOUEgOTZcIiwgXCI5QSBBMVwiLCBcIjlBIEEwXCIsIFwiOUEgQUZcIiwgXCI5QSA4M1wiLCBcIjlBIDhCXCIsIFwiOUEgOURcIiwgXCI5QSA4NFwiLCBcIjlBIDg1XCIsIFwiOUEgODhcIiwgXCI5QSA5RVwiLCBcIjlBIDgyXCIsIFwiOUEgODZcIiwgXCI5QSA4N1wiLCBcIjlBIDhBXCIsIFwiOUEgODlcIiwgXCI5QSA4MVwiLCBcIjlCIEE5XCIsIFwiRTIgOUMgODggRUYgQjggOEZcIiwgXCI5QiBBQlwiLCBcIjlCIEFDXCIsIFwiRTIgOUIgQjUgRUYgQjggOEZcIiwgXCI5QiBBNVwiLCBcIjlBIEE0XCIsIFwiRTIgOUIgQjRcIiwgXCI5QiBCM1wiLCBcIjlBIDgwXCIsIFwiOUIgQjBcIiwgXCI5MiBCQVwiLCBcIkUyIDlBIDkzIEVGIEI4IDhGXCIsIFwiOUEgQTdcIiwgXCJFMiA5QiBCRCBFRiBCOCA4RlwiLCBcIjlBIDhGXCIsIFwiOUEgQTZcIiwgXCI5QSBBNVwiLCBcIjhGIDgxXCIsIFwiOUEgQTJcIiwgXCI4RSBBMVwiLCBcIjhFIEEyXCIsIFwiOEUgQTBcIiwgXCI4RiA5N1wiLCBcIjhDIDgxXCIsIFwiOTcgQkNcIiwgXCI4RiBBRFwiLCBcIkUyIDlCIEIyIEVGIEI4IDhGXCIsIFwiOEUgOTFcIiwgXCJFMiA5QiBCMFwiLCBcIjhGIDk0XCIsIFwiOTcgQkJcIiwgXCI4QyA4QlwiLCBcIjk3IEJFXCIsIFwiOEYgOTVcIiwgXCJFMiA5QiBCQSBFRiBCOCA4RlwiLCBcIjhGIDlFXCIsIFwiOUIgQTNcIiwgXCI5QiBBNFwiLCBcIjhDIDg1XCIsIFwiOEMgODRcIiwgXCI4RiA5Q1wiLCBcIjhGIDk2XCIsIFwiOEYgOURcIiwgXCI4QyA4N1wiLCBcIjhDIDg2XCIsIFwiOEYgOTlcIiwgXCI4QyA4M1wiLCBcIjhDIDg5XCIsIFwiOEMgOENcIiwgXCI4QyBBMFwiLCBcIjhFIDg3XCIsIFwiOEUgODZcIiwgXCI4QyA4OFwiLCBcIjhGIDk4XCIsIFwiOEYgQjBcIiwgXCI4RiBBRlwiLCBcIjhGIDlGXCIsIFwiOTcgQkRcIiwgXCI4RiBBMFwiLCBcIjhGIEExXCIsIFwiOEYgOUFcIiwgXCI4RiBBMlwiLCBcIjhGIEFDXCIsIFwiOEYgQTNcIiwgXCI4RiBBNFwiLCBcIjhGIEE1XCIsIFwiOEYgQTZcIiwgXCI4RiBBOFwiLCBcIjhGIEFBXCIsIFwiOEYgQUJcIiwgXCI4RiBBOVwiLCBcIjkyIDkyXCIsIFwiOEYgOUJcIiwgXCJFMiA5QiBBQSBFRiBCOCA4RlwiLCBcIjk1IDhDXCIsIFwiOTUgOERcIiwgXCI5NSA4QlwiLCBcIkUyIDlCIEE5XCIsIFwiRTIgOEMgOUEgRUYgQjggOEZcIiwgXCI5MyBCMVwiLCBcIjkzIEIyXCIsIFwiOTIgQkJcIiwgXCJFMiA4QyBBOCBFRiBCOCA4RlwiLCBcIjk2IEE1XCIsIFwiOTYgQThcIiwgXCI5NiBCMVwiLCBcIjk2IEIyXCIsIFwiOTUgQjlcIiwgXCI5NyA5Q1wiLCBcIjkyIEJEXCIsIFwiOTIgQkVcIiwgXCI5MiBCRlwiLCBcIjkzIDgwXCIsIFwiOTMgQkNcIiwgXCI5MyBCN1wiLCBcIjkzIEI4XCIsIFwiOTMgQjlcIiwgXCI4RSBBNVwiLCBcIjkzIEJEXCIsIFwiOEUgOUVcIiwgXCI5MyA5RVwiLCBcIkUyIDk4IDhFIEVGIEI4IDhGXCIsIFwiOTMgOUZcIiwgXCI5MyBBMFwiLCBcIjkzIEJBXCIsIFwiOTMgQkJcIiwgXCI4RSA5OVwiLCBcIjhFIDlBXCIsIFwiOEUgOUJcIiwgXCJFMiA4RiBCMVwiLCBcIkUyIDhGIEIyXCIsIFwiRTIgOEYgQjBcIiwgXCI5NSBCMFwiLCBcIkUyIDhGIEIzXCIsIFwiRTIgOEMgOUIgRUYgQjggOEZcIiwgXCI5MyBBMVwiLCBcIjk0IDhCXCIsIFwiOTQgOENcIiwgXCI5MiBBMVwiLCBcIjk0IEE2XCIsIFwiOTUgQUZcIiwgXCI5NyA5MVwiLCBcIjlCIEEyXCIsIFwiOTIgQjhcIiwgXCI5MiBCNVwiLCBcIjkyIEI0XCIsIFwiOTIgQjZcIiwgXCI5MiBCN1wiLCBcIjkyIEIwXCIsIFwiOTIgQjNcIiwgXCI5MiA4RVwiLCBcIkUyIDlBIDk2XCIsIFwiOTQgQTdcIiwgXCI5NCBBOFwiLCBcIkUyIDlBIDkyXCIsIFwiOUIgQTBcIiwgXCJFMiA5QiA4RlwiLCBcIjk0IEE5XCIsIFwiRTIgOUEgOTlcIiwgXCJFMiA5QiA5M1wiLCBcIjk0IEFCXCIsIFwiOTIgQTNcIiwgXCI5NCBBQVwiLCBcIjk3IEExXCIsIFwiRTIgOUEgOTRcIiwgXCI5QiBBMVwiLCBcIjlBIEFDXCIsIFwiRTIgOTggQTAgRUYgQjggOEZcIiwgXCJFMiA5QSBCMFwiLCBcIkUyIDlBIEIxXCIsIFwiOEYgQkFcIiwgXCI5NCBBRVwiLCBcIjkzIEJGXCIsIFwiOTIgODhcIiwgXCJFMiA5QSA5N1wiLCBcIjk0IEFEXCIsIFwiOTQgQUNcIiwgXCI5NSBCM1wiLCBcIjkyIDhBXCIsIFwiOTIgODlcIiwgXCI4QyBBMVwiLCBcIjhGIEI3XCIsIFwiOTQgOTZcIiwgXCI5QSBCRFwiLCBcIjlBIEJGXCIsIFwiOUIgODFcIiwgXCI5NCA5MVwiLCBcIjk3IDlEXCIsIFwiOUIgOEJcIiwgXCI5QiA4Q1wiLCBcIjlCIDhGXCIsIFwiOUEgQUFcIiwgXCI5QiA4RVwiLCBcIjk2IEJDXCIsIFwiOTcgQkFcIiwgXCJFMiA5QiBCMVwiLCBcIjk3IEJGXCIsIFwiOUIgOERcIiwgXCI4RSA4OFwiLCBcIjhFIDhGXCIsIFwiOEUgODBcIiwgXCI4RSA4MVwiLCBcIjhFIDhBXCIsIFwiOEUgODlcIiwgXCI4RSA4RVwiLCBcIjhFIDkwXCIsIFwiOEUgOENcIiwgXCI4RiBBRVwiLCBcIkUyIDlDIDg5IEVGIEI4IDhGXCIsIFwiOTMgQTlcIiwgXCI5MyBBOFwiLCBcIjkzIEE3XCIsIFwiOTIgOENcIiwgXCI5MyBBRVwiLCBcIjkzIEFBXCIsIFwiOTMgQUJcIiwgXCI5MyBBQ1wiLCBcIjkzIEFEXCIsIFwiOTMgQTZcIiwgXCI5MyBBRlwiLCBcIjkzIEE1XCIsIFwiOTMgQTRcIiwgXCI5MyA5Q1wiLCBcIjkzIDgzXCIsIFwiOTMgOTFcIiwgXCI5MyA4QVwiLCBcIjkzIDg4XCIsIFwiOTMgODlcIiwgXCI5MyA4NFwiLCBcIjkzIDg1XCIsIFwiOTMgODZcIiwgXCI5NyA5M1wiLCBcIjkzIDg3XCIsIFwiOTcgODNcIiwgXCI5NyBCM1wiLCBcIjk3IDg0XCIsIFwiOTMgOEJcIiwgXCI5NyA5MlwiLCBcIjkzIDgxXCIsIFwiOTMgODJcIiwgXCI5NyA4MlwiLCBcIjk3IDlFXCIsIFwiOTMgQjBcIiwgXCI5MyA5M1wiLCBcIjkzIDk1XCIsIFwiOTMgOTdcIiwgXCI5MyA5OFwiLCBcIjkzIDk5XCIsIFwiOTMgOTRcIiwgXCI5MyA5MlwiLCBcIjkzIDlBXCIsIFwiOTMgOTZcIiwgXCI5NCA5N1wiLCBcIjkzIDhFXCIsIFwiOTYgODdcIiwgXCJFMiA5QyA4MiBFRiBCOCA4RlwiLCBcIjkzIDkwXCIsIFwiOTMgOEZcIiwgXCI5MyA4Q1wiLCBcIjkzIDhEXCIsIFwiOUEgQTlcIiwgXCI4RiBCM1wiLCBcIjhGIEI0XCIsIFwiOTQgOTBcIiwgXCI5NCA5MlwiLCBcIjk0IDkzXCIsIFwiOTQgOEZcIiwgXCI5NiA4QVwiLCBcIjk2IDhCXCIsIFwiRTIgOUMgOTIgRUYgQjggOEZcIiwgXCI5MyA5RFwiLCBcIkUyIDlDIDhGIEVGIEI4IDhGXCIsIFwiOTYgOERcIiwgXCI5NiA4Q1wiLCBcIjk0IDhEXCIsIFwiOTQgOEVcIiwgXCI5QiA5MVwiLCBcIjlCIDkxXCIsIFwiRTIgOUQgQTQgRUYgQjggOEZcIiwgXCI5MiA5QlwiLCBcIjkyIDlBXCIsIFwiOTIgOTlcIiwgXCI5MiA5Q1wiLCBcIjkyIDk0XCIsIFwiRTIgOUQgQTMgRUYgQjggOEZcIiwgXCI5MiA5NVwiLCBcIjkyIDlFXCIsIFwiOTIgOTNcIiwgXCI5MiA5N1wiLCBcIjkyIDk2XCIsIFwiOTIgOThcIiwgXCI5MiA5RFwiLCBcIjkyIDlGXCIsIFwiRTIgOTggQUUgRUYgQjggOEZcIiwgXCJFMiA5QyA5RCBFRiBCOCA4RlwiLCBcIkUyIDk4IEFBIEVGIEI4IDhGXCIsIFwiOTUgODlcIiwgXCJFMiA5OCBCOCBFRiBCOCA4RlwiLCBcIkUyIDlDIEExIEVGIEI4IDhGXCIsIFwiOTQgQUZcIiwgXCI5NSA4RVwiLCBcIkUyIDk4IEFGIEVGIEI4IDhGXCIsIFwiRTIgOTggQTYgRUYgQjggOEZcIiwgXCI5QiA5MFwiLCBcIkUyIDlCIDhFXCIsIFwiRTIgOTkgODggRUYgQjggOEZcIiwgXCJFMiA5OSA4OSBFRiBCOCA4RlwiLCBcIkUyIDk5IDhBIEVGIEI4IDhGXCIsIFwiRTIgOTkgOEIgRUYgQjggOEZcIiwgXCJFMiA5OSA4QyBFRiBCOCA4RlwiLCBcIkUyIDk5IDhEIEVGIEI4IDhGXCIsIFwiRTIgOTkgOEUgRUYgQjggOEZcIiwgXCJFMiA5OSA4RiBFRiBCOCA4RlwiLCBcIkUyIDk5IDkwIEVGIEI4IDhGXCIsIFwiRTIgOTkgOTEgRUYgQjggOEZcIiwgXCJFMiA5OSA5MiBFRiBCOCA4RlwiLCBcIkUyIDk5IDkzIEVGIEI4IDhGXCIsIFwiODYgOTRcIiwgXCJFMiA5QSA5QlwiLCBcIjg4IEIzXCIsIFwiODggQjlcIiwgXCJFMiA5OCBBMiBFRiBCOCA4RlwiLCBcIkUyIDk4IEEzIEVGIEI4IDhGXCIsIFwiOTMgQjRcIiwgXCI5MyBCM1wiLCBcIjg4IEI2XCIsIFwiODggOUEgRUYgQjggOEZcIiwgXCI4OCBCOFwiLCBcIjg4IEJBXCIsIFwiODggQjcgRUYgQjggOEZcIiwgXCJFMiA5QyBCNCBFRiBCOCA4RlwiLCBcIjg2IDlBXCIsIFwiODkgOTFcIiwgXCI5MiBBRVwiLCBcIjg5IDkwXCIsIFwiRTMgOEEgOTkgRUYgQjggOEZcIiwgXCJFMyA4QSA5NyBFRiBCOCA4RlwiLCBcIjg4IEI0XCIsIFwiODggQjVcIiwgXCI4OCBCMlwiLCBcIjg1IEIwIEVGIEI4IDhGXCIsIFwiODUgQjEgRUYgQjggOEZcIiwgXCI4NiA4RVwiLCBcIjg2IDkxXCIsIFwiODUgQkUgRUYgQjggOEZcIiwgXCI4NiA5OFwiLCBcIkUyIDlCIDk0IEVGIEI4IDhGXCIsIFwiOTMgOUJcIiwgXCI5QSBBQlwiLCBcIkUyIDlEIDhDXCIsIFwiRTIgQUQgOTUgRUYgQjggOEZcIiwgXCI5MiBBMlwiLCBcIkUyIDk5IEE4IEVGIEI4IDhGXCIsIFwiOUEgQjdcIiwgXCI5QSBBRlwiLCBcIjlBIEIzXCIsIFwiOUEgQjFcIiwgXCI5NCA5RVwiLCBcIjkzIEI1XCIsIFwiRTIgOUQgOTcgRUYgQjggOEZcIiwgXCJFMiA5RCA5NVwiLCBcIkUyIDlEIDkzXCIsIFwiRTIgOUQgOTRcIiwgXCJFMiA4MCBCQyBFRiBCOCA4RlwiLCBcIkUyIDgxIDg5IEVGIEI4IDhGXCIsIFwiOTIgQUZcIiwgXCI5NCA4NVwiLCBcIjk0IDg2XCIsIFwiOTQgQjFcIiwgXCJFMiA5QSA5Q1wiLCBcIkUzIDgwIEJEIEVGIEI4IDhGXCIsIFwiRTIgOUEgQTAgRUYgQjggOEZcIiwgXCI5QSBCOFwiLCBcIjk0IEIwXCIsIFwiRTIgOTkgQkIgRUYgQjggOEZcIiwgXCI4OCBBRiBFRiBCOCA4RlwiLCBcIjkyIEI5XCIsIFwiRTIgOUQgODcgRUYgQjggOEZcIiwgXCJFMiA5QyBCMyBFRiBCOCA4RlwiLCBcIkUyIDlEIDhFXCIsIFwiRTIgOUMgODVcIiwgXCI5MiBBMFwiLCBcIjhDIDgwXCIsIFwiRTIgOUUgQkZcIiwgXCI4QyA5MFwiLCBcIkUyIDkzIDgyIEVGIEI4IDhGXCIsIFwiOEYgQTdcIiwgXCI4OCA4MiBFRiBCOCA4RlwiLCBcIjlCIDgyXCIsIFwiOUIgODNcIiwgXCI5QiA4NFwiLCBcIjlCIDg1XCIsIFwiRTIgOTkgQkYgRUYgQjggOEZcIiwgXCI5QSBBRFwiLCBcIjlBIEJFXCIsIFwiODUgQkYgRUYgQjggOEZcIiwgXCI5QSBCMFwiLCBcIjlBIEI5XCIsIFwiOUEgQkFcIiwgXCI5QSBCQ1wiLCBcIjlBIEJCXCIsIFwiOUEgQUVcIiwgXCI4RSBBNlwiLCBcIjkzIEI2XCIsIFwiODggODFcIiwgXCI4NiA5NlwiLCBcIjg2IDk3XCIsIFwiODYgOTlcIiwgXCI4NiA5MlwiLCBcIjg2IDk1XCIsIFwiODYgOTNcIiwgXCIzMCBFRiBCOCA4RiBFMiA4MyBBM1wiLCBcIjMxIEVGIEI4IDhGIEUyIDgzIEEzXCIsIFwiMzIgRUYgQjggOEYgRTIgODMgQTNcIiwgXCIzMyBFRiBCOCA4RiBFMiA4MyBBM1wiLCBcIjM0IEVGIEI4IDhGIEUyIDgzIEEzXCIsIFwiMzUgRUYgQjggOEYgRTIgODMgQTNcIiwgXCIzNiBFRiBCOCA4RiBFMiA4MyBBM1wiLCBcIjM3IEVGIEI4IDhGIEUyIDgzIEEzXCIsIFwiMzggRUYgQjggOEYgRTIgODMgQTNcIiwgXCIzOSBFRiBCOCA4RiBFMiA4MyBBM1wiLCBcIjk0IDlGXCIsIFwiOTQgQTJcIiwgXCJFMiA5NiBCNiBFRiBCOCA4RlwiLCBcIkUyIDhGIEI4XCIsIFwiRTIgOEYgQUZcIiwgXCJFMiA4RiBCOVwiLCBcIkUyIDhGIEJBXCIsIFwiRTIgOEYgQURcIiwgXCJFMiA4RiBBRVwiLCBcIkUyIDhGIEE5XCIsIFwiRTIgOEYgQUFcIiwgXCI5NCA4MFwiLCBcIjk0IDgxXCIsIFwiOTQgODJcIiwgXCJFMiA5NyA4MCBFRiBCOCA4RlwiLCBcIjk0IEJDXCIsIFwiOTQgQkRcIiwgXCJFMiA4RiBBQlwiLCBcIkUyIDhGIEFDXCIsIFwiRTIgOUUgQTEgRUYgQjggOEZcIiwgXCJFMiBBQyA4NSBFRiBCOCA4RlwiLCBcIkUyIEFDIDg2IEVGIEI4IDhGXCIsIFwiRTIgQUMgODcgRUYgQjggOEZcIiwgXCJFMiA4NiA5NyBFRiBCOCA4RlwiLCBcIkUyIDg2IDk4IEVGIEI4IDhGXCIsIFwiRTIgODYgOTkgRUYgQjggOEZcIiwgXCJFMiA4NiA5NiBFRiBCOCA4RlwiLCBcIkUyIDg2IDk1IEVGIEI4IDhGXCIsIFwiRTIgODYgOTQgRUYgQjggOEZcIiwgXCI5NCA4NFwiLCBcIkUyIDg2IEFBIEVGIEI4IDhGXCIsIFwiRTIgODYgQTkgRUYgQjggOEZcIiwgXCJFMiBBNCBCNCBFRiBCOCA4RlwiLCBcIkUyIEE0IEI1IEVGIEI4IDhGXCIsIFwiMjMgRUYgQjggOEYgRTIgODMgQTNcIiwgXCIyQSBFRiBCOCA4RiBFMiA4MyBBM1wiLCBcIkUyIDg0IEI5IEVGIEI4IDhGXCIsIFwiOTQgQTRcIiwgXCI5NCBBMVwiLCBcIjk0IEEwXCIsIFwiOTQgQTNcIiwgXCI4RSBCNVwiLCBcIjhFIEI2XCIsIFwiRTMgODAgQjAgRUYgQjggOEZcIiwgXCJFMiA5RSBCMFwiLCBcIkUyIDlDIDk0IEVGIEI4IDhGXCIsIFwiOTQgODNcIiwgXCJFMiA5RSA5NVwiLCBcIkUyIDlFIDk2XCIsIFwiRTIgOUUgOTdcIiwgXCJFMiA5QyA5NiBFRiBCOCA4RlwiLCBcIjkyIEIyXCIsIFwiOTIgQjFcIiwgXCJDMiBBOSBFRiBCOCA4RlwiLCBcIkMyIEFFIEVGIEI4IDhGXCIsIFwiRTIgODQgQTIgRUYgQjggOEZcIiwgXCI5NCA5QVwiLCBcIjk0IDk5XCIsIFwiOTQgOUJcIiwgXCI5NCA5RFwiLCBcIjk0IDlDXCIsIFwiRTIgOTggOTEgRUYgQjggOEZcIiwgXCI5NCA5OFwiLCBcIkUyIDlBIEFBIEVGIEI4IDhGXCIsIFwiRTIgOUEgQUIgRUYgQjggOEZcIiwgXCI5NCBCNFwiLCBcIjk0IEI1XCIsIFwiOTQgQjhcIiwgXCI5NCBCOVwiLCBcIjk0IEI2XCIsIFwiOTQgQjdcIiwgXCI5NCBCQVwiLCBcIkUyIDk2IEFBIEVGIEI4IDhGXCIsIFwiRTIgOTYgQUIgRUYgQjggOEZcIiwgXCJFMiBBQyA5QiBFRiBCOCA4RlwiLCBcIkUyIEFDIDlDIEVGIEI4IDhGXCIsIFwiOTQgQkJcIiwgXCJFMiA5NyBCQyBFRiBCOCA4RlwiLCBcIkUyIDk3IEJCIEVGIEI4IDhGXCIsIFwiRTIgOTcgQkUgRUYgQjggOEZcIiwgXCJFMiA5NyBCRCBFRiBCOCA4RlwiLCBcIjk0IEIyXCIsIFwiOTQgQjNcIiwgXCI5NCA4OFwiLCBcIjk0IDg5XCIsIFwiOTQgOEFcIiwgXCI5NCA4N1wiLCBcIjkzIEEzXCIsIFwiOTMgQTJcIiwgXCI5NCA5NFwiLCBcIjk0IDk1XCIsIFwiODMgOEZcIiwgXCI4MCA4NCBFRiBCOCA4RlwiLCBcIkUyIDk5IEEwIEVGIEI4IDhGXCIsIFwiRTIgOTkgQTMgRUYgQjggOEZcIiwgXCJFMiA5OSBBNSBFRiBCOCA4RlwiLCBcIkUyIDk5IEE2IEVGIEI4IDhGXCIsIFwiOEUgQjRcIiwgXCI5MSA4MSBFMiA4MCA4RCBGMCA5RiA5NyBBOFwiLCBcIjkyIEFEXCIsIFwiOTcgQUZcIiwgXCI5MiBBQ1wiLCBcIjk1IDkwXCIsIFwiOTUgOTFcIiwgXCI5NSA5MlwiLCBcIjk1IDkzXCIsIFwiOTUgOTRcIiwgXCI5NSA5NVwiLCBcIjk1IDk2XCIsIFwiOTUgOTdcIiwgXCI5NSA5OFwiLCBcIjk1IDk5XCIsIFwiOTUgOUFcIiwgXCI5NSA5QlwiLCBcIjk1IDlDXCIsIFwiOTUgOURcIiwgXCI5NSA5RVwiLCBcIjk1IDlGXCIsIFwiOTUgQTBcIiwgXCI5NSBBMVwiLCBcIjk1IEEyXCIsIFwiOTUgQTNcIiwgXCI5NSBBNFwiLCBcIjk1IEE1XCIsIFwiOTUgQTZcIiwgXCI5NSBBN1wiLCBcIjlCIDkxXCIsIFwiODcgQTYgRjAgOUYgODcgQUJcIiwgXCI4NyBBNiBGMCA5RiA4NyBCRFwiLCBcIjg3IEE2IEYwIDlGIDg3IEIxXCIsIFwiODcgQTkgRjAgOUYgODcgQkZcIiwgXCI4NyBBNiBGMCA5RiA4NyBCOFwiLCBcIjg3IEE2IEYwIDlGIDg3IEE5XCIsIFwiODcgQTYgRjAgOUYgODcgQjRcIiwgXCI4NyBBNiBGMCA5RiA4NyBBRVwiLCBcIjg3IEE2IEYwIDlGIDg3IEI2XCIsIFwiODcgQTYgRjAgOUYgODcgQUNcIiwgXCI4NyBBNiBGMCA5RiA4NyBCN1wiLCBcIjg3IEE2IEYwIDlGIDg3IEIyXCIsIFwiODcgQTYgRjAgOUYgODcgQkNcIiwgXCI4NyBBNiBGMCA5RiA4NyBCQVwiLCBcIjg3IEE2IEYwIDlGIDg3IEI5XCIsIFwiODcgQTYgRjAgOUYgODcgQkZcIiwgXCI4NyBBNyBGMCA5RiA4NyBCOFwiLCBcIjg3IEE3IEYwIDlGIDg3IEFEXCIsIFwiODcgQTcgRjAgOUYgODcgQTlcIiwgXCI4NyBBNyBGMCA5RiA4NyBBN1wiLCBcIjg3IEE3IEYwIDlGIDg3IEJFXCIsIFwiODcgQTcgRjAgOUYgODcgQUFcIiwgXCI4NyBBNyBGMCA5RiA4NyBCRlwiLCBcIjg3IEE3IEYwIDlGIDg3IEFGXCIsIFwiODcgQTcgRjAgOUYgODcgQjJcIiwgXCI4NyBBNyBGMCA5RiA4NyBCOVwiLCBcIjg3IEE3IEYwIDlGIDg3IEI0XCIsIFwiODcgQTcgRjAgOUYgODcgQjZcIiwgXCI4NyBBNyBGMCA5RiA4NyBBNlwiLCBcIjg3IEE3IEYwIDlGIDg3IEJDXCIsIFwiODcgQTcgRjAgOUYgODcgQjdcIiwgXCI4NyBBRSBGMCA5RiA4NyBCNFwiLCBcIjg3IEJCIEYwIDlGIDg3IEFDXCIsIFwiODcgQTcgRjAgOUYgODcgQjNcIiwgXCI4NyBBNyBGMCA5RiA4NyBBQ1wiLCBcIjg3IEE3IEYwIDlGIDg3IEFCXCIsIFwiODcgQTcgRjAgOUYgODcgQUVcIiwgXCI4NyBBOCBGMCA5RiA4NyBCQlwiLCBcIjg3IEIwIEYwIDlGIDg3IEFEXCIsIFwiODcgQTggRjAgOUYgODcgQjJcIiwgXCI4NyBBOCBGMCA5RiA4NyBBNlwiLCBcIjg3IEFFIEYwIDlGIDg3IEE4XCIsIFwiODcgQjAgRjAgOUYgODcgQkVcIiwgXCI4NyBBOCBGMCA5RiA4NyBBQlwiLCBcIjg3IEI5IEYwIDlGIDg3IEE5XCIsIFwiODcgQTggRjAgOUYgODcgQjFcIiwgXCI4NyBBOCBGMCA5RiA4NyBCM1wiLCBcIjg3IEE4IEYwIDlGIDg3IEJEXCIsIFwiODcgQTggRjAgOUYgODcgQThcIiwgXCI4NyBBOCBGMCA5RiA4NyBCNFwiLCBcIjg3IEIwIEYwIDlGIDg3IEIyXCIsIFwiODcgQTggRjAgOUYgODcgQUNcIiwgXCI4NyBBOCBGMCA5RiA4NyBBOVwiLCBcIjg3IEE4IEYwIDlGIDg3IEIwXCIsIFwiODcgQTggRjAgOUYgODcgQjdcIiwgXCI4NyBBRCBGMCA5RiA4NyBCN1wiLCBcIjg3IEE4IEYwIDlGIDg3IEJBXCIsIFwiODcgQTggRjAgOUYgODcgQkNcIiwgXCI4NyBBOCBGMCA5RiA4NyBCRVwiLCBcIjg3IEE4IEYwIDlGIDg3IEJGXCIsIFwiODcgQTkgRjAgOUYgODcgQjBcIiwgXCI4NyBBOSBGMCA5RiA4NyBBRlwiLCBcIjg3IEE5IEYwIDlGIDg3IEIyXCIsIFwiODcgQTkgRjAgOUYgODcgQjRcIiwgXCI4NyBBQSBGMCA5RiA4NyBBOFwiLCBcIjg3IEFBIEYwIDlGIDg3IEFDXCIsIFwiODcgQjggRjAgOUYgODcgQkJcIiwgXCI4NyBBQyBGMCA5RiA4NyBCNlwiLCBcIjg3IEFBIEYwIDlGIDg3IEI3XCIsIFwiODcgQUEgRjAgOUYgODcgQUFcIiwgXCI4NyBBQSBGMCA5RiA4NyBCOVwiLCBcIjg3IEFBIEYwIDlGIDg3IEJBXCIsIFwiODcgQUIgRjAgOUYgODcgQjBcIiwgXCI4NyBBQiBGMCA5RiA4NyBCNFwiLCBcIjg3IEFCIEYwIDlGIDg3IEFGXCIsIFwiODcgQUIgRjAgOUYgODcgQUVcIiwgXCI4NyBBQiBGMCA5RiA4NyBCN1wiLCBcIjg3IEFDIEYwIDlGIDg3IEFCXCIsIFwiODcgQjUgRjAgOUYgODcgQUJcIiwgXCI4NyBCOSBGMCA5RiA4NyBBQlwiLCBcIjg3IEFDIEYwIDlGIDg3IEE2XCIsIFwiODcgQUMgRjAgOUYgODcgQjJcIiwgXCI4NyBBQyBGMCA5RiA4NyBBQVwiLCBcIjg3IEE5IEYwIDlGIDg3IEFBXCIsIFwiODcgQUMgRjAgOUYgODcgQURcIiwgXCI4NyBBQyBGMCA5RiA4NyBBRVwiLCBcIjg3IEFDIEYwIDlGIDg3IEI3XCIsIFwiODcgQUMgRjAgOUYgODcgQjFcIiwgXCI4NyBBQyBGMCA5RiA4NyBBOVwiLCBcIjg3IEFDIEYwIDlGIDg3IEI1XCIsIFwiODcgQUMgRjAgOUYgODcgQkFcIiwgXCI4NyBBQyBGMCA5RiA4NyBCOVwiLCBcIjg3IEFDIEYwIDlGIDg3IEFDXCIsIFwiODcgQUMgRjAgOUYgODcgQjNcIiwgXCI4NyBBQyBGMCA5RiA4NyBCQ1wiLCBcIjg3IEFDIEYwIDlGIDg3IEJFXCIsIFwiODcgQUQgRjAgOUYgODcgQjlcIiwgXCI4NyBBRCBGMCA5RiA4NyBCM1wiLCBcIjg3IEFEIEYwIDlGIDg3IEIwXCIsIFwiODcgQUQgRjAgOUYgODcgQkFcIiwgXCI4NyBBRSBGMCA5RiA4NyBCOFwiLCBcIjg3IEFFIEYwIDlGIDg3IEIzXCIsIFwiODcgQUUgRjAgOUYgODcgQTlcIiwgXCI4NyBBRSBGMCA5RiA4NyBCN1wiLCBcIjg3IEFFIEYwIDlGIDg3IEI2XCIsIFwiODcgQUUgRjAgOUYgODcgQUFcIiwgXCI4NyBBRSBGMCA5RiA4NyBCMlwiLCBcIjg3IEFFIEYwIDlGIDg3IEIxXCIsIFwiODcgQUUgRjAgOUYgODcgQjlcIiwgXCI4NyBBOCBGMCA5RiA4NyBBRVwiLCBcIjg3IEFGIEYwIDlGIDg3IEIyXCIsIFwiODcgQUYgRjAgOUYgODcgQjVcIiwgXCI4NyBBRiBGMCA5RiA4NyBBQVwiLCBcIjg3IEFGIEYwIDlGIDg3IEI0XCIsIFwiODcgQjAgRjAgOUYgODcgQkZcIiwgXCI4NyBCMCBGMCA5RiA4NyBBQVwiLCBcIjg3IEIwIEYwIDlGIDg3IEFFXCIsIFwiODcgQkQgRjAgOUYgODcgQjBcIiwgXCI4NyBCMCBGMCA5RiA4NyBCQ1wiLCBcIjg3IEIwIEYwIDlGIDg3IEFDXCIsIFwiODcgQjEgRjAgOUYgODcgQTZcIiwgXCI4NyBCMSBGMCA5RiA4NyBCQlwiLCBcIjg3IEIxIEYwIDlGIDg3IEE3XCIsIFwiODcgQjEgRjAgOUYgODcgQjhcIiwgXCI4NyBCMSBGMCA5RiA4NyBCN1wiLCBcIjg3IEIxIEYwIDlGIDg3IEJFXCIsIFwiODcgQjEgRjAgOUYgODcgQUVcIiwgXCI4NyBCMSBGMCA5RiA4NyBCOVwiLCBcIjg3IEIxIEYwIDlGIDg3IEJBXCIsIFwiODcgQjIgRjAgOUYgODcgQjRcIiwgXCI4NyBCMiBGMCA5RiA4NyBCMFwiLCBcIjg3IEIyIEYwIDlGIDg3IEFDXCIsIFwiODcgQjIgRjAgOUYgODcgQkNcIiwgXCI4NyBCMiBGMCA5RiA4NyBCRVwiLCBcIjg3IEIyIEYwIDlGIDg3IEJCXCIsIFwiODcgQjIgRjAgOUYgODcgQjFcIiwgXCI4NyBCMiBGMCA5RiA4NyBCOVwiLCBcIjg3IEIyIEYwIDlGIDg3IEFEXCIsIFwiODcgQjIgRjAgOUYgODcgQjZcIiwgXCI4NyBCMiBGMCA5RiA4NyBCN1wiLCBcIjg3IEIyIEYwIDlGIDg3IEJBXCIsIFwiODcgQkUgRjAgOUYgODcgQjlcIiwgXCI4NyBCMiBGMCA5RiA4NyBCRFwiLCBcIjg3IEFCIEYwIDlGIDg3IEIyXCIsIFwiODcgQjIgRjAgOUYgODcgQTlcIiwgXCI4NyBCMiBGMCA5RiA4NyBBOFwiLCBcIjg3IEIyIEYwIDlGIDg3IEIzXCIsIFwiODcgQjIgRjAgOUYgODcgQUFcIiwgXCI4NyBCMiBGMCA5RiA4NyBCOFwiLCBcIjg3IEIyIEYwIDlGIDg3IEE2XCIsIFwiODcgQjIgRjAgOUYgODcgQkZcIiwgXCI4NyBCMiBGMCA5RiA4NyBCMlwiLCBcIjg3IEIzIEYwIDlGIDg3IEE2XCIsIFwiODcgQjMgRjAgOUYgODcgQjdcIiwgXCI4NyBCMyBGMCA5RiA4NyBCNVwiLCBcIjg3IEIzIEYwIDlGIDg3IEIxXCIsIFwiODcgQjMgRjAgOUYgODcgQThcIiwgXCI4NyBCMyBGMCA5RiA4NyBCRlwiLCBcIjg3IEIzIEYwIDlGIDg3IEFFXCIsIFwiODcgQjMgRjAgOUYgODcgQUFcIiwgXCI4NyBCMyBGMCA5RiA4NyBBQ1wiLCBcIjg3IEIzIEYwIDlGIDg3IEJBXCIsIFwiODcgQjMgRjAgOUYgODcgQUJcIiwgXCI4NyBCMiBGMCA5RiA4NyBCNVwiLCBcIjg3IEIwIEYwIDlGIDg3IEI1XCIsIFwiODcgQjMgRjAgOUYgODcgQjRcIiwgXCI4NyBCNCBGMCA5RiA4NyBCMlwiLCBcIjg3IEI1IEYwIDlGIDg3IEIwXCIsIFwiODcgQjUgRjAgOUYgODcgQkNcIiwgXCI4NyBCNSBGMCA5RiA4NyBCOFwiLCBcIjg3IEI1IEYwIDlGIDg3IEE2XCIsIFwiODcgQjUgRjAgOUYgODcgQUNcIiwgXCI4NyBCNSBGMCA5RiA4NyBCRVwiLCBcIjg3IEI1IEYwIDlGIDg3IEFBXCIsIFwiODcgQjUgRjAgOUYgODcgQURcIiwgXCI4NyBCNSBGMCA5RiA4NyBCM1wiLCBcIjg3IEI1IEYwIDlGIDg3IEIxXCIsIFwiODcgQjUgRjAgOUYgODcgQjlcIiwgXCI4NyBCNSBGMCA5RiA4NyBCN1wiLCBcIjg3IEI2IEYwIDlGIDg3IEE2XCIsIFwiODcgQjcgRjAgOUYgODcgQUFcIiwgXCI4NyBCNyBGMCA5RiA4NyBCNFwiLCBcIjg3IEI3IEYwIDlGIDg3IEJBXCIsIFwiODcgQjcgRjAgOUYgODcgQkNcIiwgXCI4NyBBNyBGMCA5RiA4NyBCMVwiLCBcIjg3IEI4IEYwIDlGIDg3IEFEXCIsIFwiODcgQjAgRjAgOUYgODcgQjNcIiwgXCI4NyBCMSBGMCA5RiA4NyBBOFwiLCBcIjg3IEI1IEYwIDlGIDg3IEIyXCIsIFwiODcgQkIgRjAgOUYgODcgQThcIiwgXCI4NyBCQyBGMCA5RiA4NyBCOFwiLCBcIjg3IEI4IEYwIDlGIDg3IEIyXCIsIFwiODcgQjggRjAgOUYgODcgQjlcIiwgXCI4NyBCOCBGMCA5RiA4NyBBNlwiLCBcIjg3IEI4IEYwIDlGIDg3IEIzXCIsIFwiODcgQjcgRjAgOUYgODcgQjhcIiwgXCI4NyBCOCBGMCA5RiA4NyBBOFwiLCBcIjg3IEI4IEYwIDlGIDg3IEIxXCIsIFwiODcgQjggRjAgOUYgODcgQUNcIiwgXCI4NyBCOCBGMCA5RiA4NyBCRFwiLCBcIjg3IEI4IEYwIDlGIDg3IEIwXCIsIFwiODcgQjggRjAgOUYgODcgQUVcIiwgXCI4NyBCOCBGMCA5RiA4NyBBN1wiLCBcIjg3IEI4IEYwIDlGIDg3IEI0XCIsIFwiODcgQkYgRjAgOUYgODcgQTZcIiwgXCI4NyBBQyBGMCA5RiA4NyBCOFwiLCBcIjg3IEIwIEYwIDlGIDg3IEI3XCIsIFwiODcgQjggRjAgOUYgODcgQjhcIiwgXCI4NyBBQSBGMCA5RiA4NyBCOFwiLCBcIjg3IEIxIEYwIDlGIDg3IEIwXCIsIFwiODcgQjggRjAgOUYgODcgQTlcIiwgXCI4NyBCOCBGMCA5RiA4NyBCN1wiLCBcIjg3IEI4IEYwIDlGIDg3IEJGXCIsIFwiODcgQjggRjAgOUYgODcgQUFcIiwgXCI4NyBBOCBGMCA5RiA4NyBBRFwiLCBcIjg3IEI4IEYwIDlGIDg3IEJFXCIsIFwiODcgQjkgRjAgOUYgODcgQkNcIiwgXCI4NyBCOSBGMCA5RiA4NyBBRlwiLCBcIjg3IEI5IEYwIDlGIDg3IEJGXCIsIFwiODcgQjkgRjAgOUYgODcgQURcIiwgXCI4NyBCOSBGMCA5RiA4NyBCMVwiLCBcIjg3IEI5IEYwIDlGIDg3IEFDXCIsIFwiODcgQjkgRjAgOUYgODcgQjBcIiwgXCI4NyBCOSBGMCA5RiA4NyBCNFwiLCBcIjg3IEI5IEYwIDlGIDg3IEI5XCIsIFwiODcgQjkgRjAgOUYgODcgQjNcIiwgXCI4NyBCOSBGMCA5RiA4NyBCN1wiLCBcIjg3IEI5IEYwIDlGIDg3IEIyXCIsIFwiODcgQjkgRjAgOUYgODcgQThcIiwgXCI4NyBCOSBGMCA5RiA4NyBCQlwiLCBcIjg3IEJBIEYwIDlGIDg3IEFDXCIsIFwiODcgQkEgRjAgOUYgODcgQTZcIiwgXCI4NyBBNiBGMCA5RiA4NyBBQVwiLCBcIjg3IEFDIEYwIDlGIDg3IEE3XCIsIFwiODcgQkEgRjAgOUYgODcgQjhcIiwgXCI4NyBCQiBGMCA5RiA4NyBBRVwiLCBcIjg3IEJBIEYwIDlGIDg3IEJFXCIsIFwiODcgQkEgRjAgOUYgODcgQkZcIiwgXCI4NyBCQiBGMCA5RiA4NyBCQVwiLCBcIjg3IEJCIEYwIDlGIDg3IEE2XCIsIFwiODcgQkIgRjAgOUYgODcgQUFcIiwgXCI4NyBCQiBGMCA5RiA4NyBCM1wiLCBcIjg3IEJDIEYwIDlGIDg3IEFCXCIsIFwiODcgQUEgRjAgOUYgODcgQURcIiwgXCI4NyBCRSBGMCA5RiA4NyBBQVwiLCBcIjg3IEJGIEYwIDlGIDg3IEIyXCIsIFwiODcgQkYgRjAgOUYgODcgQkNcIl1cblx0bmV0d29yazpcIlxuPHN2ZyB3aWR0aD0nMTRweCcgaGVpZ2h0PScxMHB4JyB2aWV3Qm94PSc4NyA1IDE0IDEwJyB2ZXJzaW9uPScxLjEnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgeG1sbnM6eGxpbms9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnPlxuICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggMy43LjIgKDI4Mjc2KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT5cbiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz5cbiAgICA8ZGVmcz48L2RlZnM+XG4gICAgPHBhdGggZD0nTTk2LjE0NDQyMDgsMTIuNDM4NTA0MyBDOTUuNjI2Mzc0LDExLjg0NTQ0NTYgOTQuODUyMzYxNiwxMS40Njg5MTE5IDkzLjk4NzU2MywxMS40Njg5MTE5IEM5My4xMzkwMDczLDExLjQ2ODkxMTkgOTIuMzc3ODU5NCwxMS44MzE0MzQxIDkxLjg2MDE2NTIsMTIuNDA1MzE3NyBMOTQuMDIyNTM5MSwxNC41IEw5Ni4xNDQ0MjA4LDEyLjQzODUwNDMgWiBNOTguMzIzNDk2NCwxMC4zMjE0NDI1IEM5Ny4yNDQ3Nzk0LDkuMTkxNzQ1NjMgOTUuNzAxNDM4Nyw4LjQ4NDQ1NTk2IDkzLjk4NzU2Myw4LjQ4NDQ1NTk2IEM5Mi4yODgyNzIzLDguNDg0NDU1OTYgOTAuNzU2NjI2NCw5LjE3OTc1ODkzIDg5LjY3OTI2OTgsMTAuMjkyNjkzNiBMOTAuNzY5Mjk4NywxMS4zNDg2IEM5MS41NjcyMDUsMTAuNTA1MzcwOCA5Mi43MTM2NDgsOS45NzY2ODM5NCA5My45ODc1NjMsOS45NzY2ODM5NCBDOTUuMjc2ODgzNiw5Ljk3NjY4Mzk0IDk2LjQzNTYzMDUsMTAuNTE4MjM1IDk3LjIzNDYyMTUsMTEuMzc5MzI5MyBMOTguMzIzNDk2NCwxMC4zMjE0NDI1IEw5OC4zMjM0OTY0LDEwLjMyMTQ0MjUgWiBNMTAwLjUsOC4yMDY4NzkzMyBDOTguODYyOTU3OCw2LjUzOTQzNjcyIDk2LjU1MDU2OTksNS41IDkzLjk4NzU2Myw1LjUgQzkxLjQzNzUxMDMsNS41IDg5LjEzNTU0OTYsNi41Mjg5NTYwNSA4Ny41LDguMTgxNjQ0MzEgTDg4LjU4OTU1NzksOS4yMzcwOTQ0MSBDODkuOTQ2MDc5OCw3Ljg1NDMxNjU1IDkxLjg2Mjg5MjEsNi45OTIyMjc5OCA5My45ODc1NjMsNi45OTIyMjc5OCBDOTYuMTI2MDAyNiw2Ljk5MjIyNzk4IDk4LjA1Mzg4MDksNy44NjU1MjYwOSA5OS40MTE4Njk4LDkuMjY0MDQyNzIgTDEwMC41LDguMjA2ODc5MzMgWicgaWQ9J1dpLUZpJyBzdHJva2U9J25vbmUnIGZpbGw9JyMwMzAzMDMnIGZpbGwtcnVsZT0nZXZlbm9kZCc+PC9wYXRoPlxuPC9zdmc+XCJcblx0YWN0aXZpdHk6IFwiPD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0nVVRGLTgnIHN0YW5kYWxvbmU9J25vJz8+XG5cdFx0XHQ8c3ZnIHdpZHRoPScxNnB4JyBoZWlnaHQ9JzE2cHgnIHZpZXdCb3g9JzAgMCAxNiAxNicgdmVyc2lvbj0nMS4xJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHhtbG5zOnhsaW5rPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJyB4bWxuczpza2V0Y2g9J2h0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaC9ucyc+XG5cdFx0XHRcdDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggMy41LjIgKDI1MjM1KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT5cblx0XHRcdFx0PHRpdGxlPlNvY2NlciBCYWxsPC90aXRsZT5cblx0XHRcdFx0PGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+XG5cdFx0XHRcdDxkZWZzPlxuXHRcdFx0XHRcdDxjaXJjbGUgaWQ9J3BhdGgtMScgY3g9JzgnIGN5PSc4JyByPSc4Jz48L2NpcmNsZT5cblx0XHRcdFx0PC9kZWZzPlxuXHRcdFx0XHQ8ZyBpZD0nUGFnZS0xJyBzdHJva2U9J25vbmUnIHN0cm9rZS13aWR0aD0nMScgZmlsbD0nbm9uZScgZmlsbC1ydWxlPSdldmVub2RkJyBza2V0Y2g6dHlwZT0nTVNQYWdlJz5cblx0XHRcdFx0XHQ8ZyBpZD0naVBob25lLTYnIHNrZXRjaDp0eXBlPSdNU0FydGJvYXJkR3JvdXAnIHRyYW5zZm9ybT0ndHJhbnNsYXRlKC0xNzkuMDAwMDAwLCAtNjM5LjAwMDAwMCknPlxuXHRcdFx0XHRcdFx0PGcgaWQ9J1NvY2Nlci1CYWxsJyBza2V0Y2g6dHlwZT0nTVNMYXllckdyb3VwJyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSgxNzkuMDAwMDAwLCA2MzkuMDAwMDAwKSc+XG5cdFx0XHRcdFx0XHRcdDxtYXNrIGlkPSdtYXNrLTInIHNrZXRjaDpuYW1lPSdNYXNrJyBmaWxsPSd3aGl0ZSc+XG5cdFx0XHRcdFx0XHRcdFx0PHVzZSB4bGluazpocmVmPScjcGF0aC0xJz48L3VzZT5cblx0XHRcdFx0XHRcdFx0PC9tYXNrPlxuXHRcdFx0XHRcdFx0XHQ8dXNlIGlkPSdNYXNrJyBzdHJva2U9JyM0QTUzNjEnIHNrZXRjaDp0eXBlPSdNU1NoYXBlR3JvdXAnIHhsaW5rOmhyZWY9JyNwYXRoLTEnPjwvdXNlPlxuXHRcdFx0XHRcdFx0XHQ8cGF0aCBkPSdNNiwxMi4xMjAzMDQ2IEwxMi44NTczMzg0LDggTDEzLjM3MjM3NjUsOC44NTcxNjczIEw2LjUxNTAzODA3LDEyLjk3NzQ3MTkgTDYsMTIuMTIwMzA0NiBMNiwxMi4xMjAzMDQ2IFonIGlkPSdSZWN0YW5nbGUtNDcnIGZpbGw9JyM0QTUzNjEnIHNrZXRjaDp0eXBlPSdNU1NoYXBlR3JvdXAnIG1hc2s9J3VybCgjbWFzay0yKSc+PC9wYXRoPlxuXHRcdFx0XHRcdFx0XHQ8cGF0aCBkPSdNMTEuODQ5NjQ4LDguNzI2MDU1MSBMMTkuMTAwMTEwMyw1LjM0NTEwOTAxIEwxOS41MjI3Mjg1LDYuMjUxNDE2OCBMMTIuMjcyMjY2Miw5LjYzMjM2Mjg5IEwxMS44NDk2NDgsOC43MjYwNTUxIEwxMS44NDk2NDgsOC43MjYwNTUxIFonIGlkPSdSZWN0YW5nbGUtNDctQ29weS0zJyBmaWxsPScjNEE1MzYxJyBza2V0Y2g6dHlwZT0nTVNTaGFwZUdyb3VwJyBtYXNrPSd1cmwoI21hc2stMiknPjwvcGF0aD5cblx0XHRcdFx0XHRcdFx0PHBhdGggZD0nTTYsMy4xMjAzMDQ2IEwxMi44NTczMzg0LC0xIEwxMy4zNzIzNzY1LC0wLjE0MjgzMjY5OSBMNi41MTUwMzgwNywzLjk3NzQ3MTkgTDYsMy4xMjAzMDQ2IEw2LDMuMTIwMzA0NiBaJyBpZD0nUmVjdGFuZ2xlLTQ3LUNvcHktMicgZmlsbD0nIzRBNTM2MScgc2tldGNoOnR5cGU9J01TU2hhcGVHcm91cCcgbWFzaz0ndXJsKCNtYXNrLTIpJz48L3BhdGg+XG5cdFx0XHRcdFx0XHRcdDxwYXRoIGQ9J00tMSw3LjEyMDMwNDYgTDUuODU3MzM4NDEsMyBMNi4zNzIzNzY0OCwzLjg1NzE2NzMgTC0wLjQ4NDk2MTkyNSw3Ljk3NzQ3MTkgTC0xLDcuMTIwMzA0NiBMLTEsNy4xMjAzMDQ2IFonIGlkPSdSZWN0YW5nbGUtNDctQ29weS00JyBmaWxsPScjNEE1MzYxJyBza2V0Y2g6dHlwZT0nTVNTaGFwZUdyb3VwJyBtYXNrPSd1cmwoI21hc2stMiknPjwvcGF0aD5cblx0XHRcdFx0XHRcdFx0PHJlY3QgaWQ9J1JlY3RhbmdsZS01MCcgZmlsbD0nIzRBNTM2MScgc2tldGNoOnR5cGU9J01TU2hhcGVHcm91cCcgbWFzaz0ndXJsKCNtYXNrLTIpJyB4PSc0JyB5PSc2JyB3aWR0aD0nMScgaGVpZ2h0PSc1Jz48L3JlY3Q+XG5cdFx0XHRcdFx0XHRcdDxyZWN0IGlkPSdSZWN0YW5nbGUtNTEnIGZpbGw9JyM0QTUzNjEnIHNrZXRjaDp0eXBlPSdNU1NoYXBlR3JvdXAnIG1hc2s9J3VybCgjbWFzay0yKScgeD0nMTEuNScgeT0nMycgd2lkdGg9JzEnIGhlaWdodD0nMTInPjwvcmVjdD5cblx0XHRcdFx0XHRcdFx0PHBhdGggZD0nTTUsNC44NTcxNjczIEwxMS44NTczMzg0LDguOTc3NDcxOSBMMTIuMzcyMzc2NSw4LjEyMDMwNDYgTDUuNTE1MDM4MDcsNCBMNSw0Ljg1NzE2NzMnIGlkPSdSZWN0YW5nbGUtNDctQ29weScgZmlsbD0nIzRBNTM2MScgc2tldGNoOnR5cGU9J01TU2hhcGVHcm91cCcgbWFzaz0ndXJsKCNtYXNrLTIpJz48L3BhdGg+XG5cdFx0XHRcdFx0XHRcdDxwYXRoIGQ9J001LDEyLjg1NzE2NzMgTDExLjg1NzMzODQsMTYuOTc3NDcxOSBMMTIuMzcyMzc2NSwxNi4xMjAzMDQ2IEw1LjUxNTAzODA3LDEyIEw1LDEyLjg1NzE2NzMnIGlkPSdSZWN0YW5nbGUtNDctQ29weS01JyBmaWxsPScjNEE1MzYxJyBza2V0Y2g6dHlwZT0nTVNTaGFwZUdyb3VwJyBtYXNrPSd1cmwoI21hc2stMiknPjwvcGF0aD5cblx0XHRcdFx0XHRcdFx0PHBhdGggZD0nTTExLjkwNDg5NzIsNi4xNDc2NjA2NCBMMTMuODcxNDIyNyw4LjMzMTcwODQ5IEwxMi40MDE5NTk2LDEwLjg3Njg5MzMgTDkuNTI3MjU1ODksMTAuMjY1ODU2MiBMOS4yMjAwNTQ0NSw3LjM0MzAyOTY1IEwxMS45MDQ4OTcyLDYuMTQ3NjYwNjQnIGlkPSdQb2x5Z29uLTEnIGZpbGw9JyNEOEQ4RDgnIHNrZXRjaDp0eXBlPSdNU1NoYXBlR3JvdXAnIG1hc2s9J3VybCgjbWFzay0yKSc+PC9wYXRoPlxuXHRcdFx0XHRcdFx0XHQ8cGF0aCBkPSdNMTEuOTA0ODk3Miw2LjE0NzY2MDY0IEwxMy44NzE0MjI3LDguMzMxNzA4NDkgTDEyLjQwMTk1OTYsMTAuODc2ODkzMyBMOS41MjcyNTU4OSwxMC4yNjU4NTYyIEw5LjIyMDA1NDQ1LDcuMzQzMDI5NjUgTDExLjkwNDg5NzIsNi4xNDc2NjA2NCcgaWQ9J1BvbHlnb24tMS1Db3B5JyBmaWxsPScjNEE1MzYxJyBza2V0Y2g6dHlwZT0nTVNTaGFwZUdyb3VwJyBtYXNrPSd1cmwoI21hc2stMiknPjwvcGF0aD5cblx0XHRcdFx0XHRcdFx0PHBhdGggZD0nTTcuNDU3NzExODksMy4xOTUwNDczOSBMNy4zNTUxNDQ4NCw2LjEzMjE4MzMzIEw0LjUzMDA2NzYsNi45NDIyNjEyIEwyLjg4NjY0MDg5LDQuNTA1NzgwOSBMNC42OTYwMjQ1NywyLjE4OTg3NTQxIEw3LjQ1NzcxMTg5LDMuMTk1MDQ3MzknIGlkPSdQb2x5Z29uLTEtQ29weS0yJyBmaWxsPScjNEE1MzYxJyBza2V0Y2g6dHlwZT0nTVNTaGFwZUdyb3VwJyBtYXNrPSd1cmwoI21hc2stMiknPjwvcGF0aD5cblx0XHRcdFx0XHRcdFx0PHBhdGggZD0nTTcuNDU3NzExODksMTEuMTk1MDQ3NCBMNy4zNTUxNDQ4NCwxNC4xMzIxODMzIEw0LjUzMDA2NzYsMTQuOTQyMjYxMiBMMi44ODY2NDA4OSwxMi41MDU3ODA5IEw0LjY5NjAyNDU3LDEwLjE4OTg3NTQgTDcuNDU3NzExODksMTEuMTk1MDQ3NCcgaWQ9J1BvbHlnb24tMS1Db3B5LTMnIGZpbGw9JyM0QTUzNjEnIHNrZXRjaDp0eXBlPSdNU1NoYXBlR3JvdXAnIG1hc2s9J3VybCgjbWFzay0yKSc+PC9wYXRoPlxuXHRcdFx0XHRcdFx0XHQ8cGF0aCBkPSdNMTQuNTQzMTcwMSwwLjA3MjU5MzkzMTQgTDE0LjQ0MDYwMzEsMy4wMDk3Mjk4OCBMMTEuNjE1NTI1OCwzLjgxOTgwNzc0IEw5Ljk3MjA5OTEyLDEuMzgzMzI3NDUgTDExLjc4MTQ4MjgsLTAuOTMyNTc4MDUgTDE0LjU0MzE3MDEsMC4wNzI1OTM5MzE0JyBpZD0nUG9seWdvbi0xLUNvcHktNCcgZmlsbD0nIzRBNTM2MScgc2tldGNoOnR5cGU9J01TU2hhcGVHcm91cCcgbWFzaz0ndXJsKCNtYXNrLTIpJz48L3BhdGg+XG5cdFx0XHRcdFx0XHQ8L2c+XG5cdFx0XHRcdFx0PC9nPlxuXHRcdFx0XHQ8L2c+XG5cdFx0XHQ8L3N2Zz5cIlxuXHRhbmltYWxzOiBcIjw/eG1sIHZlcnNpb249JzEuMCcgZW5jb2Rpbmc9J1VURi04JyBzdGFuZGFsb25lPSdubyc/PlxuXHRcdFx0PHN2ZyB3aWR0aD0nMTdweCcgaGVpZ2h0PScxNnB4JyB2aWV3Qm94PScwIDAgMTcgMTcnIHZlcnNpb249JzEuMScgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB4bWxuczp4bGluaz0naHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycgeG1sbnM6c2tldGNoPSdodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gvbnMnPlxuXHRcdFx0XHQ8IS0tIEdlbmVyYXRvcjogU2tldGNoIDMuNS4yICgyNTIzNSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+XG5cdFx0XHRcdDx0aXRsZT5Hcm91cDwvdGl0bGU+XG5cdFx0XHRcdDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPlxuXHRcdFx0XHQ8ZGVmcz48L2RlZnM+XG5cdFx0XHRcdDxnIGlkPSdQYWdlLTEnIHN0cm9rZT0nbm9uZScgc3Ryb2tlLXdpZHRoPScxJyBmaWxsPSdub25lJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnIHNrZXRjaDp0eXBlPSdNU1BhZ2UnPlxuXHRcdFx0XHRcdDxnIGlkPSdpUGhvbmUtNicgc2tldGNoOnR5cGU9J01TQXJ0Ym9hcmRHcm91cCcgdHJhbnNmb3JtPSd0cmFuc2xhdGUoLTExNy4wMDAwMDAsIC02MzkuMDAwMDAwKScgc3Ryb2tlPScjNEE1MzYxJz5cblx0XHRcdFx0XHRcdDxnIGlkPSdpY19Gb29kJyBza2V0Y2g6dHlwZT0nTVNMYXllckdyb3VwJyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSgxMTguMDAwMDAwLCA2NDAuMDAwMDAwKSc+XG5cdFx0XHRcdFx0XHRcdDxnIGlkPSdHcm91cCcgc2tldGNoOnR5cGU9J01TU2hhcGVHcm91cCc+XG5cdFx0XHRcdFx0XHRcdFx0PHBhdGggZD0nTTUuNjgzNzc1MzcsMS4zODE1NjY0NiBDNi4yMzkyNjA2NiwxLjEzNjI0IDYuODUzNzIwMDUsMSA3LjUsMSBDOC4xNDYyNzk5NSwxIDguNzYwNzM5MzQsMS4xMzYyNCA5LjMxNjIyNDYzLDEuMzgxNTY2NDYgQzkuODA4NzkyNzUsMC41NjIzNTkwMTkgMTAuODI1NTg4OCwwIDEyLDAgQzEzLjY1Njg1NDIsMCAxNSwxLjExOTI4ODEzIDE1LDIuNSBDMTUsMy41NTcxMzk4IDE0LjIxMjYyNDYsNC40NjEwMjg0MyAxMy4wOTk5MjI2LDQuODI2NjI1MTQgQzE0LjI0OTY1MjgsNS42NDE4NTQyMiAxNSw2Ljk4MzMwMDYyIDE1LDguNSBDMTUsMTAuNzE2NzE0NCAxMy4zOTcxODczLDEyLjU1OTA3MTkgMTEuMjg3MjY3MSwxMi45MzEzNjczIEMxMC40ODY3MjQ4LDE0LjE3NTc3MDMgOS4wODk2MTY5NiwxNSA3LjUsMTUgQzUuOTEwMzgzMDQsMTUgNC41MTMyNzUyNCwxNC4xNzU3NzAzIDMuNzEyNzMyOTEsMTIuOTMxMzY3MyBDMS42MDI4MTI2OCwxMi41NTkwNzE5IDAsMTAuNzE2NzE0NCAwLDguNSBDMCw2Ljk4MzMwMDYyIDAuNzUwMzQ3MjQ0LDUuNjQxODU0MjIgMS45MDAwNzc0MSw0LjgyNjYyNTE0IEMwLjc4NzM3NTQ0NSw0LjQ2MTAyODQzIDAsMy41NTcxMzk4IDAsMi41IEMwLDEuMTE5Mjg4MTMgMS4zNDMxNDU3NSwwIDMsMCBDNC4xNzQ0MTEyMiwwIDUuMTkxMjA3MjUsMC41NjIzNTkwMTkgNS42ODM3NzUzNywxLjM4MTU2NjQ2IFonIGlkPSdPdmFsLTgnPjwvcGF0aD5cblx0XHRcdFx0XHRcdFx0XHQ8cGF0aCBkPSdNNS43MzgzNDIyOCwxMiBDNS44NjI5MDk3OSwxMiA2LjE0NjQyMzUzLDEyIDYuMTQ2NDIzNTMsMTIgQzYuMTQ2NDIzNTMsMTIgNi40MzIxNTY5NiwxMi40NDI2MTIzIDYuNTI0NjU4MiwxMi40OTE5NzM5IEM2LjY2NDU1NjAxLDEyLjU2NjYyNzcgNywxMi40OTE5NzM5IDcsMTIuNDkxOTczOSBMNywxMiBMOCwxMiBMOCwxMi40OTE5NzM5IEw4LjQ5Nzk5MjI4LDEyLjQ5MTk3MzkgTDguODQzMDE3NjksMTIgTDkuMzkxODQ1NywxMiBDOS4zOTE4NDU3LDEyIDguOTk1OTg0NTcsMTIuOTgzOTQ3OCA4LjQ5Nzk5MjI4LDEyLjk4Mzk0NzggTDYuNjA3MDI0MDcsMTIuOTgzOTQ3OCBDNi4yMTQwNDgxMywxMi45ODM5NDc4IDUuNDU5OTYwOTQsMTIgNS43MzgzNDIyOCwxMiBaJyBpZD0nUmVjdGFuZ2xlLTQ0LUNvcHktMic+PC9wYXRoPlxuXHRcdFx0XHRcdFx0XHRcdDxjaXJjbGUgaWQ9J092YWwtMTQnIGN4PScxMC41JyBjeT0nNy41JyByPScwLjUnPjwvY2lyY2xlPlxuXHRcdFx0XHRcdFx0XHRcdDxjaXJjbGUgaWQ9J092YWwtMTQtQ29weScgY3g9JzQuNScgY3k9JzcuNScgcj0nMC41Jz48L2NpcmNsZT5cblx0XHRcdFx0XHRcdFx0XHQ8cGF0aCBkPSdNMTIuNjk5OTk2OSw1IEMxMi42OTk5OTY5LDMuMDY3MDAzMzggMTEuMTMyOTkzNiwxLjUgOS4xOTk5OTY5NSwxLjUnIGlkPSdPdmFsLTE2Jz48L3BhdGg+XG5cdFx0XHRcdFx0XHRcdFx0PHBhdGggZD0nTTUuNSw1IEM1LjUsMy4wNjcwMDMzOCAzLjkzMjk5NjYyLDEuNSAyLDEuNScgaWQ9J092YWwtMTYtQ29weScgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMy43NTAwMDAsIDMuMjUwMDAwKSBzY2FsZSgtMSwgMSkgdHJhbnNsYXRlKC0zLjc1MDAwMCwgLTMuMjUwMDAwKSAnPjwvcGF0aD5cblx0XHRcdFx0XHRcdFx0XHQ8cmVjdCBpZD0nUmVjdGFuZ2xlLTQ0LUNvcHknIHg9JzcnIHk9JzExJyB3aWR0aD0nMScgaGVpZ2h0PScxJz48L3JlY3Q+XG5cdFx0XHRcdFx0XHRcdFx0PHBhdGggZD0nTTYsMTAgTDYuNSwxMCBMNi40OTk5OTk5OSw5LjUgTDguNTAwMDAwMDUsOS41IEw4LjUwMDAwMDA1LDEwIEw5LDEwIEw5LDEwLjUgTDguNSwxMC41IEw4LjUsMTEgTDYuNSwxMSBMNi41LDEwLjUgTDYsMTAuNSBMNiwxMCBaJyBpZD0nUGF0aCc+PC9wYXRoPlxuXHRcdFx0XHRcdFx0XHQ8L2c+XG5cdFx0XHRcdFx0XHQ8L2c+XG5cdFx0XHRcdFx0PC9nPlxuXHRcdFx0XHQ8L2c+XG5cdFx0XHQ8L3N2Zz5cIlxuXHRjaGV2cm9uIDogXCI8P3htbCB2ZXJzaW9uPScxLjAnIGVuY29kaW5nPSdVVEYtOCcgc3RhbmRhbG9uZT0nbm8nPz5cblx0XHQ8c3ZnIHdpZHRoPScxM3B4JyBoZWlnaHQ9JzIycHgnIHZpZXdCb3g9JzAgMCAxMyAyMicgdmVyc2lvbj0nMS4xJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHhtbG5zOnhsaW5rPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJz5cblx0XHQgICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCAzLjYuMSAoMjYzMTMpIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPlxuXHRcdCAgICA8dGl0bGU+QmFjayBDaGV2cm9uPC90aXRsZT5cblx0XHQgICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+XG5cdFx0ICAgIDxkZWZzPjwvZGVmcz5cblx0XHQgICAgPGcgaWQ9J1BhZ2UtMScgc3Ryb2tlPSdub25lJyBzdHJva2Utd2lkdGg9JzEnIGZpbGw9J25vbmUnIGZpbGwtcnVsZT0nZXZlbm9kZCc+XG5cdFx0ICAgICAgICA8ZyBpZD0nTmF2aWdhdGlvbi1CYXIvQmFjaycgdHJhbnNmb3JtPSd0cmFuc2xhdGUoLTguMDAwMDAwLCAtMzEuMDAwMDAwKScgZmlsbD0nIzAwNzZGRic+XG5cdFx0ICAgICAgICAgICAgPHBhdGggZD0nTTguNSw0MiBMMTksMzEuNSBMMjEsMzMuNSBMMTIuNSw0MiBMMjEsNTAuNSBMMTksNTIuNSBMOC41LDQyIFonIGlkPSdCYWNrLUNoZXZyb24nPjwvcGF0aD5cblx0XHQgICAgICAgIDwvZz5cblx0XHQgICAgPC9nPlxuXHRcdDwvc3ZnPlwiXG5cdGVtb2ppczogW1wi8J+YgFwiLCBcIvCfmKxcIiwgXCLwn5iBXCIsIFwi8J+YglwiLCBcIvCfmINcIiwgXCLwn5iEXCIsIFwi8J+YhVwiLCBcIvCfmIZcIiwgXCLwn5iHXCIsIFwi8J+YiVwiLCBcIvCfmIpcIiwgXCLwn5mCXCIsIFwi8J+Zg1wiLCBcIuKYuu+4j1wiLCBcIvCfmItcIiwgXCLwn5iMXCIsIFwi8J+YjVwiLCBcIvCfmJhcIiwgXCLwn5iXXCIsIFwi8J+YmVwiLCBcIvCfmJpcIiwgXCLwn5icXCIsIFwi8J+YnVwiLCBcIvCfmJtcIiwgXCLwn6SRXCIsIFwi8J+kk1wiLCBcIvCfmI5cIiwgXCLwn6SXXCIsIFwi8J+Yj1wiLCBcIvCfmLZcIiwgXCLwn5iQXCIsIFwi8J+YkVwiLCBcIvCfmJJcIiwgXCLwn5mEXCIsIFwi8J+klFwiLCBcIvCfmLNcIiwgXCLwn5ieXCIsIFwi8J+Yn1wiLCBcIvCfmKBcIiwgXCLwn5ihXCIsIFwi8J+YlFwiLCBcIvCfmJVcIiwgXCLwn5mBXCIsIFwi4pi577iPXCIsIFwi8J+Yo1wiLCBcIvCfmJZcIiwgXCLwn5irXCIsIFwi8J+YqVwiLCBcIvCfmKRcIiwgXCLwn5iuXCIsIFwi8J+YsVwiLCBcIvCfmKhcIiwgXCLwn5iwXCIsIFwi8J+Yr1wiLCBcIvCfmKZcIiwgXCLwn5inXCIsIFwi8J+YolwiLCBcIvCfmKVcIiwgXCLwn5iqXCIsIFwi8J+Yk1wiLCBcIvCfmK1cIiwgXCLwn5i1XCIsIFwi8J+YslwiLCBcIvCfpJBcIiwgXCLwn5i3XCIsIFwi8J+kklwiLCBcIvCfpJVcIiwgXCLwn5i0XCIsIFwi8J+SpFwiLCBcIvCfkqlcIiwgXCLwn5iIXCIsIFwi8J+Rv1wiLCBcIvCfkblcIiwgXCLwn5G6XCIsIFwi8J+SgFwiLCBcIvCfkbtcIiwgXCLwn5G9XCIsIFwi8J+kllwiLCBcIvCfmLpcIiwgXCLwn5i4XCIsIFwi8J+YuVwiLCBcIvCfmLtcIiwgXCLwn5i8XCIsIFwi8J+YvVwiLCBcIvCfmYBcIiwgXCLwn5i/XCIsIFwi8J+YvlwiLCBcIvCfmYxcIiwgXCLwn5GPXCIsIFwi8J+Ri1wiLCBcIvCfkY1cIiwgXCLwn5GOXCIsIFwi8J+RilwiLCBcIuKcilwiLCBcIuKcjO+4j1wiLCBcIvCfkYxcIiwgXCLinItcIiwgXCLwn5GQXCIsIFwi8J+SqlwiLCBcIvCfmY9cIiwgXCLimJ3vuI9cIiwgXCLwn5GGXCIsIFwi8J+Rh1wiLCBcIvCfkYhcIiwgXCLwn5GJXCIsIFwi8J+WlVwiLCBcIvCflpBcIiwgXCLwn6SYXCIsIFwi8J+WllwiLCBcIuKcje+4j1wiLCBcIvCfkoVcIiwgXCLwn5GEXCIsIFwi8J+RhVwiLCBcIvCfkYJcIiwgXCLwn5GDXCIsIFwi8J+RgVwiLCBcIvCfkYBcIiwgXCLwn5GkXCIsIFwi8J+RpVwiLCBcIvCfl6NcIiwgXCLwn5G2XCIsIFwi8J+RplwiLCBcIvCfkadcIiwgXCLwn5GoXCIsIFwi8J+RqVwiLCBcIvCfkbFcIiwgXCLwn5G0XCIsIFwi8J+RtVwiLCBcIvCfkbJcIiwgXCLwn5GzXCIsIFwi8J+RrlwiLCBcIvCfkbdcIiwgXCLwn5KCXCIsIFwi8J+VtVwiLCBcIvCfjoVcIiwgXCLwn5G8XCIsIFwi8J+RuFwiLCBcIvCfkbBcIiwgXCLwn5q2XCIsIFwi8J+Pg1wiLCBcIvCfkoNcIiwgXCLwn5GvXCIsIFwi8J+Rq1wiLCBcIvCfkaxcIiwgXCLwn5GtXCIsIFwi8J+Zh1wiLCBcIvCfkoFcIiwgXCLwn5mFXCIsIFwi8J+ZhlwiLCBcIvCfmYtcIiwgXCLwn5mOXCIsIFwi8J+ZjVwiLCBcIvCfkodcIiwgXCLwn5KGXCIsIFwi8J+SkVwiLCBcIvCfkanigI3inaTvuI/igI3wn5GpXCIsIFwi8J+RqOKAjeKdpO+4j+KAjfCfkahcIiwgXCLwn5KPXCIsIFwi8J+RqeKAjeKdpO+4j+KAjfCfkovigI3wn5GpXCIsIFwi8J+RqOKAjeKdpO+4j+KAjfCfkovigI3wn5GoXCIsIFwi8J+RqlwiLCBcIvCfkajigI3wn5Gp4oCN8J+Rp1wiLCBcIvCfkajigI3wn5Gp4oCN8J+Rp+KAjfCfkaZcIiwgXCLwn5Go4oCN8J+RqeKAjfCfkabigI3wn5GmXCIsIFwi8J+RqOKAjfCfkanigI3wn5Gn4oCN8J+Rp1wiLCBcIvCfkanigI3wn5Gp4oCN8J+RplwiLCBcIvCfkanigI3wn5Gp4oCN8J+Rp1wiLCBcIvCfkanigI3wn5Gp4oCN8J+Rp+KAjfCfkaZcIiwgXCLwn5Gp4oCN8J+RqeKAjfCfkabigI3wn5GmXCIsIFwi8J+RqeKAjfCfkanigI3wn5Gn4oCN8J+Rp1wiLCBcIvCfkajigI3wn5Go4oCN8J+RplwiLCBcIvCfkajigI3wn5Go4oCN8J+Rp1wiLCBcIvCfkajigI3wn5Go4oCN8J+Rp+KAjfCfkaZcIiwgXCLwn5Go4oCN8J+RqOKAjfCfkabigI3wn5GmXCIsIFwi8J+RqOKAjfCfkajigI3wn5Gn4oCN8J+Rp1wiLCBcIvCfkZpcIiwgXCLwn5GVXCIsIFwi8J+RllwiLCBcIvCfkZRcIiwgXCLwn5GXXCIsIFwi8J+RmVwiLCBcIvCfkZhcIiwgXCLwn5KEXCIsIFwi8J+Si1wiLCBcIvCfkaNcIiwgXCLwn5GgXCIsIFwi8J+RoVwiLCBcIvCfkaJcIiwgXCLwn5GeXCIsIFwi8J+Rn1wiLCBcIvCfkZJcIiwgXCLwn46pXCIsIFwi4puRXCIsIFwi8J+Ok1wiLCBcIvCfkZFcIiwgXCLwn46SXCIsIFwi8J+RnVwiLCBcIvCfkZtcIiwgXCLwn5GcXCIsIFwi8J+SvFwiLCBcIvCfkZNcIiwgXCLwn5W2XCIsIFwi8J+SjVwiLCBcIvCfjIJcIiwgXCLwn5uRXCIsIFwi8J+QtlwiLCBcIvCfkLFcIiwgXCLwn5CtXCIsIFwi8J+QuVwiLCBcIvCfkLBcIiwgXCLwn5C7XCIsIFwi8J+QvFwiLCBcIvCfkKhcIiwgXCLwn5CvXCIsIFwi8J+mgVwiLCBcIvCfkK5cIiwgXCLwn5C3XCIsIFwi8J+QvVwiLCBcIvCfkLhcIiwgXCLwn5CZXCIsIFwi8J+QtVwiLCBcIvCfmYhcIiwgXCLwn5mJXCIsIFwi8J+ZilwiLCBcIvCfkJJcIiwgXCLwn5CUXCIsIFwi8J+Qp1wiLCBcIvCfkKZcIiwgXCLwn5CkXCIsIFwi8J+Qo1wiLCBcIvCfkKVcIiwgXCLwn5C6XCIsIFwi8J+Ql1wiLCBcIvCfkLRcIiwgXCLwn6aEXCIsIFwi8J+QnVwiLCBcIvCfkJtcIiwgXCLwn5CMXCIsIFwi8J+QnlwiLCBcIvCfkJxcIiwgXCLwn5W3XCIsIFwi8J+mglwiLCBcIvCfpoBcIiwgXCLwn5CNXCIsIFwi8J+QolwiLCBcIvCfkKBcIiwgXCLwn5CfXCIsIFwi8J+QoVwiLCBcIvCfkKxcIiwgXCLwn5CzXCIsIFwi8J+Qi1wiLCBcIvCfkIpcIiwgXCLwn5CGXCIsIFwi8J+QhVwiLCBcIvCfkINcIiwgXCLwn5CCXCIsIFwi8J+QhFwiLCBcIvCfkKpcIiwgXCLwn5CrXCIsIFwi8J+QmFwiLCBcIvCfkJBcIiwgXCLwn5CPXCIsIFwi8J+QkVwiLCBcIvCfkI5cIiwgXCLwn5CWXCIsIFwi8J+QgFwiLCBcIvCfkIFcIiwgXCLwn5CTXCIsIFwi8J+mg1wiLCBcIvCflYpcIiwgXCLwn5CVXCIsIFwi8J+QqVwiLCBcIvCfkIhcIiwgXCLwn5CHXCIsIFwi8J+Qv1wiLCBcIvCfkL5cIiwgXCLwn5CJXCIsIFwi8J+QslwiLCBcIvCfjLVcIiwgXCLwn46EXCIsIFwi8J+MslwiLCBcIvCfjLNcIiwgXCLwn4y0XCIsIFwi8J+MsVwiLCBcIvCfjL9cIiwgXCLimJhcIiwgXCLwn42AXCIsIFwi8J+OjVwiLCBcIvCfjotcIiwgXCLwn42DXCIsIFwi8J+NglwiLCBcIvCfjYFcIiwgXCLwn4y+XCIsIFwi8J+MulwiLCBcIvCfjLpcIiwgXCLwn4y7XCIsIFwi8J+MuVwiLCBcIvCfjLdcIiwgXCLwn4y8XCIsIFwi8J+MuFwiLCBcIvCfkpBcIiwgXCLwn42EXCIsIFwi8J+MsFwiLCBcIvCfjoNcIiwgXCLwn5CaXCIsIFwi8J+VuFwiLCBcIvCfjI5cIiwgXCLwn4yNXCIsIFwi8J+Mj1wiLCBcIvCfjJVcIiwgXCLwn4yWXCIsIFwi8J+Ml1wiLCBcIvCfjJhcIiwgXCLwn4yRXCIsIFwi8J+MklwiLCBcIvCfjJNcIiwgXCLwn4yUXCIsIFwi8J+MmlwiLCBcIvCfjJ1cIiwgXCLwn4ybXCIsIFwi8J+MnFwiLCBcIvCfjJ5cIiwgXCLwn4yZXCIsIFwi4q2Q77iPXCIsIFwi8J+Mn1wiLCBcIvCfkqtcIiwgXCLinKhcIiwgXCLimITvuI9cIiwgXCLimIDvuI9cIiwgXCLwn4ykXCIsIFwi4puF77iPXCIsIFwi8J+MpVwiLCBcIvCfjKZcIiwgXCLimIHvuI9cIiwgXCLwn4ynXCIsIFwi4puIXCIsIFwi8J+MqVwiLCBcIuKaoe+4j1wiLCBcIvCflKVcIiwgXCLwn5KlXCIsIFwi4p2E77iPXCIsIFwi8J+MqFwiLCBcIuKYg++4j1wiLCBcIuKbhO+4j1wiLCBcIvCfjKxcIiwgXCLwn5KoXCIsIFwi8J+MqlwiLCBcIvCfjKtcIiwgXCLimILvuI9cIiwgXCLimJTvuI9cIiwgXCLwn5KnXCIsIFwi8J+SplwiLCBcIvCfjIpcIiwgXCLwn5uRXCIsIFwi8J+bkVwiLCBcIvCfjY9cIiwgXCLwn42OXCIsIFwi8J+NkFwiLCBcIvCfjYpcIiwgXCLwn42LXCIsIFwi8J+NjFwiLCBcIvCfjYlcIiwgXCLwn42HXCIsIFwi8J+Nk1wiLCBcIvCfjYhcIiwgXCLwn42SXCIsIFwi8J+NkVwiLCBcIvCfjY1cIiwgXCLwn42FXCIsIFwi8J+NhlwiLCBcIvCfjLZcIiwgXCLwn4y9XCIsIFwi8J+NoFwiLCBcIvCfja9cIiwgXCLwn42eXCIsIFwi8J+ngFwiLCBcIvCfjZdcIiwgXCLwn42WXCIsIFwi8J+NpFwiLCBcIvCfjbNcIiwgXCLwn42UXCIsIFwi8J+Nn1wiLCBcIvCfjK1cIiwgXCLwn42VXCIsIFwi8J+NnVwiLCBcIvCfjK5cIiwgXCLwn4yvXCIsIFwi8J+NnFwiLCBcIvCfjbJcIiwgXCLwn42lXCIsIFwi8J+No1wiLCBcIvCfjbFcIiwgXCLwn42bXCIsIFwi8J+NmVwiLCBcIvCfjZpcIiwgXCLwn42YXCIsIFwi8J+NolwiLCBcIvCfjaFcIiwgXCLwn42nXCIsIFwi8J+NqFwiLCBcIvCfjaZcIiwgXCLwn42wXCIsIFwi8J+OglwiLCBcIvCfja5cIiwgXCLwn42sXCIsIFwi8J+NrVwiLCBcIvCfjatcIiwgXCLwn42/XCIsIFwi8J+NqVwiLCBcIvCfjapcIiwgXCLwn426XCIsIFwi8J+Nu1wiLCBcIvCfjbdcIiwgXCLwn424XCIsIFwi8J+NuVwiLCBcIvCfjb5cIiwgXCLwn422XCIsIFwi8J+NtVwiLCBcIuKYle+4j1wiLCBcIvCfjbxcIiwgXCLwn420XCIsIFwi8J+NvVwiLCBcIvCfm5FcIiwgXCLwn5uRXCIsIFwi8J+bkVwiLCBcIuKave+4j1wiLCBcIvCfj4BcIiwgXCLwn4+IXCIsIFwi4pq+77iPXCIsIFwi8J+OvlwiLCBcIvCfj5BcIiwgXCLwn4+JXCIsIFwi8J+OsVwiLCBcIuKbs++4j1wiLCBcIvCfj4xcIiwgXCLwn4+TXCIsIFwi8J+PuFwiLCBcIvCfj5JcIiwgXCLwn4+RXCIsIFwi8J+Pj1wiLCBcIvCfjr9cIiwgXCLim7dcIiwgXCLwn4+CXCIsIFwi4pu4XCIsIFwi8J+PuVwiLCBcIvCfjqNcIiwgXCLwn5qjXCIsIFwi8J+PilwiLCBcIvCfj4RcIiwgXCLwn5uAXCIsIFwi4pu5XCIsIFwi8J+Pi1wiLCBcIvCfmrRcIiwgXCLwn5q1XCIsIFwi8J+Ph1wiLCBcIvCflbRcIiwgXCLwn4+GXCIsIFwi8J+OvVwiLCBcIvCfj4VcIiwgXCLwn46WXCIsIFwi8J+Ol1wiLCBcIvCfj7VcIiwgXCLwn46rXCIsIFwi8J+On1wiLCBcIvCfjq1cIiwgXCLwn46oXCIsIFwi8J+OqlwiLCBcIvCfjqRcIiwgXCLwn46nXCIsIFwi8J+OvFwiLCBcIvCfjrlcIiwgXCLwn463XCIsIFwi8J+OulwiLCBcIvCfjrhcIiwgXCLwn467XCIsIFwi8J+OrFwiLCBcIvCfjq5cIiwgXCLwn5G+XCIsIFwi8J+Or1wiLCBcIvCfjrJcIiwgXCLwn46wXCIsIFwi8J+Os1wiLCBcIvCfm5FcIiwgXCLwn5uRXCIsIFwi8J+bkVwiLCBcIvCfmpdcIiwgXCLwn5qVXCIsIFwi8J+amVwiLCBcIvCfmoxcIiwgXCLwn5qOXCIsIFwi8J+PjlwiLCBcIvCfmpNcIiwgXCLwn5qRXCIsIFwi8J+aklwiLCBcIvCfmpBcIiwgXCLwn5qaXCIsIFwi8J+am1wiLCBcIvCfmpxcIiwgXCLwn4+NXCIsIFwi8J+aslwiLCBcIvCfmqhcIiwgXCLwn5qUXCIsIFwi8J+ajVwiLCBcIvCfmphcIiwgXCLwn5qWXCIsIFwi8J+aoVwiLCBcIvCfmqBcIiwgXCLwn5qvXCIsIFwi8J+ag1wiLCBcIvCfmotcIiwgXCLwn5qdXCIsIFwi8J+ahFwiLCBcIvCfmoVcIiwgXCLwn5qIXCIsIFwi8J+anlwiLCBcIvCfmoJcIiwgXCLwn5qGXCIsIFwi8J+ah1wiLCBcIvCfmopcIiwgXCLwn5qJXCIsIFwi8J+agVwiLCBcIvCfm6lcIiwgXCLinIjvuI9cIiwgXCLwn5urXCIsIFwi8J+brFwiLCBcIuKbte+4j1wiLCBcIvCfm6VcIiwgXCLwn5qkXCIsIFwi4pu0XCIsIFwi8J+bs1wiLCBcIvCfmoBcIiwgXCLwn5uwXCIsIFwi8J+SulwiLCBcIuKak++4j1wiLCBcIvCfmqdcIiwgXCLim73vuI9cIiwgXCLwn5qPXCIsIFwi8J+aplwiLCBcIvCfmqVcIiwgXCLwn4+BXCIsIFwi8J+aolwiLCBcIvCfjqFcIiwgXCLwn46iXCIsIFwi8J+OoFwiLCBcIvCfj5dcIiwgXCLwn4yBXCIsIFwi8J+XvFwiLCBcIvCfj61cIiwgXCLim7LvuI9cIiwgXCLwn46RXCIsIFwi4puwXCIsIFwi8J+PlFwiLCBcIvCfl7tcIiwgXCLwn4yLXCIsIFwi8J+XvlwiLCBcIvCfj5VcIiwgXCLim7rvuI9cIiwgXCLwn4+eXCIsIFwi8J+bo1wiLCBcIvCfm6RcIiwgXCLwn4yFXCIsIFwi8J+MhFwiLCBcIvCfj5xcIiwgXCLwn4+WXCIsIFwi8J+PnVwiLCBcIvCfjIdcIiwgXCLwn4yGXCIsIFwi8J+PmVwiLCBcIvCfjINcIiwgXCLwn4yJXCIsIFwi8J+MjFwiLCBcIvCfjKBcIiwgXCLwn46HXCIsIFwi8J+OhlwiLCBcIvCfjIhcIiwgXCLwn4+YXCIsIFwi8J+PsFwiLCBcIvCfj69cIiwgXCLwn4+fXCIsIFwi8J+XvVwiLCBcIvCfj6BcIiwgXCLwn4+hXCIsIFwi8J+PmlwiLCBcIvCfj6JcIiwgXCLwn4+sXCIsIFwi8J+Po1wiLCBcIvCfj6RcIiwgXCLwn4+lXCIsIFwi8J+PplwiLCBcIvCfj6hcIiwgXCLwn4+qXCIsIFwi8J+Pq1wiLCBcIvCfj6lcIiwgXCLwn5KSXCIsIFwi8J+Pm1wiLCBcIuKbqu+4j1wiLCBcIvCflYxcIiwgXCLwn5WNXCIsIFwi8J+Vi1wiLCBcIuKbqVwiLCBcIuKMmu+4j1wiLCBcIvCfk7FcIiwgXCLwn5OyXCIsIFwi8J+Su1wiLCBcIuKMqO+4j1wiLCBcIvCflqVcIiwgXCLwn5aoXCIsIFwi8J+WsVwiLCBcIvCflrJcIiwgXCLwn5W5XCIsIFwi8J+XnFwiLCBcIvCfkr1cIiwgXCLwn5K+XCIsIFwi8J+Sv1wiLCBcIvCfk4BcIiwgXCLwn5O8XCIsIFwi8J+Tt1wiLCBcIvCfk7hcIiwgXCLwn5O5XCIsIFwi8J+OpVwiLCBcIvCfk71cIiwgXCLwn46eXCIsIFwi8J+TnlwiLCBcIuKYju+4j1wiLCBcIvCfk59cIiwgXCLwn5OgXCIsIFwi8J+TulwiLCBcIvCfk7tcIiwgXCLwn46ZXCIsIFwi8J+OmlwiLCBcIvCfjptcIiwgXCLij7FcIiwgXCLij7JcIiwgXCLij7BcIiwgXCLwn5WwXCIsIFwi4o+zXCIsIFwi4oyb77iPXCIsIFwi8J+ToVwiLCBcIvCflItcIiwgXCLwn5SMXCIsIFwi8J+SoVwiLCBcIvCflKZcIiwgXCLwn5WvXCIsIFwi8J+XkVwiLCBcIvCfm6JcIiwgXCLwn5K4XCIsIFwi8J+StVwiLCBcIvCfkrRcIiwgXCLwn5K2XCIsIFwi8J+St1wiLCBcIvCfkrBcIiwgXCLwn5KzXCIsIFwi8J+SjlwiLCBcIuKallwiLCBcIvCflKdcIiwgXCLwn5SoXCIsIFwi4pqSXCIsIFwi8J+boFwiLCBcIuKbj1wiLCBcIvCflKlcIiwgXCLimplcIiwgXCLim5NcIiwgXCLwn5SrXCIsIFwi8J+So1wiLCBcIvCflKpcIiwgXCLwn5ehXCIsIFwi4pqUXCIsIFwi8J+boVwiLCBcIvCfmqxcIiwgXCLimKDvuI9cIiwgXCLimrBcIiwgXCLimrFcIiwgXCLwn4+6XCIsIFwi8J+UrlwiLCBcIvCfk79cIiwgXCLwn5KIXCIsIFwi4pqXXCIsIFwi8J+UrVwiLCBcIvCflKxcIiwgXCLwn5WzXCIsIFwi8J+SilwiLCBcIvCfkolcIiwgXCLwn4yhXCIsIFwi8J+Pt1wiLCBcIvCflJZcIiwgXCLwn5q9XCIsIFwi8J+av1wiLCBcIvCfm4FcIiwgXCLwn5SRXCIsIFwi8J+XnVwiLCBcIvCfm4tcIiwgXCLwn5uMXCIsIFwi8J+bj1wiLCBcIvCfmqpcIiwgXCLwn5uOXCIsIFwi8J+WvFwiLCBcIvCfl7pcIiwgXCLim7FcIiwgXCLwn5e/XCIsIFwi8J+bjVwiLCBcIvCfjohcIiwgXCLwn46PXCIsIFwi8J+OgFwiLCBcIvCfjoFcIiwgXCLwn46KXCIsIFwi8J+OiVwiLCBcIvCfjo5cIiwgXCLwn46QXCIsIFwi8J+OjFwiLCBcIvCfj65cIiwgXCLinInvuI9cIiwgXCLwn5OpXCIsIFwi8J+TqFwiLCBcIvCfk6dcIiwgXCLwn5KMXCIsIFwi8J+TrlwiLCBcIvCfk6pcIiwgXCLwn5OrXCIsIFwi8J+TrFwiLCBcIvCfk61cIiwgXCLwn5OmXCIsIFwi8J+Tr1wiLCBcIvCfk6VcIiwgXCLwn5OkXCIsIFwi8J+TnFwiLCBcIvCfk4NcIiwgXCLwn5ORXCIsIFwi8J+TilwiLCBcIvCfk4hcIiwgXCLwn5OJXCIsIFwi8J+ThFwiLCBcIvCfk4VcIiwgXCLwn5OGXCIsIFwi8J+Xk1wiLCBcIvCfk4dcIiwgXCLwn5eDXCIsIFwi8J+Xs1wiLCBcIvCfl4RcIiwgXCLwn5OLXCIsIFwi8J+XklwiLCBcIvCfk4FcIiwgXCLwn5OCXCIsIFwi8J+XglwiLCBcIvCfl55cIiwgXCLwn5OwXCIsIFwi8J+Tk1wiLCBcIvCfk5VcIiwgXCLwn5OXXCIsIFwi8J+TmFwiLCBcIvCfk5lcIiwgXCLwn5OUXCIsIFwi8J+TklwiLCBcIvCfk5pcIiwgXCLwn5OWXCIsIFwi8J+Ul1wiLCBcIvCfk45cIiwgXCLwn5aHXCIsIFwi4pyC77iPXCIsIFwi8J+TkFwiLCBcIvCfk49cIiwgXCLwn5OMXCIsIFwi8J+TjVwiLCBcIvCfmqlcIiwgXCLwn4+zXCIsIFwi8J+PtFwiLCBcIvCflJBcIiwgXCLwn5SSXCIsIFwi8J+Uk1wiLCBcIvCflI9cIiwgXCLwn5aKXCIsIFwi8J+Wi1wiLCBcIuKcku+4j1wiLCBcIvCfk51cIiwgXCLinI/vuI9cIiwgXCLwn5aNXCIsIFwi8J+WjFwiLCBcIvCflI1cIiwgXCLwn5SOXCIsIFwi8J+bkVwiLCBcIvCfm5FcIiwgXCLinaTvuI9cIiwgXCLwn5KbXCIsIFwi8J+SmlwiLCBcIvCfkplcIiwgXCLwn5KcXCIsIFwi8J+SlFwiLCBcIuKdo++4j1wiLCBcIvCfkpVcIiwgXCLwn5KeXCIsIFwi8J+Sk1wiLCBcIvCfkpdcIiwgXCLwn5KWXCIsIFwi8J+SmFwiLCBcIvCfkp1cIiwgXCLwn5KfXCIsIFwi4piu77iPXCIsIFwi4pyd77iPXCIsIFwi4piq77iPXCIsIFwi8J+ViVwiLCBcIuKYuO+4j1wiLCBcIuKcoe+4j1wiLCBcIvCflK9cIiwgXCLwn5WOXCIsIFwi4piv77iPXCIsIFwi4pim77iPXCIsIFwi8J+bkFwiLCBcIuKbjlwiLCBcIuKZiO+4j1wiLCBcIuKZie+4j1wiLCBcIuKZiu+4j1wiLCBcIuKZi++4j1wiLCBcIuKZjO+4j1wiLCBcIuKZje+4j1wiLCBcIuKZju+4j1wiLCBcIuKZj++4j1wiLCBcIuKZkO+4j1wiLCBcIuKZke+4j1wiLCBcIuKZku+4j1wiLCBcIuKZk++4j1wiLCBcIvCfhpRcIiwgXCLimptcIiwgXCLwn4izXCIsIFwi8J+IuVwiLCBcIuKYou+4j1wiLCBcIuKYo++4j1wiLCBcIvCfk7RcIiwgXCLwn5OzXCIsIFwi8J+ItlwiLCBcIvCfiJrvuI9cIiwgXCLwn4i4XCIsIFwi8J+IulwiLCBcIvCfiLfvuI9cIiwgXCLinLTvuI9cIiwgXCLwn4aaXCIsIFwi8J+JkVwiLCBcIvCfkq5cIiwgXCLwn4mQXCIsIFwi44qZ77iPXCIsIFwi44qX77iPXCIsIFwi8J+ItFwiLCBcIvCfiLVcIiwgXCLwn4iyXCIsIFwi8J+FsO+4j1wiLCBcIvCfhbHvuI9cIiwgXCLwn4aOXCIsIFwi8J+GkVwiLCBcIvCfhb7vuI9cIiwgXCLwn4aYXCIsIFwi4puU77iPXCIsIFwi8J+Tm1wiLCBcIvCfmqtcIiwgXCLinYxcIiwgXCLirZXvuI9cIiwgXCLwn5KiXCIsIFwi4pmo77iPXCIsIFwi8J+at1wiLCBcIvCfmq9cIiwgXCLwn5qzXCIsIFwi8J+asVwiLCBcIvCflJ5cIiwgXCLwn5O1XCIsIFwi4p2X77iPXCIsIFwi4p2VXCIsIFwi4p2TXCIsIFwi4p2UXCIsIFwi4oC877iPXCIsIFwi4oGJ77iPXCIsIFwi8J+Sr1wiLCBcIvCflIVcIiwgXCLwn5SGXCIsIFwi8J+UsVwiLCBcIuKanFwiLCBcIuOAve+4j1wiLCBcIuKaoO+4j1wiLCBcIvCfmrhcIiwgXCLwn5SwXCIsIFwi4pm777iPXCIsIFwi8J+Ir++4j1wiLCBcIvCfkrlcIiwgXCLinYfvuI9cIiwgXCLinLPvuI9cIiwgXCLinY5cIiwgXCLinIVcIiwgXCLwn5KgXCIsIFwi8J+MgFwiLCBcIuKev1wiLCBcIvCfjJBcIiwgXCLik4LvuI9cIiwgXCLwn4+nXCIsIFwi8J+Igu+4j1wiLCBcIvCfm4JcIiwgXCLwn5uDXCIsIFwi8J+bhFwiLCBcIvCfm4VcIiwgXCLimb/vuI9cIiwgXCLwn5qtXCIsIFwi8J+avlwiLCBcIvCfhb/vuI9cIiwgXCLwn5qwXCIsIFwi8J+auVwiLCBcIvCfmrpcIiwgXCLwn5q8XCIsIFwi8J+au1wiLCBcIvCfmq5cIiwgXCLwn46mXCIsIFwi8J+TtlwiLCBcIvCfiIFcIiwgXCLwn4aWXCIsIFwi8J+Gl1wiLCBcIvCfhplcIiwgXCLwn4aSXCIsIFwi8J+GlVwiLCBcIvCfhpNcIiwgXCIw77iP4oOjXCIsIFwiMe+4j+KDo1wiLCBcIjLvuI/ig6NcIiwgXCIz77iP4oOjXCIsIFwiNO+4j+KDo1wiLCBcIjXvuI/ig6NcIiwgXCI277iP4oOjXCIsIFwiN++4j+KDo1wiLCBcIjjvuI/ig6NcIiwgXCI577iP4oOjXCIsIFwi8J+Un1wiLCBcIvCflKJcIiwgXCLilrbvuI9cIiwgXCLij7hcIiwgXCLij69cIiwgXCLij7lcIiwgXCLij7pcIiwgXCLij61cIiwgXCLij65cIiwgXCLij6lcIiwgXCLij6pcIiwgXCLwn5SAXCIsIFwi8J+UgVwiLCBcIvCflIJcIiwgXCLil4DvuI9cIiwgXCLwn5S8XCIsIFwi8J+UvVwiLCBcIuKPq1wiLCBcIuKPrFwiLCBcIuKeoe+4j1wiLCBcIuKshe+4j1wiLCBcIuKshu+4j1wiLCBcIuKsh++4j1wiLCBcIuKGl++4j1wiLCBcIuKGmO+4j1wiLCBcIuKGme+4j1wiLCBcIuKGlu+4j1wiLCBcIuKGle+4j1wiLCBcIuKGlO+4j1wiLCBcIvCflIRcIiwgXCLihqrvuI9cIiwgXCLihqnvuI9cIiwgXCLipLTvuI9cIiwgXCLipLXvuI9cIiwgXCIj77iP4oOjXCIsIFwiKu+4j+KDo1wiLCBcIuKEue+4j1wiLCBcIvCflKRcIiwgXCLwn5ShXCIsIFwi8J+UoFwiLCBcIvCflKNcIiwgXCLwn461XCIsIFwi8J+OtlwiLCBcIuOAsO+4j1wiLCBcIuKesFwiLCBcIuKclO+4j1wiLCBcIvCflINcIiwgXCLinpVcIiwgXCLinpZcIiwgXCLinpdcIiwgXCLinJbvuI9cIiwgXCLwn5KyXCIsIFwi8J+SsVwiLCBcIsKp77iPXCIsIFwiwq7vuI9cIiwgXCLihKLvuI9cIiwgXCLwn5SaXCIsIFwi8J+UmVwiLCBcIvCflJtcIiwgXCLwn5SdXCIsIFwi8J+UnFwiLCBcIuKYke+4j1wiLCBcIvCflJhcIiwgXCLimqrvuI9cIiwgXCLimqvvuI9cIiwgXCLwn5S0XCIsIFwi8J+UtVwiLCBcIvCflLhcIiwgXCLwn5S5XCIsIFwi8J+UtlwiLCBcIvCflLdcIiwgXCLwn5S6XCIsIFwi4paq77iPXCIsIFwi4par77iPXCIsIFwi4qyb77iPXCIsIFwi4qyc77iPXCIsIFwi8J+Uu1wiLCBcIuKXvO+4j1wiLCBcIuKXu++4j1wiLCBcIuKXvu+4j1wiLCBcIuKXve+4j1wiLCBcIvCflLJcIiwgXCLwn5SzXCIsIFwi8J+UiFwiLCBcIvCflIlcIiwgXCLwn5SKXCIsIFwi8J+Uh1wiLCBcIvCfk6NcIiwgXCLwn5OiXCIsIFwi8J+UlFwiLCBcIvCflJVcIiwgXCLwn4OPXCIsIFwi8J+AhO+4j1wiLCBcIuKZoO+4j1wiLCBcIuKZo++4j1wiLCBcIuKZpe+4j1wiLCBcIuKZpu+4j1wiLCBcIvCfjrRcIiwgXCLwn5GB4oCN8J+XqFwiLCBcIvCfkq1cIiwgXCLwn5evXCIsIFwi8J+SrFwiLCBcIvCflZBcIiwgXCLwn5WRXCIsIFwi8J+VklwiLCBcIvCflZNcIiwgXCLwn5WUXCIsIFwi8J+VlVwiLCBcIvCflZZcIiwgXCLwn5WXXCIsIFwi8J+VmFwiLCBcIvCflZlcIiwgXCLwn5WaXCIsIFwi8J+Vm1wiLCBcIvCflZxcIiwgXCLwn5WdXCIsIFwi8J+VnlwiLCBcIvCflZ9cIiwgXCLwn5WgXCIsIFwi8J+VoVwiLCBcIvCflaJcIiwgXCLwn5WjXCIsIFwi8J+VpFwiLCBcIvCflaVcIiwgXCLwn5WmXCIsIFwi8J+Vp1wiLCBcIvCfm5FcIiwgXCLwn4em8J+Hq1wiLCBcIvCfh6bwn4e9XCIsIFwi8J+HpvCfh7FcIiwgXCLwn4ep8J+Hv1wiLCBcIvCfh6bwn4e4XCIsIFwi8J+HpvCfh6lcIiwgXCLwn4em8J+HtFwiLCBcIvCfh6bwn4euXCIsIFwi8J+HpvCfh7ZcIiwgXCLwn4em8J+HrFwiLCBcIvCfh6bwn4e3XCIsIFwi8J+HpvCfh7JcIiwgXCLwn4em8J+HvFwiLCBcIvCfh6bwn4e6XCIsIFwi8J+HpvCfh7lcIiwgXCLwn4em8J+Hv1wiLCBcIvCfh6fwn4e4XCIsIFwi8J+Hp/Cfh61cIiwgXCLwn4en8J+HqVwiLCBcIvCfh6fwn4enXCIsIFwi8J+Hp/Cfh75cIiwgXCLwn4en8J+HqlwiLCBcIvCfh6fwn4e/XCIsIFwi8J+Hp/Cfh69cIiwgXCLwn4en8J+HslwiLCBcIvCfh6fwn4e5XCIsIFwi8J+Hp/Cfh7RcIiwgXCLwn4en8J+HtlwiLCBcIvCfh6fwn4emXCIsIFwi8J+Hp/Cfh7xcIiwgXCLwn4en8J+Ht1wiLCBcIvCfh67wn4e0XCIsIFwi8J+Hu/Cfh6xcIiwgXCLwn4en8J+Hs1wiLCBcIvCfh6fwn4esXCIsIFwi8J+Hp/Cfh6tcIiwgXCLwn4en8J+HrlwiLCBcIvCfh6jwn4e7XCIsIFwi8J+HsPCfh61cIiwgXCLwn4eo8J+HslwiLCBcIvCfh6jwn4emXCIsIFwi8J+HrvCfh6hcIiwgXCLwn4ew8J+HvlwiLCBcIvCfh6jwn4erXCIsIFwi8J+HufCfh6lcIiwgXCLwn4eo8J+HsVwiLCBcIvCfh6jwn4ezXCIsIFwi8J+HqPCfh71cIiwgXCLwn4eo8J+HqFwiLCBcIvCfh6jwn4e0XCIsIFwi8J+HsPCfh7JcIiwgXCLwn4eo8J+HrFwiLCBcIvCfh6jwn4epXCIsIFwi8J+HqPCfh7BcIiwgXCLwn4eo8J+Ht1wiLCBcIvCfh63wn4e3XCIsIFwi8J+HqPCfh7pcIiwgXCLwn4eo8J+HvFwiLCBcIvCfh6jwn4e+XCIsIFwi8J+HqPCfh79cIiwgXCLwn4ep8J+HsFwiLCBcIvCfh6nwn4evXCIsIFwi8J+HqfCfh7JcIiwgXCLwn4ep8J+HtFwiLCBcIvCfh6rwn4eoXCIsIFwi8J+HqvCfh6xcIiwgXCLwn4e48J+Hu1wiLCBcIvCfh6zwn4e2XCIsIFwi8J+HqvCfh7dcIiwgXCLwn4eq8J+HqlwiLCBcIvCfh6rwn4e5XCIsIFwi8J+HqvCfh7pcIiwgXCLwn4er8J+HsFwiLCBcIvCfh6vwn4e0XCIsIFwi8J+Hq/Cfh69cIiwgXCLwn4er8J+HrlwiLCBcIvCfh6vwn4e3XCIsIFwi8J+HrPCfh6tcIiwgXCLwn4e18J+Hq1wiLCBcIvCfh7nwn4erXCIsIFwi8J+HrPCfh6ZcIiwgXCLwn4es8J+HslwiLCBcIvCfh6zwn4eqXCIsIFwi8J+HqfCfh6pcIiwgXCLwn4es8J+HrVwiLCBcIvCfh6zwn4euXCIsIFwi8J+HrPCfh7dcIiwgXCLwn4es8J+HsVwiLCBcIvCfh6zwn4epXCIsIFwi8J+HrPCfh7VcIiwgXCLwn4es8J+HulwiLCBcIvCfh6zwn4e5XCIsIFwi8J+HrPCfh6xcIiwgXCLwn4es8J+Hs1wiLCBcIvCfh6zwn4e8XCIsIFwi8J+HrPCfh75cIiwgXCLwn4et8J+HuVwiLCBcIvCfh63wn4ezXCIsIFwi8J+HrfCfh7BcIiwgXCLwn4et8J+HulwiLCBcIvCfh67wn4e4XCIsIFwi8J+HrvCfh7NcIiwgXCLwn4eu8J+HqVwiLCBcIvCfh67wn4e3XCIsIFwi8J+HrvCfh7ZcIiwgXCLwn4eu8J+HqlwiLCBcIvCfh67wn4eyXCIsIFwi8J+HrvCfh7FcIiwgXCLwn4eu8J+HuVwiLCBcIvCfh6jwn4euXCIsIFwi8J+Hr/Cfh7JcIiwgXCLwn4ev8J+HtVwiLCBcIvCfh6/wn4eqXCIsIFwi8J+Hr/Cfh7RcIiwgXCLwn4ew8J+Hv1wiLCBcIvCfh7Dwn4eqXCIsIFwi8J+HsPCfh65cIiwgXCLwn4e98J+HsFwiLCBcIvCfh7Dwn4e8XCIsIFwi8J+HsPCfh6xcIiwgXCLwn4ex8J+HplwiLCBcIvCfh7Hwn4e7XCIsIFwi8J+HsfCfh6dcIiwgXCLwn4ex8J+HuFwiLCBcIvCfh7Hwn4e3XCIsIFwi8J+HsfCfh75cIiwgXCLwn4ex8J+HrlwiLCBcIvCfh7Hwn4e5XCIsIFwi8J+HsfCfh7pcIiwgXCLwn4ey8J+HtFwiLCBcIvCfh7Lwn4ewXCIsIFwi8J+HsvCfh6xcIiwgXCLwn4ey8J+HvFwiLCBcIvCfh7Lwn4e+XCIsIFwi8J+HsvCfh7tcIiwgXCLwn4ey8J+HsVwiLCBcIvCfh7Lwn4e5XCIsIFwi8J+HsvCfh61cIiwgXCLwn4ey8J+HtlwiLCBcIvCfh7Lwn4e3XCIsIFwi8J+HsvCfh7pcIiwgXCLwn4e+8J+HuVwiLCBcIvCfh7Lwn4e9XCIsIFwi8J+Hq/Cfh7JcIiwgXCLwn4ey8J+HqVwiLCBcIvCfh7Lwn4eoXCIsIFwi8J+HsvCfh7NcIiwgXCLwn4ey8J+HqlwiLCBcIvCfh7Lwn4e4XCIsIFwi8J+HsvCfh6ZcIiwgXCLwn4ey8J+Hv1wiLCBcIvCfh7Lwn4eyXCIsIFwi8J+Hs/Cfh6ZcIiwgXCLwn4ez8J+Ht1wiLCBcIvCfh7Pwn4e1XCIsIFwi8J+Hs/Cfh7FcIiwgXCLwn4ez8J+HqFwiLCBcIvCfh7Pwn4e/XCIsIFwi8J+Hs/Cfh65cIiwgXCLwn4ez8J+HqlwiLCBcIvCfh7Pwn4esXCIsIFwi8J+Hs/Cfh7pcIiwgXCLwn4ez8J+Hq1wiLCBcIvCfh7Lwn4e1XCIsIFwi8J+HsPCfh7VcIiwgXCLwn4ez8J+HtFwiLCBcIvCfh7Twn4eyXCIsIFwi8J+HtfCfh7BcIiwgXCLwn4e18J+HvFwiLCBcIvCfh7Xwn4e4XCIsIFwi8J+HtfCfh6ZcIiwgXCLwn4e18J+HrFwiLCBcIvCfh7Xwn4e+XCIsIFwi8J+HtfCfh6pcIiwgXCLwn4e18J+HrVwiLCBcIvCfh7Xwn4ezXCIsIFwi8J+HtfCfh7FcIiwgXCLwn4e18J+HuVwiLCBcIvCfh7Xwn4e3XCIsIFwi8J+HtvCfh6ZcIiwgXCLwn4e38J+HqlwiLCBcIvCfh7fwn4e0XCIsIFwi8J+Ht/Cfh7pcIiwgXCLwn4e38J+HvFwiLCBcIvCfh6fwn4exXCIsIFwi8J+HuPCfh61cIiwgXCLwn4ew8J+Hs1wiLCBcIvCfh7Hwn4eoXCIsIFwi8J+HtfCfh7JcIiwgXCLwn4e78J+HqFwiLCBcIvCfh7zwn4e4XCIsIFwi8J+HuPCfh7JcIiwgXCLwn4e48J+HuVwiLCBcIvCfh7jwn4emXCIsIFwi8J+HuPCfh7NcIiwgXCLwn4e38J+HuFwiLCBcIvCfh7jwn4eoXCIsIFwi8J+HuPCfh7FcIiwgXCLwn4e48J+HrFwiLCBcIvCfh7jwn4e9XCIsIFwi8J+HuPCfh7BcIiwgXCLwn4e48J+HrlwiLCBcIvCfh7jwn4enXCIsIFwi8J+HuPCfh7RcIiwgXCLwn4e/8J+HplwiLCBcIvCfh6zwn4e4XCIsIFwi8J+HsPCfh7dcIiwgXCLwn4e48J+HuFwiLCBcIvCfh6rwn4e4XCIsIFwi8J+HsfCfh7BcIiwgXCLwn4e48J+HqVwiLCBcIvCfh7jwn4e3XCIsIFwi8J+HuPCfh79cIiwgXCLwn4e48J+HqlwiLCBcIvCfh6jwn4etXCIsIFwi8J+HuPCfh75cIiwgXCLwn4e58J+HvFwiLCBcIvCfh7nwn4evXCIsIFwi8J+HufCfh79cIiwgXCLwn4e58J+HrVwiLCBcIvCfh7nwn4exXCIsIFwi8J+HufCfh6xcIiwgXCLwn4e58J+HsFwiLCBcIvCfh7nwn4e0XCIsIFwi8J+HufCfh7lcIiwgXCLwn4e58J+Hs1wiLCBcIvCfh7nwn4e3XCIsIFwi8J+HufCfh7JcIiwgXCLwn4e58J+HqFwiLCBcIvCfh7nwn4e7XCIsIFwi8J+HuvCfh6xcIiwgXCLwn4e68J+HplwiLCBcIvCfh6bwn4eqXCIsIFwi8J+HrPCfh6dcIiwgXCLwn4e68J+HuFwiLCBcIvCfh7vwn4euXCIsIFwi8J+HuvCfh75cIiwgXCLwn4e68J+Hv1wiLCBcIvCfh7vwn4e6XCIsIFwi8J+Hu/Cfh6ZcIiwgXCLwn4e78J+HqlwiLCBcIvCfh7vwn4ezXCIsIFwi8J+HvPCfh6tcIiwgXCLwn4eq8J+HrVwiLCBcIvCfh77wn4eqXCIsIFwi8J+Hv/Cfh7JcIiwgXCLwn4e/8J+HvFwiXVxuXHRlbW9qaSA6IFwiPD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0nVVRGLTgnIHN0YW5kYWxvbmU9J25vJz8+XG5cdFx0PHN2ZyB3aWR0aD0nMjBweCcgaGVpZ2h0PScyMHB4JyB2aWV3Qm94PScwIDAgMjAgMjAnIHZlcnNpb249JzEuMScgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB4bWxuczp4bGluaz0naHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycgeG1sbnM6c2tldGNoPSdodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gvbnMnPlxuXHRcdFx0PCEtLSBHZW5lcmF0b3I6IFNrZXRjaCAzLjUuMiAoMjUyMzUpIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPlxuXHRcdFx0PHRpdGxlPkVtb2ppPC90aXRsZT5cblx0XHRcdDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPlxuXHRcdFx0PGRlZnM+PC9kZWZzPlxuXHRcdFx0PGcgaWQ9J1BhZ2UtMScgc3Ryb2tlPSdub25lJyBzdHJva2Utd2lkdGg9JzEnIGZpbGw9J25vbmUnIGZpbGwtcnVsZT0nZXZlbm9kZCcgc2tldGNoOnR5cGU9J01TUGFnZSc+XG5cdFx0XHRcdDxnIGlkPSdLZXlib2FyZC9MaWdodC9Mb3dlcicgc2tldGNoOnR5cGU9J01TTGF5ZXJHcm91cCcgdHJhbnNmb3JtPSd0cmFuc2xhdGUoLTYwLjAwMDAwMCwgLTE4MS4wMDAwMDApJyBmaWxsPScjMDMwMzAzJz5cblx0XHRcdFx0XHQ8ZyBpZD0nQm90dG9tLVJvdycgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMy4wMDAwMDAsIDE3MC4wMDAwMDApJyBza2V0Y2g6dHlwZT0nTVNTaGFwZUdyb3VwJz5cblx0XHRcdFx0XHRcdDxwYXRoIGQ9J002Ni43NSwzMC41IEM3Mi4xMzQ3NzYzLDMwLjUgNzYuNSwyNi4xMzQ3NzYzIDc2LjUsMjAuNzUgQzc2LjUsMTUuMzY1MjIzNyA3Mi4xMzQ3NzYzLDExIDY2Ljc1LDExIEM2MS4zNjUyMjM3LDExIDU3LDE1LjM2NTIyMzcgNTcsMjAuNzUgQzU3LDI2LjEzNDc3NjMgNjEuMzY1MjIzNywzMC41IDY2Ljc1LDMwLjUgWiBNNjYuNzUsMjkuNSBDNzEuNTgyNDkxNiwyOS41IDc1LjUsMjUuNTgyNDkxNiA3NS41LDIwLjc1IEM3NS41LDE1LjkxNzUwODQgNzEuNTgyNDkxNiwxMiA2Ni43NSwxMiBDNjEuOTE3NTA4NCwxMiA1OCwxNS45MTc1MDg0IDU4LDIwLjc1IEM1OCwyNS41ODI0OTE2IDYxLjkxNzUwODQsMjkuNSA2Ni43NSwyOS41IFogTTYzLjc1LDE5IEM2NC40NDAzNTU5LDE5IDY1LDE4LjQ0MDM1NTkgNjUsMTcuNzUgQzY1LDE3LjA1OTY0NDEgNjQuNDQwMzU1OSwxNi41IDYzLjc1LDE2LjUgQzYzLjA1OTY0NDEsMTYuNSA2Mi41LDE3LjA1OTY0NDEgNjIuNSwxNy43NSBDNjIuNSwxOC40NDAzNTU5IDYzLjA1OTY0NDEsMTkgNjMuNzUsMTkgWiBNNjkuNzUsMTkgQzcwLjQ0MDM1NTksMTkgNzEsMTguNDQwMzU1OSA3MSwxNy43NSBDNzEsMTcuMDU5NjQ0MSA3MC40NDAzNTU5LDE2LjUgNjkuNzUsMTYuNSBDNjkuMDU5NjQ0MSwxNi41IDY4LjUsMTcuMDU5NjQ0MSA2OC41LDE3Ljc1IEM2OC41LDE4LjQ0MDM1NTkgNjkuMDU5NjQ0MSwxOSA2OS43NSwxOSBaIE01OS44ODc2MzM0LDIyLjE2NDE0NDQgQzU5LjYzOTAzMTYsMjEuMzgzMTM0IDYwLjA2NTkxOCwyMC45Nzg1MTU2IDYwLjg1MzA5NTEsMjEuMjMyOTMwNCBDNjAuODUzMDk1MSwyMS4yMzI5MzA0IDYzLjA5Mzc1MDMsMjIuMjEyNSA2Ni43NTAwMDAxLDIyLjIxMjUgQzcwLjQwNjI0OTksMjIuMjEyNSA3Mi42NDY5MDQ3LDIxLjIzMjkzMDQgNzIuNjQ2OTA0NywyMS4yMzI5MzA0IEM3My40Mjg3MTYyLDIwLjk2NjIxNTMgNzMuODgxMjQ2MywyMS40MDQ0MDk3IDczLjYwNTg0NzcsMjIuMTgwNzQzNyBDNzMuNjA1ODQ3NywyMi4xODA3NDM3IDcyLjYsMjcuNTc1IDY2Ljc1LDI3LjU3NSBDNjAuOSwyNy41NzUgNTkuODg3NjMzNCwyMi4xNjQxNDQ0IDU5Ljg4NzYzMzQsMjIuMTY0MTQ0NCBaIE02Ni43NSwyMy4xODc1IEM2NC4wNjg3NSwyMy4xODc1IDYxLjg1NDQwNTUsMjIuNDczNzgyMSA2MS44NTQ0MDU1LDIyLjQ3Mzc4MjEgQzYxLjMyNzMwMTksMjIuMzI5NDggNjEuMTc4MTIzMywyMi41NzIxNjE1IDYxLjU2Mzk1NTUsMjIuOTU3MDc1IEM2MS41NjM5NTU1LDIyLjk1NzA3NSA2Mi4zNjI1LDI0LjY1IDY2Ljc1LDI0LjY1IEM3MS4xMzc1LDI0LjY1IDcxLjk1MDg1MDMsMjIuOTQzODMwNCA3MS45NTA4NTAzLDIyLjk0MzgzMDQgQzcyLjMwOTM2NTksMjIuNTM5OTI3OCA3Mi4xNjkwNzkzLDIyLjMzNTk4NDQgNzEuNjM1NDI3MywyMi40NzYzNDkgQzcxLjYzNTQyNzMsMjIuNDc2MzQ5IDY5LjQzMTI1LDIzLjE4NzUgNjYuNzUsMjMuMTg3NSBaJyBpZD0nRW1vamknPjwvcGF0aD5cblx0XHRcdFx0XHQ8L2c+XG5cdFx0XHRcdDwvZz5cblx0XHRcdDwvZz5cblx0XHQ8L3N2Zz5cIlxuXHRkZWxldGU6IHtcblx0XHRvbiA6IFwiPD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0nVVRGLTgnIHN0YW5kYWxvbmU9J25vJz8+XG5cdFx0XHRcdDxzdmcgd2lkdGg9JzI0cHgnIGhlaWdodD0nMThweCcgdmlld0JveD0nMCAwIDI0IDE4JyB2ZXJzaW9uPScxLjEnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgeG1sbnM6eGxpbms9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnIHhtbG5zOnNrZXRjaD0naHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zJz5cblx0XHRcdFx0XHQ8IS0tIEdlbmVyYXRvcjogU2tldGNoIDMuNS4yICgyNTIzNSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+XG5cdFx0XHRcdFx0PHRpdGxlPkJhY2s8L3RpdGxlPlxuXHRcdFx0XHRcdDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPlxuXHRcdFx0XHRcdDxkZWZzPjwvZGVmcz5cblx0XHRcdFx0XHQ8ZyBpZD0nUGFnZS0xJyBzdHJva2U9J25vbmUnIHN0cm9rZS13aWR0aD0nMScgZmlsbD0nbm9uZScgZmlsbC1ydWxlPSdldmVub2RkJyBza2V0Y2g6dHlwZT0nTVNQYWdlJz5cblx0XHRcdFx0XHRcdDxnIGlkPSdLZXlib2FyZC9MaWdodC9VcHBlcicgc2tldGNoOnR5cGU9J01TTGF5ZXJHcm91cCcgdHJhbnNmb3JtPSd0cmFuc2xhdGUoLTMzOS4wMDAwMDAsIC0xMzAuMDAwMDAwKScgZmlsbD0nIzAzMDMwMyc+XG5cdFx0XHRcdFx0XHRcdDxnIGlkPSdUaGlyZC1Sb3cnIHRyYW5zZm9ybT0ndHJhbnNsYXRlKDMuMDAwMDAwLCAxMTguMDAwMDAwKScgc2tldGNoOnR5cGU9J01TU2hhcGVHcm91cCc+XG5cdFx0XHRcdFx0XHRcdFx0PHBhdGggZD0nTTM1MS42NDI2NjMsMjAuOTc3NjkwMyBMMzU0LjQ2Njc5NSwxOC4xNTM1NTg1IEMzNTQuNzYwMTA2LDE3Ljg2MDI0NzYgMzU0Ljc2Mzk4MywxNy4zODE0OTYyIDM1NC40NzEwOSwxNy4wODg2MDMgQzM1NC4xNzYxNTUsMTYuNzkzNjY3NyAzNTMuNzAxNCwxNi43OTc2MzI4IDM1My40MDYxMzUsMTcuMDkyODk4MyBMMzUwLjU4MjAwMywxOS45MTcwMzAxIEwzNDcuNzU3ODcxLDE3LjA5Mjg5ODMgQzM0Ny40NjQ1NiwxNi43OTk1ODc0IDM0Ni45ODU4MDksMTYuNzk1NzA5NyAzNDYuNjkyOTE2LDE3LjA4ODYwMyBDMzQ2LjM5Nzk4LDE3LjM4MzUzODIgMzQ2LjQwMTk0NSwxNy44NTgyOTMgMzQ2LjY5NzIxMSwxOC4xNTM1NTg1IEwzNDkuNTIxMzQzLDIwLjk3NzY5MDMgTDM0Ni42OTcyMTEsMjMuODAxODIyIEMzNDYuNDAzOSwyNC4wOTUxMzI5IDM0Ni40MDAwMjIsMjQuNTczODg0MyAzNDYuNjkyOTE2LDI0Ljg2Njc3NzYgQzM0Ni45ODc4NTEsMjUuMTYxNzEyOCAzNDcuNDYyNjA2LDI1LjE1Nzc0NzcgMzQ3Ljc1Nzg3MSwyNC44NjI0ODIyIEwzNTAuNTgyMDAzLDIyLjAzODM1MDQgTDM1My40MDYxMzUsMjQuODYyNDgyMiBDMzUzLjY5OTQ0NSwyNS4xNTU3OTMxIDM1NC4xNzgxOTcsMjUuMTU5NjcwOCAzNTQuNDcxMDksMjQuODY2Nzc3NiBDMzU0Ljc2NjAyNSwyNC41NzE4NDIzIDM1NC43NjIwNiwyNC4wOTcwODc1IDM1NC40NjY3OTUsMjMuODAxODIyIEwzNTEuNjQyNjYzLDIwLjk3NzY5MDMgWiBNMzM3LjA1OTM0NSwyMi4wNTkzNDQ1IEMzMzYuNDc0Mjg1LDIxLjQ3NDI4NDcgMzM2LjQ4MTM1MSwyMC41MTg2NDg5IDMzNy4wNTkzNDUsMTkuOTQwNjU1NSBMMzQzLjc4OTkxNSwxMy4yMTAwODUzIEMzNDQuMTgyMDg0LDEyLjgxNzkxNiAzNDQuOTQ4OTIsMTIuNSAzNDUuNTA3NDg0LDEyLjUgTDM1Ni4wMDIwOTgsMTIuNSBDMzU3LjkzMzkzNiwxMi41IDM1OS41LDE0LjA2ODg0NzcgMzU5LjUsMTYuMDAxNzk4MyBMMzU5LjUsMjUuOTk4MjAxNyBDMzU5LjUsMjcuOTMyMTkxNSAzNTcuOTIzMDg4LDI5LjUgMzU2LjAwMjA5OCwyOS41IEwzNDUuNTA3NDg0LDI5LjUgQzM0NC45NTEwNjYsMjkuNSAzNDQuMTc3MTY5LDI5LjE3NzE2OTMgMzQzLjc4OTkxNSwyOC43ODk5MTQ4IEwzMzcuMDU5MzQ1LDIyLjA1OTM0NDUgWicgaWQ9J0JhY2snPjwvcGF0aD5cblx0XHRcdFx0XHRcdFx0PC9nPlxuXHRcdFx0XHRcdFx0PC9nPlxuXHRcdFx0XHRcdDwvZz5cblx0XHRcdFx0PC9zdmc+XCJcblx0XHRvZmYgOiBcIjw/eG1sIHZlcnNpb249JzEuMCcgZW5jb2Rpbmc9J1VURi04JyBzdGFuZGFsb25lPSdubyc/PlxuXHRcdDxzdmcgd2lkdGg9JzI0cHgnIGhlaWdodD0nMThweCcgdmlld0JveD0nMCAwIDI0IDE4JyB2ZXJzaW9uPScxLjEnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgeG1sbnM6eGxpbms9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnIHhtbG5zOnNrZXRjaD0naHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zJz5cblx0XHRcdDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggMy41LjIgKDI1MjM1KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT5cblx0XHRcdDx0aXRsZT5CYWNrPC90aXRsZT5cblx0XHRcdDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPlxuXHRcdFx0PGRlZnM+PC9kZWZzPlxuXHRcdFx0PGcgaWQ9J1BhZ2UtMScgc3Ryb2tlPSdub25lJyBzdHJva2Utd2lkdGg9JzEnIGZpbGw9J25vbmUnIGZpbGwtcnVsZT0nZXZlbm9kZCcgc2tldGNoOnR5cGU9J01TUGFnZSc+XG5cdFx0XHRcdDxnIGlkPSdLZXlib2FyZC9MaWdodC9VcHBlcicgc2tldGNoOnR5cGU9J01TTGF5ZXJHcm91cCcgdHJhbnNmb3JtPSd0cmFuc2xhdGUoLTMzOS4wMDAwMDAsIC0xMzAuMDAwMDAwKScgZmlsbD0nIzAzMDMwMyc+XG5cdFx0XHRcdFx0PGcgaWQ9J1RoaXJkLVJvdycgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMy4wMDAwMDAsIDExOC4wMDAwMDApJyBza2V0Y2g6dHlwZT0nTVNTaGFwZUdyb3VwJz5cblx0XHRcdFx0XHRcdDxwYXRoIGQ9J00zMzcuMDU5MzQ1LDIyLjA1OTM0NDUgQzMzNi40NzQyODUsMjEuNDc0Mjg0NyAzMzYuNDgxMzUxLDIwLjUxODY0ODkgMzM3LjA1OTM0NSwxOS45NDA2NTU1IEwzNDMuNzg5OTE1LDEzLjIxMDA4NTMgQzM0NC4xODIwODQsMTIuODE3OTE2IDM0NC45NDg5MiwxMi41IDM0NS41MDc0ODQsMTIuNSBMMzU2LjAwMjA5OCwxMi41IEMzNTcuOTMzOTM2LDEyLjUgMzU5LjUsMTQuMDY4ODQ3NyAzNTkuNSwxNi4wMDE3OTgzIEwzNTkuNSwyNS45OTgyMDE3IEMzNTkuNSwyNy45MzIxOTE1IDM1Ny45MjMwODgsMjkuNSAzNTYuMDAyMDk4LDI5LjUgTDM0NS41MDc0ODQsMjkuNSBDMzQ0Ljk1MTA2NiwyOS41IDM0NC4xNzcxNjksMjkuMTc3MTY5MyAzNDMuNzg5OTE1LDI4Ljc4OTkxNDggTDMzNy4wNTkzNDUsMjIuMDU5MzQ0NSBaIE0zNTEuNjQyNjYzLDIwLjk3NzY5MDMgTDM1NC40NjY3OTUsMTguMTUzNTU4NSBDMzU0Ljc2MDEwNiwxNy44NjAyNDc2IDM1NC43NjM5ODMsMTcuMzgxNDk2MiAzNTQuNDcxMDksMTcuMDg4NjAzIEMzNTQuMTc2MTU1LDE2Ljc5MzY2NzcgMzUzLjcwMTQsMTYuNzk3NjMyOCAzNTMuNDA2MTM1LDE3LjA5Mjg5ODMgTDM1MC41ODIwMDMsMTkuOTE3MDMwMSBMMzQ3Ljc1Nzg3MSwxNy4wOTI4OTgzIEMzNDcuNDY0NTYsMTYuNzk5NTg3NCAzNDYuOTg1ODA5LDE2Ljc5NTcwOTcgMzQ2LjY5MjkxNiwxNy4wODg2MDMgQzM0Ni4zOTc5OCwxNy4zODM1MzgyIDM0Ni40MDE5NDUsMTcuODU4MjkzIDM0Ni42OTcyMTEsMTguMTUzNTU4NSBMMzQ5LjUyMTM0MywyMC45Nzc2OTAzIEwzNDYuNjk3MjExLDIzLjgwMTgyMiBDMzQ2LjQwMzksMjQuMDk1MTMyOSAzNDYuNDAwMDIyLDI0LjU3Mzg4NDMgMzQ2LjY5MjkxNiwyNC44NjY3Nzc2IEMzNDYuOTg3ODUxLDI1LjE2MTcxMjggMzQ3LjQ2MjYwNiwyNS4xNTc3NDc3IDM0Ny43NTc4NzEsMjQuODYyNDgyMiBMMzUwLjU4MjAwMywyMi4wMzgzNTA0IEwzNTMuNDA2MTM1LDI0Ljg2MjQ4MjIgQzM1My42OTk0NDUsMjUuMTU1NzkzMSAzNTQuMTc4MTk3LDI1LjE1OTY3MDggMzU0LjQ3MTA5LDI0Ljg2Njc3NzYgQzM1NC43NjYwMjUsMjQuNTcxODQyMyAzNTQuNzYyMDYsMjQuMDk3MDg3NSAzNTQuNDY2Nzk1LDIzLjgwMTgyMiBMMzUxLjY0MjY2MywyMC45Nzc2OTAzIFogTTMzOC43MDk3MiwyMS43MDk3MTk1IEMzMzguMzE3NzUyLDIxLjMxNzc1MjIgMzM4LjMxODk2NSwyMC42ODEwMzQ5IDMzOC43MDk3MiwyMC4yOTAyODA1IEwzNDQuNjQzMjQ1LDE0LjM1Njc1NDcgQzM0NC44NDAyNzYsMTQuMTU5NzI0NSAzNDUuMjI1NjM5LDE0IDM0NS40OTM3NDEsMTQgTDM1NS45OTcyMzksMTQgQzM1Ny4xMDMzMzMsMTQgMzU3Ljk5OTk5OSwxNC44OTcwNjAxIDM1Ny45OTk5OTksMTYuMDA1ODU4NiBMMzU3Ljk5OTk5OSwyNS45OTQxNDEyIEMzNTcuOTk5OTk5LDI3LjEwMTk0NjQgMzU3LjEwNjQ1NywyNy45OTk5OTk5IDM1NS45OTcyMzksMjcuOTk5OTk5OSBMMzQ1LjQ5Mzc0MSwyOCBDMzQ1LjIyMTA1NiwyOCAzNDQuODQwNjQzLDI3Ljg0MDY0MzEgMzQ0LjY0MzI0NiwyNy42NDMyNDUzIEwzMzguNzA5NzIsMjEuNzA5NzE5NSBaJyBpZD0nQmFjayc+PC9wYXRoPlxuXHRcdFx0XHRcdDwvZz5cblx0XHRcdFx0PC9nPlxuXHRcdFx0PC9nPlxuXHRcdDwvc3ZnPlwiXG5cdH1cblx0Zm9vZCA6ICBcIjw/eG1sIHZlcnNpb249JzEuMCcgZW5jb2Rpbmc9J1VURi04JyBzdGFuZGFsb25lPSdubyc/PlxuXHRcdFx0PHN2ZyB3aWR0aD0nMTdweCcgaGVpZ2h0PScxNnB4JyB2aWV3Qm94PScwIDAgMTcgMTcnIHZlcnNpb249JzEuMScgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB4bWxuczp4bGluaz0naHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycgeG1sbnM6c2tldGNoPSdodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gvbnMnPlxuXHRcdFx0XHQ8IS0tIEdlbmVyYXRvcjogU2tldGNoIDMuNS4yICgyNTIzNSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+XG5cdFx0XHRcdDx0aXRsZT5Gb29kPC90aXRsZT5cblx0XHRcdFx0PGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+XG5cdFx0XHRcdDxkZWZzPjwvZGVmcz5cblx0XHRcdFx0PGcgaWQ9J2lPUy05LUtleWJvYXJkcycgc3Ryb2tlPSdub25lJyBzdHJva2Utd2lkdGg9JzEnIGZpbGw9J25vbmUnIGZpbGwtcnVsZT0nZXZlbm9kZCcgc2tldGNoOnR5cGU9J01TUGFnZSc+XG5cdFx0XHRcdFx0PGcgaWQ9J2lQaG9uZS02LVBvcnRyYWl0LUxpZ2h0LUNvcHknIHNrZXRjaDp0eXBlPSdNU0FydGJvYXJkR3JvdXAnIHRyYW5zZm9ybT0ndHJhbnNsYXRlKC0xNDguMDAwMDAwLCAtNjM3LjAwMDAwMCknPlxuXHRcdFx0XHRcdFx0PGcgaWQ9J0tleWJvYXJkcycgc2tldGNoOnR5cGU9J01TTGF5ZXJHcm91cCcgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMC4wMDAwMDAsIDQwOC4wMDAwMDApJz5cblx0XHRcdFx0XHRcdFx0PGcgaWQ9J0Zvb2QnIHRyYW5zZm9ybT0ndHJhbnNsYXRlKDE0OS41MDAwMDAsIDIyOS41MDAwMDApJyBza2V0Y2g6dHlwZT0nTVNTaGFwZUdyb3VwJz5cblx0XHRcdFx0XHRcdFx0XHQ8cGF0aCBkPSdNNS41LDE1LjUgTDEsMTUuNSBMMCw1IEw2LjUsNSBMNi4yNjM2MDkzMyw3LjQ4MjEwMjAyJyBpZD0nRHJpbmsnIHN0cm9rZT0nIzRBNTQ2MSc+PC9wYXRoPlxuXHRcdFx0XHRcdFx0XHRcdDxwYXRoIGQ9J002LjAxMDc3NTQ1LDEuOTY5MzAwOTggTDYuNTE1NzEzNTIsNS4yMjI3MDUzOSBMNS43MTkwODE4NCw1LjY3OTQ3ODEyIEw1LjAzODkwMDksMS45NjkzMDA5OCBMNC44NTU1NzI0NywxLjk2OTMwMDk4IEw0Ljg1NTU3MjQ3LDAuOTY5MzAwOTggTDguODU1NTcyNDcsMC45NjkzMDA5OCBMOC44NTU1NzI0NywxLjk2OTMwMDk4IEw2LjAxMDc3NTQ1LDEuOTY5MzAwOTggWicgaWQ9J1N0cmF3JyBmaWxsPScjNEE1NDYxJyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSg2Ljg1NTU3MiwgMy4zMjQzOTApIHJvdGF0ZSgyNC4wMDAwMDApIHRyYW5zbGF0ZSgtNi44NTU1NzIsIC0zLjMyNDM5MCkgJz48L3BhdGg+XG5cdFx0XHRcdFx0XHRcdFx0PHJlY3QgaWQ9J0JvdHRvbS1CdW4nIHN0cm9rZT0nIzRBNTQ2MScgeD0nMycgeT0nMTQnIHdpZHRoPScxMC41JyBoZWlnaHQ9JzEuNScgcng9JzEnPjwvcmVjdD5cblx0XHRcdFx0XHRcdFx0XHQ8cGF0aCBkPSdNMS41LDEyLjUwMjQ0MDggQzEuNSwxMS45NDg4MDggMS45NDkxNjkxNiwxMS41IDIuNDkyNjg3MjMsMTEuNSBMMTQuMDA3MzEyOCwxMS41IEMxNC41NTU1NTg4LDExLjUgMTUsMTEuOTQ2OTQ5OSAxNSwxMi41MDI0NDA4IEwxNSwxMi45OTc1NTkyIEMxNSwxMy41NTExOTIgMTQuNTUwODMwOCwxNCAxNC4wMDczMTI4LDE0IEwyLjQ5MjY4NzIzLDE0IEMxLjk0NDQ0MTIxLDE0IDEuNSwxMy41NTMwNTAxIDEuNSwxMi45OTc1NTkyIEwxLjUsMTIuNTAyNDQwOCBaIE0zLjkzMzAwMDAzLDExLjgzOTI3MjcgQzMuNDE3NzE4MzQsMTEuNjUxODk3NiAzLjQ0NDgzNjk3LDExLjUgMy45OTU1Nzc1LDExLjUgTDEzLjAwNDQyMjUsMTEuNSBDMTMuNTU0MjY0OCwxMS41IDEzLjU4NjYwNjEsMTEuNjUwMzI1MSAxMy4wNjcsMTEuODM5MjcyNyBMOC41LDEzLjUgTDMuOTMzMDAwMDMsMTEuODM5MjcyNyBaJyBpZD0nJnF1b3Q7UGF0dHkmcXVvdDsnIGZpbGw9JyM0QTU0NjEnPjwvcGF0aD5cblx0XHRcdFx0XHRcdFx0XHQ8cGF0aCBkPSdNMi41LDEwLjUgTDEzLjUsMTAuNSBMMTUsMTEuNSBMMSwxMS41IEwyLjUsMTAuNSBaJyBpZD0nQ2hlZXNlJyBmaWxsPScjNEE1NDYxJz48L3BhdGg+XG5cdFx0XHRcdFx0XHRcdFx0PHBhdGggZD0nTTguMjUsMTAuNSBDMTEuNDI1NjM3MywxMC41IDE0LDEwLjMyODQyNzEgMTQsOS41IEMxNCw4LjY3MTU3Mjg4IDExLjQyNTYzNzMsOCA4LjI1LDggQzUuMDc0MzYyNjksOCAyLjUsOC42NzE1NzI4OCAyLjUsOS41IEMyLjUsMTAuMzI4NDI3MSA1LjA3NDM2MjY5LDEwLjUgOC4yNSwxMC41IFonIGlkPSdUb3AtQnVuJyBzdHJva2U9JyM0QTU0NjEnIHN0cm9rZS13aWR0aD0nMC43NSc+PC9wYXRoPlxuXHRcdFx0XHRcdFx0XHQ8L2c+XG5cdFx0XHRcdFx0XHQ8L2c+XG5cdFx0XHRcdFx0PC9nPlxuXHRcdFx0XHQ8L2c+XG5cdFx0XHQ8L3N2Zz5cIlxuXHRmbGFnczogXCI8P3htbCB2ZXJzaW9uPScxLjAnIGVuY29kaW5nPSdVVEYtOCcgc3RhbmRhbG9uZT0nbm8nPz5cblx0XHRcdDxzdmcgd2lkdGg9JzExcHgnIGhlaWdodD0nMTVweCcgdmlld0JveD0nMCAwIDExIDE1JyB2ZXJzaW9uPScxLjEnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgeG1sbnM6eGxpbms9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnIHhtbG5zOnNrZXRjaD0naHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zJz5cblx0XHRcdFx0PCEtLSBHZW5lcmF0b3I6IFNrZXRjaCAzLjUuMiAoMjUyMzUpIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPlxuXHRcdFx0XHQ8dGl0bGU+RmxhZzwvdGl0bGU+XG5cdFx0XHRcdDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPlxuXHRcdFx0XHQ8ZGVmcz48L2RlZnM+XG5cdFx0XHRcdDxnIGlkPSdpT1MtOS1LZXlib2FyZHMnIHN0cm9rZT0nbm9uZScgc3Ryb2tlLXdpZHRoPScxJyBmaWxsPSdub25lJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnIHNrZXRjaDp0eXBlPSdNU1BhZ2UnPlxuXHRcdFx0XHRcdDxnIGlkPSdpUGhvbmUtNi1Qb3J0cmFpdC1MaWdodC1Db3B5JyBza2V0Y2g6dHlwZT0nTVNBcnRib2FyZEdyb3VwJyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSgtMjc1LjAwMDAwMCwgLTYzOS4wMDAwMDApJz5cblx0XHRcdFx0XHRcdDxnIGlkPSdLZXlib2FyZHMnIHNrZXRjaDp0eXBlPSdNU0xheWVyR3JvdXAnIHRyYW5zZm9ybT0ndHJhbnNsYXRlKDAuMDAwMDAwLCA0MDguMDAwMDAwKSc+XG5cdFx0XHRcdFx0XHRcdDxnIGlkPSdGbGFnJyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSgyNzUuMDAwMDAwLCAyMzEuNTAwMDAwKScgc2tldGNoOnR5cGU9J01TU2hhcGVHcm91cCc+XG5cdFx0XHRcdFx0XHRcdFx0PHJlY3QgaWQ9J1BvbGUnIGZpbGw9JyM0QTU0NjEnIHg9JzAnIHk9JzAnIHdpZHRoPScxJyBoZWlnaHQ9JzE0Jz48L3JlY3Q+XG5cdFx0XHRcdFx0XHRcdFx0PHBhdGggZD0nTTEsMSBDMSwxIDEuMjUsMiAzLjUsMiBDNS43NSwyIDYsMC43NDk5OTk5OTggOCwwLjc1IEMxMCwwLjc0OTk5OTk5OCAxMCwxLjUgMTAsMS41IEwxMCw3LjUgQzEwLDcuNSAxMCw2LjUgOCw2LjUgQzYsNi41IDQuODA2MjM5MTEsOCAzLjUsOCBDMi4xOTM3NjA4OSw4IDEsNyAxLDcgTDEsMSBaJyBzdHJva2U9JyM0QTU0NjEnIHN0cm9rZS1saW5lam9pbj0ncm91bmQnPjwvcGF0aD5cblx0XHRcdFx0XHRcdFx0PC9nPlxuXHRcdFx0XHRcdFx0PC9nPlxuXHRcdFx0XHRcdDwvZz5cblx0XHRcdFx0PC9nPlxuXHRcdFx0PC9zdmc+XCJcblx0ZnJlcXVlbnQ6IFwiPD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0nVVRGLTgnIHN0YW5kYWxvbmU9J25vJz8+XG5cdFx0XHQ8c3ZnIHdpZHRoPScxN3B4JyBoZWlnaHQ9JzE2cHgnIHZpZXdCb3g9JzAgMCAxNyAxNicgdmVyc2lvbj0nMS4xJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHhtbG5zOnhsaW5rPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJyB4bWxuczpza2V0Y2g9J2h0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaC9ucyc+XG5cdFx0XHRcdDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggMy41LjIgKDI1MjM1KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT5cblx0XHRcdFx0PHRpdGxlPlJlY2VudDwvdGl0bGU+XG5cdFx0XHRcdDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPlxuXHRcdFx0XHQ8ZGVmcz48L2RlZnM+XG5cdFx0XHRcdDxnIGlkPSdpT1MtOS1LZXlib2FyZHMnIHN0cm9rZT0nbm9uZScgc3Ryb2tlLXdpZHRoPScxJyBmaWxsPSdub25lJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnIHNrZXRjaDp0eXBlPSdNU1BhZ2UnPlxuXHRcdFx0XHRcdDxnIGlkPSdpUGhvbmUtNi1Qb3J0cmFpdC1MaWdodC1Db3B5JyBza2V0Y2g6dHlwZT0nTVNBcnRib2FyZEdyb3VwJyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSgtNTUuMDAwMDAwLCAtNjM4LjAwMDAwMCknPlxuXHRcdFx0XHRcdFx0PGcgaWQ9J0tleWJvYXJkcycgc2tldGNoOnR5cGU9J01TTGF5ZXJHcm91cCcgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMC4wMDAwMDAsIDQwOC4wMDAwMDApJz5cblx0XHRcdFx0XHRcdFx0PGcgaWQ9J1JlY2VudCcgdHJhbnNmb3JtPSd0cmFuc2xhdGUoNTUuNTAwMDAwLCAyMzAuMDAwMDAwKScgc2tldGNoOnR5cGU9J01TU2hhcGVHcm91cCc+XG5cdFx0XHRcdFx0XHRcdFx0PGNpcmNsZSBpZD0nQm9keScgc3Ryb2tlPScjNEE1NDYxJyBjeD0nOCcgY3k9JzgnIHI9JzgnPjwvY2lyY2xlPlxuXHRcdFx0XHRcdFx0XHRcdDxwYXRoIGQ9J003LjUsNy41IEw3LjUsOC41IEw4LjUsOC41IEw4LjUsMiBMNy41LDIgTDcuNSw3LjUgTDQsNy41IEw0LDguNSBMOC41LDguNSBMOC41LDcuNSBMNy41LDcuNSBaJyBpZD0nSGFuZHMnIGZpbGw9JyM0QTU0NjEnPjwvcGF0aD5cblx0XHRcdFx0XHRcdFx0PC9nPlxuXHRcdFx0XHRcdFx0PC9nPlxuXHRcdFx0XHRcdDwvZz5cblx0XHRcdFx0PC9nPlxuXHRcdFx0PC9zdmc+XCJcblx0a2V5Ym9hcmQgOiBcIjw/eG1sIHZlcnNpb249JzEuMCcgZW5jb2Rpbmc9J1VURi04JyBzdGFuZGFsb25lPSdubyc/PlxuXHRcdFx0PHN2ZyB3aWR0aD0nMzIuNXB4JyBoZWlnaHQ9JzIzLjVweCcgdmlld0JveD0nMCAwIDY1IDQ3JyB2ZXJzaW9uPScxLjEnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgeG1sbnM6eGxpbms9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnPlxuXHRcdFx0ICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggMy42LjEgKDI2MzEzKSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT5cblx0XHRcdCAgICA8dGl0bGU+U2hhcGU8L3RpdGxlPlxuXHRcdFx0ICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPlxuXHRcdFx0ICAgIDxkZWZzPjwvZGVmcz5cblx0XHRcdCAgICA8ZyBpZD0nUGFnZS0xJyBzdHJva2U9J25vbmUnIHN0cm9rZS13aWR0aD0nMScgZmlsbD0nbm9uZScgZmlsbC1ydWxlPSdldmVub2RkJz5cblx0XHRcdCAgICAgICAgPGcgaWQ9J2lQYWQtUG9ydHJhaXQnIHRyYW5zZm9ybT0ndHJhbnNsYXRlKC0xNDM2LjAwMDAwMCwgLTE5NTYuMDAwMDAwKScgZmlsbD0nIzAwMDAwMCc+XG5cdFx0XHQgICAgICAgICAgICA8ZyBpZD0nS2V5Ym9hcmQtTGlnaHQnIHRyYW5zZm9ybT0ndHJhbnNsYXRlKDAuMDAwMDAwLCAxNDIyLjAwMDAwMCknPlxuXHRcdFx0ICAgICAgICAgICAgICAgIDxnIGlkPSdLZXlib2FyZC1kb3duJyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSgxNDEyLjAwMDAwMCwgNTAwLjAwMDAwMCknPlxuXHRcdFx0ICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSdNODcuMDAxMzMyLDM0IEM4OC4xMDUxNjU5LDM0IDg5LDM0Ljg5OTcxMjcgODksMzUuOTkzMjg3NCBMODksNjEuMDA2NzEyNiBDODksNjIuMTA3NTc0OCA4OC4xMDU4NzU5LDYzIDg3LjAwMTMzMiw2MyBMMjUuOTk4NjY4LDYzIEMyNC44OTQ4MzQxLDYzIDI0LDYyLjEwMDI4NzMgMjQsNjEuMDA2NzEyNiBMMjQsMzUuOTkzMjg3NCBDMjQsMzQuODkyNDI1MiAyNC44OTQxMjQxLDM0IDI1Ljk5ODY2OCwzNCBMODcuMDAxMzMyLDM0IFogTTI2LDM2IEwyNiw2MSBMODcsNjEgTDg3LDM2IEwyNiwzNiBaIE03OSw0MCBMODMsNDAgTDgzLDQ0IEw3OSw0NCBMNzksNDAgWiBNNzIsNDAgTDc2LDQwIEw3Niw0NCBMNzIsNDQgTDcyLDQwIFogTTY1LDQwIEw2OSw0MCBMNjksNDQgTDY1LDQ0IEw2NSw0MCBaIE01OCw0MCBMNjIsNDAgTDYyLDQ0IEw1OCw0NCBMNTgsNDAgWiBNNTEsNDAgTDU1LDQwIEw1NSw0NCBMNTEsNDQgTDUxLDQwIFogTTQ0LDQwIEw0OCw0MCBMNDgsNDQgTDQ0LDQ0IEw0NCw0MCBaIE0zNyw0MCBMNDEsNDAgTDQxLDQ0IEwzNyw0NCBMMzcsNDAgWiBNMzAsNDAgTDM0LDQwIEwzNCw0NCBMMzAsNDQgTDMwLDQwIFogTTc5LDQ3IEw4Myw0NyBMODMsNTEgTDc5LDUxIEw3OSw0NyBaIE03Miw0NyBMNzYsNDcgTDc2LDUxIEw3Miw1MSBMNzIsNDcgWiBNNjUsNDcgTDY5LDQ3IEw2OSw1MSBMNjUsNTEgTDY1LDQ3IFogTTU4LDQ3IEw2Miw0NyBMNjIsNTEgTDU4LDUxIEw1OCw0NyBaIE01MSw0NyBMNTUsNDcgTDU1LDUxIEw1MSw1MSBMNTEsNDcgWiBNNDQsNDcgTDQ4LDQ3IEw0OCw1MSBMNDQsNTEgTDQ0LDQ3IFogTTM3LDQ3IEw0MSw0NyBMNDEsNTEgTDM3LDUxIEwzNyw0NyBaIE0zMCw0NyBMMzQsNDcgTDM0LDUxIEwzMCw1MSBMMzAsNDcgWiBNNzksNTQgTDgzLDU0IEw4Myw1OCBMNzksNTggTDc5LDU0IFogTTcyLDU0IEw3Niw1NCBMNzYsNTggTDcyLDU4IEw3Miw1NCBaIE00NCw1NCBMNjksNTQgTDY5LDU4IEw0NCw1OCBMNDQsNTQgWiBNMzcsNTQgTDQxLDU0IEw0MSw1OCBMMzcsNTggTDM3LDU0IFogTTMwLDU0IEwzNCw1NCBMMzQsNTggTDMwLDU4IEwzMCw1NCBaIE00NC4zMTYzNDk4LDY5Ljk3NzEwNDcgQzQzLjM2ODQyMjUsNzAuNTQyMDM0MiA0My4zMzM4NzIxLDcxLjUwOTY0OTUgNDQuMjM3ODIxNyw3Mi4xMzczOTEyIEw1NS4zNjIxNTM5LDc5Ljg2MjYwODggQzU2LjI2NjcxMTMsODAuNDkwNzcyNiA1Ny43MzM4OTY1LDgwLjQ5MDM1MDUgNTguNjM3ODQ2MSw3OS44NjI2MDg4IEw2OS43NjIxNzgzLDcyLjEzNzM5MTIgQzcwLjY2NjczNTcsNzEuNTA5MjI3NCA3MC42NDgwMTIsNzAuNTIwNTIwNCA2OS43MTE1MTg3LDY5LjkyMzQxNjYgTDY5Ljk4MjU3MzEsNzAuMDk2MjM5NiBDNjkuNTE4MTMzMyw2OS44MDAxMTUgNjguNzc4MjU1Nyw2OS44MTI2NDkzIDY4LjMyNjEzMDcsNzAuMTI2OTMyMyBMNTcuODE1NDk5OSw3Ny40MzMxMjYzIEM1Ny4zNjUxMTE3LDc3Ljc0NjIwMiA1Ni42MjgxNjUsNzcuNzM4MTc4NiA1Ni4xNzYyMTAzLDc3LjQxOTk0MjQgTDQ1LjgzODYxMzcsNzAuMTQwODk3NyBDNDUuMzgzNjQ3Miw2OS44MjA1NDA3IDQ0LjYzNzUwMzksNjkuNzg1NzA4OCA0NC4xNTY2MzkzLDcwLjA3MjI4NjIgTDQ0LjMxNjM0OTgsNjkuOTc3MTA0NyBaJyBpZD0nU2hhcGUnPjwvcGF0aD5cblx0XHRcdCAgICAgICAgICAgICAgICA8L2c+XG5cdFx0XHQgICAgICAgICAgICA8L2c+XG5cdFx0XHQgICAgICAgIDwvZz5cblx0XHRcdCAgICA8L2c+XG5cdFx0XHQ8L3N2Zz5cIlxuXHRrZXlQb3BVcDpcblx0XHRsaWdodDpcblx0XHRcdFwiaXBob25lLTVcIiA6IFwiPHN2ZyB3aWR0aD0nNTVweCcgaGVpZ2h0PSc5MnB4JyB2aWV3Qm94PSc1MyAzMTYgNTUgOTInIHZlcnNpb249JzEuMScgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB4bWxuczp4bGluaz0naHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayc+XG5cdFx0XHRcdFx0ICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggMy43LjIgKDI4Mjc2KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT5cblx0XHRcdFx0XHQgICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+XG5cdFx0XHRcdFx0ICAgIDxkZWZzPlxuXHRcdFx0XHRcdCAgICAgICAgPGZpbHRlciB4PSctNTAlJyB5PSctNTAlJyB3aWR0aD0nMjAwJScgaGVpZ2h0PScyMDAlJyBmaWx0ZXJVbml0cz0nb2JqZWN0Qm91bmRpbmdCb3gnIGlkPSdmaWx0ZXItMSc+XG5cdFx0XHRcdFx0ICAgICAgICAgICAgPGZlT2Zmc2V0IGR4PScwJyBkeT0nMScgaW49J1NvdXJjZUFscGhhJyByZXN1bHQ9J3NoYWRvd09mZnNldE91dGVyMSc+PC9mZU9mZnNldD5cblx0XHRcdFx0XHQgICAgICAgICAgICA8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPScxLjUnIGluPSdzaGFkb3dPZmZzZXRPdXRlcjEnIHJlc3VsdD0nc2hhZG93Qmx1ck91dGVyMSc+PC9mZUdhdXNzaWFuQmx1cj5cblx0XHRcdFx0XHQgICAgICAgICAgICA8ZmVDb2xvck1hdHJpeCB2YWx1ZXM9JzAgMCAwIDAgMCAgIDAgMCAwIDAgMCAgIDAgMCAwIDAgMCAgMCAwIDAgMC40IDAnIHR5cGU9J21hdHJpeCcgaW49J3NoYWRvd0JsdXJPdXRlcjEnIHJlc3VsdD0nc2hhZG93TWF0cml4T3V0ZXIxJz48L2ZlQ29sb3JNYXRyaXg+XG5cdFx0XHRcdFx0ICAgICAgICAgICAgPGZlTWVyZ2U+XG5cdFx0XHRcdFx0ICAgICAgICAgICAgICAgIDxmZU1lcmdlTm9kZSBpbj0nc2hhZG93TWF0cml4T3V0ZXIxJz48L2ZlTWVyZ2VOb2RlPlxuXHRcdFx0XHRcdCAgICAgICAgICAgICAgICA8ZmVNZXJnZU5vZGUgaW49J1NvdXJjZUdyYXBoaWMnPjwvZmVNZXJnZU5vZGU+XG5cdFx0XHRcdFx0ICAgICAgICAgICAgPC9mZU1lcmdlPlxuXHRcdFx0XHRcdCAgICAgICAgPC9maWx0ZXI+XG5cdFx0XHRcdFx0ICAgICAgICA8cGF0aCBkPSdNMS4zNDE3MzIzMSw0MC45MzkxNzAxIEMwLjUxNzQ2NjEyOCw0MC4yMDU4OSAwLDM5LjEzNzQyNTEgMCwzNy45NDc3NjM1IEwwLDQuMDAzNDU1OTggQzAsMS43ODkxNzEzNiAxLjc5NTI4MjQ4LDAgNC4wMDk4NzU2NiwwIEw0NC45OTAxMjQzLDAgQzQ3LjIxMjU2MDgsMCA0OSwxLjc5MjQwODMgNDksNC4wMDM0NTU5OCBMNDksMzcuOTQ3NzYzNSBDNDksMzguOTEyNDA1MSA0OC42NTkyNzk4LDM5Ljc5NjM2NTkgNDguMDkxNjA0MSw0MC40ODY4NjY1IEM0OC4wNDE0MjMzLDQwLjkwMzIyODkgNDcuNzExMTg4OCw0MS40MDc0NjcyIDQ3LjA4MjU5MDgsNDEuOTUyMjUgQzQ3LjA4MjU5MDgsNDEuOTUyMjUgMzguNTI5OTE0NSw0OS4wNjQzMzYyIDM4LjUyOTkxNDUsNTEuMTUyNjQyNCBDMzguNTI5OTE0NSw2MS42NDk3NTYxIDM4LjE3NzAwOTksODIuMDAyNTQwNiAzOC4xNzcwMDk5LDgyLjAwMjU0MDYgQzM4LjE0MTIzMDQsODQuMjAyNDM1NCAzNi4zMjEwMjg0LDg2IDM0LjExMjg0OTUsODYgTDE1LjMwNTk1MzksODYgQzEzLjEwNzk2LDg2IDExLjI3ODE4ODQsODQuMjEwMDc4OSAxMS4yNDE3OTM2LDgyLjAwMjA5OTMgQzExLjI0MTc5MzYsODIuMDAyMDk5MyAxMC44ODg4ODg5LDYxLjY0NzA4NTIgMTAuODg4ODg4OSw1MS4xNDg2MzYxIEMxMC44ODg4ODg5LDQ5LjA2MTY2NTQgMi4zNDE0MzY2Miw0Mi4yMzg2NTUgMi4zNDE0MzY2Miw0Mi4yMzg2NTUgQzEuNzc4MjczMTEsNDEuNzY0MTM2NSAxLjQ0ODgxMzU0LDQxLjMyMDQyMzcgMS4zNDE3MzIzMSw0MC45MzkxNzAxIFonIGlkPSdwYXRoLTInPjwvcGF0aD5cblx0XHRcdFx0XHQgICAgICAgIDxtYXNrIGlkPSdtYXNrLTMnIG1hc2tDb250ZW50VW5pdHM9J3VzZXJTcGFjZU9uVXNlJyBtYXNrVW5pdHM9J29iamVjdEJvdW5kaW5nQm94JyB4PScwJyB5PScwJyB3aWR0aD0nNDknIGhlaWdodD0nODYnIGZpbGw9J3doaXRlJz5cblx0XHRcdFx0XHQgICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9JyNwYXRoLTInPjwvdXNlPlxuXHRcdFx0XHRcdCAgICAgICAgPC9tYXNrPlxuXHRcdFx0XHRcdCAgICA8L2RlZnM+XG5cdFx0XHRcdFx0ICAgIDxnIGlkPSdQb3BvdmVyJyBmaWx0ZXI9J3VybCgjZmlsdGVyLTEpJyBzdHJva2U9J25vbmUnIHN0cm9rZS13aWR0aD0nMScgZmlsbD0nbm9uZScgZmlsbC1ydWxlPSdldmVub2RkJyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSg1Ni4wMDAwMDAsIDMxOC4wMDAwMDApJz5cblx0XHRcdFx0XHQgICAgICAgIDx1c2UgaWQ9J1JlY3RhbmdsZS0xNCcgc3Ryb2tlPScjQjJCNEI5JyBtYXNrPSd1cmwoI21hc2stMyknIGZpbGw9JyNGQ0ZDRkMnIHhsaW5rOmhyZWY9JyNwYXRoLTInPjwvdXNlPlxuXHRcdFx0XHRcdCAgICA8L2c+XG5cdFx0XHRcdFx0PC9zdmc+XCJcblx0XHRcdFwiaXBob25lLTZzXCIgOiBcIjxzdmcgd2lkdGg9JzY0cHgnIGhlaWdodD0nMTA3cHgnIHZpZXdCb3g9JzI0IDM4NyA2NCAxMDcnIHZlcnNpb249JzEuMScgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB4bWxuczp4bGluaz0naHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayc+XG5cdFx0XHRcdFx0ICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggMy43LjIgKDI4Mjc2KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT5cblx0XHRcdFx0XHQgICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+XG5cdFx0XHRcdFx0ICAgIDxkZWZzPlxuXHRcdFx0XHRcdCAgICAgICAgPGZpbHRlciB4PSctNTAlJyB5PSctNTAlJyB3aWR0aD0nMjAwJScgaGVpZ2h0PScyMDAlJyBmaWx0ZXJVbml0cz0nb2JqZWN0Qm91bmRpbmdCb3gnIGlkPSdmaWx0ZXItMSc+XG5cdFx0XHRcdFx0ICAgICAgICAgICAgPGZlT2Zmc2V0IGR4PScwJyBkeT0nMScgaW49J1NvdXJjZUFscGhhJyByZXN1bHQ9J3NoYWRvd09mZnNldE91dGVyMSc+PC9mZU9mZnNldD5cblx0XHRcdFx0XHQgICAgICAgICAgICA8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPScxLjUnIGluPSdzaGFkb3dPZmZzZXRPdXRlcjEnIHJlc3VsdD0nc2hhZG93Qmx1ck91dGVyMSc+PC9mZUdhdXNzaWFuQmx1cj5cblx0XHRcdFx0XHQgICAgICAgICAgICA8ZmVDb2xvck1hdHJpeCB2YWx1ZXM9JzAgMCAwIDAgMCAgIDAgMCAwIDAgMCAgIDAgMCAwIDAgMCAgMCAwIDAgMC40IDAnIHR5cGU9J21hdHJpeCcgaW49J3NoYWRvd0JsdXJPdXRlcjEnIHJlc3VsdD0nc2hhZG93TWF0cml4T3V0ZXIxJz48L2ZlQ29sb3JNYXRyaXg+XG5cdFx0XHRcdFx0ICAgICAgICAgICAgPGZlTWVyZ2U+XG5cdFx0XHRcdFx0ICAgICAgICAgICAgICAgIDxmZU1lcmdlTm9kZSBpbj0nc2hhZG93TWF0cml4T3V0ZXIxJz48L2ZlTWVyZ2VOb2RlPlxuXHRcdFx0XHRcdCAgICAgICAgICAgICAgICA8ZmVNZXJnZU5vZGUgaW49J1NvdXJjZUdyYXBoaWMnPjwvZmVNZXJnZU5vZGU+XG5cdFx0XHRcdFx0ICAgICAgICAgICAgPC9mZU1lcmdlPlxuXHRcdFx0XHRcdCAgICAgICAgPC9maWx0ZXI+XG5cdFx0XHRcdFx0ICAgICAgICA8cGF0aCBkPSdNMS40ODY0NzY0Niw0OC4zNzc5OTQ3IEMwLjU4MDI2NjQ5LDQ3LjY0NjQyOTYgMCw0Ni41Mjk1ODcgMCw0NS4yNzgxOTQ4IEwwLDMuOTkwMDk3ODcgQzAsMS43ODI1OTEyIDEuNzk1MDk1NzcsMCA0LjAwOTQ1ODYyLDAgTDUzLjk5MDU0MTQsMCBDNTYuMjAwNTc0NiwwIDU4LDEuNzg2NDI3NjcgNTgsMy45OTAwOTc4NyBMNTgsNDUuMjc4MTk0OCBDNTgsNDYuMTgzMzAwNCA1Ny42OTgyMjU4LDQ3LjAxNjk3MzMgNTcuMTg5NTA5Nyw0Ny42ODU2MzI1IEM1Ny4wMzk2ODY1LDQ4LjAyMTI0OTcgNTYuNzM2MDA5OCw0OC4zOTcyODM0IDU2LjI3MTgzNjMsNDguNzk1MDY2MSBDNTYuMjcxODM2Myw0OC43OTUwNjYxIDQ1LjYwNjgzNzYsNTcuNjIyMDY5MyA0NS42MDY4Mzc2LDYwLjA3NDYxNDkgQzQ1LjYwNjgzNzYsNzIuNDAyNjIwNSA0NS4xNzc5NjcsOTYuOTkyMzE2NCA0NS4xNzc5NjcsOTYuOTkyMzE2NCBDNDUuMTQxMzc0OCw5OS4yMTIyMjE0IDQzLjMxOTMwNjUsMTAxIDQxLjEwOTAwMzUsMTAxIEwxNy4zODY3MjMsMTAxIEMxNS4xODEyNzIyLDEwMSAxMy4zNTQ2ODMsOTkuMjA1NTAwOSAxMy4zMTc3NTk1LDk2Ljk5MTg3NDEgQzEzLjMxNzc1OTUsOTYuOTkxODc0MSAxMi44ODg4ODg5LDcyLjM5OTQ4MzggMTIuODg4ODg4OSw2MC4wNjk5MDk5IEMxMi44ODg4ODg5LDU3LjYxODkzMjYgMi4yMjY3MzQzNyw0OS4xNDYyOTM2IDIuMjI2NzM0MzcsNDkuMTQ2MjkzNiBDMS45MDUyNDA4Nyw0OC44Nzg4MzI3IDEuNjU5MTE2NTUsNDguNjIwNzMzIDEuNDg2NDc2NDYsNDguMzc3OTk0NyBaJyBpZD0ncGF0aC0yJz48L3BhdGg+XG5cdFx0XHRcdFx0ICAgICAgICA8bWFzayBpZD0nbWFzay0zJyBtYXNrQ29udGVudFVuaXRzPSd1c2VyU3BhY2VPblVzZScgbWFza1VuaXRzPSdvYmplY3RCb3VuZGluZ0JveCcgeD0nMCcgeT0nMCcgd2lkdGg9JzU4JyBoZWlnaHQ9JzEwMScgZmlsbD0nd2hpdGUnPlxuXHRcdFx0XHRcdCAgICAgICAgICAgIDx1c2UgeGxpbms6aHJlZj0nI3BhdGgtMic+PC91c2U+XG5cdFx0XHRcdFx0ICAgICAgICA8L21hc2s+XG5cdFx0XHRcdFx0ICAgIDwvZGVmcz5cblx0XHRcdFx0XHQgICAgPGcgaWQ9J1BvcG92ZXInIGZpbHRlcj0ndXJsKCNmaWx0ZXItMSknIHN0cm9rZT0nbm9uZScgc3Ryb2tlLXdpZHRoPScxJyBmaWxsPSdub25lJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnIHRyYW5zZm9ybT0ndHJhbnNsYXRlKDI3LjAwMDAwMCwgMzg5LjAwMDAwMCknPlxuXHRcdFx0XHRcdCAgICAgICAgPHVzZSBpZD0nUmVjdGFuZ2xlLTE0JyBzdHJva2U9JyNCMkI0QjknIG1hc2s9J3VybCgjbWFzay0zKScgZmlsbD0nI0ZDRkNGQycgeGxpbms6aHJlZj0nI3BhdGgtMic+PC91c2U+XG5cdFx0XHRcdFx0ICAgIDwvZz5cblx0XHRcdFx0XHQ8L3N2Zz5cIlxuXHRcdFx0XCJpcGhvbmUtNnMtcGx1c1wiIDogXCI8c3ZnIHdpZHRoPSc3MHB4JyBoZWlnaHQ9JzExOXB4JyB2aWV3Qm94PScyOCA0NTAgNzAgMTE5JyB2ZXJzaW9uPScxLjEnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgeG1sbnM6eGxpbms9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnPlxuXHRcdFx0XHRcdCAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDMuNy4yICgyODI3NikgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+XG5cdFx0XHRcdFx0ICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPlxuXHRcdFx0XHRcdCAgICA8ZGVmcz5cblx0XHRcdFx0XHQgICAgICAgIDxmaWx0ZXIgeD0nLTUwJScgeT0nLTUwJScgd2lkdGg9JzIwMCUnIGhlaWdodD0nMjAwJScgZmlsdGVyVW5pdHM9J29iamVjdEJvdW5kaW5nQm94JyBpZD0nZmlsdGVyLTEnPlxuXHRcdFx0XHRcdCAgICAgICAgICAgIDxmZU9mZnNldCBkeD0nMCcgZHk9JzEnIGluPSdTb3VyY2VBbHBoYScgcmVzdWx0PSdzaGFkb3dPZmZzZXRPdXRlcjEnPjwvZmVPZmZzZXQ+XG5cdFx0XHRcdFx0ICAgICAgICAgICAgPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0nMS41JyBpbj0nc2hhZG93T2Zmc2V0T3V0ZXIxJyByZXN1bHQ9J3NoYWRvd0JsdXJPdXRlcjEnPjwvZmVHYXVzc2lhbkJsdXI+XG5cdFx0XHRcdFx0ICAgICAgICAgICAgPGZlQ29sb3JNYXRyaXggdmFsdWVzPScwIDAgMCAwIDAgICAwIDAgMCAwIDAgICAwIDAgMCAwIDAgIDAgMCAwIDAuNCAwJyB0eXBlPSdtYXRyaXgnIGluPSdzaGFkb3dCbHVyT3V0ZXIxJyByZXN1bHQ9J3NoYWRvd01hdHJpeE91dGVyMSc+PC9mZUNvbG9yTWF0cml4PlxuXHRcdFx0XHRcdCAgICAgICAgICAgIDxmZU1lcmdlPlxuXHRcdFx0XHRcdCAgICAgICAgICAgICAgICA8ZmVNZXJnZU5vZGUgaW49J3NoYWRvd01hdHJpeE91dGVyMSc+PC9mZU1lcmdlTm9kZT5cblx0XHRcdFx0XHQgICAgICAgICAgICAgICAgPGZlTWVyZ2VOb2RlIGluPSdTb3VyY2VHcmFwaGljJz48L2ZlTWVyZ2VOb2RlPlxuXHRcdFx0XHRcdCAgICAgICAgICAgIDwvZmVNZXJnZT5cblx0XHRcdFx0XHQgICAgICAgIDwvZmlsdGVyPlxuXHRcdFx0XHRcdCAgICAgICAgPHBhdGggZD0nTTEuOTU3MjkzOTUsNTQuMDcyODMwNCBDMC43ODU5MTExMzIsNTMuMzc1NzY5OSAwLDUyLjA5ODc3NiAwLDUwLjYzODkwMjIgTDAsMy45OTUyNDQxOSBDMCwxLjc4NjcxNDI4IDEuNzkyNDIyMDIsMCA0LjAwMzQ4NjYzLDAgTDU5Ljk5NjUxMzQsMCBDNjIuMjA0NjIzNSwwIDY0LDEuNzg4NzMxNzUgNjQsMy45OTUyNDQxOSBMNjQsNTAuNjM4OTAyMiBDNjQsNTEuOTIzMzY4NiA2My4zOTM3MTE2LDUzLjA2NTE1NTYgNjIuNDUxMzkxLDUzLjc5NTc1NCBDNjIuNDQyNzc1Miw1My44MDMyNDMzIDYyLjQzNDEwMTksNTMuODEwNzQwNCA2Mi40MjUzNzA5LDUzLjgxODI0NTQgQzYyLjQyNTM3MDksNTMuODE4MjQ1NCA1MC4zMjQ3ODYzLDYzLjg5Nzc0MDIgNTAuMzI0Nzg2Myw2Ni42MTczOTQ3IEM1MC4zMjQ3ODYzLDgwLjI4ODA1NDQgNDkuODQ0MzA0OSwxMDguMDAyMDA3IDQ5Ljg0NDMwNDksMTA4LjAwMjAwNyBDNDkuODA3OTY2NSwxMTAuMjEwMjM0IDQ3Ljk4NzQyMzIsMTEyIDQ1Ljc3ODkwODksMTEyIEwxOC43NjgwOTk3LDExMiBDMTYuNTUzNDM5NywxMTIgMTQuNzM5NDQ1NiwxMTAuMjA5ODQgMTQuNzAyNzAzNywxMDguMDAxNTY2IEMxNC43MDI3MDM3LDEwOC4wMDE1NjYgMTQuMjIyMjIyMiw4MC4yODQ1NzYxIDE0LjIyMjIyMjIsNjYuNjEyMTc3MyBDMTQuMjIyMjIyMiw2My44OTQyNjE5IDIuMTQwODE0MjIsNTQuMjMyMTMzNyAyLjE0MDgxNDIyLDU0LjIzMjEzMzcgQzIuMDc2NjQ5MTMsNTQuMTc4NjI5OCAyLjAxNTQ4MTExLDU0LjEyNTUxMzQgMS45NTcyOTM5NSw1NC4wNzI4MzA0IFonIGlkPSdwYXRoLTInPjwvcGF0aD5cblx0XHRcdFx0XHQgICAgICAgIDxtYXNrIGlkPSdtYXNrLTMnIG1hc2tDb250ZW50VW5pdHM9J3VzZXJTcGFjZU9uVXNlJyBtYXNrVW5pdHM9J29iamVjdEJvdW5kaW5nQm94JyB4PScwJyB5PScwJyB3aWR0aD0nNjQnIGhlaWdodD0nMTEyJyBmaWxsPSd3aGl0ZSc+XG5cdFx0XHRcdFx0ICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPScjcGF0aC0yJz48L3VzZT5cblx0XHRcdFx0XHQgICAgICAgIDwvbWFzaz5cblx0XHRcdFx0XHQgICAgPC9kZWZzPlxuXHRcdFx0XHRcdCAgICA8ZyBpZD0nUG9wb3ZlcicgZmlsdGVyPSd1cmwoI2ZpbHRlci0xKScgc3Ryb2tlPSdub25lJyBzdHJva2Utd2lkdGg9JzEnIGZpbGw9J25vbmUnIGZpbGwtcnVsZT0nZXZlbm9kZCcgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMzEuMDAwMDAwLCA0NTIuMDAwMDAwKSc+XG5cdFx0XHRcdFx0ICAgICAgICA8dXNlIGlkPSdSZWN0YW5nbGUtMTQnIHN0cm9rZT0nI0IyQjRCOScgbWFzaz0ndXJsKCNtYXNrLTMpJyBmaWxsPScjRkNGQ0ZDJyB4bGluazpocmVmPScjcGF0aC0yJz48L3VzZT5cblx0XHRcdFx0XHQgICAgPC9nPlxuXHRcdFx0XHRcdDwvc3ZnPlwiXG5cdFx0ZGFyazpcblx0XHRcdFwiaXBob25lLTVcIiA6IFwiPHN2ZyB3aWR0aD0nNTVweCcgaGVpZ2h0PSc5MnB4JyB2aWV3Qm94PSc1MyAzMTYgNTUgOTInIHZlcnNpb249JzEuMScgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB4bWxuczp4bGluaz0naHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayc+XG5cdFx0XHRcdFx0ICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggMy43LjIgKDI4Mjc2KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT5cblx0XHRcdFx0XHQgICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+XG5cdFx0XHRcdFx0ICAgIDxkZWZzPlxuXHRcdFx0XHRcdCAgICAgICAgPGZpbHRlciB4PSctNTAlJyB5PSctNTAlJyB3aWR0aD0nMjAwJScgaGVpZ2h0PScyMDAlJyBmaWx0ZXJVbml0cz0nb2JqZWN0Qm91bmRpbmdCb3gnIGlkPSdmaWx0ZXItMSc+XG5cdFx0XHRcdFx0ICAgICAgICAgICAgPGZlT2Zmc2V0IGR4PScwJyBkeT0nMScgaW49J1NvdXJjZUFscGhhJyByZXN1bHQ9J3NoYWRvd09mZnNldE91dGVyMSc+PC9mZU9mZnNldD5cblx0XHRcdFx0XHQgICAgICAgICAgICA8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPScxLjUnIGluPSdzaGFkb3dPZmZzZXRPdXRlcjEnIHJlc3VsdD0nc2hhZG93Qmx1ck91dGVyMSc+PC9mZUdhdXNzaWFuQmx1cj5cblx0XHRcdFx0XHQgICAgICAgICAgICA8ZmVDb2xvck1hdHJpeCB2YWx1ZXM9JzAgMCAwIDAgMCAgIDAgMCAwIDAgMCAgIDAgMCAwIDAgMCAgMCAwIDAgMC40IDAnIHR5cGU9J21hdHJpeCcgaW49J3NoYWRvd0JsdXJPdXRlcjEnIHJlc3VsdD0nc2hhZG93TWF0cml4T3V0ZXIxJz48L2ZlQ29sb3JNYXRyaXg+XG5cdFx0XHRcdFx0ICAgICAgICAgICAgPGZlTWVyZ2U+XG5cdFx0XHRcdFx0ICAgICAgICAgICAgICAgIDxmZU1lcmdlTm9kZSBpbj0nc2hhZG93TWF0cml4T3V0ZXIxJz48L2ZlTWVyZ2VOb2RlPlxuXHRcdFx0XHRcdCAgICAgICAgICAgICAgICA8ZmVNZXJnZU5vZGUgaW49J1NvdXJjZUdyYXBoaWMnPjwvZmVNZXJnZU5vZGU+XG5cdFx0XHRcdFx0ICAgICAgICAgICAgPC9mZU1lcmdlPlxuXHRcdFx0XHRcdCAgICAgICAgPC9maWx0ZXI+XG5cdFx0XHRcdFx0ICAgICAgICA8cGF0aCBkPSdNMS4zNDE3MzIzMSw0MC45MzkxNzAxIEMwLjUxNzQ2NjEyOCw0MC4yMDU4OSAwLDM5LjEzNzQyNTEgMCwzNy45NDc3NjM1IEwwLDQuMDAzNDU1OTggQzAsMS43ODkxNzEzNiAxLjc5NTI4MjQ4LDAgNC4wMDk4NzU2NiwwIEw0NC45OTAxMjQzLDAgQzQ3LjIxMjU2MDgsMCA0OSwxLjc5MjQwODMgNDksNC4wMDM0NTU5OCBMNDksMzcuOTQ3NzYzNSBDNDksMzguOTEyNDA1MSA0OC42NTkyNzk4LDM5Ljc5NjM2NTkgNDguMDkxNjA0MSw0MC40ODY4NjY1IEM0OC4wNDE0MjMzLDQwLjkwMzIyODkgNDcuNzExMTg4OCw0MS40MDc0NjcyIDQ3LjA4MjU5MDgsNDEuOTUyMjUgQzQ3LjA4MjU5MDgsNDEuOTUyMjUgMzguNTI5OTE0NSw0OS4wNjQzMzYyIDM4LjUyOTkxNDUsNTEuMTUyNjQyNCBDMzguNTI5OTE0NSw2MS42NDk3NTYxIDM4LjE3NzAwOTksODIuMDAyNTQwNiAzOC4xNzcwMDk5LDgyLjAwMjU0MDYgQzM4LjE0MTIzMDQsODQuMjAyNDM1NCAzNi4zMjEwMjg0LDg2IDM0LjExMjg0OTUsODYgTDE1LjMwNTk1MzksODYgQzEzLjEwNzk2LDg2IDExLjI3ODE4ODQsODQuMjEwMDc4OSAxMS4yNDE3OTM2LDgyLjAwMjA5OTMgQzExLjI0MTc5MzYsODIuMDAyMDk5MyAxMC44ODg4ODg5LDYxLjY0NzA4NTIgMTAuODg4ODg4OSw1MS4xNDg2MzYxIEMxMC44ODg4ODg5LDQ5LjA2MTY2NTQgMi4zNDE0MzY2Miw0Mi4yMzg2NTUgMi4zNDE0MzY2Miw0Mi4yMzg2NTUgQzEuNzc4MjczMTEsNDEuNzY0MTM2NSAxLjQ0ODgxMzU0LDQxLjMyMDQyMzcgMS4zNDE3MzIzMSw0MC45MzkxNzAxIFonIGlkPSdwYXRoLTInPjwvcGF0aD5cblx0XHRcdFx0XHQgICAgICAgIDxtYXNrIGlkPSdtYXNrLTMnIG1hc2tDb250ZW50VW5pdHM9J3VzZXJTcGFjZU9uVXNlJyBtYXNrVW5pdHM9J29iamVjdEJvdW5kaW5nQm94JyB4PScwJyB5PScwJyB3aWR0aD0nNDknIGhlaWdodD0nODYnIGZpbGw9J3doaXRlJz5cblx0XHRcdFx0XHQgICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9JyNwYXRoLTInPjwvdXNlPlxuXHRcdFx0XHRcdCAgICAgICAgPC9tYXNrPlxuXHRcdFx0XHRcdCAgICA8L2RlZnM+XG5cdFx0XHRcdFx0ICAgIDxnIGlkPSdQb3BvdmVyJyBmaWx0ZXI9J3VybCgjZmlsdGVyLTEpJyBzdHJva2U9J25vbmUnIHN0cm9rZS13aWR0aD0nMScgZmlsbD0nbm9uZScgZmlsbC1ydWxlPSdldmVub2RkJyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSg1Ni4wMDAwMDAsIDMxOC4wMDAwMDApJz5cblx0XHRcdFx0XHQgICAgICAgIDx1c2UgaWQ9J1JlY3RhbmdsZS0xNCcgc3Ryb2tlPScjNjM2MzYzJyBtYXNrPSd1cmwoI21hc2stMyknIGZpbGw9JyM2MzYzNjMnIHhsaW5rOmhyZWY9JyNwYXRoLTInPjwvdXNlPlxuXHRcdFx0XHRcdCAgICA8L2c+XG5cdFx0XHRcdFx0PC9zdmc+XCJcblx0XHRcdFwiaXBob25lLTZzXCIgOiBcIjxzdmcgd2lkdGg9JzY0cHgnIGhlaWdodD0nMTA3cHgnIHZpZXdCb3g9JzI0IDM4NyA2NCAxMDcnIHZlcnNpb249JzEuMScgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB4bWxuczp4bGluaz0naHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayc+XG5cdFx0XHRcdFx0ICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggMy43LjIgKDI4Mjc2KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT5cblx0XHRcdFx0XHQgICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+XG5cdFx0XHRcdFx0ICAgIDxkZWZzPlxuXHRcdFx0XHRcdCAgICAgICAgPGZpbHRlciB4PSctNTAlJyB5PSctNTAlJyB3aWR0aD0nMjAwJScgaGVpZ2h0PScyMDAlJyBmaWx0ZXJVbml0cz0nb2JqZWN0Qm91bmRpbmdCb3gnIGlkPSdmaWx0ZXItMSc+XG5cdFx0XHRcdFx0ICAgICAgICAgICAgPGZlT2Zmc2V0IGR4PScwJyBkeT0nMScgaW49J1NvdXJjZUFscGhhJyByZXN1bHQ9J3NoYWRvd09mZnNldE91dGVyMSc+PC9mZU9mZnNldD5cblx0XHRcdFx0XHQgICAgICAgICAgICA8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPScxLjUnIGluPSdzaGFkb3dPZmZzZXRPdXRlcjEnIHJlc3VsdD0nc2hhZG93Qmx1ck91dGVyMSc+PC9mZUdhdXNzaWFuQmx1cj5cblx0XHRcdFx0XHQgICAgICAgICAgICA8ZmVDb2xvck1hdHJpeCB2YWx1ZXM9JzAgMCAwIDAgMCAgIDAgMCAwIDAgMCAgIDAgMCAwIDAgMCAgMCAwIDAgMC40IDAnIHR5cGU9J21hdHJpeCcgaW49J3NoYWRvd0JsdXJPdXRlcjEnIHJlc3VsdD0nc2hhZG93TWF0cml4T3V0ZXIxJz48L2ZlQ29sb3JNYXRyaXg+XG5cdFx0XHRcdFx0ICAgICAgICAgICAgPGZlTWVyZ2U+XG5cdFx0XHRcdFx0ICAgICAgICAgICAgICAgIDxmZU1lcmdlTm9kZSBpbj0nc2hhZG93TWF0cml4T3V0ZXIxJz48L2ZlTWVyZ2VOb2RlPlxuXHRcdFx0XHRcdCAgICAgICAgICAgICAgICA8ZmVNZXJnZU5vZGUgaW49J1NvdXJjZUdyYXBoaWMnPjwvZmVNZXJnZU5vZGU+XG5cdFx0XHRcdFx0ICAgICAgICAgICAgPC9mZU1lcmdlPlxuXHRcdFx0XHRcdCAgICAgICAgPC9maWx0ZXI+XG5cdFx0XHRcdFx0ICAgICAgICA8cGF0aCBkPSdNMS40ODY0NzY0Niw0OC4zNzc5OTQ3IEMwLjU4MDI2NjQ5LDQ3LjY0NjQyOTYgMCw0Ni41Mjk1ODcgMCw0NS4yNzgxOTQ4IEwwLDMuOTkwMDk3ODcgQzAsMS43ODI1OTEyIDEuNzk1MDk1NzcsMCA0LjAwOTQ1ODYyLDAgTDUzLjk5MDU0MTQsMCBDNTYuMjAwNTc0NiwwIDU4LDEuNzg2NDI3NjcgNTgsMy45OTAwOTc4NyBMNTgsNDUuMjc4MTk0OCBDNTgsNDYuMTgzMzAwNCA1Ny42OTgyMjU4LDQ3LjAxNjk3MzMgNTcuMTg5NTA5Nyw0Ny42ODU2MzI1IEM1Ny4wMzk2ODY1LDQ4LjAyMTI0OTcgNTYuNzM2MDA5OCw0OC4zOTcyODM0IDU2LjI3MTgzNjMsNDguNzk1MDY2MSBDNTYuMjcxODM2Myw0OC43OTUwNjYxIDQ1LjYwNjgzNzYsNTcuNjIyMDY5MyA0NS42MDY4Mzc2LDYwLjA3NDYxNDkgQzQ1LjYwNjgzNzYsNzIuNDAyNjIwNSA0NS4xNzc5NjcsOTYuOTkyMzE2NCA0NS4xNzc5NjcsOTYuOTkyMzE2NCBDNDUuMTQxMzc0OCw5OS4yMTIyMjE0IDQzLjMxOTMwNjUsMTAxIDQxLjEwOTAwMzUsMTAxIEwxNy4zODY3MjMsMTAxIEMxNS4xODEyNzIyLDEwMSAxMy4zNTQ2ODMsOTkuMjA1NTAwOSAxMy4zMTc3NTk1LDk2Ljk5MTg3NDEgQzEzLjMxNzc1OTUsOTYuOTkxODc0MSAxMi44ODg4ODg5LDcyLjM5OTQ4MzggMTIuODg4ODg4OSw2MC4wNjk5MDk5IEMxMi44ODg4ODg5LDU3LjYxODkzMjYgMi4yMjY3MzQzNyw0OS4xNDYyOTM2IDIuMjI2NzM0MzcsNDkuMTQ2MjkzNiBDMS45MDUyNDA4Nyw0OC44Nzg4MzI3IDEuNjU5MTE2NTUsNDguNjIwNzMzIDEuNDg2NDc2NDYsNDguMzc3OTk0NyBaJyBpZD0ncGF0aC0yJz48L3BhdGg+XG5cdFx0XHRcdFx0ICAgICAgICA8bWFzayBpZD0nbWFzay0zJyBtYXNrQ29udGVudFVuaXRzPSd1c2VyU3BhY2VPblVzZScgbWFza1VuaXRzPSdvYmplY3RCb3VuZGluZ0JveCcgeD0nMCcgeT0nMCcgd2lkdGg9JzU4JyBoZWlnaHQ9JzEwMScgZmlsbD0nd2hpdGUnPlxuXHRcdFx0XHRcdCAgICAgICAgICAgIDx1c2UgeGxpbms6aHJlZj0nI3BhdGgtMic+PC91c2U+XG5cdFx0XHRcdFx0ICAgICAgICA8L21hc2s+XG5cdFx0XHRcdFx0ICAgIDwvZGVmcz5cblx0XHRcdFx0XHQgICAgPGcgaWQ9J1BvcG92ZXInIGZpbHRlcj0ndXJsKCNmaWx0ZXItMSknIHN0cm9rZT0nbm9uZScgc3Ryb2tlLXdpZHRoPScxJyBmaWxsPSdub25lJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnIHRyYW5zZm9ybT0ndHJhbnNsYXRlKDI3LjAwMDAwMCwgMzg5LjAwMDAwMCknPlxuXHRcdFx0XHRcdCAgICAgICAgPHVzZSBpZD0nUmVjdGFuZ2xlLTE0JyBzdHJva2U9JyMjNjM2MzYzJyBtYXNrPSd1cmwoI21hc2stMyknIGZpbGw9JyM2MzYzNjMnIHhsaW5rOmhyZWY9JyNwYXRoLTInPjwvdXNlPlxuXHRcdFx0XHRcdCAgICA8L2c+XG5cdFx0XHRcdFx0PC9zdmc+XCJcblx0XHRcdFwiaXBob25lLTZzLXBsdXNcIiA6IFwiPHN2ZyB3aWR0aD0nNzBweCcgaGVpZ2h0PScxMTlweCcgdmlld0JveD0nMjggNDUwIDcwIDExOScgdmVyc2lvbj0nMS4xJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHhtbG5zOnhsaW5rPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJz5cblx0XHRcdFx0XHQgICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCAzLjcuMiAoMjgyNzYpIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPlxuXHRcdFx0XHRcdCAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz5cblx0XHRcdFx0XHQgICAgPGRlZnM+XG5cdFx0XHRcdFx0ICAgICAgICA8ZmlsdGVyIHg9Jy01MCUnIHk9Jy01MCUnIHdpZHRoPScyMDAlJyBoZWlnaHQ9JzIwMCUnIGZpbHRlclVuaXRzPSdvYmplY3RCb3VuZGluZ0JveCcgaWQ9J2ZpbHRlci0xJz5cblx0XHRcdFx0XHQgICAgICAgICAgICA8ZmVPZmZzZXQgZHg9JzAnIGR5PScxJyBpbj0nU291cmNlQWxwaGEnIHJlc3VsdD0nc2hhZG93T2Zmc2V0T3V0ZXIxJz48L2ZlT2Zmc2V0PlxuXHRcdFx0XHRcdCAgICAgICAgICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249JzEuNScgaW49J3NoYWRvd09mZnNldE91dGVyMScgcmVzdWx0PSdzaGFkb3dCbHVyT3V0ZXIxJz48L2ZlR2F1c3NpYW5CbHVyPlxuXHRcdFx0XHRcdCAgICAgICAgICAgIDxmZUNvbG9yTWF0cml4IHZhbHVlcz0nMCAwIDAgMCAwICAgMCAwIDAgMCAwICAgMCAwIDAgMCAwICAwIDAgMCAwLjQgMCcgdHlwZT0nbWF0cml4JyBpbj0nc2hhZG93Qmx1ck91dGVyMScgcmVzdWx0PSdzaGFkb3dNYXRyaXhPdXRlcjEnPjwvZmVDb2xvck1hdHJpeD5cblx0XHRcdFx0XHQgICAgICAgICAgICA8ZmVNZXJnZT5cblx0XHRcdFx0XHQgICAgICAgICAgICAgICAgPGZlTWVyZ2VOb2RlIGluPSdzaGFkb3dNYXRyaXhPdXRlcjEnPjwvZmVNZXJnZU5vZGU+XG5cdFx0XHRcdFx0ICAgICAgICAgICAgICAgIDxmZU1lcmdlTm9kZSBpbj0nU291cmNlR3JhcGhpYyc+PC9mZU1lcmdlTm9kZT5cblx0XHRcdFx0XHQgICAgICAgICAgICA8L2ZlTWVyZ2U+XG5cdFx0XHRcdFx0ICAgICAgICA8L2ZpbHRlcj5cblx0XHRcdFx0XHQgICAgICAgIDxwYXRoIGQ9J00xLjk1NzI5Mzk1LDU0LjA3MjgzMDQgQzAuNzg1OTExMTMyLDUzLjM3NTc2OTkgMCw1Mi4wOTg3NzYgMCw1MC42Mzg5MDIyIEwwLDMuOTk1MjQ0MTkgQzAsMS43ODY3MTQyOCAxLjc5MjQyMjAyLDAgNC4wMDM0ODY2MywwIEw1OS45OTY1MTM0LDAgQzYyLjIwNDYyMzUsMCA2NCwxLjc4ODczMTc1IDY0LDMuOTk1MjQ0MTkgTDY0LDUwLjYzODkwMjIgQzY0LDUxLjkyMzM2ODYgNjMuMzkzNzExNiw1My4wNjUxNTU2IDYyLjQ1MTM5MSw1My43OTU3NTQgQzYyLjQ0Mjc3NTIsNTMuODAzMjQzMyA2Mi40MzQxMDE5LDUzLjgxMDc0MDQgNjIuNDI1MzcwOSw1My44MTgyNDU0IEM2Mi40MjUzNzA5LDUzLjgxODI0NTQgNTAuMzI0Nzg2Myw2My44OTc3NDAyIDUwLjMyNDc4NjMsNjYuNjE3Mzk0NyBDNTAuMzI0Nzg2Myw4MC4yODgwNTQ0IDQ5Ljg0NDMwNDksMTA4LjAwMjAwNyA0OS44NDQzMDQ5LDEwOC4wMDIwMDcgQzQ5LjgwNzk2NjUsMTEwLjIxMDIzNCA0Ny45ODc0MjMyLDExMiA0NS43Nzg5MDg5LDExMiBMMTguNzY4MDk5NywxMTIgQzE2LjU1MzQzOTcsMTEyIDE0LjczOTQ0NTYsMTEwLjIwOTg0IDE0LjcwMjcwMzcsMTA4LjAwMTU2NiBDMTQuNzAyNzAzNywxMDguMDAxNTY2IDE0LjIyMjIyMjIsODAuMjg0NTc2MSAxNC4yMjIyMjIyLDY2LjYxMjE3NzMgQzE0LjIyMjIyMjIsNjMuODk0MjYxOSAyLjE0MDgxNDIyLDU0LjIzMjEzMzcgMi4xNDA4MTQyMiw1NC4yMzIxMzM3IEMyLjA3NjY0OTEzLDU0LjE3ODYyOTggMi4wMTU0ODExMSw1NC4xMjU1MTM0IDEuOTU3MjkzOTUsNTQuMDcyODMwNCBaJyBpZD0ncGF0aC0yJz48L3BhdGg+XG5cdFx0XHRcdFx0ICAgICAgICA8bWFzayBpZD0nbWFzay0zJyBtYXNrQ29udGVudFVuaXRzPSd1c2VyU3BhY2VPblVzZScgbWFza1VuaXRzPSdvYmplY3RCb3VuZGluZ0JveCcgeD0nMCcgeT0nMCcgd2lkdGg9JzY0JyBoZWlnaHQ9JzExMicgZmlsbD0nd2hpdGUnPlxuXHRcdFx0XHRcdCAgICAgICAgICAgIDx1c2UgeGxpbms6aHJlZj0nI3BhdGgtMic+PC91c2U+XG5cdFx0XHRcdFx0ICAgICAgICA8L21hc2s+XG5cdFx0XHRcdFx0ICAgIDwvZGVmcz5cblx0XHRcdFx0XHQgICAgPGcgaWQ9J1BvcG92ZXInIGZpbHRlcj0ndXJsKCNmaWx0ZXItMSknIHN0cm9rZT0nbm9uZScgc3Ryb2tlLXdpZHRoPScxJyBmaWxsPSdub25lJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnIHRyYW5zZm9ybT0ndHJhbnNsYXRlKDMxLjAwMDAwMCwgNDUyLjAwMDAwMCknPlxuXHRcdFx0XHRcdCAgICAgICAgPHVzZSBpZD0nUmVjdGFuZ2xlLTE0JyBzdHJva2U9JyM2MzYzNjMnIG1hc2s9J3VybCgjbWFzay0zKScgZmlsbD0nIzYzNjM2MycgeGxpbms6aHJlZj0nI3BhdGgtMic+PC91c2U+XG5cdFx0XHRcdFx0ICAgIDwvZz5cblx0XHRcdFx0XHQ8L3N2Zz5cIlxuXG5cdG9iamVjdHMgOlxuXHRcdFwiPD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0nVVRGLTgnIHN0YW5kYWxvbmU9J25vJz8+XG5cdFx0XHRcdDxzdmcgd2lkdGg9JzExcHgnIGhlaWdodD0nMTZweCcgdmlld0JveD0nMCAwIDExIDE2JyB2ZXJzaW9uPScxLjEnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgeG1sbnM6eGxpbms9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnIHhtbG5zOnNrZXRjaD0naHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zJz5cblx0XHRcdFx0PCEtLSBHZW5lcmF0b3I6IFNrZXRjaCAzLjUuMiAoMjUyMzUpIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPlxuXHRcdFx0XHQ8dGl0bGU+TGlnaHRidWxiPC90aXRsZT5cblx0XHRcdFx0PGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+XG5cdFx0XHRcdDxkZWZzPjwvZGVmcz5cblx0XHRcdFx0PGcgaWQ9J1BhZ2UtMScgc3Ryb2tlPSdub25lJyBzdHJva2Utd2lkdGg9JzEnIGZpbGw9J25vbmUnIGZpbGwtcnVsZT0nZXZlbm9kZCcgc2tldGNoOnR5cGU9J01TUGFnZSc+XG5cdFx0XHRcdFx0PGcgaWQ9J2lQaG9uZS02JyBza2V0Y2g6dHlwZT0nTVNBcnRib2FyZEdyb3VwJyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSgtMjQ0LjAwMDAwMCwgLTYzOS4wMDAwMDApJyBzdHJva2U9JyM0QTUzNjEnPlxuXHRcdFx0XHRcdFx0PGcgaWQ9J0xpZ2h0YnVsYicgc2tldGNoOnR5cGU9J01TTGF5ZXJHcm91cCcgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMjQ0LjAwMDAwMCwgNjM5LjAwMDAwMCknPlxuXHRcdFx0XHRcdFx0XHQ8cGF0aCBkPSdNOCwxMC40MDAyOTA0IEM5Ljc4MDgzNzk1LDkuNDg5OTM0OTEgMTEsNy42MzczNDI3MyAxMSw1LjUgQzExLDIuNDYyNDMzODggOC41Mzc1NjYxMiwwIDUuNSwwIEMyLjQ2MjQzMzg4LDAgMCwyLjQ2MjQzMzg4IDAsNS41IEMwLDcuNjM3MzQyNzMgMS4yMTkxNjIwNSw5LjQ4OTkzNDkxIDMsMTAuNDAwMjkwNCBMMywxNC4wMDIwODY5IEMzLDE1LjEwMTczOTQgMy44OTc2MTYwMiwxNiA1LjAwNDg4MTUsMTYgTDUuOTk1MTE4NSwxNiBDNy4xMDYxMDAyLDE2IDgsMTUuMTA1NTAzOCA4LDE0LjAwMjA4NjkgTDgsMTAuNDAwMjkwNCBaJyBpZD0nT3ZhbC0xNycgc2tldGNoOnR5cGU9J01TU2hhcGVHcm91cCc+PC9wYXRoPlxuXHRcdFx0XHRcdFx0XHQ8cmVjdCBpZD0nUmVjdGFuZ2xlLTUwJyBza2V0Y2g6dHlwZT0nTVNTaGFwZUdyb3VwJyB4PSczJyB5PScxMicgd2lkdGg9JzUnIGhlaWdodD0nMSc+PC9yZWN0PlxuXHRcdFx0XHRcdFx0XHQ8cmVjdCBpZD0nUmVjdGFuZ2xlLTUxJyBza2V0Y2g6dHlwZT0nTVNTaGFwZUdyb3VwJyB4PSc0JyB5PScxMy41JyB3aWR0aD0nMS41JyBoZWlnaHQ9JzEnPjwvcmVjdD5cblx0XHRcdFx0XHRcdFx0PHBhdGggZD0nTTUsOC41IEM1LDguNSAzLjQ5OTk5OTk5LDcuNTAwMDAwMDEgNCw3IEM0LjUwMDAwMDAxLDYuNDk5OTk5OTkgNSw3LjY2NjY2NjY3IDUuNSw4IEM1LjUsOCA2LjUsNi41MDAwMDAwMSA3LDcgQzcuNSw3LjQ5OTk5OTk5IDYsOC41IDYsOC41IEw2LDExIEw1LDExIEw1LDguNSBaJyBpZD0nUmVjdGFuZ2xlLTUyJyBza2V0Y2g6dHlwZT0nTVNTaGFwZUdyb3VwJz48L3BhdGg+XG5cdFx0XHRcdFx0XHQ8L2c+XG5cdFx0XHRcdFx0PC9nPlxuXHRcdFx0XHQ8L2c+XG5cdFx0XHQ8L3N2Zz5cIlxuXHRzaGlmdCA6IHtcblx0XHRvbiA6IFwiPD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0nVVRGLTgnIHN0YW5kYWxvbmU9J25vJz8+XG5cdFx0XHRcdDxzdmcgd2lkdGg9JzIwcHgnIGhlaWdodD0nMThweCcgdmlld0JveD0nMCAwIDIwIDE3JyB2ZXJzaW9uPScxLjEnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgeG1sbnM6eGxpbms9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnIHhtbG5zOnNrZXRjaD0naHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zJz5cblx0XHRcdFx0XHQ8IS0tIEdlbmVyYXRvcjogU2tldGNoIDMuNS4yICgyNTIzNSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+XG5cdFx0XHRcdFx0PHRpdGxlPlNoaWZ0PC90aXRsZT5cblx0XHRcdFx0XHQ8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz5cblx0XHRcdFx0XHQ8ZGVmcz48L2RlZnM+XG5cdFx0XHRcdFx0PGcgaWQ9J1BhZ2UtMScgc3Ryb2tlPSdub25lJyBzdHJva2Utd2lkdGg9JzEnIGZpbGw9J25vbmUnIGZpbGwtcnVsZT0nZXZlbm9kZCcgc2tldGNoOnR5cGU9J01TUGFnZSc+XG5cdFx0XHRcdFx0XHQ8ZyBpZD0nS2V5Ym9hcmQvTGlnaHQvVXBwZXInIHNrZXRjaDp0eXBlPSdNU0xheWVyR3JvdXAnIHRyYW5zZm9ybT0ndHJhbnNsYXRlKC0xNC4wMDAwMDAsIC0xMzAuMDAwMDAwKScgZmlsbD0nIzAzMDMwMyc+XG5cdFx0XHRcdFx0XHRcdDxnIGlkPSdUaGlyZC1Sb3cnIHRyYW5zZm9ybT0ndHJhbnNsYXRlKDMuMDAwMDAwLCAxMTguMDAwMDAwKScgc2tldGNoOnR5cGU9J01TU2hhcGVHcm91cCc+XG5cdFx0XHRcdFx0XHRcdFx0PHBhdGggZD0nTTIxLjcwNTIzODgsMTMuMjA1MjM4OCBDMjEuMzE1NzQ2MiwxMi44MTU3NDYyIDIwLjY4NTc1NTksMTIuODE0MjQ0MSAyMC4yOTQ3NjEyLDEzLjIwNTIzODggTDExLjkxNjA3NjcsMjEuNTgzOTIzMyBDMTEuMTMzOTk5MSwyMi4zNjYwMDA5IDExLjM5ODI2MDYsMjMgMTIuNDk3OTEzMSwyMyBMMTYuNSwyMyBMMTYuNSwyOC4wMDkyMjIgQzE2LjUsMjguNTU2NDEzNiAxNi45NDYzMTE0LDI5IDE3LjQ5NzU0NDYsMjkgTDI0LjUwMjQ1NTQsMjkgQzI1LjA1MzM4NCwyOSAyNS41LDI4LjU0OTAyNDggMjUuNSwyOC4wMDkyMjIgTDI1LjUsMjMgTDI5LjUwMjA4NjksMjMgQzMwLjYwNTUwMzgsMjMgMzAuODY2ODI0LDIyLjM2NjgyNCAzMC4wODM5MjMzLDIxLjU4MzkyMzMgTDIxLjcwNTIzODgsMTMuMjA1MjM4OCBaJyBpZD0nU2hpZnQnPjwvcGF0aD5cblx0XHRcdFx0XHRcdFx0PC9nPlxuXHRcdFx0XHRcdFx0PC9nPlxuXHRcdFx0XHRcdDwvZz5cblx0XHRcdFx0PC9zdmc+XCJcblx0XHRvZmYgOiBcIjw/eG1sIHZlcnNpb249JzEuMCcgZW5jb2Rpbmc9J1VURi04JyBzdGFuZGFsb25lPSdubyc/PlxuXHRcdDxzdmcgd2lkdGg9JzIwcHgnIGhlaWdodD0nMThweCcgdmlld0JveD0nMCAwIDIwIDE5JyB2ZXJzaW9uPScxLjEnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgeG1sbnM6eGxpbms9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnIHhtbG5zOnNrZXRjaD0naHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zJz5cblx0XHRcdDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggMy41LjIgKDI1MjM1KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT5cblx0XHRcdDx0aXRsZT5TaGlmdDwvdGl0bGU+XG5cdFx0XHQ8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz5cblx0XHRcdDxkZWZzPjwvZGVmcz5cblx0XHRcdDxnIGlkPSdQYWdlLTEnIHN0cm9rZT0nbm9uZScgc3Ryb2tlLXdpZHRoPScxJyBmaWxsPSdub25lJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnIHNrZXRjaDp0eXBlPSdNU1BhZ2UnPlxuXHRcdFx0XHQ8ZyBpZD0nS2V5Ym9hcmQvTGlnaHQvTG93ZXInIHNrZXRjaDp0eXBlPSdNU0xheWVyR3JvdXAnIHRyYW5zZm9ybT0ndHJhbnNsYXRlKC0xNC4wMDAwMDAsIC0xMjkuMDAwMDAwKScgZmlsbD0nIzAzMDMwMyc+XG5cdFx0XHRcdFx0PGcgaWQ9J1RoaXJkLVJvdycgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMy4wMDAwMDAsIDExOC4wMDAwMDApJyBza2V0Y2g6dHlwZT0nTVNTaGFwZUdyb3VwJz5cblx0XHRcdFx0XHRcdDxwYXRoIGQ9J00yMS42NzE5MDA4LDEyLjIzMjU4OTggQzIxLjMwMTAzMiwxMS44Mjc5OTE2IDIwLjY5NDY4OTIsMTEuODMzNDczMSAyMC4zMjg4MTk1LDEyLjIzMjU4OTggTDExLjY5NDcwMjMsMjEuNjUxMjk4MyBDMTAuNzU4NzQ0MSwyMi42NzIzMDggMTEuMTI4NTU0MSwyMy41IDEyLjUwOTc3NTEsMjMuNSBMMTUuOTk5OTk5OSwyMy41MDAwMDAyIEwxNS45OTk5OTk5LDI4LjAwMTQyNDEgQzE1Ljk5OTk5OTksMjguODI5MDY0OCAxNi42NzE2NTU5LDI5LjUwMDAwMDEgMTcuNDk3MTAxLDI5LjUwMDAwMDEgTDI0LjUwMjg5OTIsMjkuNTAwMDAwMSBDMjUuMzI5NzI1MywyOS41MDAwMDAxIDI2LjAwMDAwMDMsMjguODM0OTcwMyAyNi4wMDAwMDAzLDI4LjAwMTQyNDEgTDI2LjAwMDAwMDMsMjMuNTAwMDAwMSBMMjkuNDkwMjI1MSwyMy41MDAwMDAyIEMzMC44NzYzMzU3LDIzLjUwMDAwMDIgMzEuMjQzOTUyMSwyMi42NzUxOTE2IDMwLjMwNTQxNjEsMjEuNjUxMjk4NSBMMjEuNjcxOTAwOCwxMi4yMzI1ODk4IFogTTIxLjM0MTc0OCwxNC4zNjQ1MzE2IEMyMS4xNTMwMDU2LDE0LjE2MzIwNjQgMjAuODQzMzUxNSwxNC4xNjcwOTE0IDIwLjY1ODI1MTQsMTQuMzY0NTMxNiBMMTMuNSwyMS45OTk5OTk4IEwxNy41MDAwMDAxLDIxLjk5OTk5OTkgTDE3LjUwMDAwMDIsMjcuNTA4OTk1NiBDMTcuNTAwMDAwMiwyNy43ODAxNzAzIDE3LjczMjkwMjcsMjguMDAwMDAwOCAxOC4wMDM0MjI5LDI4LjAwMDAwMDggTDIzLjk5NjU3NywyOC4wMDAwMDA4IEMyNC4yNzQ2MDk3LDI4LjAwMDAwMDggMjQuNDk5OTk5NywyNy43NzIxMjAzIDI0LjQ5OTk5OTcsMjcuNTA4OTk1NiBMMjQuNDk5OTk5NywyMS45OTk5OTk5IEwyOC41LDIxLjk5OTk5OTkgTDIxLjM0MTc0OCwxNC4zNjQ1MzE2IFonIGlkPSdTaGlmdCc+PC9wYXRoPlxuXHRcdFx0XHRcdDwvZz5cblx0XHRcdFx0PC9nPlxuXHRcdFx0PC9nPlxuXHRcdDwvc3ZnPlwiXG5cdH1cblx0bWVzc2FnZXNfYXBwOlwiPD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0nVVRGLTgnIHN0YW5kYWxvbmU9J25vJz8+XG5cdDxzdmcgd2lkdGg9JzYwcHgnIGhlaWdodD0nNjBweCcgdmlld0JveD0nMCAwIDYwIDYwJyB2ZXJzaW9uPScxLjEnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgeG1sbnM6eGxpbms9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnPlxuXHQgICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCAzOS4xICgzMTcyMCkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+XG5cdCAgICA8dGl0bGU+TWVzc2FnZXMgQ29weTwvdGl0bGU+XG5cdCAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz5cblx0ICAgIDxkZWZzPlxuXHQgICAgICAgIDxsaW5lYXJHcmFkaWVudCB4MT0nNTAlJyB5MT0nMCUnIHgyPSc1MCUnIHkyPScxMDAlJyBpZD0nbGluZWFyR3JhZGllbnQtMSc+XG5cdCAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9JyM2NkZEN0YnIG9mZnNldD0nMCUnPjwvc3RvcD5cblx0ICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0nIzA5QjgyNicgb2Zmc2V0PScxMDAlJz48L3N0b3A+XG5cdCAgICAgICAgPC9saW5lYXJHcmFkaWVudD5cblx0ICAgIDwvZGVmcz5cblx0ICAgIDxnIGlkPSdpT1MtS2l0JyBzdHJva2U9J25vbmUnIHN0cm9rZS13aWR0aD0nMScgZmlsbD0nbm9uZScgZmlsbC1ydWxlPSdldmVub2RkJz5cblx0ICAgICAgICA8ZyBpZD0nSG9tZS1TY3JlZW4nIHRyYW5zZm9ybT0ndHJhbnNsYXRlKC0xNDUyLjAwMDAwMCwgLTg1My4wMDAwMDApJz5cblx0ICAgICAgICAgICAgPGcgaWQ9J0hvbWUtU2NyZWVuLeKAoi1pUGhvbmUtNnMtUGx1cycgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMTQxNy4wMDAwMDAsIDgxMi4wMDAwMDApJz5cblx0ICAgICAgICAgICAgICAgIDxnIGlkPSdNZXNzYWdlcy1Db3B5JyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSgzNS4wMDAwMDAsIDQxLjAwMDAwMCknPlxuXHQgICAgICAgICAgICAgICAgICAgIDxyZWN0IGlkPSdCRycgZmlsbD0ndXJsKCNsaW5lYXJHcmFkaWVudC0xKScgeD0nMCcgeT0nMCcgd2lkdGg9JzYwJyBoZWlnaHQ9JzYwJyByeD0nMTQnPjwvcmVjdD5cblx0ICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSdNMTkuNDIyMzk3Niw0NC4zMDg4MDA2IEMxMy4xNjY0MjI4LDQxLjEzNDg5NDkgOSwzNS40NjU1NDIxIDksMjkgQzksMTkuMDU4ODc0NSAxOC44NDk3MzU1LDExIDMxLDExIEM0My4xNTAyNjQ1LDExIDUzLDE5LjA1ODg3NDUgNTMsMjkgQzUzLDM4Ljk0MTEyNTUgNDMuMTUwMjY0NSw0NyAzMSw0NyBDMjguNjk5NDU4OCw0NyAyNi40ODEzOTE0LDQ2LjcxMTA4OTcgMjQuMzk3MDQwOSw0Ni4xNzUxOTUzIEMyMy45NDQyNjUzLDQ2Ljg4MzgxNDMgMjEuOTA2NTM3Nyw0OS41IDE2LjUsNDkuNSBDMTUuNjE1MDE4Nyw0OS41IDE3LjE4MzQ3NDksNDguNTkxNTkyMSAxOCw0Ny41IEMxOC43ODk0Mjg2LDQ2LjQ0NDYzMjYgMTkuMjUwNTYyNSw0NC45NDgwMzYyIDE5LjQyMjM5NzYsNDQuMzA4ODAwNiBaJyBpZD0nQnViYmxlJyBmaWxsPScjRkZGRkZGJz48L3BhdGg+XG5cdCAgICAgICAgICAgICAgICA8L2c+XG5cdCAgICAgICAgICAgIDwvZz5cblx0ICAgICAgICA8L2c+XG5cdCAgICA8L2c+XG5cdDwvc3ZnPlwiXG5cdGNhbGVuZGFyX2FwcDpcIjw/eG1sIHZlcnNpb249JzEuMCcgZW5jb2Rpbmc9J1VURi04JyBzdGFuZGFsb25lPSdubyc/PlxuXHQ8c3ZnIHdpZHRoPSc2MHB4JyBoZWlnaHQ9JzYwcHgnIHZpZXdCb3g9JzAgMCA2MCA2MCcgdmVyc2lvbj0nMS4xJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHhtbG5zOnhsaW5rPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJz5cblx0ICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggMzkuMSAoMzE3MjApIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPlxuXHQgICAgPHRpdGxlPkNhbGVuZGFyPC90aXRsZT5cblx0ICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPlxuXHQgICAgPGRlZnM+PC9kZWZzPlxuXHQgICAgPGcgaWQ9J1BhZ2UtMScgc3Ryb2tlPSdub25lJyBzdHJva2Utd2lkdGg9JzEnIGZpbGw9J25vbmUnIGZpbGwtcnVsZT0nZXZlbm9kZCc+XG5cdCAgICAgICAgPGcgaWQ9J0hvbWUtU2NyZWVuLeKAoi1pUGhvbmUtU0UnIHRyYW5zZm9ybT0ndHJhbnNsYXRlKC05Mi4wMDAwMDAsIC0yNy4wMDAwMDApJz5cblx0ICAgICAgICAgICAgPGcgaWQ9J0hvbWUtU2NyZWVuLeKAoi1pUGhvbmUtNnMtQ29weScgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMC4wMDAwMDAsIDI3LjAwMDAwMCknPlxuXHQgICAgICAgICAgICAgICAgPGcgaWQ9J0NhbGVuZGFyJyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSg5Mi4wMDAwMDAsIDAuMDAwMDAwKSc+XG5cdCAgICAgICAgICAgICAgICAgICAgPHJlY3QgaWQ9J0JHJyBmaWxsPScjRkZGRkZGJyB4PScwJyB5PScwJyB3aWR0aD0nNjAnIGhlaWdodD0nNjAnIHJ4PScxNCc+PC9yZWN0PlxuXHQgICAgICAgICAgICAgICAgICAgIDx0ZXh0IGlkPScyNScgZm9udC1mYW1pbHk9J1NGVUlEaXNwbGF5LVVsdHJhbGlnaHQsIFNGIFVJIERpc3BsYXknIGZvbnQtc2l6ZT0nNDAnIGZvbnQtd2VpZ2h0PScyMDAnIGxldHRlci1zcGFjaW5nPScwLjM3OTk5OTk5NScgZmlsbD0nIzAwMDAwMCc+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIDx0c3BhbiB4PSc3LjEwODI4MTI1JyB5PSc0OSc+MjU8L3RzcGFuPlxuXHQgICAgICAgICAgICAgICAgICAgIDwvdGV4dD5cblx0ICAgICAgICAgICAgICAgICAgICA8dGV4dCBpZD0nTW9uZGF5JyBmb250LWZhbWlseT0nU0ZVSURpc3BsYXktTWVkaXVtLCBTRiBVSSBEaXNwbGF5JyBmb250LXNpemU9JzExJyBmb250LXdlaWdodD0nNDAwJyBsZXR0ZXItc3BhY2luZz0nMC4zNzk5OTk5OTUnIGZpbGw9JyNGRjNCMzAnPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICA8dHNwYW4geD0nOS4wMjk5MjE4OScgeT0nMTUnPk1vbmRheTwvdHNwYW4+XG5cdCAgICAgICAgICAgICAgICAgICAgPC90ZXh0PlxuXHQgICAgICAgICAgICAgICAgPC9nPlxuXHQgICAgICAgICAgICA8L2c+XG5cdCAgICAgICAgPC9nPlxuXHQgICAgPC9nPlxuXHQ8L3N2Zz5cIlxuXHRwaG90b3NfYXBwOlwiPD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0nVVRGLTgnIHN0YW5kYWxvbmU9J25vJz8+XG5cdDxzdmcgd2lkdGg9JzYwcHgnIGhlaWdodD0nNjBweCcgdmlld0JveD0nMCAwIDYwIDYwJyB2ZXJzaW9uPScxLjEnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgeG1sbnM6eGxpbms9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnPlxuXHQgICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCAzOS4xICgzMTcyMCkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+XG5cdCAgICA8dGl0bGU+UGhvdG9zPC90aXRsZT5cblx0ICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPlxuXHQgICAgPGRlZnM+PC9kZWZzPlxuXHQgICAgPGcgaWQ9J1BhZ2UtMScgc3Ryb2tlPSdub25lJyBzdHJva2Utd2lkdGg9JzEnIGZpbGw9J25vbmUnIGZpbGwtcnVsZT0nZXZlbm9kZCc+XG5cdCAgICAgICAgPGcgaWQ9J0hvbWUtU2NyZWVuLeKAoi1pUGhvbmUtU0UnIHRyYW5zZm9ybT0ndHJhbnNsYXRlKC0xNjguMDAwMDAwLCAtMjcuMDAwMDAwKSc+XG5cdCAgICAgICAgICAgIDxnIGlkPSdIb21lLVNjcmVlbi3igKItaVBob25lLTZzLUNvcHknIHRyYW5zZm9ybT0ndHJhbnNsYXRlKDAuMDAwMDAwLCAyNy4wMDAwMDApJz5cblx0ICAgICAgICAgICAgICAgIDxnIGlkPSdQaG90b3MnIHRyYW5zZm9ybT0ndHJhbnNsYXRlKDE2OC4wMDAwMDAsIDAuMDAwMDAwKSc+XG5cdCAgICAgICAgICAgICAgICAgICAgPHJlY3QgaWQ9J0JHJyBmaWxsPScjRkZGRkZGJyB4PScwJyB5PScwJyB3aWR0aD0nNjAnIGhlaWdodD0nNjAnIHJ4PScxNCc+PC9yZWN0PlxuXHQgICAgICAgICAgICAgICAgICAgIDxyZWN0IGlkPSdQZWRhbCcgZmlsbD0nI0YyNkU2NCcgc3R5bGU9J21peC1ibGVuZC1tb2RlOiBtdWx0aXBseTsnIHRyYW5zZm9ybT0ndHJhbnNsYXRlKDIwLjE0MjEzNiwgMjAuMTQyMTM2KSByb3RhdGUoNDUuMDAwMDAwKSB0cmFuc2xhdGUoLTIwLjE0MjEzNiwgLTIwLjE0MjEzNikgJyB4PSc4LjE0MjEzNTYyJyB5PScxMi4xNDIxMzU2JyB3aWR0aD0nMjQnIGhlaWdodD0nMTYnIHJ4PSc4Jz48L3JlY3Q+XG5cdCAgICAgICAgICAgICAgICAgICAgPHJlY3QgaWQ9J1BlZGFsJyBmaWxsPScjRjBFMjJBJyBzdHlsZT0nbWl4LWJsZW5kLW1vZGU6IG11bHRpcGx5OycgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMzkuMTQyMTM2LCAxOS4xNDIxMzYpIHJvdGF0ZSgxMzUuMDAwMDAwKSB0cmFuc2xhdGUoLTM5LjE0MjEzNiwgLTE5LjE0MjEzNikgJyB4PScyNy4xNDIxMzU2JyB5PScxMS4xNDIxMzU2JyB3aWR0aD0nMjQnIGhlaWdodD0nMTYnIHJ4PSc4Jz48L3JlY3Q+XG5cdCAgICAgICAgICAgICAgICAgICAgPHJlY3QgaWQ9J1BlZGFsJyBmaWxsPScjRDI4OEIxJyBzdHlsZT0nbWl4LWJsZW5kLW1vZGU6IG11bHRpcGx5OycgeD0nNCcgeT0nMjInIHdpZHRoPScyNCcgaGVpZ2h0PScxNicgcng9JzgnPjwvcmVjdD5cblx0ICAgICAgICAgICAgICAgICAgICA8cmVjdCBpZD0nUGVkYWwnIGZpbGw9JyNGQkFEMzEnIHN0eWxlPSdtaXgtYmxlbmQtbW9kZTogbXVsdGlwbHk7JyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSgzMC4wMDAwMDAsIDE2LjAwMDAwMCkgcm90YXRlKDkwLjAwMDAwMCkgdHJhbnNsYXRlKC0zMC4wMDAwMDAsIC0xNi4wMDAwMDApICcgeD0nMTgnIHk9JzgnIHdpZHRoPScyNCcgaGVpZ2h0PScxNicgcng9JzgnPjwvcmVjdD5cblx0ICAgICAgICAgICAgICAgICAgICA8cmVjdCBpZD0nUGVkYWwnIGZpbGw9JyNBNThFQzInIHN0eWxlPSdtaXgtYmxlbmQtbW9kZTogbXVsdGlwbHk7JyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSgyMC4xNDIxMzYsIDQwLjE0MjEzNikgc2NhbGUoMSwgLTEpIHJvdGF0ZSg0NS4wMDAwMDApIHRyYW5zbGF0ZSgtMjAuMTQyMTM2LCAtNDAuMTQyMTM2KSAnIHg9JzguMTQyMTM1NjInIHk9JzMyLjE0MjEzNTYnIHdpZHRoPScyNCcgaGVpZ2h0PScxNicgcng9JzgnPjwvcmVjdD5cblx0ICAgICAgICAgICAgICAgICAgICA8cmVjdCBpZD0nUGVkYWwnIGZpbGw9JyM2Q0MxOTknIHN0eWxlPSdtaXgtYmxlbmQtbW9kZTogbXVsdGlwbHk7JyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSg0MC4xNDIxMzYsIDQwLjE0MjEzNikgc2NhbGUoMSwgLTEpIHJvdGF0ZSgxMzUuMDAwMDAwKSB0cmFuc2xhdGUoLTQwLjE0MjEzNiwgLTQwLjE0MjEzNikgJyB4PScyOC4xNDIxMzU2JyB5PSczMi4xNDIxMzU2JyB3aWR0aD0nMjQnIGhlaWdodD0nMTYnIHJ4PSc4Jz48L3JlY3Q+XG5cdCAgICAgICAgICAgICAgICAgICAgPHJlY3QgaWQ9J1BlZGFsJyBmaWxsPScjNzdBRUREJyBzdHlsZT0nbWl4LWJsZW5kLW1vZGU6IG11bHRpcGx5OycgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMzAuMDAwMDAwLCA0NC4wMDAwMDApIHNjYWxlKDEsIC0xKSByb3RhdGUoOTAuMDAwMDAwKSB0cmFuc2xhdGUoLTMwLjAwMDAwMCwgLTQ0LjAwMDAwMCkgJyB4PScxOCcgeT0nMzYnIHdpZHRoPScyNCcgaGVpZ2h0PScxNicgcng9JzgnPjwvcmVjdD5cblx0ICAgICAgICAgICAgICAgICAgICA8cmVjdCBpZD0nUGVkYWwnIGZpbGw9JyNCNUQ2NTUnIHN0eWxlPSdtaXgtYmxlbmQtbW9kZTogbXVsdGlwbHk7JyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSg0NC4wMDAwMDAsIDMwLjAwMDAwMCkgcm90YXRlKDE4MC4wMDAwMDApIHRyYW5zbGF0ZSgtNDQuMDAwMDAwLCAtMzAuMDAwMDAwKSAnIHg9JzMyJyB5PScyMicgd2lkdGg9JzI0JyBoZWlnaHQ9JzE2JyByeD0nOCc+PC9yZWN0PlxuXHQgICAgICAgICAgICAgICAgPC9nPlxuXHQgICAgICAgICAgICA8L2c+XG5cdCAgICAgICAgPC9nPlxuXHQgICAgPC9nPlxuXHQ8L3N2Zz5cIlxuXHRjYW1lcmFfYXBwOlwiPD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0nVVRGLTgnIHN0YW5kYWxvbmU9J25vJz8+XG5cdDxzdmcgd2lkdGg9JzYwcHgnIGhlaWdodD0nNjBweCcgdmlld0JveD0nMCAwIDYwIDYwJyB2ZXJzaW9uPScxLjEnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgeG1sbnM6eGxpbms9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnPlxuXHQgICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCAzOS4xICgzMTcyMCkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+XG5cdCAgICA8dGl0bGU+Q2FtZXJhPC90aXRsZT5cblx0ICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPlxuXHQgICAgPGRlZnM+XG5cdCAgICAgICAgPGxpbmVhckdyYWRpZW50IHgxPSc1MCUnIHkxPScwJScgeDI9JzUwJScgeTI9JzEwMCUnIGlkPSdsaW5lYXJHcmFkaWVudC0xJz5cblx0ICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0nI0RCRERERScgb2Zmc2V0PScwJSc+PC9zdG9wPlxuXHQgICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPScjODk4QjkxJyBvZmZzZXQ9JzEwMCUnPjwvc3RvcD5cblx0ICAgICAgICA8L2xpbmVhckdyYWRpZW50PlxuXHQgICAgICAgIDxsaW5lYXJHcmFkaWVudCB4MT0nNTAlJyB5MT0nMCUnIHgyPSc1MCUnIHkyPScxMDAlJyBpZD0nbGluZWFyR3JhZGllbnQtMic+XG5cdCAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9JyM0NzQ3NDcnIG9mZnNldD0nMCUnPjwvc3RvcD5cblx0ICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0nIzJCMkIyQicgb2Zmc2V0PScxMDAlJz48L3N0b3A+XG5cdCAgICAgICAgPC9saW5lYXJHcmFkaWVudD5cblx0ICAgICAgICA8cGF0aCBkPSdNOSwyMCBMNTEsMjAgTDUxLDQyIEw5LDQyIEw5LDIwIFogTTksNDIuOTk3NTcyMiBDOSw0NC4zNzk1ODc3IDEwLjExOTk2NTMsNDUuNSAxMS41MDE1MTI1LDQ1LjUgTDQ4LjQ5ODQ4NzUsNDUuNSBDNDkuODc2NjAxNSw0NS41IDUxLDQ0LjM3OTYyNDkgNTEsNDIuOTk3NTcyMiBMNTEsNDIuNSBMOSw0Mi41IEw5LDQyLjk5NzU3MjIgWiBNOSwxOS41IEw5LDE5LjAwMjQyNzggQzksMTcuNjIwMzc1MSAxMC4xMjMzOTg1LDE2LjUgMTEuNTAxNTEyNSwxNi41IEwxNy41MzA0NDk2LDE2LjUgQzE4LjQ1NzIwMTEsMTYuNDE4MDE4NiAxOS4zMjE4MjA4LDE2LjI0MTYzMTMgMTkuOTIwNTMyMiwxNS44OTAyNTg4IEMyMS44MzI2NDI1LDE0Ljc2ODA3NzIgMjEuOTY0MTExMywxMS41IDI0Ljk5NjIwNSwxMS41IEwzMC4wMjYwODMsMTEuNSBMMzUuMDU1OTYxMSwxMS41IEMzOC4wODgwNTQ4LDExLjUgMzguMjE5NTIzNiwxNC43NjgwNzcyIDQwLjEzMTYzMzksMTUuODkwMjU4OCBDNDAuNzMwMzQ1MywxNi4yNDE2MzEzIDQxLjU5NDk2NSwxNi40MTgwMTg2IDQyLjUyMTcxNjUsMTYuNSBMNDguNDk4NDg3NSwxNi41IEM0OS44ODAwMzQ3LDE2LjUgNTEsMTcuNjIwNDEyMyA1MSwxOS4wMDI0Mjc4IEw1MSwxOS41IEw5LDE5LjUgTDksMTkuNSBaIE0zOS4yNSwzMSBDMzkuMjUsMjUuODkxMzY2MSAzNS4xMDg2MzM5LDIxLjc1IDMwLDIxLjc1IEMyNC44OTEzNjYxLDIxLjc1IDIwLjc1LDI1Ljg5MTM2NjEgMjAuNzUsMzEgQzIwLjc1LDM2LjEwODYzMzkgMjQuODkxMzY2MSw0MC4yNSAzMCw0MC4yNSBDMzUuMTA4NjMzOSw0MC4yNSAzOS4yNSwzNi4xMDg2MzM5IDM5LjI1LDMxIEwzOS4yNSwzMSBaIE0yMi4yNSwzMSBDMjIuMjUsMjYuNzE5NzkzMiAyNS43MTk3OTMyLDIzLjI1IDMwLDIzLjI1IEMzNC4yODAyMDY4LDIzLjI1IDM3Ljc1LDI2LjcxOTc5MzIgMzcuNzUsMzEgQzM3Ljc1LDM1LjI4MDIwNjggMzQuMjgwMjA2OCwzOC43NSAzMCwzOC43NSBDMjUuNzE5NzkzMiwzOC43NSAyMi4yNSwzNS4yODAyMDY4IDIyLjI1LDMxIEwyMi4yNSwzMSBaJyBpZD0ncGF0aC0zJz48L3BhdGg+XG5cdCAgICAgICAgPGZpbHRlciB4PSctNTAlJyB5PSctNTAlJyB3aWR0aD0nMjAwJScgaGVpZ2h0PScyMDAlJyBmaWx0ZXJVbml0cz0nb2JqZWN0Qm91bmRpbmdCb3gnIGlkPSdmaWx0ZXItNCc+XG5cdCAgICAgICAgICAgIDxmZU9mZnNldCBkeD0nMCcgZHk9JzEnIGluPSdTb3VyY2VBbHBoYScgcmVzdWx0PSdzaGFkb3dPZmZzZXRPdXRlcjEnPjwvZmVPZmZzZXQ+XG5cdCAgICAgICAgICAgIDxmZUNvbG9yTWF0cml4IHZhbHVlcz0nMCAwIDAgMCAxICAgMCAwIDAgMCAxICAgMCAwIDAgMCAxICAwIDAgMCAwLjUgMCcgdHlwZT0nbWF0cml4JyBpbj0nc2hhZG93T2Zmc2V0T3V0ZXIxJz48L2ZlQ29sb3JNYXRyaXg+XG5cdCAgICAgICAgPC9maWx0ZXI+XG5cdCAgICAgICAgPGZpbHRlciB4PSctNTAlJyB5PSctNTAlJyB3aWR0aD0nMjAwJScgaGVpZ2h0PScyMDAlJyBmaWx0ZXJVbml0cz0nb2JqZWN0Qm91bmRpbmdCb3gnIGlkPSdmaWx0ZXItNSc+XG5cdCAgICAgICAgICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249JzEnIGluPSdTb3VyY2VBbHBoYScgcmVzdWx0PSdzaGFkb3dCbHVySW5uZXIxJz48L2ZlR2F1c3NpYW5CbHVyPlxuXHQgICAgICAgICAgICA8ZmVPZmZzZXQgZHg9JzAnIGR5PScxJyBpbj0nc2hhZG93Qmx1cklubmVyMScgcmVzdWx0PSdzaGFkb3dPZmZzZXRJbm5lcjEnPjwvZmVPZmZzZXQ+XG5cdCAgICAgICAgICAgIDxmZUNvbXBvc2l0ZSBpbj0nc2hhZG93T2Zmc2V0SW5uZXIxJyBpbjI9J1NvdXJjZUFscGhhJyBvcGVyYXRvcj0nYXJpdGhtZXRpYycgazI9Jy0xJyBrMz0nMScgcmVzdWx0PSdzaGFkb3dJbm5lcklubmVyMSc+PC9mZUNvbXBvc2l0ZT5cblx0ICAgICAgICAgICAgPGZlQ29sb3JNYXRyaXggdmFsdWVzPScwIDAgMCAwIDAgICAwIDAgMCAwIDAgICAwIDAgMCAwIDAgIDAgMCAwIDAuMyAwJyB0eXBlPSdtYXRyaXgnIGluPSdzaGFkb3dJbm5lcklubmVyMScgcmVzdWx0PSdzaGFkb3dNYXRyaXhJbm5lcjEnPjwvZmVDb2xvck1hdHJpeD5cblx0ICAgICAgICAgICAgPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0nMC41JyBpbj0nU291cmNlQWxwaGEnIHJlc3VsdD0nc2hhZG93Qmx1cklubmVyMic+PC9mZUdhdXNzaWFuQmx1cj5cblx0ICAgICAgICAgICAgPGZlT2Zmc2V0IGR4PScwJyBkeT0nMScgaW49J3NoYWRvd0JsdXJJbm5lcjInIHJlc3VsdD0nc2hhZG93T2Zmc2V0SW5uZXIyJz48L2ZlT2Zmc2V0PlxuXHQgICAgICAgICAgICA8ZmVDb21wb3NpdGUgaW49J3NoYWRvd09mZnNldElubmVyMicgaW4yPSdTb3VyY2VBbHBoYScgb3BlcmF0b3I9J2FyaXRobWV0aWMnIGsyPSctMScgazM9JzEnIHJlc3VsdD0nc2hhZG93SW5uZXJJbm5lcjInPjwvZmVDb21wb3NpdGU+XG5cdCAgICAgICAgICAgIDxmZUNvbG9yTWF0cml4IHZhbHVlcz0nMCAwIDAgMCAwICAgMCAwIDAgMCAwICAgMCAwIDAgMCAwICAwIDAgMCAwLjMgMCcgdHlwZT0nbWF0cml4JyBpbj0nc2hhZG93SW5uZXJJbm5lcjInIHJlc3VsdD0nc2hhZG93TWF0cml4SW5uZXIyJz48L2ZlQ29sb3JNYXRyaXg+XG5cdCAgICAgICAgICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249JzAuNScgaW49J1NvdXJjZUFscGhhJyByZXN1bHQ9J3NoYWRvd0JsdXJJbm5lcjMnPjwvZmVHYXVzc2lhbkJsdXI+XG5cdCAgICAgICAgICAgIDxmZU9mZnNldCBkeD0nMCcgZHk9JzAnIGluPSdzaGFkb3dCbHVySW5uZXIzJyByZXN1bHQ9J3NoYWRvd09mZnNldElubmVyMyc+PC9mZU9mZnNldD5cblx0ICAgICAgICAgICAgPGZlQ29tcG9zaXRlIGluPSdzaGFkb3dPZmZzZXRJbm5lcjMnIGluMj0nU291cmNlQWxwaGEnIG9wZXJhdG9yPSdhcml0aG1ldGljJyBrMj0nLTEnIGszPScxJyByZXN1bHQ9J3NoYWRvd0lubmVySW5uZXIzJz48L2ZlQ29tcG9zaXRlPlxuXHQgICAgICAgICAgICA8ZmVDb2xvck1hdHJpeCB2YWx1ZXM9JzAgMCAwIDAgMCAgIDAgMCAwIDAgMCAgIDAgMCAwIDAgMCAgMCAwIDAgMC4zIDAnIHR5cGU9J21hdHJpeCcgaW49J3NoYWRvd0lubmVySW5uZXIzJyByZXN1bHQ9J3NoYWRvd01hdHJpeElubmVyMyc+PC9mZUNvbG9yTWF0cml4PlxuXHQgICAgICAgICAgICA8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPScwLjUnIGluPSdTb3VyY2VBbHBoYScgcmVzdWx0PSdzaGFkb3dCbHVySW5uZXI0Jz48L2ZlR2F1c3NpYW5CbHVyPlxuXHQgICAgICAgICAgICA8ZmVPZmZzZXQgZHg9Jy0wJyBkeT0nMCcgaW49J3NoYWRvd0JsdXJJbm5lcjQnIHJlc3VsdD0nc2hhZG93T2Zmc2V0SW5uZXI0Jz48L2ZlT2Zmc2V0PlxuXHQgICAgICAgICAgICA8ZmVDb21wb3NpdGUgaW49J3NoYWRvd09mZnNldElubmVyNCcgaW4yPSdTb3VyY2VBbHBoYScgb3BlcmF0b3I9J2FyaXRobWV0aWMnIGsyPSctMScgazM9JzEnIHJlc3VsdD0nc2hhZG93SW5uZXJJbm5lcjQnPjwvZmVDb21wb3NpdGU+XG5cdCAgICAgICAgICAgIDxmZUNvbG9yTWF0cml4IHZhbHVlcz0nMCAwIDAgMCAwICAgMCAwIDAgMCAwICAgMCAwIDAgMCAwICAwIDAgMCAwLjMgMCcgdHlwZT0nbWF0cml4JyBpbj0nc2hhZG93SW5uZXJJbm5lcjQnIHJlc3VsdD0nc2hhZG93TWF0cml4SW5uZXI0Jz48L2ZlQ29sb3JNYXRyaXg+XG5cdCAgICAgICAgICAgIDxmZU1lcmdlPlxuXHQgICAgICAgICAgICAgICAgPGZlTWVyZ2VOb2RlIGluPSdzaGFkb3dNYXRyaXhJbm5lcjEnPjwvZmVNZXJnZU5vZGU+XG5cdCAgICAgICAgICAgICAgICA8ZmVNZXJnZU5vZGUgaW49J3NoYWRvd01hdHJpeElubmVyMic+PC9mZU1lcmdlTm9kZT5cblx0ICAgICAgICAgICAgICAgIDxmZU1lcmdlTm9kZSBpbj0nc2hhZG93TWF0cml4SW5uZXIzJz48L2ZlTWVyZ2VOb2RlPlxuXHQgICAgICAgICAgICAgICAgPGZlTWVyZ2VOb2RlIGluPSdzaGFkb3dNYXRyaXhJbm5lcjQnPjwvZmVNZXJnZU5vZGU+XG5cdCAgICAgICAgICAgIDwvZmVNZXJnZT5cblx0ICAgICAgICA8L2ZpbHRlcj5cblx0ICAgICAgICA8cGF0aCBkPSdNMTMsMTUuMjUgQzEzLDE0LjgzNTc4NjQgMTMuMzM1NTk0NywxNC41IDEzLjc1MDgzNzgsMTQuNSBMMTUuNzQ5MTYyMiwxNC41IEMxNi4xNjM4Mzg1LDE0LjUgMTYuNSwxNC44MzI4OTg2IDE2LjUsMTUuMjUgTDE2LjUsMTYgTDEzLDE2IEwxMywxNS4yNSBMMTMsMTUuMjUgWicgaWQ9J3BhdGgtNic+PC9wYXRoPlxuXHQgICAgICAgIDxmaWx0ZXIgeD0nLTUwJScgeT0nLTUwJScgd2lkdGg9JzIwMCUnIGhlaWdodD0nMjAwJScgZmlsdGVyVW5pdHM9J29iamVjdEJvdW5kaW5nQm94JyBpZD0nZmlsdGVyLTcnPlxuXHQgICAgICAgICAgICA8ZmVPZmZzZXQgZHg9JzAnIGR5PScwJyBpbj0nU291cmNlQWxwaGEnIHJlc3VsdD0nc2hhZG93T2Zmc2V0T3V0ZXIxJz48L2ZlT2Zmc2V0PlxuXHQgICAgICAgICAgICA8ZmVDb2xvck1hdHJpeCB2YWx1ZXM9JzAgMCAwIDAgMSAgIDAgMCAwIDAgMSAgIDAgMCAwIDAgMSAgMCAwIDAgMC41IDAnIHR5cGU9J21hdHJpeCcgaW49J3NoYWRvd09mZnNldE91dGVyMSc+PC9mZUNvbG9yTWF0cml4PlxuXHQgICAgICAgIDwvZmlsdGVyPlxuXHQgICAgICAgIDxmaWx0ZXIgeD0nLTUwJScgeT0nLTUwJScgd2lkdGg9JzIwMCUnIGhlaWdodD0nMjAwJScgZmlsdGVyVW5pdHM9J29iamVjdEJvdW5kaW5nQm94JyBpZD0nZmlsdGVyLTgnPlxuXHQgICAgICAgICAgICA8ZmVPZmZzZXQgZHg9JzAnIGR5PScxJyBpbj0nU291cmNlQWxwaGEnIHJlc3VsdD0nc2hhZG93T2Zmc2V0SW5uZXIxJz48L2ZlT2Zmc2V0PlxuXHQgICAgICAgICAgICA8ZmVDb21wb3NpdGUgaW49J3NoYWRvd09mZnNldElubmVyMScgaW4yPSdTb3VyY2VBbHBoYScgb3BlcmF0b3I9J2FyaXRobWV0aWMnIGsyPSctMScgazM9JzEnIHJlc3VsdD0nc2hhZG93SW5uZXJJbm5lcjEnPjwvZmVDb21wb3NpdGU+XG5cdCAgICAgICAgICAgIDxmZUNvbG9yTWF0cml4IHZhbHVlcz0nMCAwIDAgMCAwICAgMCAwIDAgMCAwICAgMCAwIDAgMCAwICAwIDAgMCAwLjUgMCcgdHlwZT0nbWF0cml4JyBpbj0nc2hhZG93SW5uZXJJbm5lcjEnPjwvZmVDb2xvck1hdHJpeD5cblx0ICAgICAgICA8L2ZpbHRlcj5cblx0ICAgICAgICA8Y2lyY2xlIGlkPSdwYXRoLTknIGN4PSczOS41JyBjeT0nMjMnIHI9JzEnPjwvY2lyY2xlPlxuXHQgICAgICAgIDxmaWx0ZXIgeD0nLTUwJScgeT0nLTUwJScgd2lkdGg9JzIwMCUnIGhlaWdodD0nMjAwJScgZmlsdGVyVW5pdHM9J29iamVjdEJvdW5kaW5nQm94JyBpZD0nZmlsdGVyLTEwJz5cblx0ICAgICAgICAgICAgPGZlT2Zmc2V0IGR4PScwJyBkeT0nMCcgaW49J1NvdXJjZUFscGhhJyByZXN1bHQ9J3NoYWRvd09mZnNldE91dGVyMSc+PC9mZU9mZnNldD5cblx0ICAgICAgICAgICAgPGZlQ29sb3JNYXRyaXggdmFsdWVzPScwIDAgMCAwIDAgICAwIDAgMCAwIDAgICAwIDAgMCAwIDAgIDAgMCAwIDAuNSAwJyB0eXBlPSdtYXRyaXgnIGluPSdzaGFkb3dPZmZzZXRPdXRlcjEnPjwvZmVDb2xvck1hdHJpeD5cblx0ICAgICAgICA8L2ZpbHRlcj5cblx0ICAgICAgICA8ZmlsdGVyIHg9Jy01MCUnIHk9Jy01MCUnIHdpZHRoPScyMDAlJyBoZWlnaHQ9JzIwMCUnIGZpbHRlclVuaXRzPSdvYmplY3RCb3VuZGluZ0JveCcgaWQ9J2ZpbHRlci0xMSc+XG5cdCAgICAgICAgICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249JzAuNScgaW49J1NvdXJjZUFscGhhJyByZXN1bHQ9J3NoYWRvd0JsdXJJbm5lcjEnPjwvZmVHYXVzc2lhbkJsdXI+XG5cdCAgICAgICAgICAgIDxmZU9mZnNldCBkeD0nMCcgZHk9JzAnIGluPSdzaGFkb3dCbHVySW5uZXIxJyByZXN1bHQ9J3NoYWRvd09mZnNldElubmVyMSc+PC9mZU9mZnNldD5cblx0ICAgICAgICAgICAgPGZlQ29tcG9zaXRlIGluPSdzaGFkb3dPZmZzZXRJbm5lcjEnIGluMj0nU291cmNlQWxwaGEnIG9wZXJhdG9yPSdhcml0aG1ldGljJyBrMj0nLTEnIGszPScxJyByZXN1bHQ9J3NoYWRvd0lubmVySW5uZXIxJz48L2ZlQ29tcG9zaXRlPlxuXHQgICAgICAgICAgICA8ZmVDb2xvck1hdHJpeCB2YWx1ZXM9JzAgMCAwIDAgMCAgIDAgMCAwIDAgMCAgIDAgMCAwIDAgMCAgMCAwIDAgMC4zIDAnIHR5cGU9J21hdHJpeCcgaW49J3NoYWRvd0lubmVySW5uZXIxJz48L2ZlQ29sb3JNYXRyaXg+XG5cdCAgICAgICAgPC9maWx0ZXI+XG5cdCAgICA8L2RlZnM+XG5cdCAgICA8ZyBpZD0nUGFnZS0xJyBzdHJva2U9J25vbmUnIHN0cm9rZS13aWR0aD0nMScgZmlsbD0nbm9uZScgZmlsbC1ydWxlPSdldmVub2RkJz5cblx0ICAgICAgICA8ZyBpZD0nSG9tZS1TY3JlZW4t4oCiLWlQaG9uZS1TRScgdHJhbnNmb3JtPSd0cmFuc2xhdGUoLTI0NC4wMDAwMDAsIC0yNy4wMDAwMDApJz5cblx0ICAgICAgICAgICAgPGcgaWQ9J0hvbWUtU2NyZWVuLeKAoi1pUGhvbmUtNnMtQ29weScgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMC4wMDAwMDAsIDI3LjAwMDAwMCknPlxuXHQgICAgICAgICAgICAgICAgPGcgaWQ9J0NhbWVyYScgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMjQ0LjAwMDAwMCwgMC4wMDAwMDApJz5cblx0ICAgICAgICAgICAgICAgICAgICA8ZyBpZD0naWNvbic+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9J00zOS4wODE1LDAgQzQ1LjEwNSwwIDQ4LjExNiwwIDUxLjM1ODUsMS4wMjUgQzU0Ljg5ODUsMi4zMTM1IDU3LjY4NjUsNS4xMDE1IDU4Ljk3NSw4LjY0MTUgQzYwLDExLjg4MzUgNjAsMTQuODk1NSA2MCwyMC45MTg1IEw2MCwzOS4wODE1IEM2MCw0NS4xMDUgNjAsNDguMTE2IDU4Ljk3NSw1MS4zNTg1IEM1Ny42ODY1LDU0Ljg5ODUgNTQuODk4NSw1Ny42ODY1IDUxLjM1ODUsNTguOTc0NSBDNDguMTE2LDYwIDQ1LjEwNSw2MCAzOS4wODE1LDYwIEwyMC45MTg1LDYwIEMxNC44OTUsNjAgMTEuODgzNSw2MCA4LjY0MTUsNTguOTc0NSBDNS4xMDE1LDU3LjY4NjUgMi4zMTM1LDU0Ljg5ODUgMS4wMjUsNTEuMzU4NSBDMCw0OC4xMTYgMCw0NS4xMDUgMCwzOS4wODE1IEwwLDIwLjkxODUgQzAsMTQuODk1NSAwLDExLjg4MzUgMS4wMjUsOC42NDE1IEMyLjMxMzUsNS4xMDE1IDUuMTAxNSwyLjMxMzUgOC42NDE1LDEuMDI1IEMxMS44ODM1LDAgMTQuODk1LDAgMjAuOTE4NSwwIEwzOS4wODE1LDAgWicgaWQ9J0ljb24nIGZpbGw9J3VybCgjbGluZWFyR3JhZGllbnQtMSknPjwvcGF0aD5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgPGcgaWQ9J0NhbWVyYSc+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dXNlIGZpbGw9J2JsYWNrJyBmaWxsLW9wYWNpdHk9JzEnIGZpbHRlcj0ndXJsKCNmaWx0ZXItNCknIHhsaW5rOmhyZWY9JyNwYXRoLTMnPjwvdXNlPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHVzZSBmaWxsPSd1cmwoI2xpbmVhckdyYWRpZW50LTIpJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnIHhsaW5rOmhyZWY9JyNwYXRoLTMnPjwvdXNlPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHVzZSBmaWxsPSdibGFjaycgZmlsbC1vcGFjaXR5PScxJyBmaWx0ZXI9J3VybCgjZmlsdGVyLTUpJyB4bGluazpocmVmPScjcGF0aC0zJz48L3VzZT5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgPC9nPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICA8ZyBpZD0nUGF0aCc+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dXNlIGZpbGw9J2JsYWNrJyBmaWxsLW9wYWNpdHk9JzEnIGZpbHRlcj0ndXJsKCNmaWx0ZXItNyknIHhsaW5rOmhyZWY9JyNwYXRoLTYnPjwvdXNlPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHVzZSBmaWxsPSd1cmwoI2xpbmVhckdyYWRpZW50LTIpJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnIHhsaW5rOmhyZWY9JyNwYXRoLTYnPjwvdXNlPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHVzZSBmaWxsPSdibGFjaycgZmlsbC1vcGFjaXR5PScxJyBmaWx0ZXI9J3VybCgjZmlsdGVyLTgpJyB4bGluazpocmVmPScjcGF0aC02Jz48L3VzZT5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgPC9nPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICA8ZyBpZD0nT3ZhbC0xNic+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dXNlIGZpbGw9J2JsYWNrJyBmaWxsLW9wYWNpdHk9JzEnIGZpbHRlcj0ndXJsKCNmaWx0ZXItMTApJyB4bGluazpocmVmPScjcGF0aC05Jz48L3VzZT5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx1c2UgZmlsbD0nI0ZGQzIwOScgZmlsbC1ydWxlPSdldmVub2RkJyB4bGluazpocmVmPScjcGF0aC05Jz48L3VzZT5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx1c2UgZmlsbD0nYmxhY2snIGZpbGwtb3BhY2l0eT0nMScgZmlsdGVyPSd1cmwoI2ZpbHRlci0xMSknIHhsaW5rOmhyZWY9JyNwYXRoLTknPjwvdXNlPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICA8L2c+XG5cdCAgICAgICAgICAgICAgICAgICAgPC9nPlxuXHQgICAgICAgICAgICAgICAgPC9nPlxuXHQgICAgICAgICAgICA8L2c+XG5cdCAgICAgICAgPC9nPlxuXHQgICAgPC9nPlxuXHQ8L3N2Zz5cIlxuXHR3ZWF0aGVyX2FwcDpcIjw/eG1sIHZlcnNpb249JzEuMCcgZW5jb2Rpbmc9J1VURi04JyBzdGFuZGFsb25lPSdubyc/PlxuXHQ8c3ZnIHdpZHRoPSc2MHB4JyBoZWlnaHQ9JzYwcHgnIHZpZXdCb3g9JzAgMCA2MCA2MCcgdmVyc2lvbj0nMS4xJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHhtbG5zOnhsaW5rPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJz5cblx0ICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggMzkuMSAoMzE3MjApIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPlxuXHQgICAgPHRpdGxlPldlYWx0aGVyPC90aXRsZT5cblx0ICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPlxuXHQgICAgPGRlZnM+XG5cdCAgICAgICAgPGxpbmVhckdyYWRpZW50IHgxPSc1MCUnIHkxPScwJScgeDI9JzUwJScgeTI9JzEwMCUnIGlkPSdsaW5lYXJHcmFkaWVudC0xJz5cblx0ICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0nIzFENjJGMCcgb2Zmc2V0PScwJSc+PC9zdG9wPlxuXHQgICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPScjMTlENUZEJyBvZmZzZXQ9JzEwMCUnPjwvc3RvcD5cblx0ICAgICAgICA8L2xpbmVhckdyYWRpZW50PlxuXHQgICAgPC9kZWZzPlxuXHQgICAgPGcgaWQ9J1BhZ2UtMScgc3Ryb2tlPSdub25lJyBzdHJva2Utd2lkdGg9JzEnIGZpbGw9J25vbmUnIGZpbGwtcnVsZT0nZXZlbm9kZCc+XG5cdCAgICAgICAgPGcgaWQ9J0hvbWUtU2NyZWVuLeKAoi1pUGhvbmUtU0UnIHRyYW5zZm9ybT0ndHJhbnNsYXRlKC0xNi4wMDAwMDAsIC0xMTUuMDAwMDAwKSc+XG5cdCAgICAgICAgICAgIDxnIGlkPSdIb21lLVNjcmVlbi3igKItaVBob25lLTZzLUNvcHknIHRyYW5zZm9ybT0ndHJhbnNsYXRlKDAuMDAwMDAwLCAyNy4wMDAwMDApJz5cblx0ICAgICAgICAgICAgICAgIDxnIGlkPSdXZWFsdGhlcicgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMTYuMDAwMDAwLCA4OC4wMDAwMDApJz5cblx0ICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSdNMzkuMDgxNSwwIEM0NS4xMDUsMCA0OC4xMTYsMCA1MS4zNTg1LDEuMDI1IEM1NC44OTg1LDIuMzEzNSA1Ny42ODY1LDUuMTAxNSA1OC45NzUsOC42NDE1IEM2MCwxMS44ODM1IDYwLDE0Ljg5NTUgNjAsMjAuOTE4NSBMNjAsMzkuMDgxNSBDNjAsNDUuMTA1IDYwLDQ4LjExNiA1OC45NzUsNTEuMzU4NSBDNTcuNjg2NSw1NC44OTg1IDU0Ljg5ODUsNTcuNjg2NSA1MS4zNTg1LDU4Ljk3NDUgQzQ4LjExNiw2MCA0NS4xMDUsNjAgMzkuMDgxNSw2MCBMMjAuOTE4NSw2MCBDMTQuODk1LDYwIDExLjg4MzUsNjAgOC42NDE1LDU4Ljk3NDUgQzUuMTAxNSw1Ny42ODY1IDIuMzEzNSw1NC44OTg1IDEuMDI1LDUxLjM1ODUgQzAsNDguMTE2IDAsNDUuMTA1IDAsMzkuMDgxNSBMMCwyMC45MTg1IEMwLDE0Ljg5NTUgMCwxMS44ODM1IDEuMDI1LDguNjQxNSBDMi4zMTM1LDUuMTAxNSA1LjEwMTUsMi4zMTM1IDguNjQxNSwxLjAyNSBDMTEuODgzNSwwIDE0Ljg5NSwwIDIwLjkxODUsMCBMMzkuMDgxNSwwIFonIGlkPSdCRycgZmlsbD0ndXJsKCNsaW5lYXJHcmFkaWVudC0xKSc+PC9wYXRoPlxuXHQgICAgICAgICAgICAgICAgICAgIDxjaXJjbGUgaWQ9J1N1bicgZmlsbD0nI0ZGRDgwMCcgY3g9JzE5Ljc1JyBjeT0nMjQuMjUnIHI9JzExLjI1Jz48L2NpcmNsZT5cblx0ICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSdNNDEuNSw0My45OTY2ODcgQzQ2LjQ5MzA2MjUsNDMuODY0MjAzNSA1MC41LDM5Ljc3NTAzNyA1MC41LDM0Ljc1IEM1MC41LDI5LjY0MTM2NjEgNDYuMzU4NjMzOSwyNS41IDQxLjI1LDI1LjUgQzQxLjA1NzQ1NDksMjUuNSA0MC44NjYyODM4LDI1LjUwNTg4MyA0MC42NzY2NTY3LDI1LjUxNzQ3OTEgQzM5LjAwNDMzNTMsMjEuNDAxODg4OSAzNC45NjYwNTM5LDE4LjUgMzAuMjUsMTguNSBDMjQuMDM2Nzk2NiwxOC41IDE5LDIzLjUzNjc5NjYgMTksMjkuNzUgQzE5LDMwLjAzOTE5MTUgMTkuMDEwOTExNywzMC4zMjU4MzQ0IDE5LjAzMjM0NiwzMC42MDk1Mzk1IEMxNS44ODU2MjQ0LDMxLjE4MjgxNTcgMTMuNSwzMy45Mzc4MTE2IDEzLjUsMzcuMjUgQzEzLjUsNDAuODk0MjI0MiAxNi4zODc5MDAyLDQzLjg2Mzk0MzEgMjAsNDMuOTk1NDU2MiBMMjAsNDQgTDQxLjUsNDQgTDQxLjUsNDMuOTk2Njg3IEw0MS41LDQzLjk5NjY4NyBaJyBpZD0nQ2xvdWQnIGZpbGw9JyNGRkZGRkYnIG9wYWNpdHk9JzAuOTAwNTM2MzgxJz48L3BhdGg+XG5cdCAgICAgICAgICAgICAgICA8L2c+XG5cdCAgICAgICAgICAgIDwvZz5cblx0ICAgICAgICA8L2c+XG5cdCAgICA8L2c+XG5cdDwvc3ZnPlwiXG5cdGNsb2NrX2FwcDpcIjw/eG1sIHZlcnNpb249JzEuMCcgZW5jb2Rpbmc9J1VURi04JyBzdGFuZGFsb25lPSdubyc/PlxuXHQ8c3ZnIHdpZHRoPSc2MHB4JyBoZWlnaHQ9JzYwcHgnIHZpZXdCb3g9JzAgMCA2MCA2MCcgdmVyc2lvbj0nMS4xJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHhtbG5zOnhsaW5rPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJz5cblx0ICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggMzkuMSAoMzE3MjApIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPlxuXHQgICAgPHRpdGxlPkNsb2NrPC90aXRsZT5cblx0ICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPlxuXHQgICAgPGRlZnM+XG5cdCAgICAgICAgPGxpbmVhckdyYWRpZW50IHgxPSc1MCUnIHkxPScwJScgeDI9JzUwJScgeTI9JzEwMCUnIGlkPSdsaW5lYXJHcmFkaWVudC0xJz5cblx0ICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0nI0YxRjFGMScgb2Zmc2V0PScwJSc+PC9zdG9wPlxuXHQgICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPScjRUVFRUVFJyBvZmZzZXQ9JzEwMCUnPjwvc3RvcD5cblx0ICAgICAgICA8L2xpbmVhckdyYWRpZW50PlxuXHQgICAgPC9kZWZzPlxuXHQgICAgPGcgaWQ9J1BhZ2UtMScgc3Ryb2tlPSdub25lJyBzdHJva2Utd2lkdGg9JzEnIGZpbGw9J25vbmUnIGZpbGwtcnVsZT0nZXZlbm9kZCc+XG5cdCAgICAgICAgPGcgaWQ9J0hvbWUtU2NyZWVuLeKAoi1pUGhvbmUtU0UnIHRyYW5zZm9ybT0ndHJhbnNsYXRlKC05Mi4wMDAwMDAsIC0xMTUuMDAwMDAwKSc+XG5cdCAgICAgICAgICAgIDxnIGlkPSdIb21lLVNjcmVlbi3igKItaVBob25lLTZzLUNvcHknIHRyYW5zZm9ybT0ndHJhbnNsYXRlKDAuMDAwMDAwLCAyNy4wMDAwMDApJz5cblx0ICAgICAgICAgICAgICAgIDxnIGlkPSdDbG9jaycgdHJhbnNmb3JtPSd0cmFuc2xhdGUoOTIuMDAwMDAwLCA4OC4wMDAwMDApJz5cblx0ICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSdNMzkuMDgxNSwwIEM0NS4xMDUsMCA0OC4xMTYsMCA1MS4zNTg1LDEuMDI1IEM1NC44OTg1LDIuMzEzNSA1Ny42ODY1LDUuMTAxNSA1OC45NzUsOC42NDE1IEM2MCwxMS44ODM1IDYwLDE0Ljg5NTUgNjAsMjAuOTE4NSBMNjAsMzkuMDgxNSBDNjAsNDUuMTA1IDYwLDQ4LjExNiA1OC45NzUsNTEuMzU4NSBDNTcuNjg2NSw1NC44OTg1IDU0Ljg5ODUsNTcuNjg2NSA1MS4zNTg1LDU4Ljk3NDUgQzQ4LjExNiw2MCA0NS4xMDUsNjAgMzkuMDgxNSw2MCBMMjAuOTE4NSw2MCBDMTQuODk1LDYwIDExLjg4MzUsNjAgOC42NDE1LDU4Ljk3NDUgQzUuMTAxNSw1Ny42ODY1IDIuMzEzNSw1NC44OTg1IDEuMDI1LDUxLjM1ODUgQzAsNDguMTE2IDAsNDUuMTA1IDAsMzkuMDgxNSBMMCwyMC45MTg1IEMwLDE0Ljg5NTUgMCwxMS44ODM1IDEuMDI1LDguNjQxNSBDMi4zMTM1LDUuMTAxNSA1LjEwMTUsMi4zMTM1IDguNjQxNSwxLjAyNSBDMTEuODgzNSwwIDE0Ljg5NSwwIDIwLjkxODUsMCBMMzkuMDgxNSwwIFonIGlkPSdJY29uJyBmaWxsPScjMUUxRTFGJz48L3BhdGg+XG5cdCAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0nT3ZhbC0xMicgZmlsbD0ndXJsKCNsaW5lYXJHcmFkaWVudC0xKScgY3g9JzMwJyBjeT0nMzAnIHI9JzI2Jz48L2NpcmNsZT5cblx0ICAgICAgICAgICAgICAgICAgICA8ZyBpZD0nRGlnaXRzJyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSg4LjAwMDAwMCwgNy4wMDAwMDApJyBmaWxsPScjNjE2MTYxJz5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0nTTMyLjQ2OCw4IEwzMi40NjgsMy43NDYgTDMyLjA3OCwzLjc0NiBDMzIuMDQ5OTk5OSwzLjkwNjAwMDggMzEuOTk4MDAwNCw0LjAzNzk5OTQ4IDMxLjkyMiw0LjE0MiBDMzEuODQ1OTk5Niw0LjI0NjAwMDUyIDMxLjc1MzAwMDUsNC4zMjc5OTk3IDMxLjY0Myw0LjM4OCBDMzEuNTMyOTk5NCw0LjQ0ODAwMDMgMzEuNDEwMDAwNyw0LjQ4ODk5OTg5IDMxLjI3NCw0LjUxMSBDMzEuMTM3OTk5Myw0LjUzMzAwMDExIDMwLjk5ODAwMDcsNC41NDQgMzAuODU0LDQuNTQ0IEwzMC44NTQsNC45NTIgTDMxLjk1OCw0Ljk1MiBMMzEuOTU4LDggTDMyLjQ2OCw4IFonIGlkPScxJz48L3BhdGg+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9J00zOC4wOTYsMTIuNzUyIEwzOC42MDYsMTIuNzUyIEMzOC42MDIsMTIuNjIzOTk5NCAzOC42MTQ5OTk5LDEyLjQ5NzAwMDYgMzguNjQ1LDEyLjM3MSBDMzguNjc1MDAwMiwxMi4yNDQ5OTk0IDM4LjcyMzk5OTcsMTIuMTMyMDAwNSAzOC43OTIsMTIuMDMyIEMzOC44NjAwMDAzLDExLjkzMTk5OTUgMzguOTQ2OTk5NSwxMS44NTEwMDAzIDM5LjA1MywxMS43ODkgQzM5LjE1OTAwMDUsMTEuNzI2OTk5NyAzOS4yODU5OTkzLDExLjY5NiAzOS40MzQsMTEuNjk2IEMzOS41NDYwMDA2LDExLjY5NiAzOS42NTE5OTk1LDExLjcxMzk5OTggMzkuNzUyLDExLjc1IEMzOS44NTIwMDA1LDExLjc4NjAwMDIgMzkuOTM4OTk5NiwxMS44Mzc5OTk3IDQwLjAxMywxMS45MDYgQzQwLjA4NzAwMDQsMTEuOTc0MDAwMyA0MC4xNDU5OTk4LDEyLjA1NDk5OTUgNDAuMTksMTIuMTQ5IEM0MC4yMzQwMDAyLDEyLjI0MzAwMDUgNDAuMjU2LDEyLjM0Nzk5OTQgNDAuMjU2LDEyLjQ2NCBDNDAuMjU2LDEyLjYxMjAwMDcgNDAuMjMzMDAwMiwxMi43NDE5OTk0IDQwLjE4NywxMi44NTQgQzQwLjE0MDk5OTgsMTIuOTY2MDAwNiA0MC4wNzMwMDA1LDEzLjA2OTk5OTUgMzkuOTgzLDEzLjE2NiBDMzkuODkyOTk5NiwxMy4yNjIwMDA1IDM5Ljc4MDAwMDcsMTMuMzU2OTk5NSAzOS42NDQsMTMuNDUxIEMzOS41MDc5OTkzLDEzLjU0NTAwMDUgMzkuMzUwMDAwOSwxMy42NDc5OTk0IDM5LjE3LDEzLjc2IEMzOS4wMjE5OTkzLDEzLjg0ODAwMDQgMzguODgwMDAwNywxMy45NDE5OTk1IDM4Ljc0NCwxNC4wNDIgQzM4LjYwNzk5OTMsMTQuMTQyMDAwNSAzOC40ODYwMDA1LDE0LjI1Nzk5OTMgMzguMzc4LDE0LjM5IEMzOC4yNjk5OTk1LDE0LjUyMjAwMDcgMzguMTgxMDAwNCwxNC42NzY5OTkxIDM4LjExMSwxNC44NTUgQzM4LjA0MDk5OTcsMTUuMDMzMDAwOSAzNy45OTYwMDAxLDE1LjI0Nzk5ODcgMzcuOTc2LDE1LjUgTDQwLjc1NCwxNS41IEw0MC43NTQsMTUuMDUgTDM4LjU3LDE1LjA1IEMzOC41OTQwMDAxLDE0LjkxNzk5OTMgMzguNjQ0OTk5NiwxNC44MDEwMDA1IDM4LjcyMywxNC42OTkgQzM4LjgwMTAwMDQsMTQuNTk2OTk5NSAzOC44OTQ5OTk1LDE0LjUwMjAwMDQgMzkuMDA1LDE0LjQxNCBDMzkuMTE1MDAwNiwxNC4zMjU5OTk2IDM5LjIzNTk5OTMsMTQuMjQzMDAwNCAzOS4zNjgsMTQuMTY1IEMzOS41MDAwMDA3LDE0LjA4Njk5OTYgMzkuNjMxOTk5MywxNC4wMDgwMDA0IDM5Ljc2NCwxMy45MjggQzM5Ljg5NjAwMDcsMTMuODQzOTk5NiA0MC4wMjM5OTk0LDEzLjc1NjAwMDUgNDAuMTQ4LDEzLjY2NCBDNDAuMjcyMDAwNiwxMy41NzE5OTk1IDQwLjM4MTk5OTUsMTMuNDY5MDAwNiA0MC40NzgsMTMuMzU1IEM0MC41NzQwMDA1LDEzLjI0MDk5OTQgNDAuNjUwOTk5NywxMy4xMTIwMDA3IDQwLjcwOSwxMi45NjggQzQwLjc2NzAwMDMsMTIuODIzOTk5MyA0MC43OTYsMTIuNjU4MDAwOSA0MC43OTYsMTIuNDcgQzQwLjc5NiwxMi4yNjk5OTkgNDAuNzYxMDAwNCwxMi4wOTQwMDA4IDQwLjY5MSwxMS45NDIgQzQwLjYyMDk5OTcsMTEuNzg5OTk5MiA0MC41MjYwMDA2LDExLjY2MzAwMDUgNDAuNDA2LDExLjU2MSBDNDAuMjg1OTk5NCwxMS40NTg5OTk1IDQwLjE0NTAwMDgsMTEuMzgxMDAwMyAzOS45ODMsMTEuMzI3IEMzOS44MjA5OTkyLDExLjI3Mjk5OTcgMzkuNjQ4MDAwOSwxMS4yNDYgMzkuNDY0LDExLjI0NiBDMzkuMjM5OTk4OSwxMS4yNDYgMzkuMDQwMDAwOSwxMS4yODM5OTk2IDM4Ljg2NCwxMS4zNiBDMzguNjg3OTk5MSwxMS40MzYwMDA0IDM4LjU0MTAwMDYsMTEuNTQwOTk5MyAzOC40MjMsMTEuNjc1IEMzOC4zMDQ5OTk0LDExLjgwOTAwMDcgMzguMjE4MDAwMywxMS45Njc5OTkxIDM4LjE2MiwxMi4xNTIgQzM4LjEwNTk5OTcsMTIuMzM2MDAwOSAzOC4wODM5OTk5LDEyLjUzNTk5ODkgMzguMDk2LDEyLjc1MiBMMzguMDk2LDEyLjc1MiBaJyBpZD0nMic+PC9wYXRoPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSdNNDIuMTQsMjIuNTcgTDQyLjE0LDIzLjAwMiBDNDIuMjM2MDAwNSwyMi45ODk5OTk5IDQyLjMzNzk5OTUsMjIuOTg0IDQyLjQ0NiwyMi45ODQgQzQyLjU3NDAwMDYsMjIuOTg0IDQyLjY5Mjk5OTUsMjMuMDAwOTk5OCA0Mi44MDMsMjMuMDM1IEM0Mi45MTMwMDA2LDIzLjA2OTAwMDIgNDMuMDA3OTk5NiwyMy4xMjA5OTk3IDQzLjA4OCwyMy4xOTEgQzQzLjE2ODAwMDQsMjMuMjYxMDAwNCA0My4yMzE5OTk4LDIzLjM0Njk5OTUgNDMuMjgsMjMuNDQ5IEM0My4zMjgwMDAyLDIzLjU1MTAwMDUgNDMuMzUyLDIzLjY2Nzk5OTMgNDMuMzUyLDIzLjggQzQzLjM1MiwyMy45MjgwMDA2IDQzLjMyNzAwMDMsMjQuMDQyOTk5NSA0My4yNzcsMjQuMTQ1IEM0My4yMjY5OTk4LDI0LjI0NzAwMDUgNDMuMTYwMDAwNCwyNC4zMzI5OTk3IDQzLjA3NiwyNC40MDMgQzQyLjk5MTk5OTYsMjQuNDczMDAwNCA0Mi44OTQwMDA2LDI0LjUyNjk5OTggNDIuNzgyLDI0LjU2NSBDNDIuNjY5OTk5NCwyNC42MDMwMDAyIDQyLjU1MjAwMDYsMjQuNjIyIDQyLjQyOCwyNC42MjIgQzQyLjEzNTk5ODUsMjQuNjIyIDQxLjkxNDAwMDgsMjQuNTM1MDAwOSA0MS43NjIsMjQuMzYxIEM0MS42MDk5OTkyLDI0LjE4Njk5OTEgNDEuNTMsMjMuOTYyMDAxNCA0MS41MjIsMjMuNjg2IEw0MS4wMTIsMjMuNjg2IEM0MS4wMDgsMjMuOTA2MDAxMSA0MS4wMzg5OTk3LDI0LjEwMTk5OTEgNDEuMTA1LDI0LjI3NCBDNDEuMTcxMDAwMywyNC40NDYwMDA5IDQxLjI2NTk5OTQsMjQuNTkwOTk5NCA0MS4zOSwyNC43MDkgQzQxLjUxNDAwMDYsMjQuODI3MDAwNiA0MS42NjM5OTkxLDI0LjkxNTk5OTcgNDEuODQsMjQuOTc2IEM0Mi4wMTYwMDA5LDI1LjAzNjAwMDMgNDIuMjExOTk4OSwyNS4wNjYgNDIuNDI4LDI1LjA2NiBDNDIuNjI4MDAxLDI1LjA2NiA0Mi44MTY5OTkxLDI1LjAzOTAwMDMgNDIuOTk1LDI0Ljk4NSBDNDMuMTczMDAwOSwyNC45MzA5OTk3IDQzLjMyNzk5OTMsMjQuODUwMDAwNSA0My40NiwyNC43NDIgQzQzLjU5MjAwMDcsMjQuNjMzOTk5NSA0My42OTY5OTk2LDI0LjQ5OTAwMDggNDMuNzc1LDI0LjMzNyBDNDMuODUzMDAwNCwyNC4xNzQ5OTkyIDQzLjg5MiwyMy45ODgwMDExIDQzLjg5MiwyMy43NzYgQzQzLjg5MiwyMy41MTk5OTg3IDQzLjgyOTAwMDYsMjMuMjk4MDAwOSA0My43MDMsMjMuMTEgQzQzLjU3Njk5OTQsMjIuOTIxOTk5MSA0My4zODQwMDEzLDIyLjgwMDAwMDMgNDMuMTI0LDIyLjc0NCBMNDMuMTI0LDIyLjczMiBDNDMuMjkyMDAwOCwyMi42NTU5OTk2IDQzLjQzMTk5OTQsMjIuNTQ0MDAwNyA0My41NDQsMjIuMzk2IEM0My42NTYwMDA2LDIyLjI0Nzk5OTMgNDMuNzEyLDIyLjA3ODAwMSA0My43MTIsMjEuODg2IEM0My43MTIsMjEuNjg5OTk5IDQzLjY3OTAwMDMsMjEuNTIwMDAwNyA0My42MTMsMjEuMzc2IEM0My41NDY5OTk3LDIxLjIzMTk5OTMgNDMuNDU2MDAwNiwyMS4xMTQwMDA1IDQzLjM0LDIxLjAyMiBDNDMuMjIzOTk5NCwyMC45Mjk5OTk1IDQzLjA4NzAwMDgsMjAuODYxMDAwMiA0Mi45MjksMjAuODE1IEM0Mi43NzA5OTkyLDIwLjc2ODk5OTggNDIuNjAwMDAwOSwyMC43NDYgNDIuNDE2LDIwLjc0NiBDNDIuMjAzOTk4OSwyMC43NDYgNDIuMDE3MDAwOCwyMC43Nzk5OTk3IDQxLjg1NSwyMC44NDggQzQxLjY5Mjk5OTIsMjAuOTE2MDAwMyA0MS41NTgwMDA1LDIxLjAwOTk5OTQgNDEuNDUsMjEuMTMgQzQxLjM0MTk5OTUsMjEuMjUwMDAwNiA0MS4yNTkwMDAzLDIxLjM5Mzk5OTIgNDEuMjAxLDIxLjU2MiBDNDEuMTQyOTk5NywyMS43MzAwMDA4IDQxLjExLDIxLjkxNTk5OSA0MS4xMDIsMjIuMTIgTDQxLjYxMiwyMi4xMiBDNDEuNjEyLDIxLjk5NTk5OTQgNDEuNjI3OTk5OCwyMS44NzgwMDA2IDQxLjY2LDIxLjc2NiBDNDEuNjkyMDAwMiwyMS42NTM5OTk0IDQxLjc0MDk5OTcsMjEuNTU2MDAwNCA0MS44MDcsMjEuNDcyIEM0MS44NzMwMDAzLDIxLjM4Nzk5OTYgNDEuOTU2OTk5NSwyMS4zMjEwMDAzIDQyLjA1OSwyMS4yNzEgQzQyLjE2MTAwMDUsMjEuMjIwOTk5OCA0Mi4yNzk5OTkzLDIxLjE5NiA0Mi40MTYsMjEuMTk2IEM0Mi42MzIwMDExLDIxLjE5NiA0Mi44MTE5OTkzLDIxLjI1Mjk5OTQgNDIuOTU2LDIxLjM2NyBDNDMuMTAwMDAwNywyMS40ODEwMDA2IDQzLjE3MiwyMS42NTE5OTg5IDQzLjE3MiwyMS44OCBDNDMuMTcyLDIxLjk5MjAwMDYgNDMuMTUwMDAwMiwyMi4wOTE5OTk2IDQzLjEwNiwyMi4xOCBDNDMuMDYxOTk5OCwyMi4yNjgwMDA0IDQzLjAwMzAwMDQsMjIuMzQwOTk5NyA0Mi45MjksMjIuMzk5IEM0Mi44NTQ5OTk2LDIyLjQ1NzAwMDMgNDIuNzY5MDAwNSwyMi41MDA5OTk5IDQyLjY3MSwyMi41MzEgQzQyLjU3Mjk5OTUsMjIuNTYxMDAwMiA0Mi40NzAwMDA1LDIyLjU3NiA0Mi4zNjIsMjIuNTc2IEw0Mi4yNTQsMjIuNTc2IEw0Mi4xOTQsMjIuNTc2IEM0Mi4xNzc5OTk5LDIyLjU3NiA0Mi4xNjAwMDAxLDIyLjU3NCA0Mi4xNCwyMi41NyBMNDIuMTQsMjIuNTcgWicgaWQ9JzMnPjwvcGF0aD5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0nTTQwLjM2NiwzNC4wNTQgTDM4LjkzOCwzNC4wNTQgTDQwLjM1NCwzMS45NzIgTDQwLjM2NiwzMS45NzIgTDQwLjM2NiwzNC4wNTQgWiBNNDAuODQ2LDM0LjA1NCBMNDAuODQ2LDMxLjI0NiBMNDAuNDM4LDMxLjI0NiBMMzguNSwzNC4wMTIgTDM4LjUsMzQuNTA0IEw0MC4zNjYsMzQuNTA0IEw0MC4zNjYsMzUuNSBMNDAuODQ2LDM1LjUgTDQwLjg0NiwzNC41MDQgTDQxLjQyMiwzNC41MDQgTDQxLjQyMiwzNC4wNTQgTDQwLjg0NiwzNC4wNTQgWicgaWQ9JzQnPjwvcGF0aD5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0nTTMzLjY1MiwzOC43NjggTDMzLjY1MiwzOC4zMTggTDMxLjU1MiwzOC4zMTggTDMxLjE1Niw0MC41MjYgTDMxLjU5NCw0MC41NSBDMzEuNjk0MDAwNSw0MC40Mjk5OTk0IDMxLjgwODk5OTMsNDAuMzMzMDAwNCAzMS45MzksNDAuMjU5IEMzMi4wNjkwMDA2LDQwLjE4NDk5OTYgMzIuMjE3OTk5Miw0MC4xNDggMzIuMzg2LDQwLjE0OCBDMzIuNTMwMDAwNyw0MC4xNDggMzIuNjYwOTk5NCw0MC4xNzE5OTk4IDMyLjc3OSw0MC4yMiBDMzIuODk3MDAwNiw0MC4yNjgwMDAyIDMyLjk5Nzk5OTYsNDAuMzM0OTk5NiAzMy4wODIsNDAuNDIxIEMzMy4xNjYwMDA0LDQwLjUwNzAwMDQgMzMuMjMwOTk5OCw0MC42MDg5OTk0IDMzLjI3Nyw0MC43MjcgQzMzLjMyMzAwMDIsNDAuODQ1MDAwNiAzMy4zNDYsNDAuOTczOTk5MyAzMy4zNDYsNDEuMTE0IEMzMy4zNDYsNDEuMjgyMDAwOCAzMy4zMjIwMDAyLDQxLjQyODk5OTQgMzMuMjc0LDQxLjU1NSBDMzMuMjI1OTk5OCw0MS42ODEwMDA2IDMzLjE2MTAwMDQsNDEuNzg1OTk5NiAzMy4wNzksNDEuODcgQzMyLjk5Njk5OTYsNDEuOTU0MDAwNCAzMi45MDEwMDA1LDQyLjAxNjk5OTggMzIuNzkxLDQyLjA1OSBDMzIuNjgwOTk5NCw0Mi4xMDEwMDAyIDMyLjU2NjAwMDYsNDIuMTIyIDMyLjQ0Niw0Mi4xMjIgQzMyLjMxNzk5OTQsNDIuMTIyIDMyLjIwMTAwMDUsNDIuMTAzMDAwMiAzMi4wOTUsNDIuMDY1IEMzMS45ODg5OTk1LDQyLjAyNjk5OTggMzEuODk3MDAwNCw0MS45NzMwMDA0IDMxLjgxOSw0MS45MDMgQzMxLjc0MDk5OTYsNDEuODMyOTk5NyAzMS42NzkwMDAyLDQxLjc1MTAwMDUgMzEuNjMzLDQxLjY1NyBDMzEuNTg2OTk5OCw0MS41NjI5OTk1IDMxLjU2LDQxLjQ2MjAwMDUgMzEuNTUyLDQxLjM1NCBMMzEuMDQyLDQxLjM1NCBDMzEuMDQ2LDQxLjU0NjAwMSAzMS4wODM5OTk2LDQxLjcxNzk5OTIgMzEuMTU2LDQxLjg3IEMzMS4yMjgwMDA0LDQyLjAyMjAwMDggMzEuMzI1OTk5NCw0Mi4xNDg5OTk1IDMxLjQ1LDQyLjI1MSBDMzEuNTc0MDAwNiw0Mi4zNTMwMDA1IDMxLjcxNjk5OTIsNDIuNDMwOTk5NyAzMS44NzksNDIuNDg1IEMzMi4wNDEwMDA4LDQyLjUzOTAwMDMgMzIuMjEzOTk5MSw0Mi41NjYgMzIuMzk4LDQyLjU2NiBDMzIuNjQ2MDAxMiw0Mi41NjYgMzIuODYyOTk5MSw0Mi41MjcwMDA0IDMzLjA0OSw0Mi40NDkgQzMzLjIzNTAwMDksNDIuMzcwOTk5NiAzMy4zODk5OTk0LDQyLjI2NjAwMDcgMzMuNTE0LDQyLjEzNCBDMzMuNjM4MDAwNiw0Mi4wMDE5OTkzIDMzLjczMDk5OTcsNDEuODUxMDAwOSAzMy43OTMsNDEuNjgxIEMzMy44NTUwMDAzLDQxLjUxMDk5OTIgMzMuODg2LDQxLjMzNjAwMDkgMzMuODg2LDQxLjE1NiBDMzMuODg2LDQwLjkxMTk5ODggMzMuODUwMDAwNCw0MC42OTkwMDA5IDMzLjc3OCw0MC41MTcgQzMzLjcwNTk5OTYsNDAuMzM0OTk5MSAzMy42MDgwMDA2LDQwLjE4MzAwMDYgMzMuNDg0LDQwLjA2MSBDMzMuMzU5OTk5NCwzOS45Mzg5OTk0IDMzLjIxNDAwMDgsMzkuODQ4MDAwMyAzMy4wNDYsMzkuNzg4IEMzMi44Nzc5OTkyLDM5LjcyNzk5OTcgMzIuNzAwMDAwOSwzOS42OTggMzIuNTEyLDM5LjY5OCBDMzIuMzY3OTk5MywzOS42OTggMzIuMjIzMDAwNywzOS43MjI5OTk4IDMyLjA3NywzOS43NzMgQzMxLjkzMDk5OTMsMzkuODIzMDAwMyAzMS44MTIwMDA1LDM5Ljg5OTk5OTUgMzEuNzIsNDAuMDA0IEwzMS43MDgsMzkuOTkyIEwzMS45MzYsMzguNzY4IEwzMy42NTIsMzguNzY4IFonIGlkPSc1Jz48L3BhdGg+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9J00yMi44MTYsNDIuMzMyIEwyMy4zMjYsNDIuMzMyIEMyMy4yOTM5OTk4LDQxLjk3OTk5ODIgMjMuMTc0MDAxLDQxLjcxMTAwMDkgMjIuOTY2LDQxLjUyNSBDMjIuNzU3OTk5LDQxLjMzODk5OTEgMjIuNDc4MDAxOCw0MS4yNDYgMjIuMTI2LDQxLjI0NiBDMjEuODIxOTk4NSw0MS4yNDYgMjEuNTcwMDAxLDQxLjMwOTk5OTQgMjEuMzcsNDEuNDM4IEMyMS4xNjk5OTksNDEuNTY2MDAwNiAyMS4wMTAwMDA2LDQxLjczNTk5ODkgMjAuODksNDEuOTQ4IEMyMC43Njk5OTk0LDQyLjE2MDAwMTEgMjAuNjg1MDAwMiw0Mi40MDI5OTg2IDIwLjYzNSw0Mi42NzcgQzIwLjU4NDk5OTcsNDIuOTUxMDAxNCAyMC41Niw0My4yMzM5OTg1IDIwLjU2LDQzLjUyNiBDMjAuNTYsNDMuNzUwMDAxMSAyMC41NzY5OTk4LDQzLjk4MTk5ODggMjAuNjExLDQ0LjIyMiBDMjAuNjQ1MDAwMiw0NC40NjIwMDEyIDIwLjcxMzk5OTUsNDQuNjgxOTk5IDIwLjgxOCw0NC44ODIgQzIwLjkyMjAwMDUsNDUuMDgyMDAxIDIxLjA2OTk5OSw0NS4yNDU5OTk0IDIxLjI2Miw0NS4zNzQgQzIxLjQ1NDAwMSw0NS41MDIwMDA2IDIxLjcwNzk5ODQsNDUuNTY2IDIyLjAyNCw0NS41NjYgQzIyLjI5MjAwMTMsNDUuNTY2IDIyLjUxNjk5OTEsNDUuNTIxMDAwNSAyMi42OTksNDUuNDMxIEMyMi44ODEwMDA5LDQ1LjM0MDk5OTYgMjMuMDI2OTk5NCw0NS4yMjcwMDA3IDIzLjEzNyw0NS4wODkgQzIzLjI0NzAwMDUsNDQuOTUwOTk5MyAyMy4zMjU5OTk4LDQ0Ljc5ODAwMDggMjMuMzc0LDQ0LjYzIEMyMy40MjIwMDAyLDQ0LjQ2MTk5OTIgMjMuNDQ2LDQ0LjMwMDAwMDggMjMuNDQ2LDQ0LjE0NCBDMjMuNDQ2LDQzLjk0Nzk5OSAyMy40MTYwMDAzLDQzLjc2NjAwMDggMjMuMzU2LDQzLjU5OCBDMjMuMjk1OTk5Nyw0My40Mjk5OTkyIDIzLjIxMTAwMDUsNDMuMjg0MDAwNiAyMy4xMDEsNDMuMTYgQzIyLjk5MDk5OTQsNDMuMDM1OTk5NCAyMi44NTUwMDA4LDQyLjkzOTAwMDQgMjIuNjkzLDQyLjg2OSBDMjIuNTMwOTk5Miw0Mi43OTg5OTk3IDIyLjM0ODAwMSw0Mi43NjQgMjIuMTQ0LDQyLjc2NCBDMjEuOTExOTk4OCw0Mi43NjQgMjEuNzA3MDAwOSw0Mi44MDc5OTk2IDIxLjUyOSw0Mi44OTYgQzIxLjM1MDk5OTEsNDIuOTg0MDAwNCAyMS4yMDIwMDA2LDQzLjEyNTk5OSAyMS4wODIsNDMuMzIyIEwyMS4wNyw0My4zMSBDMjEuMDc0LDQzLjE0NTk5OTIgMjEuMDg5OTk5OSw0Mi45NzAwMDA5IDIxLjExOCw0Mi43ODIgQzIxLjE0NjAwMDEsNDIuNTkzOTk5MSAyMS4xOTY5OTk2LDQyLjQxOTAwMDggMjEuMjcxLDQyLjI1NyBDMjEuMzQ1MDAwNCw0Mi4wOTQ5OTkyIDIxLjQ0Nzk5OTMsNDEuOTYxMDAwNSAyMS41OCw0MS44NTUgQzIxLjcxMjAwMDcsNDEuNzQ4OTk5NSAyMS44ODU5OTg5LDQxLjY5NiAyMi4xMDIsNDEuNjk2IEMyMi4zMDYwMDEsNDEuNjk2IDIyLjQ2OTk5OTQsNDEuNzUzOTk5NCAyMi41OTQsNDEuODcgQzIyLjcxODAwMDYsNDEuOTg2MDAwNiAyMi43OTE5OTk5LDQyLjEzOTk5OSAyMi44MTYsNDIuMzMyIEwyMi44MTYsNDIuMzMyIFogTTIyLjA0OCw0My4yMTQgQzIyLjE5MjAwMDcsNDMuMjE0IDIyLjMxNzk5OTUsNDMuMjM5OTk5NyAyMi40MjYsNDMuMjkyIEMyMi41MzQwMDA1LDQzLjM0NDAwMDMgMjIuNjIzOTk5Niw0My40MTI5OTk2IDIyLjY5Niw0My40OTkgQzIyLjc2ODAwMDQsNDMuNTg1MDAwNCAyMi44MjA5OTk4LDQzLjY4Njk5OTQgMjIuODU1LDQzLjgwNSBDMjIuODg5MDAwMiw0My45MjMwMDA2IDIyLjkwNiw0NC4wNDc5OTkzIDIyLjkwNiw0NC4xOCBDMjIuOTA2LDQ0LjMwNDAwMDYgMjIuODg3MDAwMiw0NC40MjI5OTk0IDIyLjg0OSw0NC41MzcgQzIyLjgxMDk5OTgsNDQuNjUxMDAwNiAyMi43NTYwMDA0LDQ0Ljc1MTk5OTYgMjIuNjg0LDQ0Ljg0IEMyMi42MTE5OTk2LDQ0LjkyODAwMDQgMjIuNTIzMDAwNSw0NC45OTY5OTk4IDIyLjQxNyw0NS4wNDcgQzIyLjMxMDk5OTUsNDUuMDk3MDAwMyAyMi4xODgwMDA3LDQ1LjEyMiAyMi4wNDgsNDUuMTIyIEMyMS45MDc5OTkzLDQ1LjEyMiAyMS43ODMwMDA1LDQ1LjA5NzAwMDMgMjEuNjczLDQ1LjA0NyBDMjEuNTYyOTk5NCw0NC45OTY5OTk4IDIxLjQ3MTAwMDQsNDQuOTMwMDAwNCAyMS4zOTcsNDQuODQ2IEMyMS4zMjI5OTk2LDQ0Ljc2MTk5OTYgMjEuMjY2MDAwMiw0NC42NjIwMDA2IDIxLjIyNiw0NC41NDYgQzIxLjE4NTk5OTgsNDQuNDI5OTk5NCAyMS4xNjYsNDQuMzA2MDAwNyAyMS4xNjYsNDQuMTc0IEMyMS4xNjYsNDQuMDQxOTk5MyAyMS4xODQ5OTk4LDQzLjkxNzAwMDYgMjEuMjIzLDQzLjc5OSBDMjEuMjYxMDAwMiw0My42ODA5OTk0IDIxLjMxNzk5OTYsNDMuNTc5MDAwNCAyMS4zOTQsNDMuNDkzIEMyMS40NzAwMDA0LDQzLjQwNjk5OTYgMjEuNTYxOTk5NSw0My4zMzkwMDAzIDIxLjY3LDQzLjI4OSBDMjEuNzc4MDAwNSw0My4yMzg5OTk4IDIxLjkwMzk5OTMsNDMuMjE0IDIyLjA0OCw0My4yMTQgTDIyLjA0OCw0My4yMTQgWicgaWQ9JzYnPjwvcGF0aD5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0nTTEyLjg4NiwzOC43NTYgTDEyLjg4NiwzOC4zMTggTDEwLjEzMiwzOC4zMTggTDEwLjEzMiwzOC43OTggTDEyLjM2NCwzOC43OTggQzEyLjEzOTk5ODksMzkuMDM0MDAxMiAxMS45MzEwMDEsMzkuMjkxOTk4NiAxMS43MzcsMzkuNTcyIEMxMS41NDI5OTksMzkuODUyMDAxNCAxMS4zNzIwMDA3LDQwLjE0ODk5ODQgMTEuMjI0LDQwLjQ2MyBDMTEuMDc1OTk5Myw0MC43NzcwMDE2IDEwLjk1NTAwMDUsNDEuMTA0OTk4MyAxMC44NjEsNDEuNDQ3IEMxMC43NjY5OTk1LDQxLjc4OTAwMTcgMTAuNzA4MDAwMSw0Mi4xMzk5OTgyIDEwLjY4NCw0Mi41IEwxMS4yNTQsNDIuNSBDMTEuMjc0MDAwMSw0Mi4xNjc5OTgzIDExLjMyOTk5OTUsNDEuODI2MDAxOCAxMS40MjIsNDEuNDc0IEMxMS41MTQwMDA1LDQxLjEyMTk5ODIgMTEuNjMyOTk5Myw0MC43ODAwMDE3IDExLjc3OSw0MC40NDggQzExLjkyNTAwMDcsNDAuMTE1OTk4MyAxMi4wOTE5OTkxLDM5LjgwNDAwMTUgMTIuMjgsMzkuNTEyIEMxMi40NjgwMDA5LDM5LjIxOTk5ODUgMTIuNjY5OTk4OSwzOC45NjgwMDExIDEyLjg4NiwzOC43NTYgTDEyLjg4NiwzOC43NTYgWicgaWQ9JzcnPjwvcGF0aD5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0nTTMuMjYyLDMyLjM1IEMzLjI2MiwzMi4yNDE5OTk1IDMuMjgxOTk5OCwzMi4xNDgwMDA0IDMuMzIyLDMyLjA2OCBDMy4zNjIwMDAyLDMxLjk4Nzk5OTYgMy40MTQ5OTk2NywzMS45MjAwMDAzIDMuNDgxLDMxLjg2NCBDMy41NDcwMDAzMywzMS44MDc5OTk3IDMuNjI1OTk5NTQsMzEuNzY2MDAwMSAzLjcxOCwzMS43MzggQzMuODEwMDAwNDYsMzEuNzA5OTk5OSAzLjkwNTk5OTUsMzEuNjk2IDQuMDA2LDMxLjY5NiBDNC4yMTQwMDEwNCwzMS42OTYgNC4zODQ5OTkzMywzMS43NTA5OTk1IDQuNTE5LDMxLjg2MSBDNC42NTMwMDA2NywzMS45NzEwMDA2IDQuNzIsMzIuMTMzOTk4OSA0LjcyLDMyLjM1IEM0LjcyLDMyLjU2NjAwMTEgNC42NTQwMDA2NiwzMi43MzM5OTk0IDQuNTIyLDMyLjg1NCBDNC4zODk5OTkzNCwzMi45NzQwMDA2IDQuMjIyMDAxMDIsMzMuMDM0IDQuMDE4LDMzLjAzNCBDMy45MTM5OTk0OCwzMy4wMzQgMy44MTYwMDA0NiwzMy4wMjAwMDAxIDMuNzI0LDMyLjk5MiBDMy42MzE5OTk1NCwzMi45NjM5OTk5IDMuNTUyMDAwMzQsMzIuOTIyMDAwMyAzLjQ4NCwzMi44NjYgQzMuNDE1OTk5NjYsMzIuODA5OTk5NyAzLjM2MjAwMDIsMzIuNzM5MDAwNCAzLjMyMiwzMi42NTMgQzMuMjgxOTk5OCwzMi41NjY5OTk2IDMuMjYyLDMyLjQ2NjAwMDYgMy4yNjIsMzIuMzUgTDMuMjYyLDMyLjM1IFogTTIuNzIyLDMyLjMzMiBDMi43MjIsMzIuNTI0MDAxIDIuNzc1OTk5NDYsMzIuNzAwOTk5MiAyLjg4NCwzMi44NjMgQzIuOTkyMDAwNTQsMzMuMDI1MDAwOCAzLjEzNTk5OTEsMzMuMTQxOTk5NiAzLjMxNiwzMy4yMTQgQzMuMDc1OTk4OCwzMy4yOTgwMDA0IDIuODkyMDAwNjQsMzMuNDMyOTk5MSAyLjc2NCwzMy42MTkgQzIuNjM1OTk5MzYsMzMuODA1MDAwOSAyLjU3MiwzNC4wMjM5OTg3IDIuNTcyLDM0LjI3NiBDMi41NzIsMzQuNDkyMDAxMSAyLjYwODk5OTYzLDM0LjY4MDk5OTIgMi42ODMsMzQuODQzIEMyLjc1NzAwMDM3LDM1LjAwNTAwMDggMi44NTg5OTkzNSwzNS4xMzk5OTk1IDIuOTg5LDM1LjI0OCBDMy4xMTkwMDA2NSwzNS4zNTYwMDA1IDMuMjcxOTk5MTIsMzUuNDM1OTk5NyAzLjQ0OCwzNS40ODggQzMuNjI0MDAwODgsMzUuNTQwMDAwMyAzLjgxMzk5ODk4LDM1LjU2NiA0LjAxOCwzNS41NjYgQzQuMjE0MDAwOTgsMzUuNTY2IDQuMzk3OTk5MTQsMzUuNTM4MDAwMyA0LjU3LDM1LjQ4MiBDNC43NDIwMDA4NiwzNS40MjU5OTk3IDQuODkwOTk5MzcsMzUuMzQzMDAwNiA1LjAxNywzNS4yMzMgQzUuMTQzMDAwNjMsMzUuMTIyOTk5NSA1LjI0Mjk5OTYzLDM0Ljk4ODAwMDggNS4zMTcsMzQuODI4IEM1LjM5MTAwMDM3LDM0LjY2Nzk5OTIgNS40MjgsMzQuNDg0MDAxIDUuNDI4LDM0LjI3NiBDNS40MjgsMzQuMDExOTk4NyA1LjM2NjAwMDYyLDMzLjc4OTAwMDkgNS4yNDIsMzMuNjA3IEM1LjExNzk5OTM4LDMzLjQyNDk5OTEgNC45MjgwMDEyOCwzMy4yOTQwMDA0IDQuNjcyLDMzLjIxNCBDNC44NTIwMDA5LDMzLjEzMzk5OTYgNC45OTQ5OTk0NywzMy4wMTUwMDA4IDUuMTAxLDMyLjg1NyBDNS4yMDcwMDA1MywzMi42OTg5OTkyIDUuMjYsMzIuNTI0MDAxIDUuMjYsMzIuMzMyIEM1LjI2LDMyLjE5NTk5OTMgNS4yMzYwMDAyNCwzMi4wNjMwMDA3IDUuMTg4LDMxLjkzMyBDNS4xMzk5OTk3NiwzMS44MDI5OTk0IDUuMDY1MDAwNTEsMzEuNjg3MDAwNSA0Ljk2MywzMS41ODUgQzQuODYwOTk5NDksMzEuNDgyOTk5NSA0LjcyODAwMDgyLDMxLjQwMTAwMDMgNC41NjQsMzEuMzM5IEM0LjM5OTk5OTE4LDMxLjI3Njk5OTcgNC4yMDIwMDExNiwzMS4yNDYgMy45NywzMS4yNDYgQzMuODA1OTk5MTgsMzEuMjQ2IDMuNjQ5MDAwNzUsMzEuMjY5OTk5OCAzLjQ5OSwzMS4zMTggQzMuMzQ4OTk5MjUsMzEuMzY2MDAwMiAzLjIxNjAwMDU4LDMxLjQzNTk5OTUgMy4xLDMxLjUyOCBDMi45ODM5OTk0MiwzMS42MjAwMDA1IDIuODkyMDAwMzQsMzEuNzMyOTk5MyAyLjgyNCwzMS44NjcgQzIuNzU1OTk5NjYsMzIuMDAxMDAwNyAyLjcyMiwzMi4xNTU5OTkxIDIuNzIyLDMyLjMzMiBMMi43MjIsMzIuMzMyIFogTTMuMTEyLDM0LjMgQzMuMTEyLDM0LjE3NTk5OTQgMy4xMzQ5OTk3NywzNC4wNjQwMDA1IDMuMTgxLDMzLjk2NCBDMy4yMjcwMDAyMywzMy44NjM5OTk1IDMuMjkwOTk5NTksMzMuNzc4MDAwNCAzLjM3MywzMy43MDYgQzMuNDU1MDAwNDEsMzMuNjMzOTk5NiAzLjU1MDk5OTQ1LDMzLjU3OTAwMDIgMy42NjEsMzMuNTQxIEMzLjc3MTAwMDU1LDMzLjUwMjk5OTggMy44ODc5OTkzOCwzMy40ODQgNC4wMTIsMzMuNDg0IEM0LjEzMjAwMDYsMzMuNDg0IDQuMjQ0OTk5NDcsMzMuNTA0OTk5OCA0LjM1MSwzMy41NDcgQzQuNDU3MDAwNTMsMzMuNTg5MDAwMiA0LjU0OTk5OTYsMzMuNjQ1OTk5NiA0LjYzLDMzLjcxOCBDNC43MTAwMDA0LDMzLjc5MDAwMDQgNC43NzI5OTk3NywzMy44NzQ5OTk1IDQuODE5LDMzLjk3MyBDNC44NjUwMDAyMywzNC4wNzEwMDA1IDQuODg4LDM0LjE3Nzk5OTQgNC44ODgsMzQuMjk0IEM0Ljg4OCwzNC40MTQwMDA2IDQuODY3MDAwMjEsMzQuNTIzOTk5NSA0LjgyNSwzNC42MjQgQzQuNzgyOTk5NzksMzQuNzI0MDAwNSA0LjcyMzAwMDM5LDM0LjgxMDk5OTYgNC42NDUsMzQuODg1IEM0LjU2Njk5OTYxLDM0Ljk1OTAwMDQgNC40NzUwMDA1MywzNS4wMTY5OTk4IDQuMzY5LDM1LjA1OSBDNC4yNjI5OTk0NywzNS4xMDEwMDAyIDQuMTQ2MDAwNjQsMzUuMTIyIDQuMDE4LDM1LjEyMiBDMy43NTM5OTg2OCwzNS4xMjIgMy41MzcwMDA4NSwzNS4wNDkwMDA3IDMuMzY3LDM0LjkwMyBDMy4xOTY5OTkxNSwzNC43NTY5OTkzIDMuMTEyLDM0LjU1NjAwMTMgMy4xMTIsMzQuMyBMMy4xMTIsMzQuMyBaJyBpZD0nOCc+PC9wYXRoPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSdNMS4xMzYsMjMuOTc0IEwwLjYyNiwyMy45NzQgQzAuNjU4MDAwMTYsMjQuMzQyMDAxOCAwLjc5MTk5ODgyLDI0LjYxNTk5OTEgMS4wMjgsMjQuNzk2IEMxLjI2NDAwMTE4LDI0Ljk3NjAwMDkgMS41NTk5OTgyMiwyNS4wNjYgMS45MTYsMjUuMDY2IEMyLjQzMjAwMjU4LDI1LjA2NiAyLjgwNjk5ODgzLDI0Ljg2OTAwMiAzLjA0MSwyNC40NzUgQzMuMjc1MDAxMTcsMjQuMDgwOTk4IDMuMzkyLDIzLjUxNjAwMzcgMy4zOTIsMjIuNzggQzMuMzkyLDIyLjM3NTk5OCAzLjM1MzAwMDM5LDIyLjA0MzAwMTMgMy4yNzUsMjEuNzgxIEMzLjE5Njk5OTYxLDIxLjUxODk5ODcgMy4wOTIwMDA2NiwyMS4zMTIwMDA4IDIuOTYsMjEuMTYgQzIuODI3OTk5MzQsMjEuMDA3OTk5MiAyLjY3NDAwMDg4LDIwLjkwMTAwMDMgMi40OTgsMjAuODM5IEMyLjMyMTk5OTEyLDIwLjc3Njk5OTcgMi4xMzQwMDEsMjAuNzQ2IDEuOTM0LDIwLjc0NiBDMS43Mjk5OTg5OCwyMC43NDYgMS41NDIwMDA4NiwyMC43Nzk5OTk3IDEuMzcsMjAuODQ4IEMxLjE5Nzk5OTE0LDIwLjkxNjAwMDMgMS4wNTAwMDA2MiwyMS4wMTA5OTk0IDAuOTI2LDIxLjEzMyBDMC44MDE5OTkzOCwyMS4yNTUwMDA2IDAuNzA2MDAwMzQsMjEuNDAwOTk5MiAwLjYzOCwyMS41NzEgQzAuNTY5OTk5NjYsMjEuNzQxMDAwOSAwLjUzNiwyMS45Mjc5OTkgMC41MzYsMjIuMTMyIEMwLjUzNiwyMi4zNDAwMDEgMC41NjQ5OTk3MSwyMi41MzE5OTkxIDAuNjIzLDIyLjcwOCBDMC42ODEwMDAyOSwyMi44ODQwMDA5IDAuNzY2OTk5NDMsMjMuMDMzOTk5NCAwLjg4MSwyMy4xNTggQzAuOTk1MDAwNTcsMjMuMjgyMDAwNiAxLjEzNTk5OTE2LDIzLjM3ODk5OTcgMS4zMDQsMjMuNDQ5IEMxLjQ3MjAwMDg0LDIzLjUxOTAwMDQgMS42NjM5OTg5MiwyMy41NTQgMS44OCwyMy41NTQgQzIuMDg4MDAxMDQsMjMuNTU0IDIuMjc5OTk5MTIsMjMuNTAxMDAwNSAyLjQ1NiwyMy4zOTUgQzIuNjMyMDAwODgsMjMuMjg4OTk5NSAyLjc2Nzk5OTUyLDIzLjE0NjAwMDkgMi44NjQsMjIuOTY2IEwyLjg3NiwyMi45NzggQzIuODU5OTk5OTIsMjMuNTM0MDAyOCAyLjc3NDAwMDc4LDIzLjk0Njk5ODcgMi42MTgsMjQuMjE3IEMyLjQ2MTk5OTIyLDI0LjQ4NzAwMTQgMi4yMjgwMDE1NiwyNC42MjIgMS45MTYsMjQuNjIyIEMxLjcxMTk5ODk4LDI0LjYyMiAxLjUzNjAwMDc0LDI0LjU2NjAwMDYgMS4zODgsMjQuNDU0IEMxLjIzOTk5OTI2LDI0LjM0MTk5OTQgMS4xNTYwMDAxLDI0LjE4MjAwMSAxLjEzNiwyMy45NzQgTDEuMTM2LDIzLjk3NCBaIE0yLjc4NiwyMi4xNjggQzIuNzg2LDIyLjI5MjAwMDYgMi43NjYwMDAyLDIyLjQxMDk5OTQgMi43MjYsMjIuNTI1IEMyLjY4NTk5OTgsMjIuNjM5MDAwNiAyLjYyODAwMDM4LDIyLjczODk5OTYgMi41NTIsMjIuODI1IEMyLjQ3NTk5OTYyLDIyLjkxMTAwMDQgMi4zODQwMDA1NCwyMi45Nzg5OTk4IDIuMjc2LDIzLjAyOSBDMi4xNjc5OTk0NiwyMy4wNzkwMDAzIDIuMDQ4MDAwNjYsMjMuMTA0IDEuOTE2LDIzLjEwNCBDMS43OTE5OTkzOCwyMy4xMDQgMS42NzkwMDA1MSwyMy4wNzkwMDAzIDEuNTc3LDIzLjAyOSBDMS40NzQ5OTk0OSwyMi45Nzg5OTk4IDEuMzg3MDAwMzcsMjIuOTEyMDAwNCAxLjMxMywyMi44MjggQzEuMjM4OTk5NjMsMjIuNzQzOTk5NiAxLjE4MTAwMDIxLDIyLjY0ODAwMDUgMS4xMzksMjIuNTQgQzEuMDk2OTk5NzksMjIuNDMxOTk5NSAxLjA3NiwyMi4zMjAwMDA2IDEuMDc2LDIyLjIwNCBDMS4wNzYsMjIuMDcxOTk5MyAxLjA5MDk5OTg1LDIxLjk0NjAwMDYgMS4xMjEsMjEuODI2IEMxLjE1MTAwMDE1LDIxLjcwNTk5OTQgMS4xOTg5OTk2NywyMS41OTkwMDA1IDEuMjY1LDIxLjUwNSBDMS4zMzEwMDAzMywyMS40MTA5OTk1IDEuNDE2OTk5NDcsMjEuMzM2MDAwMyAxLjUyMywyMS4yOCBDMS42MjkwMDA1MywyMS4yMjM5OTk3IDEuNzU3OTk5MjQsMjEuMTk2IDEuOTEsMjEuMTk2IEMyLjA1NDAwMDcyLDIxLjE5NiAyLjE3OTk5OTQ2LDIxLjIyMTk5OTcgMi4yODgsMjEuMjc0IEMyLjM5NjAwMDU0LDIxLjMyNjAwMDMgMi40ODY5OTk2MywyMS4zOTY5OTk2IDIuNTYxLDIxLjQ4NyBDMi42MzUwMDAzNywyMS41NzcwMDA1IDIuNjkwOTk5ODEsMjEuNjc5OTk5NCAyLjcyOSwyMS43OTYgQzIuNzY3MDAwMTksMjEuOTEyMDAwNiAyLjc4NiwyMi4wMzU5OTkzIDIuNzg2LDIyLjE2OCBMMi43ODYsMjIuMTY4IFonIGlkPSc5Jz48L3BhdGg+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9J00yLjgsMTUuNSBMMi44LDExLjI0NiBMMi40MSwxMS4yNDYgQzIuMzgxOTk5ODYsMTEuNDA2MDAwOCAyLjMzMDAwMDM4LDExLjUzNzk5OTUgMi4yNTQsMTEuNjQyIEMyLjE3Nzk5OTYyLDExLjc0NjAwMDUgMi4wODUwMDA1NSwxMS44Mjc5OTk3IDEuOTc1LDExLjg4OCBDMS44NjQ5OTk0NSwxMS45NDgwMDAzIDEuNzQyMDAwNjgsMTEuOTg4OTk5OSAxLjYwNiwxMi4wMTEgQzEuNDY5OTk5MzIsMTIuMDMzMDAwMSAxLjMzMDAwMDcyLDEyLjA0NCAxLjE4NiwxMi4wNDQgTDEuMTg2LDEyLjQ1MiBMMi4yOSwxMi40NTIgTDIuMjksMTUuNSBMMi44LDE1LjUgWiBNNC43OTIsMTMuNDA2IEM0Ljc5MiwxMy4zMDE5OTk1IDQuNzkyOTk5OTksMTMuMTg3MDAwNiA0Ljc5NSwxMy4wNjEgQzQuNzk3MDAwMDEsMTIuOTM0OTk5NCA0LjgwNjk5OTkxLDEyLjgwOTAwMDYgNC44MjUsMTIuNjgzIEM0Ljg0MzAwMDA5LDEyLjU1Njk5OTQgNC44Njg5OTk4MywxMi40MzQwMDA2IDQuOTAzLDEyLjMxNCBDNC45MzcwMDAxNywxMi4xOTM5OTk0IDQuOTg2OTk5NjcsMTIuMDg5MDAwNSA1LjA1MywxMS45OTkgQzUuMTE5MDAwMzMsMTEuOTA4OTk5NiA1LjIwMTk5OTUsMTEuODM2MDAwMyA1LjMwMiwxMS43OCBDNS40MDIwMDA1LDExLjcyMzk5OTcgNS41MjM5OTkyOCwxMS42OTYgNS42NjgsMTEuNjk2IEM1LjgxMjAwMDcyLDExLjY5NiA1LjkzMzk5OTUsMTEuNzIzOTk5NyA2LjAzNCwxMS43OCBDNi4xMzQwMDA1LDExLjgzNjAwMDMgNi4yMTY5OTk2NywxMS45MDg5OTk2IDYuMjgzLDExLjk5OSBDNi4zNDkwMDAzMywxMi4wODkwMDA1IDYuMzk4OTk5ODMsMTIuMTkzOTk5NCA2LjQzMywxMi4zMTQgQzYuNDY3MDAwMTcsMTIuNDM0MDAwNiA2LjQ5Mjk5OTkxLDEyLjU1Njk5OTQgNi41MTEsMTIuNjgzIEM2LjUyOTAwMDA5LDEyLjgwOTAwMDYgNi41Mzg5OTk5OSwxMi45MzQ5OTk0IDYuNTQxLDEzLjA2MSBDNi41NDMwMDAwMSwxMy4xODcwMDA2IDYuNTQ0LDEzLjMwMTk5OTUgNi41NDQsMTMuNDA2IEM2LjU0NCwxMy41NjYwMDA4IDYuNTM5MDAwMDUsMTMuNzQ0OTk5IDYuNTI5LDEzLjk0MyBDNi41MTg5OTk5NSwxNC4xNDEwMDEgNi40ODcwMDAyNywxNC4zMjY5OTkxIDYuNDMzLDE0LjUwMSBDNi4zNzg5OTk3MywxNC42NzUwMDA5IDYuMjkyMDAwNiwxNC44MjE5OTk0IDYuMTcyLDE0Ljk0MiBDNi4wNTE5OTk0LDE1LjA2MjAwMDYgNS44ODQwMDEwOCwxNS4xMjIgNS42NjgsMTUuMTIyIEM1LjQ1MTk5ODkyLDE1LjEyMiA1LjI4NDAwMDYsMTUuMDYyMDAwNiA1LjE2NCwxNC45NDIgQzUuMDQzOTk5NCwxNC44MjE5OTk0IDQuOTU3MDAwMjcsMTQuNjc1MDAwOSA0LjkwMywxNC41MDEgQzQuODQ4OTk5NzMsMTQuMzI2OTk5MSA0LjgxNzAwMDA1LDE0LjE0MTAwMSA0LjgwNywxMy45NDMgQzQuNzk2OTk5OTUsMTMuNzQ0OTk5IDQuNzkyLDEzLjU2NjAwMDggNC43OTIsMTMuNDA2IEw0Ljc5MiwxMy40MDYgWiBNNC4yNTIsMTMuNDEyIEM0LjI1MiwxMy41NjgwMDA4IDQuMjU1OTk5OTYsMTMuNzI5OTk5MiA0LjI2NCwxMy44OTggQzQuMjcyMDAwMDQsMTQuMDY2MDAwOCA0LjI5MTk5OTg0LDE0LjIyOTk5OTIgNC4zMjQsMTQuMzkgQzQuMzU2MDAwMTYsMTQuNTUwMDAwOCA0LjQwMTk5OTcsMTQuNzAwOTk5MyA0LjQ2MiwxNC44NDMgQzQuNTIyMDAwMywxNC45ODUwMDA3IDQuNjAzOTk5NDgsMTUuMTA5OTk5NSA0LjcwOCwxNS4yMTggQzQuODEyMDAwNTIsMTUuMzI2MDAwNSA0Ljk0Mjk5OTIxLDE1LjQxMDk5OTcgNS4xMDEsMTUuNDczIEM1LjI1OTAwMDc5LDE1LjUzNTAwMDMgNS40NDc5OTg5LDE1LjU2NiA1LjY2OCwxNS41NjYgQzUuODkyMDAxMTIsMTUuNTY2IDYuMDgxOTk5MjIsMTUuNTM1MDAwMyA2LjIzOCwxNS40NzMgQzYuMzk0MDAwNzgsMTUuNDEwOTk5NyA2LjUyMzk5OTQ4LDE1LjMyNjAwMDUgNi42MjgsMTUuMjE4IEM2LjczMjAwMDUyLDE1LjEwOTk5OTUgNi44MTM5OTk3LDE0Ljk4NTAwMDcgNi44NzQsMTQuODQzIEM2LjkzNDAwMDMsMTQuNzAwOTk5MyA2Ljk3OTk5OTg0LDE0LjU1MDAwMDggNy4wMTIsMTQuMzkgQzcuMDQ0MDAwMTYsMTQuMjI5OTk5MiA3LjA2Mzk5OTk2LDE0LjA2NjAwMDggNy4wNzIsMTMuODk4IEM3LjA4MDAwMDA0LDEzLjcyOTk5OTIgNy4wODQsMTMuNTY4MDAwOCA3LjA4NCwxMy40MTIgQzcuMDg0LDEzLjI1NTk5OTIgNy4wODAwMDAwNCwxMy4wOTQwMDA4IDcuMDcyLDEyLjkyNiBDNy4wNjM5OTk5NiwxMi43NTc5OTkyIDcuMDQ0MDAwMTYsMTIuNTk0MDAwOCA3LjAxMiwxMi40MzQgQzYuOTc5OTk5ODQsMTIuMjczOTk5MiA2LjkzNDAwMDMsMTIuMTIyMDAwNyA2Ljg3NCwxMS45NzggQzYuODEzOTk5NywxMS44MzM5OTkzIDYuNzMyMDAwNTIsMTEuNzA4MDAwNSA2LjYyOCwxMS42IEM2LjUyMzk5OTQ4LDExLjQ5MTk5OTUgNi4zOTMwMDA3OSwxMS40MDYwMDAzIDYuMjM1LDExLjM0MiBDNi4wNzY5OTkyMSwxMS4yNzc5OTk3IDUuODg4MDAxMSwxMS4yNDYgNS42NjgsMTEuMjQ2IEM1LjQ0Nzk5ODksMTEuMjQ2IDUuMjU5MDAwNzksMTEuMjc3OTk5NyA1LjEwMSwxMS4zNDIgQzQuOTQyOTk5MjEsMTEuNDA2MDAwMyA0LjgxMjAwMDUyLDExLjQ5MTk5OTUgNC43MDgsMTEuNiBDNC42MDM5OTk0OCwxMS43MDgwMDA1IDQuNTIyMDAwMywxMS44MzM5OTkzIDQuNDYyLDExLjk3OCBDNC40MDE5OTk3LDEyLjEyMjAwMDcgNC4zNTYwMDAxNiwxMi4yNzM5OTkyIDQuMzI0LDEyLjQzNCBDNC4yOTE5OTk4NCwxMi41OTQwMDA4IDQuMjcyMDAwMDQsMTIuNzU3OTk5MiA0LjI2NCwxMi45MjYgQzQuMjU1OTk5OTYsMTMuMDk0MDAwOCA0LjI1MiwxMy4yNTU5OTkyIDQuMjUyLDEzLjQxMiBMNC4yNTIsMTMuNDEyIFonIGlkPScxMCc+PC9wYXRoPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSdNMTAuOCw4IEwxMC44LDMuNzQ2IEwxMC40MSwzLjc0NiBDMTAuMzgxOTk5OSwzLjkwNjAwMDggMTAuMzMwMDAwNCw0LjAzNzk5OTQ4IDEwLjI1NCw0LjE0MiBDMTAuMTc3OTk5Niw0LjI0NjAwMDUyIDEwLjA4NTAwMDUsNC4zMjc5OTk3IDkuOTc1LDQuMzg4IEM5Ljg2NDk5OTQ1LDQuNDQ4MDAwMyA5Ljc0MjAwMDY4LDQuNDg4OTk5ODkgOS42MDYsNC41MTEgQzkuNDY5OTk5MzIsNC41MzMwMDAxMSA5LjMzMDAwMDcyLDQuNTQ0IDkuMTg2LDQuNTQ0IEw5LjE4Niw0Ljk1MiBMMTAuMjksNC45NTIgTDEwLjI5LDggTDEwLjgsOCBaIE0xNC4xMzYsOCBMMTQuMTM2LDMuNzQ2IEwxMy43NDYsMy43NDYgQzEzLjcxNzk5OTksMy45MDYwMDA4IDEzLjY2NjAwMDQsNC4wMzc5OTk0OCAxMy41OSw0LjE0MiBDMTMuNTEzOTk5Niw0LjI0NjAwMDUyIDEzLjQyMTAwMDUsNC4zMjc5OTk3IDEzLjMxMSw0LjM4OCBDMTMuMjAwOTk5NCw0LjQ0ODAwMDMgMTMuMDc4MDAwNyw0LjQ4ODk5OTg5IDEyLjk0Miw0LjUxMSBDMTIuODA1OTk5Myw0LjUzMzAwMDExIDEyLjY2NjAwMDcsNC41NDQgMTIuNTIyLDQuNTQ0IEwxMi41MjIsNC45NTIgTDEzLjYyNiw0Ljk1MiBMMTMuNjI2LDggTDE0LjEzNiw4IFonIGlkPScxMSc+PC9wYXRoPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSdNMjAuOCw1IEwyMC44LDAuNzQ2IEwyMC40MSwwLjc0NiBDMjAuMzgxOTk5OSwwLjkwNjAwMDggMjAuMzMwMDAwNCwxLjAzNzk5OTQ4IDIwLjI1NCwxLjE0MiBDMjAuMTc3OTk5NiwxLjI0NjAwMDUyIDIwLjA4NTAwMDUsMS4zMjc5OTk3IDE5Ljk3NSwxLjM4OCBDMTkuODY0OTk5NCwxLjQ0ODAwMDMgMTkuNzQyMDAwNywxLjQ4ODk5OTg5IDE5LjYwNiwxLjUxMSBDMTkuNDY5OTk5MywxLjUzMzAwMDExIDE5LjMzMDAwMDcsMS41NDQgMTkuMTg2LDEuNTQ0IEwxOS4xODYsMS45NTIgTDIwLjI5LDEuOTUyIEwyMC4yOSw1IEwyMC44LDUgWiBNMjIuMjY0LDIuMjUyIEwyMi43NzQsMi4yNTIgQzIyLjc3LDIuMTIzOTk5MzYgMjIuNzgyOTk5OCwxLjk5NzAwMDYzIDIyLjgxMywxLjg3MSBDMjIuODQzMDAwMSwxLjc0NDk5OTM3IDIyLjg5MTk5OTcsMS42MzIwMDA1IDIyLjk2LDEuNTMyIEMyMy4wMjgwMDAzLDEuNDMxOTk5NSAyMy4xMTQ5OTk1LDEuMzUxMDAwMzEgMjMuMjIxLDEuMjg5IEMyMy4zMjcwMDA1LDEuMjI2OTk5NjkgMjMuNDUzOTk5MywxLjE5NiAyMy42MDIsMS4xOTYgQzIzLjcxNDAwMDYsMS4xOTYgMjMuODE5OTk5NSwxLjIxMzk5OTgyIDIzLjkyLDEuMjUgQzI0LjAyMDAwMDUsMS4yODYwMDAxOCAyNC4xMDY5OTk2LDEuMzM3OTk5NjYgMjQuMTgxLDEuNDA2IEMyNC4yNTUwMDA0LDEuNDc0MDAwMzQgMjQuMzEzOTk5OCwxLjU1NDk5OTUzIDI0LjM1OCwxLjY0OSBDMjQuNDAyMDAwMiwxLjc0MzAwMDQ3IDI0LjQyNCwxLjg0Nzk5OTQyIDI0LjQyNCwxLjk2NCBDMjQuNDI0LDIuMTEyMDAwNzQgMjQuNDAxMDAwMiwyLjI0MTk5OTQ0IDI0LjM1NSwyLjM1NCBDMjQuMzA4OTk5OCwyLjQ2NjAwMDU2IDI0LjI0MTAwMDQsMi41Njk5OTk1MiAyNC4xNTEsMi42NjYgQzI0LjA2MDk5OTUsMi43NjIwMDA0OCAyMy45NDgwMDA3LDIuODU2OTk5NTMgMjMuODEyLDIuOTUxIEMyMy42NzU5OTkzLDMuMDQ1MDAwNDcgMjMuNTE4MDAwOSwzLjE0Nzk5OTQ0IDIzLjMzOCwzLjI2IEMyMy4xODk5OTkzLDMuMzQ4MDAwNDQgMjMuMDQ4MDAwNywzLjQ0MTk5OTUgMjIuOTEyLDMuNTQyIEMyMi43NzU5OTkzLDMuNjQyMDAwNSAyMi42NTQwMDA1LDMuNzU3OTk5MzQgMjIuNTQ2LDMuODkgQzIyLjQzNzk5OTUsNC4wMjIwMDA2NiAyMi4zNDkwMDAzLDQuMTc2OTk5MTEgMjIuMjc5LDQuMzU1IEMyMi4yMDg5OTk2LDQuNTMzMDAwODkgMjIuMTY0MDAwMSw0Ljc0Nzk5ODc0IDIyLjE0NCw1IEwyNC45MjIsNSBMMjQuOTIyLDQuNTUgTDIyLjczOCw0LjU1IEMyMi43NjIwMDAxLDQuNDE3OTk5MzQgMjIuODEyOTk5Niw0LjMwMTAwMDUxIDIyLjg5MSw0LjE5OSBDMjIuOTY5MDAwNCw0LjA5Njk5OTQ5IDIzLjA2Mjk5OTQsNC4wMDIwMDA0NCAyMy4xNzMsMy45MTQgQzIzLjI4MzAwMDUsMy44MjU5OTk1NiAyMy40MDM5OTkzLDMuNzQzMDAwMzkgMjMuNTM2LDMuNjY1IEMyMy42NjgwMDA3LDMuNTg2OTk5NjEgMjMuNzk5OTk5MywzLjUwODAwMDQgMjMuOTMyLDMuNDI4IEMyNC4wNjQwMDA3LDMuMzQzOTk5NTggMjQuMTkxOTk5NCwzLjI1NjAwMDQ2IDI0LjMxNiwzLjE2NCBDMjQuNDQwMDAwNiwzLjA3MTk5OTU0IDI0LjU0OTk5OTUsMi45NjkwMDA1NyAyNC42NDYsMi44NTUgQzI0Ljc0MjAwMDUsMi43NDA5OTk0MyAyNC44MTg5OTk3LDIuNjEyMDAwNzIgMjQuODc3LDIuNDY4IEMyNC45MzUwMDAzLDIuMzIzOTk5MjggMjQuOTY0LDIuMTU4MDAwOTQgMjQuOTY0LDEuOTcgQzI0Ljk2NCwxLjc2OTk5OSAyNC45MjkwMDAzLDEuNTk0MDAwNzYgMjQuODU5LDEuNDQyIEMyNC43ODg5OTk2LDEuMjg5OTk5MjQgMjQuNjk0MDAwNiwxLjE2MzAwMDUxIDI0LjU3NCwxLjA2MSBDMjQuNDUzOTk5NCwwLjk1ODk5OTQ5IDI0LjMxMzAwMDgsMC44ODEwMDAyNyAyNC4xNTEsMC44MjcgQzIzLjk4ODk5OTIsMC43NzI5OTk3MyAyMy44MTYwMDA5LDAuNzQ2IDIzLjYzMiwwLjc0NiBDMjMuNDA3OTk4OSwwLjc0NiAyMy4yMDgwMDA5LDAuNzgzOTk5NjIgMjMuMDMyLDAuODYgQzIyLjg1NTk5OTEsMC45MzYwMDAzOCAyMi43MDkwMDA2LDEuMDQwOTk5MzMgMjIuNTkxLDEuMTc1IEMyMi40NzI5OTk0LDEuMzA5MDAwNjcgMjIuMzg2MDAwMywxLjQ2Nzk5OTA4IDIyLjMzLDEuNjUyIEMyMi4yNzM5OTk3LDEuODM2MDAwOTIgMjIuMjUxOTk5OSwyLjAzNTk5ODkyIDIyLjI2NCwyLjI1MiBMMjIuMjY0LDIuMjUyIFonIGlkPScxMic+PC9wYXRoPlxuXHQgICAgICAgICAgICAgICAgICAgIDwvZz5cblx0ICAgICAgICAgICAgICAgICAgICA8cG9seWdvbiBpZD0nSG91cicgZmlsbD0nIzJBMjkyOScgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMjUuMzE5Mjk3LCAyMy42MTE5MTcpIHJvdGF0ZSgtMzguMDAwMDAwKSB0cmFuc2xhdGUoLTI1LjMxOTI5NywgLTIzLjYxMTkxNykgJyBwb2ludHM9JzI0LjgxOTI5NzIgMTUuNjExOTE2OCAyNS44MTkyOTcyIDE1LjYxMTkxNjggMjUuODE5Mjk3MiAzMS42MTE5MTY4IDI0LjgxOTI5NzIgMzEuNjExOTE2OCc+PC9wb2x5Z29uPlxuXHQgICAgICAgICAgICAgICAgICAgIDxwb2x5Z29uIGlkPSdNaW51dGUnIGZpbGw9JyMyQTI5MjknIHRyYW5zZm9ybT0ndHJhbnNsYXRlKDE5LjMyOTk0OSwgMzUuNzMwMDI4KSByb3RhdGUoNjIuMDAwMDAwKSB0cmFuc2xhdGUoLTE5LjMyOTk0OSwgLTM1LjczMDAyOCkgJyBwb2ludHM9JzE5LjA0OTQzMjEgMjQuMjk4Njk5MSAxOS45MTg0MzYzIDI0LjI5ODY5OTEgMTkuNzg3NDQwNCA0Ny4yOTg2OTkxIDE4LjkxODQzNjMgNDcuMjk4Njk5MSc+PC9wb2x5Z29uPlxuXHQgICAgICAgICAgICAgICAgICAgIDxwb2x5Z29uIGlkPSdTZWNvbmQnIGZpbGw9JyNERDQ1MjQnIHRyYW5zZm9ybT0ndHJhbnNsYXRlKDM5LjY0NDYyMSwgMzIuMTI5NDgwKSByb3RhdGUoLTc2LjAwMDAwMCkgdHJhbnNsYXRlKC0zOS42NDQ2MjEsIC0zMi4xMjk0ODApICcgcG9pbnRzPSczOC45NTIzNTY1IDE4LjI0ODIzMTUgMzkuOTIyMTEzOCAxOC4yNDgyMzE1IDM5Ljk1MjM1NjUgNDYuMjQ4MjMxNSAzOC45ODI1OTkyIDQ2LjI0ODIzMTUnPjwvcG9seWdvbj5cblx0ICAgICAgICAgICAgICAgICAgICA8Y2lyY2xlIGlkPSdPdmFsLTEzJyBmaWxsPScjMkEyOTI5JyBjeD0nMzAnIGN5PSczMCcgcj0nMS4yNSc+PC9jaXJjbGU+XG5cdCAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0nT3ZhbC0xNCcgZmlsbD0nI0RENDUyNCcgY3g9JzMwJyBjeT0nMzAnIHI9JzAuNzUnPjwvY2lyY2xlPlxuXHQgICAgICAgICAgICAgICAgPC9nPlxuXHQgICAgICAgICAgICA8L2c+XG5cdCAgICAgICAgPC9nPlxuXHQgICAgPC9nPlxuXHQ8L3N2Zz5cIlxuXHRtYXBzX2FwcDpcIjw/eG1sIHZlcnNpb249JzEuMCcgZW5jb2Rpbmc9J1VURi04JyBzdGFuZGFsb25lPSdubyc/PlxuXHQ8c3ZnIHdpZHRoPSc2MHB4JyBoZWlnaHQ9JzYwcHgnIHZpZXdCb3g9JzAgMCA2MCA2MCcgdmVyc2lvbj0nMS4xJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHhtbG5zOnhsaW5rPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJz5cblx0ICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggMzkuMSAoMzE3MjApIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPlxuXHQgICAgPHRpdGxlPk1hcHM8L3RpdGxlPlxuXHQgICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+XG5cdCAgICA8ZGVmcz5cblx0ICAgICAgICA8cGF0aCBkPSdNMzkuMDgxNSwwIEM0NS4xMDUsMCA0OC4xMTYsMCA1MS4zNTg1LDEuMDI1IEM1NC44OTg1LDIuMzEzNSA1Ny42ODY1LDUuMTAxNSA1OC45NzUsOC42NDE1IEM2MCwxMS44ODM1IDYwLDE0Ljg5NTUgNjAsMjAuOTE4NSBMNjAsMzkuMDgxNSBDNjAsNDUuMTA1IDYwLDQ4LjExNiA1OC45NzUsNTEuMzU4NSBDNTcuNjg2NSw1NC44OTg1IDU0Ljg5ODUsNTcuNjg2NSA1MS4zNTg1LDU4Ljk3NDUgQzQ4LjExNiw2MCA0NS4xMDUsNjAgMzkuMDgxNSw2MCBMMjAuOTE4NSw2MCBDMTQuODk1LDYwIDExLjg4MzUsNjAgOC42NDE1LDU4Ljk3NDUgQzUuMTAxNSw1Ny42ODY1IDIuMzEzNSw1NC44OTg1IDEuMDI1LDUxLjM1ODUgQzAsNDguMTE2IDAsNDUuMTA1IDAsMzkuMDgxNSBMMCwyMC45MTg1IEMwLDE0Ljg5NTUgMCwxMS44ODM1IDEuMDI1LDguNjQxNSBDMi4zMTM1LDUuMTAxNSA1LjEwMTUsMi4zMTM1IDguNjQxNSwxLjAyNSBDMTEuODgzNSwwIDE0Ljg5NSwwIDIwLjkxODUsMCBMMzkuMDgxNSwwIFonIGlkPSdwYXRoLTEnPjwvcGF0aD5cblx0ICAgICAgICA8cGF0aCBkPSdNLTQuNSwzMCBDLTQuNSwzMCAtNC40NzQ2MjYyNSwzMC40OTY3ODA3IC00LjQyNTExNjk1LDMwLjQ5MTI0MDEgQy0zLjQ0MjI5MDU1LDMwLjM4MTI1MDYgOS4xMDQ0NTY5NiwyOC40OTQ2OTIzIDE3LjUwNzU2ODQsMzQuNTA5Mjc3MyBDMjMuMjY4MzEwNSwzOC42MzI1Njg0IDI2LjQyMDc4LDQzLjc0OTAwODcgMzEsNDguMTg0ODE0NSBDMzYuNzkxOTkyMiw1My43OTU0MTAyIDQ0LjMzMTQwNDIsNTUuNjY4MDY2NCA1MC40MDU4MTQ0LDU2LjI1MDI5MyBDNTYuNDgwMjI0Niw1Ni44MzI1MTk1IDY1LDU2IDY1LDU2IEw2NSw2NiBDNjUsNjYgNTMuNTQ4OTYzMyw2NS4zNzY5Mzg1IDQ3LjgyMzQ4NjMsNjQuNjc4NDY2OCBDNDIuMDk4MDA5Myw2My45Nzk5OTUxIDMzLjI0NzA3MDMsNjIuMDI2MTIzIDI3LjM5MjMzNCw1Ny45MjcwMDIgQzE3Ljk5MDk2NjgsNTAuMTcyODUxNiAxOS4yNzc4NzQsNDcuODE5Mzc2MyAxMi4yOTE3NDgsNDMuMjI0NjA5NCBDNS4yNDA3MjI2NiwzOC41ODcxNTgyIC00LjUsNDAuNSAtNC41LDQwLjUgTC00LjUsMzAgWicgaWQ9J3BhdGgtMyc+PC9wYXRoPlxuXHQgICAgICAgIDxtYXNrIGlkPSdtYXNrLTQnIG1hc2tDb250ZW50VW5pdHM9J3VzZXJTcGFjZU9uVXNlJyBtYXNrVW5pdHM9J29iamVjdEJvdW5kaW5nQm94JyB4PSctMC41JyB5PSctMC41JyB3aWR0aD0nNzAuNScgaGVpZ2h0PSczNyc+XG5cdCAgICAgICAgICAgIDxyZWN0IHg9Jy01JyB5PScyOS41JyB3aWR0aD0nNzAuNScgaGVpZ2h0PSczNycgZmlsbD0nd2hpdGUnPjwvcmVjdD5cblx0ICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPScjcGF0aC0zJyBmaWxsPSdibGFjayc+PC91c2U+XG5cdCAgICAgICAgPC9tYXNrPlxuXHQgICAgICAgIDxwb2x5Z29uIGlkPSdwYXRoLTUnIHBvaW50cz0nNTAuNSA2MCA0MS41IDYwIDQxLjUgMTguODQyOTc1MiAwIDE4Ljg0Mjk3NTIgMCA5LjkxNzM1NTM3IDQxLjUgOS45MTczNTUzNyA0MS41IDAgNTAuNSAwIDUwLjUgOS45MTczNTUzNyA2MCA5LjkxNzM1NTM3IDYwIDE4Ljg0Mjk3NTIgNTAuNSAxOC44NDI5NzUyIDUwLjUgMzYuNjk0MjE0OSA2MCAzNi42OTQyMTQ5IDYwIDQ1LjYxOTgzNDcgNTAuNSA0NS42MTk4MzQ3Jz48L3BvbHlnb24+XG5cdCAgICAgICAgPG1hc2sgaWQ9J21hc2stNicgbWFza0NvbnRlbnRVbml0cz0ndXNlclNwYWNlT25Vc2UnIG1hc2tVbml0cz0nb2JqZWN0Qm91bmRpbmdCb3gnIHg9Jy0wLjUnIHk9Jy0wLjUnIHdpZHRoPSc2MScgaGVpZ2h0PSc2MSc+XG5cdCAgICAgICAgICAgIDxyZWN0IHg9Jy0wLjUnIHk9Jy0wLjUnIHdpZHRoPSc2MScgaGVpZ2h0PSc2MScgZmlsbD0nd2hpdGUnPjwvcmVjdD5cblx0ICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPScjcGF0aC01JyBmaWxsPSdibGFjayc+PC91c2U+XG5cdCAgICAgICAgPC9tYXNrPlxuXHQgICAgICAgIDxwYXRoIGQ9J00wLjUsNy41IEMwLjgxNDk2MTU0OCwxMy44NDU5MDUxIDUuMDM2Nzk2NTYsMTkuNSAxMi43NSwxOS41IEMyMC40NjMyMDM0LDE5LjUgMjQuNjMxNDc1NSwxMy44NDM5MzgxIDI1LDcuNSBDMjUuMTIzNTM1Miw1LjM3MzQxMzA5IDI0LjM2NzQzMTYsMi41NjU1NTE3NiAyMy41MDY4MTMxLDEuMjcxMDE0MiBDMjIuNDU0OTU2NSwyLjAyNTk5Mjg1IDIwLjQzNzM1NjIsMi41IDE4Ljc1LDIuNSBDMTYuMTU5NjYzMSwyLjUgMTMuNDY5Mzg0OCwxLjg4MjkyMTA2IDEyLjc1LDAuMzQ3MTMzNzk5IEMxMi4wMzA2MTUyLDEuODgyOTIxMDYgOS4zNDAzMzY4OSwyLjUgNi43NSwyLjUgQzUuMDYyNjQzODMsMi41IDMuMDQ1MDQzNDYsMi4wMjU5OTI4NSAxLjk5MzE4Njg2LDEuMjcxMDE0MiBDMS4xMzI5MzQ1NywyLjc2NDE2MDE2IDAuMzkyMDg5ODQ0LDUuMzI1ODA1NjYgMC41LDcuNSBaJyBpZD0ncGF0aC03Jz48L3BhdGg+XG5cdCAgICAgICAgPG1hc2sgaWQ9J21hc2stOCcgbWFza0NvbnRlbnRVbml0cz0ndXNlclNwYWNlT25Vc2UnIG1hc2tVbml0cz0nb2JqZWN0Qm91bmRpbmdCb3gnIHg9JzAnIHk9JzAnIHdpZHRoPScyNC41MjM3Nzg3JyBoZWlnaHQ9JzE5LjE1Mjg2NjInIGZpbGw9J3doaXRlJz5cblx0ICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPScjcGF0aC03Jz48L3VzZT5cblx0ICAgICAgICA8L21hc2s+XG5cdCAgICAgICAgPG1hc2sgaWQ9J21hc2stMTAnIG1hc2tDb250ZW50VW5pdHM9J3VzZXJTcGFjZU9uVXNlJyBtYXNrVW5pdHM9J29iamVjdEJvdW5kaW5nQm94JyB4PScwJyB5PScwJyB3aWR0aD0nMjQuNTIzNzc4NycgaGVpZ2h0PScxOS4xNTI4NjYyJyBmaWxsPSd3aGl0ZSc+XG5cdCAgICAgICAgICAgIDx1c2UgeGxpbms6aHJlZj0nI3BhdGgtNyc+PC91c2U+XG5cdCAgICAgICAgPC9tYXNrPlxuXHQgICAgICAgIDxyZWN0IGlkPSdwYXRoLTExJyB4PScwJyB5PScwLjUnIHdpZHRoPScyNScgaGVpZ2h0PSc1Jz48L3JlY3Q+XG5cdCAgICAgICAgPGZpbHRlciB4PSctNTAlJyB5PSctNTAlJyB3aWR0aD0nMjAwJScgaGVpZ2h0PScyMDAlJyBmaWx0ZXJVbml0cz0nb2JqZWN0Qm91bmRpbmdCb3gnIGlkPSdmaWx0ZXItMTInPlxuXHQgICAgICAgICAgICA8ZmVPZmZzZXQgZHg9JzAnIGR5PScxJyBpbj0nU291cmNlQWxwaGEnIHJlc3VsdD0nc2hhZG93T2Zmc2V0T3V0ZXIxJz48L2ZlT2Zmc2V0PlxuXHQgICAgICAgICAgICA8ZmVDb2xvck1hdHJpeCB2YWx1ZXM9JzAgMCAwIDAgMSAgIDAgMCAwIDAgMSAgIDAgMCAwIDAgMSAgMCAwIDAgMSAwJyB0eXBlPSdtYXRyaXgnIGluPSdzaGFkb3dPZmZzZXRPdXRlcjEnPjwvZmVDb2xvck1hdHJpeD5cblx0ICAgICAgICA8L2ZpbHRlcj5cblx0ICAgICAgICA8cGF0aCBkPSdNMC41LDcuNSBDMC44MTQ5NjE1NDgsMTMuODQ1OTA1MSA1LjAzNjc5NjU2LDE5LjUgMTIuNzUsMTkuNSBDMjAuNDYzMjAzNCwxOS41IDI0LjYzMTQ3NTUsMTMuODQzOTM4MSAyNSw3LjUgQzI1LjEyMzUzNTIsNS4zNzM0MTMwOSAyNC4zNjc0MzE2LDIuNTY1NTUxNzYgMjMuNTA2ODEzMSwxLjI3MTAxNDIgQzIyLjQ1NDk1NjUsMi4wMjU5OTI4NSAyMC40MzczNTYyLDIuNSAxOC43NSwyLjUgQzE2LjE1OTY2MzEsMi41IDEzLjQ2OTM4NDgsMS44ODI5MjEwNiAxMi43NSwwLjM0NzEzMzc5OSBDMTIuMDMwNjE1MiwxLjg4MjkyMTA2IDkuMzQwMzM2ODksMi41IDYuNzUsMi41IEM1LjA2MjY0MzgzLDIuNSAzLjA0NTA0MzQ2LDIuMDI1OTkyODUgMS45OTMxODY4NiwxLjI3MTAxNDIgQzEuMTMyOTM0NTcsMi43NjQxNjAxNiAwLjM5MjA4OTg0NCw1LjMyNTgwNTY2IDAuNSw3LjUgWicgaWQ9J3BhdGgtMTMnPjwvcGF0aD5cblx0ICAgICAgICA8bWFzayBpZD0nbWFzay0xNCcgbWFza0NvbnRlbnRVbml0cz0ndXNlclNwYWNlT25Vc2UnIG1hc2tVbml0cz0nb2JqZWN0Qm91bmRpbmdCb3gnIHg9JzAnIHk9JzAnIHdpZHRoPScyNC41MjM3Nzg3JyBoZWlnaHQ9JzE5LjE1Mjg2NjInIGZpbGw9J3doaXRlJz5cblx0ICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPScjcGF0aC0xMyc+PC91c2U+XG5cdCAgICAgICAgPC9tYXNrPlxuXHQgICAgPC9kZWZzPlxuXHQgICAgPGcgaWQ9J1BhZ2UtMScgc3Ryb2tlPSdub25lJyBzdHJva2Utd2lkdGg9JzEnIGZpbGw9J25vbmUnIGZpbGwtcnVsZT0nZXZlbm9kZCc+XG5cdCAgICAgICAgPGcgaWQ9J0hvbWUtU2NyZWVuLeKAoi1pUGhvbmUtU0UnIHRyYW5zZm9ybT0ndHJhbnNsYXRlKC0xNjguMDAwMDAwLCAtMTE1LjAwMDAwMCknPlxuXHQgICAgICAgICAgICA8ZyBpZD0nSG9tZS1TY3JlZW4t4oCiLWlQaG9uZS02cy1Db3B5JyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSgwLjAwMDAwMCwgMjcuMDAwMDAwKSc+XG5cdCAgICAgICAgICAgICAgICA8ZyBpZD0nTWFwcycgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMTY4LjAwMDAwMCwgODguMDAwMDAwKSc+XG5cdCAgICAgICAgICAgICAgICAgICAgPG1hc2sgaWQ9J21hc2stMicgZmlsbD0nd2hpdGUnPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9JyNwYXRoLTEnPjwvdXNlPlxuXHQgICAgICAgICAgICAgICAgICAgIDwvbWFzaz5cblx0ICAgICAgICAgICAgICAgICAgICA8dXNlIGlkPSdCRycgZmlsbD0nI0U0RERDOScgeGxpbms6aHJlZj0nI3BhdGgtMSc+PC91c2U+XG5cdCAgICAgICAgICAgICAgICAgICAgPHJlY3QgaWQ9J0Jsb2NrJyBmaWxsPScjNzZDNjNCJyBtYXNrPSd1cmwoI21hc2stMiknIHg9JzAnIHk9JzAnIHdpZHRoPSc0MicgaGVpZ2h0PScxMCc+PC9yZWN0PlxuXHQgICAgICAgICAgICAgICAgICAgIDxyZWN0IGlkPSdCbG9jaycgZmlsbD0nI0ZCQzZEMScgbWFzaz0ndXJsKCNtYXNrLTIpJyB4PSc0NScgeT0nMC41JyB3aWR0aD0nMTUnIGhlaWdodD0nMTAnPjwvcmVjdD5cblx0ICAgICAgICAgICAgICAgICAgICA8ZyBpZD0nSGlnaHdheScgbWFzaz0ndXJsKCNtYXNrLTIpJz5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgPHVzZSBmaWxsPScjRkZERTAyJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnIHhsaW5rOmhyZWY9JyNwYXRoLTMnPjwvdXNlPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICA8dXNlIHN0cm9rZT0nI0ZFQjMxMicgbWFzaz0ndXJsKCNtYXNrLTQpJyBzdHJva2Utd2lkdGg9JzEnIHhsaW5rOmhyZWY9JyNwYXRoLTMnPjwvdXNlPlxuXHQgICAgICAgICAgICAgICAgICAgIDwvZz5cblx0ICAgICAgICAgICAgICAgICAgICA8ZyBpZD0nTWFwJyBtYXNrPSd1cmwoI21hc2stMiknPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICA8dXNlIGZpbGw9JyNGRkZGRkYnIGZpbGwtcnVsZT0nZXZlbm9kZCcgeGxpbms6aHJlZj0nI3BhdGgtNSc+PC91c2U+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIDx1c2Ugc3Ryb2tlLW9wYWNpdHk9JzAuMScgc3Ryb2tlPScjMDAwMDAwJyBtYXNrPSd1cmwoI21hc2stNiknIHN0cm9rZS13aWR0aD0nMScgeGxpbms6aHJlZj0nI3BhdGgtNSc+PC91c2U+XG5cdCAgICAgICAgICAgICAgICAgICAgPC9nPlxuXHQgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9J000My42NTY1OTE0LDM1LjUgTDQzLjQ0ODk3OTYsMzUuNSBMNDMuNDQ4OTc5NiwxNyBMLTEsMTcgTC0xLDEyIEw0OC41LDEyIEw0OC41LDE0LjUgTDQ4LjUsMTQuNSBMNDguNSwzNS41IEw0OC4yOTIzODgyLDM1LjUgQzQ3LjU4Njg5OSwzNS4xNzg5OTYgNDYuODAxODExLDM1IDQ1Ljk3NDQ4OTgsMzUgQzQ1LjE0NzE2ODUsMzUgNDQuMzYyMDgwNiwzNS4xNzg5OTYgNDMuNjU2NTkxNCwzNS41IEw0My42NTY1OTE0LDM1LjUgWicgaWQ9J1JvdXRlJyBmaWxsPScjNDA5QkZGJyBtYXNrPSd1cmwoI21hc2stMiknPjwvcGF0aD5cblx0ICAgICAgICAgICAgICAgICAgICA8ZyBpZD0nSW5kaWNhdG9yJyBtYXNrPSd1cmwoI21hc2stMiknPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICA8ZyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSg0MC41MDAwMDAsIDM1LjUwMDAwMCknPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0nQ2lyY2xlJyBmaWxsPScjMDA3QUZGJyBjeD0nNS41JyBjeT0nNS41JyByPSc1LjUnPjwvY2lyY2xlPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBvbHlnb24gaWQ9J0Fycm93JyBmaWxsPScjRkZGRkZGJyBwb2ludHM9JzcuNzUgOC43NSA1LjUgMS42NTM4MDU5MiAzLjI1IDguNzUgNS41IDYuNjUzODA1OTInPjwvcG9seWdvbj5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgPC9nPlxuXHQgICAgICAgICAgICAgICAgICAgIDwvZz5cblx0ICAgICAgICAgICAgICAgICAgICA8ZyBpZD0nMjgwJyBtYXNrPSd1cmwoI21hc2stMiknPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICA8ZyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSg4LjAwMDAwMCwgMjIuNTAwMDAwKSc+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bWFzayBpZD0nbWFzay05JyBmaWxsPSd3aGl0ZSc+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPScjcGF0aC03Jz48L3VzZT5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbWFzaz5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxnIGlkPSdPdmFsLTIwJyBzdHJva2U9JyNGRkZGRkYnIG1hc2s9J3VybCgjbWFzay04KScgc3Ryb2tlLXdpZHRoPScxJyBmaWxsPScjMDA3QUZGJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx1c2UgbWFzaz0ndXJsKCNtYXNrLTEwKScgeGxpbms6aHJlZj0nI3BhdGgtNyc+PC91c2U+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2c+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZyBpZD0nVG9wJyBzdHJva2U9J25vbmUnIGZpbGw9J25vbmUnIG1hc2s9J3VybCgjbWFzay05KSc+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHVzZSBmaWxsPSdibGFjaycgZmlsbC1vcGFjaXR5PScxJyBmaWx0ZXI9J3VybCgjZmlsdGVyLTEyKScgeGxpbms6aHJlZj0nI3BhdGgtMTEnPjwvdXNlPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx1c2UgZmlsbD0nI0RFMUQyNicgZmlsbC1ydWxlPSdldmVub2RkJyB4bGluazpocmVmPScjcGF0aC0xMSc+PC91c2U+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2c+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZyBpZD0nU2hpZWxkJyBzdHJva2U9J25vbmUnIGZpbGw9J25vbmUnIG1hc2s9J3VybCgjbWFzay05KScgc3Ryb2tlLXdpZHRoPScxLjUnPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx1c2Ugc3Ryb2tlPScjRkZGRkZGJyBtYXNrPSd1cmwoI21hc2stMTQpJyB4bGluazpocmVmPScjcGF0aC0xMyc+PC91c2U+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2c+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSdNNS42NCw5LjM3OCBMNi40MDUsOS4zNzggQzYuMzk4OTk5OTcsOS4xODU5OTkwNCA2LjQxODQ5OTc4LDguOTk1NTAwOTUgNi40NjM1LDguODA2NSBDNi41MDg1MDAyMyw4LjYxNzQ5OTA2IDYuNTgxOTk5NDksOC40NDgwMDA3NSA2LjY4NCw4LjI5OCBDNi43ODYwMDA1MSw4LjE0Nzk5OTI1IDYuOTE2NDk5MjEsOC4wMjY1MDA0NyA3LjA3NTUsNy45MzM1IEM3LjIzNDUwMDgsNy44NDA0OTk1NCA3LjQyNDk5ODg5LDcuNzk0IDcuNjQ3LDcuNzk0IEM3LjgxNTAwMDg0LDcuNzk0IDcuOTczOTk5MjUsNy44MjA5OTk3MyA4LjEyNCw3Ljg3NSBDOC4yNzQwMDA3NSw3LjkyOTAwMDI3IDguNDA0NDk5NDUsOC4wMDY5OTk0OSA4LjUxNTUsOC4xMDkgQzguNjI2NTAwNTYsOC4yMTEwMDA1MSA4LjcxNDk5OTY3LDguMzMyNDk5MyA4Ljc4MSw4LjQ3MzUgQzguODQ3MDAwMzMsOC42MTQ1MDA3MSA4Ljg4LDguNzcxOTk5MTMgOC44OCw4Ljk0NiBDOC44OCw5LjE2ODAwMTExIDguODQ1NTAwMzUsOS4zNjI5OTkxNiA4Ljc3NjUsOS41MzEgQzguNzA3NDk5NjYsOS42OTkwMDA4NCA4LjYwNTUwMDY4LDkuODU0OTk5MjggOC40NzA1LDkuOTk5IEM4LjMzNTQ5OTMzLDEwLjE0MzAwMDcgOC4xNjYwMDEwMiwxMC4yODU0OTkzIDcuOTYyLDEwLjQyNjUgQzcuNzU3OTk4OTgsMTAuNTY3NTAwNyA3LjUyMTAwMTM1LDEwLjcyMTk5OTIgNy4yNTEsMTAuODkgQzcuMDI4OTk4ODksMTEuMDIyMDAwNyA2LjgxNjAwMTAyLDExLjE2Mjk5OTMgNi42MTIsMTEuMzEzIEM2LjQwNzk5ODk4LDExLjQ2MzAwMDggNi4yMjUwMDA4MSwxMS42MzY5OTkgNi4wNjMsMTEuODM1IEM1LjkwMDk5OTE5LDEyLjAzMzAwMSA1Ljc2NzUwMDUzLDEyLjI2NTQ5ODcgNS42NjI1LDEyLjUzMjUgQzUuNTU3NDk5NDgsMTIuNzk5NTAxMyA1LjQ5MDAwMDE1LDEzLjEyMTk5ODEgNS40NiwxMy41IEw5LjYyNywxMy41IEw5LjYyNywxMi44MjUgTDYuMzUxLDEyLjgyNSBDNi4zODcwMDAxOCwxMi42MjY5OTkgNi40NjM0OTk0MiwxMi40NTE1MDA4IDYuNTgwNSwxMi4yOTg1IEM2LjY5NzUwMDU5LDEyLjE0NTQ5OTIgNi44Mzg0OTkxOCwxMi4wMDMwMDA3IDcuMDAzNSwxMS44NzEgQzcuMTY4NTAwODMsMTEuNzM4OTk5MyA3LjM0OTk5OTAxLDExLjYxNDUwMDYgNy41NDgsMTEuNDk3NSBDNy43NDYwMDA5OSwxMS4zODA0OTk0IDcuOTQzOTk5MDEsMTEuMjYyMDAwNiA4LjE0MiwxMS4xNDIgQzguMzQwMDAwOTksMTEuMDE1OTk5NCA4LjUzMTk5OTA3LDEwLjg4NDAwMDcgOC43MTgsMTAuNzQ2IEM4LjkwNDAwMDkzLDEwLjYwNzk5OTMgOS4wNjg5OTkyOCwxMC40NTM1MDA5IDkuMjEzLDEwLjI4MjUgQzkuMzU3MDAwNzIsMTAuMTExNDk5MSA5LjQ3MjQ5OTU3LDkuOTE4MDAxMDggOS41NTk1LDkuNzAyIEM5LjY0NjUwMDQ0LDkuNDg1OTk4OTIgOS42OSw5LjIzNzAwMTQxIDkuNjksOC45NTUgQzkuNjksOC42NTQ5OTg1IDkuNjM3NTAwNTMsOC4zOTEwMDExNCA5LjUzMjUsOC4xNjMgQzkuNDI3NDk5NDgsNy45MzQ5OTg4NiA5LjI4NTAwMDksNy43NDQ1MDA3NyA5LjEwNSw3LjU5MTUgQzguOTI0OTk5MSw3LjQzODQ5OTI0IDguNzEzNTAxMjIsNy4zMjE1MDA0MSA4LjQ3MDUsNy4yNDA1IEM4LjIyNzQ5ODc5LDcuMTU5NDk5NiA3Ljk2ODAwMTM4LDcuMTE5IDcuNjkyLDcuMTE5IEM3LjM1NTk5ODMyLDcuMTE5IDcuMDU2MDAxMzIsNy4xNzU5OTk0MyA2Ljc5Miw3LjI5IEM2LjUyNzk5ODY4LDcuNDA0MDAwNTcgNi4zMDc1MDA4OSw3LjU2MTQ5OSA2LjEzMDUsNy43NjI1IEM1Ljk1MzQ5OTEyLDcuOTYzNTAxMDEgNS44MjMwMDA0Miw4LjIwMTk5ODYyIDUuNzM5LDguNDc4IEM1LjY1NDk5OTU4LDguNzU0MDAxMzggNS42MjE5OTk5MSw5LjA1Mzk5ODM4IDUuNjQsOS4zNzggTDUuNjQsOS4zNzggWiBNMTEuNjQzLDguNzc1IEMxMS42NDMsOC42MTI5OTkxOSAxMS42NzI5OTk3LDguNDcyMDAwNiAxMS43MzMsOC4zNTIgQzExLjc5MzAwMDMsOC4yMzE5OTk0IDExLjg3MjQ5OTUsOC4xMzAwMDA0MiAxMS45NzE1LDguMDQ2IEMxMi4wNzA1MDA1LDcuOTYxOTk5NTggMTIuMTg4OTk5Myw3Ljg5OTAwMDIxIDEyLjMyNyw3Ljg1NyBDMTIuNDY1MDAwNyw3LjgxNDk5OTc5IDEyLjYwODk5OTMsNy43OTQgMTIuNzU5LDcuNzk0IEMxMy4wNzEwMDE2LDcuNzk0IDEzLjMyNzQ5OSw3Ljg3NjQ5OTE4IDEzLjUyODUsOC4wNDE1IEMxMy43Mjk1MDEsOC4yMDY1MDA4MyAxMy44Myw4LjQ1MDk5ODM4IDEzLjgzLDguNzc1IEMxMy44Myw5LjA5OTAwMTYyIDEzLjczMTAwMSw5LjM1MDk5OTEgMTMuNTMzLDkuNTMxIEMxMy4zMzQ5OTksOS43MTEwMDA5IDEzLjA4MzAwMTUsOS44MDEgMTIuNzc3LDkuODAxIEMxMi42MjA5OTkyLDkuODAxIDEyLjQ3NDAwMDcsOS43ODAwMDAyMSAxMi4zMzYsOS43MzggQzEyLjE5Nzk5OTMsOS42OTU5OTk3OSAxMi4wNzgwMDA1LDkuNjMzMDAwNDIgMTEuOTc2LDkuNTQ5IEMxMS44NzM5OTk1LDkuNDY0OTk5NTggMTEuNzkzMDAwMyw5LjM1ODUwMDY1IDExLjczMyw5LjIyOTUgQzExLjY3Mjk5OTcsOS4xMDA0OTkzNiAxMS42NDMsOC45NDkwMDA4NyAxMS42NDMsOC43NzUgTDExLjY0Myw4Ljc3NSBaIE0xMC44MzMsOC43NDggQzEwLjgzMyw5LjAzNjAwMTQ0IDEwLjkxMzk5OTIsOS4zMDE0OTg3OSAxMS4wNzYsOS41NDQ1IEMxMS4yMzgwMDA4LDkuNzg3NTAxMjIgMTEuNDUzOTk4Nyw5Ljk2Mjk5OTQ2IDExLjcyNCwxMC4wNzEgQzExLjM2Mzk5ODIsMTAuMTk3MDAwNiAxMS4wODgwMDEsMTAuMzk5NDk4NiAxMC44OTYsMTAuNjc4NSBDMTAuNzAzOTk5LDEwLjk1NzUwMTQgMTAuNjA4LDExLjI4NTk5ODEgMTAuNjA4LDExLjY2NCBDMTAuNjA4LDExLjk4ODAwMTYgMTAuNjYzNDk5NCwxMi4yNzE0OTg4IDEwLjc3NDUsMTIuNTE0NSBDMTAuODg1NTAwNiwxMi43NTc1MDEyIDExLjAzODQ5OSwxMi45NTk5OTkyIDExLjIzMzUsMTMuMTIyIEMxMS40Mjg1MDEsMTMuMjg0MDAwOCAxMS42NTc5OTg3LDEzLjQwMzk5OTYgMTEuOTIyLDEzLjQ4MiBDMTIuMTg2MDAxMywxMy41NjAwMDA0IDEyLjQ3MDk5ODUsMTMuNTk5IDEyLjc3NywxMy41OTkgQzEzLjA3MTAwMTUsMTMuNTk5IDEzLjM0Njk5ODcsMTMuNTU3MDAwNCAxMy42MDUsMTMuNDczIEMxMy44NjMwMDEzLDEzLjM4ODk5OTYgMTQuMDg2NDk5MSwxMy4yNjQ1MDA4IDE0LjI3NTUsMTMuMDk5NSBDMTQuNDY0NTAwOSwxMi45MzQ0OTkyIDE0LjYxNDQ5OTQsMTIuNzMyMDAxMiAxNC43MjU1LDEyLjQ5MiBDMTQuODM2NTAwNiwxMi4yNTE5OTg4IDE0Ljg5MiwxMS45NzYwMDE2IDE0Ljg5MiwxMS42NjQgQzE0Ljg5MiwxMS4yNjc5OTggMTQuNzk5MDAwOSwxMC45MzM1MDE0IDE0LjYxMywxMC42NjA1IEMxNC40MjY5OTkxLDEwLjM4NzQ5ODYgMTQuMTQyMDAxOSwxMC4xOTEwMDA2IDEzLjc1OCwxMC4wNzEgQzE0LjAyODAwMTQsOS45NTA5OTk0IDE0LjI0MjQ5OTIsOS43NzI1MDExOSAxNC40MDE1LDkuNTM1NSBDMTQuNTYwNTAwOCw5LjI5ODQ5ODgyIDE0LjY0LDkuMDM2MDAxNDQgMTQuNjQsOC43NDggQzE0LjY0LDguNTQzOTk4OTggMTQuNjA0MDAwNCw4LjM0NDUwMDk4IDE0LjUzMiw4LjE0OTUgQzE0LjQ1OTk5OTYsNy45NTQ0OTkwMyAxNC4zNDc1MDA4LDcuNzgwNTAwNzcgMTQuMTk0NSw3LjYyNzUgQzE0LjA0MTQ5OTIsNy40NzQ0OTkyNCAxMy44NDIwMDEyLDcuMzUxNTAwNDcgMTMuNTk2LDcuMjU4NSBDMTMuMzQ5OTk4OCw3LjE2NTQ5OTU0IDEzLjA1MzAwMTcsNy4xMTkgMTIuNzA1LDcuMTE5IEMxMi40NTg5OTg4LDcuMTE5IDEyLjIyMzUwMTEsNy4xNTQ5OTk2NCAxMS45OTg1LDcuMjI3IEMxMS43NzM0OTg5LDcuMjk5MDAwMzYgMTEuNTc0MDAwOSw3LjQwMzk5OTMxIDExLjQsNy41NDIgQzExLjIyNTk5OTEsNy42ODAwMDA2OSAxMS4wODgwMDA1LDcuODQ5NDk5IDEwLjk4Niw4LjA1MDUgQzEwLjg4Mzk5OTUsOC4yNTE1MDEwMSAxMC44MzMsOC40ODM5OTg2OCAxMC44MzMsOC43NDggTDEwLjgzMyw4Ljc0OCBaIE0xMS40MTgsMTEuNyBDMTEuNDE4LDExLjUxMzk5OTEgMTEuNDUyNDk5NywxMS4zNDYwMDA4IDExLjUyMTUsMTEuMTk2IEMxMS41OTA1MDAzLDExLjA0NTk5OTMgMTEuNjg2NDk5NCwxMC45MTcwMDA1IDExLjgwOTUsMTAuODA5IEMxMS45MzI1MDA2LDEwLjcwMDk5OTUgMTIuMDc2NDk5MiwxMC42MTg1MDAzIDEyLjI0MTUsMTAuNTYxNSBDMTIuNDA2NTAwOCwxMC41MDQ0OTk3IDEyLjU4MTk5OTEsMTAuNDc2IDEyLjc2OCwxMC40NzYgQzEyLjk0ODAwMDksMTAuNDc2IDEzLjExNzQ5OTIsMTAuNTA3NDk5NyAxMy4yNzY1LDEwLjU3MDUgQzEzLjQzNTUwMDgsMTAuNjMzNTAwMyAxMy41NzQ5OTk0LDEwLjcxODk5OTUgMTMuNjk1LDEwLjgyNyBDMTMuODE1MDAwNiwxMC45MzUwMDA1IDEzLjkwOTQ5OTcsMTEuMDYyNDk5MyAxMy45Nzg1LDExLjIwOTUgQzE0LjA0NzUwMDMsMTEuMzU2NTAwNyAxNC4wODIsMTEuNTE2OTk5MSAxNC4wODIsMTEuNjkxIEMxNC4wODIsMTEuODcxMDAwOSAxNC4wNTA1MDAzLDEyLjAzNTk5OTMgMTMuOTg3NSwxMi4xODYgQzEzLjkyNDQ5OTcsMTIuMzM2MDAwOCAxMy44MzQ1MDA2LDEyLjQ2NjQ5OTQgMTMuNzE3NSwxMi41Nzc1IEMxMy42MDA0OTk0LDEyLjY4ODUwMDYgMTMuNDYyNTAwOCwxMi43NzU0OTk3IDEzLjMwMzUsMTIuODM4NSBDMTMuMTQ0NDk5MiwxMi45MDE1MDAzIDEyLjk2OTAwMSwxMi45MzMgMTIuNzc3LDEyLjkzMyBDMTIuMzgwOTk4LDEyLjkzMyAxMi4wNTU1MDEzLDEyLjgyMzUwMTEgMTEuODAwNSwxMi42MDQ1IEMxMS41NDU0OTg3LDEyLjM4NTQ5ODkgMTEuNDE4LDEyLjA4NDAwMTkgMTEuNDE4LDExLjcgTDExLjQxOCwxMS43IFogTTE2LjQ0LDEwLjM1OSBDMTYuNDQsMTAuMjAyOTk5MiAxNi40NDE1LDEwLjAzMDUwMDkgMTYuNDQ0NSw5Ljg0MTUgQzE2LjQ0NzUsOS42NTI0OTkwNiAxNi40NjI0OTk5LDkuNDYzNTAwOTUgMTYuNDg5NSw5LjI3NDUgQzE2LjUxNjUwMDEsOS4wODU0OTkwNiAxNi41NTU0OTk3LDguOTAxMDAwOSAxNi42MDY1LDguNzIxIEMxNi42NTc1MDAzLDguNTQwOTk5MSAxNi43MzI0OTk1LDguMzgzNTAwNjggMTYuODMxNSw4LjI0ODUgQzE2LjkzMDUwMDUsOC4xMTM0OTkzMyAxNy4wNTQ5OTkzLDguMDA0MDAwNDIgMTcuMjA1LDcuOTIgQzE3LjM1NTAwMDgsNy44MzU5OTk1OCAxNy41Mzc5OTg5LDcuNzk0IDE3Ljc1NCw3Ljc5NCBDMTcuOTcwMDAxMSw3Ljc5NCAxOC4xNTI5OTkzLDcuODM1OTk5NTggMTguMzAzLDcuOTIgQzE4LjQ1MzAwMDgsOC4wMDQwMDA0MiAxOC41Nzc0OTk1LDguMTEzNDk5MzMgMTguNjc2NSw4LjI0ODUgQzE4Ljc3NTUwMDUsOC4zODM1MDA2OCAxOC44NTA0OTk3LDguNTQwOTk5MSAxOC45MDE1LDguNzIxIEMxOC45NTI1MDAzLDguOTAxMDAwOSAxOC45OTE0OTk5LDkuMDg1NDk5MDYgMTkuMDE4NSw5LjI3NDUgQzE5LjA0NTUwMDEsOS40NjM1MDA5NSAxOS4wNjA1LDkuNjUyNDk5MDYgMTkuMDYzNSw5Ljg0MTUgQzE5LjA2NjUsMTAuMDMwNTAwOSAxOS4wNjgsMTAuMjAyOTk5MiAxOS4wNjgsMTAuMzU5IEMxOS4wNjgsMTAuNTk5MDAxMiAxOS4wNjA1MDAxLDEwLjg2NzQ5ODUgMTkuMDQ1NSwxMS4xNjQ1IEMxOS4wMzA0OTk5LDExLjQ2MTUwMTUgMTguOTgyNTAwNCwxMS43NDA0OTg3IDE4LjkwMTUsMTIuMDAxNSBDMTguODIwNDk5NiwxMi4yNjI1MDEzIDE4LjY5MDAwMDksMTIuNDgyOTk5MSAxOC41MSwxMi42NjMgQzE4LjMyOTk5OTEsMTIuODQzMDAwOSAxOC4wNzgwMDE2LDEyLjkzMyAxNy43NTQsMTIuOTMzIEMxNy40Mjk5OTg0LDEyLjkzMyAxNy4xNzgwMDA5LDEyLjg0MzAwMDkgMTYuOTk4LDEyLjY2MyBDMTYuODE3OTk5MSwxMi40ODI5OTkxIDE2LjY4NzUwMDQsMTIuMjYyNTAxMyAxNi42MDY1LDEyLjAwMTUgQzE2LjUyNTQ5OTYsMTEuNzQwNDk4NyAxNi40Nzc1MDAxLDExLjQ2MTUwMTUgMTYuNDYyNSwxMS4xNjQ1IEMxNi40NDc0OTk5LDEwLjg2NzQ5ODUgMTYuNDQsMTAuNTk5MDAxMiAxNi40NCwxMC4zNTkgTDE2LjQ0LDEwLjM1OSBaIE0xNS42MywxMC4zNjggQzE1LjYzLDEwLjYwMjAwMTIgMTUuNjM1OTk5OSwxMC44NDQ5OTg3IDE1LjY0OCwxMS4wOTcgQzE1LjY2MDAwMDEsMTEuMzQ5MDAxMyAxNS42ODk5OTk4LDExLjU5NDk5ODggMTUuNzM4LDExLjgzNSBDMTUuNzg2MDAwMiwxMi4wNzUwMDEyIDE1Ljg1NDk5OTYsMTIuMzAxNDk4OSAxNS45NDUsMTIuNTE0NSBDMTYuMDM1MDAwNSwxMi43Mjc1MDExIDE2LjE1Nzk5OTIsMTIuOTE0OTk5MiAxNi4zMTQsMTMuMDc3IEMxNi40NzAwMDA4LDEzLjIzOTAwMDggMTYuNjY2NDk4OCwxMy4zNjY0OTk1IDE2LjkwMzUsMTMuNDU5NSBDMTcuMTQwNTAxMiwxMy41NTI1MDA1IDE3LjQyMzk5ODQsMTMuNTk5IDE3Ljc1NCwxMy41OTkgQzE4LjA5MDAwMTcsMTMuNTk5IDE4LjM3NDk5ODgsMTMuNTUyNTAwNSAxOC42MDksMTMuNDU5NSBDMTguODQzMDAxMiwxMy4zNjY0OTk1IDE5LjAzNzk5OTIsMTMuMjM5MDAwOCAxOS4xOTQsMTMuMDc3IEMxOS4zNTAwMDA4LDEyLjkxNDk5OTIgMTkuNDcyOTk5NiwxMi43Mjc1MDExIDE5LjU2MywxMi41MTQ1IEMxOS42NTMwMDA1LDEyLjMwMTQ5ODkgMTkuNzIxOTk5OCwxMi4wNzUwMDEyIDE5Ljc3LDExLjgzNSBDMTkuODE4MDAwMiwxMS41OTQ5OTg4IDE5Ljg0Nzk5OTksMTEuMzQ5MDAxMyAxOS44NiwxMS4wOTcgQzE5Ljg3MjAwMDEsMTAuODQ0OTk4NyAxOS44NzgsMTAuNjAyMDAxMiAxOS44NzgsMTAuMzY4IEMxOS44NzgsMTAuMTMzOTk4OCAxOS44NzIwMDAxLDkuODkxMDAxMjYgMTkuODYsOS42MzkgQzE5Ljg0Nzk5OTksOS4zODY5OTg3NCAxOS44MTgwMDAyLDkuMTQxMDAxMiAxOS43Nyw4LjkwMSBDMTkuNzIxOTk5OCw4LjY2MDk5ODggMTkuNjUzMDAwNSw4LjQzMzAwMTA4IDE5LjU2Myw4LjIxNyBDMTkuNDcyOTk5Niw4LjAwMDk5ODkyIDE5LjM1MDAwMDgsNy44MTIwMDA4MSAxOS4xOTQsNy42NSBDMTkuMDM3OTk5Miw3LjQ4Nzk5OTE5IDE4Ljg0MTUwMTIsNy4zNTkwMDA0OCAxOC42MDQ1LDcuMjYzIEMxOC4zNjc0OTg4LDcuMTY2OTk5NTIgMTguMDg0MDAxNyw3LjExOSAxNy43NTQsNy4xMTkgQzE3LjQyMzk5ODQsNy4xMTkgMTcuMTQwNTAxMiw3LjE2Njk5OTUyIDE2LjkwMzUsNy4yNjMgQzE2LjY2NjQ5ODgsNy4zNTkwMDA0OCAxNi40NzAwMDA4LDcuNDg3OTk5MTkgMTYuMzE0LDcuNjUgQzE2LjE1Nzk5OTIsNy44MTIwMDA4MSAxNi4wMzUwMDA1LDguMDAwOTk4OTIgMTUuOTQ1LDguMjE3IEMxNS44NTQ5OTk2LDguNDMzMDAxMDggMTUuNzg2MDAwMiw4LjY2MDk5ODggMTUuNzM4LDguOTAxIEMxNS42ODk5OTk4LDkuMTQxMDAxMiAxNS42NjAwMDAxLDkuMzg2OTk4NzQgMTUuNjQ4LDkuNjM5IEMxNS42MzU5OTk5LDkuODkxMDAxMjYgMTUuNjMsMTAuMTMzOTk4OCAxNS42MywxMC4zNjggTDE1LjYzLDEwLjM2OCBaJyBpZD0nMjgwJyBzdHJva2U9J25vbmUnIGZpbGw9JyNGRkZGRkYnIGZpbGwtcnVsZT0nZXZlbm9kZCcgbWFzaz0ndXJsKCNtYXNrLTkpJz48L3BhdGg+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIDwvZz5cblx0ICAgICAgICAgICAgICAgICAgICA8L2c+XG5cdCAgICAgICAgICAgICAgICA8L2c+XG5cdCAgICAgICAgICAgIDwvZz5cblx0ICAgICAgICA8L2c+XG5cdCAgICA8L2c+XG5cdDwvc3ZnPlwiXG5cdG5ld3NfYXBwOlwiPD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0nVVRGLTgnIHN0YW5kYWxvbmU9J25vJz8+XG5cdDxzdmcgd2lkdGg9JzYwcHgnIGhlaWdodD0nNjBweCcgdmlld0JveD0nMCAwIDYwIDYwJyB2ZXJzaW9uPScxLjEnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgeG1sbnM6eGxpbms9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnPlxuXHQgICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCAzOS4xICgzMTcyMCkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+XG5cdCAgICA8dGl0bGU+TmV3czwvdGl0bGU+XG5cdCAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz5cblx0ICAgIDxkZWZzPlxuXHQgICAgICAgIDxsaW5lYXJHcmFkaWVudCB4MT0nNTAlJyB5MT0nMCUnIHgyPSc1MCUnIHkyPScxMDAlJyBpZD0nbGluZWFyR3JhZGllbnQtMSc+XG5cdCAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9JyNGQzUzNjMnIG9mZnNldD0nMCUnPjwvc3RvcD5cblx0ICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0nI0ZDMzM1OScgb2Zmc2V0PScxMDAlJz48L3N0b3A+XG5cdCAgICAgICAgPC9saW5lYXJHcmFkaWVudD5cblx0ICAgICAgICA8cGF0aCBkPSdNMTAuMTM2NjI0LDQ3LjM4MjM4NTMgQzExLDQ3LjM4MjM4NTMgMTEsNDYuNSAxMSw0Ni41IEwxMSwxMi4wMDUyNjE3IEMxMSwxMS40NTAwNzEgMTEuNDUzMjMwMywxMSAxMS45OTY4NzU0LDExIEw0OC4wMDMxMjQ2LDExIEM0OC41NTM2ODM3LDExIDQ5LDExLjQ0MTMwMzIgNDksMTIuMDA4ODQ5OCBMNDksNDYuOTkxMTUwMiBDNDksNDcuNTQ4MzIyNiA0OC41NDM5MjUsNDguMDAyOTAzNCA0Ny45OTY0MDc2LDQ4LjAwNjI3ODIgQzQ3Ljk5NjQwNzYsNDguMDA2Mjc4MiAxOC42MDg0ODMxLDQ4LjE5OTc1NDQgMTEuMDAwMDAwMSw0OCBDMTAuMTE3NDExMyw0Ny45NzY4Mjg0IDkuNDE2NjI1OTgsNDcuNjY4NDU3IDkuMDU3NTU2MTUsNDcuMzgyMzg1MyBDOC42OTg0ODYzMyw0Ny4wOTYzMTM1IDguMzYzMDk4MTUsNDYuNzExNjQ2MiA4LjM2MzA5ODE0LDQ2LjY2MDcwNTYgQzguMzYzMDk4MTQsNDYuNDU3NDcyIDkuMjczMjQ3OTYsNDcuMzgyMzg1MyAxMC4xMzY2MjQsNDcuMzgyMzg1MyBaJyBpZD0ncGF0aC0yJz48L3BhdGg+XG5cdCAgICAgICAgPGZpbHRlciB4PSctNTAlJyB5PSctNTAlJyB3aWR0aD0nMjAwJScgaGVpZ2h0PScyMDAlJyBmaWx0ZXJVbml0cz0nb2JqZWN0Qm91bmRpbmdCb3gnIGlkPSdmaWx0ZXItNCc+XG5cdCAgICAgICAgICAgIDxmZU9mZnNldCBkeD0nLTEnIGR5PScwJyBpbj0nU291cmNlQWxwaGEnIHJlc3VsdD0nc2hhZG93T2Zmc2V0T3V0ZXIxJz48L2ZlT2Zmc2V0PlxuXHQgICAgICAgICAgICA8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPScxJyBpbj0nc2hhZG93T2Zmc2V0T3V0ZXIxJyByZXN1bHQ9J3NoYWRvd0JsdXJPdXRlcjEnPjwvZmVHYXVzc2lhbkJsdXI+XG5cdCAgICAgICAgICAgIDxmZUNvbG9yTWF0cml4IHZhbHVlcz0nMCAwIDAgMCAwICAgMCAwIDAgMCAwICAgMCAwIDAgMCAwICAwIDAgMCAwLjI1IDAnIHR5cGU9J21hdHJpeCcgaW49J3NoYWRvd0JsdXJPdXRlcjEnPjwvZmVDb2xvck1hdHJpeD5cblx0ICAgICAgICA8L2ZpbHRlcj5cblx0ICAgIDwvZGVmcz5cblx0ICAgIDxnIGlkPSdQYWdlLTEnIHN0cm9rZT0nbm9uZScgc3Ryb2tlLXdpZHRoPScxJyBmaWxsPSdub25lJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnPlxuXHQgICAgICAgIDxnIGlkPSdIb21lLVNjcmVlbi3igKItaVBob25lLVNFJyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSgtMjQ0LjAwMDAwMCwgLTExNS4wMDAwMDApJz5cblx0ICAgICAgICAgICAgPGcgaWQ9J0hvbWUtU2NyZWVuLeKAoi1pUGhvbmUtNnMtQ29weScgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMC4wMDAwMDAsIDI3LjAwMDAwMCknPlxuXHQgICAgICAgICAgICAgICAgPGcgaWQ9J05ld3MnIHRyYW5zZm9ybT0ndHJhbnNsYXRlKDI0NC4wMDAwMDAsIDg4LjAwMDAwMCknPlxuXHQgICAgICAgICAgICAgICAgICAgIDxyZWN0IGlkPSdCRycgZmlsbD0ndXJsKCNsaW5lYXJHcmFkaWVudC0xKScgeD0nMCcgeT0nMCcgd2lkdGg9JzYwJyBoZWlnaHQ9JzYwJyByeD0nMTQnPjwvcmVjdD5cblx0ICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSdNOCw0NS45MTY1MjYyIEw4LDE2Ljk5NTM3NjQgQzgsMTYuNDQ1NjQ1MiA4LjQ1NTI2Mjg4LDE2IDguOTk1NDU3MDMsMTYgTDMyLjAwNDU0MywxNiBDMzIuNTU0MzE4NywxNiAzMywxNi40NTIzNjIxIDMzLDE2Ljk5Mjc4NjQgTDMzLDQ3LjAwNzIxMzYgQzMzLDQ3LjU1NTUxNDQgMzIuNTQ0NzM3MSw0OCAzMi4wMDQ1NDMsNDggTDEwLjk5MDc1MjIsNDggQzkuMzM5MDA1MzgsNDggOCw0Ni42NTY5NDc1IDgsNDUuOTE2NTI2MiBMOCw0NS45MTY1MjYyIFonIGlkPSdGb2xkJyBmaWxsPScjRkZGRkZGJz48L3BhdGg+XG5cdCAgICAgICAgICAgICAgICAgICAgPG1hc2sgaWQ9J21hc2stMycgZmlsbD0nd2hpdGUnPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9JyNwYXRoLTInPjwvdXNlPlxuXHQgICAgICAgICAgICAgICAgICAgIDwvbWFzaz5cblx0ICAgICAgICAgICAgICAgICAgICA8ZyBpZD0nTWFzayc+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIDx1c2UgZmlsbD0nYmxhY2snIGZpbGwtb3BhY2l0eT0nMScgZmlsdGVyPSd1cmwoI2ZpbHRlci00KScgeGxpbms6aHJlZj0nI3BhdGgtMic+PC91c2U+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIDx1c2UgZmlsbD0nI0ZGRkZGRicgZmlsbC1ydWxlPSdldmVub2RkJyB4bGluazpocmVmPScjcGF0aC0yJz48L3VzZT5cblx0ICAgICAgICAgICAgICAgICAgICA8L2c+XG5cdCAgICAgICAgICAgICAgICAgICAgPHJlY3QgaWQ9J2xpbmVzJyBmaWxsPScjQkRCREJEJyBtYXNrPSd1cmwoI21hc2stMyknIHg9JzE3JyB5PSczNScgd2lkdGg9JzMzJyBoZWlnaHQ9JzInIHJ4PScxJz48L3JlY3Q+XG5cdCAgICAgICAgICAgICAgICAgICAgPHJlY3QgaWQ9J2xpbmVzJyBmaWxsPScjQkRCREJEJyBtYXNrPSd1cmwoI21hc2stMyknIHg9JzE3JyB5PSczOScgd2lkdGg9JzMzJyBoZWlnaHQ9JzInIHJ4PScxJz48L3JlY3Q+XG5cdCAgICAgICAgICAgICAgICAgICAgPHJlY3QgaWQ9J2xpbmVzJyBmaWxsPScjQkRCREJEJyBtYXNrPSd1cmwoI21hc2stMyknIHg9JzE3JyB5PSc0Mycgd2lkdGg9JzMzJyBoZWlnaHQ9JzInIHJ4PScxJz48L3JlY3Q+XG5cdCAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0nTTE2LDIwLjEyMTMyMDMgTDE2LDE2Ljk5NzY1NjcgQzE2LDE2LjQ0NjY2NjEgMTYuNDQxMDUzNSwxNiAxNi45OTc2NTY3LDE2IEwyMC4xMjEzMjAzLDE2IEwyMCwxNi4xMjEzMjAzIEwzMSwyNy4xMjEzMjAzIEwzMSwzMC4wMDExNDM2IEMzMSwzMC41NTI3OTY4IDMwLjU1NTA2NjEsMzEgMzAuMDAxMTQzNiwzMSBMMjcuMTIxMzIwMywzMSBMMTYuMTIxMzIwMywyMCBMMTYsMjAuMTIxMzIwMyBMMTYsMjAuMTIxMzIwMyBaIE0xNiwyOS45OTk3ODA5IEMxNiwzMC41NTIxODY3IDE2LjQ1MTMyOTQsMzEgMTcuMDAwMjE5MSwzMSBMMjEuODc4NDYwNiwzMSBDMjIuNDMwODY2MywzMSAyMi41NjUyNDI3LDMwLjY4NjU2MzEgMjIuMTY4NDQ4NCwzMC4yODk3Njg4IEwxNi43MTAyMzEyLDI0LjgzMTU1MTYgQzE2LjMxNzk4MTQsMjQuNDM5MzAxNyAxNiwyNC41NzI2NDk3IDE2LDI1LjEyMTUzOTQgTDE2LDI5Ljk5OTc4MDkgWiBNMjkuOTk5NzgwOSwxNiBDMzAuNTUyMTg2NywxNiAzMSwxNi40NTEzMjk0IDMxLDE3LjAwMDIxOTEgTDMxLDIxLjg3ODQ2MDYgQzMxLDIyLjQzMDg2NjMgMzAuNjg3Mzg1NSwyMi41NjYwNjUyIDMwLjI5NTY5ODksMjIuMTc0Mzc4NSBMMjkuNTkxMzk3NywyMS40NzAwNzc0IEwyNC44MjUyMzksMTYuNzAzOTE4NiBDMjQuNDM2NDc1NCwxNi4zMTUxNTUxIDI0LjU3MjY0OTcsMTYgMjUuMTIxNTM5NCwxNiBMMjkuOTk5NzgwOSwxNiBaJyBpZD0nTG9nbycgZmlsbD0nI0ZENEM2MScgbWFzaz0ndXJsKCNtYXNrLTMpJz48L3BhdGg+XG5cdCAgICAgICAgICAgICAgICA8L2c+XG5cdCAgICAgICAgICAgIDwvZz5cblx0ICAgICAgICA8L2c+XG5cdCAgICA8L2c+XG5cdDwvc3ZnPlwiXG5cdHdhbGxldF9hcHA6XCI8P3htbCB2ZXJzaW9uPScxLjAnIGVuY29kaW5nPSdVVEYtOCcgc3RhbmRhbG9uZT0nbm8nPz5cblx0PHN2ZyB3aWR0aD0nNjBweCcgaGVpZ2h0PSc2MHB4JyB2aWV3Qm94PScwIDAgNjAgNjAnIHZlcnNpb249JzEuMScgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB4bWxuczp4bGluaz0naHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayc+XG5cdCAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDM5LjEgKDMxNzIwKSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT5cblx0ICAgIDx0aXRsZT5XYWxsZXQ8L3RpdGxlPlxuXHQgICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+XG5cdCAgICA8ZGVmcz5cblx0ICAgICAgICA8bGluZWFyR3JhZGllbnQgeDE9JzUwJScgeTE9JzAlJyB4Mj0nNTAlJyB5Mj0nMTAwJScgaWQ9J2xpbmVhckdyYWRpZW50LTEnPlxuXHQgICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPScjMUUxRTFGJyBvZmZzZXQ9JzAlJz48L3N0b3A+XG5cdCAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9JyMxRTFFMUYnIG9mZnNldD0nMTAwJSc+PC9zdG9wPlxuXHQgICAgICAgIDwvbGluZWFyR3JhZGllbnQ+XG5cdCAgICAgICAgPHJlY3QgaWQ9J3BhdGgtMicgeD0nOScgeT0nMTUnIHdpZHRoPSc0MicgaGVpZ2h0PScxMycgcng9JzInPjwvcmVjdD5cblx0ICAgICAgICA8ZmlsdGVyIHg9Jy01MCUnIHk9Jy01MCUnIHdpZHRoPScyMDAlJyBoZWlnaHQ9JzIwMCUnIGZpbHRlclVuaXRzPSdvYmplY3RCb3VuZGluZ0JveCcgaWQ9J2ZpbHRlci0zJz5cblx0ICAgICAgICAgICAgPGZlT2Zmc2V0IGR4PScwJyBkeT0nMCcgaW49J1NvdXJjZUFscGhhJyByZXN1bHQ9J3NoYWRvd09mZnNldE91dGVyMSc+PC9mZU9mZnNldD5cblx0ICAgICAgICAgICAgPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0nMC41JyBpbj0nc2hhZG93T2Zmc2V0T3V0ZXIxJyByZXN1bHQ9J3NoYWRvd0JsdXJPdXRlcjEnPjwvZmVHYXVzc2lhbkJsdXI+XG5cdCAgICAgICAgICAgIDxmZUNvbG9yTWF0cml4IHZhbHVlcz0nMCAwIDAgMCAwICAgMCAwIDAgMCAwICAgMCAwIDAgMCAwICAwIDAgMCAwLjEgMCcgdHlwZT0nbWF0cml4JyBpbj0nc2hhZG93Qmx1ck91dGVyMSc+PC9mZUNvbG9yTWF0cml4PlxuXHQgICAgICAgIDwvZmlsdGVyPlxuXHQgICAgICAgIDxyZWN0IGlkPSdwYXRoLTQnIHg9JzknIHk9JzE4JyB3aWR0aD0nNDInIGhlaWdodD0nMTMnIHJ4PScyJz48L3JlY3Q+XG5cdCAgICAgICAgPGZpbHRlciB4PSctNTAlJyB5PSctNTAlJyB3aWR0aD0nMjAwJScgaGVpZ2h0PScyMDAlJyBmaWx0ZXJVbml0cz0nb2JqZWN0Qm91bmRpbmdCb3gnIGlkPSdmaWx0ZXItNSc+XG5cdCAgICAgICAgICAgIDxmZU9mZnNldCBkeD0nMCcgZHk9JzAnIGluPSdTb3VyY2VBbHBoYScgcmVzdWx0PSdzaGFkb3dPZmZzZXRPdXRlcjEnPjwvZmVPZmZzZXQ+XG5cdCAgICAgICAgICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249JzAuNScgaW49J3NoYWRvd09mZnNldE91dGVyMScgcmVzdWx0PSdzaGFkb3dCbHVyT3V0ZXIxJz48L2ZlR2F1c3NpYW5CbHVyPlxuXHQgICAgICAgICAgICA8ZmVDb2xvck1hdHJpeCB2YWx1ZXM9JzAgMCAwIDAgMCAgIDAgMCAwIDAgMCAgIDAgMCAwIDAgMCAgMCAwIDAgMC4xIDAnIHR5cGU9J21hdHJpeCcgaW49J3NoYWRvd0JsdXJPdXRlcjEnPjwvZmVDb2xvck1hdHJpeD5cblx0ICAgICAgICA8L2ZpbHRlcj5cblx0ICAgICAgICA8cmVjdCBpZD0ncGF0aC02JyB4PSc5JyB5PScyMScgd2lkdGg9JzQyJyBoZWlnaHQ9JzEzJyByeD0nMic+PC9yZWN0PlxuXHQgICAgICAgIDxmaWx0ZXIgeD0nLTUwJScgeT0nLTUwJScgd2lkdGg9JzIwMCUnIGhlaWdodD0nMjAwJScgZmlsdGVyVW5pdHM9J29iamVjdEJvdW5kaW5nQm94JyBpZD0nZmlsdGVyLTcnPlxuXHQgICAgICAgICAgICA8ZmVPZmZzZXQgZHg9JzAnIGR5PScwJyBpbj0nU291cmNlQWxwaGEnIHJlc3VsdD0nc2hhZG93T2Zmc2V0T3V0ZXIxJz48L2ZlT2Zmc2V0PlxuXHQgICAgICAgICAgICA8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPScwLjUnIGluPSdzaGFkb3dPZmZzZXRPdXRlcjEnIHJlc3VsdD0nc2hhZG93Qmx1ck91dGVyMSc+PC9mZUdhdXNzaWFuQmx1cj5cblx0ICAgICAgICAgICAgPGZlQ29sb3JNYXRyaXggdmFsdWVzPScwIDAgMCAwIDAgICAwIDAgMCAwIDAgICAwIDAgMCAwIDAgIDAgMCAwIDAuMSAwJyB0eXBlPSdtYXRyaXgnIGluPSdzaGFkb3dCbHVyT3V0ZXIxJz48L2ZlQ29sb3JNYXRyaXg+XG5cdCAgICAgICAgPC9maWx0ZXI+XG5cdCAgICAgICAgPHJlY3QgaWQ9J3BhdGgtOCcgeD0nOScgeT0nMjUnIHdpZHRoPSc0MicgaGVpZ2h0PScxMycgcng9JzInPjwvcmVjdD5cblx0ICAgICAgICA8ZmlsdGVyIHg9Jy01MCUnIHk9Jy01MCUnIHdpZHRoPScyMDAlJyBoZWlnaHQ9JzIwMCUnIGZpbHRlclVuaXRzPSdvYmplY3RCb3VuZGluZ0JveCcgaWQ9J2ZpbHRlci05Jz5cblx0ICAgICAgICAgICAgPGZlT2Zmc2V0IGR4PScwJyBkeT0nMCcgaW49J1NvdXJjZUFscGhhJyByZXN1bHQ9J3NoYWRvd09mZnNldE91dGVyMSc+PC9mZU9mZnNldD5cblx0ICAgICAgICAgICAgPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0nMC41JyBpbj0nc2hhZG93T2Zmc2V0T3V0ZXIxJyByZXN1bHQ9J3NoYWRvd0JsdXJPdXRlcjEnPjwvZmVHYXVzc2lhbkJsdXI+XG5cdCAgICAgICAgICAgIDxmZUNvbG9yTWF0cml4IHZhbHVlcz0nMCAwIDAgMCAwICAgMCAwIDAgMCAwICAgMCAwIDAgMCAwICAwIDAgMCAwLjEgMCcgdHlwZT0nbWF0cml4JyBpbj0nc2hhZG93Qmx1ck91dGVyMSc+PC9mZUNvbG9yTWF0cml4PlxuXHQgICAgICAgIDwvZmlsdGVyPlxuXHQgICAgICAgIDxwYXRoIGQ9J003LDI4IEw3LDQyIEw1Myw0MiBMNTMsMjggTDM4LjkwNjUwNzMsMjggQzM3Ljc5ODMzMzksMjggMzYuMzA1NzU1OCwyOC42NzIyMjI5IDM1LjU1MDEyMzcsMjkuNDc4NDg4MiBDMzUuNTUwMTIzNywyOS40Nzg0ODgyIDMyLjQxODk1NzksMzMuMzA3NjkyMyAzMCwzMy4zMDc2OTIzIEMyNy41ODEwNDIxLDMzLjMwNzY5MjMgMjQuNDQ5ODc2MywyOS40Nzg0ODgyIDI0LjQ0OTg3NjMsMjkuNDc4NDg4MiBDMjMuNzA0MzcwMiwyOC42NjE5NDE3IDIyLjIxMTQ3ODEsMjggMjEuMDkzNDkyNywyOCBMNywyOCBaJyBpZD0ncGF0aC0xMCc+PC9wYXRoPlxuXHQgICAgICAgIDxmaWx0ZXIgeD0nLTUwJScgeT0nLTUwJScgd2lkdGg9JzIwMCUnIGhlaWdodD0nMjAwJScgZmlsdGVyVW5pdHM9J29iamVjdEJvdW5kaW5nQm94JyBpZD0nZmlsdGVyLTExJz5cblx0ICAgICAgICAgICAgPGZlT2Zmc2V0IGR4PScwJyBkeT0nLTEnIGluPSdTb3VyY2VBbHBoYScgcmVzdWx0PSdzaGFkb3dPZmZzZXRPdXRlcjEnPjwvZmVPZmZzZXQ+XG5cdCAgICAgICAgICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249JzEnIGluPSdzaGFkb3dPZmZzZXRPdXRlcjEnIHJlc3VsdD0nc2hhZG93Qmx1ck91dGVyMSc+PC9mZUdhdXNzaWFuQmx1cj5cblx0ICAgICAgICAgICAgPGZlQ29sb3JNYXRyaXggdmFsdWVzPScwIDAgMCAwIDAgICAwIDAgMCAwIDAgICAwIDAgMCAwIDAgIDAgMCAwIDAuMSAwJyB0eXBlPSdtYXRyaXgnIGluPSdzaGFkb3dCbHVyT3V0ZXIxJz48L2ZlQ29sb3JNYXRyaXg+XG5cdCAgICAgICAgPC9maWx0ZXI+XG5cdCAgICA8L2RlZnM+XG5cdCAgICA8ZyBpZD0nUGFnZS0xJyBzdHJva2U9J25vbmUnIHN0cm9rZS13aWR0aD0nMScgZmlsbD0nbm9uZScgZmlsbC1ydWxlPSdldmVub2RkJz5cblx0ICAgICAgICA8ZyBpZD0nSG9tZS1TY3JlZW4t4oCiLWlQaG9uZS1TRScgdHJhbnNmb3JtPSd0cmFuc2xhdGUoLTE2LjAwMDAwMCwgLTIwMy4wMDAwMDApJz5cblx0ICAgICAgICAgICAgPGcgaWQ9J0hvbWUtU2NyZWVuLeKAoi1pUGhvbmUtNnMtQ29weScgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMC4wMDAwMDAsIDI3LjAwMDAwMCknPlxuXHQgICAgICAgICAgICAgICAgPGcgaWQ9J1dhbGxldCcgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMTYuMDAwMDAwLCAxNzYuMDAwMDAwKSc+XG5cdCAgICAgICAgICAgICAgICAgICAgPHJlY3QgaWQ9J0JHJyBmaWxsPSd1cmwoI2xpbmVhckdyYWRpZW50LTEpJyB4PScwJyB5PScwJyB3aWR0aD0nNjAnIGhlaWdodD0nNjAnIHJ4PScxNCc+PC9yZWN0PlxuXHQgICAgICAgICAgICAgICAgICAgIDxyZWN0IGlkPSd3YWxsZXQnIGZpbGw9JyNEOUQ2Q0MnIHg9JzcnIHk9JzEyJyB3aWR0aD0nNDYnIGhlaWdodD0nMzQnIHJ4PSc0Jz48L3JlY3Q+XG5cdCAgICAgICAgICAgICAgICAgICAgPGcgaWQ9J2NhcmRzJz5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgPHVzZSBmaWxsPSdibGFjaycgZmlsbC1vcGFjaXR5PScxJyBmaWx0ZXI9J3VybCgjZmlsdGVyLTMpJyB4bGluazpocmVmPScjcGF0aC0yJz48L3VzZT5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgPHVzZSBmaWxsPScjM0I5OUM5JyBmaWxsLXJ1bGU9J2V2ZW5vZGQnIHhsaW5rOmhyZWY9JyNwYXRoLTInPjwvdXNlPlxuXHQgICAgICAgICAgICAgICAgICAgIDwvZz5cblx0ICAgICAgICAgICAgICAgICAgICA8ZyBpZD0nY2FyZHMnPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICA8dXNlIGZpbGw9J2JsYWNrJyBmaWxsLW9wYWNpdHk9JzEnIGZpbHRlcj0ndXJsKCNmaWx0ZXItNSknIHhsaW5rOmhyZWY9JyNwYXRoLTQnPjwvdXNlPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICA8dXNlIGZpbGw9JyNGRkIwMDMnIGZpbGwtcnVsZT0nZXZlbm9kZCcgeGxpbms6aHJlZj0nI3BhdGgtNCc+PC91c2U+XG5cdCAgICAgICAgICAgICAgICAgICAgPC9nPlxuXHQgICAgICAgICAgICAgICAgICAgIDxnIGlkPSdjYXJkcyc+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIDx1c2UgZmlsbD0nYmxhY2snIGZpbGwtb3BhY2l0eT0nMScgZmlsdGVyPSd1cmwoI2ZpbHRlci03KScgeGxpbms6aHJlZj0nI3BhdGgtNic+PC91c2U+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIDx1c2UgZmlsbD0nIzUwQkUzRCcgZmlsbC1ydWxlPSdldmVub2RkJyB4bGluazpocmVmPScjcGF0aC02Jz48L3VzZT5cblx0ICAgICAgICAgICAgICAgICAgICA8L2c+XG5cdCAgICAgICAgICAgICAgICAgICAgPGcgaWQ9J2NhcmRzJz5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgPHVzZSBmaWxsPSdibGFjaycgZmlsbC1vcGFjaXR5PScxJyBmaWx0ZXI9J3VybCgjZmlsdGVyLTkpJyB4bGluazpocmVmPScjcGF0aC04Jz48L3VzZT5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgPHVzZSBmaWxsPScjRjE2QzVFJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnIHhsaW5rOmhyZWY9JyNwYXRoLTgnPjwvdXNlPlxuXHQgICAgICAgICAgICAgICAgICAgIDwvZz5cblx0ICAgICAgICAgICAgICAgICAgICA8ZyBpZD0nQ29tYmluZWQtU2hhcGUnPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICA8dXNlIGZpbGw9J2JsYWNrJyBmaWxsLW9wYWNpdHk9JzEnIGZpbHRlcj0ndXJsKCNmaWx0ZXItMTEpJyB4bGluazpocmVmPScjcGF0aC0xMCc+PC91c2U+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIDx1c2UgZmlsbD0nI0Q5RDZDQycgZmlsbC1ydWxlPSdldmVub2RkJyB4bGluazpocmVmPScjcGF0aC0xMCc+PC91c2U+XG5cdCAgICAgICAgICAgICAgICAgICAgPC9nPlxuXHQgICAgICAgICAgICAgICAgPC9nPlxuXHQgICAgICAgICAgICA8L2c+XG5cdCAgICAgICAgPC9nPlxuXHQgICAgPC9nPlxuXHQ8L3N2Zz5cIlxuXHRub3Rlc19hcHA6XCI8P3htbCB2ZXJzaW9uPScxLjAnIGVuY29kaW5nPSdVVEYtOCcgc3RhbmRhbG9uZT0nbm8nPz5cblx0PHN2ZyB3aWR0aD0nNjBweCcgaGVpZ2h0PSc2MHB4JyB2aWV3Qm94PScwIDAgNjAgNjAnIHZlcnNpb249JzEuMScgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB4bWxuczp4bGluaz0naHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayc+XG5cdCAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDM5LjEgKDMxNzIwKSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT5cblx0ICAgIDx0aXRsZT5Ob3RlczwvdGl0bGU+XG5cdCAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz5cblx0ICAgIDxkZWZzPlxuXHQgICAgICAgIDxsaW5lYXJHcmFkaWVudCB4MT0nNTAlJyB5MT0nMCUnIHgyPSc1MCUnIHkyPScxMDAlJyBpZD0nbGluZWFyR3JhZGllbnQtMSc+XG5cdCAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9JyNGOEY4RjgnIG9mZnNldD0nMCUnPjwvc3RvcD5cblx0ICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0nI0VERURFRCcgb2Zmc2V0PScxMDAlJz48L3N0b3A+XG5cdCAgICAgICAgPC9saW5lYXJHcmFkaWVudD5cblx0ICAgICAgICA8cGF0aCBkPSdNMzkuMDgxNSwwIEM0NS4xMDUsMCA0OC4xMTYsMCA1MS4zNTg1LDEuMDI1IEM1NC44OTg1LDIuMzEzNSA1Ny42ODY1LDUuMTAxNSA1OC45NzUsOC42NDE1IEM2MCwxMS44ODM1IDYwLDE0Ljg5NTUgNjAsMjAuOTE4NSBMNjAsMzkuMDgxNSBDNjAsNDUuMTA1IDYwLDQ4LjExNiA1OC45NzUsNTEuMzU4NSBDNTcuNjg2NSw1NC44OTg1IDU0Ljg5ODUsNTcuNjg2NSA1MS4zNTg1LDU4Ljk3NDUgQzQ4LjExNiw2MCA0NS4xMDUsNjAgMzkuMDgxNSw2MCBMMjAuOTE4NSw2MCBDMTQuODk1LDYwIDExLjg4MzUsNjAgOC42NDE1LDU4Ljk3NDUgQzUuMTAxNSw1Ny42ODY1IDIuMzEzNSw1NC44OTg1IDEuMDI1LDUxLjM1ODUgQzAsNDguMTE2IDAsNDUuMTA1IDAsMzkuMDgxNSBMMCwyMC45MTg1IEMwLDE0Ljg5NTUgMCwxMS44ODM1IDEuMDI1LDguNjQxNSBDMi4zMTM1LDUuMTAxNSA1LjEwMTUsMi4zMTM1IDguNjQxNSwxLjAyNSBDMTEuODgzNSwwIDE0Ljg5NSwwIDIwLjkxODUsMCBMMzkuMDgxNSwwIFonIGlkPSdwYXRoLTInPjwvcGF0aD5cblx0ICAgICAgICA8bGluZWFyR3JhZGllbnQgeDE9JzUwJScgeTE9JzAlJyB4Mj0nNTAlJyB5Mj0nMTAwJScgaWQ9J2xpbmVhckdyYWRpZW50LTQnPlxuXHQgICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPScjRkZERjYzJyBvZmZzZXQ9JzAlJz48L3N0b3A+XG5cdCAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9JyNGRkNEMDInIG9mZnNldD0nMTAwJSc+PC9zdG9wPlxuXHQgICAgICAgIDwvbGluZWFyR3JhZGllbnQ+XG5cdCAgICAgICAgPHJlY3QgaWQ9J3BhdGgtNScgeD0nMCcgeT0nLTEnIHdpZHRoPSc2MCcgaGVpZ2h0PScyMCc+PC9yZWN0PlxuXHQgICAgICAgIDxmaWx0ZXIgeD0nLTUwJScgeT0nLTUwJScgd2lkdGg9JzIwMCUnIGhlaWdodD0nMjAwJScgZmlsdGVyVW5pdHM9J29iamVjdEJvdW5kaW5nQm94JyBpZD0nZmlsdGVyLTYnPlxuXHQgICAgICAgICAgICA8ZmVPZmZzZXQgZHg9JzAnIGR5PScwLjUnIGluPSdTb3VyY2VBbHBoYScgcmVzdWx0PSdzaGFkb3dPZmZzZXRPdXRlcjEnPjwvZmVPZmZzZXQ+XG5cdCAgICAgICAgICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249JzAuNScgaW49J3NoYWRvd09mZnNldE91dGVyMScgcmVzdWx0PSdzaGFkb3dCbHVyT3V0ZXIxJz48L2ZlR2F1c3NpYW5CbHVyPlxuXHQgICAgICAgICAgICA8ZmVDb2xvck1hdHJpeCB2YWx1ZXM9JzAgMCAwIDAgMCAgIDAgMCAwIDAgMCAgIDAgMCAwIDAgMCAgMCAwIDAgMC4zIDAnIHR5cGU9J21hdHJpeCcgaW49J3NoYWRvd0JsdXJPdXRlcjEnPjwvZmVDb2xvck1hdHJpeD5cblx0ICAgICAgICA8L2ZpbHRlcj5cblx0ICAgICAgICA8ZmlsdGVyIHg9Jy01MCUnIHk9Jy01MCUnIHdpZHRoPScyMDAlJyBoZWlnaHQ9JzIwMCUnIGZpbHRlclVuaXRzPSdvYmplY3RCb3VuZGluZ0JveCcgaWQ9J2ZpbHRlci03Jz5cblx0ICAgICAgICAgICAgPGZlT2Zmc2V0IGR4PScwJyBkeT0nLTAuNScgaW49J1NvdXJjZUFscGhhJyByZXN1bHQ9J3NoYWRvd09mZnNldElubmVyMSc+PC9mZU9mZnNldD5cblx0ICAgICAgICAgICAgPGZlQ29tcG9zaXRlIGluPSdzaGFkb3dPZmZzZXRJbm5lcjEnIGluMj0nU291cmNlQWxwaGEnIG9wZXJhdG9yPSdhcml0aG1ldGljJyBrMj0nLTEnIGszPScxJyByZXN1bHQ9J3NoYWRvd0lubmVySW5uZXIxJz48L2ZlQ29tcG9zaXRlPlxuXHQgICAgICAgICAgICA8ZmVDb2xvck1hdHJpeCB2YWx1ZXM9JzAgMCAwIDAgMCAgIDAgMCAwIDAgMCAgIDAgMCAwIDAgMCAgMCAwIDAgMC4yIDAnIHR5cGU9J21hdHJpeCcgaW49J3NoYWRvd0lubmVySW5uZXIxJz48L2ZlQ29sb3JNYXRyaXg+XG5cdCAgICAgICAgPC9maWx0ZXI+XG5cdCAgICA8L2RlZnM+XG5cdCAgICA8ZyBpZD0nUGFnZS0xJyBzdHJva2U9J25vbmUnIHN0cm9rZS13aWR0aD0nMScgZmlsbD0nbm9uZScgZmlsbC1ydWxlPSdldmVub2RkJz5cblx0ICAgICAgICA8ZyBpZD0nSG9tZS1TY3JlZW4t4oCiLWlQaG9uZS1TRScgdHJhbnNmb3JtPSd0cmFuc2xhdGUoLTkyLjAwMDAwMCwgLTIwMy4wMDAwMDApJz5cblx0ICAgICAgICAgICAgPGcgaWQ9J0hvbWUtU2NyZWVuLeKAoi1pUGhvbmUtNnMtQ29weScgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMC4wMDAwMDAsIDI3LjAwMDAwMCknPlxuXHQgICAgICAgICAgICAgICAgPGcgaWQ9J05vdGVzJyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSg5Mi4wMDAwMDAsIDE3Ni4wMDAwMDApJz5cblx0ICAgICAgICAgICAgICAgICAgICA8bWFzayBpZD0nbWFzay0zJyBmaWxsPSd3aGl0ZSc+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIDx1c2UgeGxpbms6aHJlZj0nI3BhdGgtMic+PC91c2U+XG5cdCAgICAgICAgICAgICAgICAgICAgPC9tYXNrPlxuXHQgICAgICAgICAgICAgICAgICAgIDx1c2UgaWQ9J0JHJyBmaWxsPSd1cmwoI2xpbmVhckdyYWRpZW50LTEpJyB4bGluazpocmVmPScjcGF0aC0yJz48L3VzZT5cblx0ICAgICAgICAgICAgICAgICAgICA8ZyBpZD0naGVhZGVyJyBtYXNrPSd1cmwoI21hc2stMyknPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICA8dXNlIGZpbGw9J2JsYWNrJyBmaWxsLW9wYWNpdHk9JzEnIGZpbHRlcj0ndXJsKCNmaWx0ZXItNiknIHhsaW5rOmhyZWY9JyNwYXRoLTUnPjwvdXNlPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICA8dXNlIGZpbGw9J3VybCgjbGluZWFyR3JhZGllbnQtNCknIGZpbGwtcnVsZT0nZXZlbm9kZCcgeGxpbms6aHJlZj0nI3BhdGgtNSc+PC91c2U+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIDx1c2UgZmlsbD0nYmxhY2snIGZpbGwtb3BhY2l0eT0nMScgZmlsdGVyPSd1cmwoI2ZpbHRlci03KScgeGxpbms6aHJlZj0nI3BhdGgtNSc+PC91c2U+XG5cdCAgICAgICAgICAgICAgICAgICAgPC9nPlxuXHQgICAgICAgICAgICAgICAgICAgIDxwb2x5Z29uIGlkPSdsaW5lJyBmaWxsPScjQjdCN0I3JyBtYXNrPSd1cmwoI21hc2stMyknIHBvaW50cz0nNTkuNzUgMzAuNSA2MCAzMC41IDYwIDMwIDU5Ljc1IDMwIC0wLjI1IDMwIC0wLjUgMzAgLTAuNSAzMC41IC0wLjI1IDMwLjUnPjwvcG9seWdvbj5cblx0ICAgICAgICAgICAgICAgICAgICA8cG9seWdvbiBpZD0nbGluZScgZmlsbD0nI0I3QjdCNycgbWFzaz0ndXJsKCNtYXNrLTMpJyBwb2ludHM9JzU5Ljc1IDQxLjUgNjAgNDEuNSA2MCA0MSA1OS43NSA0MSAtMC4yNSA0MSAtMC41IDQxIC0wLjUgNDEuNSAtMC4yNSA0MS41Jz48L3BvbHlnb24+XG5cdCAgICAgICAgICAgICAgICAgICAgPHBvbHlnb24gaWQ9J2xpbmUnIGZpbGw9JyNCN0I3QjcnIG1hc2s9J3VybCgjbWFzay0zKScgcG9pbnRzPSc1OS43NSA1MyA2MCA1MyA2MCA1Mi41IDU5Ljc1IDUyLjUgLTAuMjUgNTIuNSAtMC41IDUyLjUgLTAuNSA1MyAtMC4yNSA1Myc+PC9wb2x5Z29uPlxuXHQgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9J001OC41LDIyIEw1OS41LDIyIEw1OS41LDIzIEw1OC41LDIzIEw1OC41LDIyIEw1OC41LDIyIFogTTU2LjUsMjIgTDU3LjUsMjIgTDU3LjUsMjMgTDU2LjUsMjMgTDU2LjUsMjIgTDU2LjUsMjIgWiBNNTQuNSwyMiBMNTUuNSwyMiBMNTUuNSwyMyBMNTQuNSwyMyBMNTQuNSwyMiBMNTQuNSwyMiBaIE01Mi41LDIyIEw1My41LDIyIEw1My41LDIzIEw1Mi41LDIzIEw1Mi41LDIyIEw1Mi41LDIyIFogTTUwLjUsMjIgTDUxLjUsMjIgTDUxLjUsMjMgTDUwLjUsMjMgTDUwLjUsMjIgTDUwLjUsMjIgWiBNNDguNSwyMiBMNDkuNSwyMiBMNDkuNSwyMyBMNDguNSwyMyBMNDguNSwyMiBMNDguNSwyMiBaIE00Ni41LDIyIEw0Ny41LDIyIEw0Ny41LDIzIEw0Ni41LDIzIEw0Ni41LDIyIEw0Ni41LDIyIFogTTQ0LjUsMjIgTDQ1LjUsMjIgTDQ1LjUsMjMgTDQ0LjUsMjMgTDQ0LjUsMjIgTDQ0LjUsMjIgWiBNNDIuNSwyMiBMNDMuNSwyMiBMNDMuNSwyMyBMNDIuNSwyMyBMNDIuNSwyMiBMNDIuNSwyMiBaIE00MC41LDIyIEw0MS41LDIyIEw0MS41LDIzIEw0MC41LDIzIEw0MC41LDIyIEw0MC41LDIyIFogTTM4LjUsMjIgTDM5LjUsMjIgTDM5LjUsMjMgTDM4LjUsMjMgTDM4LjUsMjIgTDM4LjUsMjIgWiBNMzYuNSwyMiBMMzcuNSwyMiBMMzcuNSwyMyBMMzYuNSwyMyBMMzYuNSwyMiBMMzYuNSwyMiBaIE0zNC41LDIyIEwzNS41LDIyIEwzNS41LDIzIEwzNC41LDIzIEwzNC41LDIyIEwzNC41LDIyIFogTTMyLjUsMjIgTDMzLjUsMjIgTDMzLjUsMjMgTDMyLjUsMjMgTDMyLjUsMjIgTDMyLjUsMjIgWiBNMzAuNSwyMiBMMzEuNSwyMiBMMzEuNSwyMyBMMzAuNSwyMyBMMzAuNSwyMiBMMzAuNSwyMiBaIE0yOC41LDIyIEwyOS41LDIyIEwyOS41LDIzIEwyOC41LDIzIEwyOC41LDIyIEwyOC41LDIyIFogTTI2LjUsMjIgTDI3LjUsMjIgTDI3LjUsMjMgTDI2LjUsMjMgTDI2LjUsMjIgTDI2LjUsMjIgWiBNMjQuNSwyMiBMMjUuNSwyMiBMMjUuNSwyMyBMMjQuNSwyMyBMMjQuNSwyMiBMMjQuNSwyMiBaIE0yMi41LDIyIEwyMy41LDIyIEwyMy41LDIzIEwyMi41LDIzIEwyMi41LDIyIEwyMi41LDIyIFogTTIwLjUsMjIgTDIxLjUsMjIgTDIxLjUsMjMgTDIwLjUsMjMgTDIwLjUsMjIgTDIwLjUsMjIgWiBNMTguNSwyMiBMMTkuNSwyMiBMMTkuNSwyMyBMMTguNSwyMyBMMTguNSwyMiBMMTguNSwyMiBaIE0xNi41LDIyIEwxNy41LDIyIEwxNy41LDIzIEwxNi41LDIzIEwxNi41LDIyIEwxNi41LDIyIFogTTE0LjUsMjIgTDE1LjUsMjIgTDE1LjUsMjMgTDE0LjUsMjMgTDE0LjUsMjIgTDE0LjUsMjIgWiBNMTIuNSwyMiBMMTMuNSwyMiBMMTMuNSwyMyBMMTIuNSwyMyBMMTIuNSwyMiBMMTIuNSwyMiBaIE0xMC41LDIyIEwxMS41LDIyIEwxMS41LDIzIEwxMC41LDIzIEwxMC41LDIyIEwxMC41LDIyIFogTTguNSwyMiBMOS41LDIyIEw5LjUsMjMgTDguNSwyMyBMOC41LDIyIEw4LjUsMjIgWiBNNi41LDIyIEw3LjUsMjIgTDcuNSwyMyBMNi41LDIzIEw2LjUsMjIgTDYuNSwyMiBaIE00LjUsMjIgTDUuNSwyMiBMNS41LDIzIEw0LjUsMjMgTDQuNSwyMiBMNC41LDIyIFogTTIuNSwyMiBMMy41LDIyIEwzLjUsMjMgTDIuNSwyMyBMMi41LDIyIEwyLjUsMjIgWiBNMC41LDIyIEwxLjUsMjIgTDEuNSwyMyBMMC41LDIzIEwwLjUsMjIgTDAuNSwyMiBaJyBpZD0nUmVjdGFuZ2xlLTM3JyBmaWxsPScjQUFBQUFBJyBtYXNrPSd1cmwoI21hc2stMyknPjwvcGF0aD5cblx0ICAgICAgICAgICAgICAgIDwvZz5cblx0ICAgICAgICAgICAgPC9nPlxuXHQgICAgICAgIDwvZz5cblx0ICAgIDwvZz5cblx0PC9zdmc+XCJcblx0cmVtaW5kZXJzX2FwcDpcIjw/eG1sIHZlcnNpb249JzEuMCcgZW5jb2Rpbmc9J1VURi04JyBzdGFuZGFsb25lPSdubyc/PlxuXHQ8c3ZnIHdpZHRoPSc2MHB4JyBoZWlnaHQ9JzYwcHgnIHZpZXdCb3g9JzAgMCA2MCA2MCcgdmVyc2lvbj0nMS4xJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHhtbG5zOnhsaW5rPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJz5cblx0ICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggMzkuMSAoMzE3MjApIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPlxuXHQgICAgPHRpdGxlPm1pbjwvdGl0bGU+XG5cdCAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz5cblx0ICAgIDxkZWZzPlxuXHQgICAgICAgIDxyZWN0IGlkPSdwYXRoLTEnIHg9JzAnIHk9JzAnIHdpZHRoPSc2MCcgaGVpZ2h0PSc2MCcgcng9JzE0Jz48L3JlY3Q+XG5cdCAgICAgICAgPGNpcmNsZSBpZD0ncGF0aC0zJyBjeD0nMTAnIGN5PScxMicgcj0nNCc+PC9jaXJjbGU+XG5cdCAgICAgICAgPG1hc2sgaWQ9J21hc2stNCcgbWFza0NvbnRlbnRVbml0cz0ndXNlclNwYWNlT25Vc2UnIG1hc2tVbml0cz0nb2JqZWN0Qm91bmRpbmdCb3gnIHg9JzAnIHk9JzAnIHdpZHRoPSc4JyBoZWlnaHQ9JzgnIGZpbGw9J3doaXRlJz5cblx0ICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPScjcGF0aC0zJz48L3VzZT5cblx0ICAgICAgICA8L21hc2s+XG5cdCAgICAgICAgPG1hc2sgaWQ9J21hc2stNScgbWFza0NvbnRlbnRVbml0cz0ndXNlclNwYWNlT25Vc2UnIG1hc2tVbml0cz0nb2JqZWN0Qm91bmRpbmdCb3gnIHg9Jy0wLjUnIHk9Jy0wLjUnIHdpZHRoPSc5JyBoZWlnaHQ9JzknPlxuXHQgICAgICAgICAgICA8cmVjdCB4PSc1LjUnIHk9JzcuNScgd2lkdGg9JzknIGhlaWdodD0nOScgZmlsbD0nd2hpdGUnPjwvcmVjdD5cblx0ICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPScjcGF0aC0zJyBmaWxsPSdibGFjayc+PC91c2U+XG5cdCAgICAgICAgPC9tYXNrPlxuXHQgICAgICAgIDxjaXJjbGUgaWQ9J3BhdGgtNicgY3g9JzEwJyBjeT0nMjMnIHI9JzQnPjwvY2lyY2xlPlxuXHQgICAgICAgIDxtYXNrIGlkPSdtYXNrLTcnIG1hc2tDb250ZW50VW5pdHM9J3VzZXJTcGFjZU9uVXNlJyBtYXNrVW5pdHM9J29iamVjdEJvdW5kaW5nQm94JyB4PScwJyB5PScwJyB3aWR0aD0nOCcgaGVpZ2h0PSc4JyBmaWxsPSd3aGl0ZSc+XG5cdCAgICAgICAgICAgIDx1c2UgeGxpbms6aHJlZj0nI3BhdGgtNic+PC91c2U+XG5cdCAgICAgICAgPC9tYXNrPlxuXHQgICAgICAgIDxtYXNrIGlkPSdtYXNrLTgnIG1hc2tDb250ZW50VW5pdHM9J3VzZXJTcGFjZU9uVXNlJyBtYXNrVW5pdHM9J29iamVjdEJvdW5kaW5nQm94JyB4PSctMC41JyB5PSctMC41JyB3aWR0aD0nOScgaGVpZ2h0PSc5Jz5cblx0ICAgICAgICAgICAgPHJlY3QgeD0nNS41JyB5PScxOC41JyB3aWR0aD0nOScgaGVpZ2h0PSc5JyBmaWxsPSd3aGl0ZSc+PC9yZWN0PlxuXHQgICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9JyNwYXRoLTYnIGZpbGw9J2JsYWNrJz48L3VzZT5cblx0ICAgICAgICA8L21hc2s+XG5cdCAgICAgICAgPGNpcmNsZSBpZD0ncGF0aC05JyBjeD0nMTAnIGN5PSczNScgcj0nNCc+PC9jaXJjbGU+XG5cdCAgICAgICAgPG1hc2sgaWQ9J21hc2stMTAnIG1hc2tDb250ZW50VW5pdHM9J3VzZXJTcGFjZU9uVXNlJyBtYXNrVW5pdHM9J29iamVjdEJvdW5kaW5nQm94JyB4PScwJyB5PScwJyB3aWR0aD0nOCcgaGVpZ2h0PSc4JyBmaWxsPSd3aGl0ZSc+XG5cdCAgICAgICAgICAgIDx1c2UgeGxpbms6aHJlZj0nI3BhdGgtOSc+PC91c2U+XG5cdCAgICAgICAgPC9tYXNrPlxuXHQgICAgICAgIDxtYXNrIGlkPSdtYXNrLTExJyBtYXNrQ29udGVudFVuaXRzPSd1c2VyU3BhY2VPblVzZScgbWFza1VuaXRzPSdvYmplY3RCb3VuZGluZ0JveCcgeD0nLTAuNScgeT0nLTAuNScgd2lkdGg9JzknIGhlaWdodD0nOSc+XG5cdCAgICAgICAgICAgIDxyZWN0IHg9JzUuNScgeT0nMzAuNScgd2lkdGg9JzknIGhlaWdodD0nOScgZmlsbD0nd2hpdGUnPjwvcmVjdD5cblx0ICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPScjcGF0aC05JyBmaWxsPSdibGFjayc+PC91c2U+XG5cdCAgICAgICAgPC9tYXNrPlxuXHQgICAgICAgIDxjaXJjbGUgaWQ9J3BhdGgtMTInIGN4PScxMCcgY3k9JzQ2JyByPSc0Jz48L2NpcmNsZT5cblx0ICAgICAgICA8bWFzayBpZD0nbWFzay0xMycgbWFza0NvbnRlbnRVbml0cz0ndXNlclNwYWNlT25Vc2UnIG1hc2tVbml0cz0nb2JqZWN0Qm91bmRpbmdCb3gnIHg9JzAnIHk9JzAnIHdpZHRoPSc4JyBoZWlnaHQ9JzgnIGZpbGw9J3doaXRlJz5cblx0ICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPScjcGF0aC0xMic+PC91c2U+XG5cdCAgICAgICAgPC9tYXNrPlxuXHQgICAgICAgIDxtYXNrIGlkPSdtYXNrLTE0JyBtYXNrQ29udGVudFVuaXRzPSd1c2VyU3BhY2VPblVzZScgbWFza1VuaXRzPSdvYmplY3RCb3VuZGluZ0JveCcgeD0nLTAuNScgeT0nLTAuNScgd2lkdGg9JzknIGhlaWdodD0nOSc+XG5cdCAgICAgICAgICAgIDxyZWN0IHg9JzUuNScgeT0nNDEuNScgd2lkdGg9JzknIGhlaWdodD0nOScgZmlsbD0nd2hpdGUnPjwvcmVjdD5cblx0ICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPScjcGF0aC0xMicgZmlsbD0nYmxhY2snPjwvdXNlPlxuXHQgICAgICAgIDwvbWFzaz5cblx0ICAgIDwvZGVmcz5cblx0ICAgIDxnIGlkPSdQYWdlLTEnIHN0cm9rZT0nbm9uZScgc3Ryb2tlLXdpZHRoPScxJyBmaWxsPSdub25lJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnPlxuXHQgICAgICAgIDxnIGlkPSdIb21lLVNjcmVlbi3igKItaVBob25lLVNFJyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSgtMTY4LjAwMDAwMCwgLTIwMy4wMDAwMDApJz5cblx0ICAgICAgICAgICAgPGcgaWQ9J0hvbWUtU2NyZWVuLeKAoi1pUGhvbmUtNnMtQ29weScgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMC4wMDAwMDAsIDI3LjAwMDAwMCknPlxuXHQgICAgICAgICAgICAgICAgPGcgaWQ9J21pbicgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMTY4LjAwMDAwMCwgMTc2LjAwMDAwMCknPlxuXHQgICAgICAgICAgICAgICAgICAgIDxtYXNrIGlkPSdtYXNrLTInIGZpbGw9J3doaXRlJz5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPScjcGF0aC0xJz48L3VzZT5cblx0ICAgICAgICAgICAgICAgICAgICA8L21hc2s+XG5cdCAgICAgICAgICAgICAgICAgICAgPHVzZSBpZD0nQkcnIGZpbGw9JyNGRkZGRkYnIHhsaW5rOmhyZWY9JyNwYXRoLTEnPjwvdXNlPlxuXHQgICAgICAgICAgICAgICAgICAgIDxnIGlkPSdjaXJjbGUnIG1hc2s9J3VybCgjbWFzay0yKSc+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIDx1c2Ugc3Ryb2tlPScjRkZGRkZGJyBtYXNrPSd1cmwoI21hc2stNCknIGZpbGw9JyNGRjk1MDAnIGZpbGwtcnVsZT0nZXZlbm9kZCcgeGxpbms6aHJlZj0nI3BhdGgtMyc+PC91c2U+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIDx1c2Ugc3Ryb2tlPScjRkY5NTAwJyBtYXNrPSd1cmwoI21hc2stNSknIHhsaW5rOmhyZWY9JyNwYXRoLTMnPjwvdXNlPlxuXHQgICAgICAgICAgICAgICAgICAgIDwvZz5cblx0ICAgICAgICAgICAgICAgICAgICA8ZyBpZD0nY2lyY2xlJyBtYXNrPSd1cmwoI21hc2stMiknPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICA8dXNlIHN0cm9rZT0nI0ZGRkZGRicgbWFzaz0ndXJsKCNtYXNrLTcpJyBmaWxsPScjMUJBREY4JyBmaWxsLXJ1bGU9J2V2ZW5vZGQnIHhsaW5rOmhyZWY9JyNwYXRoLTYnPjwvdXNlPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICA8dXNlIHN0cm9rZT0nIzFCQURGOCcgbWFzaz0ndXJsKCNtYXNrLTgpJyB4bGluazpocmVmPScjcGF0aC02Jz48L3VzZT5cblx0ICAgICAgICAgICAgICAgICAgICA8L2c+XG5cdCAgICAgICAgICAgICAgICAgICAgPGcgaWQ9J2NpcmNsZScgbWFzaz0ndXJsKCNtYXNrLTIpJz5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgPHVzZSBzdHJva2U9JyNGRkZGRkYnIG1hc2s9J3VybCgjbWFzay0xMCknIGZpbGw9JyM2M0RBMzgnIGZpbGwtcnVsZT0nZXZlbm9kZCcgeGxpbms6aHJlZj0nI3BhdGgtOSc+PC91c2U+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIDx1c2Ugc3Ryb2tlPScjNjNEQTM4JyBtYXNrPSd1cmwoI21hc2stMTEpJyB4bGluazpocmVmPScjcGF0aC05Jz48L3VzZT5cblx0ICAgICAgICAgICAgICAgICAgICA8L2c+XG5cdCAgICAgICAgICAgICAgICAgICAgPGcgaWQ9J2NpcmNsZScgbWFzaz0ndXJsKCNtYXNrLTIpJz5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgPHVzZSBzdHJva2U9JyNGRkZGRkYnIG1hc2s9J3VybCgjbWFzay0xMyknIGZpbGw9JyNDQzczRTEnIGZpbGwtcnVsZT0nZXZlbm9kZCcgeGxpbms6aHJlZj0nI3BhdGgtMTInPjwvdXNlPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICA8dXNlIHN0cm9rZT0nI0NDNzNFMScgbWFzaz0ndXJsKCNtYXNrLTE0KScgeGxpbms6aHJlZj0nI3BhdGgtMTInPjwvdXNlPlxuXHQgICAgICAgICAgICAgICAgICAgIDwvZz5cblx0ICAgICAgICAgICAgICAgICAgICA8cmVjdCBpZD0nbGluZScgZmlsbD0nI0FFQUVBRScgbWFzaz0ndXJsKCNtYXNrLTIpJyB4PScxOScgeT0nMTcuNScgd2lkdGg9JzQxJyBoZWlnaHQ9JzAuNSc+PC9yZWN0PlxuXHQgICAgICAgICAgICAgICAgICAgIDxyZWN0IGlkPSdsaW5lJyBmaWxsPScjQUVBRUFFJyBtYXNrPSd1cmwoI21hc2stMiknIHg9JzE5JyB5PSc2JyB3aWR0aD0nNDEnIGhlaWdodD0nMC41Jz48L3JlY3Q+XG5cdCAgICAgICAgICAgICAgICAgICAgPHJlY3QgaWQ9J2xpbmUnIGZpbGw9JyNBRUFFQUUnIG1hc2s9J3VybCgjbWFzay0yKScgeD0nMTknIHk9JzI5JyB3aWR0aD0nNDEnIGhlaWdodD0nMC41Jz48L3JlY3Q+XG5cdCAgICAgICAgICAgICAgICAgICAgPHJlY3QgaWQ9J2xpbmUnIGZpbGw9JyNBRUFFQUUnIG1hc2s9J3VybCgjbWFzay0yKScgeD0nMTknIHk9JzQwJyB3aWR0aD0nNDEnIGhlaWdodD0nMC41Jz48L3JlY3Q+XG5cdCAgICAgICAgICAgICAgICAgICAgPHJlY3QgaWQ9J2xpbmUnIGZpbGw9JyNBRUFFQUUnIG1hc2s9J3VybCgjbWFzay0yKScgeD0nMTknIHk9JzUxLjUnIHdpZHRoPSc0MScgaGVpZ2h0PScwLjUnPjwvcmVjdD5cblx0ICAgICAgICAgICAgICAgIDwvZz5cblx0ICAgICAgICAgICAgPC9nPlxuXHQgICAgICAgIDwvZz5cblx0ICAgIDwvZz5cblx0PC9zdmc+XCJcblx0c3RvY2tzX2FwcDpcIjw/eG1sIHZlcnNpb249JzEuMCcgZW5jb2Rpbmc9J1VURi04JyBzdGFuZGFsb25lPSdubyc/PlxuXHQ8c3ZnIHdpZHRoPSc2MHB4JyBoZWlnaHQ9JzYwcHgnIHZpZXdCb3g9JzAgMCA2MCA2MCcgdmVyc2lvbj0nMS4xJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHhtbG5zOnhsaW5rPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJz5cblx0ICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggMzkuMSAoMzE3MjApIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPlxuXHQgICAgPHRpdGxlPlN0b2NrczwvdGl0bGU+XG5cdCAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz5cblx0ICAgIDxkZWZzPlxuXHQgICAgICAgIDxwYXRoIGQ9J00zOS4wODE1LDAgQzQ1LjEwNSwwIDQ4LjExNiwwIDUxLjM1ODUsMS4wMjUgQzU0Ljg5ODUsMi4zMTM1IDU3LjY4NjUsNS4xMDE1IDU4Ljk3NSw4LjY0MTUgQzYwLDExLjg4MzUgNjAsMTQuODk1NSA2MCwyMC45MTg1IEw2MCwzOS4wODE1IEM2MCw0NS4xMDUgNjAsNDguMTE2IDU4Ljk3NSw1MS4zNTg1IEM1Ny42ODY1LDU0Ljg5ODUgNTQuODk4NSw1Ny42ODY1IDUxLjM1ODUsNTguOTc0NSBDNDguMTE2LDYwIDQ1LjEwNSw2MCAzOS4wODE1LDYwIEwyMC45MTg1LDYwIEMxNC44OTUsNjAgMTEuODgzNSw2MCA4LjY0MTUsNTguOTc0NSBDNS4xMDE1LDU3LjY4NjUgMi4zMTM1LDU0Ljg5ODUgMS4wMjUsNTEuMzU4NSBDMCw0OC4xMTYgMCw0NS4xMDUgMCwzOS4wODE1IEwwLDIwLjkxODUgQzAsMTQuODk1NSAwLDExLjg4MzUgMS4wMjUsOC42NDE1IEMyLjMxMzUsNS4xMDE1IDUuMTAxNSwyLjMxMzUgOC42NDE1LDEuMDI1IEMxMS44ODM1LDAgMTQuODk1LDAgMjAuOTE4NSwwIEwzOS4wODE1LDAgWicgaWQ9J3BhdGgtMSc+PC9wYXRoPlxuXHQgICAgICAgIDxsaW5lYXJHcmFkaWVudCB4MT0nNTAlJyB5MT0nMCUnIHgyPSc1MCUnIHkyPScxMDAlJyBpZD0nbGluZWFyR3JhZGllbnQtMyc+XG5cdCAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9JyM0NTQ1NDUnIG9mZnNldD0nMCUnPjwvc3RvcD5cblx0ICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0nIzExMTExMicgb2Zmc2V0PScxMDAlJz48L3N0b3A+XG5cdCAgICAgICAgPC9saW5lYXJHcmFkaWVudD5cblx0ICAgICAgICA8cGF0aCBkPSdNNDEuNSwxNi4wMTEyMTA4IEw0MS41LC0xLjUgTDQxLC0xLjUgTDQxLDE2LjAxMTIxMDggQzQxLjA4MjM0MDUsMTYuMDAzNzkwNyA0MS4xNjU3Mjc2LDE2IDQxLjI1LDE2IEM0MS4zMzQyNzI0LDE2IDQxLjQxNzY1OTUsMTYuMDAzNzkwNyA0MS41LDE2LjAxMTIxMDggWiBNNDEuNSwyMS40ODg3ODkyIEw0MS41LDYzIEw0MSw2MyBMNDEsMjEuNDg4Nzg5MiBDNDEuMDgyMzQwNSwyMS40OTYyMDkzIDQxLjE2NTcyNzYsMjEuNSA0MS4yNSwyMS41IEM0MS4zMzQyNzI0LDIxLjUgNDEuNDE3NjU5NSwyMS40OTYyMDkzIDQxLjUsMjEuNDg4Nzg5MiBaIE00MS4yNSwyMSBDNDIuNDkyNjQwNywyMSA0My41LDE5Ljk5MjY0MDcgNDMuNSwxOC43NSBDNDMuNSwxNy41MDczNTkzIDQyLjQ5MjY0MDcsMTYuNSA0MS4yNSwxNi41IEM0MC4wMDczNTkzLDE2LjUgMzksMTcuNTA3MzU5MyAzOSwxOC43NSBDMzksMTkuOTkyNjQwNyA0MC4wMDczNTkzLDIxIDQxLjI1LDIxIFonIGlkPSdwYXRoLTQnPjwvcGF0aD5cblx0ICAgICAgICA8ZmlsdGVyIHg9Jy01MCUnIHk9Jy01MCUnIHdpZHRoPScyMDAlJyBoZWlnaHQ9JzIwMCUnIGZpbHRlclVuaXRzPSdvYmplY3RCb3VuZGluZ0JveCcgaWQ9J2ZpbHRlci01Jz5cblx0ICAgICAgICAgICAgPGZlT2Zmc2V0IGR4PScwJyBkeT0nMScgaW49J1NvdXJjZUFscGhhJyByZXN1bHQ9J3NoYWRvd09mZnNldE91dGVyMSc+PC9mZU9mZnNldD5cblx0ICAgICAgICAgICAgPGZlQ29sb3JNYXRyaXggdmFsdWVzPScwIDAgMCAwIDAgICAwIDAgMCAwIDAgICAwIDAgMCAwIDAgIDAgMCAwIDAuNSAwJyB0eXBlPSdtYXRyaXgnIGluPSdzaGFkb3dPZmZzZXRPdXRlcjEnPjwvZmVDb2xvck1hdHJpeD5cblx0ICAgICAgICA8L2ZpbHRlcj5cblx0ICAgIDwvZGVmcz5cblx0ICAgIDxnIGlkPSdQYWdlLTEnIHN0cm9rZT0nbm9uZScgc3Ryb2tlLXdpZHRoPScxJyBmaWxsPSdub25lJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnPlxuXHQgICAgICAgIDxnIGlkPSdIb21lLVNjcmVlbi3igKItaVBob25lLVNFJyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSgtMjQ0LjAwMDAwMCwgLTIwMy4wMDAwMDApJz5cblx0ICAgICAgICAgICAgPGcgaWQ9J0hvbWUtU2NyZWVuLeKAoi1pUGhvbmUtNnMtQ29weScgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMC4wMDAwMDAsIDI3LjAwMDAwMCknPlxuXHQgICAgICAgICAgICAgICAgPGcgaWQ9J1N0b2NrcycgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMjQ0LjAwMDAwMCwgMTc2LjAwMDAwMCknPlxuXHQgICAgICAgICAgICAgICAgICAgIDxtYXNrIGlkPSdtYXNrLTInIGZpbGw9J3doaXRlJz5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPScjcGF0aC0xJz48L3VzZT5cblx0ICAgICAgICAgICAgICAgICAgICA8L21hc2s+XG5cdCAgICAgICAgICAgICAgICAgICAgPHVzZSBpZD0nQkcnIGZpbGw9JyMxNDE0MTYnIHhsaW5rOmhyZWY9JyNwYXRoLTEnPjwvdXNlPlxuXHQgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9J00tMC40ODQ4NjMyODEsMzQuMDUzNzEwOSBDLTAuNDg0ODYzMjgxLDM0LjA1MzcxMDkgMS4yNzIzOTIxMSwzNC4wNjQ0Njg2IDMuMTE5Mzg0NzcsMzQuNjMyMDgwMSBDNC43MDc5NDQ5NSwzNS4xMjAyNzEgNi4zMDA5ODE3NiwzNi4yNTIzNzg2IDcuMjMzODg2NzIsMzYuMTk0NTgwMSBDOS4yNTE0NjQ4NCwzNi4wNjk1ODAxIDExLjMzNDQ3MjcsMzUuMzc1OTc2NiAxMS4zMzQ0NzI3LDM1LjM3NTk3NjYgTDE1LjEyMDg0OTYsMzAuNDQ1MDY4NCBMMTguNzI3NTM5MSwzMy41MjYzNjcyIEwyMi40OTQxNDA2LDI0LjYyNDUxMTcgTDI2LjExOTYyODksMzQuMzM2OTE0MSBMMzAuMjUsMzYuODY1OTY2OCBMMzMuOTQ2Nzc3MywzMC4yMDg0OTYxIEwzNy41Mzg1NzQyLDI5LjI3NjEyMyBMNDEuNDMxNjQwNiwxOC4xMzIzMjQyIEw0NS4xNDc0NjA5LDI3LjIwMzM2OTEgTDQ4Ljk0Mzg0NzcsMjQuNjY1NTI3MyBMNTIuNzczNDM3NSwzMS45OTM2NTIzIEw1Ni4zNDIyODUyLDIzLjgxNzM4MjggTDYwLjM0NTcwMzEsMTkuNjU2MjUgTDYwLjM0NTcwMzEsNjAuNDc5MTE2NiBMLTAuMzA0OTg5MzI1LDYwLjQ3OTExNjYgTC0wLjQ4NDg2MzI4MSwzNC4wNTM3MTA5IFonIGlkPSdncmFwaCcgc3Ryb2tlPScjRkZGRkZGJyBzdHJva2Utd2lkdGg9JzAuNzUnIGZpbGw9J3VybCgjbGluZWFyR3JhZGllbnQtMyknIG1hc2s9J3VybCgjbWFzay0yKSc+PC9wYXRoPlxuXHQgICAgICAgICAgICAgICAgICAgIDxnIGlkPSdtYXJrJyBtYXNrPSd1cmwoI21hc2stMiknPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICA8dXNlIGZpbGw9J2JsYWNrJyBmaWxsLW9wYWNpdHk9JzEnIGZpbHRlcj0ndXJsKCNmaWx0ZXItNSknIHhsaW5rOmhyZWY9JyNwYXRoLTQnPjwvdXNlPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICA8dXNlIGZpbGw9JyMwMUE2RjEnIGZpbGwtcnVsZT0nZXZlbm9kZCcgeGxpbms6aHJlZj0nI3BhdGgtNCc+PC91c2U+XG5cdCAgICAgICAgICAgICAgICAgICAgPC9nPlxuXHQgICAgICAgICAgICAgICAgICAgIDxnIGlkPSdTcGFyay1saW5lJyBtYXNrPSd1cmwoI21hc2stMiknIGZpbGw9JyM3Nzc3NzgnPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICA8ZyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSg3LjAwMDAwMCwgLTEuNTAwMDAwKScgaWQ9J21hcmsnPlxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHJlY3QgeD0nMCcgeT0nMCcgd2lkdGg9JzAuNScgaGVpZ2h0PSc2NC41Jz48L3JlY3Q+XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cmVjdCB4PScxMS41JyB5PScwJyB3aWR0aD0nMC41JyBoZWlnaHQ9JzY0LjUnPjwvcmVjdD5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxyZWN0IHg9JzIzJyB5PScwJyB3aWR0aD0nMC41JyBoZWlnaHQ9JzY0LjUnPjwvcmVjdD5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxyZWN0IHg9JzQ1LjUnIHk9JzAnIHdpZHRoPScwLjUnIGhlaWdodD0nNjQuNSc+PC9yZWN0PlxuXHQgICAgICAgICAgICAgICAgICAgICAgICA8L2c+XG5cdCAgICAgICAgICAgICAgICAgICAgPC9nPlxuXHQgICAgICAgICAgICAgICAgPC9nPlxuXHQgICAgICAgICAgICA8L2c+XG5cdCAgICAgICAgPC9nPlxuXHQgICAgPC9nPlxuXHQ8L3N2Zz5cIlxufVxuXG4jIERldmljZSBmcmFtZXNcbmV4cG9ydHMuZnJhbWVzID0gIHtcblxuIyBGdWxsc2NyZWVuXG5cdFwiZnVsbHNjcmVlblwiIDogeyBoZWlnaHQ6IHdpbmRvdy5pbm5lckhlaWdodCwgd2lkdGg6IHdpbmRvdy5pbm5lcldpZHRoLFx0c2NhbGU6MSwgbW9iaWxlOmZhbHNlLCBwbGF0Zm9ybTpcIndlYlwifVxuXG5cdCMgaVBob25lc1xuXHQjIyA1U1xuXHRcImFwcGxlLWlwaG9uZS01cy1zcGFjZS1ncmF5XCI6IHsgaGVpZ2h0OiAxMTM2LCB3aWR0aDogNjQwLFx0c2NhbGU6IDIsIG1vYmlsZTp0cnVlLCBwbGF0Zm9ybTpcImlPU1wifVxuXHRcImFwcGxlLWlwaG9uZS01cy1zaWx2ZXJcIjogeyBoZWlnaHQ6IDExMzYsIHdpZHRoOiA2NDAsXHRzY2FsZTogMiwgbW9iaWxlOnRydWUsIHBsYXRmb3JtOlwiaU9TXCJ9XG5cdFwiYXBwbGUtaXBob25lLTVzLWdvbGRcIjogeyBoZWlnaHQ6IDExMzYsIHdpZHRoOiA2NDAsXHRzY2FsZTogMiwgbW9iaWxlOnRydWUsIHBsYXRmb3JtOlwiaU9TXCJ9XG5cblx0IyMgNWNcblx0XCJhcHBsZS1pcGhvbmUtNWMtZ3JlZW5cIjogeyBoZWlnaHQ6IDExMzYsIHdpZHRoOiA2NDAsc2NhbGU6IDIsIG1vYmlsZTp0cnVlLCBwbGF0Zm9ybTpcImlPU1wifVxuXHRcImFwcGxlLWlwaG9uZS01Yy1ibHVlXCI6IHsgaGVpZ2h0OiAxMTM2LCB3aWR0aDogNjQwLFx0c2NhbGU6IDIsIG1vYmlsZTp0cnVlLCBwbGF0Zm9ybTpcImlPU1wifVxuXHRcImFwcGxlLWlwaG9uZS01Yy1yZWRcIjogeyBoZWlnaHQ6IDExMzYsIHdpZHRoOiA2NDAsXHRzY2FsZTogMiwgbW9iaWxlOnRydWUsIHBsYXRmb3JtOlwiaU9TXCJ9XG5cdFwiYXBwbGUtaXBob25lLTVjLXdoaXRlXCI6IHsgaGVpZ2h0OiAxMTM2LCB3aWR0aDogNjQwLHNjYWxlOiAyLCBtb2JpbGU6dHJ1ZSwgcGxhdGZvcm06XCJpT1NcIn1cblx0XCJhcHBsZS1pcGhvbmUtNWMteWVsbG93XCI6IHsgaGVpZ2h0OiAxMTM2LCB3aWR0aDogNjQwLHNjYWxlOiAyLCBtb2JpbGU6dHJ1ZSwgcGxhdGZvcm06XCJpT1NcIn1cblx0XCJhcHBsZS1pcGhvbmUtNWMtcGlua1wiOiB7IGhlaWdodDogMTEzNiwgd2lkdGg6IDY0MCxcdHNjYWxlOiAyLCBtb2JpbGU6dHJ1ZSwgcGxhdGZvcm06XCJpT1NcIn1cblxuXHQjIyA2c1xuXHRcImFwcGxlLWlwaG9uZS02cy1zcGFjZS1ncmF5XCIgOiB7IGhlaWdodDogMTMzNCwgd2lkdGg6IDc1MCxcdHNjYWxlOiAyLCBtb2JpbGU6dHJ1ZSwgcGxhdGZvcm06XCJpT1NcIn1cblx0XCJhcHBsZS1pcGhvbmUtNnMtc2lsdmVyXCI6IHsgaGVpZ2h0OiAxMzM0LCB3aWR0aDogNzUwLFx0c2NhbGU6IDIsIG1vYmlsZTp0cnVlLCBwbGF0Zm9ybTpcImlPU1wifVxuXHRcImFwcGxlLWlwaG9uZS02cy1nb2xkXCI6IHsgaGVpZ2h0OiAxMzM0LCB3aWR0aDogNzUwLFx0c2NhbGU6IDIsIG1vYmlsZTp0cnVlLCBwbGF0Zm9ybTpcImlPU1wifVxuXHRcImFwcGxlLWlwaG9uZS02cy1yb3NlLWdvbGRcIjogeyBoZWlnaHQ6IDEzMzQsIHdpZHRoOiA3NTAsXHRzY2FsZTogMiwgbW9iaWxlOnRydWUsIHBsYXRmb3JtOlwiaU9TXCJ9XG5cblx0IyMgNnMgcGx1c1xuXHRcImFwcGxlLWlwaG9uZS02cy1wbHVzLWdvbGRcIjogeyBoZWlnaHQ6IDIyMDgsIHdpZHRoOiAxMjQyLCBzY2FsZTogMywgbW9iaWxlOnRydWUsIHBsYXRmb3JtOlwiaU9TXCJ9XG5cdFwiYXBwbGUtaXBob25lLTZzLXBsdXMtc2lsdmVyXCI6IHsgaGVpZ2h0OiAyMjA4LCB3aWR0aDogMTI0MixcdHNjYWxlOiAzLCBtb2JpbGU6dHJ1ZSwgcGxhdGZvcm06XCJpT1NcIn1cblx0XCJhcHBsZS1pcGhvbmUtNnMtcGx1cy1zcGFjZS1ncmF5XCI6IHsgaGVpZ2h0OiAyMjA4LCB3aWR0aDogMTI0MixcdHNjYWxlOiAzLCBtb2JpbGU6dHJ1ZSwgcGxhdGZvcm06XCJpT1NcIn1cblx0XCJhcHBsZS1pcGhvbmUtNnMtcGx1c1wiOiB7IGhlaWdodDogMjIwOCwgd2lkdGg6IDEyNDIsXHRzY2FsZTogMywgbW9iaWxlOnRydWUsIHBsYXRmb3JtOlwiaU9TXCJ9XG5cdFwiYXBwbGUtaXBob25lLTZzLXBsdXMtcm9zZS1nb2xkXCI6IHsgaGVpZ2h0OiAyMjA4LCB3aWR0aDogMTI0MixcdHNjYWxlOiAzLCBtb2JpbGU6dHJ1ZSwgcGxhdGZvcm06XCJpT1NcIn1cblxuXHQjIGlQYWRzXG5cblx0IyMgQWlyXG5cdFwiYXBwbGUtaXBhZC1haXItMi1nb2xkXCI6IHsgaGVpZ2h0OiAyMDQ4LCB3aWR0aDogMTUzNixcdHNjYWxlOiAyLCBtb2JpbGU6dHJ1ZSwgcGxhdGZvcm06XCJpT1NcIn1cblx0XCJhcHBsZS1pcGFkLWFpci0yLXNpbHZlclwiOiB7IGhlaWdodDogMjA0OCwgd2lkdGg6IDE1MzYsXHRzY2FsZTogMiwgbW9iaWxlOnRydWUsIHBsYXRmb3JtOlwiaU9TXCJ9XG5cdFwiYXBwbGUtaXBhZC1haXItMi1zcGFjZS1ncmF5XCI6IHsgaGVpZ2h0OiAyMDQ4LCB3aWR0aDogMTUzNixcdHNjYWxlOiAyLCBtb2JpbGU6dHJ1ZSwgcGxhdGZvcm06XCJpT1NcIn1cblxuXHQjIyBNaW5pXG5cdFwiYXBwbGUtaXBhZC1taW5pLTQtZ29sZFwiOiB7IGhlaWdodDogMjA0OCwgd2lkdGg6IDE1MzYsXHRzY2FsZTogMiwgbW9iaWxlOnRydWUsIHBsYXRmb3JtOlwiaU9TXCJ9XG5cdFwiYXBwbGUtaXBhZC1taW5pLTQtc3BhY2UtZ3JheVwiOiB7IGhlaWdodDogMjA0OCwgd2lkdGg6IDE1MzYsXHRzY2FsZTogMiwgbW9iaWxlOnRydWUsIHBsYXRmb3JtOlwiaU9TXCJ9XG5cdFwiYXBwbGUtaXBhZC1taW5pLTQtc2lsdmVyXCI6eyBoZWlnaHQ6IDIwNDgsIHdpZHRoOiAxNTM2LCBzY2FsZTogMiwgbW9iaWxlOnRydWUsIHBsYXRmb3JtOlwiaU9TXCJ9XG5cblx0IyMgUHJvXG5cdFwiYXBwbGUtaXBhZC1wcm8tZ29sZFwiOiB7IGhlaWdodDogMjczMiwgd2lkdGg6IDIwNDgsIHNjYWxlOiAyLCBtb2JpbGU6dHJ1ZSwgcGxhdGZvcm06XCJpT1NcIn1cblx0XCJhcHBsZS1pcGFkLXByby1zaWx2ZXJcIjogeyBoZWlnaHQ6IDI3MzIsIHdpZHRoOiAyMDQ4LCBzY2FsZTogMiwgbW9iaWxlOnRydWUsIHBsYXRmb3JtOlwiaU9TXCJ9XG5cdFwiYXBwbGUtaXBhZC1wcm8tc3BhY2UtZ3JheVwiIDogeyBoZWlnaHQ6IDI3MzIsIHdpZHRoOiAyMDQ4LCBzY2FsZTogMiwgbW9iaWxlOnRydWUsIHBsYXRmb3JtOlwiaU9TXCJ9XG59XG5leHBvcnRzLmZyYW1lckZyYW1lcyA9XG5cdDY0MDoyXG5cdDc1MDoyXG5cdDc2ODoyXG5cdDEwODA6M1xuXHQxMjQyOjNcblx0MTQ0MDo0XG5cdDE1MzY6MlxuXG4jIERldmljZSBmcmFtZXNcbmV4cG9ydHMucmVhbERldmljZXMgPVxuXHQzMjA6XG5cdFx0NDgwOlxuXHRcdFx0bmFtZTpcImlwaG9uZVwiXG5cdFx0XHRkaXNwbGF5X25hbWU6XCJpUGhvbmVcIlxuXHRcdFx0d2lkdGg6MzIwXG5cdFx0XHRoZWlnaHQ6NDgwXG5cdFx0XHRzY2FsZToxXG5cdDQ4MDpcblx0XHQ4NTQ6XG5cdFx0XHRuYW1lOlwiQW5kcm9pZCBPbmVcIlxuXHRcdFx0d2lkdGg6NDgwXG5cdFx0XHRoZWlnaHQ6ODU0XG5cdFx0XHRzY2FsZToxLjVcblxuXHQ2NDA6XG5cdFx0OTYwOlxuXHRcdFx0bmFtZTpcImlwaG9uZS01XCJcblx0XHRcdGRpc3BsYXlfbmFtZTpcImlQaG9uZSA0XCJcblx0XHRcdHdpZHRoOjY0MFxuXHRcdFx0aGVpZ2h0Ojk2MFxuXHRcdFx0c2NhbGU6MlxuXHRcdDExMzY6XG5cdFx0XHRuYW1lOlwiaXBob25lLTVcIlxuXHRcdFx0ZGlzcGxheV9uYW1lOlwiaVBob25lIDVcIlxuXHRcdFx0d2lkdGg6NjQwXG5cdFx0XHRoZWlnaHQ6MTEzNlxuXHRcdFx0c2NhbGU6MlxuXHQ3MjA6XG5cdFx0MTI4MDpcblx0XHRcdG5hbWU6XCJYSERQSVwiXG5cdFx0XHR3aWR0aDo3MjBcblx0XHRcdGhlaWdodDoxMjgwXG5cdFx0XHRzY2FsZToyXG5cdDc1MDpcblx0XHQxMTE4OlxuXHRcdFx0bmFtZTpcImlwaG9uZS02c1wiXG5cdFx0XHRkaXNwbGF5X25hbWU6XCJpUGhvbmUgNnNcIlxuXHRcdFx0d2lkdGg6NzUwXG5cdFx0XHRoZWlnaHQ6MTExOFxuXHRcdFx0c2NhbGU6MlxuXHRcdDEzMzQ6XG5cdFx0XHRuYW1lOlwiaXBob25lLTZzXCJcblx0XHRcdGRpc3BsYXlfbmFtZTpcImlQaG9uZSA2c1wiXG5cdFx0XHR3aWR0aDo3NTBcblx0XHRcdGhlaWdodDoxMzM0XG5cdFx0XHRzY2FsZToyXG5cdDc2ODpcblx0XHQxMDI0OlxuXHRcdFx0bmFtZTpcImlwYWRcIlxuXHRcdFx0ZGlzcGxheV9uYW1lOlwiaVBhZFwiXG5cdFx0XHR3aWR0aDo3Njhcblx0XHRcdGhlaWdodDoxMDI0XG5cdFx0XHRzY2FsZToxXG5cdFx0MTI4MDpcblx0XHRcdG5hbWU6XCJOZXh1cyA0XCJcblx0XHRcdHdpZHRoOjc2OFxuXHRcdFx0aGVpZ2h0OjEyODBcblx0XHRcdHNjYWxlOjJcblx0ODAwOlxuXHRcdDEyODA6XG5cdFx0XHRuYW1lOlwiTmV4dXMgN1wiXG5cdFx0XHR3aWR0aDo4MDBcblx0XHRcdGhlaWdodDoxMjgwXG5cdFx0XHRzY2FsZToxXG5cdDEwODA6XG5cdFx0MTkyMDpcblx0XHRcdG5hbWU6XCJYWEhEUElcIlxuXHRcdFx0d2lkdGg6MTA4MFxuXHRcdFx0aGVpZ2h0OjE5MjBcblx0XHRcdHNjYWxlOjNcblx0MTIwMDpcblx0XHQxOTIwOlxuXHRcdFx0bmFtZTpcIk5leHVzIDdcIlxuXHRcdFx0d2lkdGg6MTIwMFxuXHRcdFx0aGVpZ2h0OjE5MjBcblx0XHRcdHNjYWxlOjJcblx0MTI0Mjpcblx0XHQyMjA4OlxuXHRcdFx0bmFtZTpcImlwaG9uZS02cy1wbHVzXCJcblx0XHRcdGRpc3BsYXlfbmFtZTpcImlQaG9uZSA2IFBsdXNcIlxuXHRcdFx0d2lkdGg6MTI0MlxuXHRcdFx0aGVpZ2h0OjIyMDhcblx0XHRcdHNjYWxlOjNcblx0MTMzNDpcblx0XHQ3NTA6XG5cdFx0XHRuYW1lOlwiaXBob25lLTZzXCJcblx0XHRcdGRpc3BsYXlfbmFtZTpcImlQaG9uZSA2c1wiXG5cdFx0XHR3aWR0aDo3NTBcblx0XHRcdGhlaWdodDoxMzM0XG5cdFx0XHRzY2FsZToyXG5cdDE0NDA6XG5cdFx0MjU2MDpcblx0XHRcdG5hbWU6XCJYWFhIRFBJXCJcblx0XHRcdHdpZHRoOjE0NDBcblx0XHRcdGhlaWdodDoyNTYwXG5cdFx0XHRzY2FsZTo0XG5cdDE0NDE6XG5cdFx0MjU2MTpcblx0XHRcdG5hbWU6XCJOZXh1cyA2XCJcblx0XHRcdHdpZHRoOjE0NDBcblx0XHRcdGhlaWdodDoyNTYwXG5cdFx0XHRzY2FsZTo0XG5cdDE1MzY6XG5cdFx0MjA0ODpcblx0XHRcdG5hbWU6XCJpcGFkXCJcblx0XHRcdGRpc3BsYXlfbmFtZTpcImlQYWRcIlxuXHRcdFx0d2lkdGg6MTUzNlxuXHRcdFx0aGVpZ2h0OjIwNDhcblx0XHRcdHNjYWxlOjJcblx0MTYwMDpcblx0XHQyMDU2OlxuXHRcdFx0bmFtZTpcIk5leHVzIDEwXCJcblx0XHRcdHdpZHRoOjE2MDBcblx0XHRcdGhlaWdodDoyMDU2XG5cdFx0XHRzY2FsZToyXG5cdDIyMDg6XG5cdFx0MTI0Mjpcblx0XHRcdG5hbWU6XCJpcGhvbmUtNnMtcGx1c1wiXG5cdFx0XHRkaXNwbGF5X25hbWU6XCJpUGhvbmUgNiBQbHVzXCJcblx0XHRcdHdpZHRoOjEyNDJcblx0XHRcdGhlaWdodDoyMjA4XG5cdFx0XHRzY2FsZTozXG5cdDIwNDg6XG5cdFx0MTUzNjpcblx0XHRcdG5hbWU6XCJOZXh1cyA5XCJcblx0XHRcdHdpZHRoOjIwNDhcblx0XHRcdGhlaWdodDoxNTM2XG5cdFx0XHRzY2FsZToyXG5cdFx0MjczMjpcblx0XHRcdG5hbWU6XCJpcGFkLXByb1wiXG5cdFx0XHRkaXNwbGF5X25hbWU6XCJpUGFkIFByb1wiXG5cdFx0XHR3aWR0aDoyMDQ4XG5cdFx0XHRoZWlnaHQ6MjczMlxuXHRcdFx0c2NhbGU6MlxuXHQyNTYwOlxuXHRcdDE2MDA6XG5cdFx0XHRuYW1lOlwiTmV4dXMgMTBcIlxuXHRcdFx0d2lkdGg6MjU2MFxuXHRcdFx0aGVpZ2h0OjE2MDBcblx0XHRcdHNjYWxlOjJcblx0MjczMjpcblx0XHQyMDQ4OlxuXHRcdFx0bmFtZTpcImlwYWQtcHJvXCJcblx0XHRcdGRpc3BsYXlfbmFtZTpcImlQYWQgUHJvXCJcblx0XHRcdHdpZHRoOjI3MzJcblx0XHRcdGhlaWdodDoyMDQ4XG5cdFx0XHRzY2FsZToyXG4iLCIjIFV0aWxzXG5cbmlvcyA9IHJlcXVpcmUgJ2lvcy1raXQnXG5cbmV4cG9ydHMuZGVmYXVsdHMgPSB7XG5cdGFuaW1hdGlvbnM6IHtcblx0XHR0YXJnZXQ6dW5kZWZpbmVkXG5cdFx0Y29uc3RyYWludHM6IHVuZGVmaW5lZFxuXHRcdGN1cnZlIDogXCJlYXNlLWluLW91dFwiXG5cdFx0Y3VydmVPcHRpb25zOiB1bmRlZmluZWRcblx0XHR0aW1lOjFcblx0XHRkZWxheTowXG5cdFx0cmVwZWF0OnVuZGVmaW5lZFxuXHRcdGNvbG9yTW9kZWw6dW5kZWZpbmVkXG5cdFx0c3RhZ2dlcjp1bmRlZmluZWRcblx0XHRmYWRlT3V0OmZhbHNlXG5cdFx0ZmFkZUluOmZhbHNlXG5cdH1cbn1cblxubGF5b3V0ID0gKGFycmF5KSAtPlxuXHRzZXR1cCA9IHt9XG5cdHRhcmdldExheWVycyA9IFtdXG5cdGJsdWVwcmludCA9IFtdXG5cdGlmIGFycmF5XG5cdFx0Zm9yIGkgaW4gT2JqZWN0LmtleXMoZXhwb3J0cy5kZWZhdWx0cy5hbmltYXRpb25zKVxuXHRcdFx0aWYgYXJyYXlbaV1cblx0XHRcdFx0c2V0dXBbaV0gPSBhcnJheVtpXVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRzZXR1cFtpXSA9IGV4cG9ydHMuZGVmYXVsdHMuYW5pbWF0aW9uc1tpXVxuXG5cdGlmIHNldHVwLnRhcmdldFxuXHRcdGlmIHNldHVwLnRhcmdldC5sZW5ndGhcblx0XHRcdHRhcmdldExheWVycyA9IHNldHVwLnRhcmdldFxuXHRcdGVsc2Vcblx0XHRcdHRhcmdldExheWVycy5wdXNoIHNldHVwLnRhcmdldFxuXHRlbHNlXG5cdFx0dGFyZ2V0TGF5ZXJzID0gRnJhbWVyLkN1cnJlbnRDb250ZXh0LmxheWVyc1xuXG5cdGlmIHNldHVwLnRhcmdldFxuXHRcdGlmIHNldHVwLmNvbnN0cmFpbnRzXG5cdFx0XHRmb3IgbmV3Q29uc3RyYWludCBpbiBPYmplY3Qua2V5cyhzZXR1cC5jb25zdHJhaW50cylcblx0XHRcdFx0c2V0dXAudGFyZ2V0LmNvbnN0cmFpbnRzW25ld0NvbnN0cmFpbnRdID0gc2V0dXAuY29uc3RyYWludHNbbmV3Q29uc3RyYWludF1cblxuXG5cdCNUcmFuc2xhdGUgbmV3IGNvbnN0cmFpbnRzXG5cdGZvciBsYXllciwgaW5kZXggaW4gdGFyZ2V0TGF5ZXJzXG5cdFx0bGF5ZXIuY2FsY3VsYXRlZFBvc2l0aW9uID0ge31cblx0XHRpZiBsYXllci5jb25zdHJhaW50c1xuXG5cdFx0XHRwcm9wcyA9IHt9XG5cdFx0XHRsYXllci5zdXBlckZyYW1lID0ge31cblxuXHRcdFx0aWYgbGF5ZXIuc3VwZXJMYXllclxuXHRcdFx0XHRsYXllci5zdXBlckZyYW1lLmhlaWdodCA9IGxheWVyLnN1cGVyTGF5ZXIuaGVpZ2h0XG5cdFx0XHRcdGxheWVyLnN1cGVyRnJhbWUud2lkdGggPSBsYXllci5zdXBlckxheWVyLndpZHRoXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGxheWVyLnN1cGVyRnJhbWUuaGVpZ2h0ID0gaW9zLmRldmljZS5oZWlnaHRcblx0XHRcdFx0bGF5ZXIuc3VwZXJGcmFtZS53aWR0aCA9IGlvcy5kZXZpY2Uud2lkdGhcblxuXHRcdFx0aWYgbGF5ZXIuY29uc3RyYWludHMubGVhZGluZyAhPSB1bmRlZmluZWQgJiYgbGF5ZXIuY29uc3RyYWludHMudHJhaWxpbmcgIT0gdW5kZWZpbmVkXG5cdFx0XHRcdGxheWVyLmNvbnN0cmFpbnRzLmF1dG9XaWR0aCA9IHt9XG5cblx0XHRcdGlmIGxheWVyLmNvbnN0cmFpbnRzLnRvcCAhPSB1bmRlZmluZWQgJiYgbGF5ZXIuY29uc3RyYWludHMuYm90dG9tICE9IHVuZGVmaW5lZFxuXHRcdFx0XHRsYXllci5jb25zdHJhaW50cy5hdXRvSGVpZ2h0ID0ge31cblxuXHRcdFx0IyBTaXplIGNvbnN0cmFpbnRzXG5cdFx0XHRpZiBsYXllci5jb25zdHJhaW50cy53aWR0aCAhPSB1bmRlZmluZWRcblx0XHRcdFx0cHJvcHMud2lkdGggPSBpb3MudXRpbHMucHgobGF5ZXIuY29uc3RyYWludHMud2lkdGgpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdHByb3BzLndpZHRoID0gbGF5ZXIud2lkdGhcblxuXHRcdFx0aWYgbGF5ZXIuY29uc3RyYWludHMuaGVpZ2h0ICE9IHVuZGVmaW5lZFxuXHRcdFx0XHRwcm9wcy5oZWlnaHQgPSBpb3MudXRpbHMucHgobGF5ZXIuY29uc3RyYWludHMuaGVpZ2h0KVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRwcm9wcy5oZWlnaHQgPSBsYXllci5oZWlnaHRcblxuXHRcdFx0IyBQb3NpdGlvbmluZyBjb25zdHJhaW50c1xuXHRcdFx0aWYgbGF5ZXIuY29uc3RyYWludHMubGVhZGluZyAhPSB1bmRlZmluZWRcblx0XHRcdFx0I0lmIGl0J3MgYSBudW1iZXJgXG5cdFx0XHRcdGlmIGxheWVyLmNvbnN0cmFpbnRzLmxlYWRpbmcgPT0gcGFyc2VJbnQobGF5ZXIuY29uc3RyYWludHMubGVhZGluZywgMTApXG5cdFx0XHRcdFx0cHJvcHMueCA9IGlvcy51dGlscy5weChsYXllci5jb25zdHJhaW50cy5sZWFkaW5nKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0I0lmIGl0J3MgYSBsYXllclxuXHRcdFx0XHRcdGlmIGxheWVyLmNvbnN0cmFpbnRzLmxlYWRpbmcubGVuZ3RoID09IHVuZGVmaW5lZFxuXHRcdFx0XHRcdFx0cHJvcHMueCA9IGxheWVyLmNvbnN0cmFpbnRzLmxlYWRpbmcuY2FsY3VsYXRlZFBvc2l0aW9uLnggKyBsYXllci5jb25zdHJhaW50cy5sZWFkaW5nLmNhbGN1bGF0ZWRQb3NpdGlvbi53aWR0aFxuXHRcdFx0XHRcdCNJZiBpdCdzIGEgcmVsYXRpb25zaGlwXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0cHJvcHMueCA9IGxheWVyLmNvbnN0cmFpbnRzLmxlYWRpbmdbMF0uY2FsY3VsYXRlZFBvc2l0aW9uLnggKyBsYXllci5jb25zdHJhaW50cy5sZWFkaW5nWzBdLmNhbGN1bGF0ZWRQb3NpdGlvbi53aWR0aCArIGlvcy51dGlscy5weChsYXllci5jb25zdHJhaW50cy5sZWFkaW5nWzFdKVxuXG5cdFx0XHQjIE9wcG9zaW5nIGNvbnN0cmFpbnRzIGhhbmRsZXJcblx0XHRcdGlmIGxheWVyLmNvbnN0cmFpbnRzLmF1dG9XaWR0aCAhPSB1bmRlZmluZWRcblx0XHRcdFx0bGF5ZXIuY29uc3RyYWludHMuYXV0b1dpZHRoLnN0YXJ0WCA9IHByb3BzLnhcblxuXHRcdFx0aWYgbGF5ZXIuY29uc3RyYWludHMudHJhaWxpbmcgIT0gdW5kZWZpbmVkXG5cdFx0XHRcdCNJZiBpdCdzIGEgbnVtYmVyXG5cdFx0XHRcdGlmIGxheWVyLmNvbnN0cmFpbnRzLnRyYWlsaW5nID09IHBhcnNlSW50KGxheWVyLmNvbnN0cmFpbnRzLnRyYWlsaW5nLCAxMClcblx0XHRcdFx0XHRwcm9wcy54ID0gbGF5ZXIuc3VwZXJGcmFtZS53aWR0aCAtIGlvcy51dGlscy5weChsYXllci5jb25zdHJhaW50cy50cmFpbGluZykgLSBwcm9wcy53aWR0aFxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0I0lmIGl0J3MgYSBsYXllclxuXHRcdFx0XHRcdGlmIGxheWVyLmNvbnN0cmFpbnRzLnRyYWlsaW5nLmxlbmd0aCA9PSB1bmRlZmluZWRcblx0XHRcdFx0XHRcdHByb3BzLnggPSBsYXllci5jb25zdHJhaW50cy50cmFpbGluZy5jYWxjdWxhdGVkUG9zaXRpb24ueCAtIHByb3BzLndpZHRoXG5cdFx0XHRcdFx0I0lmIGl0J3MgYSByZWxhdGlvbnNoaXBcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRwcm9wcy54ID0gbGF5ZXIuY29uc3RyYWludHMudHJhaWxpbmdbMF0uY2FsY3VsYXRlZFBvc2l0aW9uLnggLSBpb3MudXRpbHMucHgobGF5ZXIuY29uc3RyYWludHMudHJhaWxpbmdbMV0pIC0gcHJvcHMud2lkdGhcblxuXHRcdFx0IyBPcHBvc2luZyBjb25zdHJhaW50cyBoYW5kbGVyXG5cdFx0XHRpZiBsYXllci5jb25zdHJhaW50cy5hdXRvV2lkdGggIT0gdW5kZWZpbmVkXG5cdFx0XHRcdGxheWVyLmNvbnN0cmFpbnRzLmF1dG9XaWR0aC5jYWxjdWxhdGVkUG9zaXRpb25YID0gcHJvcHMueFxuXG5cdFx0XHRcdCMjcGVyZm9ybSBhdXRvc2l6ZVxuXHRcdFx0XHRwcm9wcy54ID0gbGF5ZXIuY29uc3RyYWludHMuYXV0b1dpZHRoLnN0YXJ0WFxuXHRcdFx0XHRwcm9wcy53aWR0aCA9IGxheWVyLmNvbnN0cmFpbnRzLmF1dG9XaWR0aC5jYWxjdWxhdGVkUG9zaXRpb25YIC0gbGF5ZXIuY29uc3RyYWludHMuYXV0b1dpZHRoLnN0YXJ0WCArIHByb3BzLndpZHRoXG5cblx0XHRcdGlmIGxheWVyLmNvbnN0cmFpbnRzLnRvcCAhPSB1bmRlZmluZWRcblx0XHRcdFx0I0lmIGl0J3MgYSBudW1iZXJcblx0XHRcdFx0aWYgbGF5ZXIuY29uc3RyYWludHMudG9wID09IHBhcnNlSW50KGxheWVyLmNvbnN0cmFpbnRzLnRvcCwgMTApXG5cdFx0XHRcdFx0cHJvcHMueSA9IGlvcy51dGlscy5weChsYXllci5jb25zdHJhaW50cy50b3ApXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHQjSWYgaXQncyBhIGxheWVyXG5cdFx0XHRcdFx0aWYgbGF5ZXIuY29uc3RyYWludHMudG9wLmxlbmd0aCA9PSB1bmRlZmluZWRcblx0XHRcdFx0XHRcdHByb3BzLnkgPSBsYXllci5jb25zdHJhaW50cy50b3AuY2FsY3VsYXRlZFBvc2l0aW9uLnkgKyBsYXllci5jb25zdHJhaW50cy50b3AuY2FsY3VsYXRlZFBvc2l0aW9uLmhlaWdodFxuXHRcdFx0XHRcdCNJZiBpdCdzIGEgcmVsYXRpb25zaGlwXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0cHJvcHMueSA9IGxheWVyLmNvbnN0cmFpbnRzLnRvcFswXS5jYWxjdWxhdGVkUG9zaXRpb24ueSArIGxheWVyLmNvbnN0cmFpbnRzLnRvcFswXS5jYWxjdWxhdGVkUG9zaXRpb24uaGVpZ2h0ICsgaW9zLnV0aWxzLnB4KGxheWVyLmNvbnN0cmFpbnRzLnRvcFsxXSlcblxuXHRcdFx0IyBPcHBvc2luZyBjb25zdHJhaW50cyBoYW5kbGVyXG5cdFx0XHRpZiBsYXllci5jb25zdHJhaW50cy5hdXRvSGVpZ2h0ICE9IHVuZGVmaW5lZFxuXHRcdFx0XHRsYXllci5jb25zdHJhaW50cy5hdXRvSGVpZ2h0LnN0YXJ0WSA9IHByb3BzLnlcblxuXG5cdFx0XHRpZiBsYXllci5jb25zdHJhaW50cy5ib3R0b20gIT0gdW5kZWZpbmVkXG5cdFx0XHRcdCNJZiBpdCdzIGEgbnVtYmVyXG5cdFx0XHRcdGlmIGxheWVyLmNvbnN0cmFpbnRzLmJvdHRvbSA9PSBwYXJzZUludChsYXllci5jb25zdHJhaW50cy5ib3R0b20sIDEwKVxuXHRcdFx0XHRcdHByb3BzLnkgPSBsYXllci5zdXBlckZyYW1lLmhlaWdodCAtIGlvcy51dGlscy5weChsYXllci5jb25zdHJhaW50cy5ib3R0b20pIC0gcHJvcHMuaGVpZ2h0XG5cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdCNJZiBpdCdzIGEgbGF5ZXJcblx0XHRcdFx0XHRpZiBsYXllci5jb25zdHJhaW50cy5ib3R0b20ubGVuZ3RoID09IHVuZGVmaW5lZFxuXHRcdFx0XHRcdFx0cHJvcHMueSA9IGxheWVyLmNvbnN0cmFpbnRzLmJvdHRvbS5jYWxjdWxhdGVkUG9zaXRpb24ueSAtIHByb3BzLmhlaWdodFxuXHRcdFx0XHRcdCNJZiBpdCdzIGEgcmVsYXRpb25zaGlwXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0cHJvcHMueSA9IGxheWVyLmNvbnN0cmFpbnRzLmJvdHRvbVswXS5jYWxjdWxhdGVkUG9zaXRpb24ueSAtICBpb3MudXRpbHMucHgobGF5ZXIuY29uc3RyYWludHMuYm90dG9tWzFdKSAtIHByb3BzLmhlaWdodFxuXG5cdFx0XHQjIE9wcG9zaW5nIGNvbnN0cmFpbnRzIGhhbmRsZXJcblx0XHRcdGlmIGxheWVyLmNvbnN0cmFpbnRzLmF1dG9IZWlnaHQgIT0gdW5kZWZpbmVkXG5cdFx0XHRcdGxheWVyLmNvbnN0cmFpbnRzLmF1dG9IZWlnaHQuY2FsY3VsYXRlZFBvc2l0aW9uWSA9IHByb3BzLnlcblx0XHRcdFx0IyMgcGVyZm9ybSBhdXRvc2l6ZVxuXHRcdFx0XHRwcm9wcy5oZWlnaHQgPSBsYXllci5jb25zdHJhaW50cy5hdXRvSGVpZ2h0LmNhbGN1bGF0ZWRQb3NpdGlvblkgLSBsYXllci5jb25zdHJhaW50cy5hdXRvSGVpZ2h0LnN0YXJ0WSArIHByb3BzLmhlaWdodFxuXHRcdFx0XHRwcm9wcy55ID0gbGF5ZXIuY29uc3RyYWludHMuYXV0b0hlaWdodC5zdGFydFlcblxuXG5cdFx0XHQjIEFsaWdubWVudCBjb25zdHJhaW50c1xuXHRcdFx0aWYgbGF5ZXIuY29uc3RyYWludHMuYWxpZ24gIT0gdW5kZWZpbmVkXG5cdFx0XHRcdCNTZXQgdGhlIGNlbnRlcmluZyBmcmFtZVxuXHRcdFx0XHRpZiBsYXllci5jb25zdHJhaW50cy5hbGlnbiA9PSBcImhvcml6b250YWxcIlxuXHRcdFx0XHRcdHByb3BzLnggPSBsYXllci5zdXBlckZyYW1lLndpZHRoIC8gMiAtIHByb3BzLndpZHRoIC8gMlxuXG5cdFx0XHRcdGlmIGxheWVyLmNvbnN0cmFpbnRzLmFsaWduID09IFwidmVydGljYWxcIlxuXHRcdFx0XHRcdHByb3BzLnkgPSBsYXllci5zdXBlckZyYW1lLmhlaWdodCAvIDIgLSBwcm9wcy5oZWlnaHQgLyAyXG5cblx0XHRcdFx0aWYgbGF5ZXIuY29uc3RyYWludHMuYWxpZ24gPT0gXCJjZW50ZXJcIlxuXHRcdFx0XHRcdHByb3BzLnggPSBsYXllci5zdXBlckZyYW1lLndpZHRoIC8gMiAtIHByb3BzLndpZHRoIC8gMlxuXHRcdFx0XHRcdHByb3BzLnkgPSBsYXllci5zdXBlckZyYW1lLmhlaWdodCAvIDIgLSBwcm9wcy5oZWlnaHQgLyAyXG5cblxuXHRcdFx0IyBDZW50ZXJpbmcgY29uc3RyYWludHNcblx0XHRcdGlmIGxheWVyLmNvbnN0cmFpbnRzLmhvcml6b250YWxDZW50ZXIgIT0gdW5kZWZpbmVkXG5cdFx0XHRcdHByb3BzLnggPSBsYXllci5jb25zdHJhaW50cy5ob3Jpem9udGFsQ2VudGVyLmNhbGN1bGF0ZWRQb3NpdGlvbi54ICsgKGxheWVyLmNvbnN0cmFpbnRzLmhvcml6b250YWxDZW50ZXIuY2FsY3VsYXRlZFBvc2l0aW9uLndpZHRoIC0gcHJvcHMud2lkdGgpIC8gMlxuXG5cdFx0XHRpZiBsYXllci5jb25zdHJhaW50cy52ZXJ0aWNhbENlbnRlciAhPSB1bmRlZmluZWRcblx0XHRcdFx0cHJvcHMueSA9IGxheWVyLmNvbnN0cmFpbnRzLnZlcnRpY2FsQ2VudGVyLmNhbGN1bGF0ZWRQb3NpdGlvbi55ICsgKGxheWVyLmNvbnN0cmFpbnRzLnZlcnRpY2FsQ2VudGVyLmNhbGN1bGF0ZWRQb3NpdGlvbi5oZWlnaHQgLSBwcm9wcy5oZWlnaHQpIC8gMlxuXG5cdFx0XHRpZiBsYXllci5jb25zdHJhaW50cy5jZW50ZXIgIT0gdW5kZWZpbmVkXG5cdFx0XHRcdHByb3BzLnggPSBsYXllci5jb25zdHJhaW50cy5jZW50ZXIuY2FsY3VsYXRlZFBvc2l0aW9uLnggKyAobGF5ZXIuY29uc3RyYWludHMuY2VudGVyLmNhbGN1bGF0ZWRQb3NpdGlvbi53aWR0aCAtIHByb3BzLndpZHRoKSAvIDJcblx0XHRcdFx0cHJvcHMueSA9IGxheWVyLmNvbnN0cmFpbnRzLmNlbnRlci5jYWxjdWxhdGVkUG9zaXRpb24ueSArIChsYXllci5jb25zdHJhaW50cy5jZW50ZXIuY2FsY3VsYXRlZFBvc2l0aW9uLmhlaWdodCAtIHByb3BzLmhlaWdodCkgLyAyXG5cblx0XHRcdCMgQWxpZ25pbmcgY29uc3RyYWludHNcblx0XHRcdGlmIGxheWVyLmNvbnN0cmFpbnRzLmxlYWRpbmdFZGdlcyAhPSB1bmRlZmluZWRcblx0XHRcdFx0cHJvcHMueCA9IGxheWVyLmNvbnN0cmFpbnRzLmxlYWRpbmdFZGdlcy5jYWxjdWxhdGVkUG9zaXRpb24ueFxuXG5cdFx0XHRpZiBsYXllci5jb25zdHJhaW50cy50cmFpbGluZ0VkZ2VzICE9IHVuZGVmaW5lZFxuXHRcdFx0XHRwcm9wcy54ID0gbGF5ZXIuY29uc3RyYWludHMudHJhaWxpbmdFZGdlcy5jYWxjdWxhdGVkUG9zaXRpb24ueCAtIHByb3BzLndpZHRoICsgbGF5ZXIuY29uc3RyYWludHMudHJhaWxpbmdFZGdlcy5jYWxjdWxhdGVkUG9zaXRpb24ud2lkdGhcblxuXG5cdFx0XHRpZiBsYXllci5jb25zdHJhaW50cy50b3BFZGdlcyAhPSB1bmRlZmluZWRcblx0XHRcdFx0cHJvcHMueSA9IGxheWVyLmNvbnN0cmFpbnRzLnRvcEVkZ2VzLmNhbGN1bGF0ZWRQb3NpdGlvbi55XG5cblx0XHRcdGlmIGxheWVyLmNvbnN0cmFpbnRzLmJvdHRvbUVkZ2VzICE9IHVuZGVmaW5lZFxuXHRcdFx0XHRwcm9wcy55ID0gbGF5ZXIuY29uc3RyYWludHMuYm90dG9tRWRnZXMuY2FsY3VsYXRlZFBvc2l0aW9uLnkgLSBwcm9wcy5oZWlnaHQgKyBsYXllci5jb25zdHJhaW50cy5ib3R0b21FZGdlcy5jYWxjdWxhdGVkUG9zaXRpb24uaGVpZ2h0XG5cblxuXHRcdFx0bGF5ZXIuY2FsY3VsYXRlZFBvc2l0aW9uID0gcHJvcHNcblx0XHRlbHNlXG5cdFx0XHRsYXllci5jYWxjdWxhdGVkUG9zaXRpb24gPSBsYXllci5wcm9wc1xuXG5cdFx0Ymx1ZXByaW50LnB1c2ggbGF5ZXJcblxuXG5cdHJldHVybiBibHVlcHJpbnRcblxuZXhwb3J0cy5zZXQgPSAoYXJyYXkpIC0+XG5cdHNldHVwID0ge31cblx0cHJvcHMgPSB7fVxuXHRpZiBhcnJheVxuXHRcdGZvciBpIGluIE9iamVjdC5rZXlzKGV4cG9ydHMuZGVmYXVsdHMuYW5pbWF0aW9ucylcblx0XHRcdGlmIGFycmF5W2ldXG5cdFx0XHRcdHNldHVwW2ldID0gYXJyYXlbaV1cblx0XHRcdGVsc2Vcblx0XHRcdFx0c2V0dXBbaV0gPSBleHBvcnRzLmRlZmF1bHRzLmFuaW1hdGlvbnNbaV1cblxuXHRibHVlcHJpbnQgPSBsYXlvdXQoYXJyYXkpXG5cblx0Zm9yIGxheWVyLCBpbmRleCBpbiBibHVlcHJpbnRcblx0XHRmb3Iga2V5IGluIE9iamVjdC5rZXlzKGxheWVyLmNhbGN1bGF0ZWRQb3NpdGlvbilcblx0XHRcdGxheWVyW2tleV0gPSBsYXllci5jYWxjdWxhdGVkUG9zaXRpb25ba2V5XVxuXG5leHBvcnRzLmFuaW1hdGUgPSAoYXJyYXkpIC0+XG5cdHNldHVwID0ge31cblx0cHJvcHMgPSB7fVxuXHRpZiBhcnJheVxuXHRcdGZvciBpIGluIE9iamVjdC5rZXlzKGV4cG9ydHMuZGVmYXVsdHMuYW5pbWF0aW9ucylcblx0XHRcdGlmIGFycmF5W2ldXG5cdFx0XHRcdHNldHVwW2ldID0gYXJyYXlbaV1cblx0XHRcdGVsc2Vcblx0XHRcdFx0c2V0dXBbaV0gPSBleHBvcnRzLmRlZmF1bHRzLmFuaW1hdGlvbnNbaV1cblxuXHRibHVlcHJpbnQgPSBsYXlvdXQoYXJyYXkpXG5cblx0Zm9yIGxheWVyLCBpbmRleCBpbiBibHVlcHJpbnRcblx0XHQjVGltaW5nXG5cdFx0ZGVsYXkgPSBzZXR1cC5kZWxheVxuXHRcdGlmIHNldHVwLnN0YWdnZXJcblx0XHRcdHN0YWcgPSBzZXR1cC5zdGFnZ2VyXG5cdFx0XHRkZWxheSA9ICgoaW5kZXgpICogc3RhZykgKyBkZWxheVxuXG5cdFx0aWYgc2V0dXAuZmFkZU91dFxuXHRcdFx0aWYgbGF5ZXIgPT0gc2V0dXAuZmFkZU91dFxuXHRcdFx0XHRsYXllci5jYWxjdWxhdGVkUG9zaXRpb24ub3BhY2l0eSA9IDBcblxuXHRcdGlmIHNldHVwLmZhZGVJblxuXHRcdFx0bGF5ZXIuY2FsY3VsYXRlZFBvc2l0aW9uLm9wYWNpdHkgPSAxXG5cblx0XHRsYXllci5hbmltYXRlXG5cdFx0XHRwcm9wZXJ0aWVzOmxheWVyLmNhbGN1bGF0ZWRQb3NpdGlvblxuXHRcdFx0dGltZTpzZXR1cC50aW1lXG5cdFx0XHRkZWxheTpkZWxheVxuXHRcdFx0Y3VydmU6c2V0dXAuY3VydmVcblx0XHRcdHJlcGVhdDpzZXR1cC5yZXBlYXRcblx0XHRcdGNvbG9yTW9kZWw6c2V0dXAuY29sb3JNb2RlbFxuXHRcdFx0Y3VydmVPcHRpb25zOnNldHVwLmN1cnZlT3B0aW9uc1xuXG5cdFx0bGF5ZXIuY2FsY3VsYXRlZFBvc2l0aW9uID0gcHJvcHNcbiIsImlvcyA9IHJlcXVpcmUgJ2lvcy1raXQnXG5cblxuZXhwb3J0cy5kZWZhdWx0cyA9XG4gIHN0eWxlOlwibGlnaHRcIlxuICBzaGlmdDp0cnVlXG4gIG91dHB1dDp1bmRlZmluZWRcbiAgcmV0dXJuVGV4dDpcInJldHVyblwiXG4gIHN0YXRlOlwibGV0dGVyc1wiXG4gIGhpZGRlbjpmYWxzZVxuICByZXR1cm5Db2xvcjpcImJsdWVcIlxuICBzdXBlckxheWVyOnVuZGVmaW5lZFxuXG5cbiNSZXNwb25zYWJpbGUgZm9yIGtleWJvYXJkIGRpbWVuc2lvbnNcbmRldmljZSA9XG4gIFwiaXBob25lLTVcIjpcbiAgICBwb3BVcENoYXI6NDBcbiAgICBwb3BVcFRvcDo0XG4gICAgaGVpZ2h0OjIxNVxuICAgIGxpbmVIZWlnaHQ6MzZcbiAgICBsZXR0ZXJLZXk6XG4gICAgICBrZXlUb3A6NlxuICAgICAgaGVpZ2h0OjM5XG4gICAgICB3aWR0aDoyNi41XG4gICAgICBib3JkZXJSYWRpdXM6NVxuICAgICAgZm9udFNpemU6MjIuNVxuICAgIHNwZWNpYWxLZXlXaWR0aDozOC41XG4gICAgc3BlY2lhbEtleUhlaWdodDozOC41XG4gICAgc3BhY2U6NVxuICAgIHJvdzE6XG4gICAgICBsZWFkaW5nOjBcbiAgICAgIHRvcDowXG4gICAgcm93MjpcbiAgICAgIGxlYWRpbmc6MTlcbiAgICAgIHRvcDoxNlxuICAgIHJvdzM6XG4gICAgICB0b3A6MTZcbiAgICAgIGxlYWRpbmc6NTFcbiAgICBhcmVhOlxuICAgICAgdG9wOjExXG4gICAgICBsZWFkaW5nOjNcbiAgICAgIHRyYWlsaW5nOjNcbiAgICAgIGJvdHRvbTo0XG4gICAgcmV0dXJuV2lkdGg6NzVcbiAgICBwb3BVcE9mZnNldDpcbiAgICAgIHg6NFxuICAgICAgeTozMFxuICBcImlwaG9uZS02c1wiOlxuICAgIHBvcFVwQ2hhcjo0MFxuICAgIHBvcFVwVG9wOjZcbiAgICBoZWlnaHQ6MjE4XG4gICAgbGluZUhlaWdodDo0MFxuICAgIGxldHRlcktleTpcbiAgICAgIGtleVRvcDoxMFxuICAgICAgaGVpZ2h0OjQyXG4gICAgICB3aWR0aDozMS41XG4gICAgICBib3JkZXJSYWRpdXM6NVxuICAgICAgZm9udFNpemU6MjNcbiAgICAgIHRvcDoxMFxuICAgIHNwZWNpYWxLZXlXaWR0aDo0MlxuICAgIHNwZWNpYWxLZXlIZWlnaHQ6NDJcbiAgICBzcGFjZTo2XG4gICAgcm93MTpcbiAgICAgIGxlYWRpbmc6MFxuICAgICAgdG9wOjBcbiAgICByb3cyOlxuICAgICAgbGVhZGluZzoyMlxuICAgICAgdG9wOjEyXG4gICAgcm93MzpcbiAgICAgIHRvcDoxMlxuICAgICAgbGVhZGluZzo1OVxuICAgIGFyZWE6XG4gICAgICB0b3A6MTJcbiAgICAgIGxlYWRpbmc6M1xuICAgICAgdHJhaWxpbmc6M1xuICAgICAgYm90dG9tOjRcbiAgICByZXR1cm5XaWR0aDo4N1xuICAgIHBvcFVwT2Zmc2V0OlxuICAgICAgeDo1XG4gICAgICB5OjMyXG4gIFwiaXBob25lLTZzLXBsdXNcIjpcbiAgICBwb3BVcENoYXI6MzhcbiAgICBwb3BVcFRvcDo2XG4gICAgaGVpZ2h0OjIyNlxuICAgIGxpbmVIZWlnaHQ6NDJcbiAgICBsZXR0ZXJLZXk6XG4gICAgICBrZXlUb3A6MTJcbiAgICAgIGhlaWdodDo0NVxuICAgICAgd2lkdGg6MzZcbiAgICAgIGJvcmRlclJhZGl1czo1XG4gICAgICBmb250U2l6ZToyNFxuICAgICAgdG9wOjEwXG4gICAgc3BlY2lhbEtleVdpZHRoOjQ1XG4gICAgc3BlY2lhbEtleUhlaWdodDo0NVxuICAgIHNwYWNlOjVcbiAgICByb3cxOlxuICAgICAgbGVhZGluZzowXG4gICAgICB0b3A6MFxuICAgIHJvdzI6XG4gICAgICBsZWFkaW5nOjIwXG4gICAgICB0b3A6MTFcbiAgICByb3czOlxuICAgICAgdG9wOjExXG4gICAgICBsZWFkaW5nOjYzXG4gICAgYXJlYTpcbiAgICAgIHRvcDo4XG4gICAgICBsZWFkaW5nOjRcbiAgICAgIHRyYWlsaW5nOjRcbiAgICAgIGJvdHRvbTo1XG4gICAgcmV0dXJuV2lkdGg6OTdcbiAgICBwb3BVcE9mZnNldDpcbiAgICAgIHg6MTBcbiAgICAgIHk6MzhcbiAgXCJpcGFkXCI6XG4gICAgaGVpZ2h0OjMxM1xuICAgIGxpbmVIZWlnaHQ6NTVcbiAgICBsZXR0ZXJLZXk6XG4gICAgICBoZWlnaHQ6NTVcbiAgICAgIHdpZHRoOjU2XG4gICAgICBib3JkZXJSYWRpdXM6NVxuICAgICAgZm9udFNpemU6MjNcbiAgICBzcGVjaWFsS2V5V2lkdGg6NTZcbiAgICBzcGVjaWFsS2V5SGVpZ2h0OjU1XG4gICAgc3BhY2U6MTJcbiAgICByZXR1cm5XaWR0aDoxMDZcbiAgICByb3cxOlxuICAgICAgbGVhZGluZzowXG4gICAgICB0b3A6MFxuICAgIHJvdzI6XG4gICAgICBsZWFkaW5nOjMwXG4gICAgICB0b3A6OVxuICAgIHJvdzM6XG4gICAgICBsZWFkaW5nOjY4XG4gICAgICB0b3A6OVxuICAgIGFyZWE6XG4gICAgICB0b3A6NTVcbiAgICAgIGxlYWRpbmc6NlxuICAgICAgdHJhaWxpbmc6NlxuICAgICAgYm90dG9tOjhcblxuICBcImlwYWQtcHJvXCI6XG4gICAgaGVpZ2h0OjM3OFxuICAgIGxpbmVIZWlnaHQ6NjFcbiAgICBsZXR0ZXJLZXk6XG4gICAgICBoZWlnaHQ6NjFcbiAgICAgIHdpZHRoOjYzXG4gICAgICBib3JkZXJSYWRpdXM6NVxuICAgICAgZm9udFNpemU6MjNcbiAgICBzcGFjZTo3XG4gICAgcmV0dXJuV2lkdGg6MTIwXG4gICAgc3BlY2lhbEtleUhlaWdodDo2MVxuICAgIHNwZWNpYWxLZXlXaWR0aDo5M1xuICAgIHJvdzE6XG4gICAgICBsZWFkaW5nOjExMVxuICAgICAgdG9wOjUzXG4gICAgcm93MjpcbiAgICAgIGxlYWRpbmc6MTI2XG4gICAgICB0b3A6N1xuICAgIHJvdzM6XG4gICAgICBsZWFkaW5nOjE2MVxuICAgICAgdG9wOjdcbiAgICBhcmVhOlxuICAgICAgdG9wOjU2XG4gICAgICBsZWFkaW5nOjRcbiAgICAgIHRyYWlsaW5nOjRcbiAgICAgIGJvdHRvbTo0XG5cblxuXG4jIE1hcCBvZiBrZXkgY29kZXNcbiMgQ29kZXMgZm9yIGFsbCBrZXlzXG5jb2RlTWFwID0geyA4OidkZWxldGUnLCA5Oid0YWInLCAxMzoncmV0dXJuJywgMTY6J3NoaWZ0JywgMjA6J2NhcHMnLCAzMjonc3BhY2UnLCAyNzpcImRpc21pc3NcIiwgMzM6XCIhXCIsIDM0OlwiXFxcIlwiLCAzNTpcIiNcIiwgMzY6XCIkXCIsIDM3OlwiJVwiLCAzODpcIiZcIiwgMzk6XCJcXCdcIiwgNDA6XCIoXCIsIDQxOlwiKVwiLCA0MjpcIipcIiwgNDM6XCIrXCIsIDQ0OlwiLFwiLCA0NTpcIi1cIiwgNDc6XCIvXCIsIDQ2OlwiLlwiLCA0ODpcIjBcIiwgNDk6XCIhXCIsIDUwOlwiQFwiLCA1MTpcIiNcIiwgNTI6XCIkXCIsIDUzOlwiJVwiLCA1NDpcIl5cIiwgNTU6XCImXCIsIDU2OlwiKlwiLCA1NzpcIihcIiwgNDg6XCIpXCIsIDU5OlwiX1wiLCA2MDpcIjxcIiwgNjE6XCI9XCIsIDYyOlwiPlwiLCA2MzpcIj9cIiwgNjQ6XCJAXCIsIDY1OlwiQVwiLCA2NjpcIkJcIiwgNjc6XCJDXCIsIDY4OlwiRFwiLCA2OTpcIkVcIiwgNzA6XCJGXCIsIDcxOlwiR1wiLCA3MjpcIkhcIiwgNzM6XCJJXCIsIDc0OlwiSlwiLCA3NTpcIktcIiwgNzY6XCJMXCIsIDc3OlwiTVwiLCA3ODpcIk5cIiwgNzk6XCJPXCIsIDgwOlwiUFwiLCA4MTpcIlFcIiwgODI6XCJSXCIsIDgzOlwiU1wiLCA4NDpcIlRcIiwgODU6XCJVXCIsIDg2OlwiVlwiLCA4NzpcIldcIiwgODg6XCJYXCIsIDg5OlwiWVwiLCA5MDpcIlpcIiwgOTE6J2NtZCcsIDIxOTpcIltcIiwgOTI6XCJcXFxcXCIsIDIyMTpcIl1cIiwgOTQ6XCJeXCIsIDk1OlwiX1wiLCA5NjpcImBcIiwgOTc6XCJhXCIsIDk4OlwiYlwiLCA5OTpcImNcIiwgMTAwOlwiZFwiLCAxMDE6XCJlXCIsIDEwMjpcImZcIiwgMTAzOlwiZ1wiLCAxMDQ6XCJoXCIsIDEwNTpcImlcIiwgMTA2OlwialwiLCAxMDc6XCJrXCIsIDEwODpcImxcIiwgMTA5OlwibVwiLCAxMTA6XCJuXCIsIDExMTpcIm9cIiwgMTEyOlwicFwiLCAxMTM6XCJxXCIsIDExNDpcInJcIiwgMTE1Olwic1wiLCAxMTY6XCJ0XCIsIDExNzpcInVcIiwgMTE4OlwidlwiLCAxMTk6XCJ3XCIsIDEyMDpcInhcIiwgMTIxOlwieVwiLCAxMjI6XCJ6XCIsIDEyMzpcIntcIiwgMTI0OlwifFwiLCAxMjU6XCJ9XCIsIDEyNjpcIn5cIiwgMTg2OlwiOlwiLCAxODc6XCIrXCIsIDE4ODpcIjxcIiwgMTkwOlwiPlwiLCAxOTE6XCI/XCIsIDE4OTpcIl9cIiwgMTkyOlwiflwiLCAyMTk6XCJ7XCIsIDIyMDpcIlxcfFwiLCAyMjE6XCJ9XCIsIDIyMjpcIiZyZHF1bztcIn1cbmFycmF5T2ZDb2RlcyA9IE9iamVjdC5rZXlzKGNvZGVNYXApXG5sZXR0ZXJzID0gW1wicVwiLCBcIndcIiwgXCJlXCIsIFwiclwiLCBcInRcIiwgXCJ5XCIsIFwidVwiLCBcImlcIiwgXCJvXCIsIFwicFwiLCBcImFcIiwgXCJzXCIsIFwiZFwiLCBcImZcIiwgXCJnXCIsIFwiaFwiLCBcImpcIiwgXCJrXCIsIFwibFwiLCBcInpcIiwgXCJ4XCIsIFwiY1wiLCBcInZcIiwgIFwiYlwiLCBcIm5cIiwgXCJtXCJdXG5udW1iZXJzID0gW1wiMVwiLCBcIjJcIiwgXCIzXCIsIFwiNFwiLCBcIjVcIiwgXCI2XCIsIFwiN1wiLCBcIjhcIiwgXCI5XCIsIFwiMFwiLCBcIi1cIiwgXCIvXCIsIFwiOlwiLCBcIjtcIiwgXCIoXCIsIFwiKVwiLCBcIiRcIiwgXCImXCIsIFwiQFwiLCBcIlxcXCJcIiwgXCIuXCIsIFwiLFwiLCBcIj9cIiwgXCIhXCIsIFwi4oCyXCJdXG5zeW1ib2xzID0gW1wiW1wiLCBcIl1cIiwgXCJ7XCIsIFwifVwiLCBcIiNcIiwgXCIlXCIsIFwiXlwiLCBcIipcIiwgXCIrXCIsIFwiPVwiLCBcIl9cIiwgXCJcXFxcXCIsIFwifFwiLCBcIn5cIiwgXCI8XCIsIFwiPlwiLCBcIuKCrFwiLCBcIsKjXCIsIFwiwqVcIiwgXCLigKJcIl1cblxuZXhwb3J0cy5kZWZhdWx0cy5wcm9wcyA9IE9iamVjdC5rZXlzKGV4cG9ydHMuZGVmYXVsdHMpXG5cbmV4cG9ydHMuY3JlYXRlID0gKG9iaikgLT5cbiAgc2V0dXAgPSBpb3MudXRpbHMuc2V0dXBDb21wb25lbnQob2JqLCBleHBvcnRzLmRlZmF1bHRzKVxuICAjUmVzcG9uc2FiaWxlIGZvciBjb2xvcnNcbiAgc3R5bGUgPVxuICAgIGxpZ2h0OlxuICAgICAgYmFja2dyb3VuZENvbG9yOlwiI0QxRDVEQVwiXG4gICAgICBjb2xvcjpcIiMwMDBcIlxuICAgICAgc3BlY2lhbEtleUJHOlwiI0FDQjNCRFwiXG4gICAgICBrZXlCRzpcIiNGN0Y3RjdcIlxuICAgICAgc2hhZG93WTogaW9zLnB4KDEpXG4gICAgICBzaGFkb3dDb2xvcjpcIiM4OThCOEZcIlxuICAgICAgcmV0dXJuQkc6aW9zLmNvbG9yKHNldHVwLnJldHVybkNvbG9yKVxuICAgIGRhcms6XG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6XCJyZ2JhKDAsMCwwLC43KVwiXG4gICAgICBjb2xvcjpcIiNGRkZcIlxuICAgICAgc3BlY2lhbEtleUJHOlwicmdiYSg2Nyw2Nyw2NywuOClcIlxuICAgICAga2V5Qkc6XCJyZ2JhKDEwNSwxMDUsMTA1LC44KVwiXG4gICAgICBzaGFkb3dZOiBpb3MucHgoMSlcbiAgICAgIHNoYWRvd0NvbG9yOlwicmdiYSgwLDAsMCwuNClcIlxuICAgICAgcmV0dXJuQkc6aW9zLmNvbG9yKHNldHVwLnJldHVybkNvbG9yKVxuXG4gIHNwZWNzID0gZGV2aWNlW2lvcy5kZXZpY2UubmFtZV1cbiAgY29sb3JzID0gc3R5bGVbc2V0dXAuc3R5bGVdXG5cbiAgZGV2aWNlXG4gIGJvYXJkID0gbmV3IGlvcy5WaWV3XG4gICAgbmFtZTpcIktleWJvYXJkXCJcbiAgICBzdXBlckxheWVyOnNldHVwLnN1cGVyTGF5ZXJcbiAgICBiYWNrZ3JvdW5kQ29sb3I6c3R5bGVbc2V0dXAuc3R5bGVdLmJhY2tncm91bmRDb2xvclxuICAgIHk6aW9zLmRldmljZS5oZWlnaHRcbiAgICBjb25zdHJhaW50czpcbiAgICAgIGxlYWRpbmc6MFxuICAgICAgdHJhaWxpbmc6MFxuICAgICAgYm90dG9tOi0xICogc3BlY3MuaGVpZ2h0XG4gICAgICBoZWlnaHQ6c3BlY3MuaGVpZ2h0XG4gIGlvcy51dGlscy5iZ0JsdXIoYm9hcmQpXG4gIGJvYXJkLm91dHB1dCA9IChvYmopIC0+XG4gICAgaWYgYm9hcmQudGFyZ2V0XG4gICAgICBpZiBib2FyZC50YXJnZXQudHlwZSA9PSAnZmllbGQnXG4gICAgICAgIGJvYXJkLnRhcmdldC5hY3RpdmUgPSBmYWxzZVxuXG4gICAgYm9hcmQudGFyZ2V0ID0gb2JqXG4gICAgaWYgYm9hcmQudGFyZ2V0XG4gICAgICBpZiBib2FyZC50YXJnZXQudHlwZSA9PSAnZmllbGQnXG4gICAgICAgIGJvYXJkLnRhcmdldC5hY3RpdmUgPSB0cnVlXG4gIGJvYXJkLmhpZGRlbiA9IHNldHVwLmhpZGRlblxuXG4gIGlmIGJvYXJkLmhpZGRlbiA9PSBmYWxzZVxuICAgIGJvYXJkLmNvbnN0cmFpbnRzLmJvdHRvbSA9IDBcbiAgICBpb3MubGF5b3V0LnNldChib2FyZClcblxuICBib2FyZC5jYWxsID0gKCkgLT5cbiAgICBib2FyZC55ID0gaW9zLmRldmljZS5oZWlnaHRcbiAgICBib2FyZC5jb25zdHJhaW50cy5ib3R0b20gPSAwXG4gICAgaWYgYm9hcmQuaGlkZGVuXG4gICAgICBib2FyZC5oaWRkZW4gPSBmYWxzZVxuICAgICAgaW9zLmxheW91dC5hbmltYXRlXG4gICAgICAgIHRhcmdldDpib2FyZFxuICAgICAgICB0aW1lOi41XG4gICAgICAgIGN1cnZlOidlYXNlLWluLW91dCdcblxuICAgIGJvYXJkLmJyaW5nVG9Gcm9udCgpXG4gIGJvYXJkLmRpc21pc3MgPSAoKSAtPlxuICAgIGJvYXJkLmNvbnN0cmFpbnRzLmJvdHRvbSA9IC0xICogaW9zLnB0KGJvYXJkLmhlaWdodClcbiAgICBib2FyZC5oaWRkZW4gPSB0cnVlXG4gICAgYm9hcmQudGFyZ2V0LmFjdGl2ZSA9IGZhbHNlXG4gICAgaW9zLmxheW91dC5hbmltYXRlXG4gICAgICB0YXJnZXQ6Ym9hcmRcbiAgICAgIHRpbWU6LjVcbiAgICAgIGN1cnZlOidlYXNlLWluLW91dCdcblxuICBib2FyZC5kZWxldGUgPSAoKSAtPlxuICAgIGxheWVyID0gXCJcIlxuICAgIGlmIGJvYXJkLnRhcmdldFxuICAgICAgaWYgYm9hcmQudGFyZ2V0LnR5cGUgPT0gJ2ZpZWxkJ1xuICAgICAgICBsYXllciA9IGJvYXJkLnRhcmdldC50ZXh0XG4gICAgICBlbHNlXG4gICAgICAgIGxheWVyID0gYm9hcmQudGFyZ2V0XG5cbiAgICAgIGlzU3BhY2UgPSBsYXllci5odG1sW2xheWVyLmh0bWwubGVuZ3RoIC0gNS4ubGF5ZXIuaHRtbC5sZW5ndGggLSAxIF1cblxuICAgICAgaWYgaXNTcGFjZSAhPSAnbmJzcDsnXG4gICAgICAgIHRleHQgPSBsYXllci5odG1sLnNsaWNlKDAsIC0xKVxuICAgICAgICBsYXllci5odG1sID0gdGV4dFxuICAgICAgZWxzZVxuICAgICAgICB0ZXh0ID0gbGF5ZXIuaHRtbC5zbGljZSgwLCAtNilcbiAgICAgICAgbGF5ZXIuaHRtbCA9IHRleHRcblxuICBib2FyZC5jYXBzTG9jayA9ICgpIC0+XG4gICAgYm9hcmQuaXNDYXBzTG9jayA9IHRydWVcbiAgICBib2FyZC5pc0NhcGl0YWwgPSB0cnVlXG4gICAgYm9hcmQua2V5cy5zaGlmdC5pY29uLnRvZ2dsZSgnb2ZmJylcbiAgICBoYW5kbGVLZXlDb2xvcihib2FyZC5rZXlzLnNoaWZ0KVxuICAgIGlmIGlvcy5kZXZpY2UubmFtZSA9PSAnaXBhZC1wcm8nXG4gICAgICBib2FyZC5rZXlzLnNoaWZ0YWx0Lmljb24udG9nZ2xlKCdvZmYnKVxuICAgICAgaGFuZGxlS2V5Q29sb3IoYm9hcmQua2V5cy5zaGlmdGFsdClcblxuICBib2FyZC5vdXRwdXQoc2V0dXAub3V0cHV0KVxuICBib2FyZC5rZXlzQXJyYXkgPSBbXVxuICBib2FyZC5rZXlzID0ge31cbiAgYm9hcmQuaXNDYXBpdGFsID0gc2V0dXAuc2hpZnRcbiAgYm9hcmQuYXJlYSA9IG5ldyBpb3MuVmlld1xuICAgIG5hbWU6XCIuYXJlYVwiXG4gICAgc3VwZXJMYXllcjpib2FyZFxuICAgIGNvbnN0cmFpbnRzOiBzcGVjcy5hcmVhXG4gICAgYmFja2dyb3VuZENvbG9yOlwidHJhbnNwYXJlbnRcIlxuXG4gIEtleSA9IChvYmopIC0+XG4gICAga2V5ID0gbmV3IGlvcy5WaWV3XG4gICAgICBuYW1lOlwiLmtleXMuXCIgKyBvYmoubmFtZVxuICAgICAgY29uc3RyYWludHM6b2JqLmNvbnN0cmFpbnRzXG4gICAgICBzdXBlckxheWVyOmJvYXJkLmFyZWFcbiAgICAgIGJvcmRlclJhZGl1czppb3MucHgoc3BlY3MubGV0dGVyS2V5LmJvcmRlclJhZGl1cylcbiAgICAgIHNoYWRvd1k6Y29sb3JzLnNoYWRvd1lcbiAgICAgIHNoYWRvd0NvbG9yOmNvbG9ycy5zaGFkb3dDb2xvclxuICAgIGtleS5zdHlsZS5mb250RmFtaWx5ID0gXCItYXBwbGUtc3lzdGVtLCBIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmXCJcblxuICAgICNEaXNhYmxlcyBab29tXG4gICAga2V5Lm9uIEV2ZW50cy5Ub3VjaFN0YXJ0LCAoZXZlbnQpIC0+XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgcmV0dXJuIGtleVxuXG4gIExldHRlciA9IChvYmopIC0+XG4gICAga2V5ID0gbmV3IEtleSBvYmpcbiAgICBrZXkuYmFja2dyb3VuZENvbG9yID0gY29sb3JzLmtleUJHXG4gICAga2V5Lmh0bWwgPSBvYmoubGV0dGVyXG4gICAga2V5LmNvbG9yID0gY29sb3JzLmNvbG9yXG4gICAga2V5LnN0eWxlLnRleHRBbGlnbiA9IFwiY2VudGVyXCJcbiAgICBrZXkuc3R5bGUubGluZUhlaWdodCA9IGlvcy5weChzcGVjcy5saW5lSGVpZ2h0KSArIFwicHhcIlxuICAgIGtleS5zdHlsZS5mb250U2l6ZSA9IGlvcy5weChzcGVjcy5sZXR0ZXJLZXkuZm9udFNpemUpICsgXCJweFwiXG4gICAga2V5LnZhbHVlID0gb2JqLmxldHRlclxuXG5cbiAgICBpZiBrZXkudmFsdWUgPT0gXCJzcGFjZVwiIHRoZW4ga2V5LnZhbHVlID0gXCImbmJzcDtcIlxuICAgIGlmIGlvcy5pc1BhZCgpXG4gICAgICBrZXkuZG93biA9IC0+XG4gICAgICAgIGtleS5iYWNrZ3JvdW5kQ29sb3IgPSBjb2xvcnMuc3BlY2lhbEtleUJHXG4gICAgICAgIGlmIGJvYXJkLnRhcmdldCB0aGVuIGlvcy51dGlscy53cml0ZShib2FyZC50YXJnZXQsIGtleS52YWx1ZSlcbiAgICAgIGtleS51cCA9IC0+XG4gICAgICAgIGtleS5iYWNrZ3JvdW5kQ29sb3IgPSBjb2xvcnMua2V5QkdcbiAgICAgICAgaWYgYm9hcmQuaXNDYXBpdGFsICYmIGJvYXJkLmlzQ2Fwc0xvY2sgIT0gdHJ1ZVxuICAgICAgICAgIGJvYXJkLmlzQ2FwaXRhbCA9IGZhbHNlXG4gICAgICAgICAgY2FwaXRhbGl6ZUtleXMoKVxuICAgICAgICAgIGJvYXJkLmtleXMuc2hpZnQudXAoKVxuICAgICAgICAgIGlmIGlvcy5pc1BhZCgpIHRoZW4gYm9hcmQua2V5cy5zaGlmdGFsdC51cCgpXG4gICAgICBrZXkub24gRXZlbnRzLlRvdWNoU3RhcnQsIC0+XG4gICAgICAgIGtleS5kb3duKClcbiAgICAgIGtleS5vbiBFdmVudHMuVG91Y2hFbmQsIC0+XG4gICAgICAgIGtleS51cCgpXG4gICAgZWxzZVxuICAgICAgaWYga2V5LnZhbHVlICE9ICcmbmJzcDsnXG4gICAgICAgIGtleS5kb3duID0gLT5cbiAgICAgICAgICBib2FyZC5wb3BVcC52aXNpYmxlID0gdHJ1ZVxuICAgICAgICAgIGJvYXJkLmJyaW5nVG9Gcm9udCgpXG4gICAgICAgICAgYm9hcmQucG9wVXAuYnJpbmdUb0Zyb250KClcbiAgICAgICAgICBib2FyZC5wb3BVcC5taWRYID0ga2V5Lm1pZFhcbiAgICAgICAgICBib2FyZC5wb3BVcC5tYXhZID0ga2V5Lm1heFlcbiAgICAgICAgICBib2FyZC5wb3BVcC50ZXh0Lmh0bWwgPSBrZXkudmFsdWVcblxuICAgICAgICAgIGlmIGJvYXJkLnRhcmdldCB0aGVuIGlvcy51dGlscy53cml0ZShib2FyZC50YXJnZXQsIGtleS52YWx1ZSlcblxuXG4gICAgICAgIGtleS51cCA9IC0+XG4gICAgICAgICAgYm9hcmQucG9wVXAudmlzaWJsZSA9IGZhbHNlXG4gICAgICAgICAgaWYgYm9hcmQuaXNDYXBpdGFsICYmIGJvYXJkLmNhcHNMb2NrICE9IHRydWVcbiAgICAgICAgICAgIGJvYXJkLmlzQ2FwaXRhbCA9IGZhbHNlXG4gICAgICAgICAgICBjYXBpdGFsaXplS2V5cygpXG4gICAgICAgICAgICBib2FyZC5rZXlzLnNoaWZ0LnVwKClcblxuICAgICAgICBrZXkub24gRXZlbnRzLlRvdWNoU3RhcnQsIC0+IGtleS5kb3duKClcbiAgICAgICAga2V5Lm9uIEV2ZW50cy5Ub3VjaEVuZCwgLT4ga2V5LnVwKClcbiAgICAgIGVsc2VcblxuICAgICAgICBrZXkuZG93biA9IC0+XG4gICAgICAgICAga2V5LmJhY2tncm91bmRDb2xvciA9IGNvbG9ycy5zcGVjaWFsS2V5QkdcbiAgICAgICAgICBpZiBib2FyZC50YXJnZXQgdGhlbiBpb3MudXRpbHMud3JpdGUoYm9hcmQudGFyZ2V0LCBrZXkudmFsdWUpXG4gICAgICAgIGtleS51cCA9IC0+XG4gICAgICAgICAga2V5LmJhY2tncm91bmRDb2xvciA9IGNvbG9ycy5rZXlCR1xuICAgICAgICBrZXkub24gRXZlbnRzLlRvdWNoU3RhcnQsIC0+XG4gICAgICAgICAga2V5LmRvd24oKVxuICAgICAgICBrZXkub24gRXZlbnRzLlRvdWNoRW5kLCAtPlxuICAgICAgICAgIGtleS51cCgpXG5cbiAgICByZXR1cm4ga2V5XG5cbiAgU3BlY2lhbEtleSA9IChvYmopIC0+XG4gICAga2V5ID0gbmV3IEtleSBvYmpcbiAgICBrZXkuYmFja2dyb3VuZENvbG9yID0gY29sb3JzLnNwZWNpYWxLZXlCR1xuICAgIGtleS5jb2xvciA9IGNvbG9ycy5jb2xvclxuICAgIGtleS5zdHlsZS50ZXh0QWxpZ24gPSBcImNlbnRlclwiXG4gICAgaWYgaW9zLmRldmljZS5uYW1lID09ICdpcGFkLXBybydcbiAgICAgIGtleS5zdHlsZS5mb250U2l6ZSA9IGlvcy5weCgxOCkgKyBcInB4XCJcbiAgICBlbHNlXG4gICAgICBrZXkuc3R5bGUuZm9udFNpemUgPSBpb3MucHgoMTYpICsgXCJweFwiXG4gICAgcmV0dXJuIGtleVxuXG4gIEljb24gPSAob2JqKSAtPlxuICAgIGljb24gPSBuZXcgaW9zLlZpZXdcbiAgICAgIG5hbWU6J2ljb24nXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6XCJ0cmFuc3BhcmVudFwiXG4gICAgICBzdXBlckxheWVyOm9iai5zdXBlckxheWVyXG4gICAgICBjb25zdHJhaW50czpcbiAgICAgICAgYWxpZ246J2NlbnRlcidcblxuICAgIGljb24ucHJvcHMgPSAoaGVpZ2h0Om9iai5pY29uLmhlaWdodCwgd2lkdGg6b2JqLmljb24ud2lkdGgsIGh0bWw6IG9iai5pY29uLnN2ZylcblxuICAgIGlvcy51dGlscy5jaGFuZ2VGaWxsKGljb24sIGNvbG9ycy5jb2xvcilcbiAgICByZXR1cm4gaWNvblxuXG4gIEljb25XaXRoU3RhdGUgPSAob2JqKSAtPlxuICAgIGljb24gPSBuZXcgaW9zLlZpZXdcbiAgICAgIG5hbWU6J2ljb24nXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6XCJ0cmFuc3BhcmVudFwiXG4gICAgICBzdXBlckxheWVyOm9iai5zdXBlckxheWVyXG4gICAgICBjb25zdHJhaW50czpcbiAgICAgICAgYWxpZ246J2NlbnRlcidcblxuICAgIGljb24udG9nZ2xlID0gKHN0YXRlKSAtPlxuICAgICAgaWYgc3RhdGUgPT0gdW5kZWZpbmVkXG4gICAgICAgIGlmIGljb24uc3RhdGUgPT0gJ29uJyB0aGVuIHN0YXRlID0gJ29mZidcbiAgICAgICAgZWxzZSBzdGF0ZSA9ICdvbidcblxuICAgICAgaWYgc3RhdGUgPT0gXCJvblwiXG4gICAgICAgIGlmIGlvcy5kZXZpY2UubmFtZSAhPSAnaXBhZC1wcm8nXG4gICAgICAgICAgaWNvbi5odG1sID0gb2JqLm9uLnN2Z1xuICAgICAgICAgIGljb24ud2lkdGggPSBvYmoub24ud2lkdGhcbiAgICAgICAgICBpY29uLmhlaWdodCA9IG9iai5vbi5oZWlnaHRcbiAgICAgICAgaWNvbi5zdGF0ZSA9ICdvbidcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgaW9zLmRldmljZS5uYW1lICE9ICdpcGFkLXBybydcbiAgICAgICAgICBpY29uLmh0bWwgPSBvYmoub2ZmLnN2Z1xuICAgICAgICAgIGljb24ud2lkdGggPSBvYmoub24ud2lkdGhcbiAgICAgICAgICBpY29uLmhlaWdodCA9IG9iai5vbi5oZWlnaHRcbiAgICAgICAgaWNvbi5zdGF0ZSA9ICdvZmYnXG4gICAgICBpb3MudXRpbHMuY2hhbmdlRmlsbChpY29uLCBjb2xvcnMuY29sb3IpXG4gICAgaWYgb2JqLnN0YXRlXG4gICAgICBpY29uLnRvZ2dsZSgnb24nKVxuICAgIGVsc2VcbiAgICAgIGljb24udG9nZ2xlKCdvZmYnKVxuXG5cbiAgICByZXR1cm4gaWNvblxuXG4gIGNhcGl0YWxpemVLZXlzID0gLT5cbiAgICBmb3Iga2V5IGluIGJvYXJkLmtleXNBcnJheVxuICAgICAgaWYgYm9hcmQuaXNDYXBpdGFsXG4gICAgICAgIGlmIGtleS5odG1sLmxlbmd0aCA9PSAxICYmIGtleS5odG1sLm1hdGNoKC9bYS16XS9pKVxuICAgICAgICAgIGtleS5odG1sID0ga2V5Lmh0bWwudG9VcHBlckNhc2UoKVxuICAgICAgICAgIGtleS52YWx1ZSA9IGtleS5odG1sXG4gICAgICAgIGlmIGtleS5hbHRcbiAgICAgICAgICBrZXkuYWx0LmRlc3Ryb3koKVxuICAgICAgICAgIGtleS5hbHQgPSB1bmRlZmluZWRcbiAgICAgICAgaWYga2V5LmhlaWdodCA+IGlvcy5weCg0NilcbiAgICAgICAgICBrZXkuc3R5bGUubGluZUhlaWdodCA9IGlvcy5weChzcGVjcy5sZXR0ZXJLZXkuaGVpZ2h0KSArICdweCdcbiAgICAgICAgICBrZXkuc3R5bGUuZm9udFNpemUgPSBpb3MucHgoMjMpICsgJ3B4J1xuICAgICAgICBlbHNlXG4gICAgICAgICAgaWYgaW9zLmRldmljZS5uYW1lID09ICdpcGFkLXBybydcbiAgICAgICAgICAgIGtleS5zdHlsZS5saW5lSGVpZ2h0ID0gaW9zLnB4KDQ2KSArICdweCdcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBrZXkuc3R5bGUubGluZUhlaWdodCA9IGlvcy5weChzcGVjcy5saW5lSGVpZ2h0KSArICdweCdcbiAgICAgICAgICBrZXkuc3R5bGUuZm9udFNpemUgPSBpb3MucHgoMjApICsgJ3B4J1xuICAgICAgICBrZXkudmFsdWUgPSBrZXkuaHRtbFxuICAgICAgZWxzZVxuICAgICAgICBpZiBrZXkuaHRtbC5sZW5ndGggPT0gMSAmJiBrZXkuaHRtbC5tYXRjaCgvW2Etel0vaSlcbiAgICAgICAgICBrZXkuaHRtbCA9IGtleS5odG1sLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBrZXkudmFsdWUgPSBrZXkuaHRtbFxuICAgICAgICBlbHNlXG4gICAgICAgICAgaWYga2V5LmFsdCA9PSB1bmRlZmluZWRcbiAgICAgICAgICAgIGtleS5hbHQgPSBuZXcgaW9zLlRleHRcbiAgICAgICAgICAgICAgdGV4dDpcIlwiXG4gICAgICAgICAgICAgIHN1cGVyTGF5ZXI6a2V5XG4gICAgICAgICAgICAgIGNvbG9yOmNvbG9ycy5jb2xvclxuICAgICAgICAgICAgICBjb25zdHJhaW50czpcbiAgICAgICAgICAgICAgICBhbGlnbjpcImhvcml6b250YWxcIlxuICAgICAgICAgICAgICAgIGJvdHRvbTo0XG4gICAgICAgICAgICAgIGZvbnRTaXplOnNwZWNzLmxldHRlcktleS5mb250U2l6ZVxuICAgICAgICAgICAgaWYgYm9hcmQudG9wUm93XG4gICAgICAgICAgICAgIGlmIGJvYXJkLnRvcFJvdy5pbmRleE9mKGtleSkgIT0gLTFcbiAgICAgICAgICAgICAgICBrZXkuc3R5bGUubGluZUhlaWdodCA9IGlvcy5weCgyMykgKyAncHgnXG4gICAgICAgICAgICAgICAga2V5LnN0eWxlLmZvbnRTaXplID0gaW9zLnB4KDE2KSArICdweCdcbiAgICAgICAgICAgICAgICBrZXkuYWx0LnN0eWxlLmZvbnRTaXplID0gaW9zLnB4KDE2KSArICdweCdcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGtleS5zdHlsZS5saW5lSGVpZ2h0ID0gaW9zLnB4KDM2KSArICdweCdcbiAgICAgICAgICAgICAgICBrZXkuc3R5bGUuZm9udFNpemUgPSBpb3MucHgoMjApICsgJ3B4J1xuICAgICAgICAgICAgICAgIGtleS5hbHQuc3R5bGUuZm9udFNpemUgPSBpb3MucHgoMjApICsgJ3B4J1xuICAgICAgICAgICAgICAgIGtleS5hbHQuY29uc3RyYWludHMuYm90dG9tID0gOFxuICAgICAgICAgICAgc3dpdGNoIGtleS52YWx1ZVxuICAgICAgICAgICAgICB3aGVuIFwiJmx0O1wiXG4gICAgICAgICAgICAgICAga2V5LmFsdC5odG1sID0gXCIuXCJcbiAgICAgICAgICAgICAgd2hlbiBcIiZndDtcIlxuICAgICAgICAgICAgICAgIGtleS5hbHQuaHRtbCA9IFwiLFwiXG4gICAgICAgICAgICAgIHdoZW4gXCI8XCJcbiAgICAgICAgICAgICAgICBrZXkuYWx0Lmh0bWwgPSBcIi5cIlxuICAgICAgICAgICAgICB3aGVuIFwiPlwiXG4gICAgICAgICAgICAgICAga2V5LmFsdC5odG1sID0gXCIsXCJcbiAgICAgICAgICAgICAgd2hlbiBcIj9cIlxuICAgICAgICAgICAgICAgIGtleS5hbHQuaHRtbCA9IFwiLlwiXG4gICAgICAgICAgICAgIHdoZW4gXCJ7XCJcbiAgICAgICAgICAgICAgICBrZXkuYWx0Lmh0bWwgPSBcIltcIlxuICAgICAgICAgICAgICB3aGVuIFwifVwiXG4gICAgICAgICAgICAgICAga2V5LmFsdC5odG1sID0gXCJ9XCJcbiAgICAgICAgICAgICAgd2hlbiBcIlxcfFwiXG4gICAgICAgICAgICAgICAga2V5LmFsdC5odG1sID0gXCJcXFxcXCJcbiAgICAgICAgICAgICAgd2hlbiBcIn5cIlxuICAgICAgICAgICAgICAgIGtleS5hbHQuaHRtbCA9IFwiYFwiXG4gICAgICAgICAgICAgIHdoZW4gXCIhXCJcbiAgICAgICAgICAgICAgICBrZXkuYWx0Lmh0bWwgPSBcIi5cIlxuICAgICAgICAgICAgICB3aGVuIFwiQFwiXG4gICAgICAgICAgICAgICAga2V5LmFsdC5odG1sID0gXCIyXCJcbiAgICAgICAgICAgICAgd2hlbiBcIiNcIlxuICAgICAgICAgICAgICAgIGtleS5hbHQuaHRtbCA9IFwiM1wiXG4gICAgICAgICAgICAgIHdoZW4gXCIkXCJcbiAgICAgICAgICAgICAgICBrZXkuYWx0Lmh0bWwgPSBcIjRcIlxuICAgICAgICAgICAgICB3aGVuIFwiJVwiXG4gICAgICAgICAgICAgICAga2V5LmFsdC5odG1sID0gXCI1XCJcbiAgICAgICAgICAgICAgd2hlbiBcIl5cIlxuICAgICAgICAgICAgICAgIGtleS5hbHQuaHRtbCA9IFwiNlwiXG4gICAgICAgICAgICAgIHdoZW4gXCImYW1wO1wiXG4gICAgICAgICAgICAgICAga2V5LmFsdC5odG1sID0gXCI3XCJcbiAgICAgICAgICAgICAgd2hlbiBcIiZcIlxuICAgICAgICAgICAgICAgIGtleS5hbHQuaHRtbCA9IFwiN1wiXG4gICAgICAgICAgICAgIHdoZW4gXCIqXCJcbiAgICAgICAgICAgICAgICBrZXkuYWx0Lmh0bWwgPSBcIjhcIlxuICAgICAgICAgICAgICB3aGVuIFwiKFwiXG4gICAgICAgICAgICAgICAga2V5LmFsdC5odG1sID0gXCI5XCJcbiAgICAgICAgICAgICAgd2hlbiBcIilcIlxuICAgICAgICAgICAgICAgIGtleS5hbHQuaHRtbCA9IFwiMFwiXG4gICAgICAgICAgICAgIHdoZW4gXCJfXCJcbiAgICAgICAgICAgICAgICBrZXkuYWx0Lmh0bWwgPSBcIi1cIlxuICAgICAgICAgICAgICB3aGVuIFwiK1wiXG4gICAgICAgICAgICAgICAga2V5LmFsdC5odG1sID0gXCI9XCJcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGtleS5hbHQuaHRtbCA9IFwiJnByaW1lO1wiXG4gICAgICAgICAgICBpb3MubGF5b3V0LnNldChrZXkuYWx0KVxuICAgICAgICAgICAgaWYgaW9zLmRldmljZS5uYW1lID09ICdpcGFkLXBybycgJiYga2V5LnZhbHVlID09ICchJyB0aGVuIGtleS5hbHQuaHRtbCA9ICcxJ1xuICAgICAgICAgICAgaWYgaW9zLmRldmljZS5uYW1lID09ICdpcGFkLXBybycgJiYga2V5LnZhbHVlID09ICc/JyB0aGVuIGtleS5hbHQuaHRtbCA9ICcvJ1xuICAgICAgICAgICAgaWYgaW9zLmRldmljZS5uYW1lID09ICdpcGFkLXBybycgJiYga2V5LnZhbHVlID09ICc6JyB0aGVuIGtleS5hbHQuaHRtbCA9ICc7J1xuICAgICAgICAgICAgaWYgaW9zLmRldmljZS5uYW1lID09ICdpcGFkLXBybycgJiYga2V5LnZhbHVlID09ICcmcmRxdW87JyB0aGVuIGtleS5hbHQuaHRtbCA9ICcmcHJpbWU7J1xuICAgICAgICAgICAga2V5LnZhbHVlID0ga2V5LmFsdC5odG1sXG5cbiAgaGFuZGxlS2V5Q29sb3IgPSAoa2V5KSAtPlxuICAgIGlmIGlvcy5pc1Bob25lXG4gICAgICBpZiBrZXkuaWNvbi5zdGF0ZSA9PSAnb24nIHRoZW4ga2V5LmJhY2tncm91bmRDb2xvciA9IGNvbG9ycy5rZXlCR1xuICAgICAgZWxzZSBrZXkuYmFja2dyb3VuZENvbG9yID0gY29sb3JzLnNwZWNpYWxLZXlCR1xuXG4gIFNwYWNlID0gKG9iaikgLT5cbiAgICBrZXkgPSBuZXcgTGV0dGVyIG9ialxuICAgIGtleS5odG1sID0gJ3NwYWNlJ1xuICAgIGtleS5iYWNrZ3JvdW5kQ29sb3IgPSBjb2xvcnMua2V5QkdcbiAgICBrZXkuc3R5bGUubGluZUhlaWdodCA9IGlvcy5weChzcGVjcy5zcGVjaWFsS2V5SGVpZ2h0KSArIFwicHhcIlxuICAgIGtleS5zdHlsZS5mb250U2l6ZSA9IGlvcy5weCgxNikgKyAncHgnXG4gICAgcmV0dXJuIGtleVxuXG4gIFNoaWZ0ID0gKG9iaikgLT5cbiAgICBrZXkgPSBuZXcgU3BlY2lhbEtleSBvYmpcbiAgICBrZXkuaWNvbiA9IG5ldyBJY29uV2l0aFN0YXRlXG4gICAgICBzdXBlckxheWVyOmtleVxuICAgICAgc3RhdGU6b2JqLnNoaWZ0XG4gICAgICBvbjppb3MudXRpbHMuc3ZnKGlvcy5hc3NldHMuc2hpZnQub24pXG4gICAgICBvZmY6aW9zLnV0aWxzLnN2Zyhpb3MuYXNzZXRzLnNoaWZ0Lm9mZilcbiAgICBoYW5kbGVLZXlDb2xvcihrZXkpXG5cbiAgICBrZXkub24gRXZlbnRzLlRvdWNoRW5kLCAtPlxuICAgICAgQC5pY29uLnRvZ2dsZSgpXG4gICAgICBoYW5kbGVLZXlDb2xvcihrZXkpXG4gICAgICBpZiBALmljb24uc3RhdGUgPT0gJ29uJ1xuICAgICAgICBib2FyZC5pc0NhcGl0YWwgPSB0cnVlXG4gICAgICBlbHNlXG4gICAgICAgIGJvYXJkLmlzQ2FwaXRhbCA9IGZhbHNlXG4gICAgICBjYXBpdGFsaXplS2V5cygpXG5cbiAgICBrZXkuZG93biA9IC0+XG4gICAgICBrZXkuaWNvbi50b2dnbGUoJ29uJylcbiAgICAgIGhhbmRsZUtleUNvbG9yKGtleSlcbiAgICAgIGJvYXJkLmlzQ2FwaXRhbCA9IHRydWVcbiAgICAgIGNhcGl0YWxpemVLZXlzKClcblxuICAgIGtleS51cCA9IC0+XG4gICAgICBrZXkuaWNvbi50b2dnbGUoJ29mZicpXG4gICAgICBoYW5kbGVLZXlDb2xvcihrZXkpXG4gICAgICBib2FyZC5pc0NhcGl0YWwgPSBmYWxzZVxuICAgICAgY2FwaXRhbGl6ZUtleXMoKVxuXG4gICAgaW9zLmxheW91dC5zZXQoa2V5Lmljb24pXG5cbiAgICBpZiBpb3MuaXNQYWQoKVxuICAgICAga2V5Lm9uIEV2ZW50cy5Ub3VjaEVuZCwgLT5cbiAgICAgICAgaWYgQC5pY29uLnN0YXRlID09ICdvbidcbiAgICAgICAgICBib2FyZC5rZXlzLnNoaWZ0Lmljb24udG9nZ2xlKCdvbicpXG4gICAgICAgICAgYm9hcmQua2V5cy5zaGlmdGFsdC5pY29uLnRvZ2dsZSgnb24nKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgYm9hcmQua2V5cy5zaGlmdC5pY29uLnRvZ2dsZSgnb2ZmJylcbiAgICAgICAgICBib2FyZC5rZXlzLnNoaWZ0YWx0Lmljb24udG9nZ2xlKCdvZmYnKVxuICAgICAgICBoYW5kbGVLZXlDb2xvcihib2FyZC5rZXlzLnNoaWZ0KVxuICAgICAgICBoYW5kbGVLZXlDb2xvcihib2FyZC5rZXlzLnNoaWZ0YWx0KVxuICAgIHJldHVybiBrZXlcblxuICBEZWxldGUgPSAob2JqKSAtPlxuICAgIGtleSA9IG5ldyBTcGVjaWFsS2V5IG9ialxuICAgIGtleS5pY29uID0gbmV3IEljb25XaXRoU3RhdGVcbiAgICAgIHN1cGVyTGF5ZXI6a2V5XG4gICAgICBvbjppb3MudXRpbHMuc3ZnKGlvcy5hc3NldHMuZGVsZXRlLm9uKVxuICAgICAgb2ZmOmlvcy51dGlscy5zdmcoaW9zLmFzc2V0cy5kZWxldGUub2ZmKVxuXG4gICAga2V5LmZpcmUgPSAtPiBib2FyZC5kZWxldGUoKVxuXG4gICAga2V5LmRvd24gPSAtPlxuICAgICAga2V5Lmljb24udG9nZ2xlKCdvbicpXG4gICAgICBoYW5kbGVLZXlDb2xvcihrZXkpXG4gICAgICBrZXkuZmlyZSgpXG5cbiAgICBrZXkudXAgPSAtPlxuICAgICAga2V5Lmljb24udG9nZ2xlKCdvZmYnKVxuICAgICAgaGFuZGxlS2V5Q29sb3Ioa2V5KVxuXG4gICAga2V5Lm9uIEV2ZW50cy5Ub3VjaFN0YXJ0LCAtPiBrZXkuZG93bigpXG4gICAga2V5Lm9uIEV2ZW50cy5Ub3VjaEVuZCwgLT4ga2V5LnVwKClcblxuXG4gICAgcmV0dXJuIGtleVxuXG4gIE51bWJlcnMgID0gKG9iaikgLT5cbiAgICBrZXkgPSBuZXcgU3BlY2lhbEtleSBvYmpcbiAgICBpZiBpb3MuaXNQaG9uZSgpXG4gICAgICBrZXkuaHRtbCA9ICcxMjMnXG4gICAgZWxzZVxuICAgICAga2V5Lmh0bWwgPScuPzEyMydcbiAgICBrZXkuc3R5bGUubGluZUhlaWdodCA9IGlvcy5weChzcGVjcy5zcGVjaWFsS2V5SGVpZ2h0KSArIFwicHhcIlxuICAgIHJldHVybiBrZXlcblxuICBFbW9qaSA9IChvYmopIC0+XG4gICAga2V5ID0gbmV3IFNwZWNpYWxLZXkgb2JqXG4gICAga2V5Lmljb24gPSBuZXcgSWNvblxuICAgICAgc3VwZXJMYXllcjprZXlcbiAgICAgIGljb246aW9zLnV0aWxzLnN2Zyhpb3MuYXNzZXRzLmVtb2ppKVxuICAgIHJldHVybiBrZXlcblxuICBSZXR1cm4gPSAob2JqKSAtPlxuICAgIGtleSA9IG5ldyBTcGVjaWFsS2V5IG9ialxuICAgIGtleS5iYWNrZ3JvdW5kQ29sb3IgPSBjb2xvcnMucmV0dXJuQkdcbiAgICBrZXkuaHRtbCA9IHNldHVwLnJldHVyblRleHRcbiAgICBrZXkuc3R5bGUubGluZUhlaWdodCA9IGlvcy5weChzcGVjcy5zcGVjaWFsS2V5SGVpZ2h0KSArIFwicHhcIlxuICAgIGtleS5jb2xvciA9IGlvcy51dGlscy5hdXRvQ29sb3IoY29sb3JzLnJldHVybkJHKVxuICAgIGtleS5kb3duID0gLT5cbiAgICAgIG5vdGhpbmdIYXBwZW5zID0gdHJ1ZVxuXG4gICAga2V5LnVwID0gLT5cbiAgICAgIGJvYXJkLmRpc21pc3MoKVxuICAgICAgaWYgYm9hcmQudGFyZ2V0XG4gICAgICAgIGlmIGJvYXJkLnRhcmdldC5wYXJlbnRcbiAgICAgICAgICBib2FyZC50YXJnZXQucGFyZW50LmFjdGl2ZSA9IGZhbHNlXG4gICAga2V5Lm9uIEV2ZW50cy5Ub3VjaEVuZCwgLT4ga2V5LmRvd24oKVxuICAgIGtleS5vbiBFdmVudHMuVG91Y2hTdGFydCwgLT4ga2V5LnVwKClcbiAgICByZXR1cm4ga2V5XG5cbiAgRGlzbWlzcyA9IChvYmopIC0+XG4gICAga2V5ID0gbmV3IFNwZWNpYWxLZXkgb2JqXG4gICAga2V5Lmljb24gPSBuZXcgSWNvblxuICAgICAgc3VwZXJMYXllcjprZXlcbiAgICAgIGljb246aW9zLnV0aWxzLnN2Zyhpb3MuYXNzZXRzLmtleWJvYXJkKVxuICAgIGtleS5pY29uLnNjYWxlID0gLjhcbiAgICBrZXkuaWNvbi5jb25zdHJhaW50cyA9XG4gICAgICBib3R0b206MTJcbiAgICAgIHRyYWlsaW5nOjEyXG4gICAgaW9zLmxheW91dC5zZXQoa2V5Lmljb24pXG5cbiAgICBrZXkuZG93biA9IC0+IGJvYXJkLmRpc21pc3MoKVxuICAgIGtleS51cCA9IC0+IG5vdGhpbmdIYXBwZW5zID0gZmFsc2VcbiAgICBrZXkub24gRXZlbnRzLlRvdWNoRW5kLCAtPiBrZXkuZG93bigpXG4gICAgcmV0dXJuIGtleVxuXG4gIFRhYiA9IChvYmopIC0+XG4gICAga2V5ID0gbmV3IFNwZWNpYWxLZXkgb2JqXG4gICAga2V5Lmh0bWwgPSAndGFiJ1xuICAgIGtleS5zdHlsZS5saW5lSGVpZ2h0ID0gaW9zLnB4KDcwKSArICdweCdcbiAgICBrZXkuc3R5bGUudGV4dEFsaWduID0gJ2xlZnQnXG4gICAga2V5LnN0eWxlLnBhZGRpbmdMZWZ0ID0gaW9zLnB4KDEyKSArICdweCdcbiAgICByZXR1cm4ga2V5XG5cbiAgYm9hcmQuc3dpdGNoTGV0dGVycyA9IC0+XG4gICAgcm93MUJyZWFrID0gMTBcbiAgICByb3cyQnJlYWsgPSAxOVxuICAgIGlmIGlvcy5pc1BhZCgpXG4gICAgICBsZXR0ZXJzLnB1c2ggJyEnXG4gICAgICBsZXR0ZXJzLnB1c2ggJz8nXG4gICAgaWYgaW9zLmRldmljZS5uYW1lID09IFwiaXBhZC1wcm9cIlxuICAgICAgbGV0dGVycyA9IFtcInFcIiwgXCJ3XCIsIFwiZVwiLCBcInJcIiwgXCJ0XCIsIFwieVwiLCBcInVcIiwgXCJpXCIsIFwib1wiLCBcInBcIiwgXCJ7XCIsIFwifVwiLCBcIlxcfFwiLCBcImFcIiwgXCJzXCIsIFwiZFwiLCBcImZcIiwgXCJnXCIsIFwiaFwiLCBcImpcIiwgXCJrXCIsIFwibFwiLCBcIjpcIiwgXCImcmRxdW87XCIsIFwielwiLCBcInhcIiwgXCJjXCIsIFwidlwiLCAgXCJiXCIsIFwiblwiLCBcIm1cIiwgXCI8XCIsIFwiPlwiLCBcIj9cIl1cbiAgICAgIHRvcExldHRlcnMgPSBbXCJ+XCIsIFwiIVwiLCBcIkBcIiwgXCIjXCIsIFwiJFwiLCBcIiVcIiwgXCJeXCIsIFwiJlwiLCBcIipcIiwgXCIoXCIsIFwiKVwiLCBcIl9cIiwgXCIrXCJdXG4gICAgICByb3cxQnJlYWsgPSAxM1xuICAgICAgcm93MkJyZWFrID0gMjRcbiAgICBmb3IgbCwgaSBpbiBsZXR0ZXJzXG4gICAgICBrZXkgPSBuZXcgTGV0dGVyXG4gICAgICAgIG5hbWU6bFxuICAgICAgICBjb25zdHJhaW50czpcbiAgICAgICAgICBoZWlnaHQ6c3BlY3MubGV0dGVyS2V5LmhlaWdodFxuICAgICAgICAgIHdpZHRoOnNwZWNzLmxldHRlcktleS53aWR0aFxuICAgICAgICBsZXR0ZXI6bFxuICAgICAgaWYgbCA9PSAndycgfHwgbCA9PSAncicgfHwgbCA9PSAneScgfHwgbCA9PSAnaScgfHwgbCA9PSAncCdcbiAgICAgICAga2V5LmNvbnN0cmFpbnRzLndpZHRoID0ga2V5LmNvbnN0cmFpbnRzLndpZHRoICsgMVxuICAgICAgYm9hcmQua2V5c1tsXSA9IGtleVxuICAgICAgYm9hcmQua2V5c0FycmF5LnB1c2gga2V5XG4gICAgICBpZiBpID09IDBcbiAgICAgICAga2V5LmNvbnN0cmFpbnRzLmxlYWRpbmcgPSBzcGVjcy5yb3cxLmxlYWRpbmdcbiAgICAgICAga2V5LmNvbnN0cmFpbnRzLnRvcCA9IHNwZWNzLnJvdzEudG9wXG4gICAgICBpZiBpID4gMCAmJiBpIDwgcm93MUJyZWFrXG4gICAgICAgIGtleS5jb25zdHJhaW50cy5sZWFkaW5nID0gW2JvYXJkLmtleXNBcnJheVtpIC0gMV0sIHNwZWNzLnNwYWNlXVxuICAgICAgICBrZXkuY29uc3RyYWludHMudG9wID0gc3BlY3Mucm93MS50b3BcbiAgICAgIGlmIGkgPT0gcm93MUJyZWFrXG4gICAgICAgIGtleS5jb25zdHJhaW50cy5sZWFkaW5nID0gc3BlY3Mucm93Mi5sZWFkaW5nXG4gICAgICAgIGtleS5jb25zdHJhaW50cy50b3AgPSBbYm9hcmQua2V5c0FycmF5WzBdLCBzcGVjcy5yb3cyLnRvcF1cbiAgICAgIGlmIGkgPiByb3cxQnJlYWsgJiYgaSA8IHJvdzJCcmVha1xuICAgICAgICBrZXkuY29uc3RyYWludHMubGVhZGluZyA9IFtib2FyZC5rZXlzQXJyYXlbaSAtIDFdLCBzcGVjcy5zcGFjZV1cbiAgICAgICAga2V5LmNvbnN0cmFpbnRzLnRvcCA9IFtib2FyZC5rZXlzQXJyYXlbMF0sIHNwZWNzLnJvdzIudG9wXVxuICAgICAgaWYgaSA9PSByb3cyQnJlYWtcbiAgICAgICAga2V5LmNvbnN0cmFpbnRzLmxlYWRpbmcgPSBzcGVjcy5yb3czLmxlYWRpbmdcbiAgICAgICAga2V5LmNvbnN0cmFpbnRzLnRvcCA9IFtib2FyZC5rZXlzQXJyYXlbcm93MUJyZWFrXSwgc3BlY3Mucm93My50b3BdXG4gICAgICBpZiBpID4gcm93MkJyZWFrXG4gICAgICAgIGtleS5jb25zdHJhaW50cy5sZWFkaW5nID0gW2JvYXJkLmtleXNBcnJheVtpIC0gMV0sIHNwZWNzLnNwYWNlXVxuICAgICAgICBrZXkuY29uc3RyYWludHMudG9wID0gW2JvYXJkLmtleXNBcnJheVtyb3cxQnJlYWtdLCBzcGVjcy5yb3czLnRvcF1cbiAgICAgIGlvcy5sYXlvdXQuc2V0KGtleSlcblxuICAgIGJvYXJkLmtleXMuc2hpZnQgPSBuZXcgU2hpZnRcbiAgICAgIG5hbWU6XCJzaGlmdFwiXG4gICAgICBzaGlmdDpzZXR1cC5zaGlmdFxuICAgICAgY29uc3RyYWludHM6XG4gICAgICAgIGhlaWdodDpzcGVjcy5zcGVjaWFsS2V5SGVpZ2h0XG4gICAgICAgIHdpZHRoOnNwZWNzLnNwZWNpYWxLZXlXaWR0aFxuICAgICAgICBib3R0b21FZGdlczpib2FyZC5rZXlzLnpcblxuICAgIGJvYXJkLmtleXMuZGVsZXRlID0gbmV3IERlbGV0ZVxuICAgICAgbmFtZTpcImRlbGV0ZVwiXG4gICAgICBjb25zdHJhaW50czpcbiAgICAgICAgaGVpZ2h0OnNwZWNzLnNwZWNpYWxLZXlIZWlnaHRcbiAgICAgICAgd2lkdGg6c3BlY3Muc3BlY2lhbEtleVdpZHRoXG4gICAgICAgIGJvdHRvbUVkZ2VzOmJvYXJkLmtleXMuelxuICAgICAgICB0cmFpbGluZzowXG5cbiAgICBib2FyZC5rZXlzLm51bWJlcnMgPSBuZXcgTnVtYmVyc1xuICAgICAgbmFtZTpcIm51bWJlcnNcIlxuICAgICAgY29uc3RyYWludHM6XG4gICAgICAgIGhlaWdodDpzcGVjcy5zcGVjaWFsS2V5SGVpZ2h0XG4gICAgICAgIHdpZHRoOnNwZWNzLnNwZWNpYWxLZXlXaWR0aFxuICAgICAgICBib3R0b206MFxuICAgICAgICBsZWFkaW5nOjBcblxuICAgIGJvYXJkLmtleXMuZW1vamkgPSBuZXcgRW1vamlcbiAgICAgIG5hbWU6XCJlbW9qaVwiXG4gICAgICBjb25zdHJhaW50czpcbiAgICAgICAgaGVpZ2h0OnNwZWNzLnNwZWNpYWxLZXlIZWlnaHRcbiAgICAgICAgd2lkdGg6c3BlY3Muc3BlY2lhbEtleVdpZHRoXG4gICAgICAgIGxlYWRpbmc6W2JvYXJkLmtleXMubnVtYmVycywgc3BlY3Muc3BhY2VdXG4gICAgICAgIGJvdHRvbTowXG5cbiAgICBib2FyZC5rZXlzLnJldHVybiA9IG5ldyBSZXR1cm5cbiAgICAgIG5hbWU6XCJyZXR1cm5cIlxuICAgICAgY29uc3RyYWludHM6XG4gICAgICAgIGJvdHRvbTowXG4gICAgICAgIHRyYWlsaW5nOjBcbiAgICAgICAgd2lkdGg6c3BlY3MucmV0dXJuV2lkdGhcbiAgICAgICAgaGVpZ2h0OnNwZWNzLnNwZWNpYWxLZXlIZWlnaHRcblxuICAgIGJvYXJkLmtleXMuc3BhY2UgPSBuZXcgU3BhY2VcbiAgICAgIG5hbWU6XCJzcGFjZVwiXG4gICAgICBsZXR0ZXI6XCJzcGFjZVwiXG4gICAgICBjb25zdHJhaW50czpcbiAgICAgICAgbGVhZGluZzpbYm9hcmQua2V5cy5lbW9qaSwgc3BlY3Muc3BhY2VdXG4gICAgICAgIHRyYWlsaW5nOltib2FyZC5rZXlzLnJldHVybiwgc3BlY3Muc3BhY2VdXG4gICAgICAgIGJvdHRvbTowXG4gICAgICAgIGhlaWdodDpzcGVjcy5zcGVjaWFsS2V5SGVpZ2h0XG5cblxuICAgIGlmIGlvcy5pc1BhZCgpXG4gICAgICBib2FyZC5rZXlzLnJldHVybi5jb25zdHJhaW50cy5ib3R0b20gPSB1bmRlZmluZWRcbiAgICAgIGJvYXJkLmtleXMucmV0dXJuLmNvbnN0cmFpbnRzLmJvdHRvbUVkZ2VzID0gYm9hcmQua2V5c0FycmF5W3JvdzFCcmVha11cbiAgICAgIGJvYXJkLmtleXMuZGVsZXRlLmNvbnN0cmFpbnRzLnRvcCA9IDBcbiAgICAgIGJvYXJkLmtleXMuZGVsZXRlLmNvbnN0cmFpbnRzLmJvdHRvbUVkZ2VzID0gdW5kZWZpbmVkXG4gICAgICBib2FyZC5rZXlzLmRlbGV0ZS5jb25zdHJhaW50cy53aWR0aCA9IDYxXG5cbiAgICAgIGJvYXJkLmtleXMuc2hpZnRhbHQgPSBuZXcgU2hpZnRcbiAgICAgICAgbmFtZTpcInNoaWZ0YWx0XCJcbiAgICAgICAgc2hpZnQ6c2V0dXAuc2hpZnRcbiAgICAgICAgY29uc3RyYWludHM6XG4gICAgICAgICAgaGVpZ2h0OnNwZWNzLnNwZWNpYWxLZXlIZWlnaHRcbiAgICAgICAgICB3aWR0aDo3NlxuICAgICAgICAgIGJvdHRvbUVkZ2VzOmJvYXJkLmtleXMuelxuICAgICAgICAgIHRyYWlsaW5nOjBcblxuICAgICAgYm9hcmQua2V5cy5kaXNtaXNzID0gbmV3IERpc21pc3NcbiAgICAgICAgbmFtZTpcImRpc21pc3NcIlxuICAgICAgICBjb25zdHJhaW50czpcbiAgICAgICAgICBoZWlnaHQ6c3BlY3Muc3BlY2lhbEtleUhlaWdodFxuICAgICAgICAgIHdpZHRoOnNwZWNzLnNwZWNpYWxLZXlXaWR0aFxuICAgICAgICAgIGJvdHRvbTowXG4gICAgICAgICAgdHJhaWxpbmc6MFxuXG4gICAgICBib2FyZC5rZXlzLm51bWJlcnNhbHQgPSBuZXcgTnVtYmVyc1xuICAgICAgICBuYW1lOlwibnVtYmVyc2FsdFwiXG4gICAgICAgIGNvbnN0cmFpbnRzOlxuICAgICAgICAgIGhlaWdodDpzcGVjcy5zcGVjaWFsS2V5SGVpZ2h0XG4gICAgICAgICAgd2lkdGg6OTNcbiAgICAgICAgICBib3R0b206MFxuICAgICAgICAgIHRyYWlsaW5nOltib2FyZC5rZXlzLmRpc21pc3MsIHNwZWNzLnNwYWNlXVxuXG4gICAgICBib2FyZC5rZXlzLnNwYWNlLmh0bWwgPSBcIlwiXG4gICAgICBib2FyZC5rZXlzLnNwYWNlLmNvbnN0cmFpbnRzLnRyYWlsaW5nID0gW2JvYXJkLmtleXMubnVtYmVyc2FsdCwgc3BlY3Muc3BhY2VdXG5cbiAgICAgIGlvcy5sYXlvdXQuc2V0KClcbiAgICBib2FyZC50b3BSb3cgPSBbXVxuICAgIGlmIGlvcy5kZXZpY2UubmFtZSA9PSAnaXBhZC1wcm8nXG4gICAgICBmb3IgbCxpIGluIHRvcExldHRlcnNcbiAgICAgICAgICB0b3BLZXkgPSBuZXcgTGV0dGVyXG4gICAgICAgICAgICBsZXR0ZXI6bFxuICAgICAgICAgICAgbmFtZTpsXG4gICAgICAgICAgICBjb25zdHJhaW50czpcbiAgICAgICAgICAgICAgaGVpZ2h0OjQ2XG4gICAgICAgICAgICAgIHdpZHRoOjYzXG4gICAgICAgICAgICAgIHRvcDowXG4gICAgICAgICAgaWYgaSA9PSAwXG4gICAgICAgICAgICB0b3BLZXkuY29uc3RyYWludHMubGVhZGluZyA9IDBcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB0b3BLZXkuY29uc3RyYWludHMubGVhZGluZyA9IFtib2FyZC50b3BSb3dbaSAtIDFdLCBzcGVjcy5zcGFjZV1cbiAgICAgICAgICB0b3BLZXkuc3R5bGUubGluZUhlaWdodCA9IGlvcy5weCg0NikgKyAncHgnXG4gICAgICAgICAgaW9zLmxheW91dC5zZXQodG9wS2V5KVxuICAgICAgICAgIGJvYXJkLnRvcFJvdy5wdXNoIHRvcEtleVxuICAgICAgICAgIGJvYXJkLmtleXNBcnJheS5wdXNoIHRvcEtleVxuICAgICAgICAgIGJvYXJkLmtleXNbbF0gPSB0b3BLZXlcblxuICAgICAgYm9hcmQua2V5cy5kZWxldGUuaWNvbi5kZXN0cm95KClcbiAgICAgIGJvYXJkLmtleXMuZGVsZXRlLmh0bWwgPSAnZGVsZXRlJ1xuICAgICAgYm9hcmQua2V5cy5kZWxldGUuc3R5bGUubGluZUhlaWdodCA9IGlvcy5weCg1MykgKyAncHgnXG4gICAgICBib2FyZC5rZXlzLmRlbGV0ZS5zdHlsZS50ZXh0QWxpZ24gPSAncmlnaHQnXG4gICAgICBib2FyZC5rZXlzLmRlbGV0ZS5zdHlsZS5wYWRkaW5nUmlnaHQgPSBpb3MucHgoMTIpICsgJ3B4J1xuICAgICAgYm9hcmQua2V5cy5kZWxldGUuY29uc3RyYWludHMgPVxuICAgICAgICB0b3A6MFxuICAgICAgICB0cmFpbGluZzowXG4gICAgICAgIGhlaWdodDo0NlxuICAgICAgICB3aWR0aDoxMDZcblxuICAgICAgYm9hcmQua2V5cy5zaGlmdC5pY29uLmRlc3Ryb3koKVxuICAgICAgYm9hcmQua2V5cy5zaGlmdC5odG1sID0gJ3NoaWZ0J1xuICAgICAgYm9hcmQua2V5cy5zaGlmdC5zdHlsZS5saW5lSGVpZ2h0ID0gaW9zLnB4KDcwKSArICdweCdcbiAgICAgIGJvYXJkLmtleXMuc2hpZnQuc3R5bGUudGV4dEFsaWduID0gJ2xlZnQnXG4gICAgICBib2FyZC5rZXlzLnNoaWZ0LnN0eWxlLnBhZGRpbmdMZWZ0ID0gaW9zLnB4KDEyKSArICdweCdcbiAgICAgIGJvYXJkLmtleXMuc2hpZnQuY29uc3RyYWludHMud2lkdGggPSAxNTRcblxuICAgICAgYm9hcmQua2V5cy5zaGlmdGFsdC5pY29uLmRlc3Ryb3koKVxuICAgICAgYm9hcmQua2V5cy5zaGlmdGFsdC5odG1sID0gJ3NoaWZ0J1xuICAgICAgYm9hcmQua2V5cy5zaGlmdGFsdC5zdHlsZS5saW5lSGVpZ2h0ID0gaW9zLnB4KDcwKSArICdweCdcbiAgICAgIGJvYXJkLmtleXMuc2hpZnRhbHQuc3R5bGUudGV4dEFsaWduID0gJ3JpZ2h0J1xuICAgICAgYm9hcmQua2V5cy5zaGlmdGFsdC5zdHlsZS5wYWRkaW5nUmlnaHQgPSBpb3MucHgoMTIpICsgJ3B4J1xuICAgICAgYm9hcmQua2V5cy5zaGlmdGFsdC5jb25zdHJhaW50cy53aWR0aCA9IDE1NVxuXG4gICAgICBib2FyZC5rZXlzLmVtb2ppLmljb24uY29uc3RyYWludHMgPSB7bGVhZGluZzoxNSwgYm90dG9tOjExfVxuICAgICAgYm9hcmQua2V5cy5lbW9qaS5jb25zdHJhaW50cyA9XG4gICAgICAgIHdpZHRoOjE0NFxuICAgICAgICBoZWlnaHQ6NjFcbiAgICAgICAgbGVhZGluZzowXG4gICAgICAgIGJvdHRvbTowXG4gICAgICBpb3MubGF5b3V0LnNldCgpXG5cbiAgICAgIGJvYXJkLmtleXMubnVtYmVyc2FsdC5jb25zdHJhaW50cy53aWR0aCA9IDkzXG4gICAgICBib2FyZC5rZXlzLmRpc21pc3MuY29uc3RyYWludHMud2lkdGggPSA5M1xuXG4gICAgICBib2FyZC5rZXlzLmNvbSA9IG5ldyBMZXR0ZXJcbiAgICAgICAgbmFtZTonLmNvbSdcbiAgICAgICAgbGV0dGVyOicuY29tJ1xuICAgICAgICBjb25zdHJhaW50czpcbiAgICAgICAgICBoZWlnaHQ6c3BlY3MubGV0dGVyS2V5LmhlaWdodFxuICAgICAgICAgIHdpZHRoOnNwZWNzLmxldHRlcktleS53aWR0aFxuICAgICAgICAgIGJvdHRvbTowXG4gICAgICAgICAgdHJhaWxpbmc6W2JvYXJkLmtleXMubnVtYmVyc2FsdCwgc3BlY3Muc3BhY2VdXG5cbiAgICAgIGJvYXJkLmtleXMuY29tLnN0eWxlLmZvbnRTaXplID0gaW9zLnB4KDE2KSArICdweCdcblxuICAgICAgYm9hcmQua2V5cy5udW1iZXJzLmNvbnN0cmFpbnRzID1cbiAgICAgICAgd2lkdGg6MTQzXG4gICAgICAgIGhlaWdodDo2MVxuICAgICAgICBsZWFkaW5nOltib2FyZC5rZXlzLmVtb2ppLCBzcGVjcy5zcGFjZV1cbiAgICAgIGJvYXJkLmtleXMubnVtYmVycy5zdHlsZS5saW5lSGVpZ2h0ID0gaW9zLnB4KDcwKSArICdweCdcbiAgICAgIGJvYXJkLmtleXMubnVtYmVycy5zdHlsZS50ZXh0QWxpZ24gPSAnbGVmdCdcbiAgICAgIGJvYXJkLmtleXMubnVtYmVycy5zdHlsZS5wYWRkaW5nTGVmdCA9IGlvcy5weCgxMikgKyAncHgnXG5cblxuICAgICAgYm9hcmQua2V5cy5yZXR1cm4uc3R5bGUubGluZUhlaWdodCA9IGlvcy5weCg3MCkgKyAncHgnXG4gICAgICBib2FyZC5rZXlzLnJldHVybi5zdHlsZS50ZXh0QWxpZ24gPSAncmlnaHQnXG4gICAgICBib2FyZC5rZXlzLnJldHVybi5zdHlsZS5wYWRkaW5nUmlnaHQgPSBpb3MucHgoMTIpICsgJ3B4J1xuXG5cbiAgICAgIGJvYXJkLmtleXMuc3BhY2UuY29uc3RyYWludHMubGVhZGluZyA9IFtib2FyZC5rZXlzLm51bWJlcnMsIHNwZWNzLnNwYWNlXVxuICAgICAgYm9hcmQua2V5cy5zcGFjZS5jb25zdHJhaW50cy50cmFpbGluZyA9IFtib2FyZC5rZXlzLmNvbSwgc3BlY3Muc3BhY2VdXG5cblxuICAgICAgYm9hcmQua2V5cy5jYXBzID0gbmV3IFNoaWZ0XG4gICAgICAgIG5hbWU6J2NhcHMnXG4gICAgICAgIGNhcHM6IHRydWVcbiAgICAgICAgY29uc3RyYWludHM6XG4gICAgICAgICAgaGVpZ2h0OnNwZWNzLnNwZWNpYWxLZXlIZWlnaHRcbiAgICAgICAgICB3aWR0aDoxMTlcbiAgICAgICAgICBib3R0b21FZGdlczpib2FyZC5rZXlzQXJyYXlbcm93MUJyZWFrXVxuICAgICAgYm9hcmQua2V5cy5jYXBzLmljb24uZGVzdHJveSgpXG4gICAgICBib2FyZC5rZXlzLmNhcHMuaHRtbCA9ICdjYXBzIGxvY2snXG4gICAgICBib2FyZC5rZXlzLmNhcHMuc3R5bGUubGluZUhlaWdodCA9IGlvcy5weCg3MCkgKyAncHgnXG4gICAgICBib2FyZC5rZXlzLmNhcHMuc3R5bGUudGV4dEFsaWduID0gJ2xlZnQnXG4gICAgICBib2FyZC5rZXlzLmNhcHMuc3R5bGUucGFkZGluZ0xlZnQgPSBpb3MucHgoMTIpICsgJ3B4J1xuXG5cblxuICAgICAgYm9hcmQua2V5cy5jYXBzLmRvd24gPSAtPlxuICAgICAgICBpZiBib2FyZC5pc0NhcHNMb2NrXG4gICAgICAgICAgYm9hcmQuaXNDYXBzTG9jayA9IGZhbHNlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBib2FyZC5jYXBzTG9jaygpXG4gICAgICBib2FyZC5rZXlzLmNhcHMub24gRXZlbnRzLlRvdWNoRW5kLCAtPlxuICAgICAgICBib2FyZC5rZXlzLmNhcHMuZG93bigpXG4gICAgICBib2FyZC5rZXlzLmNhcHMudXAgPSAtPlxuICAgICAgICBub3RoaW5nSGFwcGVucyA9IHRydWVcblxuICAgICAgYm9hcmQua2V5cy50YWIgPSBuZXcgVGFiXG4gICAgICAgIG5hbWU6J3RhYidcbiAgICAgICAgY29uc3RyYWludHM6XG4gICAgICAgICAgaGVpZ2h0OnNwZWNzLnNwZWNpYWxLZXlIZWlnaHRcbiAgICAgICAgICB3aWR0aDoxMDZcbiAgICAgICAgICBib3R0b21FZGdlczpib2FyZC5rZXlzQXJyYXlbMF1cblxuICAgICAgaW9zLmxheW91dC5zZXQoKVxuICBpZiBpb3MuaXNQaG9uZSgpXG4gICAgcG9wVXAgPSBpb3MudXRpbHMuc3ZnKGlvcy5hc3NldHMua2V5UG9wVXBbc2V0dXAuc3R5bGVdW2lvcy5kZXZpY2UubmFtZV0pXG4gICAgYm9hcmQucG9wVXAgPSBuZXcgTGF5ZXJcbiAgICAgIGhlaWdodDpwb3BVcC5oZWlnaHRcbiAgICAgIHdpZHRoOnBvcFVwLndpZHRoXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6J3RyYW5zcGFyZW50J1xuICAgICAgbmFtZTonLnBvcFVwJ1xuICAgICAgc3VwZXJMYXllcjpib2FyZC5hcmVhXG4gICAgICB2aXNpYmxlOmZhbHNlXG5cbiAgICBib2FyZC5wb3BVcC5zdmcgPSBuZXcgTGF5ZXJcbiAgICAgIGh0bWw6cG9wVXAuc3ZnXG4gICAgICBoZWlnaHQ6cG9wVXAuaGVpZ2h0XG4gICAgICB3aWR0aDpwb3BVcC53aWR0aFxuICAgICAgc3VwZXJMYXllcjpib2FyZC5wb3BVcFxuICAgICAgbmFtZTonLnN2ZydcbiAgICAgIGJhY2tncm91bmRDb2xvcjondHJhbnNwYXJlbnQnXG5cbiAgICBib2FyZC5wb3BVcC50ZXh0ID0gbmV3IGlvcy5UZXh0XG4gICAgICB0ZXh0OidBJ1xuICAgICAgc3VwZXJMYXllcjpib2FyZC5wb3BVcFxuICAgICAgZm9udFNpemU6c3BlY3MucG9wVXBDaGFyXG4gICAgICBmb250V2VpZ2h0OjMwMFxuICAgICAgY29sb3I6Y29sb3JzLmNvbG9yXG4gICAgICB0ZXh0QWxpZ246J2NlbnRlcidcbiAgICAgIGNvbnN0cmFpbnRzOlxuICAgICAgICBhbGlnbjonaG9yaXpvbnRhbCdcbiAgICAgICAgdG9wOnNwZWNzLnBvcFVwVG9wXG4gICAgICAgIHdpZHRoOmlvcy5wdChwb3BVcC53aWR0aClcblxuICAgIGJvYXJkLnBvcFVwLmNlbnRlcigpXG4gICAgc3dpdGNoIGlvcy5kZXZpY2UubmFtZVxuICAgICAgd2hlbiAnaXBob25lLTZzLXBsdXMnXG4gICAgICAgIGJvYXJkLnBvcFVwLndpZHRoID0gYm9hcmQucG9wVXAud2lkdGggLSAxOFxuICAgICAgICBib2FyZC5wb3BVcC5oZWlnaHQgPSBib2FyZC5wb3BVcC5oZWlnaHQgLSAyNFxuICAgICAgICBib2FyZC5wb3BVcC5zdmcueCA9IGlvcy5weCgtMylcbiAgICAgICAgYm9hcmQucG9wVXAuc3ZnLnkgPSBpb3MucHgoLTMpXG4gICAgICB3aGVuICdpcGhvbmUtNnMnXG4gICAgICAgIGJvYXJkLnBvcFVwLndpZHRoID0gYm9hcmQucG9wVXAud2lkdGggLSAxMlxuICAgICAgICBib2FyZC5wb3BVcC5oZWlnaHQgPSBib2FyZC5wb3BVcC5oZWlnaHQgLSAxMlxuICAgICAgICBib2FyZC5wb3BVcC5zdmcueCA9IGlvcy5weCgtMylcbiAgICAgICAgYm9hcmQucG9wVXAuc3ZnLnkgPSBpb3MucHgoLTIpXG4gICAgICB3aGVuICdpcGhvbmUtNSdcbiAgICAgICAgYm9hcmQucG9wVXAud2lkdGggPSBib2FyZC5wb3BVcC53aWR0aCAtIDEyXG4gICAgICAgIGJvYXJkLnBvcFVwLmhlaWdodCA9IGJvYXJkLnBvcFVwLmhlaWdodCAtIDEyXG4gICAgICAgIGJvYXJkLnBvcFVwLnN2Zy54ID0gaW9zLnB4KC0zKVxuICAgICAgICBib2FyZC5wb3BVcC5zdmcueSA9IGlvcy5weCgtMilcblxuICAgIGNhcGl0YWxpemVLZXlzKClcbiAgYm9hcmQuc3dpdGNoID0gKHN0YXRlKSAtPlxuICAgIHN3aXRjaCBzdGF0ZVxuICAgICAgd2hlbiBcImxldHRlcnNcIlxuICAgICAgICBib2FyZC5zd2l0Y2hMZXR0ZXJzKClcblxuICBib2FyZC5zd2l0Y2goXCJsZXR0ZXJzXCIpXG5cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAna2V5ZG93bicsIChlKSAtPlxuICAgIGlmIGFycmF5T2ZDb2Rlcy5pbmRleE9mKGUua2V5Q29kZS50b1N0cmluZygpKSAhPSAtMVxuICAgICAga2V5ID0gYm9hcmQua2V5c1tjb2RlTWFwW2Uua2V5Q29kZV0udG9Mb3dlckNhc2UoKV1cbiAgICAgIGlmIGtleSB0aGVuIGtleS5kb3duKClcbiAgICAgIGlmIGlvcy5pc1BhZCgpXG4gICAgICAgIGlmIGtleSA9PSBib2FyZC5rZXlzLnNoaWZ0IHx8IGtleSA9PSBib2FyZC5rZXlzLnNoaWZ0YWx0XG4gICAgICAgICAgYm9hcmQua2V5cy5zaGlmdC5kb3duKClcbiAgICAgICAgICBib2FyZC5rZXlzLnNoaWZ0YWx0Lmljb24udG9nZ2xlKCdvbicpXG4gICAgICAgICAgaGFuZGxlS2V5Q29sb3IoYm9hcmQua2V5cy5zaGlmdGFsdClcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAna2V5dXAnLCAoZSkgLT5cbiAgICBpZiBhcnJheU9mQ29kZXMuaW5kZXhPZihlLmtleUNvZGUudG9TdHJpbmcoKSkgIT0gLTFcbiAgICAgIGtleSA9IGJvYXJkLmtleXNbY29kZU1hcFtlLmtleUNvZGVdLnRvTG93ZXJDYXNlKCldXG4gICAgICBpZiBrZXkgdGhlbiBrZXkudXAoKVxuICAgICAgaWYgaW9zLmlzUGFkKClcbiAgICAgICAgaWYga2V5ID09IGJvYXJkLmtleXMuc2hpZnQgfHwga2V5ID09IGJvYXJkLmtleXMuc2hpZnRhbHRcbiAgICAgICAgICBib2FyZC5rZXlzLnNoaWZ0LnVwKClcbiAgICAgICAgICBib2FyZC5rZXlzLnNoaWZ0YWx0Lmljb24udG9nZ2xlKCdvZmYnKVxuICAgICAgICAgIGhhbmRsZUtleUNvbG9yKGJvYXJkLmtleXMuc2hpZnRhbHQpXG4gIGNhcGl0YWxpemVLZXlzKClcbiAgcmV0dXJuIGJvYXJkXG4iLCJpb3MgPSByZXF1aXJlICdpb3Mta2l0J1xuXG5leHBvcnRzLmRlZmF1bHRzID1cblx0bmFtZTonZmllbGQnXG5cdGFjdGl2ZTpmYWxzZVxuXHRrZXlib2FyZDp0cnVlXG5cdHRleHQ6dW5kZWZpbmVkXG5cdHBsYWNlaG9sZGVyOlwiRW50ZXIgdGV4dFwiXG5cdHBsYWNlaG9sZGVyQ29sb3I6XCIjOTk5XCJcblx0c3VwZXJMYXllcjp1bmRlZmluZWRcblx0YmFja2dyb3VuZENvbG9yOlwid2hpdGVcIlxuXHRib3JkZXJDb2xvcjpcIiNDQ0NDQ0NcIlxuXHRib3JkZXJSYWRpdXM6aW9zLnB4KDUpXG5cdGJvcmRlcldpZHRoOmlvcy5weCgxKVxuXHRoZWlnaHQ6aW9zLnB4KDMwKVxuXHR3aWR0aDppb3MucHgoOTcpXG5cdGZvbnRTaXplOjE3XG5cdGNvbG9yOidibGFjaydcblx0dGV4dENvbnN0cmFpbnRzOlxuXHRcdGxlYWRpbmc6NFxuXHRcdGFsaWduOlwidmVydGljYWxcIlxuXHRjb25zdHJhaW50czpcblx0XHRoZWlnaHQ6MzBcblx0XHR3aWR0aDo5N1xuXHRcdGFsaWduOlwiY2VudGVyXCJcblxuXG5leHBvcnRzLmRlZmF1bHRzLnByb3BzID0gT2JqZWN0LmtleXMoZXhwb3J0cy5kZWZhdWx0cylcblxuZXhwb3J0cy5jcmVhdGUgPSAoYXJyYXkpIC0+XG5cdHNldHVwID0gaW9zLnV0aWxzLnNldHVwQ29tcG9uZW50KGFycmF5LCBleHBvcnRzLmRlZmF1bHRzKVxuXG5cdGZpZWxkID0gbmV3IGlvcy5WaWV3XG5cdFx0bmFtZTpzZXR1cC5uYW1lXG5cdFx0Y29uc3RyYWludHM6c2V0dXAuY29uc3RyYWludHNcblx0XHRiYWNrZ3JvdW5kQ29sb3I6c2V0dXAuYmFja2dyb3VuZENvbG9yXG5cdFx0Ym9yZGVyQ29sb3I6c2V0dXAuYm9yZGVyQ29sb3Jcblx0XHRib3JkZXJSYWRpdXM6c2V0dXAuYm9yZGVyUmFkaXVzXG5cdFx0Ym9yZGVyV2lkdGg6c2V0dXAuYm9yZGVyV2lkdGhcblx0XHRoZWlnaHQ6c2V0dXAuaGVpZ2h0XG5cdFx0d2lkdGg6c2V0dXAud2lkdGhcblx0XHRjbGlwOnRydWVcblx0XHRzdXBlckxheWVyOnNldHVwLnN1cGVyTGF5ZXJcblxuXHRmaWVsZC50ZXh0ID0gbmV3IGlvcy5UZXh0XG5cdFx0c3VwZXJMYXllcjpmaWVsZFxuXHRcdG5hbWU6XCIudGV4dFwiXG5cdFx0Y29uc3RyYWludHM6c2V0dXAudGV4dENvbnN0cmFpbnRzXG5cdFx0dGV4dDogaWYgc2V0dXAudGV4dCB0aGVuIHNldHVwLnRleHQgZWxzZSBcIlwiXG5cdFx0Zm9udFNpemU6MTdcblx0XHRjb2xvcjpzZXR1cC5jb2xvclxuXG5cdGZpZWxkLnRleHQucGxhY2Vob2xkZXIgPSBuZXcgaW9zLlRleHRcblx0XHRzdXBlckxheWVyOmZpZWxkXG5cdFx0bmFtZTpcIi5wbGFjZWhvbGRlclwiXG5cdFx0Y29uc3RyYWludHM6c2V0dXAudGV4dENvbnN0cmFpbnRzXG5cdFx0dGV4dDogaWYgc2V0dXAudGV4dCB0aGVuIFwiXCIgZWxzZSBzZXR1cC5wbGFjZWhvbGRlclxuXHRcdGZvbnRTaXplOjE3XG5cdFx0Y29sb3I6c2V0dXAucGxhY2Vob2xkZXJDb2xvclxuXG5cdGZpZWxkLmFjdGl2ZSA9IHNldHVwLmFjdGl2ZVxuXHRmaWVsZC50eXBlID0gJ2ZpZWxkJ1xuXG5cdGZpZWxkLm9uIEV2ZW50cy5Ub3VjaEVuZCwgLT5cblxuXHRcdGlmIGZpZWxkLmFjdGl2ZSAhPSB0cnVlXG5cdFx0XHRmaWVsZC5hY3RpdmUgPSB0cnVlXG5cblx0XHRcdGlmIHNldHVwLmtleWJvYXJkID09IHRydWUgJiYgZmllbGQua2V5Ym9hcmQgPT0gdW5kZWZpbmVkXG5cdFx0XHRcdGZpZWxkLmtleWJvYXJkID0gbmV3IGlvcy5LZXlib2FyZFxuXHRcdFx0XHRcdG91dHB1dDpmaWVsZC50ZXh0XG5cdFx0XHRcdFx0aGlkZGVuOnRydWVcblxuXHRcdFx0aWYgdHlwZW9mIHNldHVwLmtleWJvYXJkID09ICdvYmplY3QnXG5cdFx0XHRcdGZpZWxkLmlucHV0KHNldHVwLmtleWJvYXJkKVxuXHRcdFx0XHRmaWVsZC5rZXlib2FyZCA9IHNldHVwLmtleWJvYXJkXG5cblx0XHRcdGZpZWxkLmtleWJvYXJkLmNhbGwoKVxuXHRcdFx0ZmllbGQudGV4dC5jdXJzb3IgPSBuZXcgaW9zLlZpZXdcblx0XHRcdFx0c3VwZXJMYXllcjpmaWVsZFxuXHRcdFx0XHRuYW1lOlwiY3Vyc29yXCJcblx0XHRcdFx0YmFja2dyb3VuZENvbG9yOmlvcy5jb2xvcihcImJsdWVcIilcblx0XHRcdFx0Y29uc3RyYWludHM6XG5cdFx0XHRcdFx0d2lkdGg6MlxuXHRcdFx0XHRcdGhlaWdodDpzZXR1cC5mb250U2l6ZSArIDZcblx0XHRcdFx0XHRsZWFkaW5nOjRcblx0XHRcdFx0XHRhbGlnbjpcInZlcnRpY2FsXCJcblxuXHRcdFx0aWYgZmllbGQudGV4dC5odG1sICE9IHNldHVwLnBsYWNlaG9sZGVyXG5cdFx0XHRcdGZpZWxkLnRleHQuY3Vyc29yLmNvbnN0cmFpbnRzLmxlYWRpbmcgPSBmaWVsZC50ZXh0XG5cdFx0XHRcdGlvcy5sYXlvdXQuc2V0KGZpZWxkLnRleHQuY3Vyc29yKVxuXHRcdFx0ZmllbGQubGlzdGVuaW5nVG9GaWVsZCA9IFV0aWxzLmludGVydmFsIC4xLCAtPlxuXHRcdFx0XHRpZiBmaWVsZC5hY3RpdmUgPT0gZmFsc2Vcblx0XHRcdFx0XHRjbGVhckludGVydmFsKGZpZWxkLmludGVydmFsKVxuXHRcdFx0XHRcdGNsZWFySW50ZXJ2YWwoZmllbGQubGlzdGVuaW5nVG9GaWVsZClcblx0XHRcdFx0XHRmaWVsZC50ZXh0LmN1cnNvci5kZXN0cm95KClcblxuXG5cdFx0XHRmaWVsZC5pbnRlcnZhbCA9IFV0aWxzLmludGVydmFsIC42LCAtPlxuXHRcdFx0XHRpZiBmaWVsZC5hY3RpdmVcblx0XHRcdFx0XHRpZiBmaWVsZC50ZXh0LmN1cnNvci5vcGFjaXR5XG5cdFx0XHRcdFx0XHRmaWVsZC50ZXh0LmN1cnNvci5hbmltYXRlXG5cdFx0XHRcdFx0XHRcdHByb3BlcnRpZXM6KG9wYWNpdHk6MClcblx0XHRcdFx0XHRcdFx0dGltZTouNVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGZpZWxkLnRleHQuY3Vyc29yLmFuaW1hdGVcblx0XHRcdFx0XHRcdFx0cHJvcGVydGllczoob3BhY2l0eToxKVxuXHRcdFx0XHRcdFx0XHR0aW1lOi41XG5cblxuXHRcdFx0ZmllbGQudGV4dC5vbiBcImNoYW5nZTpodG1sXCIsIC0+XG5cdFx0XHRcdEAuY3Vyc29yLmNvbnN0cmFpbnRzLmxlYWRpbmcgPSBAXG5cdFx0XHRcdGlmIEAuaHRtbCA9PSAnJ1xuXHRcdFx0XHRcdEAucGxhY2Vob2xkZXIudmlzaWJsZSA9IHRydWVcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdEAucGxhY2Vob2xkZXIudmlzaWJsZSA9IGZhbHNlXG5cdFx0XHRcdGlmIEAuaHRtbC5pbmRleE9mKEAucGxhY2Vob2xkZXIpICE9IC0xXG5cdFx0XHRcdFx0QC5odG1sID0gQC5odG1sLnJlcGxhY2UoQC5wbGFjZWhvbGRlciwgJycpXG5cblx0XHRcdFx0aW9zLmxheW91dC5zZXQoQC5jdXJzb3IpXG5cblx0ZmllbGQuaW5wdXQgPSAoa2V5Ym9hcmQpIC0+XG5cdFx0a2V5Ym9hcmQub3V0cHV0KGZpZWxkKVxuXG5cdHJldHVybiBmaWVsZFxuIiwiaW9zID0gcmVxdWlyZSAnaW9zLWtpdCdcblxuZ2VuQ1NTID0gKGNzc0FycmF5KSAtPlxuICBjc3NPYmogPSB7fVxuICBmb3IgcHJvcCxpIGluIGNzc0FycmF5XG4gICAgY29sb25JbmRleCA9IHByb3AuaW5kZXhPZihcIjpcIilcbiAgICBrZXkgPSBwcm9wLnNsaWNlKDAsIGNvbG9uSW5kZXgpXG4gICAgdmFsdWUgPSBwcm9wLnNsaWNlKGNvbG9uSW5kZXggKyAyLCBwcm9wLmxlbmd0aCAtIDEpXG4gICAgY3NzT2JqW2tleV0gPSB2YWx1ZVxuICByZXR1cm4gY3NzT2JqXG5cbmV4cG9ydHMuY29udmVydCA9IChvYmopIC0+XG5cbiAgZ2V0RGVzaWduZWREZXZpY2UgPSAodykgLT5cbiAgICBkZXZpY2UgPSB7fVxuICAgIHN3aXRjaCB3XG4gICAgICB3aGVuIDMyMCwgNDgwLCA2NDAsIDk2MCwgMTI4MFxuICAgICAgICBkZXZpY2Uuc2NhbGUgPSAyXG4gICAgICAgIGRldmljZS5oZWlnaHQgPSA1NjhcbiAgICAgICAgZGV2aWNlLndpZHRoID0gMzIwXG4gICAgICAgIGRldmljZS5uYW1lID0gJ2lwaG9uZS01J1xuICAgICAgd2hlbiAzNzUsIDU2Mi41LCA3NTAsIDExMjUsIDE1MDBcbiAgICAgICAgZGV2aWNlLnNjYWxlID0gMlxuICAgICAgICBkZXZpY2UuaGVpZ2h0ID0gNjY3XG4gICAgICAgIGRldmljZS53aWR0aCA9IDM3NVxuICAgICAgICBkZXZpY2UubmFtZSA9ICdpcGhvbmUtNnMnXG4gICAgICB3aGVuIDQxNCwgNjIxLCA4MjgsIDEyNDIsIDE2NTZcbiAgICAgICAgZGV2aWNlLnNjYWxlID0gM1xuICAgICAgICBkZXZpY2UuaGVpZ2h0ID0gNzM2XG4gICAgICAgIGRldmljZS53aWR0aCA9IDQxNFxuICAgICAgICBkZXZpY2UubmFtZSA9ICdpcGhvbmUtNnMtcGx1cydcbiAgICAgIHdoZW4gNzY4LCAxMTUyLCAxNTM2LCAyMzA0LCAzMDcyXG4gICAgICAgIGRldmljZS5zY2FsZSA9IDJcbiAgICAgICAgZGV2aWNlLmhlaWdodCA9IDEwMjRcbiAgICAgICAgZGV2aWNlLndpZHRoID0gNzY4XG4gICAgICAgIGRldmljZS5uYW1lID0gJ2lwYWQnXG4gICAgICB3aGVuIDEwMjQsIDE1MzYsIDIwNDgsIDMwNzIsIDQwOTZcbiAgICAgICAgZGV2aWNlLnNjYWxlID0gMlxuICAgICAgICBkZXZpY2UuaGVpZ2h0ID0gMTM2NlxuICAgICAgICBkZXZpY2Uud2lkdGggPSAxMDI0XG4gICAgICAgIGRldmljZS5uYW1lID0gJ2lwYWQtcHJvJ1xuICAgIHN3aXRjaCB3XG4gICAgICB3aGVuIDMyMCwgMzc1LCA0MTQsIDc2OCwgMTAyNFxuICAgICAgICBkZXZpY2UuaVNjYWxlID0gMVxuICAgICAgd2hlbiA0ODAsIDU2Mi41LCA2MjEsIDExNTIsIDE1MzZcbiAgICAgICAgZGV2aWNlLmlTY2FsZSA9IDEuNVxuICAgICAgd2hlbiA2NDAsIDc1MCwgODI4LCAxNTM2LCAyMDQ4XG4gICAgICAgIGRldmljZS5pU2NhbGUgPSAyXG4gICAgICB3aGVuIDk2MCwgMTEyNSwgMTI0MiwgMjMwNCwgMzA3MlxuICAgICAgICBkZXZpY2UuaVNjYWxlID0gM1xuICAgICAgd2hlbiAxMjgwLCAxNTAwLCAxNjU2LCAzMDcyLCA0MDk2XG4gICAgICAgIGRldmljZS5pU2NhbGUgPSA0XG4gICAgZGV2aWNlLm9iaiA9ICdkZXZpY2UnXG4gICAgcmV0dXJuIGRldmljZVxuXG4gICMgR3JhYiBrZXlzXG4gIGxheWVyS2V5cyA9IE9iamVjdC5rZXlzKG9iailcblxuICAjIEFkZCBsYXllcnMgaW4gb2JqIHRvIGFycmF5IHVzaW5nIGtleXNcbiAgbGF5ZXJzID0gW11cbiAgYXJ0Ym9hcmRzID0gW11cbiAgbmV3TGF5ZXJzID0ge31cbiAgbmV3QXJ0Ym9hcmRzID0gW11cblxuICBmb3Iga2V5IGluIGxheWVyS2V5c1xuICAgIGlmIG9ialtrZXldLl9pbmZvLmtpbmQgPT0gJ2FydGJvYXJkJ1xuICAgICAgYXJ0Ym9hcmRzLnB1c2ggb2JqW2tleV1cblxuICBmb3IgYiBpbiBhcnRib2FyZHNcblxuICAgIGRldmljZSA9IGdldERlc2lnbmVkRGV2aWNlKGIud2lkdGgpXG5cbiAgICBBcnRib2FyZCA9IChhcnRib2FyZCkgLT5cbiAgICAgIGJvYXJkID0gbmV3IGlvcy5WaWV3XG4gICAgICAgIG5hbWU6YXJ0Ym9hcmQubmFtZVxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6Yi5iYWNrZ3JvdW5kQ29sb3JcbiAgICAgICAgY29uc3RyYWludHM6IHt0b3A6MCwgYm90dG9tOjAsIGxlYWRpbmc6MCwgdHJhaWxpbmc6MH1cbiAgICAgIHJldHVybiBib2FyZFxuXG4gICAgI0dldCBTdGF0ZW1lbnRzXG4gICAgZ2V0U3RyaW5nID0gKGwpIC0+IHJldHVybiBsLl9pbmZvLm1ldGFkYXRhLnN0cmluZ1xuICAgIGdldENTUyA9IChsKSAtPiByZXR1cm4gZ2VuQ1NTKGwuX2luZm8ubWV0YWRhdGEuY3NzKVxuICAgIGdldENvbG9yU3RyaW5nID0gKGwpIC0+IHJldHVybiAnLScgKyBnZXRDU1MobCkuY29sb3IgKyAnICcgKyBnZXRTdHJpbmcobClcbiAgICBnZXRJbWFnZSA9IChsKSAtPiByZXR1cm4gbC5pbWFnZVxuICAgIGdldExheWVyID0gKGwpIC0+IHJldHVybiBsLmNvcHkoKVxuXG5cbiAgICBmb3VuZCA9IChvLHQpIC0+IGlmIG8uaW5kZXhPZih0KSAhPSAtMSB0aGVuIHJldHVybiB0cnVlXG5cbiAgICBnZW5Db25zdHJhaW50cyA9IChsKSAtPlxuICAgICAgY29uc3RyYWludHMgPSB7fVxuICAgICAgcyA9IGRldmljZS5pU2NhbGVcbiAgICAgIGNYID0gZGV2aWNlLndpZHRoLzJcbiAgICAgIGNZID0gZGV2aWNlLmhlaWdodC8yXG4gICAgICB0WSA9IGRldmljZS5oZWlnaHQvNCAqIDNcbiAgICAgIGJZID0gZGV2aWNlLmhlaWdodC80ICogM1xuICAgICAgbFggPSBkZXZpY2Uud2lkdGgvNCAqIDNcbiAgICAgIHRYID0gZGV2aWNlLndpZHRoLzQgKiAzXG5cbiAgICAgIHIgPSAobikgLT4gcmV0dXJuIE1hdGgucm91bmQobilcbiAgICAgIGYgPSAobikgLT4gcmV0dXJuIE1hdGguZmxvb3IobilcblxuICAgICAgaWYgY1ggPT0gbC5taWRYL3MgfHwgcihjWCkgPT0gcihsLm1pZFgvcykgIHx8IGYoY1gpID09IGYobC5taWRYL3MpXG4gICAgICAgIGNvbnN0cmFpbnRzLmFsaWduID0gJ2hvcml6b250YWwnXG5cbiAgICAgIGlmIGNZID09IGwubWlkWS9zIHx8IHIoY1kpID09IHIobC5taWRZL3MpIHx8IGYoY1kpID09IGYobC5taWRZL3MpXG4gICAgICAgIGlmIGNvbnN0cmFpbnRzLmFsaWduID09ICdob3Jpem9udGFsJ1xuICAgICAgICAgIGNvbnN0cmFpbnRzLmFsaWduID0gJ2NlbnRlcidcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNvbnN0cmFpbnRzLmFsaWduID0gJ3ZlcnRpY2FsJ1xuXG4gICAgICBpZiBsLngvcyA8IGxYXG4gICAgICAgIGNvbnN0cmFpbnRzLmxlYWRpbmcgPSByKGwueC9zKVxuICAgICAgaWYgbC54L3MgPiB0WFxuICAgICAgICBjb25zdHJhaW50cy50cmFpbGluZyA9IHIobC5wYXJlbnQud2lkdGgvcyAtIGwubWF4WC9zKVxuXG4gICAgICBpZiBsLnkvcyA8IHRZXG4gICAgICAgIGNvbnN0cmFpbnRzLnRvcCA9IHIobC55L3MpXG4gICAgICBpZiBsLnkvcyA+IGJZXG4gICAgICAgIGNvbnN0cmFpbnRzLmJvdHRvbSA9IHIobC5wYXJlbnQuaGVpZ2h0L3MgLSBsLm1heFkvcylcblxuICAgICAgaWYgbC53aWR0aC9zID09IGRldmljZS53aWR0aFxuICAgICAgICBjb25zdHJhaW50cy5sZWFkaW5nID0gMFxuICAgICAgICBjb25zdHJhaW50cy50cmFpbGluZyA9IDBcbiAgICAgIGVsc2VcbiAgICAgICAgY29uc3RyYWludHMud2lkdGggPSBsLndpZHRoL3NcblxuICAgICAgaWYgbC5oZWlnaHQvcyA9PSBkZXZpY2UuaGVpZ2h0XG4gICAgICAgIGNvbnN0cmFpbnRzLnRvcCA9IDBcbiAgICAgICAgY29uc3RyYWludHMuYm90dG9tID0gMFxuICAgICAgZWxzZVxuICAgICAgICBjb25zdHJhaW50cy5oZWlnaHQgPSBsLmhlaWdodC9zXG5cbiAgICAgIHJldHVybiBjb25zdHJhaW50c1xuXG4gICAgZ2VuTGF5ZXIgPSAobCwgcGFyZW50KSAtPlxuICAgICAgcHJvcHMgPVxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6J3RyYW5zcGFyZW50J1xuICAgICAgICBuYW1lOmwubmFtZVxuICAgICAgICBpbWFnZTpsLmltYWdlXG4gICAgICAgIHN1cGVyTGF5ZXI6IHBhcmVudFxuICAgICAgICBjb25zdHJhaW50czogZ2VuQ29uc3RyYWludHMobClcblxuICAgICAgcmV0dXJuIG5ldyBpb3MuVmlldyBwcm9wc1xuXG4gICAgZ2VuQWxlcnQgPSAobCwgblApIC0+XG4gICAgICBwcm9wcyA9XG4gICAgICAgIGFjdGlvbnM6W11cbiAgICAgICAgc3VwZXJMYXllcjpuUFxuICAgICAgZm9yIGMgaW4gbC5jaGlsZHJlblxuICAgICAgICBuID0gYy5uYW1lXG4gICAgICAgIGlmIGZvdW5kKG4sICd0aXRsZScpIHRoZW4gcHJvcHMudGl0bGUgPSBnZXRTdHJpbmcoYylcbiAgICAgICAgaWYgZm91bmQobiwgJ21lc3NhZ2UnKSB0aGVuIHByb3BzLm1lc3NhZ2UgPSBnZXRTdHJpbmcoYylcbiAgICAgICAgaWYgZm91bmQobiwgJ2FjdGlvbicpIHRoZW4gcHJvcHMuYWN0aW9ucy51bnNoaWZ0IGdldENvbG9yU3RyaW5nKGMpXG4gICAgICAgIGMuZGVzdHJveSgpXG4gICAgICByZXR1cm4gbmV3IGlvcy5BbGVydCBwcm9wc1xuXG4gICAgZ2VuQmFubmVyID0gKGwsIG5QKSAtPlxuICAgICAgcHJvcHMgPSB7c3VwZXJMYXllcjpuUH1cbiAgICAgIGZvciBjIGluIGwuY2hpbGRyZW5cbiAgICAgICAgbiA9IGMubmFtZVxuICAgICAgICBpZiBmb3VuZChuLCAnYXBwJykgdGhlbiBwcm9wcy5hcHAgPSBnZXRTdHJpbmcoYylcbiAgICAgICAgaWYgZm91bmQobiwgJ3RpdGxlJykgdGhlbiBwcm9wcy50aXRsZSA9IGdldFN0cmluZyhjKVxuICAgICAgICBpZiBmb3VuZChuLCAnbWVzc2FnZScpIHRoZW4gcHJvcHMubWVzc2FnZSA9IGdldFN0cmluZyhjKVxuICAgICAgICBpZiBmb3VuZChuLCAndGltZScpIHRoZW4gcHJvcHMudGltZSA9IGdldFN0cmluZyhjKVxuICAgICAgICBpZiBmb3VuZChuLCAnaWNvbicpIHRoZW4gcHJvcHMuaWNvbiA9IGdldExheWVyKGMpXG4gICAgICAgIGMuZGVzdHJveSgpXG4gICAgICByZXR1cm4gbmV3IGlvcy5CYW5uZXIgcHJvcHNcblxuICAgIGdlbkJ1dHRvbiA9IChsLCBuUCkgLT5cbiAgICAgIHByb3BzID1cbiAgICAgICAgc3VwZXJMYXllcjpuUFxuICAgICAgICBjb25zdHJhaW50czpnZW5Db25zdHJhaW50cyhsKVxuXG4gICAgICBmb3IgYyBpbiBsLmNoaWxkcmVuXG4gICAgICAgIG4gPSBjLm5hbWVcbiAgICAgICAgaWYgZm91bmQobiwgJ3NtYWxsJykgdGhlbiBwcm9wcy50eXBlID0gJ3NtYWxsJ1xuICAgICAgICBpZiBmb3VuZChuLCAnYmlnJykgdGhlbiBwcm9wcy50eXBlID0gJ2JpZydcbiAgICAgICAgaWYgZm91bmQobiwgJ2RhcmsnKSB0aGVuIHByb3BzLnN0eWxlID0gJ2RhcmsnXG4gICAgICAgIGlmIGZvdW5kKG4sICdsYWJlbCcpXG4gICAgICAgICAgcHJvcHMudGV4dCA9IGdldFN0cmluZyhjKVxuICAgICAgICAgIHByb3BzLmNvbG9yID0gZ2V0Q1NTKGMpLmNvbG9yXG4gICAgICAgICAgcHJvcHMuZm9udFNpemUgPSBnZXRDU1MoYylbJ2ZvbnQtc2l6ZSddLnJlcGxhY2UoJ3B4JywgJycpXG4gICAgICAgIGMuZGVzdHJveSgpXG4gICAgICByZXR1cm4gbmV3IGlvcy5CdXR0b24gcHJvcHNcblxuICAgIGdlbkZpZWxkID0gKGwsIG5QKSAtPlxuICAgICAgcHJvcHMgPVxuICAgICAgICBzdXBlckxheWVyOm5QXG4gICAgICAgIGNvbnN0cmFpbnRzOmdlbkNvbnN0cmFpbnRzKGwpXG4gICAgICBmb3IgYyBpbiBsLmNoaWxkcmVuXG4gICAgICAgIG4gPSBjLm5hbWVcblxuICAgICAgICBpZiBmb3VuZChuLCAncGxhY2Vob2xkZXInKVxuICAgICAgICAgIHByb3BzLnBsYWNlaG9sZGVyID0gZ2V0U3RyaW5nKGMpXG4gICAgICAgIGMuZGVzdHJveSgpXG4gICAgICByZXR1cm4gbmV3IGlvcy5GaWVsZCBwcm9wc1xuXG4gICAgZ2VuS2V5Ym9hcmQgPSAobCwgblApIC0+XG4gICAgICBwcm9wcyA9XG4gICAgICAgIHN1cGVyTGF5ZXI6blBcblxuICAgICAgZm9yIGMgaW4gbC5jaGlsZHJlblxuICAgICAgICBuID0gYy5uYW1lXG5cbiAgICAgICAgaWYgZm91bmQobiwgJ3JldHVybicpIHRoZW4gcHJvcHMucmV0dXJuVGV4dCA9IGdldFN0cmluZyhjKVxuICAgICAgICBpZiBmb3VuZChuLCAnZGFyaycpIHRoZW4gcHJvcHMuc3R5bGUgPSAnZGFyaydcbiAgICAgICAgYy5kZXN0cm95KClcbiAgICAgIHJldHVybiBuZXcgaW9zLktleWJvYXJkIHByb3BzXG5cbiAgICBnZW5OYXZCYXIgPSAobCwgblApIC0+XG4gICAgICBwcm9wcyA9XG4gICAgICAgIHN1cGVyTGF5ZXI6blBcbiAgICAgIGZvciBjIGluIGwuY2hpbGRyZW5cbiAgICAgICAgbiA9IGMubmFtZVxuICAgICAgICBpZiBmb3VuZChuLCAndGl0bGUnKVxuICAgICAgICAgIHByb3BzLnRpdGxlID0gZ2V0U3RyaW5nKGMpXG4gICAgICAgICAgcHJvcHMudGl0bGVDb2xvciA9IGdldENTUyhjKS5jb2xvclxuICAgICAgICBpZiBmb3VuZChuLCAncmlnaHQnKVxuICAgICAgICAgIHByb3BzLnJpZ2h0ID0gZ2V0U3RyaW5nKGMpXG4gICAgICAgICAgcHJvcHMuY29sb3IgPSBnZXRDU1MoYykuY29sb3JcbiAgICAgICAgaWYgZm91bmQobiwgJ2xlZnQnKSB0aGVuIHByb3BzLmxlZnQgPSBnZXRTdHJpbmcoYylcbiAgICAgICAgYy5kZXN0cm95KClcbiAgICAgIHJldHVybiBuZXcgaW9zLk5hdkJhciBwcm9wc1xuXG4gICAgZ2VuU2hlZXQgPSAobCwgblApIC0+XG4gICAgICBwcm9wcyA9XG4gICAgICAgIGFjdGlvbnM6W11cbiAgICAgICAgc3VwZXJMYXllcjogblBcblxuICAgICAgZm9yIGMsIGkgaW4gbC5jaGlsZHJlblxuICAgICAgICBuID0gYy5uYW1lXG4gICAgICAgIGlmIGZvdW5kKG4sICdhY3Rpb24nKSB0aGVuIHByb3BzLmFjdGlvbnMucHVzaCBnZXRDb2xvclN0cmluZyhjKVxuICAgICAgICBpZiBmb3VuZChuLCAnZXhpdCcpIHRoZW4gcHJvcHMuZXhpdCA9IGdldFN0cmluZyhjKVxuICAgICAgICBjLmRlc3Ryb3koKVxuXG4gICAgICByZXR1cm4gbmV3IGlvcy5TaGVldCBwcm9wc1xuXG4gICAgZ2VuU3RhdHVzQmFyID0gKGwsIG5QKSAtPlxuICAgICAgcHJvcHMgPVxuICAgICAgICBzdXBlckxheWVyOiBuUFxuXG4gICAgICBmb3IgYyBpbiBsLmNoaWxkcmVuXG4gICAgICAgIG4gPSBjLm5hbWVcbiAgICAgICAgaWYgZm91bmQobiwgJ2NhcnJpZXInKSB0aGVuIHByb3BzLmNhcnJpZXIgPSBnZXRTdHJpbmcoYylcbiAgICAgICAgaWYgZm91bmQobiwgJ2JhdHRlcnknKSB0aGVuIHByb3BzLmJhdHRlcnkgPSBnZXRTdHJpbmcoYykucmVwbGFjZSgnJScsICcnKVxuICAgICAgICBpZiBmb3VuZChuLCAnbmV0d29yaycpIHRoZW4gcHJvcHMubmV0d29yayA9IGdldFN0cmluZyhjKVxuICAgICAgICBpZiBmb3VuZChuLCAnZGFyaycpIHRoZW4gcHJvcHMuc3R5bGUgPSAnbGlnaHQnXG4gICAgICAgIGMuZGVzdHJveSgpXG4gICAgICByZXR1cm4gbmV3IGlvcy5TdGF0dXNCYXIgcHJvcHNcblxuICAgIGdlblRhYkJhciA9IChsLCBuUCkgLT5cbiAgICAgIHByb3BzID1cbiAgICAgICAgdGFiczogW11cbiAgICAgICAgc3VwZXJMYXllcjpuUFxuXG4gICAgICBmb3IgYyBpbiBsLmNoaWxkcmVuXG4gICAgICAgIG4gPSBjLm5hbWVcbiAgICAgICAgdHByb3BzID0ge31cbiAgICAgICAgZm9yIHQgaW4gYy5jaGlsZHJlblxuICAgICAgICAgIHRuID0gdC5uYW1lXG5cbiAgICAgICAgICBpZiBuID09ICd0YWJfYWN0aXZlJyAmJiB0bi5pbmRleE9mKCdsYWJlbCcpICE9IC0xXG4gICAgICAgICAgICBwcm9wcy5hY3RpdmVDb2xvciA9IGdldENTUyh0KS5jb2xvclxuICAgICAgICAgIGlmIG4gIT0gJ3RhYl9hY3RpdmUnICYmIHRuLmluZGV4T2YoJ2xhYmVsJykgIT0gLTFcbiAgICAgICAgICAgIHByb3BzLmluYWN0aXZlQ29sb3IgPSBnZXRDU1ModCkuY29sb3JcblxuICAgICAgICAgIGlmIGZvdW5kKHRuLCAnYWN0aXZlJykgJiYgdG4uaW5kZXhPZignaW5hY3RpdmUnKSA9PSAtMSB0aGVuIHRwcm9wcy5hY3RpdmUgPSBnZXRMYXllcih0KVxuICAgICAgICAgIGlmIGZvdW5kKHRuLCAnaW5hY3RpdmUnKSB0aGVuIHRwcm9wcy5pbmFjdGl2ZSA9IGdldExheWVyKHQpXG4gICAgICAgICAgaWYgZm91bmQodG4sICdsYWJlbCcpIHRoZW4gdHByb3BzLmxhYmVsID0gZ2V0U3RyaW5nKHQpXG5cbiAgICAgICAgICB0LmRlc3Ryb3koKVxuICAgICAgICBwcm9wcy50YWJzLnVuc2hpZnQgbmV3IGlvcy5UYWIgdHByb3BzXG5cblxuICAgICAgICBjLmRlc3Ryb3koKVxuXG4gICAgICByZXR1cm4gbmV3IGlvcy5UYWJCYXIgcHJvcHNcblxuICAgIGdlblRleHQgPSAobCwgblApIC0+XG4gICAgICBwcm9wcyA9XG4gICAgICAgIHN1cGVyTGF5ZXI6blBcbiAgICAgICAgdGV4dDpnZXRTdHJpbmcobClcbiAgICAgICAgY29uc3RyYWludHM6Z2VuQ29uc3RyYWludHMobClcbiAgICAgIGNzcyA9IGdldENTUyhsKVxuICAgICAga2V5cyA9IE9iamVjdC5rZXlzKGdldENTUyhsKSlcbiAgICAgIGZvciBrIGluIGtleXNcbiAgICAgICAgaWYgZm91bmQoaywgJ2ZvbnQtZmFtaWx5JykgdGhlbiBwcm9wcy5mb250RmFtaWx5ID0gY3NzW2tdXG4gICAgICAgIGlmIGZvdW5kKGssICdvcGFjaXR5JykgdGhlbiBwcm9wcy5vcGFjaXR5ID0gTnVtYmVyKGNzc1trXSlcbiAgICAgICAgaWYgZm91bmQoaywgJ2NvbG9yJykgdGhlbiBwcm9wcy5jb2xvciA9IGNzc1trXVxuICAgICAgICBpZiBmb3VuZChrLCAnZm9udC1zaXplJykgdGhlbiBwcm9wcy5mb250U2l6ZSA9IGNzc1trXS5yZXBsYWNlKCdweCcsICcnKVxuICAgICAgICBpZiBmb3VuZChrLCAnbGV0dGVyLXNwYWNpbmcnKSB0aGVuIHByb3BzLmxldHRlclNwYWNpbmcgPSBjc3Nba11cbiAgICAgICAgaWYgZm91bmQoaywgJ2xpbmUtaGVpZ2h0JykgdGhlbiBwcm9wcy5saW5lSGVpZ2h0ID0gY3NzW2tdLnJlcGxhY2UoJ3B4JywgJycpXG4gICAgICByZXR1cm4gbmV3IGlvcy5UZXh0IHByb3BzXG5cbiAgICBjaGlsZHJlbiA9IChwLCBuUCkgLT5cblxuICAgICAgZm9yIGMgaW4gcC5jaGlsZHJlblxuICAgICAgICBuID0gYy5uYW1lXG4gICAgICAgIG5ld0xheWVyID0gMFxuICAgICAgICBpZiBjLm5hbWVbMF0gPT0gJ18nXG4gICAgICAgICAgaWYgZm91bmQobiwgJ19BbGVydCcpIHRoZW4gIG5ld0xheWVyID0gZ2VuQWxlcnQoYywgblApXG4gICAgICAgICAgaWYgZm91bmQobiwnX0Jhbm5lcicpIHRoZW4gbmV3TGF5ZXIgPSBnZW5CYW5uZXIoYywgblApXG4gICAgICAgICAgaWYgZm91bmQobiwgJ19CdXR0b24nKSB0aGVuIG5ld0xheWVyID0gZ2VuQnV0dG9uKGMsIG5QKVxuICAgICAgICAgIGlmIGZvdW5kKG4sICdfRmllbGQnKSB0aGVuIG5ld0xheWVyID0gZ2VuRmllbGQoYywgblApXG4gICAgICAgICAgaWYgZm91bmQobiwgJ19LZXlib2FyZCcpIHRoZW4gbmV3TGF5ZXIgPSBnZW5LZXlib2FyZChjLCBuUClcbiAgICAgICAgICBpZiBmb3VuZChuLCdfTmF2QmFyJykgdGhlbiBuZXdMYXllciA9IGdlbk5hdkJhcihjLCBuUClcbiAgICAgICAgICBpZiBmb3VuZChuLCAnX1NoZWV0JykgdGhlbiBuZXdMYXllciA9IGdlblNoZWV0KGMsIG5QKVxuICAgICAgICAgIGlmIGZvdW5kKG4sICdfVGFiQmFyJykgdGhlbiBuZXdMYXllciA9IGdlblRhYkJhcihjLCBuUClcbiAgICAgICAgICBpZiBmb3VuZChuLCAnX1N0YXR1c0JhcicpIHRoZW4gbmV3TGF5ZXIgPSBuZXcgZ2VuU3RhdHVzQmFyKGMsIG5QKVxuICAgICAgICAgIGlmIGZvdW5kKG4sICdfVGV4dCcpIHRoZW4gbmV3TGF5ZXIgPSBnZW5UZXh0KGMsIG5QKVxuICAgICAgICAgIGlmIG5ld0xheWVyID09IHVuZGVmaW5lZCB0aGVuIG5ld0xheWVyID0gZ2VuTGF5ZXIoYywgblApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBuZXdMYXllciA9IGdlbkxheWVyKGMsIG5QKVxuXG4gICAgICAgIG5ld0xheWVyc1tuXSA9IG5ld0xheWVyXG5cbiAgICAgICAgaWYgYy5jaGlsZHJlblxuICAgICAgICAgIGNoaWxkcmVuKGMsIG5ld0xheWVyKVxuXG4gICAgICAgIGMuZGVzdHJveSgpXG5cbiAgICBpb3MubFtiLm5hbWVdID0gbmV3IEFydGJvYXJkIGJcblxuICAgIGNoaWxkcmVuKGIsIGlvcy5sW2IubmFtZV0pXG5cbiAgICBiLmRlc3Ryb3koKVxuXG4gICAgbmV3QXJ0Ym9hcmRzLnB1c2ggaW9zLmxbYi5uYW1lXVxuICAgIG5ld0xheWVyc1tiLm5hbWVdID0gaW9zLmxbYi5uYW1lXVxuXG4gIHJldHVybiBuZXdMYXllcnNcbiIsImlvcyA9IHJlcXVpcmUgJ2lvcy1raXQnXG5cbmV4cG9ydHMuZGVmYXVsdHMgPVxuXHRcdHRleHQ6XCJCdXR0b25cIlxuXHRcdHR5cGU6XCJ0ZXh0XCJcblx0XHRzdHlsZTpcImxpZ2h0XCJcblx0XHRiYWNrZ3JvdW5kQ29sb3I6XCJ3aGl0ZVwiXG5cdFx0Y29sb3I6XCIjMDA3QUZGXCJcblx0XHRmb250U2l6ZToxN1xuXHRcdGZvbnRXZWlnaHQ6XCJyZWd1bGFyXCJcblx0XHRuYW1lOlwiYnV0dG9uXCJcblx0XHRibHVyOnRydWVcblx0XHRzdXBlckxheWVyOnVuZGVmaW5lZFxuXHRcdGNvbnN0cmFpbnRzOnVuZGVmaW5lZFxuXG5leHBvcnRzLmRlZmF1bHRzLnByb3BzID0gT2JqZWN0LmtleXMoZXhwb3J0cy5kZWZhdWx0cylcblxuZXhwb3J0cy5jcmVhdGUgPSAoYXJyYXkpIC0+XG5cdHNldHVwID0gaW9zLnV0aWxzLnNldHVwQ29tcG9uZW50KGFycmF5LCBleHBvcnRzLmRlZmF1bHRzKVxuXG5cdGJ1dHRvbiA9IG5ldyBpb3MuVmlld1xuXHRcdG5hbWU6c2V0dXAubmFtZVxuXHRcdGNvbnN0cmFpbnRzOnNldHVwLmNvbnN0cmFpbnRzXG5cdFx0c3VwZXJMYXllcjpzZXR1cC5zdXBlckxheWVyXG5cdGJ1dHRvbi50eXBlID0gc2V0dXAudHlwZVxuXG5cdGNvbG9yID0gXCJcIlxuXG5cdHN3aXRjaCBzZXR1cC50eXBlXG5cdFx0d2hlbiBcImJpZ1wiXG5cdFx0XHRzZXR1cC5mb250U2l6ZSA9IDIwXG5cdFx0XHRzZXR1cC5mb250V2VpZ2h0ID0gXCJtZWRpdW1cIlxuXG5cdFx0XHRidXR0b24uYm9yZGVyUmFkaXVzID0gaW9zLnV0aWxzLnB4KDEyLjUpXG5cdFx0XHRiYWNrZ3JvdW5kQ29sb3IgPSBcIlwiXG5cblx0XHRcdGlmIGJ1dHRvbi5jb25zdHJhaW50cyA9PSB1bmRlZmluZWQgdGhlbiBidXR0b24uY29uc3RyYWludHMgPSB7fVxuXHRcdFx0YnV0dG9uLmNvbnN0cmFpbnRzLmxlYWRpbmcgPSAxMFxuXHRcdFx0YnV0dG9uLmNvbnN0cmFpbnRzLnRyYWlsaW5nID0gMTBcblx0XHRcdGJ1dHRvbi5jb25zdHJhaW50cy5oZWlnaHQgPSA1N1xuXG5cdFx0XHRzd2l0Y2ggc2V0dXAuc3R5bGVcblx0XHRcdFx0d2hlbiBcImxpZ2h0XCJcblx0XHRcdFx0XHRjb2xvciA9IGlvcy51dGlscy5jb2xvcihcImJsdWVcIilcblx0XHRcdFx0XHRpZiBzZXR1cC5ibHVyXG5cdFx0XHRcdFx0XHRiYWNrZ3JvdW5kQ29sb3IgPSBcInJnYmEoMjU1LCAyNTUsIDI1NSwgLjkpXCJcblx0XHRcdFx0XHRcdGlvcy51dGlscy5iZ0JsdXIoYnV0dG9uKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGJhY2tncm91bmRDb2xvciA9IFwid2hpdGVcIlxuXG5cdFx0XHRcdHdoZW4gXCJkYXJrXCJcblx0XHRcdFx0XHRjb2xvciA9IFwiI0ZGRlwiXG5cdFx0XHRcdFx0aWYgc2V0dXAuYmx1clxuXHRcdFx0XHRcdFx0YmFja2dyb3VuZENvbG9yID0gXCJyZ2JhKDQzLCA0MywgNDMsIC45KVwiXG5cdFx0XHRcdFx0XHRpb3MudXRpbHMuYmdCbHVyKGJ1dHRvbilcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRiYWNrZ3JvdW5kQ29sb3IgPSBcIiMyODI4MjhcIlxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0aWYgc2V0dXAuYmx1clxuXHRcdFx0XHRcdFx0Y29sb3IgPSBzZXR1cC5jb2xvclxuXHRcdFx0XHRcdFx0YmFja2dyb3VuZENvbG9yID0gbmV3IENvbG9yKHNldHVwLmJhY2tncm91bmRDb2xvcilcblx0XHRcdFx0XHRcdHJnYlN0cmluZyA9IGJhY2tncm91bmRDb2xvci50b1JnYlN0cmluZygpXG5cdFx0XHRcdFx0XHRyZ2JhU3RyaW5nID0gcmdiU3RyaW5nLnJlcGxhY2UoXCIpXCIsIFwiLCAuOSlcIilcblx0XHRcdFx0XHRcdHJnYmFTdHJpbmcgID0gcmdiYVN0cmluZy5yZXBsYWNlKFwicmdiXCIsIFwicmdiYVwiKVxuXHRcdFx0XHRcdFx0YmFja2dyb3VuZENvbG9yID0gcmdiYVN0cmluZ1xuXHRcdFx0XHRcdFx0aW9zLnV0aWxzLmJnQmx1cihidXR0b24pXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0Y29sb3IgPSBzZXR1cC5jb2xvclxuXHRcdFx0XHRcdFx0YmFja2dyb3VuZENvbG9yID0gbmV3IENvbG9yKHNldHVwLmJhY2tncm91bmRDb2xvcilcblxuXHRcdFx0YnV0dG9uLmJhY2tncm91bmRDb2xvciA9IGJhY2tncm91bmRDb2xvclxuXG5cdFx0XHRidXR0b24ub24gRXZlbnRzLlRvdWNoU3RhcnQsIC0+XG5cdFx0XHRcdG5ld0NvbG9yID0gXCJcIlxuXHRcdFx0XHRpZiBzZXR1cC5zdHlsZSA9PSBcImRhcmtcIlxuXHRcdFx0XHRcdG5ld0NvbG9yID0gYnV0dG9uLmJhY2tncm91bmRDb2xvci5saWdodGVuKDEwKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0bmV3Q29sb3IgPSBidXR0b24uYmFja2dyb3VuZENvbG9yLmRhcmtlbigxMClcblx0XHRcdFx0YnV0dG9uLmFuaW1hdGVcblx0XHRcdFx0XHRwcm9wZXJ0aWVzOihiYWNrZ3JvdW5kQ29sb3I6bmV3Q29sb3IpXG5cdFx0XHRcdFx0dGltZTouNVxuXG5cdFx0XHRidXR0b24ub24gRXZlbnRzLlRvdWNoRW5kLCAtPlxuXHRcdFx0XHRidXR0b24uYW5pbWF0ZVxuXHRcdFx0XHRcdHByb3BlcnRpZXM6KGJhY2tncm91bmRDb2xvcjpiYWNrZ3JvdW5kQ29sb3IpXG5cdFx0XHRcdFx0dGltZTouNVxuXG5cdFx0d2hlbiBcInNtYWxsXCJcblx0XHRcdHNldHVwLmZvbnRTaXplID0gMTRcblx0XHRcdHNldHVwLnRvcCA9IDRcblx0XHRcdGJ1dHRvbi5ib3JkZXJSYWRpdXMgPSBpb3MudXRpbHMucHgoMi41KVxuXHRcdFx0c2V0dXAuZm9udFdlaWdodCA9IDUwMFxuXHRcdFx0c2V0dXAudGV4dCA9IHNldHVwLnRleHQudG9VcHBlckNhc2UoKVxuXHRcdFx0Y29sb3IgPSBzZXR1cC5jb2xvclxuXHRcdFx0YnV0dG9uLmJvcmRlckNvbG9yID0gc2V0dXAuY29sb3JcblxuXHRcdFx0YnV0dG9uLmJhY2tncm91bmRDb2xvciA9IFwidHJhbnNwYXJlbnRcIlxuXHRcdFx0YnV0dG9uLmJvcmRlcldpZHRoID0gaW9zLnV0aWxzLnB4KDEpXG5cblx0XHRlbHNlXG5cdFx0XHRidXR0b24uYmFja2dyb3VuZENvbG9yID0gXCJ0cmFuc3BhcmVudFwiXG5cdFx0XHRidXR0b24ub3JpZ0NvbG9yID0gaW9zLnV0aWxzLnNwZWNpYWxDaGFyKGJ1dHRvbilcblxuXHRcdFx0Y29sb3IgPSBzZXR1cC5jb2xvclxuXHRcdFx0YnV0dG9uLmxhYmVsT3JpZ0NvbG9yID0gY29sb3JcblxuXG5cdFx0XHRidXR0b24ub24gRXZlbnRzLlRvdWNoU3RhcnQsIC0+XG5cdFx0XHRcdEAubGFiZWxPcmlnQ29sb3IgPSBidXR0b24ubGFiZWwuY29sb3Jcblx0XHRcdFx0bmV3Q29sb3IgPSBidXR0b24uc3ViTGF5ZXJzWzBdLmNvbG9yLmxpZ2h0ZW4oMzApXG5cdFx0XHRcdGJ1dHRvbi5zdWJMYXllcnNbMF0uYW5pbWF0ZVxuXHRcdFx0XHRcdHByb3BlcnRpZXM6KGNvbG9yOm5ld0NvbG9yKVxuXHRcdFx0XHRcdHRpbWU6LjVcblxuXHRcdFx0YnV0dG9uLm9uIEV2ZW50cy5Ub3VjaEVuZCwgLT5cblx0XHRcdFx0QC5zdWJMYXllcnNbMF0uYW5pbWF0ZVxuXHRcdFx0XHRcdHByb3BlcnRpZXM6KGNvbG9yOmlvcy51dGlscy5jb2xvcihALmxhYmVsT3JpZ0NvbG9yKSlcblx0XHRcdFx0XHR0aW1lOi41XG5cblx0YnV0dG9uLmxhYmVsID0gbmV3IGlvcy5UZXh0XG5cdFx0bmFtZTpcIi5sYWJlbFwiXG5cdFx0dGV4dDpzZXR1cC50ZXh0XG5cdFx0Y29sb3I6Y29sb3Jcblx0XHRsaW5lSGVpZ2h0OjE2XG5cdFx0c3VwZXJMYXllcjpidXR0b25cblx0XHRmb250U2l6ZTpzZXR1cC5mb250U2l6ZVxuXHRcdGZvbnRXZWlnaHQ6c2V0dXAuZm9udFdlaWdodFxuXHRcdGNvbnN0cmFpbnRzOlxuXHRcdFx0YWxpZ246XCJjZW50ZXJcIlxuXG5cdHN3aXRjaCBzZXR1cC50eXBlXG5cdFx0d2hlbiBcInNtYWxsXCJcblx0XHRcdGJ1dHRvbi5wcm9wcyA9ICh3aWR0aDpidXR0b24ubGFiZWwud2lkdGggKyBpb3MudXRpbHMucHgoMjApLCBoZWlnaHQ6IGJ1dHRvbi5sYWJlbC5oZWlnaHQgKyBpb3MudXRpbHMucHgoMTApKVxuXG5cdFx0XHRidXR0b24ub24gRXZlbnRzLlRvdWNoU3RhcnQsIC0+XG5cdFx0XHRcdGJ1dHRvbi5hbmltYXRlXG5cdFx0XHRcdFx0cHJvcGVydGllczooYmFja2dyb3VuZENvbG9yOmNvbG9yKVxuXHRcdFx0XHRcdHRpbWU6LjVcblx0XHRcdFx0YnV0dG9uLmxhYmVsLmFuaW1hdGVcblx0XHRcdFx0XHRwcm9wZXJ0aWVzOihjb2xvcjpcIiNGRkZcIilcblx0XHRcdFx0XHR0aW1lOi41XG5cdFx0XHRidXR0b24ub24gRXZlbnRzLlRvdWNoRW5kLCAtPlxuXHRcdFx0XHRidXR0b24uYW5pbWF0ZVxuXHRcdFx0XHRcdHByb3BlcnRpZXM6KGJhY2tncm91bmRDb2xvcjpcInRyYW5zcGFyZW50XCIpXG5cdFx0XHRcdFx0dGltZTouNVxuXHRcdFx0XHRidXR0b24ubGFiZWwuYW5pbWF0ZVxuXHRcdFx0XHRcdHByb3BlcnRpZXM6KGNvbG9yOmNvbG9yKVxuXHRcdFx0XHRcdHRpbWU6LjVcblx0XHRlbHNlXG5cdFx0XHRidXR0b24ucHJvcHMgPSAod2lkdGg6YnV0dG9uLmxhYmVsLndpZHRoLCBoZWlnaHQ6YnV0dG9uLmxhYmVsLmhlaWdodClcblxuXG5cdGlvcy5sYXlvdXQuc2V0XG5cdFx0dGFyZ2V0OmJ1dHRvblxuXG5cdGlvcy5sYXlvdXQuc2V0XG5cdFx0dGFyZ2V0OmJ1dHRvbi5sYWJlbFxuXHRyZXR1cm4gYnV0dG9uXG4iLCIjIEJhbm5lclxuaW9zID0gcmVxdWlyZSAnaW9zLWtpdCdcblxuZXhwb3J0cy5kZWZhdWx0cyA9XG5cdHRpdGxlOiBcIlRpdGxlXCJcblx0bWVzc2FnZTpcIk1lc3NhZ2VcIlxuXHRhY3Rpb246XCJBY3Rpb25cIlxuXHR0aW1lOlwibm93XCJcblx0YXBwOlwiYXBwXCJcblx0aWNvbjp1bmRlZmluZWRcblx0ZHVyYXRpb246N1xuXHRhbmltYXRlZDp0cnVlXG5cdHJlcGx5OnRydWVcblxuZXhwb3J0cy5kZWZhdWx0cy5wcm9wcyA9IE9iamVjdC5rZXlzKGV4cG9ydHMuZGVmYXVsdHMpXG5cbmV4cG9ydHMuY3JlYXRlID0gKG9iaikgLT5cblx0c2V0dXAgPSBpb3MudXRpbHMuc2V0dXBDb21wb25lbnQob2JqLCBleHBvcnRzLmRlZmF1bHRzKVxuXG5cdCNzZXQgc3BlY3MgZm9yIGVhY2ggZGV2aWNlXG5cdHNwZWNzID1cblx0XHRsZWFkaW5nSWNvbjogMTVcblx0XHR0b3BJY29uOiA4XG5cdFx0dG9wVGl0bGU6IDZcblx0XHR3aWR0aDowXG5cblx0c3dpdGNoIGlvcy5kZXZpY2UubmFtZVxuXHRcdHdoZW4gXCJpcGhvbmUtNVwiXG5cdFx0XHRzcGVjcy53aWR0aCA9IDMwNFxuXHRcdHdoZW4gXCJpcGhvbmUtNnNcIlxuXHRcdFx0c3BlY3Mud2lkdGggPSAzNTlcblx0XHR3aGVuIFwiaXBob25lLTZzLXBsdXNcIlxuXHRcdFx0c3BlY3MubGVhZGluZ0ljb24gPSAxNVxuXHRcdFx0c3BlY3MudG9wSWNvbiA9IDEyXG5cdFx0XHRzcGVjcy50b3BUaXRsZSA9IDEwXG5cdFx0XHRzcGVjcy53aWR0aCA9IDM5OFxuXHRcdHdoZW4gXCJpcGFkXCJcblx0XHRcdHNwZWNzLmxlYWRpbmdJY29uID0gOFxuXHRcdFx0c3BlY3MudG9wSWNvbiA9IDhcblx0XHRcdHNwZWNzLnRvcFRpdGxlID0gMTFcblx0XHRcdHNwZWNzLndpZHRoID0gMzk4XG5cdFx0d2hlbiBcImlwYWQtcHJvXCJcblx0XHRcdHNwZWNzLmxlYWRpbmdJY29uID0gOFxuXHRcdFx0c3BlY3MudG9wSWNvbiA9IDhcblx0XHRcdHNwZWNzLnRvcFRpdGxlID0gOVxuXHRcdFx0c3BlY3Mud2lkdGggPSA1NTZcblxuXG5cdGJhbm5lciA9IG5ldyBpb3MuVmlld1xuXHRcdGJhY2tncm91bmRDb2xvcjpcInJnYmEoMjU1LDI1NSwyNTUsLjYpXCJcblx0XHRuYW1lOlwiYmFubmVyXCJcblx0XHRib3JkZXJSYWRpdXM6aW9zLnB4KDEyKVxuXHRcdHNoYWRvd0NvbG9yOlwicmdiYSgwLDAsMCwuMylcIlxuXHRcdHNoYWRvd1k6aW9zLnB4KDIpXG5cdFx0c2hhZG93Qmx1cjppb3MucHgoMTApXG5cdFx0Y2xpcDp0cnVlXG5cdFx0Y29uc3RyYWludHM6XG5cdFx0XHRhbGlnbjonaG9yaXpvbnRhbCdcblx0XHRcdHdpZHRoOnNwZWNzLndpZHRoXG5cdFx0XHR0b3A6OFxuXHRcdFx0aGVpZ2h0OjkzXG5cblx0YmFubmVyLmhlYWRlciA9IG5ldyBpb3MuVmlld1xuXHRcdGJhY2tncm91bmRDb2xvcjpcInJnYmEoMjU1LDI1NSwyNTUsIC4zKVwiXG5cdFx0bmFtZTpcIi5oZWFkZXJcIlxuXHRcdHN1cGVyTGF5ZXI6YmFubmVyXG5cdFx0Y29uc3RyYWludHM6XG5cdFx0XHRoZWlnaHQ6MzZcblx0XHRcdGxlYWRpbmc6MFxuXHRcdFx0dHJhaWxpbmc6MFxuXG5cdGlmIHNldHVwLmljb24gPT0gdW5kZWZpbmVkXG5cblx0XHRiYW5uZXIuaWNvbiA9IG5ldyBpb3MuVmlld1xuXHRcdFx0c3VwZXJMYXllcjpiYW5uZXIuaGVhZGVyXG5cdFx0YmFubmVyLmljb24uc3R5bGVbXCJiYWNrZ3JvdW5kXCJdID0gXCJsaW5lYXItZ3JhZGllbnQoLTE4MGRlZywgIzY3RkY4MSAwJSwgIzAxQjQxRiAxMDAlKVwiXG5cblx0ZWxzZVxuXG5cdFx0YmFubmVyLmhlYWRlci5hZGRTdWJMYXllcihzZXR1cC5pY29uKVxuXHRcdGJhbm5lci5pY29uID0gc2V0dXAuaWNvblxuXG5cblx0YmFubmVyLmljb24uYm9yZGVyUmFkaXVzID0gaW9zLnV0aWxzLnB4KDQuNSlcblx0YmFubmVyLmljb24ubmFtZSA9IFwiLmljb25cIlxuXHRiYW5uZXIuaWNvbi5jb25zdHJhaW50cyA9XG5cdFx0aGVpZ2h0OjIwXG5cdFx0d2lkdGg6MjBcblx0XHRsZWFkaW5nOnNwZWNzLmxlYWRpbmdJY29uXG5cdFx0YWxpZ246XCJ2ZXJ0aWNhbFwiXG5cblx0aW9zLmxheW91dC5zZXQoYmFubmVyLmljb24pXG5cblx0YmFubmVyLmFwcCA9IG5ldyBpb3MuVGV4dFxuXHRcdHRleHQ6c2V0dXAuYXBwLnRvVXBwZXJDYXNlKClcblx0XHRjb2xvcjpcInJnYmEoMCwwLDAsLjUpXCJcblx0XHRmb250U2l6ZToxM1xuXHRcdGxldHRlclNwYWNpbmc6LjVcblx0XHRzdXBlckxheWVyOmJhbm5lci5oZWFkZXJcblx0XHRjb25zdHJhaW50czpcblx0XHRcdGxlYWRpbmc6W2Jhbm5lci5pY29uLCA2XVxuXHRcdFx0YWxpZ246XCJ2ZXJ0aWNhbFwiXG5cblx0YmFubmVyLnRpdGxlID0gbmV3IGlvcy5UZXh0XG5cdFx0dGV4dDpzZXR1cC50aXRsZVxuXHRcdGNvbG9yOlwiYmxhY2tcIlxuXHRcdGZvbnRXZWlnaHQ6XCJzZW1pYm9sZFwiXG5cdFx0Zm9udFNpemU6MTVcblx0XHRzdXBlckxheWVyOmJhbm5lclxuXHRcdG5hbWU6XCIudGl0bGVcIlxuXHRcdGNvbnN0cmFpbnRzOlxuXHRcdFx0dG9wOjQ1XG5cdFx0XHRsZWFkaW5nOjE1XG5cblx0YmFubmVyLm1lc3NhZ2UgPSBuZXcgaW9zLlRleHRcblx0XHR0ZXh0OnNldHVwLm1lc3NhZ2Vcblx0XHRjb2xvcjpcImJsYWNrXCJcblx0XHRmb250U2l6ZToxNVxuXHRcdGZvbnRXZWlnaHQ6XCJsaWdodFwiXG5cdFx0c3VwZXJMYXllcjpiYW5uZXJcblx0XHRuYW1lOlwiLm1lc3NhZ2VcIlxuXHRcdGNvbnN0cmFpbnRzOlxuXHRcdFx0bGVhZGluZ0VkZ2VzOmJhbm5lci50aXRsZVxuXHRcdFx0dG9wOltiYW5uZXIudGl0bGUsIDZdXG5cblx0YmFubmVyLnRpbWUgPSBuZXcgaW9zLlRleHRcblx0XHR0ZXh0OnNldHVwLnRpbWVcblx0XHRjb2xvcjpcInJnYmEoMCwwLDAsLjUpXCJcblx0XHRmb250U2l6ZToxM1xuXHRcdHN1cGVyTGF5ZXI6YmFubmVyLmhlYWRlclxuXHRcdG5hbWU6XCIudGltZVwiXG5cdFx0Y29uc3RyYWludHM6XG5cdFx0XHR0cmFpbGluZzoxNlxuXHRcdFx0YWxpZ246XCJ2ZXJ0aWNhbFwiXG5cblx0aWYgaW9zLmRldmljZS5uYW1lID09IFwiaXBhZFwiIHx8IGlvcy5kZXZpY2UubmFtZSA9PSBcImlwYWQtcHJvXCJcblx0XHRiYW5uZXIudGltZS5jb25zdHJhaW50cyA9XG5cdFx0XHRib3R0b21FZGdlczogYmFubmVyLnRpdGxlXG5cdFx0XHR0cmFpbGluZzogc3BlY3MubGVhZGluZ0ljb25cblxuXG5cdGlvcy51dGlscy5iZ0JsdXIoYmFubmVyKVxuXG5cdCMjIEJhbm5lciBEcmFnIHNldHRpbmdzXG5cdGJhbm5lci5kcmFnZ2FibGUgPSB0cnVlXG5cdGJhbm5lci5kcmFnZ2FibGUuaG9yaXpvbnRhbCA9IGZhbHNlXG5cdGJhbm5lci5kcmFnZ2FibGUuY29uc3RyYWludHMgPVxuXHRcdHk6aW9zLnB4KDgpXG5cdFx0eDppb3MucHgoOClcblxuXHRiYW5uZXIuZHJhZ2dhYmxlLmJvdW5jZU9wdGlvbnMgPVxuXHQgICAgZnJpY3Rpb246IDI1XG5cdCAgICB0ZW5zaW9uOiAyNTBcblxuXHRiYW5uZXIub24gRXZlbnRzLkRyYWdFbmQsIC0+XG5cdFx0aWYgYmFubmVyLm1heFkgPCBpb3MudXRpbHMucHgoNjgpXG5cdFx0XHRiYW5uZXIuYW5pbWF0ZVxuXHRcdFx0XHRwcm9wZXJ0aWVzOihtYXhZOjApXG5cdFx0XHRcdHRpbWU6LjE1XG5cdFx0XHRcdGN1cnZlOlwiZWFzZS1pbi1vdXRcIlxuXHRcdFx0VXRpbHMuZGVsYXkgLjI1LCAtPlxuXHRcdFx0XHRiYW5uZXIuZGVzdHJveSgpXG5cblx0IyBBbmltYXRlLWluXG5cdGlmIHNldHVwLmFuaW1hdGVkID09IHRydWVcblx0XHRiYW5uZXIueSA9IDAgLSBiYW5uZXIuaGVpZ2h0XG5cdFx0aW9zLmxheW91dC5hbmltYXRlXG5cdFx0XHR0YXJnZXQ6YmFubmVyXG5cdFx0XHR0aW1lOi4yNVxuXHRcdFx0Y3VydmU6J2Vhc2UtaW4tb3V0J1xuXHQjIEFuaW1hdGUtb3V0XG5cdGlmIHNldHVwLmR1cmF0aW9uXG5cdFx0VXRpbHMuZGVsYXkgc2V0dXAuZHVyYXRpb24sIC0+XG5cdFx0XHRiYW5uZXIuYW5pbWF0ZVxuXHRcdFx0XHRwcm9wZXJ0aWVzOihtYXhZOjApXG5cdFx0XHRcdHRpbWU6LjI1XG5cdFx0XHRcdGN1cnZlOlwiZWFzZS1pbi1vdXRcIlxuXHRcdFV0aWxzLmRlbGF5IHNldHVwLmR1cmF0aW9uICsgLjI1LCAtPlxuXHRcdFx0YmFubmVyLmRlc3Ryb3koKVxuXG5cdHJldHVybiBiYW5uZXJcbiIsIiMgQWxlcnRcbmlvcyA9IHJlcXVpcmUgJ2lvcy1raXQnXG5cbmV4cG9ydHMuZGVmYXVsdHMgPVxuXHR0aXRsZTogXCJUaXRsZVwiXG5cdG1lc3NhZ2U6XCJcIlxuXHRhY3Rpb25zOltcIk9LXCJdXG5cbmV4cG9ydHMuZGVmYXVsdHMucHJvcHMgPSBPYmplY3Qua2V5cyhleHBvcnRzLmRlZmF1bHRzKVxuXG5leHBvcnRzLmNyZWF0ZSA9IChvYmopIC0+XG5cdHNldHVwID0gaW9zLnV0aWxzLnNldHVwQ29tcG9uZW50KG9iaiwgZXhwb3J0cy5kZWZhdWx0cylcblxuXHRhbGVydCA9IG5ldyBpb3MuVmlld1xuXHRcdGJhY2tncm91bmRDb2xvcjpcInRyYW5zcGFyZW50XCJcblx0XHRuYW1lOlwiYWxlcnRcIlxuXHRcdGNvbnN0cmFpbnRzOlxuXHRcdFx0bGVhZGluZzowXG5cdFx0XHR0cmFpbGluZzowXG5cdFx0XHR0b3A6MFxuXHRcdFx0Ym90dG9tOjBcblxuXHRhbGVydC5vdmVybGF5ID0gbmV3IGlvcy5WaWV3XG5cdFx0YmFja2dyb3VuZENvbG9yOlwicmdiYSgwLDAsMCwuMylcIlxuXHRcdHN1cGVyTGF5ZXI6YWxlcnRcblx0XHRuYW1lOlwiLm92ZXJsYXlcIlxuXHRcdGNvbnN0cmFpbnRzOlxuXHRcdFx0bGVhZGluZzowXG5cdFx0XHR0cmFpbGluZzowXG5cdFx0XHR0b3A6MFxuXHRcdFx0Ym90dG9tOjBcblxuXHRhbGVydC5tb2RhbCA9IG5ldyBpb3MuVmlld1xuXHRcdGJhY2tncm91bmRDb2xvcjpcIndoaXRlXCJcblx0XHRzdXBlckxheWVyOmFsZXJ0XG5cdFx0Ym9yZGVyUmFkaXVzOmlvcy51dGlscy5weCgxMClcblx0XHRuYW1lOlwiLm1vZGFsXCJcblx0XHRjb25zdHJhaW50czpcblx0XHRcdGFsaWduOlwiY2VudGVyXCJcblx0XHRcdHdpZHRoOjI4MFxuXHRcdFx0aGVpZ2h0OjQwMFxuXG5cdGFsZXJ0LnRpdGxlID0gbmV3IGlvcy5UZXh0XG5cdFx0c3VwZXJMYXllcjphbGVydC5tb2RhbFxuXHRcdHRleHQ6c2V0dXAudGl0bGVcblx0XHRmb250V2VpZ2h0Olwic2VtaWJvbGRcIlxuXHRcdG5hbWU6XCIudGl0bGVcIlxuXHRcdHRleHRBbGlnbjpcImNlbnRlclwiXG5cdFx0bGluZUhlaWdodDoyMFxuXHRcdGNvbnN0cmFpbnRzOlxuXHRcdFx0dG9wOjIwXG5cdFx0XHR3aWR0aDoyMjBcblx0XHRcdGFsaWduOlwiaG9yaXpvbnRhbFwiXG5cblx0YWxlcnQubWVzc2FnZSA9IG5ldyBpb3MuVGV4dFxuXHRcdHN1cGVyTGF5ZXI6YWxlcnQubW9kYWxcblx0XHR0ZXh0OnNldHVwLm1lc3NhZ2Vcblx0XHRmb250U2l6ZToxM1xuXHRcdG5hbWU6XCIubWVzc2FnZVwiXG5cdFx0dGV4dEFsaWduOlwiY2VudGVyXCJcblx0XHRsaW5lSGVpZ2h0OjE2XG5cdFx0Y29uc3RyYWludHM6XG5cdFx0XHR0b3A6IFthbGVydC50aXRsZSwgMTBdXG5cdFx0XHRhbGlnbjpcImhvcml6b250YWxcIlxuXHRcdFx0d2lkdGg6IDIyMFxuXG5cdGlmIHNldHVwLm1lc3NhZ2UubGVuZ3RoID09IDBcblx0XHRhbGVydC5tZXNzYWdlLmhlaWdodCA9IC0yNFxuXG5cblx0YWxlcnQuaG9yaURpdmlkZXIgPSBuZXcgaW9zLlZpZXdcblx0XHRzdXBlckxheWVyOmFsZXJ0Lm1vZGFsXG5cdFx0YmFja2dyb3VuZENvbG9yOlwiI0UyRThFQlwiXG5cdFx0bmFtZTpcIi5ob3JpRGl2aWRlclwiXG5cdFx0Y29uc3RyYWludHM6XG5cdFx0XHRsZWFkaW5nOjBcblx0XHRcdHRyYWlsaW5nOjBcblx0XHRcdGhlaWdodDoxXG5cdFx0XHRib3R0b206NDRcblxuXHRjbGVhbk5hbWUgPSAobikgLT5cblx0XHRpZiBuWzBdID09IFwiLVwiXG5cdFx0XHRyZXR1cm4gbi5zbGljZSg5KVxuXHRcdGVsc2Vcblx0XHRcdHJldHVybiBuXG5cdCNUaXRsZSArIE1lc3NhZ2UgKyAxIHNldCBvZiBhY3Rpb25zXG5cdGFsZXJ0Lm1vZGFsLmNvbnN0cmFpbnRzW1wiaGVpZ2h0XCJdID0gMjAgKyBpb3MudXRpbHMucHQoYWxlcnQudGl0bGUuaGVpZ2h0KSArIDEwICsgaW9zLnV0aWxzLnB0KGFsZXJ0Lm1lc3NhZ2UuaGVpZ2h0KSArIDI0ICsgNDRcblxuXHRhY3Rpb25zID0gW11cblx0c3dpdGNoIHNldHVwLmFjdGlvbnMubGVuZ3RoXG5cdFx0d2hlbiAxXG5cblx0XHRcdGFjdExhYmVsID0gaW9zLnV0aWxzLmNhcGl0YWxpemUoc2V0dXAuYWN0aW9uc1swXSlcblxuXHRcdFx0YWN0aW9uID0gbmV3IGlvcy5WaWV3XG5cdFx0XHRcdHN1cGVyTGF5ZXI6YWxlcnQubW9kYWxcblx0XHRcdFx0YmFja2dyb3VuZENvbG9yOlwid2hpdGVcIlxuXHRcdFx0XHRuYW1lOmNsZWFuTmFtZShzZXR1cC5hY3Rpb25zWzBdKVxuXHRcdFx0XHRib3JkZXJSYWRpdXM6aW9zLnV0aWxzLnB4KDEwKVxuXHRcdFx0XHRjb25zdHJhaW50czpcblx0XHRcdFx0XHRsZWFkaW5nOjBcblx0XHRcdFx0XHR0cmFpbGluZzowXG5cdFx0XHRcdFx0Ym90dG9tOjBcblx0XHRcdFx0XHRoZWlnaHQ6NDRcblxuXHRcdFx0YWN0aW9uLmxhYmVsID0gbmV3IGlvcy5UZXh0XG5cdFx0XHRcdGNvbG9yOmlvcy51dGlscy5jb2xvcihcImJsdWVcIilcblx0XHRcdFx0c3VwZXJMYXllcjphY3Rpb25cblx0XHRcdFx0dGV4dDphY3RMYWJlbFxuXHRcdFx0XHRuYW1lOlwibGFiZWxcIlxuXHRcdFx0XHRjb25zdHJhaW50czpcblx0XHRcdFx0XHRhbGlnbjpcImhvcml6b250YWxcIlxuXHRcdFx0XHRcdGJvdHRvbToxNlxuXG5cdFx0XHRhY3Rpb25zLnB1c2ggYWN0aW9uXG5cblx0XHR3aGVuIDJcblxuXHRcdFx0YWN0TGFiZWwgPSBpb3MudXRpbHMuY2FwaXRhbGl6ZShzZXR1cC5hY3Rpb25zWzBdKVxuXG5cdFx0XHRhY3Rpb24gPSBuZXcgaW9zLlZpZXdcblx0XHRcdFx0c3VwZXJMYXllcjphbGVydC5tb2RhbFxuXHRcdFx0XHRuYW1lOmNsZWFuTmFtZShzZXR1cC5hY3Rpb25zWzBdKVxuXHRcdFx0XHRib3JkZXJSYWRpdXM6aW9zLnV0aWxzLnB4KDEwKVxuXHRcdFx0XHRiYWNrZ3JvdW5kQ29sb3I6XCJ3aGl0ZVwiXG5cdFx0XHRcdGNvbnN0cmFpbnRzOlxuXHRcdFx0XHRcdGxlYWRpbmc6MFxuXHRcdFx0XHRcdHRyYWlsaW5nOmlvcy51dGlscy5wdChhbGVydC5tb2RhbC53aWR0aC8yKVxuXHRcdFx0XHRcdGJvdHRvbTowXG5cdFx0XHRcdFx0aGVpZ2h0OjQ0XG5cblx0XHRcdGFjdGlvbi5sYWJlbCA9IG5ldyBpb3MuVGV4dFxuXHRcdFx0XHRjb2xvcjppb3MudXRpbHMuY29sb3IoXCJibHVlXCIpXG5cdFx0XHRcdHN1cGVyTGF5ZXI6YWN0aW9uXG5cdFx0XHRcdHRleHQ6YWN0TGFiZWxcblx0XHRcdFx0bmFtZTpcImxhYmVsXCJcblx0XHRcdFx0Y29uc3RyYWludHM6XG5cdFx0XHRcdFx0YWxpZ246XCJob3Jpem9udGFsXCJcblx0XHRcdFx0XHRib3R0b206MTZcblxuXHRcdFx0YWN0aW9ucy5wdXNoIGFjdGlvblxuXG5cdFx0XHRhbGVydC52ZXJ0RGl2aWRlciA9IG5ldyBpb3MuVmlld1xuXHRcdFx0XHRzdXBlckxheWVyOmFsZXJ0Lm1vZGFsXG5cdFx0XHRcdGJhY2tncm91bmRDb2xvcjpcIiNFMkU4RUJcIlxuXHRcdFx0XHRuYW1lOlwiLnZlcnREaXZpZGVyXCJcblx0XHRcdFx0Y29uc3RyYWludHM6XG5cdFx0XHRcdFx0d2lkdGg6MVxuXHRcdFx0XHRcdGJvdHRvbTowXG5cdFx0XHRcdFx0aGVpZ2h0OjQ0XG5cdFx0XHRcdFx0YWxpZ246XCJob3Jpem9udGFsXCJcblxuXHRcdFx0YWN0TGFiZWwyID0gaW9zLnV0aWxzLmNhcGl0YWxpemUoc2V0dXAuYWN0aW9uc1sxXSlcblxuXHRcdFx0YWN0aW9uMiA9IG5ldyBpb3MuVmlld1xuXHRcdFx0XHRzdXBlckxheWVyOmFsZXJ0Lm1vZGFsXG5cdFx0XHRcdG5hbWU6Y2xlYW5OYW1lKHNldHVwLmFjdGlvbnNbMV0pXG5cdFx0XHRcdGJvcmRlclJhZGl1czppb3MudXRpbHMucHgoMTApXG5cdFx0XHRcdGJhY2tncm91bmRDb2xvcjpcIndoaXRlXCJcblx0XHRcdFx0Y29uc3RyYWludHM6XG5cdFx0XHRcdFx0bGVhZGluZzppb3MudXRpbHMucHQoYWxlcnQubW9kYWwud2lkdGgvMilcblx0XHRcdFx0XHR0cmFpbGluZzowXG5cdFx0XHRcdFx0Ym90dG9tOjBcblx0XHRcdFx0XHRoZWlnaHQ6NDRcblxuXHRcdFx0YWN0aW9uMi5sYWJlbCA9IG5ldyBpb3MuVGV4dFxuXHRcdFx0XHRjb2xvcjppb3MudXRpbHMuY29sb3IoXCJibHVlXCIpXG5cdFx0XHRcdHN1cGVyTGF5ZXI6YWN0aW9uMlxuXHRcdFx0XHR0ZXh0OmFjdExhYmVsMlxuXHRcdFx0XHRuYW1lOlwibGFiZWxcIlxuXHRcdFx0XHRjb25zdHJhaW50czpcblx0XHRcdFx0XHRhbGlnbjpcImhvcml6b250YWxcIlxuXHRcdFx0XHRcdGJvdHRvbToxNlxuXG5cdFx0XHRhY3Rpb25zLnB1c2ggYWN0aW9uMlxuXG5cdFx0ZWxzZVxuXHRcdFx0Zm9yIGFjdCwgaW5kZXggaW4gc2V0dXAuYWN0aW9uc1xuXG5cdFx0XHRcdGFjdExhYmVsID0gaW9zLnV0aWxzLmNhcGl0YWxpemUoYWN0KVxuXG5cdFx0XHRcdGFjdGlvbiA9IG5ldyBpb3MuVmlld1xuXHRcdFx0XHRcdHN1cGVyTGF5ZXI6YWxlcnQubW9kYWxcblx0XHRcdFx0XHRuYW1lOmNsZWFuTmFtZShhY3QpXG5cdFx0XHRcdFx0Ym9yZGVyUmFkaXVzOmlvcy51dGlscy5weCgxMClcblx0XHRcdFx0XHRiYWNrZ3JvdW5kQ29sb3I6XCJ3aGl0ZVwiXG5cdFx0XHRcdFx0Y29uc3RyYWludHM6XG5cdFx0XHRcdFx0XHRsZWFkaW5nOjBcblx0XHRcdFx0XHRcdHRyYWlsaW5nOjBcblx0XHRcdFx0XHRcdGJvdHRvbTowICsgKChzZXR1cC5hY3Rpb25zLmxlbmd0aCAtIGluZGV4IC0gMSkgKiA0NClcblx0XHRcdFx0XHRcdGhlaWdodDo0NFxuXG5cdFx0XHRcdGFjdGlvbkRpdmlkZXIgPSBuZXcgaW9zLlZpZXdcblx0XHRcdFx0XHRzdXBlckxheWVyOmFsZXJ0Lm1vZGFsXG5cdFx0XHRcdFx0YmFja2dyb3VuZENvbG9yOlwiI0UyRThFQlwiXG5cdFx0XHRcdFx0bmFtZTpcImFjdGlvbiBkaXZpZGVyXCJcblx0XHRcdFx0XHRjb25zdHJhaW50czpcblx0XHRcdFx0XHRcdGxlYWRpbmc6MFxuXHRcdFx0XHRcdFx0dHJhaWxpbmc6MFxuXHRcdFx0XHRcdFx0aGVpZ2h0OjFcblx0XHRcdFx0XHRcdGJvdHRvbTowICsgKChzZXR1cC5hY3Rpb25zLmxlbmd0aCAtIGluZGV4KSAqIDQ0KVxuXG5cdFx0XHRcdGFjdGlvbi5sYWJlbCA9IG5ldyBpb3MuVGV4dFxuXHRcdFx0XHRcdHN0eWxlOlwiYWxlcnRBY3Rpb25cIlxuXHRcdFx0XHRcdGNvbG9yOmlvcy51dGlscy5jb2xvcihcImJsdWVcIilcblx0XHRcdFx0XHRzdXBlckxheWVyOmFjdGlvblxuXHRcdFx0XHRcdHRleHQ6YWN0TGFiZWxcblx0XHRcdFx0XHRuYW1lOlwibGFiZWxcIlxuXHRcdFx0XHRcdGNvbnN0cmFpbnRzOlxuXHRcdFx0XHRcdFx0YWxpZ246XCJob3Jpem9udGFsXCJcblx0XHRcdFx0XHRcdGJvdHRvbToxNFxuXG5cblx0XHRcdFx0YWN0aW9ucy5wdXNoIGFjdGlvblxuXHRcdFx0XHRhbGVydC5tb2RhbC5jb25zdHJhaW50c1tcImhlaWdodFwiXSA9IGFsZXJ0Lm1vZGFsLmNvbnN0cmFpbnRzW1wiaGVpZ2h0XCJdICsgNDIgLSAxMlxuXG5cdGFsZXJ0LmFjdGlvbnMgPSB7fVxuXHRmb3IgYWN0LGluZGV4IGluIGFjdGlvbnNcblxuXHRcdCNIYW5kbGUgc3BlY2lhbCBjaGFyYWN0ZXJzXG5cdFx0YWN0LnR5cGUgPSBcImJ1dHRvblwiXG5cdFx0aW9zLnV0aWxzLnNwZWNpYWxDaGFyKGFjdClcblxuXHRcdGlmIHNldHVwLmFjdGlvbnNbaW5kZXhdLmluZGV4T2YoXCItclwiKSA9PSAwXG5cdFx0XHRhY3Qub3JpZ0NvbG9yID0gaW9zLnV0aWxzLmNvbG9yKFwicmVkXCIpXG5cdFx0ZWxzZVxuXHRcdFx0YWN0Lm9yaWdDb2xvciA9IGlvcy51dGlscy5jb2xvcihcImJsdWVcIilcblx0XHRpb3MubGF5b3V0LnNldChhY3QubGFiZWwpXG5cdFx0I0FkZCBUb3VjaCBFdmVudHNcblx0XHRhY3Qub24gRXZlbnRzLlRvdWNoU3RhcnQsIC0+XG5cdFx0XHRALmJhY2tncm91bmRDb2xvciA9IFwid2hpdGVcIlxuXHRcdFx0QC5hbmltYXRlXG5cdFx0XHRcdHByb3BlcnRpZXM6KGJhY2tncm91bmRDb2xvcjphY3QuYmFja2dyb3VuZENvbG9yLmRhcmtlbig1KSlcblx0XHRcdFx0dGltZTouMjVcblx0XHRcdEAubGFiZWwuYW5pbWF0ZVxuXHRcdFx0XHRwcm9wZXJ0aWVzOihjb2xvcjpALm9yaWdDb2xvci5saWdodGVuKDEwKSlcblx0XHRcdFx0dGltZTouMjVcblxuXHRcdGFjdC5vbiBFdmVudHMuVG91Y2hFbmQsIC0+XG5cdFx0XHRALmFuaW1hdGVcblx0XHRcdFx0cHJvcGVydGllczooYmFja2dyb3VuZENvbG9yOlwid2hpdGVcIilcblx0XHRcdFx0dGltZTouMjVcblx0XHRcdEAubGFiZWwuYW5pbWF0ZVxuXHRcdFx0XHRwcm9wZXJ0aWVzOihjb2xvcjpALm9yaWdDb2xvcilcblx0XHRcdFx0dGltZTouMjVcblx0XHRcdGFsZXJ0LmRlc3Ryb3koKVxuXG5cdFx0IyBFeHBvcnQgYWN0aW9uc1xuXHRcdGFsZXJ0LmFjdGlvbnNbYWN0Lm5hbWVdID0gYWN0XG5cblx0aW9zLmxheW91dC5zZXQoYWN0aW9uc1thY3Rpb25zLmxlbmd0aCAtIDFdKVxuXHRyZXR1cm4gYWxlcnRcbiIsIlxuXG4jIERvY3VtZW50YXRpb24gb2YgdGhpcyBNb2R1bGU6IGh0dHBzOi8vZ2l0aHViLmNvbS9tYXJja3Jlbm4vZnJhbWVyLUZpcmViYXNlXG4jIC0tLS0tLSA6IC0tLS0tLS0gRmlyZWJhc2UgUkVTVCBBUEk6IGh0dHBzOi8vZmlyZWJhc2UuZ29vZ2xlLmNvbS9kb2NzL3JlZmVyZW5jZS9yZXN0L2RhdGFiYXNlL1xuXG4jIEZpcmViYXNlIFJFU1QgQVBJIENsYXNzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY2xhc3MgZXhwb3J0cy5GaXJlYmFzZSBleHRlbmRzIEZyYW1lci5CYXNlQ2xhc3NcblxuXG5cdEAuZGVmaW5lIFwic3RhdHVzXCIsXG5cdFx0Z2V0OiAtPiBAX3N0YXR1cyAjIHJlYWRPbmx5XG5cblx0Y29uc3RydWN0b3I6IChAb3B0aW9ucz17fSkgLT5cblx0XHRAcHJvamVjdElEID0gQG9wdGlvbnMucHJvamVjdElEID89IG51bGxcblx0XHRAc2VjcmV0ICAgID0gQG9wdGlvbnMuc2VjcmV0ICAgID89IG51bGxcblx0XHRAZGVidWcgICAgID0gQG9wdGlvbnMuZGVidWcgICAgID89IGZhbHNlXG5cdFx0QF9zdGF0dXMgICAgICAgICAgICAgICAgICAgICAgICA/PSBcImRpc2Nvbm5lY3RlZFwiXG5cblx0XHRAc2VjcmV0RW5kUG9pbnQgPSBpZiBAc2VjcmV0IHRoZW4gXCI/YXV0aD0je0BzZWNyZXR9XCIgZWxzZSBcIlwiXG5cdFx0c3VwZXJcblxuXHRcdGNvbnNvbGUubG9nIFwiRmlyZWJhc2U6IENvbm5lY3RpbmcgdG8gRmlyZWJhc2UgUHJvamVjdCAnI3tAcHJvamVjdElEfScgLi4uIFxcbiBVUkw6ICdodHRwczovLyN7QHByb2plY3RJRH0uZmlyZWJhc2Vpby5jb20nXCIgaWYgQGRlYnVnXG5cdFx0QC5vbkNoYW5nZSBcImNvbm5lY3Rpb25cIlxuXG5cblx0cmVxdWVzdCA9IChwcm9qZWN0LCBzZWNyZXQsIHBhdGgsIGNhbGxiYWNrLCBtZXRob2QsIGRhdGEsIHBhcmFtZXRlcnMsIGRlYnVnKSAtPlxuXG5cdFx0dXJsID0gXCJodHRwczovLyN7cHJvamVjdH0uZmlyZWJhc2Vpby5jb20je3BhdGh9Lmpzb24je3NlY3JldH1cIlxuXG5cblx0XHR1bmxlc3MgcGFyYW1ldGVycyBpcyB1bmRlZmluZWRcblx0XHRcdGlmIHBhcmFtZXRlcnMuc2hhbGxvdyAgICAgICAgICAgIHRoZW4gdXJsICs9IFwiJnNoYWxsb3c9dHJ1ZVwiXG5cdFx0XHRpZiBwYXJhbWV0ZXJzLmZvcm1hdCBpcyBcImV4cG9ydFwiIHRoZW4gdXJsICs9IFwiJmZvcm1hdD1leHBvcnRcIlxuXG5cdFx0XHRzd2l0Y2ggcGFyYW1ldGVycy5wcmludFxuXHRcdFx0XHR3aGVuIFwicHJldHR5XCIgdGhlbiB1cmwgKz0gXCImcHJpbnQ9cHJldHR5XCJcblx0XHRcdFx0d2hlbiBcInNpbGVudFwiIHRoZW4gdXJsICs9IFwiJnByaW50PXNpbGVudFwiXG5cblx0XHRcdGlmIHR5cGVvZiBwYXJhbWV0ZXJzLmRvd25sb2FkIGlzIFwic3RyaW5nXCJcblx0XHRcdFx0dXJsICs9IFwiJmRvd25sb2FkPSN7cGFyYW1ldGVycy5kb3dubG9hZH1cIlxuXHRcdFx0XHR3aW5kb3cub3Blbih1cmwsXCJfc2VsZlwiKVxuXG5cblx0XHRcdHVybCArPSBcIiZvcmRlckJ5PVwiICsgJ1wiJyArIHBhcmFtZXRlcnMub3JkZXJCeSArICdcIicgaWYgdHlwZW9mIHBhcmFtZXRlcnMub3JkZXJCeSAgICAgIGlzIFwic3RyaW5nXCJcblx0XHRcdHVybCArPSBcIiZsaW1pdFRvRmlyc3Q9I3twYXJhbWV0ZXJzLmxpbWl0VG9GaXJzdH1cIiAgIGlmIHR5cGVvZiBwYXJhbWV0ZXJzLmxpbWl0VG9GaXJzdCBpcyBcIm51bWJlclwiXG5cdFx0XHR1cmwgKz0gXCImbGltaXRUb0xhc3Q9I3twYXJhbWV0ZXJzLmxpbWl0VG9MYXN0fVwiICAgICBpZiB0eXBlb2YgcGFyYW1ldGVycy5saW1pdFRvTGFzdCAgaXMgXCJudW1iZXJcIlxuXHRcdFx0dXJsICs9IFwiJnN0YXJ0QXQ9I3twYXJhbWV0ZXJzLnN0YXJ0QXR9XCIgICAgICAgICAgICAgaWYgdHlwZW9mIHBhcmFtZXRlcnMuc3RhcnRBdCAgICAgIGlzIFwibnVtYmVyXCJcblx0XHRcdHVybCArPSBcIiZlbmRBdD0je3BhcmFtZXRlcnMuZW5kQXR9XCIgICAgICAgICAgICAgICAgIGlmIHR5cGVvZiBwYXJhbWV0ZXJzLmVuZEF0ICAgICAgICBpcyBcIm51bWJlclwiXG5cdFx0XHR1cmwgKz0gXCImZXF1YWxUbz0je3BhcmFtZXRlcnMuZXF1YWxUb31cIiAgICAgICAgICAgICBpZiB0eXBlb2YgcGFyYW1ldGVycy5lcXVhbFRvICAgICAgaXMgXCJudW1iZXJcIlxuXG5cblx0XHR4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdFxuXHRcdGNvbnNvbGUubG9nIFwiRmlyZWJhc2U6IE5ldyAnI3ttZXRob2R9Jy1yZXF1ZXN0IHdpdGggZGF0YTogJyN7SlNPTi5zdHJpbmdpZnkoZGF0YSl9JyBcXG4gVVJMOiAnI3t1cmx9J1wiIGlmIGRlYnVnXG5cdFx0eGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gPT5cblxuXHRcdFx0dW5sZXNzIHBhcmFtZXRlcnMgaXMgdW5kZWZpbmVkXG5cdFx0XHRcdGlmIHBhcmFtZXRlcnMucHJpbnQgaXMgXCJzaWxlbnRcIiBvciB0eXBlb2YgcGFyYW1ldGVycy5kb3dubG9hZCBpcyBcInN0cmluZ1wiIHRoZW4gcmV0dXJuICMgdWdoXG5cblx0XHRcdHN3aXRjaCB4aHR0cC5yZWFkeVN0YXRlXG5cdFx0XHRcdHdoZW4gMCB0aGVuIGNvbnNvbGUubG9nIFwiRmlyZWJhc2U6IFJlcXVlc3Qgbm90IGluaXRpYWxpemVkIFxcbiBVUkw6ICcje3VybH0nXCIgICAgICAgaWYgZGVidWdcblx0XHRcdFx0d2hlbiAxIHRoZW4gY29uc29sZS5sb2cgXCJGaXJlYmFzZTogU2VydmVyIGNvbm5lY3Rpb24gZXN0YWJsaXNoZWQgXFxuIFVSTDogJyN7dXJsfSdcIiBpZiBkZWJ1Z1xuXHRcdFx0XHR3aGVuIDIgdGhlbiBjb25zb2xlLmxvZyBcIkZpcmViYXNlOiBSZXF1ZXN0IHJlY2VpdmVkIFxcbiBVUkw6ICcje3VybH0nXCIgICAgICAgICAgICAgIGlmIGRlYnVnXG5cdFx0XHRcdHdoZW4gMyB0aGVuIGNvbnNvbGUubG9nIFwiRmlyZWJhc2U6IFByb2Nlc3NpbmcgcmVxdWVzdCBcXG4gVVJMOiAnI3t1cmx9J1wiICAgICAgICAgICAgaWYgZGVidWdcblx0XHRcdFx0d2hlbiA0XG5cdFx0XHRcdFx0Y2FsbGJhY2soSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpKSBpZiBjYWxsYmFjaz9cblx0XHRcdFx0XHRjb25zb2xlLmxvZyBcIkZpcmViYXNlOiBSZXF1ZXN0IGZpbmlzaGVkLCByZXNwb25zZTogJyN7SlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpfScgXFxuIFVSTDogJyN7dXJsfSdcIiBpZiBkZWJ1Z1xuXG5cdFx0XHRpZiB4aHR0cC5zdGF0dXMgaXMgXCI0MDRcIlxuXHRcdFx0XHRjb25zb2xlLndhcm4gXCJGaXJlYmFzZTogSW52YWxpZCByZXF1ZXN0LCBwYWdlIG5vdCBmb3VuZCBcXG4gVVJMOiAnI3t1cmx9J1wiIGlmIGRlYnVnXG5cblxuXHRcdHhodHRwLm9wZW4obWV0aG9kLCB1cmwsIHRydWUpXG5cdFx0eGh0dHAuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtdHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLThcIilcblx0XHR4aHR0cC5zZW5kKGRhdGEgPSBcIiN7SlNPTi5zdHJpbmdpZnkoZGF0YSl9XCIpXG5cblxuXG5cdCMgQXZhaWxhYmxlIG1ldGhvZHNcblxuXHRnZXQ6ICAgIChwYXRoLCBjYWxsYmFjaywgICAgICAgcGFyYW1ldGVycykgLT4gcmVxdWVzdChAcHJvamVjdElELCBAc2VjcmV0RW5kUG9pbnQsIHBhdGgsIGNhbGxiYWNrLCBcIkdFVFwiLCAgICBudWxsLCBwYXJhbWV0ZXJzLCBAZGVidWcpXG5cdHB1dDogICAgKHBhdGgsIGRhdGEsIGNhbGxiYWNrLCBwYXJhbWV0ZXJzKSAtPiByZXF1ZXN0KEBwcm9qZWN0SUQsIEBzZWNyZXRFbmRQb2ludCwgcGF0aCwgY2FsbGJhY2ssIFwiUFVUXCIsICAgIGRhdGEsIHBhcmFtZXRlcnMsIEBkZWJ1Zylcblx0cG9zdDogICAocGF0aCwgZGF0YSwgY2FsbGJhY2ssIHBhcmFtZXRlcnMpIC0+IHJlcXVlc3QoQHByb2plY3RJRCwgQHNlY3JldEVuZFBvaW50LCBwYXRoLCBjYWxsYmFjaywgXCJQT1NUXCIsICAgZGF0YSwgcGFyYW1ldGVycywgQGRlYnVnKVxuXHRwYXRjaDogIChwYXRoLCBkYXRhLCBjYWxsYmFjaywgcGFyYW1ldGVycykgLT4gcmVxdWVzdChAcHJvamVjdElELCBAc2VjcmV0RW5kUG9pbnQsIHBhdGgsIGNhbGxiYWNrLCBcIlBBVENIXCIsICBkYXRhLCBwYXJhbWV0ZXJzLCBAZGVidWcpXG5cdGRlbGV0ZTogKHBhdGgsIGNhbGxiYWNrLCAgICAgICBwYXJhbWV0ZXJzKSAtPiByZXF1ZXN0KEBwcm9qZWN0SUQsIEBzZWNyZXRFbmRQb2ludCwgcGF0aCwgY2FsbGJhY2ssIFwiREVMRVRFXCIsIG51bGwsIHBhcmFtZXRlcnMsIEBkZWJ1ZylcblxuXG5cblx0b25DaGFuZ2U6IChwYXRoLCBjYWxsYmFjaykgLT5cblxuXG5cdFx0aWYgcGF0aCBpcyBcImNvbm5lY3Rpb25cIlxuXG5cdFx0XHR1cmwgPSBcImh0dHBzOi8vI3tAcHJvamVjdElEfS5maXJlYmFzZWlvLmNvbS8uanNvbiN7QHNlY3JldEVuZFBvaW50fVwiXG5cdFx0XHRjdXJyZW50U3RhdHVzID0gXCJkaXNjb25uZWN0ZWRcIlxuXHRcdFx0c291cmNlID0gbmV3IEV2ZW50U291cmNlKHVybClcblxuXHRcdFx0c291cmNlLmFkZEV2ZW50TGlzdGVuZXIgXCJvcGVuXCIsID0+XG5cdFx0XHRcdGlmIGN1cnJlbnRTdGF0dXMgaXMgXCJkaXNjb25uZWN0ZWRcIlxuXHRcdFx0XHRcdEAuX3N0YXR1cyA9IFwiY29ubmVjdGVkXCJcblx0XHRcdFx0XHRjYWxsYmFjayhcImNvbm5lY3RlZFwiKSBpZiBjYWxsYmFjaz9cblx0XHRcdFx0XHRjb25zb2xlLmxvZyBcIkZpcmViYXNlOiBDb25uZWN0aW9uIHRvIEZpcmViYXNlIFByb2plY3QgJyN7QHByb2plY3RJRH0nIGVzdGFibGlzaGVkXCIgaWYgQGRlYnVnXG5cdFx0XHRcdGN1cnJlbnRTdGF0dXMgPSBcImNvbm5lY3RlZFwiXG5cblx0XHRcdHNvdXJjZS5hZGRFdmVudExpc3RlbmVyIFwiZXJyb3JcIiwgPT5cblx0XHRcdFx0aWYgY3VycmVudFN0YXR1cyBpcyBcImNvbm5lY3RlZFwiXG5cdFx0XHRcdFx0QC5fc3RhdHVzID0gXCJkaXNjb25uZWN0ZWRcIlxuXHRcdFx0XHRcdGNhbGxiYWNrKFwiZGlzY29ubmVjdGVkXCIpIGlmIGNhbGxiYWNrP1xuXHRcdFx0XHRcdGNvbnNvbGUud2FybiBcIkZpcmViYXNlOiBDb25uZWN0aW9uIHRvIEZpcmViYXNlIFByb2plY3QgJyN7QHByb2plY3RJRH0nIGNsb3NlZFwiIGlmIEBkZWJ1Z1xuXHRcdFx0XHRjdXJyZW50U3RhdHVzID0gXCJkaXNjb25uZWN0ZWRcIlxuXG5cblx0XHRlbHNlXG5cblx0XHRcdHVybCA9IFwiaHR0cHM6Ly8je0Bwcm9qZWN0SUR9LmZpcmViYXNlaW8uY29tI3twYXRofS5qc29uI3tAc2VjcmV0RW5kUG9pbnR9XCJcblx0XHRcdHNvdXJjZSA9IG5ldyBFdmVudFNvdXJjZSh1cmwpXG5cdFx0XHRjb25zb2xlLmxvZyBcIkZpcmViYXNlOiBMaXN0ZW5pbmcgdG8gY2hhbmdlcyBtYWRlIHRvICcje3BhdGh9JyBcXG4gVVJMOiAnI3t1cmx9J1wiIGlmIEBkZWJ1Z1xuXG5cdFx0XHRzb3VyY2UuYWRkRXZlbnRMaXN0ZW5lciBcInB1dFwiLCAoZXYpID0+XG5cdFx0XHRcdGNhbGxiYWNrKEpTT04ucGFyc2UoZXYuZGF0YSkuZGF0YSwgXCJwdXRcIiwgSlNPTi5wYXJzZShldi5kYXRhKS5wYXRoLCBfLnRhaWwoSlNPTi5wYXJzZShldi5kYXRhKS5wYXRoLnNwbGl0KFwiL1wiKSwxKSkgaWYgY2FsbGJhY2s/XG5cdFx0XHRcdGNvbnNvbGUubG9nIFwiRmlyZWJhc2U6IFJlY2VpdmVkIGNoYW5nZXMgbWFkZSB0byAnI3twYXRofScgdmlhICdQVVQnOiAje0pTT04ucGFyc2UoZXYuZGF0YSkuZGF0YX0gXFxuIFVSTDogJyN7dXJsfSdcIiBpZiBAZGVidWdcblxuXHRcdFx0c291cmNlLmFkZEV2ZW50TGlzdGVuZXIgXCJwYXRjaFwiLCAoZXYpID0+XG5cdFx0XHRcdGNhbGxiYWNrKEpTT04ucGFyc2UoZXYuZGF0YSkuZGF0YSwgXCJwYXRjaFwiLCBKU09OLnBhcnNlKGV2LmRhdGEpLnBhdGgsIF8udGFpbChKU09OLnBhcnNlKGV2LmRhdGEpLnBhdGguc3BsaXQoXCIvXCIpLDEpKSBpZiBjYWxsYmFjaz9cblx0XHRcdFx0Y29uc29sZS5sb2cgXCJGaXJlYmFzZTogUmVjZWl2ZWQgY2hhbmdlcyBtYWRlIHRvICcje3BhdGh9JyB2aWEgJ1BBVENIJzogI3tKU09OLnBhcnNlKGV2LmRhdGEpLmRhdGF9IFxcbiBVUkw6ICcje3VybH0nXCIgaWYgQGRlYnVnXG4iLCIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQWtCQUE7QURPQSxJQUFBOzs7QUFBTSxPQUFPLENBQUM7QUFHYixNQUFBOzs7O0VBQUEsUUFBQyxDQUFDLE1BQUYsQ0FBUyxRQUFULEVBQ0M7SUFBQSxHQUFBLEVBQUssU0FBQTthQUFHLElBQUMsQ0FBQTtJQUFKLENBQUw7R0FERDs7RUFHYSxrQkFBQyxPQUFEO0FBQ1osUUFBQTtJQURhLElBQUMsQ0FBQSw0QkFBRCxVQUFTO0lBQ3RCLElBQUMsQ0FBQSxTQUFELGlEQUFxQixDQUFDLGdCQUFELENBQUMsWUFBYTtJQUNuQyxJQUFDLENBQUEsTUFBRCxnREFBcUIsQ0FBQyxjQUFELENBQUMsU0FBYTtJQUNuQyxJQUFDLENBQUEsS0FBRCwrQ0FBcUIsQ0FBQyxhQUFELENBQUMsUUFBYTs7TUFDbkMsSUFBQyxDQUFBLFVBQWtDOztJQUVuQyxJQUFDLENBQUEsY0FBRCxHQUFxQixJQUFDLENBQUEsTUFBSixHQUFnQixRQUFBLEdBQVMsSUFBQyxDQUFBLE1BQTFCLEdBQXdDO0lBQzFELDJDQUFBLFNBQUE7SUFFQSxJQUE2SCxJQUFDLENBQUEsS0FBOUg7TUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLDRDQUFBLEdBQTZDLElBQUMsQ0FBQSxTQUE5QyxHQUF3RCx5QkFBeEQsR0FBaUYsSUFBQyxDQUFBLFNBQWxGLEdBQTRGLGtCQUF4RyxFQUFBOztJQUNBLElBQUMsQ0FBQyxRQUFGLENBQVcsWUFBWDtFQVZZOztFQWFiLE9BQUEsR0FBVSxTQUFDLE9BQUQsRUFBVSxNQUFWLEVBQWtCLElBQWxCLEVBQXdCLFFBQXhCLEVBQWtDLE1BQWxDLEVBQTBDLElBQTFDLEVBQWdELFVBQWhELEVBQTRELEtBQTVEO0FBRVQsUUFBQTtJQUFBLEdBQUEsR0FBTSxVQUFBLEdBQVcsT0FBWCxHQUFtQixp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QWdySixJQUFockosRUFBc3JKLElBQXRySixFQUE0ckosSUFBNXJKLEVBQWtzSixJQUFsc0osRUFBd3NKLElBQXhzSixFQUE4c0osSUFBOXNKLEVBQW90SixJQUFwdEosRUFBMHRKLElBQTF0SixFQUFndUosSUFBaHVKLEVBQXN1SixJQUF0dUosRUFBNHVKLElBQTV1SixFQUFrdkosSUFBbHZKLEVBQXd2SixJQUF4dkosRUFBOHZKLElBQTl2SixFQUFvd0osSUFBcHdKLEVBQTB3SixJQUExd0osRUFBZ3hKLElBQWh4SixFQUFzeEosSUFBdHhKLEVBQTR4SixJQUE1eEosRUFBa3lKLElBQWx5SixFQUF3eUosSUFBeHlKLEVBQTh5SixJQUE5eUosRUFBb3pKLElBQXB6SixFQUEwekosSUFBMXpKLEVBQWcwSixJQUFoMEosRUFBczBKLElBQXQwSixFQUE0MEosSUFBNTBKLEVBQWsxSixJQUFsMUosRUFBdzFKLEdBQXgxSixFQUE2MUosSUFBNzFKLEVBQW0ySixJQUFuMkosRUFBeTJKLElBQXoySixFQUErMkosSUFBLzJKLEVBQXEzSixJQUFyM0osRUFBMjNKLElBQTMzSixFQUFpNEosSUFBajRKLEVBQXU0SixJQUF2NEosRUFBNjRKLElBQTc0SixFQUFtNUosSUFBbjVKLEVBQXk1SixJQUF6NUosRUFBKzVKLElBQS81SixFQUFxNkosSUFBcjZKLEVBQTI2SixHQUEzNkosRUFBZzdKLElBQWg3SixFQUFzN0osSUFBdDdKLEVBQTQ3SixJQUE1N0osRUFBazhKLElBQWw4SixFQUF3OEosSUFBeDhKLEVBQTg4SixJQUE5OEosRUFBbzlKLElBQXA5SixFQUEwOUosS0FBMTlKLEVBQWkrSixJQUFqK0osRUFBdStKLElBQXYrSixFQUE2K0osS0FBNytKLEVBQW8vSixJQUFwL0osRUFBMC9KLElBQTEvSixFQUFnZ0ssSUFBaGdLLEVBQXNnSyxJQUF0Z0ssRUFBNGdLLElBQTVnSyxFQUFraEssSUFBbGhLLEVBQXdoSyxJQUF4aEssRUFBOGhLLElBQTloSyxFQUFvaUssSUFBcGlLLEVBQTBpSyxJQUExaUssRUFBZ2pL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
