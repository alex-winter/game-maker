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

/***/ "./src/Client/Component/Canvas/CanvasLayer.ts":
/*!****************************************************!*\
  !*** ./src/Client/Component/Canvas/CanvasLayer.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CanvasLayer = void 0;
const events_1 = __webpack_require__(/*! Client/Constants/events */ "./src/Client/Constants/events.ts");
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
class CanvasLayer extends Component_1.Component {
    canvas = Dom_1.Dom.canvas();
    ctx = this.canvas.getContext('2d');
    currentImage;
    layer;
    build() {
        this.layer = this.parameters.layer;
        Events_1.Events.listen(this.handleWindowResize.bind(this), events_1.EVENTS.windowResize);
        Events_1.Events.listen(this.handleCurrentImageChange.bind(this), events_1.EVENTS.sheetSelectionMade);
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.handleWindowResize();
        return this.canvas;
    }
    handleMouseDown(event) {
        this.ctx.drawImage(this.currentImage, event.clientX, event.clientY);
        const mouseMove = (event) => {
        };
        const mouseUp = (event) => {
            document.removeEventListener('mouseup', mouseUp);
            document.removeEventListener('mousemove', mouseMove);
        };
        document.addEventListener('mousemove', mouseMove);
        document.addEventListener('mouseup', mouseUp);
    }
    handleCurrentImageChange(event) {
        this.currentImage = event.detail;
    }
    handleWindowResize() {
        this.canvas.width = window.outerWidth;
        this.canvas.height = window.outerHeight;
    }
}
exports.CanvasLayer = CanvasLayer;


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
    css() {
        return /*css*/ `
            :host {
                display: block;
                max-height: 400px;
                overflow-y: scroll;
            }        

            .file {
                display: flex;
                padding: 10px;
            }
            .file div {
                flex: 1;
            }
        `;
    }
    build() {
        const container = Dom_1.Dom.div();
        Events_1.Events.listenToFilesUploadSubmitted(fileList => {
            container.append(...fileList.map(this.buildFile));
        });
        return container;
    }
    buildFile(file) {
        const container = Dom_1.Dom.div('file');
        const name = Dom_1.Dom.div();
        const options = Dom_1.Dom.div();
        const openButton = Dom_1.Dom.button('Open');
        name.innerText = file.name;
        openButton.addEventListener('click', (e) => Events_1.Events.emitOpenSheet(file));
        options.append(openButton);
        container.append(name, options);
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
    isSingleton = true;
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

/***/ "./src/Client/Component/Generic/Modal/BasicModal.ts":
/*!**********************************************************!*\
  !*** ./src/Client/Component/Generic/Modal/BasicModal.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BasicModal = void 0;
const events_1 = __webpack_require__(/*! Client/Constants/events */ "./src/Client/Constants/events.ts");
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
class BasicModal extends Component_1.Component {
    css() {
        return /*css*/ `
            .backdrop {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
            }

            .modal-content {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
                font-family: sans-serif;
            }
        `;
    }
    build() {
        const backdrop = Dom_1.Dom.div('backdrop');
        const content = Dom_1.Dom.div('modal-content');
        const slot = Dom_1.Dom.slot();
        backdrop.addEventListener('click', (event) => {
            if (event.target === backdrop) {
                this.destroy();
            }
        });
        Events_1.Events.listen((event) => {
            if (this.contains(event.detail)) {
                this.destroy();
            }
        }, events_1.EVENTS.closeModal);
        content.append(slot);
        backdrop.appendChild(content);
        return backdrop;
    }
}
exports.BasicModal = BasicModal;


/***/ }),

