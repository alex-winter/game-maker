/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/css-loader/dist/cjs.js!./src/Client/styles.css":
/*!*********************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/Client/styles.css ***!
  \*********************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `html, body {
    height: 100%;
    width: 100%;
    padding: 0;
    margin: 0;
    overflow: hidden;
}

canvas {
    display: block;
    width: 100%;
    height: 100%;
    background-color: black;
}
`, "",{"version":3,"sources":["webpack://./src/Client/styles.css"],"names":[],"mappings":"AAAA;IACI,YAAY;IACZ,WAAW;IACX,UAAU;IACV,SAAS;IACT,gBAAgB;AACpB;;AAEA;IACI,cAAc;IACd,WAAW;IACX,YAAY;IACZ,uBAAuB;AAC3B","sourcesContent":["html, body {\n    height: 100%;\n    width: 100%;\n    padding: 0;\n    margin: 0;\n    overflow: hidden;\n}\n\ncanvas {\n    display: block;\n    width: 100%;\n    height: 100%;\n    background-color: black;\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {



/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {



module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];
  if (!cssMapping) {
    return content;
  }
  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    return [content].concat([sourceMapping]).join("\n");
  }
  return [content].join("\n");
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {



var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {



var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;
  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}
module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";
  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }
  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }
  var needLayer = typeof obj.layer !== "undefined";
  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }
  css += obj.css;
  if (needLayer) {
    css += "}";
  }
  if (obj.media) {
    css += "}";
  }
  if (obj.supports) {
    css += "}";
  }
  var sourceMap = obj.sourceMap;
  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}
function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }
  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") {
    return {
      update: function update() {},
      remove: function remove() {}
    };
  }
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}
module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
module.exports = styleTagTransform;

/***/ }),

/***/ "./src/Client/Component/Canvas/SpriteMaker/SpriteMaker.ts":
/*!****************************************************************!*\
  !*** ./src/Client/Component/Canvas/SpriteMaker/SpriteMaker.ts ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SpriteMaker = void 0;
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
class SpriteMaker extends Component_1.Component {
    build() {
        const element = Dom_1.Dom.div();
        const canvas = Dom_1.Dom.canvas();
        element.append(canvas);
        return element;
    }
}
exports.SpriteMaker = SpriteMaker;


/***/ }),

/***/ "./src/Client/Component/File/FileListing/FileListing.ts":
/*!**************************************************************!*\
  !*** ./src/Client/Component/File/FileListing/FileListing.ts ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileListing = void 0;
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
class FileListing extends Component_1.Component {
    build() {
        const container = Dom_1.Dom.div();
        Events_1.Events.listenToFilesUploadSubmitted(fileList => {
            container.append(...fileList.map(this.buildFile));
        });
        return container;
    }
    buildFile(file) {
        const container = Dom_1.Dom.div('file');
        container.innerText = file.name;
        return container;
    }
}
exports.FileListing = FileListing;


/***/ }),

/***/ "./src/Client/Component/File/FileUploader/FileUploader.ts":
/*!****************************************************************!*\
  !*** ./src/Client/Component/File/FileUploader/FileUploader.ts ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileUploader = void 0;
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
class FileUploader extends Component_1.Component {
    container = Dom_1.Dom.div('uploader');
    css() {
        return /*css*/ `
            :host {
                display: block;
                font-family: sans-serif;
            }

            .uploader {
                border: 2px dashed #ccc;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                transition: background-color 0.2s;
            }

            .uploader.dragover {
                background-color: #f0f0f0;
            }

            .upload-button {
                margin-top: 10px;
                display: inline-block;
                padding: 8px 16px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }

            input[type="file"] {
                display: none;
            }
        `;
    }
    build() {
        this.container.textContent = 'Drag & drop files here';
        this.container.addEventListener('dragover', this.handleDragOver.bind(this));
        this.container.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.container.addEventListener('drop', this.handleDragDrop.bind(this));
        const input = Dom_1.Dom.multiFileInputWithDir();
        input.addEventListener('change', () => {
            if (input.files) {
                this.handleFiles(input.files);
            }
        });
        const button = Dom_1.Dom.button('Select Files', 'upload-button');
        button.addEventListener('click', () => input.click());
        const wrapper = Dom_1.Dom.div();
        wrapper.append(this.container, button, input);
        return wrapper;
    }
    handleDragOver(event) {
        event.preventDefault();
        this.container.classList.add('dragover');
    }
    handleDragLeave(event) {
        this.container.classList.remove('dragover');
    }
    handleDragDrop(event) {
        event.preventDefault();
        this.container.classList.remove('dragover');
        if (event.dataTransfer?.files) {
            this.handleFiles(event.dataTransfer.files);
        }
    }
    handleFiles(files) {
        Events_1.Events.emitFilesUploadSubmitted(Array.from(files));
    }
}
exports.FileUploader = FileUploader;


