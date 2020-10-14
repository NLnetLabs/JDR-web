<template>
  <div>
    <el-card class="box-card">
      <div class="text item">
        <span v-if="loading">
          <i class="el-icon-loading"></i>
          Searching...
        </span>
        <panZoom :options="{ minZoom: 0.2, maxZoom: 2, bounds: false, boundPadding: 0, beforeWheel }">
          <div>
            <TreeChart :json="publicationPoints.data" />
          </div>
        </panZoom>
      </div>
    </el-card>
  </div>
</template>

<script>
import TreeChart from "@/components/TreeChart";
import APIService from "@/services/APIService.js";

export default {
  components: {
    TreeChart
  },
  data() {
    return {
      loading: false,
      publicationPoints: {}
    };
  },
  created() {
    this.loading = false;
    this.loadPublicationPoints();
  },
  methods: {
    beforeWheel: function(e) {
      // allow wheel-zoom only if altKey is down
      var shouldIgnore = !e.altKey;
      return shouldIgnore;
    },
    getTreeData: function(inputTree) {
      let tree = inputTree;
      const self = this;
      function traverse(node) {
        node.image_url = self.getNodeImage(node.name, node.newPubpoint);

        let children = node.children;
        if (children && children.length) {
          children.forEach(child => {
            child.image_url = self.getNodeImage(child.name, child.newPubpoint);
            if (child.children && child.children.length) {
              traverse(child);
            }
          });
        }
      }
      traverse(tree);
      return { data: tree };
    },
    loadPublicationPoints: function() {
      this.loading = true;
      APIService.getPublicationPoints().then(response => {
        this.loading = false;
        this.publicationPoints = this.getTreeData(response.data.data);
      });
      return false;
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
.node .leaf .name {
  font-size: 0.9rem;
  text-overflow: ellipsis;
}
.clickable {
  cursor: pointer;
}
// .container {
//   .el-row {
//     padding: 0.8rem;
//     border-bottom: 1px solid #ebeef5;
//   }
//   .el-row:nth-child(odd) {
//     background-color: #fafafa;
//   }
// }
</style>
