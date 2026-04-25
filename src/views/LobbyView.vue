<template>
	<div class="flex flex-col p-8">
		<DifficultySelector />
		<BaseButton v-if="isMultiplayer" @click="createLobby()"
			>Create Lobby</BaseButton
		>
		<BaseButton v-else @click="createLobby()">Start Game</BaseButton>
	</div>
</template>

<script setup lang="ts">
	import DifficultySelector from "../components/ui/DifficultySelector.vue";
	import { useRoute, useRouter } from "vue-router";
	import BaseButton from "@/components/ui/BaseButton.vue";

	import { useGameStore } from "@/stores/gameStore";
	import { storeToRefs } from "pinia";

	const store = useGameStore();

	const { difficulty } = storeToRefs(store);

	const route = useRoute();
	const router = useRouter();
	
	const isMultiplayer = route.params.mode === "multi";

	const createLobby = () => {
		if (difficulty.value === "") {
			console.warn("Please select a difficulty level before starting the game.");
			return;
		}

		const mode = isMultiplayer ? "multi" : "single";
		router.push({ name: "game", params: { mode } });
	};
</script>
