<template>
  <table v-if="treeData.name" style="width: 100%">
    <tr>
      <td
        :colspan="Array.isArray(treeData.children) ? treeData.children.length * 2 : 1"
        :class="{
          parentLevel: Array.isArray(treeData.children) && treeData.children.length,
          extend: Array.isArray(treeData.children) && treeData.children.length && treeData.extend
        }"
      >
        <div :class="{ node: true }">
          <div class="leaf" :class="Array.isArray(treeData.class) ? treeData.class : []">
            <el-tooltip
              class="item"
              effect="dark"
              :content="treeData.newPubpoint"
              placement="right"
              :disabled="treeData.newPubpoint === null"
            >
              <div class="avatar" @click="$emit('click-node', treeData)">
                <img :src="treeData.image_url" />
              </div>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" :content="treeData.name" placement="right">
              <div>
                <div class="name" @click="$emit('click-node', treeData)">
                  <div class="name-container">
                    <el-row>
                      <el-col :span="2">&nbsp;</el-col>
                      <el-col :span="20"
                        ><div v-text-middle-ellipsis="4">{{ treeData.name }}</div></el-col
                      >
                      <el-col :span="2"
                        >&nbsp;<el-tag size="mini" type="warning" v-if="treeData.warnings">{{
                          treeData.warnings
                        }}</el-tag>
                        <el-tag size="mini" type="error" v-if="treeData.errors">{{
                          treeData.errors
                        }}</el-tag></el-col
                      >
                    </el-row>
                  </div>
                </div>
              </div>
            </el-tooltip>
            <template v-if="Array.isArray(treeData.siblings) && treeData.siblings.length">
              <div
                v-for="(mate, mateIndex) in treeData.siblings"
                :key="treeData.name + mateIndex"
                :class="Array.isArray(mate.class) ? mate.class : []"
                @click="$emit('click-node', mate)"
              >
                <el-tooltip class="item" effect="dark" :content="mate.name" placement="right">
                  <div>
                    <div class="name leafname" @click="$emit('click-node', mate)">
                      <div class="name-container">
                        <el-row>
                          <el-col :span="2">&nbsp;</el-col>
                          <el-col :span="20"
                            ><div v-text-middle-ellipsis="4">{{ mate.name }}</div></el-col
                          >
                          <el-col :span="2"
                            >&nbsp;<el-tag size="mini" type="warning" v-if="mate.warnings">{{
                              mate.warnings
                            }}</el-tag>
                            <el-tag size="mini" type="error" v-if="mate.errors">{{
                              mate.errors
                            }}</el-tag></el-col
                          >
                        </el-row>
                      </div>
                    </div>
                  </div>
                </el-tooltip>
              </div>
            </template>
          </div>
        </div>
        <div
          class="extend_handle"
          v-if="Array.isArray(treeData.children) && treeData.children.length"
          @click="toggleExtend(treeData)"
        ></div>
      </td>
    </tr>
    <tr v-if="Array.isArray(treeData.children) && treeData.children.length && treeData.extend">
      <td
        v-for="(children, index) in treeData.children"
        :key="index"
        colspan="2"
        class="childLevel"
      >
        <TreeChart
          :json="children"
          :selectedRoa="selectedRoa"
          @click-node="$emit('click-node', $event)"
        />
      </td>
    </tr>
  </table>
</template>

<script>
export default {
  name: "TreeChart",
  props: ["json", "selectedRoa"],
  data() {
    return {
      treeData: {}
    };
  },
  watch: {
    json: {
      handler(Props) {
        let extendKey = function(jsonData) {
          jsonData.extend = jsonData.extend === void 0 ? true : !!jsonData.extend;
          if (Array.isArray(jsonData.children)) {
            jsonData.children.forEach(c => {
              extendKey(c);
            });
          }
          return jsonData;
        };
        if (Props) {
          this.treeData = extendKey(Props);
        }
      },
      immediate: true
    },
    selectedRoa() {
      this.$forceUpdate();
    }
  },
  methods: {
    toggleExtend: function(treeData) {
      treeData.extend = !treeData.extend;
      this.$forceUpdate();
    }
  }
};
</script>

<style lang="scss" scoped>
table {
  border-collapse: separate !important;
  border-spacing: 0 !important;
}

td {
  position: relative;
  vertical-align: top;
  padding: 0 0 30px 0;
  text-align: center;
}

