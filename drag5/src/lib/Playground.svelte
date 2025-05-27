<svelte:options runes />

<script>
	import { onMount } from "svelte";

	import FabricHandler from "./FabricHandler.js";
	import TermWindow from "./TermWindow.svelte";

	let fabricElement;
	let fabric;
	let center = $state([0, 0]);
	let zoom = $state(1.0);
	let terminalWindows = $state([
		{ id: 1, z: 1, x: 100, y: 20, rows: 24, cols: 80 },
		{ id: 2, z: 3, x: 150, y: 80, rows: 24, cols: 80 },
		{ id: 3, z: 2, x: 200, y: 40, rows: 24, cols: 80 },
	]);

	onMount(() => {
		fabric = new FabricHandler({ fabricEl: fabricElement });
		fabric.onMove((state) => {
			center = fabric.center;
			zoom = fabric.zoom;
		});

		$effect(() => {
			console.log(
				"effect fabric: " +
					JSON.stringify($state.snapshot(terminalWindows)),
			);
		});
	});

	const focusWindow = (id) => {
		let num_of_windows = terminalWindows.length;
		let order = num_of_windows - 1;
		terminalWindows = terminalWindows
			.sort((a, b) => {
				return a.z == b.z ? 0 : a.z > b.z ? -1 : 1;
			})
			.map((win) => {
				if (win.id == id) {
					win.z = num_of_windows;
				} else {
					win.z = order;
					order = order - 1;
				}
				return win;
			});
	};

	// function listen(node, { name, handler }) {
	// 	node.addEventListener(name, handler);
	// 	return { destroy: () => node.removeEventListener(name, handler) };
	// }
</script>

<div
	class="absolute inset-0 -z-10 bg-[#212121]"
	style:background-image="radial-gradient(#404040 {1.5 * zoom}px, transparent
	0), radial-gradient(#a00000 {5 * zoom}px, transparent 0)"
	style:background-size="{24 * zoom}px {24 * zoom}px, {24 * zoom}px {24 *
		zoom}px"
	style:background-repeat="repeat, no-repeat"
	style:background-position="{-zoom * (center[0] + 12)}px {-zoom *
		(center[1] + 12)}px, {-zoom * (center[0] + 12)}px {-zoom *
		(center[1] + 12)}px"
></div>
<div
	class="absolute inset-0 overflow-hidden touch-none"
	bind:this={fabricElement}
>
	{#each terminalWindows as terminalWindow, i (terminalWindow.id)}
		<TermWindow
			{center}
			{zoom}
			bind:terminalWindow={terminalWindows[i]}
			{focusWindow}
		/>
	{/each}
</div>
