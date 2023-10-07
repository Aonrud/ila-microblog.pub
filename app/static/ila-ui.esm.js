/*! ILA UI Elements
 *Copyright (C) 2021–2023 Aonghus Storey
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * Takes a config object and a default config object and returns a final config with all config modifications applied.
 * Ensures no unwanted properties are passed in config.
 * @protected
 * @param {object} defaults - The default config object with all allowed properties
 * @param {object} conf - The config object to apply
 * @return {object}
 */
function applyConfig(defaults, conf) {
	let c = {};
	
	for (const prop in defaults) {
		
		if (typeof defaults[prop] === "object" && !(defaults[prop] instanceof Array) && conf[prop] && typeof conf[prop] !== "function") {
			c[prop] = applyConfig(defaults[prop], conf[prop]);
		} else {
			c[prop] = conf[prop] ?? defaults[prop];
		}
	}
	return c;
}

/**
 * Make a button element with the specified attributes and contents.
 * @protected
 * @param {string} name - the button name
 * @param {string} [css = ""] - classes to apply to the button element
 * @param {string} [text = ""] - the text content
 * @param {string} [title = ""] - the title attribute
 * @param {string} [icon = ""] - Add a span inside the button element with the given classes, if non-empty
 * @param {function} [handler = null] - The object with eventHandler to attach to the click event.
 * @param {string} [element = "button"] - The element to create (e.g. allows using an <a> instead).
 * @return {HTMLButtonElement}
 */
function makeButton(name, css = "", text = "", title = "", icon = "", handler = null, element = "button") {
    let el = document.createElement(element);
    el.id = `btn-${name}`;
    el.className = css;
    el.textContent = text;
    el.setAttribute("title", title);
    if (icon) {
        let i = document.createElement("span");
        i.className = icon;
        el.append(i);
    }
    if (element === "button") el.setAttribute("type", "button");
    if (handler) el.addEventListener("click", handler);
    return el;    
}

/**
 * Adds custom swipe events to a given element.
 * Call the attach() method to add the event listeners, and detach() to remove it.
 * 
 * When attached, a `swiped-[DIRECTION]` event will be dispatched when that element is swiped.
 * A `swiped` event is also dispatched with the direction in the customEvent.detail, to allow for a single listener if needed.
 * 
 * @public
 * @param {HTMLElement} el The element on which to listen for swipe events.
 * @fires Swipe#swiped
 * @fires Swipe#swiped-up
 * @fires Swipe#swiped-down
 * @fires Swipe#swiped-left
 * @fires Swipe#swiped-right
 */
class Swipe {
	
	constructor(el) {
		this._el = el;
	}
	
	/**
	 * Attach the event listeners
	 * @public
	 */
	attach() {
		this._el.addEventListener('touchstart', this);
		this._el.addEventListener('touchend', this);
	}
	
	/**
	 * Detach the event listeners
	 * @public
	 */
	detach() {
		this._el.removeEventListener('touchstart', this);
		this._el.removeEventListener('touchend', this);
	}
	
	/**
	 * Handle touchstart and touchend events
	 * @protected
	 * @param {Event} e
	 */
	handleEvent(e) {
		if (e.type == 'touchstart') {
			this.startX = e.changedTouches[0].clientX;
			this.startY = e.changedTouches[0].clientY;
		}
		if (e.type == 'touchend') {
			this.endX = e.changedTouches[0].clientX;
			this.endY = e.changedTouches[0].clientY;
			this._sendEvents();
		}
	}
	
	/**
	 * Event dispatched by any swipe.
	 * @public
	 * @event Swipe#swiped
	 * @type {object}
	 * @property {object} detail
	 * @property {string} detail.direction - The direction of the swipe action.
	 */
	
	/**
	 * Event dispatched on swipe up.
	 * @public
	 * @event Swipe#swiped-up
	 */
	
	/**
	 * Event dispatched on swipe down.
	 * @public
	 * @event Swipe#swiped-down
	 */
	
	/**
	 * Event dispatched on swipe left.
	 * @public
	 * @event Swipe#swiped-left
	 */
	
	/**
	 * Event dispatched on swipe right.
	 * @public
	 * @event Swipe#swiped-right
	 */
	
