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
        <el-row>
          <el-col :span="8"
            ><el-tooltip
              class="item"
              effect="dark"
              :content="treeData.additionalInfo"
              placement="left"
              v-if="treeData.additionalInfo"
              ><div :class="treeData.additionalInfoSeverity" style="text-align: right">
                <i class="el-icon-discover"></i></div></el-tooltip
            >&nbsp;</el-col
          >
        <el-col :span="8"
          ><div class="leaf" :class="Array.isArray(treeData.class) ? treeData.class : []">
            <el-tooltip
              class="item"
              effect="dark"
              :content="treeData.newPubpoint"
              placement="right"
              :disabled="treeData.newPubpoint === null"
            >
            <div class="avatar">
              <router-link
                v-if="treeData.object"
                :to="{name: 'search',
                    params: {
                      search: $route.name == 'search' ? $route.params.search : treeData.object.filename,
                      selected: $route.name == 'search' ?  treeData.object.filename : null
                    }
                  }"
                @click.prevent
                @mouseup="$emit('click-node', treeData)">
                <img :src="treeData.image_url" />
              </router-link>
              </div>
            </el-tooltip>
            </div>
          </el-col>
          <el-col :span="8"
            ><el-tag
              size="mini"
              type="warning"
              v-if="$route.name == 'repositories' && treeData.warnings"
              :title="treeData.warnings + ' warnings, see overview below'"
              >{{ treeData.warnings }}</el-tag
            >
            <el-tag
              size="mini"
              type="danger"
              v-if="$route.name == 'repositories' && (treeData.errors_self || treeData.errors_children)"
              :title="(treeData.errors_self ? (treeData.errors_self + ' errors in self') : ''  + treeData.errors_children ?  (treeData.errors_children + ' errors in children') : '') + ', see overview below'"
              >{{ treeData.errors_self || '0' }} {{ treeData.errors_children ?
              '+' : '' }} {{ treeData.errors_children }}</el-tag
            ></el-col
          >
            </el-row>
              <div class="name">
                <div class="name-container">
                  <el-row>
                    <el-col :span="($route.name == 'search') ? 20 : 24"
                      :push="($route.name == 'search') ? 2 : 0"
                      ><el-tooltip
                        class="item"
                        effect="dark"
                        :content="treeData.name"
                        placement="right"
                        >
                          <router-link
                            v-if="treeData.object"
                            :class="[
                              'node-filename',
                              'node-filename-cer',
                              selectedNode && treeData.name == selectedNode.name ? 'selected-file' : ''
                              ]"
                            :to="{name: 'search',
                                params: {
                                  search: $route.name == 'search' ?
                                  $route.params.search :
                                  treeData.object.filename,
                                  selected: $route.name == 'search' ?
                                  treeData.object.filename : null
                                }
                              }"
                            @click.prevent
                            @mouseup="$emit('click-node', treeData)"
                          >
                          <div v-if="$route.name == 'search' ||
                            Array.isArray(treeData.siblings) && treeData.siblings.length"
                            v-text-middle-ellipsis="10">{{ treeData.name }}</div>
                          <div v-else>{{ treeData.name }}</div>
                          </router-link>
                          <div v-else-if="treeData.name === 'root'" >root</div>
                        </el-tooltip
                      ></el-col
                    >
                    <el-col :span="3"
                      >&nbsp;<el-tag
                        size="mini"
                        type="warning"
                        v-if="treeData.warnings"
                        :title="treeData.warnings + ' warnings'"
                        >{{ treeData.warnings }}</el-tag
                      >
                      <el-tag
                        size="mini"
                        type="danger"
                        v-if="treeData.errors"
                        :title="treeData.errors + ' errors'"
                        >{{ treeData.errors }}</el-tag
                      ></el-col
                    >
                    <el-col
                      v-if="$route.name == 'search'"
                      :span=3
                      ><el-tag
                          size="mini"
                          type="warning"
                          v-if="treeData.warnings"
                          :title="treeData.warnings + ' warnings'"
                          >{{ treeData.warnings }}</el-tag
                          >
                          <el-tag
                            size="mini"
                            type="danger"
                            v-if="treeData.errors"
                            :title="treeData.errors + ' errors'"
                            >{{ treeData.errors }}</el-tag
                          >
                    </el-col>
                  </el-row>
                </div>
              </div>

            <template v-if="Array.isArray(treeData.siblings) && treeData.siblings.length">
              <div
                v-for="(mate, mateIndex) in treeData.siblings"
                :key="treeData.name + mateIndex"
                :class="Array.isArray(mate.class) ? mate.class : []"
              >
                <div>
                  <div class="name leafname">
                    <div class="name-container">
                      <el-row>
                        <el-col :span="20" :push="2"
                          ><el-tooltip
                            class="item"
                            effect="dark"
                            :content="mate.name"
                            placement="right"
                            >
                              <router-link
                                :class="[
                                  'node-filename',
                                  mate.name == selectedNode.name ? 'selected-file' : ''
                                  ]"
                                :to="{name: 'search',
                                    params: {
                                      search: $route.params.search,
                                      selected: mate.object.filename
                                    }
                                  }"
                                @click.prevent
                                @mouseup="$emit('click-node', mate)"
                              ><div v-text-middle-ellipsis="10">{{ mate.name }}</div>
                              </router-link>
                            </el-tooltip
                          ></el-col
                        >
                        <el-col :span="3"
                          ><el-tag
                            size="mini"
                            type="warning"
                            v-if="mate.warnings"
                            :title="mate.warnings + ' warnings'"
                            >{{ mate.warnings }}</el-tag
                          >
                          <el-tag
                            size="mini"
                            type="danger"
                            v-if="mate.errors"
                            :title="mate.errors + ' errors'"
                            >{{ mate.errors }}</el-tag
                          ></el-col
                        >
                      </el-row>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        <div
          class="extend_handle"
          v-if="Array.isArray(treeData.children) && treeData.children.length > 4"
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
          :selectedNode="selectedNode"
          @click-node="$emit('click-node', $event)"
        />
      </td>
    </tr>
  </table>
