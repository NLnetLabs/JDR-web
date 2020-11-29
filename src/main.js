import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "./plugins/element.js";
import "./plugins/utils.js";
import i18n from "./i18n";
import(/* webpackPreload: true */ "typeface-lato/index.css");
import(/* webpackPreload: true */ "typeface-source-code-pro/index.css");

import JsonViewer from "vue-json-viewer";
Vue.use(JsonViewer);

import panZoom from "vue-panzoom";
Vue.use(panZoom);

import textMiddleEllipsis from "vue-text-middle-ellipsis";
Vue.use(textMiddleEllipsis);

import VueMatomo from "vue-matomo";
Vue.use(VueMatomo, {
  host: "//webstats.aws.nlnetlabs.nl/",
  siteId: 4,
  router: router,
  enableHeartBeatTimer: true,
  preInitActions: []
});

Vue.config.productionTip = true;

new Vue({
  router,
  i18n,
  render: h => h(App)
}).$mount("#app");
