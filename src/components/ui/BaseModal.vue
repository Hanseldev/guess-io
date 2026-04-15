<template>
	<div
		v-if="isOpen"
		class="h-screen w-screen fixed inset-0 z-50 flex flex-col items-center justify-center bg-main/90 text-btn-text"
		@click="handleBackdrop"
	>


		<div class="bg-btn-bg mx-8 p-8 rounded-lg relative gap-y-4 ">
            <button @click="isOpen = !isOpen" class="absolute -top-3 -right-2 select-none cursor-pointer p-6">x</button>
            Guess.io is an interactive game that can be played with friends. Players attempt to guess a number before they run out of tries.
        </div>
	</div>
</template>

<script setup lang="ts">
	import { ref, onMounted } from "vue";

	const isOpen = ref(true);
	const close = () => (isOpen.value = false);

	const handleBackdrop = (e: MouseEvent) => {
		if (e.target === e.currentTarget) close();
	};
</script>
