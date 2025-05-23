<svelte:options runes />

<script>
	import { onMount } from "svelte";

	import FabricHandler from "./FabricHandler.js";
	import TermWindow from "./TermWindow.svelte";

	let fabricElement;
	let fabric;
	let center = $state([0, 0]);
	let zoom = $state(1.0);
	let terminalWindows = [
		{ id: 1, x: 100, y: 20, rows: 24, cols: 80 },
		{ id: 2, x: 150, y: 80, rows: 24, cols: 80 },
		{ id: 3, x: 200, y: 40, rows: 24, cols: 80 },
	];

	onMount(() => {
		fabric = new FabricHandler({ fabricEl: fabricElement });
		fabric.onMove((state) => {
			center = fabric.center;
			zoom = fabric.zoom;
		});
	});

	// function listen(node, { name, handler }) {
	// 	node.addEventListener(name, handler);
	// 	return { destroy: () => node.removeEventListener(name, handler) };
	// }
	// style:background-image="radial-gradient(#333 {zoom}px, transparent 0)"
</script>

<div
	style:position="absolute"
	style:inset="0px"
	style:z-index="-10"
	style:background-image="url('leaves.jpg')"
	style:background-size="{650 * zoom}px {650 * zoom}px"
	style:background-repeat="no-repeat"
	style:background-position="{-zoom * center[0]}px {-zoom * center[1]}px"
></div>
<div
	style:position="absolute"
	style:inset="0px"
	style:overflow="hidden"
	style:background-color="rgba(1,1,1,0.5)"
	style:touch-action="none"
	bind:this={fabricElement}
>
	{#each terminalWindows as terminalWindow}
		<TermWindow {center} {zoom} {terminalWindow} />
	{/each}
</div>
