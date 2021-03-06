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
          <el-col :span="12"
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
              <el-menu-item index="1" :route="{ name: 'repositories' }">
                Repositories
              </el-menu-item>
            </el-menu>
            &nbsp;</el-col
          >
          <el-col :span="8">
            <el-menu
              mode="horizontal"
              background-color="#92bd11"
              text-color="#fff"
              active-text-color="#fff"
              default-active=""
            >
              <el-menu-item @click="showHelp = true" class="help-menu">
                <i class="el-icon-help"></i>
              </el-menu-item>
              <el-menu-item class="help-menu" disabled v-if="lastUpdate" :title="fromNow(lastUpdate)">
                Last update {{ getTimestamp(lastUpdate) }}
              </el-menu-item>
            </el-menu>
          </el-col>
        </el-row>
      </el-header>

      <el-main>
        <router-view v-on:update-last="updateLastUpdate" />
      </el-main>

      <el-footer height="40px">
        <el-row>
          <el-col :span="12">
            &copy; {{ new Date().getFullYear() }} Stichting NLnet Labs, partly funded by the RIPE
            NCC Community Fund</el-col
          >
          <el-col :span="12" class="text-right">
            <a href="https://github.com/NLnetLabs/JDR-web/issues/new" target="_blank">{{
              $t("common.report")
            }}</a>
          </el-col>
        </el-row>
      </el-footer>
    </el-container>
    <el-drawer title="JDR Help" :visible.sync="showHelp" :with-header="false">
      <div class="help">
        <h4>Welcome to JDR, a tool to help you explore, inspect and troubleshoot anything RPKI.</h4>
        <div class="with-padding">
          Use the search box on this page to
          <ul>
            <li>
              search for prefixes on ROAs: <code>2001:db8::/32</code> yields all the ROAs that
              contain a VRP with this prefix, or a more-specific. If no such ROAs exist, the query
              falls back to return ROAs with the first less-specific NB: a query without explicit
              prefix size is interpreted as the full /128 or /32, e.g. <code>2001:db8::</code> is
              interpreted as <code>2001:db8::/128</code>
            </li>
            <li>
              search for AS numbers: any 32bit number prefixed by "AS" or "ASN", e.g.
              <code>AS199664</code>, or <code>ASN199664</code>
            </li>
            <li>
              search for (part of) the filename of any .crt/.mft/.crl/.roa. The number of results is
              limited to 10.
            </li>
          </ul>
          <br />
          On the Publication Points tab you can see the overall status of the entire distributed
          RPKI repository.
          <br /><br />
          Good to know: for now, all information shown in this tool is based on the
          <strong>rsync</strong> distributed RPKI files. RRDP is on our roadmap. Files are retrieved
          and processed every 10 minutes.
          <br /><br />
          To zoom in/out on the tree charts, use the mouse wheel while pressing Alt/Option on your keyboard.
          <br /><br />
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import * as moment from "moment";

export default {
  data() {
    return {
      activeIndex: "0",
      showHelp: false,
      lastUpdate: ""
    };
  },
  watch: {
    $route: {
      handler(to) {
        this.activeIndex = this.getActiveIndex(to.name);
        if (to.name === 'repositories') {
          document.title = "JDR: Repository overview";
        } else if (to.name === 'search') {
          // handled in Search.vue
        } else {
          document.title = "JDR";
        }
      }
    }
  },
  mounted: function() {
    this.activeIndex = this.getActiveIndex(this.$route.name);
    localStorage.removeItem("jdr_last_search");
  },
  methods: {
    getActiveIndex(path) {
      return "" + (["repositories"].indexOf(path) + 1);
    },
    getTimestamp(timestamp) {
      return moment.utc(timestamp).format() + " UTC";
    },
    fromNow(timestamp) {
      return moment.utc(timestamp).fromNow();
    },
    updateLastUpdate(timestamp) {
      this.lastUpdate = timestamp;
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

.help-menu {
  float: right !important;
  i {
    color: #ffffff !important;
  }
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

.el-drawer__body {
  overflow-y: auto;
}

.help {
  line-height: 1.4rem;
  color: #666;
  code {
    background: #e4f7ae;
    padding: 0.2rem;
  }
  .with-padding {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

.el-card {
  border: none !important;
  .el-card__body {
    padding: 0 !important;
  }
}

.vue-pan-zoom-item {
  cursor: move;
  background: #F6F6F6;
  border-radius: 4px;
}

.is-disabled, .el-collapse-item.is-disabled .el-collapse-item__header {
  cursor: default !important;
}
</style>