	/**
	 * Emits events when a swipe action has occurred.
	 * @protected
	 */
	_sendEvents() {
		const extentX = this.endX - this.startX;
		const extentY = this.endY - this.startY;
		let dir = null;
		
		//Horizontal
		if (Math.abs(extentX) > Math.abs(extentY)) {
			dir = extentX > 0 ? "right" : "left";
		}
		
		//Vertical
		if (Math.abs(extentX) < Math.abs(extentY)) {
			dir = extentY > 0 ? "down" : "up";
		}
		
		if (dir) {
			this._el.dispatchEvent( new CustomEvent('swiped', { detail: { direction: dir } }) );
			this._el.dispatchEvent( new CustomEvent(`swiped-${dir}`) );
		}
	}
}

/**
 * The configuration object for the Scroller.
 * @typedef {object} scrollerConfig
 * @property {scrollerButtons} [classes] - Classes to apply to each button
 * @property {string} [classes.left = scroller-left scroller-button]
 * @property {string} [classes.right = scroller-right scroller-button]
 * @property {scrollerButtons} [texts] - Text content of each button
 * @property {string} [texts.left = ⮈]
 * @property {string} [texts.right = ⮊]
 * @property {scrollerButtons} [icons] - Icon classes to apply to a span inside each button
 * @property {scrollerButtons} [titles] - The title attribute for each button
 * @property {number[][]} [breakpoints = [ [0, 4], [768, 4], [992, 6], [1200, 8] ]]
 * An array of number pairs. Each array entry should be an array containing two numbers, the first representing 
 * a screen width in px and the second representing the number of scroller items to fit at that width and above 
 * (up to the width of the next pair).
 */

/**
 * The buttons available for configuration in the Scroller config object.
 * @typedef {object} scrollerButtons
 * @property {string} [left] The left/back button
 * @property {string} [right] The right/forward button
 */

/**
 * The default configuration for the Scroller.
 * @type scrollerConfig
 */
const defaultScrollerConfig = {
	classes: {
		left: 'scroller-left scroller-button',
		right: 'scroller-right scroller-button',
	},
	texts: {
		left: '⮈',
		right:'⮊',
	},
	icons: {
		left: '',
		right: '',
	},
	titles: {
		left: 'Scroll back',
		right: 'Scroll forward'
	},
	breakpoints: [ [0, 4], [768, 4], [992, 6], [1200, 8] ]
};

/**
 * Creates an image scroller from a list of images.
 */
class Scroller {
	
	/**
	 * @public
	 * @param {HTMLElement} el
	 * @param {scrollerConfig} [config = {}]
	 */
	constructor(el, config = {} ) {
		this._container = el;
		this._config = applyConfig(defaultScrollerConfig, config);		
		this._sizes();
		
		this._timerID = undefined;
		
		if(this._contentWidth > this._displayWidth) {
			this.create();
		}
	}
	
	/**
	 * Create the scroller after instantiation.
	 * @public
	 */
	create() {
		if (this._container.parentNode == this._wrapper && this._wrapper.style.overflow == 'hidden') return;		
		
		this._leftBtn = makeButton("left", this._config.classes.left, this._config.texts.left, this._config.titles.left, this._config.icons.left, this);
		this._rightBtn = makeButton("right", this._config.classes.right, this._config.texts.right, this._config.titles.right, this._config.icons.right, this);
		
		this._wrap();
		this._wrapper.style.overflow = "hidden";
		this._leftBtn.disabled = true;
		this._wrapper.append(this._leftBtn, this._rightBtn);
		this._container.style.left = "0px";

		//Recalculate sizes (wrapper changes width)
		this._sizes();
		
		window.addEventListener('resize', this);
		
		const swipe = new Swipe(this._wrapper);
		swipe.attach();
		this._wrapper.addEventListener('swiped-right', () => this.left() );
		this._wrapper.addEventListener('swiped-left', () => this.right() );
	}
	
	/**
	 * @protected
	 * @parameter {Event} e
	 * @todo On resize, check if current scroll position is greater than the new maximum and reduce it.
	 */
	handleEvent(e) {
		if (e.type === "click") this[e.currentTarget.id.replace("btn-","")](e);
		
		if (e.type === "resize") {
			if (this._timerID === undefined) {
				this._timerID = setTimeout(
					() => {
						this._sizes();
						this._timerID = undefined;
					},
					500);
			}
		}
	}

