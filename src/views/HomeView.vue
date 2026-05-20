<template>
	<div class="flex flex-col px-8 items-center my-auto">
		<h1 class="text-text-main text-6xl select-none">guess.io</h1>
		<p class="text-text-muted text-4xl mt-4 tracking-widest mb-12 select-none">
			<span class="inline-block rotate-[11.77deg]">2</span>
			<span class="inline-block rotate-[-10.25deg]">0</span>
			<span class="inline-block rotate-[10.71deg]">4</span>
			<span class="inline-block rotate-[-12.48deg]">8</span>
		</p>

		<div>
			<input
				v-model="username"
				@blur="saveUsername"
				@keyup.enter="saveUsername"
				type="text"
				placeholder="Pick a name"
				class="bg-white w-full p-4 pl-5 mb-18 text-btn-text text-xl placeholder:text-btn-text/50 focus:outline-none focus:ring-2 focus:ring-btn-bg transition-colors duration-200 caret-btn-bg"
			/>

			<BaseButton @click="router.push({ name: 'lobby' })" class="w-full">Play</BaseButton>
		</div>
		<BaseModal v-model="showIntro" :closeable="true">
			Guess.io is a multiplayer number guessing game. Race your opponents to
			crack the secret code before you run out of tries. No repeated digits
			allowed!
		</BaseModal>
	</div>
</template>

<script setup lang="ts">
	import { onMounted, computed, ref } from "vue";
	import { useGameStore } from "@/stores/gameStore";
	import { useRouter } from "vue-router";
	import BaseButton from "../components/ui/BaseButton.vue";
	import BaseModal from "../components/ui/BaseModal.vue";

	const router = useRouter();
	const store = useGameStore();

	const showIntro = ref(false);

	const username = computed({
		get: () => store.username,
		set: (val: string) => (store.username = val),
	});
	const saveUsername = () => {
		if (username.value.trim()) {
			localStorage.setItem("username", username.value.trim());
		}
	};

	onMounted(() => {
		store.initializeProfile();
		if (!localStorage.getItem("hasVisited")) {
			showIntro.value = true;
			localStorage.setItem("hasVisited", "true");
		}
	});
</script>