/***/ "./src/Client/Component/Generic/handleDragAndDrop.ts":
/*!***********************************************************!*\
  !*** ./src/Client/Component/Generic/handleDragAndDrop.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.handleDragAndDrop = void 0;
function handleDragAndDrop(element, event) {
    element.isDragging = true;
    const rect = element.getBoundingClientRect();
    element.offsetX = event.clientX - rect.left;
    element.offsetY = event.clientY - rect.top;
    const onMouseMove = (e) => {
        if (element.isDragging) {
            element.style.left = `${e.clientX - element.offsetX}px`;
            element.style.top = `${e.clientY - element.offsetY}px`;
            element.style.transform = 'none';
        }
    };
    const onMouseUp = () => {
        element.isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}
exports.handleDragAndDrop = handleDragAndDrop;


/***/ }),

/***/ "./src/Client/Component/LayerListing/LayerListing.ts":
/*!***********************************************************!*\
  !*** ./src/Client/Component/LayerListing/LayerListing.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LayerListing = void 0;
const events_1 = __webpack_require__(/*! Client/Constants/events */ "./src/Client/Constants/events.ts");
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
class LayerListing extends Component_1.Component {
    css() {
        return /*css*/ `
            .layer-item {
                display: flex;
            }

            .layer-item > div {
                flex: 1;
            }
        `;
    }
    build() {
        const container = Dom_1.Dom.div();
        const listing = Dom_1.Dom.div();
        const addNewLayerButton = Dom_1.Dom.button('Add New Layer');
        addNewLayerButton.addEventListener('click', () => Events_1.Events.emit(events_1.EVENTS.openAddNewLayer));
        Events_1.Events.listen(event => {
            listing.append(...event.detail.map(this.buildLayer.bind(this)));
        }, events_1.EVENTS.newLayerMapped, events_1.EVENTS.gotLayer);
        container.append(listing, addNewLayerButton);
        return container;
    }
    buildLayer(layer) {
        const container = Dom_1.Dom.div('layer-item');
        const name = Dom_1.Dom.div();
        const options = Dom_1.Dom.div();
        const visibleButton = Dom_1.Dom.button('o');
        name.innerText = layer.name;
        options.append(visibleButton);
        container.append(name, options);
        return container;
    }
}
exports.LayerListing = LayerListing;


/***/ }),

/***/ "./src/Client/Component/NewLayerForm/NewLayerForm.ts":
/*!***********************************************************!*\
  !*** ./src/Client/Component/NewLayerForm/NewLayerForm.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NewLayerForm = void 0;
const events_1 = __webpack_require__(/*! Client/Constants/events */ "./src/Client/Constants/events.ts");
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
class NewLayerForm extends Component_1.Component {
    name = '';
    css() {
        return /*css*/ `
            .form-container {
                font-family: sans-serif;
                width: 100%;
            }

            .form-group {
                margin-bottom: 1rem;
            }

            .form-label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 600;
                color: #333;
            }

            .text-input {
                width: 100%;
                padding: 0.5rem;
                font-size: 1rem;
                border: 1px solid #ccc;
                border-radius: 4px;
                outline: none;
            }

            .text-input:focus {
                border-color: #007bff;
                box-shadow: 0 0 0 2px rgba(0,123,255,0.2);
            }
        `;
    }
    build() {
        const container = Dom_1.Dom.div('form-container');
        const formGroup = Dom_1.Dom.div('form-group');
        const label = Dom_1.Dom.label('Layer Name', 'form-label');
        const input = Dom_1.Dom.inputText('text-input');
        input.placeholder = 'Enter layer name';
        input.addEventListener('keyup', () => this.name = input.value);
        const submitButton = Dom_1.Dom.button('Save');
        submitButton.addEventListener('click', this.handleSubmit.bind(this));
        formGroup.appendChild(label);
        formGroup.appendChild(input);
        container.append(formGroup, submitButton);
        return container;
    }
    handleSubmit() {
        Events_1.Events.emit(events_1.EVENTS.closeModal, this);
        Events_1.Events.emit(events_1.EVENTS.newLayerSubmit, {
            name: this.name,
        });
    }
}
exports.NewLayerForm = NewLayerForm;


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
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
class SideMenu extends Component_1.Component {
    isSingleton = true;
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
        const sheetImportOption = this.buildMiniOption();
        container.append(slot, sheetImportOption);
        return container;
    }
    buildMiniOption() {
        const option = Dom_1.Dom.button('s', 'sheet-import');
        option.addEventListener('click', () => Events_1.Events.emitSheetImportOpen());
        return option;
    }
}
exports.SideMenu = SideMenu;