	/**
	 * Destroy the scroller.
	 * @public
	 */
	destroy() {
		this._container.style.left = "0px";
		this._leftBtn.remove();
		this._rightBtn.remove();
		window.removeEventListener("resize", this._resizeHandler);
		this._unwrap();
	}
	
	/**
	 * Scroll to the left.
	 * @public
	 */
	left() {
		this._setBtnStatus(this.scroll(false));
	}
	
	/**
	 * Scroll to the right.
	 * @public
	 */
	right() {
		this._setBtnStatus(this.scroll(true));
	}
	
	/**
	 * Set the active/disabled status of the scroller buttons depending on the scroll position.
	 * @protected
	 * @param {number} pos
	 */
	_setBtnStatus(pos) {
		this._leftBtn.disabled = pos === 0;
		this._rightBtn.disabled = pos === -this._maxScroll;
	}
	
	/**
	 * Scroll in the provided direction and return the pixel offset from origin after scrolling.
	 * @public
	 * @param {boolean} [forward = true] Scroll forward (true) or back (false)
	 * @return {number} The pixel offset
	 */
	scroll(forward = true) {
		const current = parseInt(this._container.style.left);
		const change = forward ? -this._step : this._step;
		let scrollTo = current + change;
		
		//We're back at the start.
		if (scrollTo > 0) scrollTo = 0;
		
		//We're at the end.
		if (scrollTo < -this._maxScroll) scrollTo = -this._maxScroll;
		
		//If stepping back from the end and the scroller has a partial-length last step,
		//only step back by that partial step.
		if (!forward && this._rightBtn.disabled) scrollTo = current + (this._maxScroll % this._step);
		
		this._container.style.left = scrollTo + "px";
		
		console.log(`Scrolling. Starting position: ${current}; New position: ${scrollTo}; Step size: ${this._step}; Display width: ${this._displayWidth}; Content width: ${this._contentWidth}; Max scroll: ${this._maxScroll}`);
		return scrollTo;
	}
	
	/**
	 * Add the wrapper element around the scroller.
	 * @protected
	 */
	_wrap() {
		const parent = document.createElement("div");
		parent.classList.add("scroller-wrapper");
		this._container.parentNode.insertBefore(parent, this._container);
		parent.append(this._container);
		this._wrapper = parent;
	}
	
	/**
	 * Remove the wrapper element around the scroller.
	 * @protected
	 */
	_unwrap() {
		this._wrapper.parentNode.insertBefore(this._container, this._wrapper.previousSibling);
		this._wrapper.remove();
	}
	
	/**
	 * Set the size properties and number of scroller items shown depending on screen size.
	 * @protected
	 */
	_sizes() {
		//Set number per row based on screen width
		const w = window.innerWidth;
		const count = this._checkBreakpoint(w, this._config.breakpoints);
		this._setFlexBasis(count);
		
		let comp = window.getComputedStyle(this._container);		
		const padding = parseInt(comp.getPropertyValue('padding-left')) + parseInt(comp.getPropertyValue('padding-right'));

		this._contentWidth = this._container.scrollWidth - padding;
		this._displayWidth = this._container.offsetWidth - padding;
		this._itemWidth = this._container.querySelector("li").offsetWidth;
		this._maxScroll = this._contentWidth - this._displayWidth;
		this._perStep = Math.floor(this._displayWidth / this._itemWidth);
		this._step = this._itemWidth * this._perStep;
	}
	
	/**
	 * Check which breakpoint applies to the given width
	 * @protected
	 * @param {number} w - The width in pixels to check
	 * @param {number[][]} breakpoints - The array of breakpoint configurations
	 * @return {number} The number of items to show at the given width
	 */
	_checkBreakpoint(w, breakpoints) {		
		for (let i = 0; i < breakpoints.length; i++) {
			if(breakpoints[i][0] <= w && (i == breakpoints.length - 1 || breakpoints[i+1][0] > w)) return breakpoints[i][1];
		}
	}
	
