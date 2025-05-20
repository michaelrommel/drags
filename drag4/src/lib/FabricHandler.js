import { Gesture } from '@use-gesture/vanilla';
import Vec from '@tldraw/vec';

function FabricHandler(opts) {
	// safeguard against being called without new
	if (!(this instanceof FabricHandler)) {
		return new FabricHandler(opts);
	}

	this.fabricEl = opts.fabricEl;
	this.center = [0, 0];
	this.zoom = 1.0;
	this.callbacks = new Set();

	const that = this;

	console.log(opts.fabricEl);

	this._handleDrag = ({ delta, elapsedTime }) => {
		if (delta[0] === 0 && delta[1] === 0 && elapsedTime < 200) return;
		that.center = Vec.sub(that.center, Vec.div(delta, that.zoom));
		that._moved();
	};

	this._moved = (manual = true) => {
		for (const callback of that.callbacks) {
			callback(manual);
		}
	};

	this.onMove = (callback) => {
		that.callbacks.add(callback);
		return () => that.callbacks.delete(callback);
	};

	this.gest = new Gesture(opts.fabricEl, { onDrag: that._handleDrag });
}

export default FabricHandler;
