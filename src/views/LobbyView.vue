<template>
	<div class="flex flex-col p-8">
		<DifficultySelector v-model="selectedDifficulty" />
		<BaseButton @click="createLobby">Create Lobby</BaseButton>
	</div>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import { useRouter } from "vue-router";
	import DifficultySelector from "../components/ui/DifficultySelector.vue";
	import BaseButton from "@/components/ui/BaseButton.vue";
	import { useGameStore } from "@/stores/gameStore";

	const store = useGameStore();
	const router = useRouter();

	const selectedDifficulty = ref<"easy" | "medium" | "hard" | "">("");

	const createLobby = () => {
		if (!selectedDifficulty.value) return;
		store.joinQueue(selectedDifficulty.value);
		router.push({ name: "game" });
	};
</script>
