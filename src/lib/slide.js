import { Tween } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';

/** An action for tweened transitions with global transformations. */
export const slide = (node, params) => {
	let center = params?.center ?? [0, 0];
	let zoom = params?.zoom ?? 1.0;
	let x = params?.movingSize.x ?? 0;
	let y = params?.movingSize.y ?? 0;
	const tweenie = new Tween({ x, y, center, zoom });

	$effect(() => {
		tweenie.target = { x, y, center, zoom };
		node.style.transform = `scale(${(tweenie.curren.zoom * 100).toFixed(3)}%)
		        translate3d(${tweenie.current.x - tweenie.current.center[0]}px, ${tweenie.current.y - tweenie.current.center[1]}px, 0)`;

		return () => {
			node.style.transform = '';
		};
	});
};
