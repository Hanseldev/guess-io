<template>
	<div class="flex flex-col min-h-screen">
		<!-- WAITING ROOM -->
		<div
			v-if="!store.isActive && !store.isGameOver"
			class="flex flex-col items-center justify-center flex-1 gap-8 p-8"
		>
			<div class="text-center">
				<p class="text-white text-2xl font-semibold mb-2">Finding players...</p>
				<p class="text-text-muted text-sm">Waiting for the queue to fill up</p>
			</div>

			<div
				class="w-12 h-12 rounded-full border-4 border-white/20 border-t-btn-bg animate-spin"
			></div>

			<div class="flex flex-col items-center gap-3 w-full max-w-xs">
				<p class="text-text-muted text-xs uppercase tracking-widest">
					Players joined
				</p>
				<div
					v-for="player in store.opponents"
					:key="player.id"
					class="w-full flex items-center gap-3 bg-white/10 rounded px-4 py-3"
				>
					<div class="w-2 h-2 rounded-full bg-green-400" />
					<span class="text-white text-sm">{{ player.name }}</span>
				</div>
				<div
					class="w-full flex items-center gap-3 bg-white/10 rounded px-4 py-3"
				>
					<div class="w-2 h-2 rounded-full bg-btn-bg" />
					<span class="text-white text-sm">
						{{ store.username }} <span class="text-text-muted">(you)</span>
					</span>
				</div>
			</div>

			<p v-if="store.error" class="text-red-400 text-sm text-center">
				{{ store.error }}
			</p>
			<BaseButton @click="leaveQueue">Leave Queue</BaseButton>
		</div>

		<!-- GAME BOARD -->
		<div
			v-else-if="!store.isGameOver"
			class="flex flex-col lg:flex-row flex-1 gap-6 p-4 lg:p-8"
		>
			<div class="flex flex-col flex-1 items-center">
				<p class="text-white text-right w-full mb-4">
					Guesses Left: {{ remainingGuesses }}
				</p>
				<GuessGrid class="w-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" />
			</div>

			<!-- Opponent Panel -->
			<div
				class="flex flex-row lg:flex-col gap-3 lg:w-56 overflow-x-auto lg:overflow-x-visible"
			>
				<p
					class="text-text-muted text-xs uppercase tracking-widest shrink-0 self-center lg:self-auto"
				>
					Opponents
				</p>
				<div
					v-for="opponent in opponents"
					:key="opponent.id"
					class="flex flex-col gap-2 bg-white/10 rounded-lg px-4 py-3 shrink-0 lg:shrink lg:w-full min-w-40"
				>
					<div class="flex items-center gap-2">
						<div class="w-2 h-2 rounded-full bg-green-400 shrink-0" />
						<span class="text-white text-sm font-semibold truncate">{{
							opponent.name
						}}</span>
					</div>
					<div class="flex flex-col gap-1">
						<p class="text-text-muted text-xs">Last guess:</p>
						<div v-if="lastGuess(opponent.name).length" class="flex gap-1">
							<span
								v-for="(digit, i) in lastGuess(opponent.name)"
								:key="i"
								class="w-7 h-7 flex items-center justify-center text-sm font-bold rounded bg-white/20 text-white"
							>
								{{ digit }}
							</span>
						</div>
						<p v-else class="text-text-muted text-xs italic">No guess yet</p>
					</div>
					<p class="text-text-muted text-xs">
						{{ opponentGuessCount(opponent.name) }} /
						{{ store.guessAttempts }} guesses
					</p>
				</div>
			</div>
		</div>

		<!-- GAME OVER MODAL -->
		<BaseModal :model-value="store.isGameOver" :closeable="false">
			<div class="flex flex-col items-center gap-4 text-center">
				<p class="text-3xl font-bold">
					{{ store.isWinner ? "You Win!" : "You Lose!" }}
				</p>
				<p class="text-white/70 text-sm">The secret number was</p>
				<p class="text-4xl font-mono font-bold tracking-widest">
					{{ store.secret }}
				</p>
				<p class="text-white/50 text-xs mt-2">
					Returning to home in {{ countdown }}s...
				</p>
			</div>
		</BaseModal>
	</div>
</template>

<script setup lang="ts">
	import { computed, watch, ref } from "vue";
	import { useRouter } from "vue-router";
	import { storeToRefs } from "pinia";
	import { useGameStore } from "@/stores/gameStore";
	import GuessGrid from "@/components/game/GuessGrid.vue";
	import BaseModal from "@/components/ui/BaseModal.vue";
	import BaseButton from "@/components/ui/BaseButton.vue";

	const store = useGameStore();
	const router = useRouter();

	const { opponents, opponentLastGuesses, guessAttempts } = storeToRefs(store);

	const remainingGuesses = computed(
		() => store.guessAttempts - store.totalGuesses,
	);

	const countdown = ref(3);
	let countdownInterval: ReturnType<typeof setInterval> | null = null;

	watch(
		() => store.isGameOver,
		(isOver) => {
			if (!isOver) return;

			countdown.value = 3;
			countdownInterval = setInterval(() => {
				countdown.value--;
				if (countdown.value <= 0) {
					clearInterval(countdownInterval!);
					store.resetGame();
					router.push({ name: "home" }).then(() => {
						window.location.reload();
					});
				}
			}, 1000);
		},
	);

	const lastGuess = (username: string): string[] => {
		const guesses = opponentLastGuesses.value[username] ?? []; 
		const last = guesses[guesses.length - 1];
		return last ? last.split("") : [];
	};

	const opponentGuessCount = (username: string): number => {
		return opponentLastGuesses.value[username]?.length ?? 0; 
	};

	const leaveQueue = () => {
		store.resetGame();
		router.push({ name: "lobby" });
	};
</script>
