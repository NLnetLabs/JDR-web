import Vue from "vue";
import Router from "vue-router";

import Search from "./views/Search.vue";
import PublicationPoints from "./views/PublicationPoints.vue";
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
      path: "/publicationpoints",
      name: "publicationpoints",
      component: PublicationPoints
    },
    { path: "*", component: PageNotFound }
  ]
});

export default router;
