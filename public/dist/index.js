/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Client/Component/Canvas/CanvasLayer.ts":
/*!****************************************************!*\
  !*** ./src/Client/Component/Canvas/CanvasLayer.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CanvasLayer = void 0;
const events_1 = __webpack_require__(/*! Client/Constants/events */ "./src/Client/Constants/events.ts");
const mouse_events_1 = __webpack_require__(/*! Client/Constants/mouse-events */ "./src/Client/Constants/mouse-events.ts");
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
class CanvasLayer extends Component_1.Component {
    ctx;
    currentImage;
    layer;
    isLeftMouseDown = false;
    mouseCoordinates = { x: 0, y: 0 };
    css() {
        return /*css*/ `
            :host {
                z-index: 500;
                display: block;
                position: absolute;
                top: 0;
                left: 0;
            }
            
            :host(.active) {
                z-index: 501;
            }

            .current-image {
                position: fixed;
                pointer-events: none;
            }

            .hide {
                display: none;
            }
        `;
    }
    async setup() {
        this.layer = this.parameters.layer;
    }
    build() {
        const canvas = Dom_1.Dom.canvas();
        canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        canvas.classList.toggle('hide', !this.layer.is_visible);
        this.classList.toggle('active', this.layer.is_active);
        this.handleWindowResize(canvas);
        return canvas;
    }
    afterBuild() {
        Events_1.Events.listen(() => this.handleWindowResize(), events_1.EVENTS.windowResize);
        Events_1.Events.listen(this.handleCurrentImageChange.bind(this), events_1.EVENTS.sheetSelectionMade);
        Events_1.Events.listen(this.handleLayerUpdate.bind(this), 'layer-update');
        this.frame();
    }
    handleLayerUpdate(event) {
        const layer = event.detail;
        if (this.layer.uuid === layer.uuid) {
            Object.assign(this.layer, layer);
            this.patch();
        }
    }
    drawPlacement(placement) {
        Dom_1.Dom.image(placement.imageSrc).then(image => {
            this.getCtx().drawImage(image, placement.coordinate.x, placement.coordinate.y);
        });
    }
    frame() {
        setTimeout(() => {
            this.layer.placements.forEach(this.drawPlacement.bind(this));
            window.requestAnimationFrame(this.frame.bind(this));
        }, 200);
    }
    handleMouseMove(event) {
        const x = event.clientX;
        const y = event.clientY;
        this.mouseCoordinates.x = x;
        this.mouseCoordinates.y = y;
        if (this.currentImage) {
            this.currentImage.classList.remove('hide');
            this.currentImage.style.left = x + 'px';
            this.currentImage.style.top = y + 'px';
        }
    }
    handleMouseDown(event) {
        if (event.button === mouse_events_1.LEFT_BUTTON && this.currentImage) {
            this.isLeftMouseDown = true;
            const placement = {
                coordinate: {
                    x: this.mouseCoordinates.x,
                    y: this.mouseCoordinates.y,
                },
                imageSrc: this.currentImage.src,
            };
            this.layer.placements.push(placement);
            const mouseUp = (event) => {
                Events_1.Events.emit(events_1.EVENTS.layerPlacementMade, this.layer);
                document.removeEventListener('mouseup', mouseUp);
            };
            document.addEventListener('mouseup', mouseUp);
        }
    }
    handleMouseLeave(event) {
        this.currentImage?.classList.add('hide');
    }
    handleCurrentImageChange(event) {
        const newImage = event.detail;
        if (this.currentImage) {
            this.currentImage.src = newImage.src;
        }
        else {
            this.currentImage = newImage.cloneNode();
            this.shadowRoot.append(this.currentImage);
            this.currentImage.classList.add('current-image');
        }
    }
    getCanvas() {
        return this.shadowRoot.querySelector('canvas');
    }
    getCtx() {
        return this.getCanvas().getContext('2d');
    }
    handleWindowResize(canvas = undefined) {
        const currentCanvas = canvas || this.getCanvas();
        currentCanvas.width = window.outerWidth;
        currentCanvas.height = window.outerHeight;
    }
}
exports.CanvasLayer = CanvasLayer;


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

