<svelte:options runes />

<script>
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
	import { on } from "svelte/events";
	import { Tween } from "svelte/motion";
	import { expoOut } from "svelte/easing";

	const OFFSET_LEFT_CSS = "0px";
	const OFFSET_TOP_CSS = "0px";
	const OFFSET_TRANSFORM_ORIGIN_CSS = `calc(-1 * ${OFFSET_LEFT_CSS}) calc(-1 * ${OFFSET_TOP_CSS})`;

	/** Returns the mouse position in infinite grid coordinates, offset transformations and zoom. */
	function normalizePosition(event) {
		// const [ox, oy] = getConstantOffset();
		let ox = 0;
		let oy = 0;
		return [
			Math.round(center[0] + event.pageX / zoom - ox),
			Math.round(center[1] + event.pageY / zoom - oy),
		];
	}

	let { center, zoom, terminalWindow } = $props();
	// let terminalWindow = { x: 0, y: 0, rows: 24, cols: 80 };

	let terminalElement;
	let winSize = $state(terminalWindow); // New [x, y] position of the dragged terminal.
	let isMoving = -1; // are we moving
	let movingOrigin = [0, 0]; // Coordinates of mouse at origin when drag started.
	let movingIsDone = false; // Moving finished but hasn't been acknowledged.
	let tweenie = $state();
	let immediate = true;

	onMount(() => {
		function handleMouse(event) {
			if (isMoving !== -1 && !movingIsDone) {
				const [x, y] = normalizePosition(event);
				winSize = {
					...winSize,
					x: Math.round(x - movingOrigin[0]),
					y: Math.round(y - movingOrigin[1]),
				};
			}
		}
		function handleMouseEnd(event) {
			if (isMoving !== -1) {
				movingIsDone = true;
				isMoving = -1;
				immediate = true;
			}
		}
		function handlePointerDown(event) {
			const [x, y] = normalizePosition(event);
			isMoving = 1;
			movingOrigin = [x - winSize.x, y - winSize.y];
			movingIsDone = false;
			immediate = false;
			event.stopPropagation();
		}

		on(window, "mousemove", handleMouse);
		on(window, "mouseup", handleMouseEnd);
		on(terminalElement, "pointerdown", handlePointerDown);
	});

	tweenie = Tween.of(
		() => {
			return {
				winSize: { x: 0, y: 0, rows: 24, cols: 80 },
				center: [0, 0],
				zoom: 1.0,
			};
		},
		{
			duration: 450,
			easing: expoOut,
		},
	);

	$effect(() => {
		tweenie.set(
			{
				winSize,
				center,
				zoom,
			},
			{
				duration: immediate ? 0 : 250,
			},
		);
	});

	const sl = (node) => {
		$effect(() => {
			node.style.transform = `scale(${(tweenie?.current.zoom * 100).toFixed(3)}%) translate3d(${tweenie?.current.winSize?.x - tweenie?.current.center?.[0]}px, ${tweenie?.current.winSize?.y - tweenie?.current.center?.[1]}px, 0)`;
		});
	};
	// function listen(node, { name, handler }) {
	// 	node.addEventListener(name, handler);
	// 	return { destroy: () => node.removeEventListener(name, handler) };
	// }
	// style:background-image="radial-gradient(#333 {zoom}px, transparent 0)"
</script>

<div
	id="wrapper"
	style:position="absolute"
	style:background-color="red"
	style:padding="3rem"
	style:left={OFFSET_LEFT_CSS}
	style:top={OFFSET_TOP_CSS}
	style:transform-origin={OFFSET_TRANSFORM_ORIGIN_CSS}
	transition:fade|local
	use:sl
>
	<div
		style:background-color="green"
		style:padding="2rem"
		bind:this={terminalElement}
	>
		This is version 5.
		<pre>
x={tweenie.current.winSize.x.toFixed(3)}
y={tweenie.current.winSize.y.toFixed(3)}
center=[ {tweenie.current.center[0].toFixed(
				0,
			)}, {tweenie.current.center[1].toFixed(0)} ]
zoom={tweenie.current.zoom}
			</pre>
	</div>
</div>