/***/ }),

/***/ "./src/Client/Component/SpriteSheets/SheetImporter/SheetImporter.ts":
/*!**************************************************************************!*\
  !*** ./src/Client/Component/SpriteSheets/SheetImporter/SheetImporter.ts ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SheetImporter = void 0;
const FileListing_1 = __webpack_require__(/*! Client/Component/File/FileListing/FileListing */ "./src/Client/Component/File/FileListing/FileListing.ts");
const FileUploader_1 = __webpack_require__(/*! Client/Component/File/FileUploader/FileUploader */ "./src/Client/Component/File/FileUploader/FileUploader.ts");
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
class SheetImporter extends Component_1.Component {
    isSingleton = true;
    build() {
        const container = Dom_1.Dom.div();
        const fileListing = Dom_1.Dom.makeComponent(FileListing_1.FileListing);
        const uploader = Dom_1.Dom.makeComponent(FileUploader_1.FileUploader);
        container.append(fileListing, uploader);
        return container;
    }
}
exports.SheetImporter = SheetImporter;


/***/ }),

/***/ "./src/Client/Component/SpriteSheets/SheetMaker/SheetMaker.ts":
/*!********************************************************************!*\
  !*** ./src/Client/Component/SpriteSheets/SheetMaker/SheetMaker.ts ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SheetMaker = void 0;
const events_1 = __webpack_require__(/*! Client/Constants/events */ "./src/Client/Constants/events.ts");
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
const extract_image_from_canvas_area_1 = __webpack_require__(/*! Client/Service/extract-image-from-canvas-area */ "./src/Client/Service/extract-image-from-canvas-area.ts");
class SheetMaker extends Component_1.Component {
    image = null;
    canvas;
    css() {
        return /*css*/ `
            :host {
                position: relative;
                max-width: 400px;
                max-height: 400px;
                overflow: scroll;
                display: block;
            }

            .selector-box {
                position: absolute;
                border: 1px solid #0078D7;
                background-color: rgba(0, 120, 215, 0.2);
                pointer-events: none;
                display: none;
                z-index: 10;
            }
        `;
    }
    async setup() {
        if (this.dataset.imageSrc) {
            this.image = await Dom_1.Dom.image(this.dataset.imageSrc);
        }
    }
    build() {
        const element = Dom_1.Dom.div();
        this.canvas = Dom_1.Dom.canvas(element.offsetHeight, element.offsetWidth);
        const context = this.canvas.getContext('2d');
        const selectorBox = this.buildSelectorBox();
        if (this.image) {
            this.canvas.width = this.image.width;
            this.canvas.height = this.image.height;
            context.drawImage(this.image, 0, 0);
        }
        element.append(this.canvas, selectorBox);
        return element;
    }
    buildSelectorBox() {
        const box = Dom_1.Dom.div('selector-box');
        let startX = 0;
        let startY = 0;
        let isDragging = false;
        const snap = (value) => Math.round(value / 5) * 5;
        const onMouseMove = (event) => {
            if (!isDragging)
                return;
            const rect = this.getBoundingClientRect();
            const currentX = event.clientX - rect.left;
            const currentY = event.clientY - rect.top;
            const width = snap(Math.abs(currentX - startX));
            const height = snap(Math.abs(currentY - startY));
            box.style.display = 'block';
            box.style.left = snap(Math.min(currentX, startX)) + 'px';
            box.style.top = snap(Math.min(currentY, startY)) + 'px';
            box.style.width = width + 'px';
            box.style.height = height + 'px';
        };
        const onMouseUp = async () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            const boxX = parseInt(box.style.left || '0', 10);
            const boxY = parseInt(box.style.top || '0', 10);
            const boxWidth = parseInt(box.style.width || '0', 10);
            const boxHeight = parseInt(box.style.height || '0', 10);
            Events_1.Events.emit(events_1.EVENTS.sheetSelectionMade, await (0, extract_image_from_canvas_area_1.extractImageFromCanvasArea)(this.canvas, boxX, boxY, boxWidth, boxHeight));
        };
        this.addEventListener('mousedown', (event) => {
            const rect = this.getBoundingClientRect();
            isDragging = true;
            startX = event.clientX - rect.left;
            startY = event.clientY - rect.top;
            box.style.display = 'none';
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
        return box;
    }
}
exports.SheetMaker = SheetMaker;


/***/ }),

