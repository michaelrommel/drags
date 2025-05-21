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

	this._handleDrag = (state) => {
		if (state.delta[0] === 0 && state.delta[1] === 0 && state.elapsedTime < 200)
			return;
		that.center = Vec.sub(that.center, Vec.div(state.delta, that.zoom));
		that._moved(state);
	};

	this._handlePointerdown = (state) => {
		that._moved(state);
	};

	this._moved = (state) => {
		for (const callback of that.callbacks) {
			callback(state);
		}
	};

	this.onMove = (callback) => {
		that.callbacks.add(callback);
		return () => that.callbacks.delete(callback);
	};

	this.gest = new Gesture(opts.fabricEl, {
		onDrag: that._handleDrag,
		onPointerDown: that._handlePointerdown
	});
}

export default FabricHandler;
