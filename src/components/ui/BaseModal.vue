<template>
	<div
		v-if="modelValue"
		class="h-screen w-screen fixed inset-0 z-50 flex flex-col items-center justify-center bg-main/90 text-btn-text"
		@click="handleBackdrop"
	>
		<div class="bg-btn-bg mx-8 p-8 rounded-lg relative gap-y-4">
			<button
				v-if="closeable"
				@click="emit('update:modelValue', false)"
				class="absolute -top-3 -right-2 select-none cursor-pointer p-6"
			>
				x
			</button>
			<slot />
		</div>
	</div>
</template>

<script setup lang="ts">
	const props = defineProps<{
		modelValue: boolean;
		closeable?: boolean; // game over modal won't have a close button
	}>();

	const emit = defineEmits<{
		"update:modelValue": [boolean];
	}>();

	const handleBackdrop = (e: MouseEvent) => {
		if (props.closeable && e.target === e.currentTarget) {
			emit("update:modelValue", false);
		}
	};
</script>
