<template>
    <div>
        
    </div>
</template>

<script setup lang="ts">
    import GuessRow from "@/components/game/GuessRow.vue";
    import { useGameStore } from "@/stores/gameStore";

    const store = useGameStore()

    console.log(store.difficulty)

</script>