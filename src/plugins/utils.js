import Vue from "vue";

Vue.mixin({
  methods: {
    getNodeImage: function(n, pubpoint) {
      const name = n.toLowerCase();
      if (name === "root" || name === "green") {
        return require("@/assets/images/green.svg");
      } else if (name === "white") {
        return require("@/assets/images/white.svg");
      } else if (name.indexOf("ripe") > -1) {
        return require("@/assets/images/ripencc.svg");
      } else if (name.indexOf("lacnic") > -1) {
        return require("@/assets/images/lacnic.svg");
      } else if (name.indexOf("apnic") > -1) {
        return require("@/assets/images/apnic.svg");
      } else if (name.indexOf("afrinic") > -1) {
        return require("@/assets/images/afrinic.svg");
      } else if (name.indexOf("arin") > -1) {
        return require("@/assets/images/arin.svg");
      }
      if (pubpoint) {
        return require("@/assets/images/switch.svg");  
      }
      return require("@/assets/images/lightgreen.svg");
    }
  }
});