</template>

<script>
export default {
  name: "TreeChart",
  props: ["json", "selectedNode"],
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
    selectedNode() {
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
  padding: 0 0 16px 0;
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
    border: 1px solid;
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
    border-left: 1px solid #ccc;
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
    border-left: 1px solid #ccc;
    transform: translate3d(-1px, 0, 0);
  }

  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: -15px;
    border-top: 1px solid #ccc;
  }

  &:first-child:before,
  &:last-child:before {
    display: none;
  }

  &:first-child:after {
    left: 50%;
    height: 15px;
    border: 1px solid;
    border-color: #ccc transparent transparent #ccc;
    border-radius: 6px 0 0 0;
    transform: translate3d(1px, 0, 0);
  }

  &:last-child:after {
    right: 50%;
    height: 15px;
    border: 1px solid;
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
  max-width: 10em;

  .leaf {
    position: relative;
    display: inline-block;
    z-index: 2;
    /*width: 7em;*/
    overflow: hidden;

    .avatar {
      display: block;
      width: 2em;
      height: 2em;
      border-radius: 1em;
      border-width: 2px;
      margin: auto;
      overflow: hidden;
      background: #fff;
      border: 1px solid #ccc;
      box-sizing: border-box;
    }
  }
}

.node {
  .leaf {
    .avatar img {
      width: 100%;
      height: 100%;
    }
  }

    .name {
      height: 1.6em;
      line-height: 1.6em;
      overflow: hidden;
      font-size: 0.7rem;
      /*width: 100%;*/
      width: 9rem;
      min-width: 7rem;
      /* padding-right: 1rem; */
      white-space: nowrap;
    }

  &.hasMate::after {
    content: "";
    position: absolute;
    left: 2em;
    right: 2em;
    top: 1.5em;
    border-top: 1px solid #ccc;
    z-index: 1;
  }
}

a.node-filename {
  color: #bbb;
  text-decoration: none;
}
a.node-filename-cer {
  color: #303133;
  text-decoration: none;
}
a.selected-file {
  color: #303133;
  font-weight: bold;
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
  /*width: 8rem;*/
  margin-left: auto;
  margin-right: auto;
}

.danger {
  color: #f56c6c;
}

.warning {
  color: #e6a23c;
}

.info {
  color: #bbb;
}

.el-tag--mini {
  font-size: 0.6rem;
  padding: 0 0.1rem;
  cursor: default;
}

</style>