/***/ "./src/Client/Component/LayerListing/LayerItem.ts":
/*!********************************************************!*\
  !*** ./src/Client/Component/LayerListing/LayerItem.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LayerItem = void 0;
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
class LayerItem extends Component_1.Component {
    layer;
    container;
    visibleButton;
    css() {
        return /*css*/ `
            .container {
                display: flex;
                padding: 4px;
            }

            .container > div {
                flex: 1;
            }

            .options {
                display: flex;
                justify-content: end;
            }

            .active {
                background: beige;
            }
        `;
    }
    async setup() {
        this.layer = this.parameters.layer;
    }
    build() {
        this.container = Dom_1.Dom.div('container');
        const name = Dom_1.Dom.div();
        const options = Dom_1.Dom.div('options');
        this.visibleButton = Dom_1.Dom.button();
        const eyeIcon = document.createElement('i');
        name.innerText = this.layer.name;
        eyeIcon.classList.add('fa-solid', this.layer.is_visible ? 'fa-eye' : 'fa-eye-slash');
        this.container.classList.toggle('active', this.layer.is_active);
        this.visibleButton.append(eyeIcon);
        options.append(this.visibleButton);
        this.container.append(name, options);
        return this.container;
    }
    afterBuild() {
        Events_1.Events.listen(event => {
            const update = event.detail;
            if (update.uuid === this.layer.uuid) {
                this.layer = event.detail;
                this.patch();
            }
        }, 'layer-update');
        this.container.addEventListener('click', () => {
            Events_1.Events.emit('layer-active', this.layer);
        });
        this.visibleButton.addEventListener('click', (e) => {
            e.stopPropagation();
            Events_1.Events.emit('layer-visible-toggle', this.layer);
        });
    }
}
exports.LayerItem = LayerItem;


/***/ }),

