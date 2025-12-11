import { createRouter, createWebHistory } from "vue-router";
import About from "../views/About.vue";
import Landing from "../views/Landing.vue";
import Quiz from "../views/Quiz.vue";
import Results from "../views/Results.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "landing",
      component: Landing,
    },
    {
      path: "/quiz",
      name: "quiz",
      component: Quiz,
    },
    {
      path: "/results",
      name: "results",
      component: Results,
    },
    {
      path: "/about",
      name: "about",
      component: About,
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