/***/ "./src/Client/Component/WindowBox/WindowBox.ts":
/*!*****************************************************!*\
  !*** ./src/Client/Component/WindowBox/WindowBox.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WindowBox = void 0;
const handleDragAndDrop_1 = __webpack_require__(/*! Client/Component/Generic/handleDragAndDrop */ "./src/Client/Component/Generic/handleDragAndDrop.ts");
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
class WindowBox extends Component_1.Component {
    isDragging = false;
    offsetX = 0;
    offsetY = 0;
    zIndexMoveDown() {
        this.style.zIndex = '1000';
    }
    zIndexMoveUp() {
        this.style.zIndex = '1001';
    }
    flash() {
        this.classList.add('flash');
        setTimeout(() => {
            this.classList.remove('flash');
        }, 500);
    }
    css() {
        return /*css*/ `
            :host {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translateX(-50%) translateY(-50%);
                cursor: default;
                z-index: 1001;
            }

            .header {
                background: #ccc;
                padding: 10px;
                cursor: move;
                user-select: none;
                display: flex;
            }

            .header > div {
                flex: 1;
            }

            .options {
                display:flex;
                justify-content: flex-end;
            }

            .close:hover {
                color: red;
                cursor: pointer;
            }

            .content {
                padding: 10px;
                background: white;
                border: 1px solid #ccc;
            }

            @keyframes flash {
                0% {
                  box-shadow: 0 0 0px rgba(255, 200, 0, 0.8);
                  transform: scale(1);
                }
                50% {
                  box-shadow: 0 0 12px rgba(255, 200, 0, 0.9);
                  transform: scale(1.02);
                }
                100% {
                  box-shadow: 0 0 0px rgba(255, 200, 0, 0);
                  transform: scale(1);
                }
              }
              
              :host(.flash) {
                animation: flash 0.5s ease-in-out;
              }
        `;
    }
    build() {
        const container = Dom_1.Dom.div('window-box');
        const content = Dom_1.Dom.div('content');
        const slot = Dom_1.Dom.slot();
        container.addEventListener('mousedown', (e) => Events_1.Events.emitMouseDownOnWindowBox(this));
        content.append(slot);
        container.append(this.buildHeader(), content);
        return container;
    }
    buildHeader() {
        const element = Dom_1.Dom.div('header');
        const title = Dom_1.Dom.div();
        const options = Dom_1.Dom.div('options');
        const close = Dom_1.Dom.div('close');
        close.innerText = 'x';
        title.innerText = this.dataset.title || '';
        element.addEventListener('mousedown', (e) => (0, handleDragAndDrop_1.handleDragAndDrop)(this, e));
        close.addEventListener('click', (event) => {
            event.stopPropagation();
            this.destroy();
        }, true);
        options.append(close);
        element.append(title, options);
        return element;
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
const SheetMaker_1 = __webpack_require__(/*! Client/Component/SpriteSheets/SheetMaker/SheetMaker */ "./src/Client/Component/SpriteSheets/SheetMaker/SheetMaker.ts");
const SideMenu_1 = __webpack_require__(/*! Client/Component/SideMenu/SideMenu */ "./src/Client/Component/SideMenu/SideMenu.ts");
const SheetImporter_1 = __webpack_require__(/*! Client/Component/SpriteSheets/SheetImporter/SheetImporter */ "./src/Client/Component/SpriteSheets/SheetImporter/SheetImporter.ts");
const BasicModal_1 = __webpack_require__(/*! Client/Component/Generic/Modal/BasicModal */ "./src/Client/Component/Generic/Modal/BasicModal.ts");
const NewLayerForm_1 = __webpack_require__(/*! Client/Component/NewLayerForm/NewLayerForm */ "./src/Client/Component/NewLayerForm/NewLayerForm.ts");
const CanvasLayer_1 = __webpack_require__(/*! Client/Component/Canvas/CanvasLayer */ "./src/Client/Component/Canvas/CanvasLayer.ts");
exports.COMPONENTS = new Map([
    [SideMenu_1.SideMenu, 'side-menu'],
    [LayerListing_1.LayerListing, 'layer-listing'],
    [WindowBox_1.WindowBox, 'window-box'],
    [FileUploader_1.FileUploader, 'file-uploader'],
    [FileListing_1.FileListing, 'file-listing'],
    [SheetMaker_1.SheetMaker, 'sheet-maker'],
    [SheetImporter_1.SheetImporter, 'sheet-importer'],
    [BasicModal_1.BasicModal, 'modal-basic'],
    [NewLayerForm_1.NewLayerForm, 'new-layer-form'],
    [CanvasLayer_1.CanvasLayer, 'canvas-layer'],
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
    openSheet: 'open-sheet',
    openSheetImporter: 'open-sheet-importer',
    openAddNewLayer: 'open-add-new-layer',
    mouseDownWindowBox: 'mouse-down-window-box',
    newLayerSubmit: 'new-layer-submit',
    newLayerMapped: 'new-layer-mapped',
    gotLayer: 'got-layer',
    closeModal: 'close-modal',
    sheetSelectionMade: 'sheet-selection-made',
    windowResize: 'window-resize',
};


/***/ }),

/***/ "./src/Client/Service/Component.ts":
/*!*****************************************!*\
  !*** ./src/Client/Service/Component.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Component = void 0;
const is_json_1 = __webpack_require__(/*! Client/Service/is-json */ "./src/Client/Service/is-json.ts");
class Component extends HTMLElement {
    shadow;
    isSingleton = false;
    content;
    parameters = {};
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
    }
    async setup() { }
    css() {
        return '';
    }
    destroy() {
        this.shadow.host.remove();
    }
    reload() {
        this.render(true);
    }
    connectedCallback() {
        this.render();
    }
    render(isReload = false) {
        this.setup().then(() => {
            const css = this.css().trim();
            if (css.length) {
                const sheet = new CSSStyleSheet();
                sheet.replaceSync(css);
                this.shadowRoot.adoptedStyleSheets = [sheet];
            }
            Object.entries(this.dataset).forEach(([key, value]) => {
                this.parameters[key] = (0, is_json_1.isJSON)(value)
                    ? JSON.parse(value)
                    : value;
            });
            this.content = this.build();
            if (isReload) {
                this.shadow.replaceChild(this.build(), this.content);
            }
            else {
                this.shadow.appendChild(this.content);
            }
        });
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
    static label(text, ...classList) {
        const element = document.createElement('label');
        element.innerText = text;
        if (classList.length) {
            element.classList.add(...classList);
        }
        return element;
    }
    static inputText(...classList) {
        const element = document.createElement('input');
        element.type = 'text';
        return element;
    }
    static canvas(width = 0, height = 0) {
        const element = document.createElement('canvas');
        element.width = width;
        element.height = height;
        return element;
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
    static async image(src) {
        return new Promise((resolve, reject) => {
            const image = document.createElement('img');
            image.src = src;
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('abort', () => reject());
        });
    }
    static makeComponent(component, dataset = {}) {
        const tag = this.findComponentTag(component);
        const existing = Dom.queryAllDeep(tag);
        if (existing.length) {
            const found = existing[0];
            if (found.isSingleton) {
                return found;
            }
        }
        const element = document.createElement(tag);
        Object.assign(element.dataset, dataset);
        return element;
    }
    static getAllOfComponent(component) {
        const tag = this.findComponentTag(component);
        return Array.from(Dom.queryAllDeep(tag));
    }
    static queryAllDeep(selector, root = document) {
        const result = [];
        const traverse = (node) => {
            if (node.matches(selector)) {
                result.push(node);
            }
            const shadow = node.shadowRoot;
            if (shadow) {
                traverseAll(shadow);
            }
            Array.from(node.children).forEach(child => traverse(child));
        };
        const traverseAll = (container) => {
            Array.from(container.children).forEach(child => traverse(child));
        };
        traverseAll(root);
        return result;
    }
    static findComponentTag(component) {
        const tag = components_1.COMPONENTS.get(component);
        if (!tag) {
            throw new Error(`Component not found in COMPONENTS map: ${component.name}`);
        }
        return tag;
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
    static emit(key, detail = undefined) {
        document.dispatchEvent(new CustomEvent(key, {
            detail,
            bubbles: false,
            composed: true
        }));
    }
    static addListener(key, callback) {
        document.addEventListener(key, callback);
    }
    static listen(callback, ...keys) {
        keys.forEach(key => {
            this.addListener(key, callback);
        });
    }
    static emitFilesUploadSubmitted(files) {
        Events.emit(events_1.EVENTS.uploadFilesSubmission, files);
    }
    static listenToFilesUploadSubmitted(callback) {
        Events.listen(event => {
            callback(event.detail);
        }, events_1.EVENTS.uploadFilesSubmission);
    }
    static emitOpenSheet(file) {
        this.emit(events_1.EVENTS.openSheet, file);
    }
    static listenToOpenSheet(callback) {
        Events.listen(event => {
            callback(event.detail);
        }, events_1.EVENTS.openSheet);
    }
    static emitMouseDownOnWindowBox(windowBox) {
        Events.emit(events_1.EVENTS.mouseDownWindowBox, windowBox);
    }
    static listenMouseDownOnWindowBox(callback) {
        Events.listen(event => {
            callback(event.detail);
        }, events_1.EVENTS.mouseDownWindowBox);
    }
    static emitSheetImportOpen() {
        Events.emit(events_1.EVENTS.openSheetImporter);
    }
    static listenToSheetImportOpen(callback) {
        Events.listen((event) => {
            callback();
        }, events_1.EVENTS.openSheetImporter);
    }
}
exports.Events = Events;


/***/ }),

