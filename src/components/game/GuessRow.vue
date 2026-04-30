<template>
	<div class="flex gap-2 mb-2">
		<NumberTile
			v-for="i in codeLength"
			:key="i"
			:modelValue="guess[i - 1] ?? ''"
			:isFocused="activeTileIndex === i - 1"
			:status="props.status ? (props.status[i - 1] ?? 'empty') : 'empty'"
            :disabled="disabled"
            @update:model-value="(val) => handleUpdate(i - 1, val)"
            @next="handleNext(i - 1)"
            @back="handleBack(i - 1)"
		>
		</NumberTile>
	</div>
</template>

<script setup lang="ts">
	import { nextTick, ref } from "vue";
	import NumberTile from "./NumberTile.vue";
	import type { CellStatus } from "@/types/types";

	// Data GuessRow needs. Will be supplied by parent, prop drilling

	const props = defineProps<{
		codeLength: number;
		guess: (number | string)[];
		status: CellStatus[] | null;
		disabled?: boolean;
	}>();

    const emit = defineEmits<{
        "update:guess": [newGuess: (string | number)[]]
        submit: [guess: (string | number)[]]
    }>()

    const handleUpdate = (index: number, value: string | number) => {
        const newGuess = [...props.guess];
        newGuess[index] = value;
        emit("update:guess", newGuess);
    }

    const handleNext = (index: number) => {
        if (index < props.codeLength - 1) {
            activeTileIndex.value = index + 1
        } else {
            console.log("🎯 Last tile filled, submitting...", props.guess);
            nextTick(() => emit('submit', [...props.guess]))
        }
    }

    const handleBack = (index: number) => {
        if (index > 0) activeTileIndex.value = index - 1
    }
	const activeTileIndex = ref(0);
</script>
