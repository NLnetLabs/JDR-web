<template>
  <div>
    <el-card class="box-card">
      <el-form>
        <el-form-item>
          <el-input
            placeholder="Search prefix or AS number"
            prefix-icon="el-icon-search"
            v-model="search"
            @keyup.enter.native="searchResource()"
            clearable
          ></el-input>
        </el-form-item>
      </el-form>

      <div class="text item">
        <span v-if="loading">
          <i class="el-icon-loading"></i>
          Searching...
        </span>

        <el-tabs type="border-card" v-if="roas.length" v-model="activeTab" @tab-click="clickTab">
          <el-tab-pane v-for="(roa, index) in roas" :key="index" :label="'ROA ' + (index + 1)">
            <el-row>
              <el-col :span="24" style="overflow: hidden">
                <panZoom
                  :options="{ minZoom: 0.2, maxZoom: 2, beforeWheel }"
                  v-if="activeTab === index + ''"
                >
                  <TreeChart :json="getTreeData(activeTab)" @click-node="clickNode" />
                </panZoom>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <div v-if="selectedNode">
                  <h4>{{ selectedNode.name }}</h4>

                  <div
                    class="container"
                    v-if="selectedNode.object.objecttype !== 'ROA' && selectedNode.object.object"
                  >
                    <el-row v-if="selectedNode.object.objecttype === 'CER'">
                      <el-col :span="8">
                        Inherit ASNs
                      </el-col>
                      <el-col :span="16">
                        {{ selectedNode.object.object.inherit_ASNs }}
                      </el-col>
                    </el-row>
                    <el-row v-if="selectedNode.object.objecttype === 'CER'">
                      <el-col :span="8">
                        Inherit Prefixes
                      </el-col>
                      <el-col :span="16">
                        {{ selectedNode.object.object.inherit_prefixes }}
                      </el-col>
                    </el-row>
                    <el-row v-if="selectedNode.object.objecttype === 'CER'">
                      <el-col :span="8">
                        Manifest
                      </el-col>
                      <el-col :span="16">
                        <a :href="selectedNode.object.object.manifest">{{
                          selectedNode.object.object.manifest
                        }}</a>
                      </el-col>
                    </el-row>
                    <el-row v-if="selectedNode.object.objecttype === 'CER'">
                      <el-col :span="8">
                        Pubpoint
                      </el-col>
                      <el-col :span="16">
                        <a :href="selectedNode.object.object.pubpoint">{{
                          selectedNode.object.object.pubpoint
                        }}</a>
                      </el-col>
                    </el-row>
                    <el-row v-if="selectedNode.object.objecttype === 'CER'">
                      <el-col :span="8">
                        RRDP notify
                      </el-col>
                      <el-col :span="16">
                        <a :href="selectedNode.object.object.rrdp_notify">{{
                          selectedNode.object.object.rrdp_notify
                        }}</a>
                      </el-col>
                    </el-row>
                    <el-row>
                      <el-col :span="8">
                        Remarks
                      </el-col>
                      <el-col :span="16">
                        <!-- <el-tag type="info">DEBUG {{ selectedNode.object.remark_counts_me.DBG }}</el-tag> -->
                        <!-- <el-tag type="success">INFO {{ selectedNode.object.remark_counts_me.INFO }}</el-tag> -->
                        <el-tag type="warning"
                          >WARNING {{ selectedNode.object.remark_counts_me.WARN }}</el-tag
                        >
                        <el-tag type="danger"
                          >ERROR {{ selectedNode.object.remark_counts_me.ERR }}</el-tag
                        >
                      </el-col>
                    </el-row>
                    <el-row>
                      <el-col :span="8">
                        Remarks children
                      </el-col>
                      <el-col :span="16">
                        <!-- <el-tag type="info">DEBUG {{ selectedNode.object.remark_counts_children.DBG }}</el-tag> -->
                        <!-- <el-tag type="success">INFO {{ selectedNode.object.remark_counts_children.INFO }}</el-tag> -->
                        <el-tag type="warning"
                          >WARNING {{ selectedNode.object.remark_counts_children.WARN }}</el-tag
                        >
                        <el-tag type="danger"
                          >ERROR {{ selectedNode.object.remark_counts_children.ERR }}</el-tag
                        >
                      </el-col>
                    </el-row>
                    <el-row>
                      <el-col :span="8">
                        Raw object
                      </el-col>
                      <el-col :span="16">
                        <!-- <json-viewer :value="currentObject"></json-viewer> -->
                        <el-tree
                          class="filter-tree"
                          :data="objectTree"
                          :props="defaultProps"
                          default-expand-all
                          ref="tree"
                          v-if="objectTree"
                        >
                          <span class="custom-tree-node" slot-scope="{ node, data }">
                            <span v-if="data.nicename"
                              >{{ data.nicename }} <span class="tagname">{{ data.tag }}</span></span
                            >
                            <span v-if="!data.nicename" class="name">{{ data.tag }}</span>
                            &nbsp;&nbsp;<el-tag size="mini" type="warning" v-if="data.remarks"
                              >*</el-tag
                            >
                          </span>
                        </el-tree>
                      </el-col>
                    </el-row>
                  </div>

                  <div
                    class="container"
                    v-if="selectedNode.objecttype === 'ROA' && selectedNode.object"
                  >
                    <el-row>
                      <el-col :span="8">
                        ASN
                      </el-col>
                      <el-col :span="16">
                        {{ selectedNode.object.asid }}
                      </el-col>
                    </el-row>
                    <el-row align="middle">
                      <el-col :span="8">
                        VRPS
                      </el-col>
                      <el-col :span="16">
                        <el-table size="small" :data="selectedNode.object.vrps" style="width: 100%">
                          <el-table-column label="Prefix" prop="prefix"> </el-table-column>
                          <el-table-column label="Max Length" prop="maxlength"> </el-table-column>
                        </el-table>
                      </el-col>
                    </el-row>
                    <el-row align="middle">
                      <el-col :span="8">
                        Remarks
                      </el-col>
                      <el-col :span="16">
                        <!-- <el-tag type="info">DEBUG {{ selectedNode.remark_counts_me.DBG }}</el-tag>
                        <el-tag type="success">INFO {{ selectedNode.remark_counts_me.INFO }}</el-tag> -->
                        <el-tag type="warning"
                          >WARNING {{ selectedNode.remark_counts_me.WARN }}</el-tag
                        >
                        <el-tag type="danger">ERROR {{ selectedNode.remark_counts_me.ERR }}</el-tag>
                      </el-col>
                    </el-row>
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<script>
import TreeChart from "@/components/TreeChart";
import APIService from "@/services/APIService.js";
const isIp = require("is-ip");

