module.exports = function (THREE) {
	THREE.DeviceOrientationControls = function (object) {

		var scope = this;

		this.object = object;
		this.object.rotation.reorder("YXZ");

		this.enabled = true;

		this.deviceOrientation = {};
		this.screenOrientation = 0;

		var _alpha = 0;

		var changeEvent = {
			type: 'change'
		};

		this.onDeviceOrientationChangeEvent = function (event) {
			scope.deviceOrientation = event;
			if (scope.enabled === false) return;
		};

		this.onScreenOrientationChangeEvent = function () {
			scope.screenOrientation = window.orientation || 0;
			if (scope.enabled === false) return;
		};

		// The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

		var setObjectQuaternion = function () {

			var zee = new THREE.Vector3(0, 0, 1);

			var euler = new THREE.Euler();

			var q0 = new THREE.Quaternion();

			var q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis

			return function (quaternion, alpha, beta, gamma, orient) {

				euler.set(beta, alpha, -gamma, 'YXZ'); // 'ZXY' for the device, but 'YXZ' for us

				quaternion.setFromEuler(euler); // orient the device

				quaternion.multiply(q1); // camera looks out the back of the device, not the top

				quaternion.multiply(q0.setFromAxisAngle(zee, -orient)); // adjust for screen orientation
			};
		}();

		this.connect = function () {

			this.onScreenOrientationChangeEvent(); // run once on load

			window.addEventListener('orientationchange', this.onScreenOrientationChangeEvent, false);
			window.addEventListener('deviceorientation', this.onDeviceOrientationChangeEvent, false);

			scope.enabled = true;
		};

		this.disconnect = function () {

			window.removeEventListener('orientationchange', this.onScreenOrientationChangeEvent, false);
			window.removeEventListener('deviceorientation', this.onDeviceOrientationChangeEvent, false);

			scope.enabled = false;
		};

		this.update = function () {

			if (scope.enabled === false) return;

			var alpha = scope.deviceOrientation.alpha ? THREE.Math.degToRad(scope.deviceOrientation.alpha) : 0; // Z
			var beta = scope.deviceOrientation.beta ? THREE.Math.degToRad(scope.deviceOrientation.beta) : 0; // X'
			var gamma = scope.deviceOrientation.gamma ? THREE.Math.degToRad(scope.deviceOrientation.gamma) : 0; // Y''
			var orient = scope.screenOrientation ? THREE.Math.degToRad(scope.screenOrientation) : 0; // O
			/*if(Math.abs(_alpha - alpha) < 0.005){
   	return;
   }*/
			_alpha = alpha;

			setObjectQuaternion(scope.object.quaternion, alpha, beta, gamma, orient);
		};

		this.dispose = function () {

			this.disconnect();
		};
	};

	THREE.DeviceOrientationControls.prototype = Object.create(THREE.EventDispatcher.prototype);
	THREE.DeviceOrientationControls.prototype.constructor = THREE.DeviceOrientationControls;
};