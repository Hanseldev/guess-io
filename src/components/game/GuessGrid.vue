<template>
	<div
		class="flex flex-col items-center max-h-96 overflow-scroll overscroll-auto gap-2"
	>
		<!-- Past rows: yours with color, opponent without -->
		<GuessRow
			v-for="(entry, index) in guesses"
			:key="index"
			:code-length="guessLength"
			:guess="entry.guess"
			:status="entry.isOwn ? entry.result : null"
			:is-own="entry.isOwn"
			:disabled="true"
		/>

		<!-- Active input row — only show if game isn't over -->
		<GuessRow
			v-if="!store.isGameOver"
			:key="`active-${currentAttemptIndex}`"
			:code-length="guessLength"
			:guess="currentGuess"
			:status="null"
			:is-own="true"
			:disabled="false"
			@update:guess="store.setCurrentGuess"
			@submit="(guess) => store.submitGuess(guess)"
		/>

		<!-- Empty placeholder rows to fill remaining space -->
		<GuessRow
			v-for="i in emptyRows"
			:key="`empty-${i}`"
			:code-length="guessLength"
			:guess="Array(guessLength).fill('')"
			:status="null"
			:is-own="true"
			:disabled="true"
		/>
	</div>
</template>

<script setup lang="ts">
	import { storeToRefs } from "pinia";
	import { useGameStore } from "@/stores/gameStore";
	import { computed } from "vue";
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

	const emptyRows = computed(() => {
		const used = guesses.value.length + (store.isGameOver ? 0 : 1);
		return Math.max(0, guessAttempts.value - used);
	});

	// Data Mapping Logic
	const getGuessForIndex = (index: number) => {
		// If this is the active row, show what the user is typing
		if (index === currentAttemptIndex.value) return currentGuess.value;

		// If this is a past row, pull the guess from the history object
		if (index < currentAttemptIndex.value)
			return guesses.value[index]?.guess ?? Array(guessLength.value).fill("");

		// Future rows are empty
		return Array(guessLength.value).fill("");
	};

	// Status Logic (for colors)
	const getRowStatus = (index: number): CellStatus[] | null => {
		if (index < currentAttemptIndex.value) {
			return guesses.value[index]?.result ?? null;
		}
		return null;
	};

	// Gatekeeper Logic
	const isRowActive = (index: number) => index === currentAttemptIndex.value;
</script>
