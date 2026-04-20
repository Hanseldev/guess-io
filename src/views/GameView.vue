<template>
	<div  >
		<GuessGrid class="my-8" />
	</div>
</template>

<script setup lang="ts">
	import { onMounted } from "vue";
	import { useGameStore } from "@/stores/gameStore";
	import GuessGrid from "@/components/game/GuessGrid.vue";

	const store = useGameStore();

	onMounted(() => {
		
		// store.initializeGame(store.difficulty);
	});
</script>
