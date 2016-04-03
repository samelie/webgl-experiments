module.exports = {

	/*
	Test for webgl support
	@return Boolean
	*/
	hasWebgl() {
		try {
			var canvas = document.createElement('canvas');return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
		} catch (e) {
			return false;
		}
	},

	/*
	Map a float from a range to a range
	@param Number value
	@param Number in_min
	@param Number in_max
	@param Number out_min
	@param Number out_max
	@return Number
	*/
	mapFloat(value, in_min, in_max, out_min, out_max) {
		return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
	},

	/*
		Reduce the rotation between 0 - Math.PI*2
		@param Number rotation
		@return Number
	*/
	normalizeRotation(rotation) {

		const maxRotation = Math.PI * 2
		const div = rotation / maxRotation
		const intToSubtract = Math.floor( rotation / maxRotation )
		return rotation -= intToSubtract * maxRotation
	},

	lerp(min, max, alpha) {
		return min + ((max - min) * alpha)
	}
}