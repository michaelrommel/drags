<script>
	import { onMount, createEventDispatcher } from "svelte";
	import { fade } from "svelte/transition";

	import FabricHandler from "./FabricHandler.js";
	import { slide } from "./slide.js";

	const OFFSET_LEFT_CSS = "50px";
	const OFFSET_TOP_CSS = "100px";
	const OFFSET_TRANSFORM_ORIGIN_CSS = `calc(-1 * ${OFFSET_LEFT_CSS}) calc(-1 * ${OFFSET_TOP_CSS})`;

	/** Returns the mouse position in infinite grid coordinates, offset transformations and zoom. */
	function normalizePosition(event) {
		// const [ox, oy] = getConstantOffset();
		let ox = 50;
		let oy = 100;
		return [
			Math.round(center[0] + event.pageX / zoom - ox),
			Math.round(center[1] + event.pageY / zoom - oy),
		];
	}

	let fabricEl;
	let fabric;
	let center = [0, 0];
	let zoom = 1.0;
	let moving = -1; // are we moving
	let movingOrigin = [0, 0]; // Coordinates of mouse at origin when drag started.
	let movingSize = { x: 0, y: 0, rows: 24, cols: 80 }; // New [x, y] position of the dragged terminal.
	let movingIsDone = false; // Moving finished but hasn't been acknowledged.

	onMount(() => {
		console.log(fabricEl);
		fabric = new FabricHandler({ fabricEl });
		fabric.onMove(() => {
			console.log(`onMove in: ${center}/${zoom}`);
			center = fabric.center;
			zoom = fabric.zoom;
			console.log(`onMove out: ${center}/${zoom}`);
		});
	});

	onMount(() => {
		function handleMouse(event) {
			if (moving !== -1 && !movingIsDone) {
				console.log("moving now");
				const [x, y] = normalizePosition(event);
				movingSize = {
					...movingSize,
					x: Math.round(x - movingOrigin[0]),
					y: Math.round(y - movingOrigin[1]),
				};
			}
		}
		function handleMouseEnd(event) {
			if (moving !== -1) {
				console.log("moving ended");
				movingIsDone = true;
				moving = -1;
			}
		}
		window.addEventListener("mousemove", handleMouse);
		window.addEventListener("mouseup", handleMouseEnd);
		return () => {
			window.removeEventListener("mousemove", handleMouse);
			window.removeEventListener("mouseup", handleMouseEnd);
		};
	});
</script>

<div
	style:position="absolute"
	style:inset="0px"
	style:z-index="-10"
	style:background-image="radial-gradient(#333 {zoom}px, transparent 0)"
	style:background-size="{24 * zoom}px {24 * zoom}px"
	style:background-position="{-zoom * center[0]}px {-zoom * center[1]}px"
></div>
<div
	style:position="absolute"
	style:inset="0px"
	style:overflow="hidden"
	style:background-color="rgba(1,1,1,0.5)"
	style:touch-action="none"
	id="fabricEl"
	bind:this={fabricEl}
>
	<div
		id="wrapper"
		style:position="absolute"
		style:background-color="red"
		style:padding="3rem"
		style:left={OFFSET_LEFT_CSS}
		style:top={OFFSET_TOP_CSS}
		style:transform-origin={OFFSET_TRANSFORM_ORIGIN_CSS}
		transition:fade|local
		use:slide={{
			x: movingSize.x,
			y: movingSize.y,
			center,
			zoom,
			immediate: true,
		}}
	>
		<div
			style:background-color="green"
			style:padding="2rem"
			on:pointerdown={(event) => {
				console.log("startmoving");
				const [x, y] = normalizePosition(event);
				moving = 1;
				movingOrigin = [x - movingSize.x, y - movingSize.y];
				movingIsDone = false;
				event.stopPropagation();
				event.stopImmediatePropagation();
			}}
		>
			This is version 4.
		</div>
	</div>
</div>
<!-- 	<div -->
<!-- 		id="container" -->
<!-- 		style:position="absolute" -->
<!-- 		style:background-color="pink" -->
<!-- 		style:padding="1rem" -->
<!-- 		on:pointerdown={(event) => { -->
<!-- 			console.log("pd"); -->
<!-- 			event.stopPropagation(); -->
<!-- 		}} -->
<!-- 	> -->
<!-- 	</div> -->
