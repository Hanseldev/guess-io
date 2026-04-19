<template></template>

<script setup lang="ts">
	import GuessRow from "@/components/game/GuessRow.vue";
	import { useGameStore } from "@/stores/gameStore";
	import { computed } from "vue";
	import { storeToRefs } from "pinia";
	import { GAME_MODES } from "@/constants/gameConfig";

    const store = useGameStore()
    const {difficulty, guesses, currentGuess, currentAttemptIndex} = storeToRefs(store)
</script>
