const utils = require('./utils')
import THREE from 'three'
import CameraControls from './camera-controls';
require('./lib/three-orbit-controls')(THREE);
require('./lib/three-gyro-controls')(THREE);
require('./lib/three-css3d-renderer')(THREE);

module.exports = class WebglStreetView {

	/*
 	@public
 	Initialise a WebglStreetView instance
 	@param Element element
 	@param Object settings
 */
	constructor(element, settings) {

		// Test for webgl support
		if (!utils.hasWebgl()) {
			throw 'WebglStreetView: webgl not supported'
			return
		}

		// Check if the element is defined
		if (element === undefined) throw 'WebglStreetView: Container element needs to be set'

		this.element = element
		this.settings = settings
		this._width = this.settings.width
		this._height = this.settings.height

		// Setup webgl
		this._renderers = {
			webgl: new THREE.WebGLRenderer({
				antiAlias: true
			})
		}

		this._renderers.webgl.setPixelRatio(window.devicePixelRatio || 1)
		this._renderers.webgl.setSize(this.settings.width, this.settings.height)

		this._renderers.webgl.domElement.classList.add('webgl-renderer')

		this.element.appendChild(this._renderers.webgl.domElement)

		this._cameras = {
			main: new THREE.PerspectiveCamera(this.settings.panoOptions.fov, this.settings.width / this.settings.height, 0.1, 10000)
		}

		this._zoom(this._cameras.main, .0001)

		this._scenes = {
			webgl: new THREE.Scene()
		}


		const activeCam = this._cameras.main

		// Controls
		this._controls = new THREE.OrbitControls(activeCam, this.element)
		this._controls.enablePan = false
		this._controls.enableZoom = false
		this._controls.autoRotate = false
		this._controls.invertControl = true

		this._onControlsChangeHandler = this._onControlsChange.bind(this)
		this._onControlsEndHandler = this._onControlsEnd.bind(this)

		// Only render the css3d scene when it changes
		this._controls.addEventListener('change', this._onControlsChangeHandler)
		this._controls.addEventListener('end', this._onControlsEndHandler)

		if (this.settings.debug) {
			this._controls.enablePan = true
			this._controls.enableZoom = true
		}

		// Gyro controls setup
		this._isDeviceOrientationAvailable = false
		this._isGyroEnabled = false

		if (!!window.DeviceOrientationEvent && Detector.IS_MOBILE || Detector.IS_TABLET) {
			this._isDeviceOrientationAvailable = true
			this._gyroControls = new THREE.DeviceOrientationControls(this._cameras.main)
		}

		if (!this.settings.panoOptions.draggable) this.disableTouchControls()

		// Pano
		const material = new THREE.MeshBasicMaterial({
			side: THREE.DoubleSide
		})

		this._sphere = new THREE.Mesh(new THREE.SphereGeometry(100, 40, 40), material)

		this._sphere.scale.x = -1
		this._scenes.webgl.add(this._sphere)

		// Markers
		this.markers = []

		this._update()
	}

	_applyStyles(element, styles) {
		for (let prop in styles) {
			element.style[prop] = styles[prop]
		}
	}

	/*
 	@public
 	Set the Point of View
 		heading ranges from 0 -> 360
 	where 90deg is east, 270deg is west
 		pitch ranges from 90 -> -90
 	where 0deg is the default, 90deg is straight up
 		@param Number heading
 	@param Number pitch
 */
	setPov(heading = 0, pitch = 0) {

		// this._controls

		// console.log(this._controls.lookAt );
		this._controls.setRotation(pitch, heading);

		// this._controls.pan(THREE.Math.degToRad(pitch), THREE.Math.degToRad(heading))

		// this._sphere.rotation.y = THREE.Math.degToRad(heading)
		// this._sphere.rotation.x = THREE.Math.degToRad(pitch)
	}

	/*
 	@public
 	Get the Point of View
 	@return Number
 */
	getPov() {
		return {
			heading: this._sphere.rotation.y,
			pitch: this._sphere.rotation.x
		}
	}

	/*
 	@public
 	Set the Zoom level
 	zoom ranges from 0 -> 5
 	@param Number zoom
 */
	setZoom(zoom = 0) {

		this._cameras.main.fov = utils.mapFloat(zoom, 0, 5, 100, 40)
		this._cameras.main.updateProjectionMatrix()
	}

	/*
 	@public
 	Get the Zoom level
 	@return Number
 */
	getZoom() {
		return utils.mapFloat(this._cameras.main.fov, 0, 5, 100, 40)
	}

	/*
 	@public
 	Enable gyro controls - mobile only
 */
	enableGyroControls() {

		if (this._isDeviceOrientationAvailable) {
			this._isGyroEnabled = true
			this._gyroControls.connect()
		}
	}

	/*
 	@public
 	Disable gyro controls - mobile only
 */
	disableGyroControls() {

		if (this._isDeviceOrientationAvailable) {
			this._isGyroEnabled = false
			this._gyroControls.disconnect()
		}
	}

	/*
 	@public
 	Enable touch controls
 */
	enableTouchControls() {
		this._controls.enabled = true
	}

	/*
 	@public
 	Disable touch controls
 */
	disableTouchControls() {
		this._controls.enabled = false
	}

	/*
 	@public
 	Set the size of the container
 	@param Number width
 	@param Number height
 */
	setSize(width, height) {
		this._width = width
		this._height = height
		this.resize()
	}

	/*
 	@public
 	Add markers
 	@param Array [,Marker] markers
 	@param String type
 */
	addMarkers(markers) {

		markers.forEach(marker => {
			this._scenes.css3d.add(marker.create())
		})

		this.markers = this.markers.concat(markers)

		this._renderCSS3D()
	}

	/*
 	@public
 	Remove all markers
 	@param Array [,Marker]
 */
	removeMarkers() {

		this.markers.forEach(marker => {
			marker.dispose()
			this._scenes.css3d.remove(marker.get())
		})
	}

	/*
 	@public
 	Load a pano texture and add markers
 	@param String texture - url to pano image
 	@param Array markers - array of [,Markers]
 	@return Promise
 */
	load(texture) {

		if (texture === undefined) throw 'WebglStreetView: texture not defined'

		return new Promise((resolve, reject) => {

			const loader = new THREE.TextureLoader()

			loader.load(texture, texture => {

				this._sphere.material.map = texture
				this._sphere.material.needsUpdate = true

				this.setPov()
				this._renderCSS3D()

				resolve()
			}, xhr => {

				// Progress
				// console.log( (xhr.loaded / xhr.total * 100) + '% loaded' )

			}, xhr => {

				// Error
				reject(`WebglStreetView: Failed to load texture ${ texture }`)
			})
		})
	}

	/*
 	@public
 	Resize the canvas
 */
	resize() {

		this._cameras.dev.aspect = this._width / this._height
		this._cameras.main.aspect = this._width / this._height

		this._cameras.dev.updateProjectionMatrix()
		this._cameras.main.updateProjectionMatrix()

		this._renderers.webgl.setSize(this._width, this._height)
		this._renderers.css3d.setSize(this._width, this._height)
	}

	/*
 	@private
 	Render webgl
 	@param THREE.Camera camera
 	@param Number left
 	@param Number bottom
 	@param Number width
 	@param Number height
 */
	_renderWebgl(camera, left, bottom, width, height) {

		left *= this._width
		bottom *= this._height
		width *= this._width
		height *= this._height

		this._renderers.webgl.setViewport(left, bottom, width, height)
		this._renderers.webgl.setScissor(left, bottom, width, height)
		this._renderers.webgl.setScissorTest(true)
		this._renderers.webgl.setClearColor(0xFFFFFF)
		this._renderers.webgl.render(this._scenes.webgl, camera)
	}

	_onControlsChange() {

		this.element.classList.add('controls__dragging')

		this._renderCSS3D()
	}

	_onControlsEnd() {

		this.element.classList.remove('controls__dragging')

		this.markers.forEach(marker => {
			marker.enable()
		})
	}

	_renderCSS3D(event) {
		this.markers.forEach(marker => {
			marker.disable()
		})
		this._renderers.css3d.render(this._scenes.css3d, this._cameras.main)
	}

	/*
 	@private
 	RAF update
 */
	_update() {

		this._rafId = requestAnimationFrame(this._update.bind(this))

		if (this._isDeviceOrientationAvailable && this._isGyroEnabled) {
			this._gyroControls.update()
		}

		if (this.settings.debug) {
			this._renderWebgl(this._cameras.dev, 0, 0, 1, 1)
			this._renderWebgl(this._cameras.main, 0, 0, 0.25, 0.25)
		} else {
			this._renderWebgl(this._cameras.main, 0, 0, 1, 1)
		}
	}

	/*
		@private
		Camera default zoom helper
	*/
	_zoom(camera, zoom) {
		camera.position.set(1 * zoom, 0.75 * zoom, 1 * zoom);
		camera.lookAt(new THREE.Vector3());
	}

	/*
 	@public
 	Dispose any internals for GC
 */
	dispose() {

		window.cancelAnimationFrame(this._rafId)

		this.disableGyroControls()

		this.removeMarkers()

		this._scenes.webgl.children.forEach(child => {
			this._scenes.webgl.remove(child)
		})

		this._scenes.css3d.children.forEach(child => {
			this._scenes.css3d.remove(child)
		})

		this._controls.removeEventListener('change', this._onControlsChangeHandler)
		this._controls.removeEventListener('end', this._onControlsEndHandler)

		// http://stackoverflow.com/questions/21453309/how-can-i-destroy-threejs-scene
		this._renderers.webgl.domElement.addEventListener('dblclick', null, false)
		this._renderers.webgl.domElement = null

		this._renderers.css3d.domElement.addEventListener('dblclick', null, false)
		this._renderers.css3d.domElement = null

		this._sphere = null
		this._renderers.webgl = null
		this._renderers.css3d = null
		this._scenes.webgl = null
		this._scenes.css3d = null

		this.element.innerHTML = ''
	}
}