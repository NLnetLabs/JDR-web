import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "./plugins/element.js";
import "./plugins/utils.js";
import i18n from "./i18n";
import(/* webpackPreload: true */ "typeface-lato/index.css");
import(/* webpackPreload: true */ "typeface-source-code-pro/index.css");

import JsonViewer from 'vue-json-viewer';
Vue.use(JsonViewer)

import panZoom from 'vue-panzoom'
Vue.use(panZoom);

import textMiddleEllipsis from 'vue-text-middle-ellipsis';
Vue.use(textMiddleEllipsis);

Vue.config.productionTip = false;

new Vue({
  router,
  i18n,
  render: h => h(App)
}).$mount("#app");
