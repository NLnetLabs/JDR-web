import Vue from "vue";
import Router from "vue-router";

import Search from "./views/Search.vue";
import Repositories from "./views/Repositories.vue";
import PageNotFound from "./views/404.vue";


Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: "/",
      name: "home",
      component: Search
    },
    {
      path: "/search/:search?/:selected?",
      name: "search",
      component: Search
    },
    {
      path: "/repositories",
      name: "repositories",
      component: Repositories
    },
    { path: "*", component: PageNotFound }
  ]
});

export default router;