	/**
	 * Set the flex basis of the scroller items to show the given number.
	 * @protected
	 * @param {number} x - The number of items to show per width
	 */
	_setFlexBasis(x) {
		if (isNaN(x)) throw new Error(`Invalid number provided for row count: ${x}`);
		
		const items = this._container.querySelectorAll(".scroller li");
		const basis = Math.round(10000 * 100/(x+0.25) / 10000);
		
		for (const item of items) {
			item.style.flexBasis = basis + "%";
		}
	}
}

/**
 * The configuration object for the ImageViewer.
 * @typedef {object} imageViewerConfig
 * @property {string} [targetClass = viewer]
 * @property {function|null} [panzoom = null]
 * If the Panzoom function is passed, activate the zoom button, which toggles the image's full size and allows panning around.
 * Requires @panzoom/panzoom module to be available.
 * @property {boolean} [showDownload = false] Show a button to download the image
 * @property {boolean} [showLink = true] Show a link button for any images with a link associated
 * @property {Array} [captions = [ "& + figcaption", "& + .caption" ]] CSS selectors for the captions. '&' will be replaced with the automatically assigned ID of the anchor around the image. If ':scope' is included, the selector scope is the `<img>` grandparent.
 * @property {imageViewerButtons} [texts] The inner text of the buttons
 * @property {string} [texts.cue = ⨁]
 * @property {string} [texts.hide = ⓧ]
 * @property {string} [texts.download = ⮋]
 * @property {string} [texts.prev = ⮈]
 * @property {string} [texts.next = ⮊]
 * @property {string} [texts.reveal = ᴑ]
 * @property {string} [texts.revealActive = ᴓ]
 * @property {string} [texts.link = ⛓]
 * @property {string} [texts.zoom = 🞕]
 * @property {string} [texts.zoomActive = 🞔]
 * @property {imageViewerButtons} [icons = {}] Classes to add to a span inside each button (for icon display)
 * @property {imageViewerButtons} [titles] Strings to include as title attributes for each button
 * @property {string} [titles.cue]
 * @property {string} [titles.hide = Close]
 * @property {string} [titles.download = Download this image]
 * @property {string} [titles.prev = Previous image]
 * @property {string} [titles.next = Next image]
 * @property {string} [titles.reveal = Reveal image]
 * @property {string} [titles.revealActive = Re-hide image]
 * @property {string} [titles.link = More information]
 * @property {string} [titles.zoom = Enlarge image (drag to move the image around)]
 * @property {string} [titles.zoomActive = Reset image to fit screen] 
 * @property {string} [titles.zoomDisabled = Zoom disabled (the image is already full size)]
 */

/**
 * The available buttons which can be set in the Image Viewer configuration.
 * Note that reveal and zoom have additional 'active' states, and zoom also has a 'disabled' state.
 * @typedef {object} imageViewerButtons
 * @property {string} [cue] - The cue shown when hovering over an image to indicate the viewer is available.
 * @property {string} [hide] - The button to hide/close the viewer
 * @property {string} [download] - The button to download the current image in the viewer
 * @property {string} [prev] - The button to show the previous image
 * @property {string} [next] - The button to show the next image 
 * @property {string} [reveal] - The button to reveal a blurred image
 * @property {string} [revealActive] - The button to hide turn off reveal - i.e. re-blur the image.
 * @property {string} [link] - The button for the image's link
 * @property {string} [zoom] - The button to zoom the image to full size and activate panning
 * @property {string} [zoomActive] - Properties for the zoom button when it's active
 * @property {string} [zoomDisabled] - Properties for the zoom button when it's disabled
 */

/**
 * The default image viewer configuration.
 * @type imageViewerConfig
 */
const defaultImageViewerConfig = {
	targetClass: "viewer",
	panzoom: null,
	showDownload: false,
	showLink: true,
	captions: [ "& + figcaption", "& + .caption" ],
	texts: {
		cue: "⨁",
		hide: "ⓧ",
		download: "⮋",
		prev: "⮈",
		next: "⮊",
		reveal: "ᴑ",
		revealActive: "ᴓ",
		link: "⛓",
		zoom: "🞕",
		zoomActive: "🞔",
	},
	icons: {
		cue: "",
		hide: "",
		download: "",
		prev: "",
		next: "",
		reveal: "",
		revealActive: "",
		link: "",
		zoom: "",
		zoomActive: "",
	},
	titles: {
		cue: "",
		hide: "Close",
		download: "Download this image",
		prev: "Previous image",
		next: "Next image",
		reveal: "Reveal image",
		revealActive: "Blur image",
		link:  "More information",
		zoom: "Enlarge image (drag to move the image around)",
		zoomActive: "Reset image to fit screen",
		zoomDisabled: "Zoom disabled (the image is already full size)",
	}
};

