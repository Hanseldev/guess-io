<template>
	<div>
		<p class="text-white text-right mr-8 mt-8">
			Guesses Left:
			{{ remainingGuesses }}
		</p>
		<GuessGrid class="my-8" />
	</div>
</template>

<script setup lang="ts">
	import { onMounted, computed } from "vue";
	import { useGameStore } from "@/stores/gameStore";
	import GuessGrid from "@/components/game/GuessGrid.vue";

	const store = useGameStore();

	const remainingGuesses = computed(() =>
		Math.abs(store.currentAttemptIndex - store.guessAttempts),
	);

</script>