.extend_handle {
  position: absolute;
  left: 50%;
  bottom: 10px;
  width: 10px;
  height: 10px;
  padding: 10px;
  transform: translate3d(-15px, 0, 0);
  cursor: pointer;

  &:before {
    content: "";
    display: block;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    border: 2px solid;
    border-color: #ccc #ccc transparent transparent;
    transform: rotateZ(135deg);
    transform-origin: 50% 50% 0;
    transition: transform ease 300ms;
  }

  &:hover:before {
    border-color: #333 #333 transparent transparent;
  }
}

.extend {
  .extend_handle:before {
    transform: rotateZ(-45deg);
  }

  &::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: 0;
    height: 15px;
    border-left: 2px solid #ccc;
    transform: translate3d(-1px, 0, 0);
  }
}

.childLevel {
  padding-bottom: 0 !important;

  &::before {
    content: "";
    position: absolute;
    left: 50%;
    bottom: 100%;
    height: 15px;
    border-left: 2px solid #ccc;
    transform: translate3d(-1px, 0, 0);
  }

  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: -15px;
    border-top: 2px solid #ccc;
  }

  &:first-child:before,
  &:last-child:before {
    display: none;
  }

  &:first-child:after {
    left: 50%;
    height: 15px;
    border: 2px solid;
    border-color: #ccc transparent transparent #ccc;
    border-radius: 6px 0 0 0;
    transform: translate3d(1px, 0, 0);
  }

  &:last-child:after {
    right: 50%;
    height: 15px;
    border: 2px solid;
    border-color: #ccc #ccc transparent transparent;
    border-radius: 0 6px 0 0;
    transform: translate3d(-1px, 0, 0);
  }

  &:first-child.childLevel:last-child::after {
    left: auto;
    border-radius: 0;
    border-color: transparent #ccc transparent transparent;
    transform: translate3d(1px, 0, 0);
  }
}

.node {
  position: relative;
  display: inline-block;
  margin: 0 1em;
  box-sizing: border-box;
  text-align: center;

  .leaf {
    position: relative;
    display: inline-block;
    z-index: 2;
    width: 10em;
    overflow: hidden;

    .avatar {
      display: block;
      width: 3em;
      height: 3em;
      border-radius: 1.5em;
      border-width: 2px;
      margin: auto;
      overflow: hidden;
      background: #fff;
      border: 1px solid #ccc;
      box-sizing: border-box;
    }
  }
}

.notification {
  /* position: absolute; */
  top: 0;
  border-radius: 1em;
  padding: 0.3em;
  padding-top: 0.3em;
  vertical-align: text-bottom;
  font-size: 0.7em;
  color: white;

  &.warning {
    background-color: #e6a23c;
  }

  &.error {
    background-color: #f56c6c;
  }
}

/* .notification.mate {
  right: 0;
} */

.node {
  .leaf {
    cursor: pointer;

    .avatar img {
      width: 100%;
      height: 100%;
    }

    .name {
      height: 2em;
      line-height: 2em;
      overflow: hidden;

      /* width: 100%; */
      width: 9rem;
      min-width: 9rem;
      padding-right: 1rem;
      white-space: nowrap;
      padding-left: 0.5rem;
    }
  }

  &.hasMate::after {
    content: "";
    position: absolute;
    left: 2em;
    right: 2em;
    top: 1.5em;
    border-top: 2px solid #ccc;
    z-index: 1;
  }
}

.landscape {
  transform: translate(-100%, 0) rotate(-90deg);
  transform-origin: 100% 0;

  .node {
    text-align: left;
    height: 8em;
    width: 8em;
  }

  .leaf {
    position: relative;
    transform: rotate(90deg);
    padding-left: 4.5em;
    height: 4em;
    top: 4em;
    left: -1em;

    .avatar {
      position: absolute;
      left: 0;
    }

    .name {
      height: 4em;
      line-height: 4em;
    }
  }

  .hasMate {
    position: relative;

    .leaf {
      position: absolute;

      &:first-child {
        left: auto;
        right: -4em;
      }

      &:last-child {
        left: -4em;
        margin-left: 0;
      }
    }
  }
}

.leafname {
  color: #bbb;
}

.notify {
  position: absolute;
  right: 0;
}

.name-container {
  width: 8rem;
  margin-left: auto;
  margin-right: auto;
}
</style>
