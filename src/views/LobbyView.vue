<template>
    <div class="flex flex-col p-8">
        <DifficultySelector />
        <BaseButton v-if="isMultiplayer" @click="$router.push('/lobby/multi/waiting')">Create Lobby</BaseButton>
        <BaseButton v-else @click="$router.push('/lobby/single')">Start Game</BaseButton>
    </div>
</template>

<script setup lang="ts">
    import { B } from "vue-router/dist/index-BzEKChPW.js";
import DifficultySelector from "../components/ui/DifficultySelector.vue";
    import { useRoute } from "vue-router";
import BaseButton from "@/components/ui/BaseButton.vue";

    const route = useRoute()
    const isMultiplayer = route.params.mode === 'multi'
</script>