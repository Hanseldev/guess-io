<template>
	<div class="w-12 h-12" style="perspective: 250px">
		<input
			v-if="!disabled && isOwn"
			ref="inputRef"
			type="text"
			maxlength="1"
			inputmode="numeric"
			:value="modelValue"
			:disabled="disabled"
			:class="[
				'w-full h-full text-center text-2xl bg-white border-2 border-gray-200 rounded outline-0 transition-all duration-200 ease-in-out focus:border-btn-bg focus:shadow-deep focus:scale-105 focus:ring-2 focus:ring-btn-bg/50',
				popClass,
			]"
			@input="handleInput"
			@keydown="handleKeydown"
		/>

		<div
			v-else-if="isOwn && status !== 'empty'"
			:class="[
				'w-full h-full flex items-center justify-center text-2xl font-bold rounded transition-all duration-500',
				flipClass,
				{
					'bg-correct text-white': status === 'correct',
					'bg-misplaced text-white': status === 'present',
					'bg-incorrect text-white': status === 'absent',
				},
			]"
		>
			{{ modelValue }}
		</div>

		<div
			v-else-if="!isOwn"
			class="w-full h-full flex items-center justify-center text-2xl font-bold rounded bg-white/20 text-white/60"
		>
			{{ modelValue }}
		</div>

		<div v-else class="w-full h-full border-2 border-gray-200/20 rounded" />
	</div>
</template>

<script setup lang="ts">
	import type { CellStatus } from "@/types/types";
	import { ref, watch, onMounted } from "vue";

	interface Props {
		modelValue: string | number;
		disabled: boolean;
		isFocused: boolean;
		status: CellStatus;
		isOwn?: boolean;
	}

	const props = defineProps<Props>();

	const emit = defineEmits<{
		"update:modelValue": [number | string];
		next: [];
		back: [];
	}>();

	const inputRef = ref<HTMLInputElement | null>(null);
	const popClass = ref("");
	const flipClass = ref("");

	onMounted(() => {
		if (props.isFocused && !props.disabled && inputRef.value) {
			inputRef.value.focus();
		}

		// ✅ Flip when tile mounts with a status (i.e. row was just submitted)
		if (props.status && props.status !== "empty") {
			flipClass.value = "animate-flip";
		}
	});

	watch(
		() => props.isFocused,
		(shouldFocus) => {
			if (shouldFocus && !props.disabled && inputRef.value) {
				inputRef.value.focus();
			}
		},
	);

	const triggerPop = () => {
		popClass.value = "";
		requestAnimationFrame(() => {
			popClass.value = "animate-pop";
			setTimeout(() => (popClass.value = ""), 150);
		});
	};

	const handleInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const value = target.value;
		const lastChar = value.slice(-1);

		if (/^\d$/.test(lastChar)) {
			emit("update:modelValue", Number(lastChar));
			triggerPop(); // ✅ pop on valid digit
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
</script>
