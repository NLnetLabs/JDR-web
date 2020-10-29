<template>
  <div>
    <el-card shadow="never">
      <div class="text item">
        <span v-if="loading">
          <i class="el-icon-loading"></i>
          Searching...
        </span>
        <panZoom
          :options="{ minZoom: 0.2, maxZoom: 2, bounds: false, boundPadding: 0, beforeWheel }"
        >
          <div>
            <TreeChart :json="repositories.data" @click-node="clickNode" />
          </div>
        </panZoom>
      </div>
    </el-card>
  </div>
</template>

<script>
import TreeChart from "@/components/TreeChart";
import APIService from "@/services/APIService.js";
import router from "@/router";

export default {
  components: {
    TreeChart
  },
  data() {
    return {
      loading: false,
      rawRepositories: null,
      rawRepositoriesStatus: null,
      repositories: {}
    };
  },
  created() {
    this.loading = false;
    this.loadRepositories();
  },
  methods: {
    beforeWheel: function(e) {
      // allow wheel-zoom only if altKey is down
      var shouldIgnore = !e.altKey;
      return shouldIgnore;
    },
    getStatusError(name) {
      return this.rawRepositoriesStatus[name].ping4.global_alert
        ? "v4"
        : "" + "" + this.rawRepositoriesStatus[name].ping6.global_alert
        ? "v6"
        : "";
    },
    getTreeData() {
      let tree = this.rawRepositories;
      const self = this;
      function traverse(node) {
        node.image_url = self.getNodeImage(node.name, node.newPubpoint);
        if (self.rawRepositoriesStatus) {
          if (self.rawRepositoriesStatus[node.name]) {
            node.additionalInfo = self.getStatusError(node.name);
          } else {
            node.additionalInfo = "?";
          }
        }
        node.warnings = node.object ? node.object.remark_counts_me.WARN : 0;
        node.errors = node.object ? node.object.remark_counts_me.ERROR : 0;
        let children = node.children;
        if (children && children.length) {
          children.forEach(child => {
            child.image_url = self.getNodeImage(child.name, child.newPubpoint);
            if (self.rawRepositoriesStatus) {
              if (self.rawRepositoriesStatus[child.name]) {
                child.additionalInfo = self.getStatusError(child.name);
              } else {
                child.additionalInfo = "?";
              }
            }
            child.warnings = child.object ? child.object.remark_counts_me.WARN : 0;
            child.errors = child.object ? child.object.remark_counts_me.ERROR : 0;
            if (child.children && child.children.length) {
              traverse(child);
            }
          });
        }
      }
      traverse(tree);
      return { data: tree };
    },
    loadRepositories() {
      this.loading = true;
      APIService.getRepositoriesStatus().then(response => {
        this.rawRepositoriesStatus = response.data.data;
        APIService.getRepositories().then(response => {
          this.loading = false;
          this.rawRepositories = response.data.data;
          this.repositories = this.getTreeData();
        });
      });

      return false;
    },
    clickNode(node) {
      router.push("/search/" + encodeURIComponent(node.object.filename));
    }
  }
};
</script>

<style lang="scss">
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
</style>
