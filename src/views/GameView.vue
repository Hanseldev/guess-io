<template>
	<div class="flex flex-col min-h-screen">
		<!-- WAITING ROOM -->
		<div
			v-if="!store.isActive"
			class="flex flex-col items-center justify-center flex-1 gap-8 p-8"
		>
			<div class="text-center">
				<p class="text-white text-2xl font-semibold mb-2">Finding players...</p>
				<p class="text-text-muted text-sm">Waiting for the queue to fill up</p>
			</div>

			<div 
				class="w-12 h-12 rounded-full border-4 border-white/20 border-t-btn-bg
				animate-spin">
			</div>

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
		<div v-else class="flex flex-col lg:flex-row flex-1 gap-6 p-4 lg:p-8">
			<!-- Board (main) -->
			<div class="flex flex-col flex-1 items-center">
				<p class="text-white text-right w-full mb-4">
					Guesses Left: {{ remainingGuesses }}
				</p>
				<GuessGrid class="w-full" />
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
					v-for="opponent in store.opponents"
					:key="opponent.id"
					class="flex flex-col gap-2 bg-white/10 rounded-lg px-4 py-3 shrink-0 lg:shrink lg:w-full min-w-40"
				>
					<!-- Username + status dot -->
					<div class="flex items-center gap-2">
						<div class="w-2 h-2 rounded-full bg-green-400 shrink-0"></div>
						<span class="text-white text-sm font-semibold truncate">
							{{ opponent.name }}
						</span>
					</div>

					<!-- Last guess -->
					<div class="flex flex-col gap-1">
						<p class="text-text-muted text-xs">Last guess:</p>
						<div v-if="lastGuess(opponent.name)" class="flex gap-1">
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

					<!-- Guess count -->
					<p class="text-text-muted text-xs">
						{{ opponentGuessCount(opponent.name) }} /
						{{ store.guessAttempts }} guesses
					</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed } from "vue";
	import { useRouter } from "vue-router";
	import { useGameStore } from "@/stores/gameStore";
	import GuessGrid from "@/components/game/GuessGrid.vue";
	import BaseButton from "@/components/ui/BaseButton.vue";

	const store = useGameStore();
	const router = useRouter();

	const remainingGuesses = computed(() =>
		Math.abs(store.currentAttemptIndex - store.guessAttempts),
	);

	const lastGuess = (username: string): string[] => {
		const guesses = store.opponentLastGuesses[username] ?? [];
		const last = guesses[guesses.length - 1];
		return last ? last.split("") : [];
	};

	const opponentGuessCount = (username: string): number => {
		return store.opponentLastGuesses[username]?.length ?? 0;
	};

	const leaveQueue = () => {
		store.resetGame();
		router.push({ name: "lobby" });
	};
</script>
