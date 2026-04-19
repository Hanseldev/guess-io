<template>
	<div class="flex flex-col p-8">
		<DifficultySelector />
		<BaseButton
			v-if="isMultiplayer"
			@click="$router.push({name: 'game', params: {mode: 'multi'}})"
			>Create Lobby</BaseButton
		>
		<BaseButton v-else @click="$router.push('/lobby/single')"
			>Start Game</BaseButton
		>
	</div>
</template>

<script setup lang="ts">
	import DifficultySelector from "../components/ui/DifficultySelector.vue";
	import { useRoute } from "vue-router";
	import BaseButton from "@/components/ui/BaseButton.vue";

	const route = useRoute();
	const isMultiplayer = route.params.mode === "multi";
</script>
