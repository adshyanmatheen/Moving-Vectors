/* eslint-disable @typescript-eslint/no-explicit-any */
import { tweened, type TweenedOptions } from 'svelte/motion';
import { cubicInOut } from 'svelte/easing';
import { interpolate } from 'd3-interpolate';
import type { AnimationFn, Resolve } from './types.js';

export function tween<TweenValues>(values: TweenValues, options: TweenedOptions<TweenValues> = {}) {
	let tasks: AnimationFn[] = [];

	const { subscribe, update, set } = tweened<TweenValues>(values, {
		duration: 1000,
		easing: cubicInOut,
		interpolate,
		...options
	});

	function to(
		this: any,
		values: Partial<TweenValues>,
		toOptions: TweenedOptions<TweenValues> = {}
	) {
		if (typeof values === 'object') {
			tasks.push(() => update((prev) => ({ ...prev, ...values }), toOptions));
		} else {
			tasks.push(() => set(values, toOptions));
		}
		return this;
	}

	function reset() {
		set(values, { duration: 0 });
		tasks = [];
	}

	function sfx(this: any, sound: string, { volume = 0.5 } = {}) {
		const audio = new Audio(`${sound}.mp3`);
		audio.volume = volume;

		tasks.push(async () => {
			audio.play().catch(() => console.error('To play sounds interact with the page first.'));
		});

		return this;
	}

	async function then(resolve: Resolve) {
		for (const task of tasks) {
			await task();
		}
		resolve();
		tasks = [];
	}

	return { subscribe, to, reset, sfx, then };
}