/***/ "./src/Client/Service/FileUpload.ts":
/*!******************************************!*\
  !*** ./src/Client/Service/FileUpload.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileUpload = void 0;
class FileUpload {
    static async uploadMultiple(files) {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files[]', file);
        });
        await fetch('/upload-files', {
            method: 'POST',
            body: formData,
        });
    }
}
exports.FileUpload = FileUpload;


/***/ }),

/***/ "./src/Client/Service/Repository/LayerRepository.ts":
/*!**********************************************************!*\
  !*** ./src/Client/Service/Repository/LayerRepository.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LayerRepository = void 0;
const Repository_1 = __webpack_require__(/*! Client/Service/Repository/Repository */ "./src/Client/Service/Repository/Repository.ts");
class LayerRepository extends Repository_1.Repository {
    API_PATH = '/layers';
    async persist(...layers) {
        await this.post(this.API_PATH, layers);
    }
    async getAll() {
        return await this.get(this.API_PATH);
    }
}
exports.LayerRepository = LayerRepository;


/***/ }),

/***/ "./src/Client/Service/Repository/Repository.ts":
/*!*****************************************************!*\
  !*** ./src/Client/Service/Repository/Repository.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Repository = void 0;
class Repository {
    post(path, body) {
        return fetch(path, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
    }
    async get(path) {
        const response = await fetch(path);
        return response.json();
    }
}
exports.Repository = Repository;


/***/ }),