/***/ }),

/***/ "./src/Client/Component/LayerListing/LayerListing.ts":
/*!***********************************************************!*\
  !*** ./src/Client/Component/LayerListing/LayerListing.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LayerListing = void 0;
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
class LayerListing extends Component_1.Component {
    build() {
        const container = Dom_1.Dom.div();
        this.data().then(layers => {
            container.append(...layers.map(this.buildLayer));
        });
        return container;
    }
    async data() {
        const resposne = await fetch('/layers');
        const data = await resposne.json();
        return data;
    }
    buildLayer(layer) {
        const container = Dom_1.Dom.div('layer-item');
        container.innerText = layer.name;
        return container;
    }
}
exports.LayerListing = LayerListing;


/***/ }),

/***/ "./src/Client/Component/SideMenu/SideMenu.ts":
/*!***************************************************!*\
  !*** ./src/Client/Component/SideMenu/SideMenu.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SideMenu = void 0;
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
class SideMenu extends Component_1.Component {
    css() {
        return /*css*/ `
            :host {
                background-color: whitesmoke;
                position: fixed;
                left: 0;
                right: 0;
                height: 100vh;
                width: 200px;
            }
        `;
    }
    build() {
        const container = Dom_1.Dom.div();
        const slot = Dom_1.Dom.slot();
        container.append(slot);
        return container;
    }
}
exports.SideMenu = SideMenu;


/***/ }),

/***/ "./src/Client/Component/WindowBox/SpriteMakerWindowBox.ts":
/*!****************************************************************!*\
  !*** ./src/Client/Component/WindowBox/SpriteMakerWindowBox.ts ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SpriteMakerWindowBox = void 0;
const SpriteMaker_1 = __webpack_require__(/*! Client/Component/Canvas/SpriteMaker/SpriteMaker */ "./src/Client/Component/Canvas/SpriteMaker/SpriteMaker.ts");
const WindowBox_1 = __webpack_require__(/*! Client/Component/WindowBox/WindowBox */ "./src/Client/Component/WindowBox/WindowBox.ts");
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
class SpriteMakerWindowBox extends Component_1.Component {
    build() {
        const windowBox = Dom_1.Dom.component(WindowBox_1.WindowBox);
        const spriteMaker = Dom_1.Dom.component(SpriteMaker_1.SpriteMaker);
        windowBox.dataset.title = 'Sprite Maker';
        windowBox.append(spriteMaker);
        return windowBox;
    }
}
exports.SpriteMakerWindowBox = SpriteMakerWindowBox;


/***/ }),

/***/ "./src/Client/Component/WindowBox/SpriteSheetsWindowBox.ts":
/*!*****************************************************************!*\
  !*** ./src/Client/Component/WindowBox/SpriteSheetsWindowBox.ts ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SpriteSheetsWindowBox = void 0;
const FileListing_1 = __webpack_require__(/*! Client/Component/File/FileListing/FileListing */ "./src/Client/Component/File/FileListing/FileListing.ts");
const FileUploader_1 = __webpack_require__(/*! Client/Component/File/FileUploader/FileUploader */ "./src/Client/Component/File/FileUploader/FileUploader.ts");
const SpriteMakerWindowBox_1 = __webpack_require__(/*! Client/Component/WindowBox/SpriteMakerWindowBox */ "./src/Client/Component/WindowBox/SpriteMakerWindowBox.ts");
const WindowBox_1 = __webpack_require__(/*! Client/Component/WindowBox/WindowBox */ "./src/Client/Component/WindowBox/WindowBox.ts");
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
class SpriteSheetsWindowBox extends Component_1.Component {
    build() {
        const windowBox = Dom_1.Dom.component(WindowBox_1.WindowBox);
        const fileListing = Dom_1.Dom.component(FileListing_1.FileListing);
        const fileUploader = Dom_1.Dom.component(FileUploader_1.FileUploader);
        const createNewButton = Dom_1.Dom.button('Create New');
        windowBox.dataset.title = 'Sprite Sheets';
        createNewButton.addEventListener('click', this.handleCreateNewClick.bind(this));
        windowBox.append(fileListing, fileUploader, createNewButton);
        return windowBox;
    }
    handleCreateNewClick() {
        document.body.append(Dom_1.Dom.component(SpriteMakerWindowBox_1.SpriteMakerWindowBox));
    }
}
exports.SpriteSheetsWindowBox = SpriteSheetsWindowBox;


