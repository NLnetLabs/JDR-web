<template>
  <div>
    <el-card class="box-card">
      <el-row>
        <el-col :span="16" :offset="4">
          <div class="text-center welcome">
            <div v-if="firstSearch">
              <img src="@/assets/images/welcome.svg" />
            </div>

            <h3 v-if="firstSearch">
              Welcome to JDR, a tool to help you explore, inspect and troubleshoot anything RPKI.
            </h3>
            <el-form @submit.prevent.native="searchResource">
              <el-form-item>
                <el-input
                  placeholder="Search for prefix, AS number or filename..."
                  prefix-icon="el-icon-search"
                  v-model="search"
                  clearable
                >
                  ></el-input
                >
              </el-form-item>
            </el-form>
            <div class="spacer" v-if="firstSearch">&nbsp;</div>
          </div>
        </el-col>
      </el-row>

      <div class="text item">
        <div v-if="loading" class="no-results">
          <i class="el-icon-loading"></i>
          Searching...
        </div>

        <div v-if="tree.length === 0" class="no-results">
          No results found for <span v-text="searchType"></span>&nbsp;
          <strong><span v-text="searched"></span></strong>
        </div>

        <el-row>
          <el-col :span="24" style="overflow: hidden">
            <panZoom
              :options="{ minZoom: 0.2, maxZoom: 2, beforeWheel }"
              v-if="treeData !== null && treeData.name"
            >
              <TreeChart
                :json="treeData"
                :selectedRoa="roas[activeTab * 1]"
                @click-node="clickNode"
              />
            </panZoom>
          </el-col>
        </el-row>

        <el-tabs v-if="roas.length" v-model="activeTab" @tab-click="clickTab">
          <el-tab-pane
            v-for="(roa, index) in roas"
            :key="index"
            :label="'ROA ' + (index + 1)"
          ></el-tab-pane>
        </el-tabs>

        <el-row>
          <el-col :span="24">
            <div v-if="selectedNode">
              <h4>{{ selectedNode.name }}</h4>

              <div
                class="container"
                v-if="selectedNode.object.objecttype !== 'ROA' && selectedNode.object.object"
              >
                <el-row>
                  <el-col :span="12">
                    <el-row v-if="selectedNode.object.objecttype === 'CER'">
                      <el-col :span="4">
                        Inherit ASNs
                      </el-col>
                      <el-col :span="20">
                        {{ selectedNode.object.object.inherit_ASNs }}
                      </el-col>
                    </el-row>
                    <el-row v-if="selectedNode.object.objecttype === 'CER'">
                      <el-col :span="4">
                        Inherit v4 Prefixes
                      </el-col>
                      <el-col :span="20">
                        {{ selectedNode.object.object.inherit_v4_prefixes }}
                      </el-col>
                    </el-row>
                    <el-row v-if="selectedNode.object.objecttype === 'CER'">
                      <el-col :span="4">
                        Inherit v6 Prefixes
                      </el-col>
                      <el-col :span="20">
                        {{ selectedNode.object.object.inherit_v6_prefixes }}
                      </el-col>
                    </el-row>
                    <el-row v-if="selectedNode.object.objecttype === 'CER'">
                      <el-col :span="4">
                        Manifest
                      </el-col>
                      <el-col :span="20">
                        <a :href="selectedNode.object.object.manifest">{{
                          selectedNode.object.object.manifest
                        }}</a>
                      </el-col>
                    </el-row>
                    <el-row v-if="selectedNode.object.objecttype === 'CER'">
                      <el-col :span="4">
                        Pubpoint
                      </el-col>
                      <el-col :span="20">
                        <a :href="selectedNode.object.object.pubpoint">{{
                          selectedNode.object.object.pubpoint
                        }}</a>
                      </el-col>
                    </el-row>
                    <el-row v-if="selectedNode.object.objecttype === 'CER'">
                      <el-col :span="4">
                        RRDP notify
                      </el-col>
                      <el-col :span="20">
                        <a :href="selectedNode.object.object.rrdp_notify">{{
                          selectedNode.object.object.rrdp_notify
                        }}</a>
                      </el-col>
                    </el-row>
                    <el-row>
                      <el-col :span="4">
                        Remarks
                      </el-col>
                      <el-col :span="20">
                        <el-tag type="warning" v-if="selectedNode.object.remark_counts_me.WARN"
                          >{{ selectedNode.object.remark_counts_me.WARN }} WARNINGS</el-tag
                        >
                        <el-tag type="danger" v-if="selectedNode.object.remark_counts_me.ERR"
                          >{{ selectedNode.object.remark_counts_me.ERR }} ERRORS</el-tag
                        >
                      </el-col>
                    </el-row>
                    <el-row>
                      <el-col :span="4">
                        Remarks children
                      </el-col>
                      <el-col :span="20">
                        <el-tag
                          type="warning"
                          v-if="selectedNode.object.remark_counts_children.WARN"
                          >{{ selectedNode.object.remark_counts_children.WARN }} WARNINGS</el-tag
                        >
                        <el-tag type="danger" v-if="selectedNode.object.remark_counts_children.ERR"
                          >{{ selectedNode.object.remark_counts_children.ERR }} ERRORS</el-tag
                        >
                      </el-col>
                    </el-row>
                  </el-col>
                  <el-col :span="12">
                    <el-row>
                      <el-col :span="24">
                        <el-tree
                          class="filter-tree"
                          :data="objectTree"
                          :props="defaultProps"
                          default-expand-all
                          ref="tree"
                          v-if="objectTree"
                          style="max-height: 300px; overflow-y:auto"
                        >
                          <span class="custom-tree-node" slot-scope="{ node, data }">
                            <span v-if="data.nicename"
                              >{{ data.nicename }} <span class="tagname">{{ data.tag }}</span></span
                            >
                            <span v-if="!data.nicename" class="name">{{ data.tag }}</span>
                            <strong v-if="data.nicevalue">&nbsp;&nbsp;{{ data.nicevalue }}</strong>
                            &nbsp;&nbsp;
                            <span v-for="(remark, index) in data.remarks" :key="index">
                              <el-tag size="mini" type="warning" v-if="remark.lvl === 'WARN'">{{
                                remark.msg
                              }}</el-tag>
                              <el-tag size="mini" type="danger" v-if="remark.lvl === 'ERROR'">{{
                                remark.msg
                              }}</el-tag>
                            </span>
                          </span>
                        </el-tree>
                      </el-col>
                    </el-row>
                  </el-col>
                </el-row>
              </div>

              <div
                class="container"
                v-if="selectedNode.objecttype === 'ROA' && selectedNode.object"
              >
                <el-row>
                  <el-col :span="12">
                    <el-row>
                      <el-col :span="4">
                        <strong>ASN</strong>
                      </el-col>
                      <el-col :span="20">
                        {{ selectedNode.object.asid }}
                      </el-col>
                    </el-row>
                    <el-row align="middle">
                      <el-col :span="4">
                        <strong>VRPS</strong>
                      </el-col>
                      <el-col :span="20">
                        <el-table
                          size="small"
                          :data="selectedNode.object.vrps"
                          style="width: 100%"
                          height="220"
                        >
                          <el-table-column label="Prefix"
                            ><template slot-scope="scope"
                              >{{ scope.row.prefix }}-{{ scope.row.maxlength }}</template
                            ></el-table-column
                          >
                        </el-table>
                      </el-col>
                    </el-row>
                    <el-row align="middle">
                      <el-col :span="4">
                        <strong>Remarks</strong>
                      </el-col>
                      <el-col :span="20">
                        <el-tag type="warning" v-if="selectedNode.remark_counts_me.WARN"
                          >{{ selectedNode.remark_counts_me.WARN }} WARNINGS</el-tag
                        >
                        <el-tag type="danger" v-if="selectedNode.remark_counts_me.ERR"
                          >{{ selectedNode.remark_counts_me.ERR }} ERRORS</el-tag
                        >
                      </el-col>
                    </el-row>
                  </el-col>
                  <el-col :span="12">
                    <el-row>
                      <el-col :span="24">
                        <el-tree
                          class="filter-tree"
                          :data="objectTree"
                          :props="defaultProps"
                          default-expand-all
                          ref="tree"
                          v-if="objectTree"
                          style="max-height: 300px; overflow-y:auto"
                        >
                          <span class="custom-tree-node" slot-scope="{ node, data }">
                            <span v-if="data.nicename"
                              >{{ data.nicename }} <span class="tagname">{{ data.tag }}</span></span
                            >
                            <span v-if="!data.nicename" class="name">{{ data.tag }}</span>
                            <strong v-if="data.nicevalue">&nbsp;&nbsp;{{ data.nicevalue }}</strong>
                            &nbsp;&nbsp;
                            <span v-for="(remark, index) in data.remarks" :key="index">
                              <el-tag size="mini" type="warning" v-if="remark.lvl === 'WARN'">{{
                                remark.msg
                              }}</el-tag>
                              <el-tag size="mini" type="danger" v-if="remark.lvl === 'ERROR'">{{
                                remark.msg
                              }}</el-tag>
                            </span>
                          </span>
                        </el-tree>
                      </el-col>
                    </el-row>
                  </el-col>
                </el-row>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script>
