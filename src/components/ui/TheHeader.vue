<template>
    <header class="flex justify-between pt-4 px-8">
        <BackButton v-if="!isHome" />
        <h1 class="text-text-muted text-xl select-none">guess.io</h1>
    </header>
</template>

<script setup lang="ts">
    import { useRoute } from "vue-router";
    import { computed } from "vue";
    import BackButton from "./BackButton.vue";

    const route = useRoute();

    const isHome = computed(() => route.name === "home");
</script>