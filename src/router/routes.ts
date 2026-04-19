import { createRouter, createWebHistory } from "vue-router";


const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
            name: "home",
            component: () => import('../views/HomeView.vue')
		},
        {
            path: "/lobby/:mode",
            name: "lobby",
            component: () => import('../views/LobbyView.vue')
        },
        {
            path: "/game/:mode",
            name: "game",
            component: () => import('../views/GameView.vue')
        }
	],
});

export default router;