/***/ }),

/***/ "./src/Client/Component/WindowBox/WindowBox.ts":
/*!*****************************************************!*\
  !*** ./src/Client/Component/WindowBox/WindowBox.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WindowBox = void 0;
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
class WindowBox extends Component_1.Component {
    isDragging = false;
    offsetX = 0;
    offsetY = 0;
    css() {
        return /*css*/ `
            :host {
                position: fixed;
                top: 0;
                left: 0;
                cursor: default;
            }

            .header {
                background: #ccc;
                padding: 10px;
                cursor: move;
                user-select: none;
            }

            .content {
                padding: 10px;
                background: white;
                border: 1px solid #ccc;
            }
        `;
    }
    build() {
        const container = Dom_1.Dom.div();
        const content = Dom_1.Dom.div('content');
        const slot = Dom_1.Dom.slot();
        content.append(slot);
        container.append(this.buildHeader(), content);
        return container;
    }
    buildHeader() {
        const element = Dom_1.Dom.div('header');
        element.innerText = this.dataset.title || '';
        element.addEventListener('mousedown', this.handleMouseDown.bind(this));
        return element;
    }
    handleMouseDown(e) {
        this.isDragging = true;
        const rect = this.getBoundingClientRect();
        this.offsetX = e.clientX - rect.left;
        this.offsetY = e.clientY - rect.top;
        const onMouseMove = (e) => {
            if (this.isDragging) {
                this.style.left = `${e.clientX - this.offsetX}px`;
                this.style.top = `${e.clientY - this.offsetY}px`;
            }
        };
        const onMouseUp = () => {
            this.isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
}
exports.WindowBox = WindowBox;


/***/ }),

/***/ "./src/Client/Constants/components.ts":
/*!********************************************!*\
  !*** ./src/Client/Constants/components.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.COMPONENTS = void 0;
const LayerListing_1 = __webpack_require__(/*! Client/Component/LayerListing/LayerListing */ "./src/Client/Component/LayerListing/LayerListing.ts");
const WindowBox_1 = __webpack_require__(/*! Client/Component/WindowBox/WindowBox */ "./src/Client/Component/WindowBox/WindowBox.ts");
const FileUploader_1 = __webpack_require__(/*! Client/Component/File/FileUploader/FileUploader */ "./src/Client/Component/File/FileUploader/FileUploader.ts");
const FileListing_1 = __webpack_require__(/*! Client/Component/File/FileListing/FileListing */ "./src/Client/Component/File/FileListing/FileListing.ts");
const SpriteSheetsWindowBox_1 = __webpack_require__(/*! Client/Component/WindowBox/SpriteSheetsWindowBox */ "./src/Client/Component/WindowBox/SpriteSheetsWindowBox.ts");
const SpriteMaker_1 = __webpack_require__(/*! Client/Component/Canvas/SpriteMaker/SpriteMaker */ "./src/Client/Component/Canvas/SpriteMaker/SpriteMaker.ts");
const SideMenu_1 = __webpack_require__(/*! Client/Component/SideMenu/SideMenu */ "./src/Client/Component/SideMenu/SideMenu.ts");
const SpriteMakerWindowBox_1 = __webpack_require__(/*! Client/Component/WindowBox/SpriteMakerWindowBox */ "./src/Client/Component/WindowBox/SpriteMakerWindowBox.ts");
exports.COMPONENTS = new Map([
    [SideMenu_1.SideMenu, 'side-menu'],
    [LayerListing_1.LayerListing, 'layer-listing'],
    [WindowBox_1.WindowBox, 'window-box'],
    [FileUploader_1.FileUploader, 'file-uploader'],
    [FileListing_1.FileListing, 'file-listing'],
    [SpriteSheetsWindowBox_1.SpriteSheetsWindowBox, 'sprite-sheets-window-box'],
    [SpriteMaker_1.SpriteMaker, 'sprite-maker'],
    [SpriteMakerWindowBox_1.SpriteMakerWindowBox, 'sprite-maker-window-box'],
]);


