<template>
  <div id="app">
    <el-container>
      <el-header>
        <el-row>
          <el-col :span="4">
            <router-link :to="{ name: 'home' }">
              <div class="logo">
                <img src="@/assets/images/jdr_logo_white.svg" />
              </div>
            </router-link>
          </el-col>
          <el-col :span="20"
            ><el-menu
              :router="true"
              :default-active="activeIndex"
              mode="horizontal"
              background-color="#92bd11"
              text-color="#fff"
              active-text-color="#fff"
            >
              <el-menu-item index="0" :route="{ name: 'home' }">
                Search Resources
              </el-menu-item>
              <el-menu-item index="1" :route="{ name: 'publicationpoints' }">
                Publication Points
              </el-menu-item>
            </el-menu>
            &nbsp;</el-col
          >
        </el-row>
      </el-header>

      <el-main>
        <router-view />
      </el-main>

      <el-footer height="40px">
        <el-row>
          <el-col :span="12"> &copy; {{ new Date().getFullYear() }} Stichting NLnet Labs </el-col>
          <el-col :span="12" class="text-right">
            <a href="https://nlnetlabs.nl/services/contracts/" target="_blank">{{
              $t("common.supportcontracts")
            }}</a>
            -
            <a href="https://github.com/NLnetLabs/JDR-web/issues/new" target="_blank">{{
              $t("common.report")
            }}</a>
          </el-col>
        </el-row>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeIndex: "0"
    };
  },
  watch: {
    $route(to) {
      this.activeIndex = this.getActiveIndex(to.name);
    }
  },
  mounted: function() {
    this.activeIndex = this.getActiveIndex(this.$route.name);
  },
  methods: {
    getActiveIndex(path) {
      return "" + (["publicationpoints"].indexOf(path) + 1);
    }
  }
};
</script>

<style lang="scss">
html,
body {
  padding: 0;
  margin: 0;
  font-family: "Lato", sans-serif;
  background-color: #fff;
}

.el-container {
  min-height: 100vh;
}

.el-header {
  background: linear-gradient(45deg, #92bd11, #92bd11);
  color: #ffffff;
  z-index: 3;
}

.el-menu-item a {
  text-decoration: none;
}

.logo {
  line-height: 10px;
  img {
    width: 120px;
    margin-top: 8px;
  }
}

.logout {
  margin-left: 2rem;
  cursor: pointer;
}

.toolbar,
.text-right {
  text-align: right;
}

.el-footer {
  z-index: 100;
  background-color: #fafafa;
  color: #999;
  font-size: 13px;
  line-height: 40px;
  a,
  a:hover {
    color: #999;
    font-weight: bold;
    text-decoration: none;
  }
}

a {
  color: #92bd11;
  &:hover {
    color: #00665e;
  }
}

.valign-top {
  vertical-align: top !important;
}

.vue-pan-zoom-item:focus,
.vue-pan-zoom-scene:focus {
  outline: none;
}
</style>
