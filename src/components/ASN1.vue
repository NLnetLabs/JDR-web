<template>
  <div>
    <span ref="remarkNav" v-if="currentObject && currentObject.data && currentObject.data.remarks_tree">
      <el-tag
        size="mini"
        type="warning"
        v-if="currentObject.data.remarks_tree.filter(r => r.lvl === 'WARN').length"
        class="clickable"
        @click="jumpToTreeNext('WARN')"
        >{{ currentObject.data.remarks_tree.filter(r => r.lvl === "WARN").length }} WARNINGS</el-tag
      >
      <el-tag
        size="mini"
        type="danger"
        v-if="currentObject.data.remarks_tree.filter(r => r.lvl === 'ERR').length"
        class="clickable"
        @click="jumpToTreeNext('ERR')"
        >{{ currentObject.data.remarks_tree.filter(r => r.lvl === "ERR").length }} ERRORS</el-tag
      >

      <el-tag
        size="mini"
        type="info"
        class="clickable"
        title="Jump to the previous warning/error"
        @click="jumpToTreePrev()"
        ><i class="el-icon-arrow-up"></i
      ></el-tag>
      <el-tag
        size="mini"
        type="info"
        class="clickable"
        title="Jump to the next warning/error"
        @click="jumpToTreeNext()"
        ><i class="el-icon-arrow-down"></i
      ></el-tag>
    </span>
    <el-tree
      class="filter-tree"
      :data="objectTree"
      :props="defaultProps"
      default-expand-all
      v-if="objectTree"
      style="overflow-y:auto"
      ref="ASN1tree"
    >
      <span class="tree-node" slot-scope="{ node, data }">
        <span v-if="data.nicename"
          >{{ data.nicename }} <span class="tagname">{{ data.tag }}</span></span
        >
        <span v-if="!data.nicename" class="name">{{ data.tag }}</span>
        <strong v-if="data.nicevalue">&nbsp;&nbsp;{{ data.nicevalue }}</strong>
        &nbsp;&nbsp;
        <span v-for="(remark, index) in data.remarks" :key="index">
          <el-tag size="mini" type="warning" v-if="remark.lvl === 'WARN'" :ref="remark.tid">{{
            remark.msg
          }}</el-tag>
          <el-tag size="mini" type="danger" v-if="remark.lvl === 'ERR'" :ref="remark.tid">{{
            remark.msg
          }}</el-tag>
        </span>
      </span>
    </el-tree>
  </div>
</template>

<script>
export default {
  name: "ASN1",
  props: ["currentObject", "objectTree", "defaultProps", "heightToMatch"],
  data() {
    return {
      currentTid: null
    };
  },
  watch: {
    currentObject: function() {
      // setTimeout to 'flush the queue' of all events
      // making sure the heightToMatch element is rendered
      setTimeout(this.matchHeight, 0);
    }
  },
  methods: {
    matchHeight() {
        if (this.heightToMatch.$el) {
          let h = this.heightToMatch.$el.clientHeight;
          if (this.$refs.remarkNav) {
            h -= this.$refs.ASN1tree.$el.offsetTop;
          }
          this.$refs.ASN1tree.$el.style.height = h+'px';
        }
    },
    jumpToTreePrev(filter) {
      if (this.currentObject && this.currentObject.data && this.currentObject.data.remarks_tree) {
        const remarks =
          filter !== undefined
            ? this.currentObject.data.remarks_tree.filter(r => r.lvl === filter)
            : this.currentObject.data.remarks_tree;
        if (!this.currentTid) {
          this.currentTid = remarks[remarks.length - 1].tid;
        } else {
          const tids = remarks.map(r => r.tid);
          this.currentTid =
            tids.indexOf(this.currentTid) > 0
              ? tids[tids.indexOf(this.currentTid) - 1]
              : tids[tids.length - 1];
        }
        this.scrollTree();
      }
    },
    jumpToTreeNext(filter) {
      if (this.currentObject && this.currentObject.data && this.currentObject.data.remarks_tree) {
        const remarks =
          filter !== undefined
            ? this.currentObject.data.remarks_tree.filter(r => r.lvl === filter)
            : this.currentObject.data.remarks_tree;
        if (!this.currentTid) {
          this.currentTid = remarks[0].tid;
        } else {
          const tids = remarks.map(r => r.tid);
          this.currentTid =
            tids.indexOf(this.currentTid) < tids.length - 1
              ? tids[tids.indexOf(this.currentTid) + 1]
              : tids[0];
        }
        this.scrollTree();
      }
    },
    scrollTree() {
      this.$refs[this.currentTid][0].$el.scrollIntoView();
    }
  }
};
</script>

<style lang="scss" scoped></style>
