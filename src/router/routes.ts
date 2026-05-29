import { useGameStore } from "@/stores/gameStore.ts";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "home",
			component: () => import("../views/HomeView.vue"),
		},
		{
			path: "/lobby",
			name: "lobby",
			component: () => import("../views/LobbyView.vue"),
		},
		{
			path: "/game",
			name: "game",
			component: () => import("../views/GameView.vue"),
			beforeEnter: () => {
				const store = useGameStore();
				// Only allow entry if username exists (came through home → lobby flow)
				if (!store.username) {
					return { name: "home" };
				}
			},
		},
		{
			path: "/:pathMatch(.*)*",
			redirect: { name: "home" },
		},
	],
});

export default router;