/**
 * Creates an image viewer overlay.
 * @public
 * @param {imageViewerConfig} [config = defaultImageViewerConfig]
 */
class ImageViewer {

	constructor(config = {}) {
		this._config = applyConfig(defaultImageViewerConfig, config);
		this._images = document.querySelectorAll('img.' + this._config.targetClass);
	}
	
	/**
	 * Create the viewer.
	 * This method should be called after instantiation to activate the viewer.
	 * @public
	 */
	create() {
		this._setupImages();
		this._createOverlay();
	}
	
	/**
	 * Show the next image.
	 * @public
	 */
	next() {
		if (this._images.length < 2) return;
		const n = this._activeIndex === this._images.length - 1 ? 0 : this._activeIndex + 1;
		this.show(n);
	}
	
	/**
	 * Show the previous image.
	 * @public
	 */
	prev() {
		if (this._images.length < 2) return;
		const n = this._activeIndex === 0 ? this._images.length - 1 : this._activeIndex - 1;
		this.show(n);
	}
	
	/**
	 * Hide the viewer and return to the page.
	 * @public
	 */
	hide() {
		if (this._active) {
			this._overlay.style.display = "none";
			document.body.style.overflow = "visible";
			this._overlay.blur();
			this._active = false;
		}
	}
	
	/**
	 * Show the viewer with the image specified by the given index
	 * @public
	 * @param {number} [n = 0] Index of image to show
	 */
	show(n = 0) {
		if (!this._active) {
			this._overlay.style.display = "block";
			document.body.style.overflow = "hidden";
			this._overlay.focus();
			this._active = true;
		}
		
		if (Number.isInteger(n)) this._showImage(n);
	}
	
	/**
	 * @protected
	 */
	handleEvent(e) {
		if (e.type == "click") this[e.currentTarget.id.replace("btn-","")](e);
	}
	
	/**
	 * Switch the viewer to display the image specified by the index
	 * @protected
	 * @param {number} n The index number of the image to display
	 */
	async _showImage(n) {
		const img = this._images[n];
		const el = this._imgDisplay;
		const path = img.dataset.full ?? img.src;
		this._activeIndex = n;
		
		//If panzoom is still on for last image, switch it off
		if (this._config.panzoom && el.classList.contains("pan")) { 
			this.btnToggle(document.getElementById("btn-zoom"), false);
			this.zoomToggle(false);
		}
		
		this._loader.style.visibility = "visible";
		this._resetImage();
		el.dataset.loading = path;
		
		const url = await this._loadImage(path);
		
		//Prevent jumping back if display has moved on to another image before this one is loaded.
		if(el.dataset.loading == url) {
			//Put the loaded image into the visible <img> element.
			//The promise is awaited again to prevent the controls update checking the width before the image is in position.
			await this._loadImage(url, this._imgDisplay);
			el.alt = img.getAttribute("alt");
			this._loader.style.visibility = "hidden";
			this._updateCaption(n);
			this.revealToggle(!Object.hasOwn(img.dataset, "reveal") || !img.dataset.reveal == 'true');
			this._updateControls();
		}
	}
	
	/**
	 * Load the image and return a promise that resolves when complete.
	 * @protected
	 * @param {string} url The image source
	 * @param {HTMLImageElement} [i = new Image()] The image element in which to load the image. If unspecified a new Image is created on the DOM.
	 * @return Promise
	 */
	_loadImage(url, i = new Image()) {
		return new Promise((resolve) => {
			i.addEventListener('load', () => { resolve(url); });
			i.src = url;
			i.dataset.loading = null;
		});
	}
	
	/**
	 * Empty the overlay display image and remove its alt and caption.
	 * @protected
	 */
	_resetImage() {
		this._imgDisplay.src = "";
		this._imgDisplay.alt = "";
		this._overlay.querySelector(".caption").style.display = "none";
	}
	
