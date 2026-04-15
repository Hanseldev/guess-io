<template>
    <DifficultySelector></DifficultySelector>
</template>

<script setup lang="ts">
    import DifficultySelector from "../components/ui/DifficultySelector.vue";
    import { useRoute } from "vue-router";

    const route = useRoute()
    const isMultiplayer = route.params.mode === 'multi'
</script>