import TreeChart from "@/components/TreeChart";
import APIService from "@/services/APIService.js";
const isIp = require("is-ip");
const cidrRegex = require("cidr-regex");
import router from "@/router";

const SEARCH_TYPES = {
  PREFIX: "prefix",
  ASN: "asn",
  FILENAME: "filename"
};

export default {
  components: {
    TreeChart
  },
  data() {
    return {
      loading: false,
      tree: {},
      search: this.$route.params.search,
      searched: "",
      error: "",
      selectedNode: null,
      activeTab: "0",
      currentObject: {},
      defaultProps: {
        children: "children",
        label: "tag"
      },
      treeData: null,
      searchType: null,
      firstSearch: true
    };
  },
  computed: {
    objectTree() {
      if (this.currentObject && this.currentObject.data && this.currentObject.data.tree)
        return [this.currentObject.data.tree];
      return null;
    },
    roas() {
      let roas = [];
      function traverse(children) {
        if (children && children.length) {
          children.forEach(child => {
            if (
              child.object &&
              child.object.objecttype !== "ROA" &&
              child.children &&
              child.children.length
            ) {
              traverse(child.children);
            } else if (child.object && child.object.objecttype === "ROA") {
              let obj = child.object;
              obj.name = child.name;
              roas.push(obj);
            }
          });
        }
      }

      if (this && this.tree && this.tree.children) {
        traverse(this.tree.children);
      }

      return roas;
    }
  },
  created() {
    window.addEventListener("beforeunload", this.beforeUnload);
    this.loading = false;
    if (this.search) {
      this.doSearch(this.search);
    } else if (localStorage.getItem("jdr_last_search")) {
      this.search = localStorage.getItem("jdr_last_search");
      this.doSearch(this.search);
    }
  },
  beforeRouteUpdate(to, from, next) {
    this.search = to.params.search;
    this.doSearch(this.search);
    next();
  },
  methods: {
    beforeUnload() {
      localStorage.removeItem("jdr_last_search");
    },
    beforeWheel(e) {
      var shouldIgnore = !e.altKey;
      return shouldIgnore;
    },
    clickNode(node) {
      if (node.object.objecttype !== "ROA") {
        this.selectedNode = node;
      } else {
        this.roas.forEach((r, i) => {
          if (node.object && r.name === node.object.name) {
            this.activeTab = i + "";
            this.clickTab();
          }
        });
      }
      APIService.getObject(node.object.filename).then(response => {
        this.currentObject = response.data;
      });
    },
    clickTab() {
      this.selectedNode = this.roas[this.activeTab * 1];
      this.treeData = this.getTreeData(this.activeTab);
    },
    getTreeData(index) {
      let tree = this.tree;
      const roas = this.roas;
      const self = this;
      function traverse(node) {
        if (node && node.name) {
          let mates = node.mates;
          let newMates = [];
          if (mates) {
            mates.forEach(m => {
              newMates.push({
                name: m.name,
                object: m.object,
                class: ["clickable"],
                image_url: self.getNodeImage(""),
                warnings: m.object ? m.object.remark_counts_me.WARN : 0,
                errors: m.object ? m.object.remark_counts_me.ERROR : 0
              });
            });
          }

          node.siblings = newMates;

          let children = node.children;
          node.image_url = self.getNodeImage(node.name, node.newPubpoint);
          node.warnings = node.object ? node.object.remark_counts_me.WARN : 0;
          node.errors = node.object ? node.object.remark_counts_me.ERROR : 0;
          if (node.name !== "root") {
            node.class = ["clickable"];
            if (node.selected) {
              node.class = ["selected"];
            }
          }

          if (children && children.length) {
            children.forEach(child => {
              if (child.children && child.children.length) {
                traverse(child);
              }
              if (child.object && child.object.objecttype === "ROA") {
                if (child.name === roas[index].name) {
                  child.image_url = self.getNodeImage("green");
                } else {
                  child.image_url = self.getNodeImage("white");
                }
                child.warnings = child.object.remark_counts_me.WARN;
                child.errors = child.object.remark_counts_me.ERROR;
              } else if (!child.children || child.children.length === 0) {
                child.image_url = self.getNodeImage("green");
              }
            });
          }
        }
      }
      traverse(tree);
      return tree;
    },
    doSearch(search) {
      const self = this;
      self.firstSearch = false;
      self.tree = {};
      self.selectedNode = null;
      self.activeTab = "0";
      self.treeData = null;
      function selectNode(response) {
        self.loading = false;
        self.tree =
          Array.isArray(response.data.data) && response.data.data.length > 0
            ? response.data.data[0]
            : response.data.data;
        if (!self.selectedNode) {
          if (self.roas.length) {
            self.selectedNode = self.roas[0];
          }
          self.treeData = self.getTreeData(0);
        }
        if (self.selectedNode) {
          APIService.getObject(self.selectedNode.filename).then(response => {
            self.currentObject = response.data;
          });
        }
      }
      this.searched = search;
      if (isIp(search) || cidrRegex({ exact: true }).test(search)) {
        this.searchType = SEARCH_TYPES.PREFIX;
        APIService.getPrefix(search).then(response => {
          selectNode(response);
        });
      } else if (search && search.toLowerCase().indexOf("as") === 0) {
        this.searchType = SEARCH_TYPES.ASN;
        APIService.getASN(search).then(response => {
          selectNode(response);
        });
      } else {
        this.searchType = SEARCH_TYPES.FILENAME;
        APIService.getFilename(encodeURIComponent(search)).then(response => {
          selectNode(response);
        });
      }
      return false;
    },
    searchResource() {
      this.loading = true;
      if (this.$route.params.search !== this.search) {
        if (this.search) {
          router.push("/search/" + encodeURIComponent(this.search));
        } else {
          router.push("/");
        }
      }
      localStorage.setItem("jdr_last_search", this.search);
      this.doSearch(this.search);
    }
  }
};
</script>

<style lang="scss">
h4 {
  padding: 0.8rem;
  border-bottom: 1px solid #ebeef5;
  background-color: #fafafa;
  margin-top: 0;
}
.tagname {
  color: #bbb;
}
.box-card {
  margin: 0;
}
.search-input {
  float: right;
  margin-top: -27px;
}
.modal-footer {
  margin-top: 30px;
  .el-form-item {
    margin-bottom: 0;
  }
}
.empty {
  font-size: 14px;
}
.el-tag {
  margin-right: 10px;
  margin-bottom: 10px;
}
.avat {
  border: none;
}
.clickable {
  cursor: pointer;
}
.container {
  font-size: 0.9rem;
  .el-row {
    padding: 0.8rem;
    overflow-x: hidden;
    word-break: break-word;
  }
}
.no-results {
  padding: 1rem;
  text-align: center;
}
.text-center {
  text-align: center;
}

.welcome {
  img {
    height: 160px;
    width: 200px;
    margin: 2.5rem;
  }
  h3 {
    margin-bottom: 2.5rem;
  }
  .spacer {
    margin-bottom: 4rem;
  }
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
</style>