/***/ }),

/***/ "./src/Client/Constants/events.ts":
/*!****************************************!*\
  !*** ./src/Client/Constants/events.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EVENTS = void 0;
exports.EVENTS = {
    uploadFilesSubmission: 'upload-files-submission',
};


/***/ }),

/***/ "./src/Client/Service/Component.ts":
/*!*****************************************!*\
  !*** ./src/Client/Service/Component.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Component = void 0;
class Component extends HTMLElement {
    shadow;
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
    }
    css() {
        return '';
    }
    connectedCallback() {
        const css = this.css().trim();
        if (css.length) {
            const style = document.createElement('style');
            style.innerText = css;
            this.shadow.appendChild(style);
        }
        this.shadow.appendChild(this.build());
    }
}
exports.Component = Component;


/***/ }),

/***/ "./src/Client/Service/Dom.ts":
/*!***********************************!*\
  !*** ./src/Client/Service/Dom.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Dom = void 0;
const components_1 = __webpack_require__(/*! Client/Constants/components */ "./src/Client/Constants/components.ts");
class Dom {
    constructor() {
        throw new Error('Can not construct');
    }
    static div(...classList) {
        const element = document.createElement('div');
        if (classList.length) {
            element.classList.add(...classList);
        }
        return element;
    }
    static canvas() {
        return document.createElement('canvas');
    }
    static button(text, ...classList) {
        const element = document.createElement('button');
        element.innerText = text;
        if (classList.length) {
            element.classList.add(...classList);
        }
        return element;
    }
    static slot() {
        return document.createElement('slot');
    }
    static multiFileInputWithDir() {
        const element = document.createElement('input');
        element.type = 'file';
        element.webkitdirectory = true;
        element.multiple = true;
        return element;
    }
    static component(component) {
        const tag = components_1.COMPONENTS.get(component);
        if (!tag) {
            throw new Error(`Component not found in COMPONENTS map: ${component.name}`);
        }
        return document.createElement(tag);
    }
}
exports.Dom = Dom;


/***/ }),

/***/ "./src/Client/Service/Events.ts":
/*!**************************************!*\
  !*** ./src/Client/Service/Events.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Events = void 0;
const events_1 = __webpack_require__(/*! Client/Constants/events */ "./src/Client/Constants/events.ts");
class Events {
    constructor() {
        throw new Error('Can not construct');
    }
    static emit(key, detail) {
        document.dispatchEvent(new CustomEvent(key, {
            detail,
            bubbles: true,
            composed: true
        }));
    }
    static listen(key, callback) {
        document.addEventListener(key, callback);
    }
    static emitFilesUploadSubmitted(files) {
        Events.emit(events_1.EVENTS.uploadFilesSubmission, files);
    }
    static listenToFilesUploadSubmitted(callback) {
        Events.listen(events_1.EVENTS.uploadFilesSubmission, event => {
            callback(event.detail);
        });
    }
}
exports.Events = Events;


/***/ }),

/***/ "./src/Client/styles.css":
/*!*******************************!*\
  !*** ./src/Client/styles.css ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_styles_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./styles.css */ "./node_modules/css-loader/dist/cjs.js!./src/Client/styles.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());
options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_styles_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_styles_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_styles_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_styles_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*****************************!*\
  !*** ./src/Client/index.ts ***!
  \*****************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! Client/styles.css */ "./src/Client/styles.css");
const components_1 = __webpack_require__(/*! Client/Constants/components */ "./src/Client/Constants/components.ts");
components_1.COMPONENTS.forEach((tagName, constructor) => {
    customElements.define(tagName, constructor);
});
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const ctx = canvas?.getContext('2d');
});

})();

/******/ })()
;
//# sourceMappingURL=index.js.map