<template>
	<p>Choose a difficulty level:</p>

	<div role="radiogroup">
		<label>
			<input type="radio" name="group" value="single" v-model="selected" />
			Easy
		</label>
		<label>
			<input type="radio" name="group" value="multi" v-model="selected" />
			Medium
		</label>
		<label>
			<input type="radio" name="group" value="multi" v-model="selected" />
			Hard
		</label>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const selected = ref<string>('Easy');

</script>