/***/ "./src/Client/Service/WindowBoxFactory.ts":
/*!************************************************!*\
  !*** ./src/Client/Service/WindowBoxFactory.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WindowBoxFactory = void 0;
const WindowBox_1 = __webpack_require__(/*! Client/Component/WindowBox/WindowBox */ "./src/Client/Component/WindowBox/WindowBox.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
const singletonInstances = [];
class WindowBoxFactory {
    static make(component, title) {
        const windowBox = Dom_1.Dom.makeComponent(WindowBox_1.WindowBox);
        if (component.isSingleton && singletonInstances.includes(component)) {
            return windowBox;
        }
        if (!windowBox.isConnected) {
            windowBox.dataset.title = title;
            windowBox.append(component);
            if (component.isSingleton) {
                singletonInstances.push(component);
            }
            document.body.append(windowBox);
        }
        return windowBox;
    }
}
exports.WindowBoxFactory = WindowBoxFactory;


/***/ }),

/***/ "./src/Client/Service/extract-image-from-canvas-area.ts":
/*!**************************************************************!*\
  !*** ./src/Client/Service/extract-image-from-canvas-area.ts ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.extractImageFromCanvasArea = void 0;
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
async function extractImageFromCanvasArea(sourceCanvas, x, y, width, height) {
    const tempCanvas = Dom_1.Dom.canvas(width, height);
    const ctx = tempCanvas.getContext('2d');
    const image = await Dom_1.Dom.image(sourceCanvas.toDataURL());
    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
    console.log(await Dom_1.Dom.image(tempCanvas.toDataURL()));
    return await Dom_1.Dom.image(tempCanvas.toDataURL());
}
exports.extractImageFromCanvasArea = extractImageFromCanvasArea;


/***/ }),

