<svelte:options runes />

<script>
	import { onMount } from "svelte";

	import FabricHandler from "./FabricHandler.js";
	import TermWindow from "./TermWindow.svelte";

	let fabricElement;
	let consoleElement;
	let fabric;
	let gridSpacing = 32;
	let center = $state([0, 0]);
	let zoom = $state(1.0);
	let terminalWindows = $state([
		{ id: 1, z: 1, x: 96, y: 32, rows: 24, cols: 80 },
		{ id: 2, z: 3, x: 0, y: 0, rows: 24, cols: 80 },
		{ id: 3, z: 2, x: 64, y: 64, rows: 24, cols: 80 },
	]);

	onMount(() => {
		fabric = new FabricHandler({
			fabricEl: fabricElement,
			consoleEl: consoleElement,
		});
		fabric.onMove((state) => {
			center = fabric.center;
			zoom = fabric.zoom;
		});

		// $effect(() => {
		// 	console.log(
		// 		"effect fabric: " +
		// 			JSON.stringify($state.snapshot(terminalWindows)),
		// 	);
		// });
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

	// this function is used to scroll to the top of the fabric and
	// all the way to the left. So the users can doubletap the canvas
	// and return to a safe spot, where they are able to use the
	// normal device zoom functions again.
	const scrollToEdge = () => {
		window.scrollTo(0, fabric.fabricOffset[1]);
	};

	// this is an alternative to the on() function that also
	// allows us to use the stopPropagation() method, it would
	// be used like
	// "use:listen={{ name: 'click', handler: (e) => e.stopPropagation() }}"
	// function listen(node, { name, handler }) {
	// 	node.addEventListener(name, handler);
	// 	return { destroy: () => node.removeEventListener(name, handler) };
	// }
</script>

<div class="relative top-32 h-[1000px] left-16 w-[1500px]">
	<div
		class="absolute inset-0 -z-10 bg-[#212121]"
		style:background-image="radial-gradient(#404040 {1.5 * zoom}px,
		transparent 0), radial-gradient(#8800ff {5 * zoom}px, transparent 0)"
		style:background-size="{gridSpacing * zoom}px {gridSpacing * zoom}px, {gridSpacing *
			zoom}px {gridSpacing * zoom}px"
		style:background-repeat="repeat, no-repeat"
		style:background-position="{zoom * (center[0] - gridSpacing / 2)}px {zoom *
			(center[1] - gridSpacing / 2)}px, {zoom *
			(center[0] - gridSpacing / 2)}px {zoom *
			(center[1] - gridSpacing / 2)}px"
	></div>
	<div
		class="absolute top-[0px] inset-0 overflow-hidden touch-none"
		bind:this={fabricElement}
		ondblclick={scrollToEdge}
		role="none"
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
	<div
		class="absolute bottom-0 inset-x-0 px-2 h-64 bg-emerald-200 text-zinc-800"
	>
		<pre id="console" bind:this={consoleElement}></pre>
	</div>
</div>