	/**
	 * Set the overlay caption for the given image number.
	 * The caption will be determined with this order of priority:
	 * 1. The content of the element matched by `data-caption-id` attribute
	 * 2. The content of the `data-caption` attribute
	 * 3. The content of elements matching config.captions. Note: multiple matches will be concatenated.
	 * 
	 * @protected
	 * @param {number} n The number of the image from which to take the caption.
	 */
	_updateCaption(n) {
		const caption = this._overlay.querySelector(".caption");
		caption.textContent = '';
		
		//First use the selectors
		const scope = this._images[n].parentNode.parentNode; //The element which contains the .viewer-wrap anchor
		for (let selector of this._config.captions) {
			let node;
			selector = selector.replace("&", `#iv-${n}`);
			if (selector.includes(":scope")) {
				selector.replace(":scope", "");
				node = scope.querySelector(selector);
			} else {
				node = document.querySelector(selector);
			}
			if (node) caption.textContent += node.textContent;
		}
		
		//Caption in data-caption attribute
		if (this._images[n].dataset.caption) {
			caption.textContent = this._images.dataset.caption;
		}
		
		//Caption element ID in data-caption-id attribute
		if (this._images[n].dataset.captionId && document.querySelector('#' + this._images[n].dataset.captionId)) {
			caption.textContent = document.querySelector('#' + this._images[n].dataset.captionId).textContent;
		}
		
		if (caption.textContent !== '') {
			caption.style.display = "block";
		} else {
			caption.style.display = "none";
		}
	}
	
	/** 
	 * Handle click events for toggling the panzoom status
	 * @protected
	 * @param {HTMLElement} e The click event
	 */
	zoom(e) {
		const state = !this._imgDisplay.classList.contains("pan");		
		this.zoomToggle(state);
		this.btnToggle(e.currentTarget, state);		
		e.currentTarget.classList.toggle("zoomed");
	}
	
	/** 
	 * Handle click events for toggling the reveal status
	 * @protected
	 * @param {HTMLElement} e The click event
	 */
	reveal(e) {
		const state = this._imgDisplay.style.filter.includes("blur");
		this.revealToggle(state);
		this.btnToggle(e.currentTarget, state);
	}
	
	/**
	 * Toggle the specified button on or off as specified
	 * @protected
	 * @param {boolean} [switchOn = true]
	 */
	btnToggle(btn, switchOn = true) {
		const btnName = btn.id.replace("btn-", "");
		let btnTextNode = [...btn.childNodes].filter( n => n.nodeType === Node.TEXT_NODE)[0];
		const txt = switchOn ? this._config.texts[`${btnName}Active`] : this._config.texts[btnName];
		const icon = switchOn ? this._config.icons[`${btnName}Active`] : this._config.icons[btnName];
		const title = switchOn ? this._config.titles[`${btnName}Active`] : this._config.titles[btnName];
		
		if (txt) {
			if(!btnTextNode) {
				btnTextNode = document.createTextNode();
				btn.append(btnTextNode);
			}
			btnTextNode.textContent = txt;
		}
		
		if (icon) btn.querySelector("span").className = icon;
		btn.setAttribute("title", title);
	}
	
	/**
	 * Set the panzoom status 
	 * @public
	 * @param {boolean} [switchOn = true]
	 */
	zoomToggle(switchOn = true) {
		const pz = this._pzInstance;
		
		if (switchOn) {
			//Turn off swipe actions when zoomed to prevent over-riding Panzoom movements
			this._swipe.detach();
			this._imgDisplay.classList.add("pan");
			pz.bind();
			pz.setStyle("cursor", "move");
			return;
		}
		this._swipe.attach();
		this._imgDisplay.classList.remove("pan");
		pz.reset({ animate: false });
		pz.setStyle("cursor", "auto");
		pz.destroy();
	}
	
	/**
	 * Set the reveal state.
	 * @public
	 * @param {boolean} [reveal = true]
	 */
	revealToggle(reveal = true) {
		const caption = this._overlay.querySelector(".caption");
		
		if (reveal) {
			this._imgDisplay.style.filter = "";
			caption.style.color = "";
		} else {
			this._imgDisplay.style.filter = "blur(1em)";
			caption.style.color = getComputedStyle(caption).getPropertyValue('background-color');
		}
	}

