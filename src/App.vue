<script setup lang="ts">
	import { RouterView } from "vue-router";
	import bg from "./assets/images/lobby-bg.png";
  import TheHeader from "./components/ui/TheHeader.vue";

	const bgStyle = {
		backgroundImage: `url(${bg})`,
		backgroundSize: "contain",
		backgroundRepeat: "repeat",
		backgroundPosition: "center",
		opacity: 1,
	};
</script>

<template>
	<div class="relative min-h-screen flex flex-col">
		<TheHeader />
		<!-- <div class="absolute inset-0 -z-10" :style="bgStyle"></div>
    <div class="absolute inset-0 -z-10 bg-black/15"></div> -->
		<RouterView />
	</div>
</template>
