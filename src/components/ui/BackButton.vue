<template>
	<button
		@click="router.back()"
		class="cursor-pointer text-btn-bg scale scale-100 hover:scale-101 active:scale-100 transition-transform duration-75 select-none font-black text-4xl"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M19 12H5" />
			<path d="M12 19l-7-7 7-7" />
		</svg>
	</button>
</template>

<script setup lang="ts">
	import { useRouter } from "vue-router";

	const router = useRouter();
</script>