	/**
	 * Create the overlay and insert in the document
	 * @protected
	 */
	_createOverlay() {
		const imgWrap = document.createElement("div");
		imgWrap.classList.add("image-wrap");
		
		const loader = document.createElement("div");
		loader.classList.add("loader");
		imgWrap.append(loader);
		
		const activeImg = document.createElement("img");
		// activeImg.addEventListener("load", () => this._updateControls());
		imgWrap.append(activeImg);
		
		
		const caption = document.createElement("div");
		caption.classList.add("caption");
		
		const overlay = document.createElement("div");
		overlay.id = "overlay";
		overlay.style.display = "none";
		overlay.setAttribute("tabindex", -1);
		overlay.append(imgWrap);
		overlay.append(caption);
		overlay.append(this._createControls());
		overlay.addEventListener("keydown", (e) => this._shortcutsEventListener(e));
		
		this._swipe = new Swipe(imgWrap);
		this._swipe.attach();
		imgWrap.addEventListener('swiped-right', () => this.prev() );
		imgWrap.addEventListener('swiped-left', () => this.next() );
		imgWrap.addEventListener('swiped-up', () => this.hide() );
				
		this._overlay = overlay;
		this._imgDisplay = activeImg;
		this._caption = caption;
		this._loader = loader;
		this._active = false;
				
		document.body.append(this._overlay);
		
		//Instantiate panzoom if needed
		if (typeof this._config.panzoom === "function") {
			this._pzInstance = this._pzInstance ?? this._config.panzoom(this._imgDisplay, { disableZoom: true, noBind: true });
			//Even though only instantiated, the classes are set so we do a full switch off for the initial state
			this.zoomToggle(false);
		}
	}
	
	/**
	 * Setup the images on the page for activating the viewer.
	 * @protected
	 */
	_setupImages() {
		for (const [i, img] of this._images.entries()) {
			
			let wrap = img.parentElement;
			
			if (wrap.tagName !== "A") {
				wrap = document.createElement("a");
				img.parentElement.insertBefore(wrap, img);
				wrap.append(img);
			}
			
			wrap.id = `iv-${i}`;
			wrap.classList.add("viewer-wrap");
			
			const cue = document.createElement("div");
			cue.classList.add("cue");
			cue.textContent = this._config.texts.cue;
			if (this._config.icons.cue) {
				this._insertIcon(this._config.icons.cue, cue);
			}
			wrap.append(cue);
			
			wrap.addEventListener("click",
				e => {
					e.preventDefault();
					this.show(i);
				}
			);
		}
	}
	
	/**
	 * Create the viewer controls.
	 * @protected
	 * @return {HTMLElement}
	 */
	_createControls() {
		const controls = document.createElement("nav");
		controls.classList.add("image-viewer-controls");
		controls.setAttribute("aria-label", "Image Viewer Controls");
		
		const btns = [ "hide" ];
		if (this._images.length > 1) {
			btns.push("next", "prev");
		}
		btns.push("reveal");
		
		const anchors = [ "download", "link" ];
		
		for (const b of btns) {
			controls.append(makeButton(b, "", this._config.texts[b], this._config.titles[b], this._config.icons[b], this));
		}
		
		if (typeof this._config.panzoom === "function") {
			controls.append(makeButton("zoom", "", this._config.texts.zoom, this._config.titles.zoom, this._config.icons.zoom, this));
		} else {
			console.log(`No Panzoom: ${typeof this._config.panzoom}`);
			console.log(this._config.panzoom);
		}
		
		for (const a of anchors) {
			if (this._config[`show${a.charAt(0).toUpperCase() + a.slice(1)}`]) {
				controls.append(makeButton(a, "", this._config.texts[a], this._config.titles[a], this._config.icons[a], undefined, "a"));
			}
		}		
		return controls;
	}
	
