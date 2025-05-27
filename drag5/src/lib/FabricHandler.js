import { Gesture } from '@use-gesture/vanilla';
import Vec from '@tldraw/vec';

const MIN_ZOOM = 0.6;
const MAX_ZOOM = 2.5;

function FabricHandler(opts) {
	// safeguard against being called without new
	if (!(this instanceof FabricHandler)) {
		return new FabricHandler(opts);
	}

	this.fabricEl = opts.fabricEl;
	this.center = [0, 0];
	this.zoom = 1.0;
	this._originPoint = null;
	this._delta = [0, 0];
	this._lastMovement = 1;
	this.callbacks = new Set();

	const that = this;

	this._handleDrag = (state) => {
		if (state.delta[0] === 0 && state.delta[1] === 0 && state.elapsedTime < 200)
			return;
		that.center = Vec.add(Vec.div(state.delta, that.zoom), that.center);
		that._moved(state);
	};

	// this._handlePointerdown = (state) => {
	// 	that._moved(state);
	// };

	this._handlePinchStart = ({ origin, event }) => {
		if (event instanceof WheelEvent) return;

		this.isPinching = true;
		this._originPoint = origin;
		this._delta = [0, 0];
		this._lastMovement = 1;
		this._moved();
	};

	this._handlePinch = ({ origin, movement, event }) => {
		if (event instanceof WheelEvent) return;

		if (!this._originPoint) return;
		const delta = Vec.sub(this._originPoint, origin);
		const trueDelta = Vec.sub(delta, this._delta);
		this._delta = delta;

		const zoomLevel = movement[0] / this._lastMovement;
		this._lastMovement = movement[0];

		this.center = Vec.add(this.center, Vec.div(trueDelta, this.zoom * 2));
		this.zoom = Vec.clamp(this.zoom * zoomLevel, MIN_ZOOM, MAX_ZOOM);
		this._moved();
	};

	this._handlePinchEnd = () => {
		this.isPinching = false;
		this._originPoint = undefined;
		this._delta = [0, 0];
		this._lastMovement = 1;
		this._moved();
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
		onPinchStart: this._handlePinchStart,
		onPinch: this._handlePinch,
		onPinchEnd: this._handlePinchEnd
		// onPointerDown: that._handlePointerdown
	});
}

export default FabricHandler;
