<script setup lang="ts">
	import { onMounted } from "vue";
	import { useGameStore } from "./stores/gameStore";
	import { useGameSync } from "@/composables/useGameSync";

	import { RouterView } from "vue-router";
	// import bg from "./assets/images/lobby-bg.png";
	import TheHeader from "./components/ui/TheHeader.vue";
	import FloatingNumbers from "./components/ui/FloatingNumbers.vue";

	const store = useGameStore();
	const { initListeners } = useGameSync();

	onMounted(() => {
		// Load the username from localStorage if it exists
		store.initializeProfile();

		// Start listening for "match_found", "guess_result", etc.
		initListeners();

		console.log("Game System Initialized & Listening...");
	});
</script>

<template>
	<div class="relative min-h-screen flex flex-col">
		<FloatingNumbers />
		<TheHeader />
		<RouterView v-slot="{ Component }">
			<Transition name="page" mode="out-in">
				<component :is="Component" />
			</Transition>
		</RouterView>
	</div>
</template>