	/**
	 * Update the viewer controls based on the currently shown image.
	 * @protected
	 */
	_updateControls() {
		const img = this._imgDisplay;
		const i = this._activeIndex;
		
		if (this._config.showDownload) {
			const dl = document.getElementById("btn-download");
			dl.href = img.src;
			dl.setAttribute("download", "");
		}
		
		if (this._config.showLink) {
			const btnLink = document.getElementById("btn-link");
			const link = this._images[i].dataset.link ? this._images[i].dataset.link : this._images[i].parentElement.href;
			if (link) {
				btnLink.href = link;
				btnLink.style.display = "block";
			} else {
				btnLink.removeAttribute("href");
				btnLink.style.display = "none";
			}
		}
		
		const btnReveal = document.getElementById("btn-reveal");
		if (this._images[i].dataset.reveal == 'true') {
			btnReveal.style.display = "block";
		} else {
			btnReveal.style.display = "none";
		}
			
		
		if (typeof this._config.panzoom === "function") {
			const btnZoom = document.getElementById("btn-zoom");
			if(img.width < img.naturalWidth) {
				btnZoom.disabled = false;
				btnZoom.setAttribute("title", this._config.titles.zoom);
			} else {
				btnZoom.disabled = true;
				btnZoom.setAttribute("title", this._config.titles.zoomDisabled);
			}
		}
	}
	
	/**
	 * Event listener for keyboard shortcuts
	 * @protected
	 * @param {Event} e
	 */
	_shortcutsEventListener(e) {
		const keys = {
			"Escape": "hide",
			"ArrowLeft": "prev",
			"ArrowRight": "next"
		};
		if (Object.hasOwn(keys, e.key) && typeof this[keys[e.key]] === "function") {
			e.preventDefault();
			this[keys[e.key]]();
		}
	}
	
	/**
	 * Insert an icon (<span>) with the given classes into the given element
	 * @protected
	 * @param {string} classes
	 * @param {HTMLElement} element
	 */
	_insertIcon(classes, element) {
		const i = document.createElement("span");
		i.classList.add(...classes.split(" "));
		element.append(i);
	}
}

/** 
 * A simple animated visibility toggler.
 * @public
 * @param {HTMLElement} source The element which triggers the toggle, e.g. a `<button>`
 * @param {HTMLElement|null} [target = null] The element of which to toggle the visibility.
 * 						If omitted, the `data-toggle-target` attribute of the source will be checked for an ID.
 * 						If neither is provided, an error is thrown.
 * @param {string} [toggleText = ''] The replacement text for the source when its state is toggled.
 * 						If omitted, the `data-toggle-text` attribute of the source will be used.
 * 						If neither is provided, the source text remains static.
 */
class Toggler {
	
	constructor(source, target = null, toggleText = null) {
		this._source = source;
		try {
			this._target = ( target instanceof HTMLElement ? target : document.getElementById(source.dataset.toggleTarget) );
		} catch {
			throw new Error(`Invalid target set. The target element must be provided either directly or with a data attribute`);
		}
		this._target.classList.add('toggle-view');
		
		try {
			this._toggleText = ( toggleText ? toggleText : source.dataset.toggleText );
		} catch {
			console.log("No toggle text");
		}
		this._sourceTextTarget = ( this._source.querySelector(".toggle-text") ? this._source.querySelector(".toggle-text") : this._source );
		this._origText = this._sourceTextTarget.textContent;
		
		this._source.addEventListener("click", () => this.toggle() );
	}
	
	/**
	 * Toggle the state of the target.
	 * @public
	 */
	toggle() {
		if (this._target.classList.contains('visible')) {
			this.hide();
			return;
		}
		this.show();
	}
	
	/**
	 * Show the target.
	 * @public
	 */
	show() {
		const target = this._target;
		const height = this._checkHeight(target);
		
		if (this._toggleText) this._sourceTextTarget.textContent = this._toggleText;
		
		target.classList.add("visible");
		target.style.height = height;
		
		setTimeout( () => target.style.height = '', 250);
	}
	
	/**
	 * Hide the target.
	 * @public
	 */
	hide() {
		const target = this._target;
		
		if (this._toggleText) this._sourceTextTarget.textContent = this._origText;
		
		target.style.height = target.scrollHeight + "px";
		setTimeout( () => target.style.height = 0, 1);
		setTimeout( () => target.classList.remove("visible"), 250);
	}
	
	/**
	 * Check the auto height of an element.
	 * @protected
	 * @param {HTMLElement} el
	 */
	_checkHeight(el) {
		el.style.display = 'block';
		const h = el.scrollHeight + "px";
		el.style.display = '';
		return h;
	}
}

export { ImageViewer, Scroller, Toggler };
