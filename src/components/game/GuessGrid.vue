<template>
	<div
		class="flex flex-col items-center max-h-96 overflow-scroll overscroll-auto gap-2"
	>
		<GuessRow
			v-for="i in guessAttempts"
			:key="i"
			:code-length="guessLength"
			:guess="getGuessForIndex(i - 1)"
			:status="getRowStatus(i - 1)"
			:disabled="!isRowActive(i - 1)"
			@update:guess="store.setCurrentGuess"
			@submit="(guess) => store.submitGuess(guess)"
		/>
	</div>
</template>

<script setup lang="ts">
	import { storeToRefs } from "pinia";
	import { useGameStore } from "@/stores/gameStore";
	import GuessRow from "./GuessRow.vue";
	import type { CellStatus } from "@/types/types";

	const store = useGameStore();

	// Pulling reactive state directly from the store
	const {
		guesses,
		currentGuess,
		currentAttemptIndex,
		guessLength,
		guessAttempts,
	} = storeToRefs(store);

	// 1. Data Mapping Logic
	const getGuessForIndex = (index: number) => {
		// If this is the active row, show what the user is typing
		if (index === currentAttemptIndex.value) return currentGuess.value;

		// If this is a past row, pull the guess from the history object
		if (index < currentAttemptIndex.value)
			return guesses.value[index]?.guess ?? Array(guessLength.value).fill("");

		// Future rows are empty
		return Array(guessLength.value).fill("");
	};

	// 2. Status Logic (for colors)
	const getRowStatus = (index: number): CellStatus[] | null => {
		if (index < currentAttemptIndex.value) {
			return guesses.value[index]?.result ?? null;
		}
		return null;
	};

	// 3. Gatekeeper Logic
	const isRowActive = (index: number) => index === currentAttemptIndex.value;
</script>
