<template>
	<div v-for="value in codeLength" :key="value">
        <NumberTile
            v-model="value"
            :disabled="true"
            :isFocused="false"
            status="pending">
        </NumberTile>
    </div>
</template>

<script setup lang="ts">
	import { GAME_MODES } from "@/constants/gameConfig";
	import { storeToRefs } from "pinia";
	import { useGameStore } from "@/stores/gameStore";
	import { computed } from "vue";
    import NumberTile from "./NumberTile.vue";

	const store = useGameStore();
	const { difficulty } = storeToRefs(store);

	const codeLength = computed(() => GAME_MODES[difficulty.value].codeLength);
	
</script>