/***/ "./src/Client/Component/LayerListing/LayerListing.ts":
/*!***********************************************************!*\
  !*** ./src/Client/Component/LayerListing/LayerListing.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LayerListing = void 0;
const LayerItem_1 = __webpack_require__(/*! Client/Component/LayerListing/LayerItem */ "./src/Client/Component/LayerListing/LayerItem.ts");
const events_1 = __webpack_require__(/*! Client/Constants/events */ "./src/Client/Constants/events.ts");
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
class LayerListing extends Component_1.Component {
    listing;
    addNewLayerButton;
    build() {
        const container = Dom_1.Dom.div();
        this.listing = Dom_1.Dom.div();
        this.addNewLayerButton = Dom_1.Dom.button('Add New Layer');
        container.append(this.listing, this.addNewLayerButton);
        return container;
    }
    afterBuild() {
        this.addNewLayerButton.addEventListener('click', () => Events_1.Events.emit(events_1.EVENTS.openAddNewLayer));
        Events_1.Events.listen(event => {
            this.listing.append(...event.detail.map(this.buildLayer.bind(this)));
        }, events_1.EVENTS.newLayerMapped, events_1.EVENTS.gotLayer);
    }
    buildLayer(layer) {
        return Dom_1.Dom.makeComponent(LayerItem_1.LayerItem, { layer });
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

/***/ "./src/Client/Component/SheetListing/SheetListing.ts":
/*!***********************************************************!*\
  !*** ./src/Client/Component/SheetListing/SheetListing.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileListing = void 0;
const events_1 = __webpack_require__(/*! Client/Constants/events */ "./src/Client/Constants/events.ts");
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
        Events_1.Events.listenToFilesUploadSubmitted(async (fileList) => {
            const sheets = await Promise.all(fileList.map(this.mapToSheet.bind(this)));
            container.append(...sheets.map(this.buildSheet.bind(this)));
        });
        Events_1.Events.listen(event => {
            container.append(...event.detail
                .map(this.buildSheet.bind(this)));
        }, events_1.EVENTS.gotSheets);
        Events_1.Events.emit(events_1.EVENTS.getSheets);
        return container;
    }
    mapToSheet(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result;
                resolve({
                    name: file.name,
                    imageSrc: base64,
                });
            };
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            reader.readAsDataURL(file);
        });
    }
    buildSheet(sheet) {
        const container = Dom_1.Dom.div('file');
        const name = Dom_1.Dom.div();
        const options = Dom_1.Dom.div();
        const openButton = Dom_1.Dom.button('Open');
        name.innerText = sheet.name;
        openButton.addEventListener('click', (e) => Events_1.Events.emitOpenSheet(sheet));
        options.append(openButton);
        container.append(name, options);
        return container;
    }
}
exports.FileListing = FileListing;


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
                z-index: 800;
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
const SheetListing_1 = __webpack_require__(/*! Client/Component/SheetListing/SheetListing */ "./src/Client/Component/SheetListing/SheetListing.ts");
const FileUploader_1 = __webpack_require__(/*! Client/Component/File/FileUploader/FileUploader */ "./src/Client/Component/File/FileUploader/FileUploader.ts");
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
class SheetImporter extends Component_1.Component {
    isSingleton = true;
    build() {
        const container = Dom_1.Dom.div();
        const fileListing = Dom_1.Dom.makeComponent(SheetListing_1.FileListing);
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
const SheetListing_1 = __webpack_require__(/*! Client/Component/SheetListing/SheetListing */ "./src/Client/Component/SheetListing/SheetListing.ts");
const SheetMaker_1 = __webpack_require__(/*! Client/Component/SpriteSheets/SheetMaker/SheetMaker */ "./src/Client/Component/SpriteSheets/SheetMaker/SheetMaker.ts");
const SideMenu_1 = __webpack_require__(/*! Client/Component/SideMenu/SideMenu */ "./src/Client/Component/SideMenu/SideMenu.ts");
const SheetImporter_1 = __webpack_require__(/*! Client/Component/SpriteSheets/SheetImporter/SheetImporter */ "./src/Client/Component/SpriteSheets/SheetImporter/SheetImporter.ts");
const BasicModal_1 = __webpack_require__(/*! Client/Component/Generic/Modal/BasicModal */ "./src/Client/Component/Generic/Modal/BasicModal.ts");
const NewLayerForm_1 = __webpack_require__(/*! Client/Component/NewLayerForm/NewLayerForm */ "./src/Client/Component/NewLayerForm/NewLayerForm.ts");
const CanvasLayer_1 = __webpack_require__(/*! Client/Component/Canvas/CanvasLayer */ "./src/Client/Component/Canvas/CanvasLayer.ts");
const LayerItem_1 = __webpack_require__(/*! Client/Component/LayerListing/LayerItem */ "./src/Client/Component/LayerListing/LayerItem.ts");
exports.COMPONENTS = new Map([
    [SideMenu_1.SideMenu, 'side-menu'],
    [LayerListing_1.LayerListing, 'layer-listing'],
    [WindowBox_1.WindowBox, 'window-box'],
    [FileUploader_1.FileUploader, 'file-uploader'],
    [SheetListing_1.FileListing, 'file-listing'],
    [SheetMaker_1.SheetMaker, 'sheet-maker'],
    [SheetImporter_1.SheetImporter, 'sheet-importer'],
    [BasicModal_1.BasicModal, 'modal-basic'],
    [NewLayerForm_1.NewLayerForm, 'new-layer-form'],
    [CanvasLayer_1.CanvasLayer, 'canvas-layer'],
    [LayerItem_1.LayerItem, 'layer-item'],
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
    getSheets: 'get-sheets',
    gotSheets: 'got-sheets',
    closeModal: 'close-modal',
    sheetSelectionMade: 'sheet-selection-made',
    windowResize: 'window-resize',
    layerPlacementMade: 'layer-placement-made',
};


/***/ }),

/***/ "./src/Client/Constants/mouse-events.ts":
/*!**********************************************!*\
  !*** ./src/Client/Constants/mouse-events.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LEFT_BUTTON = void 0;
exports.LEFT_BUTTON = 0;


/***/ }),

