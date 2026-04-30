<script setup lang="ts">
	import { onMounted } from "vue";
	import { useGameStore } from "./stores/gameStore";
	import { useGameSync } from "@/composables/useGameSync";

	import { RouterView } from "vue-router";
	import bg from "./assets/images/lobby-bg.png";
	import TheHeader from "./components/ui/TheHeader.vue";

	const store = useGameStore();
	const { initListeners } = useGameSync();

	onMounted(() => {
		// 1. Load the username from localStorage if it exists
		store.initializeProfile();

		// 2. Start listening for "match_found", "guess_result", etc.
		initListeners();

		console.log("🚀 Game System Initialized & Listening...");
	});
</script>

<template>
	<div class="relative min-h-screen flex flex-col">
		<TheHeader />
		<!-- <div class="absolute inset-0 -z-10" :style="bgStyle"></div>
    <div class="absolute inset-0 -z-10 bg-black/15"></div> -->
		<RouterView />
	</div>
</template>
