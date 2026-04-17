<template>
	<input
		ref="inputRef"
		type="text"
		maxlength="1"
		inputmode="numeric"
		:value="modelValue"
		:disabled="disabled"
		class="w-16 h-16 text-center text-2xl bg-white outline-0 transition-all duration-200 ease-in-out disabled:bg-text-muted disabled:border-text-muted disabled:cursor-not-allowed disabled:opacity-50 focus:border-btn-bg focus:border-2 focus:shadow-deep"
		@input="handleInput"
		@keydown="handleKeydown"
	/>
</template>

<script setup lang="ts">
	import { ref, watch } from "vue";

	interface Props {
		modelValue: string | number;
		disabled: boolean;
		isFocused: boolean;
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

        if (/^\d$/.test(value)) {
            emit('update:modelValue', Number(value));
            emit('next')
        } else {
            target.value = '';
            emit('update:modelValue', '');
        }
	};

    watch(() => props.isFocused, (shouldFocus) => {
        if (shouldFocus && inputRef.value) {
            inputRef.value.focus();
        }
    }, {immediate: true});

    const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Backspace') {
            if (props.modelValue === '') {
                emit('back');
            } else {
                emit('update:modelValue', '');
            }
        }
    };
</script>