/***/ "./src/Client/Service/Component.ts":
/*!*****************************************!*\
  !*** ./src/Client/Service/Component.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Component = void 0;
const is_json_1 = __webpack_require__(/*! Client/Service/is-json */ "./src/Client/Service/is-json.ts");
const patch_dom_1 = __webpack_require__(/*! Client/Service/patch-dom */ "./src/Client/Service/patch-dom.ts");
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
    afterBuild() { }
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
    patch() {
        const firstChild = Array.from(this.shadow.children)
            .filter(child => child.tagName !== 'LINK')[0];
        if (firstChild) {
            (0, patch_dom_1.patchDOM)(firstChild, this.build());
        }
    }
    render(isReload = false) {
        Object.entries(this.dataset).forEach(([key, value]) => {
            this.parameters[key] = (0, is_json_1.isJSON)(value)
                ? JSON.parse(value)
                : value;
        });
        this.setup()
            .then(() => {
            const css = this.css().trim();
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/dist/styles.css';
            this.shadow.append(link);
            if (css.length) {
                const sheet = new CSSStyleSheet();
                sheet.replaceSync(css);
                this.shadow.adoptedStyleSheets = [sheet];
            }
            this.content = this.build();
            if (isReload) {
                this.shadow.replaceChild(this.build(), this.content);
            }
            else {
                this.shadow.appendChild(this.content);
            }
        })
            .then(() => {
            this.afterBuild();
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
    static button(text = '', ...classList) {
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
        Object.entries(dataset).forEach(([key, value]) => {
            if (value instanceof Object || Array.isArray(value)) {
                dataset[key] = JSON.stringify(value);
            }
        });
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
    static emitOpenSheet(sheet) {
        this.emit(events_1.EVENTS.openSheet, sheet);
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
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
const Repository_1 = __webpack_require__(/*! Client/Service/Repository/Repository */ "./src/Client/Service/Repository/Repository.ts");
class LayerRepository extends Repository_1.Repository {
    API_PATH = '/layers';
    layers;
    async persist(...layers) {
        await this.post(this.API_PATH, layers);
    }
    async update(layer) {
        const found = this.layers.find(l => l.uuid === layer.uuid);
        if (found) {
            Object.assign(found, layer);
        }
        await this.patch(this.API_PATH, layer);
    }
    async getAll() {
        if (this.layers) {
            return this.layers;
        }
        return this.layers = await this.get(this.API_PATH);
    }
    setActive(uuid) {
        for (const layer of this.layers) {
            layer.is_active = layer.uuid === uuid;
            Events_1.Events.emit('layer-update', layer);
        }
    }
    toggleVisible(uuid) {
        for (const layer of this.layers) {
            if (layer.uuid === uuid) {
                layer.is_visible = !layer.is_visible;
            }
            Events_1.Events.emit('layer-update', layer);
        }
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
    patch(path, body) {
        return fetch(path, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
    }
    async get(path) {
        const response = await fetch(path);
        return response.json();
    }
}
exports.Repository = Repository;


/***/ }),

/***/ "./src/Client/Service/Repository/SheetRepository.ts":
/*!**********************************************************!*\
  !*** ./src/Client/Service/Repository/SheetRepository.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SheetRepository = void 0;
const Repository_1 = __webpack_require__(/*! Client/Service/Repository/Repository */ "./src/Client/Service/Repository/Repository.ts");
class SheetRepository extends Repository_1.Repository {
    API_PATH = '/sheets';
    async getAll() {
        return await this.get(this.API_PATH);
    }
}
exports.SheetRepository = SheetRepository;


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
    return await Dom_1.Dom.image(tempCanvas.toDataURL());
}
exports.extractImageFromCanvasArea = extractImageFromCanvasArea;


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

/***/ "./src/Client/Service/patch-dom.ts":
/*!*****************************************!*\
  !*** ./src/Client/Service/patch-dom.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.patchDOM = void 0;
function patchDOM(oldNode, newNode) {
    if (!oldNode || !newNode)
        return;
    // Replace if node types or node names differ
    if (oldNode.nodeType !== newNode.nodeType || oldNode.nodeName !== newNode.nodeName) {
        if (oldNode.nodeType === Node.ELEMENT_NODE || oldNode.nodeType === Node.TEXT_NODE) {
            oldNode.replaceWith(newNode.cloneNode(true));
        }
        return;
    }
    // Update text content for text nodes
    if (oldNode.nodeType === Node.TEXT_NODE && newNode.nodeType === Node.TEXT_NODE) {
        const oldText = oldNode;
        const newText = newNode;
        if (oldText.nodeValue !== newText.nodeValue) {
            oldText.nodeValue = newText.nodeValue;
        }
        return;
    }
    // If we're here, assume ELEMENT_NODEs
    if (oldNode.nodeType === Node.ELEMENT_NODE && newNode.nodeType === Node.ELEMENT_NODE) {
        const oldEl = oldNode;
        const newEl = newNode;
        // Update attributes
        const oldAttrs = oldEl.attributes;
        const newAttrs = newEl.attributes;
        // Add or update attributes
        for (let i = 0; i < newAttrs.length; i++) {
            const attr = newAttrs[i];
            if (oldEl.getAttribute(attr.name) !== attr.value) {
                oldEl.setAttribute(attr.name, attr.value);
            }
        }
        // Remove old attributes not present in new
        for (let i = 0; i < oldAttrs.length; i++) {
            const attr = oldAttrs[i];
            if (!newEl.hasAttribute(attr.name)) {
                oldEl.removeAttribute(attr.name);
            }
        }
        // Recursively patch children
        const oldChildren = Array.from(oldEl.childNodes);
        const newChildren = Array.from(newEl.childNodes);
        const max = Math.max(oldChildren.length, newChildren.length);
        for (let i = 0; i < max; i++) {
            const oldChild = oldChildren[i];
            const newChild = newChildren[i];
            if (!oldChild && newChild) {
                oldEl.appendChild(newChild.cloneNode(true));
            }
            else if (oldChild && !newChild) {
                oldEl.removeChild(oldChild);
            }
            else if (oldChild && newChild) {
                patchDOM(oldChild, newChild);
            }
        }
    }
}
exports.patchDOM = patchDOM;


/***/ }),

/***/ "./src/Client/styles.css":
/*!*******************************!*\
  !*** ./src/Client/styles.css ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


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
            is_active: false,
            placements: [],
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
/******/ 			// no module.id needed
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
const SheetRepository_1 = __webpack_require__(/*! Client/Service/Repository/SheetRepository */ "./src/Client/Service/Repository/SheetRepository.ts");
components_1.COMPONENTS.forEach((tagName, constructor) => {
    customElements.define(tagName, constructor);
});
let openSheets = [];
let windowBoxes = {};
const layerRepository = new LayerRepository_1.LayerRepository();
const sheetRepository = new SheetRepository_1.SheetRepository();
document.addEventListener('DOMContentLoaded', () => {
    Events_1.Events.listenToFilesUploadSubmitted(files => {
        FileUpload_1.FileUpload.uploadMultiple(files);
    });
    Events_1.Events.listenToOpenSheet(async (sheet) => {
        if (openSheets.includes(sheet.name)) {
            windowBoxes[sheet.name].flash();
            return;
        }
        const component = Dom_1.Dom.makeComponent(SheetMaker_1.SheetMaker, { imageSrc: sheet.imageSrc });
        openSheets.push(sheet.name);
        windowBoxes[sheet.name] = WindowBoxFactory_1.WindowBoxFactory.make(component, sheet.name);
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
    }, events_1.EVENTS.gotLayer, events_1.EVENTS.newLayerMapped);
    Events_1.Events.listen(event => {
        layerRepository.update(event.detail);
    }, events_1.EVENTS.layerPlacementMade);
    Events_1.Events.listen(event => {
        layerRepository.setActive(event.detail.uuid);
    }, 'layer-active');
    Events_1.Events.listen(event => {
        layerRepository.toggleVisible(event.detail.uuid);
    }, 'layer-visible-toggle');
    Events_1.Events.listen(event => {
        layerRepository.update(event.detail);
    }, 'layer-update');
    layerRepository.getAll().then(layers => {
        Events_1.Events.emit(events_1.EVENTS.gotLayer, layers);
    });
    const getSheets = () => {
        sheetRepository.getAll().then(sheets => {
            Events_1.Events.emit(events_1.EVENTS.gotSheets, sheets);
        });
    };
    Events_1.Events.listen(event => {
        getSheets();
    }, events_1.EVENTS.getSheets);
    window.addEventListener('resize', () => Events_1.Events.emit(events_1.EVENTS.windowResize));
});

})();

/******/ })()
;
//# sourceMappingURL=index.js.map