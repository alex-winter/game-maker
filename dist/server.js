/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Server/index.ts":
/*!*****************************!*\
  !*** ./src/Server/index.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const crypto_1 = __webpack_require__(/*! crypto */ "crypto");
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const app = (0, express_1.default)();
const PORT = 3000;
const publicDir = path_1.default.join(__dirname, '/../public');
app.use(express_1.default.static(publicDir));
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(publicDir, 'index.html'));
});
app.get('/layers', (_, response) => {
    const layers = [
        {
            uuid: (0, crypto_1.randomUUID)().toString(),
            name: 'Layer 1',
            created_at: new Date().toISOString(),
        }
    ];
    response.json(layers);
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("express");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

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
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/Server/index.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=server.js.map