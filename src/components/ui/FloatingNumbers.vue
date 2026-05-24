<template>
	<div class="fixed inset-0 overflow-hidden pointer-events-none -z-10">
		<span
			v-for="n in numbers"
			:key="n.id"
			class="absolute font-mono font-bold select-none animate-float"
			:style="{
				left: n.x + '%',
				bottom: '-2rem',
				fontSize: n.size + 'px',
				opacity: n.opacity,
				animationDuration: n.duration + 's',
				animationDelay: n.delay + 's',
				color: n.color,
			}"
		>
			{{ n.digit }}
		</span>
	</div>
</template>

<script setup lang="ts">
	import { ref } from "vue";

	const colors = ["#f5c518", "#00b894", "#E76F51", "#f1f1f1"];

	const random = (min: number, max: number) =>
		Math.random() * (max - min) + min;

	const numbers = ref(
		Array.from({ length: 10 }, (_, i) => ({
			id: i,
			digit: Math.floor(Math.random() * 10),
			x: random(0, 100),
			size: random(14, 48),
			opacity: random(0.04, 0.10),
			duration: random(8, 20),
			delay: random(0, 15) * -1, // negative delay so they start mid-animation
			color: colors[Math.floor(Math.random() * colors.length)],
		})),
	);
</script>
