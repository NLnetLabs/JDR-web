<template>
  <div>
    <el-card shadow="never">
      <div class="text item">
        <div v-if="loading" class="no-results">
          <i class="el-icon-loading"></i>
          Loading...
        </div>
        <panZoom
          :options="{ minZoom: 0.2, maxZoom: 2, bounds: false, boundPadding: 0, beforeWheel }"
          @panstart="onPanStart"
          @panend="onPanEnd"
        >
          <div>
            <TreeChart :json="repositories.data" @click-node="clickNode" style="padding-top: 1rem" />
          </div>
        </panZoom>
      </div>
    </el-card>

    <el-card shadow="never" style="margin-top: 2rem">
      <el-collapse>
        <el-collapse-item
          v-for="(repo, index) in repositoriesStats.data"
          :key="index"
          :name="index"
          :disabled="repo[Object.keys(repo)[0]].remarks.length === 0"
        >
          <template slot="title">
            <div :class="repo[Object.keys(repo)[0]].remarks.length > 0 ? 'danger' : 'all-good'">
              <i class="el-icon-warning" v-if="repo[Object.keys(repo)[0]].remarks.length > 0"></i
              ><i
                class="el-icon-success"
                v-if="repo[Object.keys(repo)[0]].remarks.length === 0"
              ></i>
            </div>
            &nbsp; {{ Object.keys(repo)[0] }}
          </template>
          <div>
            <el-table
              size="small"
              :data="repo[Object.keys(repo)[0]].remarks"
              style="width: 100%"
              :show-header="false"
            >
              <el-table-column label="Level" width="70"
                ><template slot-scope="scope">
                  <div :class="scope.row.lvl === 'ERR' ? 'danger' : 'warning'">
                    <i class="el-icon-warning"></i> {{ scope.row.lvl }}
                  </div>
                </template></el-table-column
              >
              <el-table-column label="Type" prop="type" width="100"></el-table-column>
              <el-table-column label="View" width="100"
                ><template slot-scope="scope"
                  ><a href="javascript:void(0)" @click="viewFile(scope.row)">View</a></template
                ></el-table-column
              >
              <el-table-column label="Message" prop="msg"></el-table-column>
            </el-table>
          </div>
        </el-collapse-item>
      </el-collapse>
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
      repositoriesStats: {},
      repositories: {},
      isPanning: false
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
        ? this.rawRepositoriesStatus[name].ping4.total_alerts + " alerts on ping v4"
        : "" + " " + this.rawRepositoriesStatus[name].ping6.global_alert
        ? this.rawRepositoriesStatus[name].ping6.total_alerts + " alerts on ping v6"
        : "";
    },
    setAdditionalInfo(node) {
      if (this.rawRepositoriesStatus[node.name]) {
        if (
          this.rawRepositoriesStatus[node.name].ping4.total_alerts > 7 ||
          this.rawRepositoriesStatus[node.name].ping6.total_alerts > 7
        ) {
          node.additionalInfoSeverity = "warning";
          node.additionalInfo = this.getStatusError(node.name);
        }
      } else {
        node.additionalInfoSeverity = "info";
        node.additionalInfo = "Not available on RIPE Atlas";
      }
    },
    getTreeData() {
      let tree = this.rawRepositories;
      const self = this;
      function traverse(node) {
        node.image_url = self.getNodeImage(node.name, true);
        if (self.rawRepositoriesStatus && node.name !== "root") {
          self.setAdditionalInfo(node);
        }
        if (node.name !== "root") {
          node.class = ["clickable"];
        }
        node.errors = node.object ? node.object.remark_counts_children.ERR : 0;
        let children = node.children;
        if (children && children.length) {
          children.forEach(child => {
            child.image_url = self.getNodeImage(child.name, true);
            child.class = ["clickable"];
            if (self.rawRepositoriesStatus) {
              self.setAdditionalInfo(child);
            }
            child.errors = child.object ? child.object.remark_counts_children.ERR : 0;
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

      APIService.getRepositoriesStats().then(response => {
        this.repositoriesStats = response.data;
      });

      return false;
    },
    clickNode(node) {
      if (!this.isPanning) {
        router.push("/search/" + encodeURIComponent(node.object.filename));
      }
    },
    viewFile(row) {
      router.push("/search/" + row.url.split("/").pop());
    },
    onPanStart() {
      this.isPanning = true;
    },
    onPanEnd() {
      this.isPanning = false;
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

.all-good {
  color: #92bd11;
}
.danger {
  color: #f56c6c;
}

.warning {
  color: #e6a23c;
}

.no-results {
  padding: 1rem;
  text-align: center;
}

</style>
