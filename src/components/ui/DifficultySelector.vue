<template>
	<p class="text-2xl text-white mb-2 font-semibold">
		Choose a difficulty level:
	</p>

	<div
		role="radiogroup"
		aria-label="Choose a difficulty level"
		class="flex gap-4 mb-2"
	>
		<label class="flex items-center gap-2 cursor-pointer text-white">
			<input
				type="radio"
				name="group"
				value="easy"
				v-model="selected"
				class="peer hidden"
			/>
			<span
				class="w-5 h-5 rounded-full border-3 bg-white border-btn-bg peer-checked:bg-btn-bg peer-checked:border-white"
			></span>
			Easy
		</label>

		<label class="flex items-center gap-2 cursor-pointer text-white">
			<input
				type="radio"
				name="group"
				value="medium"
				v-model="selected"
				class="peer hidden"
			/>
			<span
				class="w-5 h-5 rounded-full border-3 bg-white border-btn-bg peer-checked:bg-btn-bg peer-checked:border-white"
			></span>
			Medium
		</label>

		<label class="flex items-center gap-2 cursor-pointer text-white">
			<input
				type="radio"
				name="group"
				value="hard"
				v-model="selected"
				class="peer hidden"
			/>
			<span
				class="w-5 h-5 rounded-full border-3 bg-white border-btn-bg peer-checked:bg-btn-bg peer-checked:border-white"
			></span>
			Hard
		</label>
	</div>
	<p class="text-white text-xs mb-8">{{ message }}</p>
</template>

<script setup lang="ts">
	import { computed } from "vue";

	// ✅ Proper v-model component — no store dependency
	const props = defineProps<{
		modelValue: "easy" | "medium" | "hard" | "";
	}>();

	const emit = defineEmits<{
		"update:modelValue": ["easy" | "medium" | "hard" | ""];
	}>();

	const selected = computed({
		get: () => props.modelValue,
		set: (val) => emit("update:modelValue", val),
	});

	const message = computed(() => {
		switch (selected.value) {
			case "easy":
				return "4 digits, 10 tries";
			case "medium":
				return "5 digits, 12 tries"; // ✅ corrected from docs
			case "hard":
				return "6 digits, 15 tries"; // ✅ corrected from docs
			default:
				return "";
		}
	});
</script>