/***/ "./src/Client/Service/fileToBase64.ts":
/*!********************************************!*\
  !*** ./src/Client/Service/fileToBase64.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fileToBase64 = void 0;
async function fileToBase64(file) {
    if (file === null) {
        return '';
    }
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
exports.fileToBase64 = fileToBase64;


/***/ }),

/***/ "./src/Client/Service/is-json.ts":
/*!***************************************!*\
  !*** ./src/Client/Service/is-json.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isJSON = void 0;
function isJSON(value) {
    if (typeof value !== 'string') {
        return false;
    }
    try {
        const parsed = JSON.parse(value);
        return typeof parsed === 'object' && parsed !== null;
    }
    catch {
        return false;
    }
}
exports.isJSON = isJSON;


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


/***/ }),

/***/ "./src/Model/Factory/LayerFactory.ts":
/*!*******************************************!*\
  !*** ./src/Model/Factory/LayerFactory.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LayerFactory = void 0;
class LayerFactory {
    static make() {
        return {
            uuid: crypto.randomUUID(),
            name: '',
            created_at: new Date().toISOString(),
            is_visible: true,
        };
    }
}
exports.LayerFactory = LayerFactory;


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
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
const FileUpload_1 = __webpack_require__(/*! Client/Service/FileUpload */ "./src/Client/Service/FileUpload.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
const fileToBase64_1 = __webpack_require__(/*! Client/Service/fileToBase64 */ "./src/Client/Service/fileToBase64.ts");
const WindowBox_1 = __webpack_require__(/*! Client/Component/WindowBox/WindowBox */ "./src/Client/Component/WindowBox/WindowBox.ts");
const WindowBoxFactory_1 = __webpack_require__(/*! Client/Service/WindowBoxFactory */ "./src/Client/Service/WindowBoxFactory.ts");
const SheetImporter_1 = __webpack_require__(/*! Client/Component/SpriteSheets/SheetImporter/SheetImporter */ "./src/Client/Component/SpriteSheets/SheetImporter/SheetImporter.ts");
const SheetMaker_1 = __webpack_require__(/*! Client/Component/SpriteSheets/SheetMaker/SheetMaker */ "./src/Client/Component/SpriteSheets/SheetMaker/SheetMaker.ts");
const events_1 = __webpack_require__(/*! Client/Constants/events */ "./src/Client/Constants/events.ts");
const BasicModal_1 = __webpack_require__(/*! Client/Component/Generic/Modal/BasicModal */ "./src/Client/Component/Generic/Modal/BasicModal.ts");
const NewLayerForm_1 = __webpack_require__(/*! Client/Component/NewLayerForm/NewLayerForm */ "./src/Client/Component/NewLayerForm/NewLayerForm.ts");
const LayerFactory_1 = __webpack_require__(/*! Model/Factory/LayerFactory */ "./src/Model/Factory/LayerFactory.ts");
const LayerRepository_1 = __webpack_require__(/*! Client/Service/Repository/LayerRepository */ "./src/Client/Service/Repository/LayerRepository.ts");
const CanvasLayer_1 = __webpack_require__(/*! Client/Component/Canvas/CanvasLayer */ "./src/Client/Component/Canvas/CanvasLayer.ts");
components_1.COMPONENTS.forEach((tagName, constructor) => {
    customElements.define(tagName, constructor);
});
let openSheets = [];
let windowBoxes = {};
const layerRepository = new LayerRepository_1.LayerRepository();
document.addEventListener('DOMContentLoaded', () => {
    Events_1.Events.listenToFilesUploadSubmitted(files => {
        FileUpload_1.FileUpload.uploadMultiple(files);
    });
    Events_1.Events.listenToOpenSheet(async (file) => {
        if (openSheets.includes(file.name)) {
            windowBoxes[file.name].flash();
            return;
        }
        const component = Dom_1.Dom.makeComponent(SheetMaker_1.SheetMaker, { imageSrc: await (0, fileToBase64_1.fileToBase64)(file) });
        openSheets.push(file.name);
        windowBoxes[file.name] = WindowBoxFactory_1.WindowBoxFactory.make(component, file.name);
    });
    Events_1.Events.listenMouseDownOnWindowBox(windowBox => {
        Dom_1.Dom.getAllOfComponent(WindowBox_1.WindowBox).forEach(box => {
            box.zIndexMoveDown();
        });
        windowBox.zIndexMoveUp();
    });
    Events_1.Events.listenToSheetImportOpen(() => {
        const component = Dom_1.Dom.makeComponent(SheetImporter_1.SheetImporter);
        WindowBoxFactory_1.WindowBoxFactory.make(component, 'Import Sheets');
    });
    Events_1.Events.listen(() => {
        const modal = Dom_1.Dom.makeComponent(BasicModal_1.BasicModal);
        const newLayerForm = Dom_1.Dom.makeComponent(NewLayerForm_1.NewLayerForm);
        modal.append(newLayerForm);
        document.body.append(modal);
    }, events_1.EVENTS.openAddNewLayer);
    Events_1.Events.listen((event) => {
        const input = event.detail;
        const layer = Object.assign(LayerFactory_1.LayerFactory.make(), input);
        Events_1.Events.emit(events_1.EVENTS.newLayerMapped, [layer]);
        layerRepository.persist(layer);
    }, events_1.EVENTS.newLayerSubmit);
    Events_1.Events.listen(event => {
        document.body.append(...event.detail.map(layer => Dom_1.Dom.makeComponent(CanvasLayer_1.CanvasLayer, { layer })));
    }, events_1.EVENTS.gotLayer);
    layerRepository.getAll().then(layers => {
        Events_1.Events.emit(events_1.EVENTS.gotLayer, layers);
    });
    window.addEventListener('resize', () => Events_1.Events.emit(events_1.EVENTS.windowResize));
});

})();

/******/ })()
;
//# sourceMappingURL=index.js.map