export default {
  components: {
    TreeChart
  },
  data() {
    return {
      loading: false,
      tree: {},
      search: "",
      error: "",
      selectedNode: null,
      activeTab: "0",
      currentObject: {},
      defaultProps: {
        children: "children",
        label: "tag"
      }
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
            if (child.object && child.object.objecttype !== "ROA" && child.children.length) {
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
    if (localStorage.getItem("jdr_last_search")) {
      this.search = localStorage.getItem("jdr_last_search");
      this.doSearch(this.search);
    }
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
        APIService.getObject(node.object.filename).then(response => {
          this.currentObject = response.data;
        });
      } else {
        this.selectedNode = this.roas[this.activeTab * 1];
      }
    },
    clickTab() {
      this.selectedNode = this.roas[this.activeTab * 1];
    },
    getTreeData(index) {
      let tree = this.tree;
      const roas = this.roas;
      const self = this;
      function traverse(node) {
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
        node.image_url = self.getNodeImage(node.name);
        node.warnings = node.object ? node.object.remark_counts_me.WARN : 0;
        node.errors = node.object ? node.object.remark_counts_me.ERROR : 0;
        if (node.name !== "root" && node.object.objecttype !== "ROA") {
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
            }
          });
        }
      }
      traverse(tree);
      return tree;
    },
    doSearch(search) {
      if (isIp(search)) {
        APIService.getPrefix(search).then(response => {
          this.loading = false;
          this.tree = response.data.data;
          if (!this.selectedNode) {
            this.selectedNode = this.roas[0];
          }
        });
      } else {
        APIService.getASN(search).then(response => {
          this.loading = false;
          this.tree = response.data.data;
          if (!this.selectedNode) {
            this.selectedNode = this.roas[0];
          }
        });
      }
      return false;
    },
    searchResource() {
      this.loading = true;
      localStorage.setItem("jdr_last_search", this.search);
      this.doSearch(this.search);
    }
  }
};
</script>

<style lang="scss">
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
.node .leaf .name {
  font-size: 0.9rem;
  text-overflow: ellipsis;
}
.clickable {
  cursor: pointer;
}
.container {
  font-size: 0.9rem;
  .el-row {
    padding: 0.8rem;
    border-bottom: 1px solid #ebeef5;
  }
  .el-row:nth-child(odd) {
    background-color: #fafafa;
  }
}
</style>
