<template>
	<div class="w-16 h-16">
		<input
			v-if="status === 'empty'"
			ref="inputRef"
			type="text"
			maxlength="1"
			inputmode="numeric"
			:value="modelValue"
			:disabled="disabled"
			class="w-full h-full text-center text-2xl bg-white border-2 border-gray-200 outline-0 transition-all duration-200 ease-in-out disabled:bg-text-muted disabled:border-text-muted disabled:cursor-not-allowed disabled:opacity-50 focus:border-btn-bg focus:shadow-deep"
			@input="handleInput"
			@keydown="handleKeydown"
		/>

		<div
			v-else
			class="w-full h-full flex items-center justify-center text-2xl font-bold rounded transition-all duration-500"
			:class="{
				'bg-correct text-white border-correct': status === 'correct',
				'bg-misplaced text-white border-misplaced': status === 'misplaced',
				'bg-incorrect text-white border-incorrect': status === 'incorrect',
			}"
		>
			{{ modelValue }}
		</div>
	</div>
</template>

<script setup lang="ts">
	import type { CellStatus } from "@/types/types";
import { ref, watch } from "vue";

	interface Props {
		modelValue: string | number;
		disabled: boolean;
		isFocused: boolean;
		status: CellStatus;
	}

	const props = defineProps<Props>();

	const emit = defineEmits<{
		"update:modelValue": [number | string];
		next: [];
		back: [];
	}>();

	const inputRef = ref<HTMLInputElement | null>(null);

	const handleInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const value = target.value;

		// Ensure only the last character entered is kept (for mobile/accidental double tap)
		const lastChar = value.slice(-1);

		if (/^\d$/.test(lastChar)) {
			emit("update:modelValue", Number(lastChar));
			emit("next");
		} else {
			target.value = "";
			emit("update:modelValue", "");
		}
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === "Backspace") {
			if (props.modelValue === "" || props.modelValue === null) {
				emit("back");
			} else {
				emit("update:modelValue", "");
			}
		}
	};

	watch(
		() => props.isFocused,
		(shouldFocus) => {
			if (shouldFocus && props.status === "empty" && inputRef.value) {
				inputRef.value.focus();
			}
		},
		{ immediate: true },
	);
</script>
