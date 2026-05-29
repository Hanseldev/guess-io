<template>
	<div :class="['flex gap-2 mb-2', shakeClass]">
		<NumberTile
			v-for="i in codeLength"
			:key="i"
			:modelValue="guess[i - 1] ?? ''"
			:isFocused="activeTileIndex === i - 1"
			:status="props.status ? (props.status[i - 1] ?? 'empty') : 'empty'"
			:disabled="disabled"
			:is-own="isOwn"
			@update:model-value="(val) => handleUpdate(i - 1, val)"
			@next="handleNext(i - 1)"
			@back="handleBack(i - 1)"
		/>
	</div>
</template>

<script setup lang="ts">
	import { nextTick, ref, watch } from "vue";
	import NumberTile from "./NumberTile.vue";
	import type { CellStatus } from "@/types/types";

	const props = defineProps<{
		codeLength: number;
		guess: (number | string)[];
		status: CellStatus[] | null;
		disabled?: boolean;
		isOwn?: boolean;
		shake?: boolean; // new
	}>();

	const emit = defineEmits<{
		"update:guess": [newGuess: (string | number)[]];
		submit: [guess: (string | number)[]];
	}>();

	const activeTileIndex = ref(0);
	const shakeClass = ref("");

	// Trigger shake when shake prop flips to true
	watch(
		() => props.shake,
		(val) => {
			if (val) {
				shakeClass.value = "animate-shake";
				setTimeout(() => (shakeClass.value = ""), 400);
			}
		},
	);

	watch(
		() => props.disabled,
		(isDisabled) => {
			if (!isDisabled) {
				nextTick(() => {
					activeTileIndex.value = 0;
				});
			}
		},
		{ immediate: true },
	);

	const handleUpdate = (index: number, value: string | number) => {
		const newGuess = [...props.guess];
		newGuess[index] = value;
		emit("update:guess", newGuess);
	};

	const handleNext = (index: number) => {
		if (index < props.codeLength - 1) {
			activeTileIndex.value = index + 1;
		} else {
			nextTick(() => emit("submit", [...props.guess]));
		}
	};

	const handleBack = (index: number) => {
		if (index > 0) activeTileIndex.value = index - 1;
	};
</script>
