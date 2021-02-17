<template>
  <div>
    <el-card shadow="never">
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
          <strong><span v-text="searched"></span></strong>.
          <span v-if="searchType === SEARCH_TYPES.ASN"
            >Do you want to
            <a href="javascript: void(0)" @click="doSearch(search, true)">search for filename</a>
            instead?</span
          >
        </div>

        <el-row style="margin-bottom: 1rem">
          <el-col :span="24" style="overflow: hidden" ref="treechartContainer">
            <panZoom
              :options="{ minZoom: 0.2, maxZoom: 2, beforeWheel }"
              @panstart="onPanStart"
              @panend="onPanEnd"
              @init="onPanZoomInit"
              v-if="treeData !== null && treeData.name"
            >
              <TreeChart
                ref="treechart"
                :json="treeData"
                :selectedNode="selectedNode"
                @click-node="clickNode"
                style="padding-top: 1rem"
              />
            </panZoom>
          </el-col>
        </el-row>

        <el-tabs
          v-if="roas.length && searchType !== SEARCH_TYPES.FILENAME"
          v-model="activeTab"
          @tab-click="clickTab"
        >
          <el-tab-pane
            v-for="(roa, index) in roas"
            :key="index"
            :label="'ROA ' + (index + 1)"
          ></el-tab-pane>
        </el-tabs>

        <el-row>
          <el-col :span="24">
            <div v-if="selectedNode">
              <h4>
                {{ selectedNode.name }}<br />
                <span class="filename" v-if="currentObject && currentObject.data"
                  >{{ currentObject.data.path }}/{{ currentObject.data.filename }}</span
                >
              </h4>

              <div
                class="container"
                v-if="selectedNode.object.objecttype !== 'ROA' && selectedNode.object.object"
              >
                <el-row>
                  <el-col :span="12">
                    <div v-if="selectedNode.object.objecttype === 'CER'">
                      <div v-if="currentObject && currentObject.data && currentObject.data.object">
                        <el-row>
                          <el-col :span="4">
                            Invalid before
                          </el-col>
                          <el-col :span="20">
                            {{ getTimestamp(currentObject.data.object.notBefore) }}
                            <span class="timestamp-relative">{{
                              fromNow(currentObject.data.object.notBefore)
                            }}</span>
                          </el-col>
                        </el-row>
                        <el-row>
                          <el-col :span="4">
                            Invalid after
                          </el-col>
                          <el-col :span="20">
                            {{ getTimestamp(currentObject.data.object.notAfter) }}
                            <span class="timestamp-relative">{{
                              fromNow(currentObject.data.object.notAfter)
                            }}</span>
                          </el-col>
                        </el-row>
                      </div>
                      <el-row>
                        <el-col :span="4">
                          Inherit ASNs
                        </el-col>
                        <el-col :span="20">
                          {{ selectedNode.object.object.inherit_ASNs }}
                        </el-col>
                      </el-row>
                      <el-row>
                        <el-col :span="4">
                          Inherit v4 Prefixes
                        </el-col>
                        <el-col :span="20">
                          {{ selectedNode.object.object.inherit_v4_prefixes }}
                        </el-col>
                      </el-row>
                      <el-row>
                        <el-col :span="4">
                          Inherit v6 Prefixes
                        </el-col>
                        <el-col :span="20">
                          {{ selectedNode.object.object.inherit_v6_prefixes }}
                        </el-col>
                      </el-row>
                      <el-row
                        align="middle"
                        v-if="currentObject && currentObject.data && currentObject.data.object"
                      >
                        <el-col :span="4" class="table-label">
                          Resources
                        </el-col>
                        <el-col :span="20">
                          <el-input
                            v-model="resourcesSearch"
                            size="mini"
                            placeholder="Search resources..."
                          />
                          <el-table
                            size="small"
                            v-if="
                              currentObject.data.object &&
                                (currentObject.data.object.resources_v4 ||
                                  currentObject.data.object.resources_v6)
                            "
                            :data="
                              transformResources(
                                currentObject.data.object.resources_v4,
                                currentObject.data.object.resources_v6
                              )
                                .filter(
                                  s =>
                                    (s.resource + '')
                                      .toLowerCase()
                                      .indexOf(resourcesSearch.toLowerCase()) > -1
                                )
                                .slice(0, 300)
                            "
                            style="width: 100%"
                            height="220"
                            :show-header="false"
                          >
                            <el-table-column label="Resource"
                              ><template slot-scope="scope">{{
                                scope.row.resource
                              }}</template></el-table-column
                            >
                            <el-table-column label="CERs"
                              ><template slot-scope="scope">
                                <span v-if="scope.row.cers && scope.row.cers.length"
                                  >CERs:
                                  <span v-for="(r, idx) in scope.row.cers" :key="idx"
                                    ><a
                                      :href="'#/search/' + encodeURIComponent(r)"
                                      @click="preventAndSearch(r, $event)"
                                      >{{ idx + 1 }}</a
                                    >&nbsp; </span
                                  >
                                </span>
                              </template></el-table-column
                            >
                            <el-table-column label="ROAs"
                              ><template slot-scope="scope">
                                <span v-if="scope.row.roas && scope.row.roas.length"
                                  >ROAs:
                                  <span v-for="(r, idx) in scope.row.roas" :key="idx"
                                    ><a
                                      :href="'#/search/' + encodeURIComponent(r)"
                                      @click="preventAndSearch(r, $event)"
                                      >{{ idx + 1 }}</a
                                    >&nbsp; </span
                                  >
                                </span>
                              </template></el-table-column
                            >
                          </el-table>
                          <div
                            v-if="
                              currentObject.data.object &&
                                (currentObject.data.object.resources_v4 ||
                                  currentObject.data.object.resources_v6) &&
                                transformResources(
                                  currentObject.data.object.resources_v4,
                                  currentObject.data.object.resources_v6
                                ).length > 300
                            "
                            class="and-more"
                          >
                            and
                            {{
                              transformResources(
                                currentObject.data.object.resources_v4,
                                currentObject.data.object.resources_v6
                              ).length - 300
                            }}
                            more...
                          </div>
                        </el-col>
                      </el-row>
                      <el-row>
                        <el-col :span="4">
                          Manifest
                        </el-col>
                        <el-col :span="20">
                          {{ getManifestRoot(selectedNode.object.object.manifest)
                          }}<a
                            v-if="getManifestFromRsync(selectedNode.object.object.manifest)"
                            :href="
                              '#/search/' +
                                encodeURIComponent(
                                  getManifestFromRsync(selectedNode.object.object.manifest).object
                                    .filename
                                )
                            "
                            @click="loadManifest(selectedNode.object.object.manifest, $event)"
                            >{{ selectedNode.object.object.manifest.split("/").pop() }}</a
                            >
                            <span v-else
                            >{{ selectedNode.object.object.manifest.split("/").pop() }}
                            </span>
                        </el-col>
                      </el-row>
                      <el-row>
                        <el-col :span="4">
                          Pubpoint
                        </el-col>
                        <el-col :span="20">
                          {{ selectedNode.object.object.pubpoint }}
                        </el-col>
                      </el-row>
                      <el-row>
                        <el-col :span="4">
                          RRDP notify
                        </el-col>
                        <el-col :span="20">
                          <a :href="selectedNode.object.object.rrdp_notify">{{
                            selectedNode.object.object.rrdp_notify
                          }}</a>
                        </el-col>
                      </el-row>
                    </div>

                    <div
                      v-if="
                        selectedNode.object.objecttype === 'CRL' &&
                          currentObject &&
                          currentObject.data &&
                          currentObject.data.object
                      "
                    >
                      <el-row>
                        <el-col :span="4">
                          Last update
                        </el-col>
                        <el-col :span="20">
                          {{ getTimestamp(currentObject.data.object.this_update) }}
                          <span class="timestamp-relative">{{
                            fromNow(currentObject.data.object.this_update)
                          }}</span>
                        </el-col>
                      </el-row>
                      <el-row>
                        <el-col :span="4">
                          Next update
                        </el-col>
                        <el-col :span="20">
                          {{ getTimestamp(currentObject.data.object.next_update) }}
                          <span class="timestamp-relative">{{
                            fromNow(currentObject.data.object.next_update)
                          }}</span>
                        </el-col>
                      </el-row>
                      <el-row align="middle">
                        <el-col :span="4" class="table-label">
                          Revoked Serials
                        </el-col>
                        <el-col :span="20">
                          <el-input
                            v-model="serialsSearch"
                            size="mini"
                            placeholder="Search serials..."
                          />
                          <el-table
                            size="small"
                            v-if="
                              currentObject.data.object && currentObject.data.object.revoked_serials
                            "
                            :data="
                              currentObject.data.object.revoked_serials
                                .filter(
                                  s =>
                                    (s + '').toLowerCase().indexOf(serialsSearch.toLowerCase()) > -1
                                )
                                .slice(0, 30)
                            "
                            style="width: 100%"
                            height="220"
                            :show-header="false"
                          >
                            <el-table-column label="Serial"
                              ><template slot-scope="scope">{{
                                scope.row
                              }}</template></el-table-column
                            >
                          </el-table>
                          <div
                            v-if="
                              currentObject.data.object &&
                                currentObject.data.object.revoked_serials &&
                                currentObject.data.object.revoked_serials.length > 30
                            "
                            class="and-more"
                          >
                            and {{ currentObject.data.object.revoked_serials.length - 30 }} more...
                          </div>
                        </el-col>
                      </el-row>
                    </div>

                    <div
                      v-if="
                        selectedNode.object.objecttype === 'MFT' &&
                          currentObject &&
                          currentObject.data &&
                          currentObject.data.object
                      "
                    >
                      <el-row>
                        <el-col :span="4">
                          Last update
                        </el-col>
                        <el-col :span="20">
                          {{ getTimestamp(currentObject.data.object.this_update) }}
                          <span class="timestamp-relative">{{
                            fromNow(currentObject.data.object.this_update)
                          }}</span>
                        </el-col>
                      </el-row>
                      <el-row>
                        <el-col :span="4">
                          Next update
                        </el-col>
                        <el-col :span="20">
                          {{ getTimestamp(currentObject.data.object.next_update) }}
                          <span class="timestamp-relative">{{
                            fromNow(currentObject.data.object.next_update)
                          }}</span>
                        </el-col>
                      </el-row>
                      <el-row align="middle">
                        <el-col :span="4" class="table-label">
                          Files
                        </el-col>
                        <el-col :span="20">
                          <el-input
                            v-model="fileSearch"
                            size="mini"
                            placeholder="Search files..."
                          />
                          <el-table
                            size="small"
                            v-if="currentObject.data.object && currentObject.data.object.files"
                            :data="
                              currentObject.data.object.files
                                .filter(f => f.toLowerCase().indexOf(fileSearch.toLowerCase()) > -1)
                                .slice(0, 30)
                            "
                            style="width: 100%"
                            height="220"
                            :show-header="false"
                          >
                            <el-table-column label="File"
                              ><template slot-scope="scope"
                                ><a
                                  :href="'#/search/' + encodeURIComponent(currentObject.data.path + '/' + scope.row)"
                                  @click="navigateTo(currentObject.data.path + '/' + scope.row, $event)"
                                  >{{ scope.row }}</a
                                ></template
                              ></el-table-column
                            >
                          </el-table>
                          <div
                            v-if="
                              currentObject.data.object &&
                                currentObject.data.object.files &&
                                currentObject.data.object.files.length > 30
                            "
                            class="and-more"
                          >
                            and {{ currentObject.data.object.files.length - 30 }} more...
                          </div>
                        </el-col>
                      </el-row>
                    </div>
                    <el-row
                      v-if="
                        selectedNode.object.remark_counts_me.WARN ||
                          selectedNode.object.remark_counts_me.ERR
                      "
                    >
                      <el-col :span="4">
                        Remarks
                      </el-col>
                      <el-col :span="20">
                        <div class="error-tags" v-if="selectedNode.object.remark_counts_me.ERR">
                          <el-tag type="danger" v-if="selectedNode.object.remark_counts_me.ERR"
                            >{{ selectedNode.object.remark_counts_me.ERR }} ERRORS</el-tag
                          >
                          <el-tag
                            type="danger"
                            effect="plain"
                            size="mini"
                            v-if="selectedNode.object.remark_counts_me.ASN1Error"
                            >{{ selectedNode.object.remark_counts_me.ASN1Error }} ASN1Error</el-tag
                          >
                          <el-tag
                            type="danger"
                            effect="plain"
                            size="mini"
                            v-if="selectedNode.object.remark_counts_me.ManifestIssue"
                            >{{
                              selectedNode.object.remark_counts_me.ManifestIssue
                            }}
                            ManifestIssue</el-tag
                          >
                          <el-tag
                            type="danger"
                            effect="plain"
                            size="mini"
                            v-if="selectedNode.object.remark_counts_me.MissingFile"
                            >{{
                              selectedNode.object.remark_counts_me.MissingFile
                            }}
                            MissingFile</el-tag
                          >
                          <el-tag
                            type="danger"
                            effect="plain"
                            size="mini"
                            v-if="selectedNode.object.remark_counts_me.ValidityIssue"
                            >{{
                              selectedNode.object.remark_counts_me.ValidityIssue
                            }}
                            ValidityIssue</el-tag
                          >
                          <el-tag
                            type="danger"
                            effect="plain"
                            size="mini"
                            v-if="selectedNode.object.remark_counts_me.ResourceIssue"
                            >{{
                              selectedNode.object.remark_counts_me.ResourceIssue
                            }}
                            ResourceIssue</el-tag
                          >
                          <el-tag
                            type="danger"
                            effect="plain"
                            size="mini"
                            v-if="selectedNode.object.remark_counts_me.LoopIssue"
                            >{{ selectedNode.object.remark_counts_me.LoopIssue }} LoopIssue</el-tag
                          >
                        </div>
                        <el-tag type="warning" v-if="selectedNode.object.remark_counts_me.WARN"
                          >{{ selectedNode.object.remark_counts_me.WARN }} WARNINGS</el-tag
                        >
                        <el-tag
                          type="warning"
                          effect="plain"
                          size="mini"
                          v-if="selectedNode.object.remark_counts_me.ASN1Issue"
                          >{{ selectedNode.object.remark_counts_me.ASN1Issue }} ASN1Issue</el-tag
                        >
                        <el-tag
                          type="warning"
                          effect="plain"
                          size="mini"
                          v-if="selectedNode.object.remark_counts_me.EncodingIssue"
                          >{{
                            selectedNode.object.remark_counts_me.EncodingIssue
                          }}
                          EncodingIssue</el-tag
                        >
                        <div
                          class="error-tags"
                          v-if="selectedNode.object.remarks"
                        > 
                          <el-tag
                            :type="r.lvl == 'WARN' ? 'warning' : 'danger'"
                            v-for="(r, idx) in selectedNode.object.remarks"
                            :key="idx"
                          >{{ r.msg }}</el-tag>
                        </div>
                      </el-col>
                    </el-row>
                    <el-row
                      v-if="
                        selectedNode.object.remark_counts_children.WARN ||
                          selectedNode.object.remark_counts_children.ERR
                      "
                    >
                      <el-col :span="4">
                        Remarks children
                      </el-col>
                      <el-col :span="20">
                        <div
                          class="error-tags"
                          v-if="selectedNode.object.remark_counts_children.ERR"
                        >
                          <el-tag
                            type="danger"
                            size="medium"
                            v-if="selectedNode.object.remark_counts_children.ERR"
                            >{{ selectedNode.object.remark_counts_children.ERR }} ERRORS</el-tag
                          >
                          <el-tag
                            type="danger"
                            effect="plain"
                            size="mini"
                            v-if="selectedNode.object.remark_counts_children.ASN1Error"
                            >{{
                              selectedNode.object.remark_counts_children.ASN1Error
                            }}
                            ASN1Error</el-tag
                          >
                          <el-tag
                            type="danger"
                            effect="plain"
                            size="mini"
                            v-if="selectedNode.object.remark_counts_children.ManifestIssue"
                            >{{
                              selectedNode.object.remark_counts_children.ManifestIssue
                            }}
                            ManifestIssue</el-tag
                          >
                          <el-tag
                            type="danger"
                            effect="plain"
                            size="mini"
                            v-if="selectedNode.object.remark_counts_children.MissingFile"
                            >{{
                              selectedNode.object.remark_counts_children.MissingFile
                            }}
                            MissingFile</el-tag
                          >
                          <el-tag
                            type="danger"
                            effect="plain"
                            size="mini"
                            v-if="selectedNode.object.remark_counts_children.ValidityIssue"
                            >{{
                              selectedNode.object.remark_counts_children.ValidityIssue
                            }}
                            ValidityIssue</el-tag
                          >
                          <el-tag
                            type="danger"
                            effect="plain"
                            size="mini"
                            v-if="selectedNode.object.remark_counts_children.ResourceIssue"
                            >{{
                              selectedNode.object.remark_counts_children.ResourceIssue
                            }}
                            ResourceIssue</el-tag
                          >
                          <el-tag
                            type="danger"
                            effect="plain"
                            size="mini"
                            v-if="selectedNode.object.remark_counts_children.LoopIssue"
                            >{{
                              selectedNode.object.remark_counts_children.LoopIssue
                            }}
                            LoopIssue</el-tag
                          >
                        </div>

                        <el-tag
                          type="warning"
                          size="medium"
                          v-if="selectedNode.object.remark_counts_children.WARN"
                          >{{ selectedNode.object.remark_counts_children.WARN }} WARNINGS</el-tag
                        >

                        <el-tag
                          type="warning"
                          effect="plain"
                          size="mini"
                          v-if="selectedNode.object.remark_counts_children.ASN1Issue"
                          >{{
                            selectedNode.object.remark_counts_children.ASN1Issue
                          }}
                          ASN1Issue</el-tag
                        >
                        <el-tag
                          type="warning"
                          effect="plain"
                          size="mini"
                          v-if="selectedNode.object.remark_counts_children.EncodingIssue"
                          >{{
                            selectedNode.object.remark_counts_children.EncodingIssue
                          }}
                          EncodingIssue</el-tag
                        >
                      </el-col>
                    </el-row>
                  </el-col>
                  <el-col :span="12">
                    <el-row>
                      <el-col :span="24">
                        <ASN1
                          :currentObject="currentObject"
                          :objectTree="objectTree"
                          :defaultProps="defaultProps"
                        ></ASN1>
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
                        ASN
                      </el-col>
                      <el-col :span="20">
                        {{ selectedNode.object.asid }}
                      </el-col>
                    </el-row>
                    <el-row align="middle">
                      <el-col :span="4" class="table-label">
                        VRPS
                      </el-col>
                      <el-col :span="20">
                        <el-table
                          size="small"
                          :data="selectedNode.object.vrps"
                          style="width: 100%"
                          height="220"
                          :show-header="false"
                        >
                          <el-table-column label="Prefix"
                            ><template slot-scope="scope"
                              >{{ scope.row }}</template
                            ></el-table-column
                          >
                        </el-table>
                      </el-col>
                    </el-row>
                    <el-row 
                      v-if="selectedNode.remarks"
                      align="middle"
                      >
                      <el-col :span="4">
                        Remarks
                      </el-col>
                      <el-col :span="20">
                        <el-tag type="danger"
                          v-for="(r, idx) in selectedNode.remarks"
                          :key="idx">
                          {{ r.msg }}
                        </el-tag>
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
                        <ASN1
                          :currentObject="currentObject"
                          :objectTree="objectTree"
                          :defaultProps="defaultProps"
                        ></ASN1>
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
import ASN1 from "@/components/ASN1";
import APIService from "@/services/APIService.js";
const isIp = require("is-ip");
const cidrRegex = require("cidr-regex");
import router from "@/router";
import * as moment from "moment";

export default {
  components: {
    TreeChart,
    ASN1
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
      firstSearch: true,
      SEARCH_TYPES: {
        PREFIX: "prefix",
        ASN: "asn",
        FILENAME: "filename",
        NEW: "new since"
      },
      isPanning: false,
      fileSearch: "",
      serialsSearch: "",
      resourcesSearch: ""
    };
  },
  computed: {
    objectTree() {
      let tree = null;
      function traverse(children) {
        if (children && children.length) {
          children.forEach(child => {
            if (child.children && child.children.length) {
              if (child.children.length > 100) {
                child.children = child.children.slice(0, 100);
              }
              traverse(child.children);
            }
          });
        }
      }
      if (this.currentObject && this.currentObject.data && this.currentObject.data.tree) {
        traverse(this.currentObject.data.tree.children);
        tree = [this.currentObject.data.tree];
      }
      return tree;
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
  methods: {
    beforeUnload() {
      localStorage.removeItem("jdr_last_search");
    },
    beforeWheel(e) {
      var shouldIgnore = !e.altKey;
      return shouldIgnore;
    },
    clickNode(node) {
      if (!this.isPanning) {
        if (node.object.objecttype !== "ROA") {
          this.selectedNode = node;
          this.treeData = this.getTreeData();
          this.getObject(node.object.filename);
        } else {
          this.roas.forEach((r, i) => {
            if (node.object && r.name === node.object.name) {
              this.activeTab = i + "";
              this.clickTab();
            }
          });
        }
        this.fileSearch = "";
        this.serialsSearch = "";
      }
    },
    onPanZoomInit(panzoomInstance) {
      console.log(this.$refs["treechart"].$el.clientWidth)
      console.log(this.$refs["treechartContainer"].$el.clientWidth)
      panzoomInstance.moveBy((this.$refs["treechart"].$el.clientWidth/2 - this.$refs["treechartContainer"].$el.clientWidth/2)*-1, 0, true);
    },
    onPanStart() {
      this.isPanning = true;
    },
    onPanEnd() {
      this.isPanning = false;
    },
    clickTab() {
      this.selectedNode = this.roas[this.activeTab * 1];
      this.getObject(this.selectedNode.filename);
      this.treeData = this.getTreeData();
    },
    getTreeData() {
      let tree = this.tree;
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
                errors: m.object ? m.object.remark_counts_me.ERR : 0
              });
            });
          }

          node.siblings = newMates;

          let children = node.children;
          node.image_url = self.getNodeImage(node.name, node.newPubpoint);
          node.warnings = node.object ? node.object.remark_counts_me.WARN : 0;
          node.errors = node.object ? node.object.remark_counts_me.ERR : 0;
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
                child.class = ["clickable"];
                if (child.name === self.selectedNode.name) {
                  child.image_url = self.getNodeImage("green", child.newPubpoint);
                } else {
                  child.image_url = self.getNodeImage("white");
                }
                child.warnings = child.object.remark_counts_me.WARN;
                child.errors = child.object.remark_counts_me.ERROR;
              } else if (!child.children || child.children.length === 0) {
                child.class = ["clickable"];
                if (!self.selectedNode || child.name === self.selectedNode.name) {
                  child.image_url = self.getNodeImage("green", child.newPubpoint);
                } else {
                  child.image_url = self.getNodeImage("white");
                }
                let childMates = child.mates;
                let newMates = [];
                if (childMates) {
                  childMates.forEach(m => {
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
                child.siblings = newMates;
                if (!self.selectedNode) {
                  let hasBeenSelected = false;
                  if (child.object.filename !== self.search) {
                    child.siblings.forEach(s => {
                      if (s.object.filename === self.search) {
                        self.selectedNode = s;
                        self.getObject(s.object.filename);
                        hasBeenSelected = true;
                      }
                    });
                  }
                  if (!hasBeenSelected) {
                    self.selectedNode = child;
                    self.getObject(child.object.filename);
                  }
                }
              }
            });
          }
        }
      }
      traverse(tree);
      return tree;
    },
    getObject(filename) {
      APIService.getObject(filename).then(response => {
        this.updateLastUpdate(response);
        this.currentObject = response.data;
      });
    },
    doSearch(search, forceFilename = false) {
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
            self.getObject(self.selectedNode.filename);
          }
          self.treeData = self.getTreeData();
        }
      }
      this.searched = search;
      if ((isIp(search) || cidrRegex({ exact: true }).test(search)) && !forceFilename) {
        this.searchType = this.SEARCH_TYPES.PREFIX;
        APIService.getPrefix(search).then(response => {
          this.updateLastUpdate(response);
          selectNode(response);
        });
      } else if (
        search &&
        (search.toLowerCase().indexOf("as") === 0 ||
          (search * 1 >= 0 && search * 1 <= 4294967295)) &&
        !forceFilename
      ) {
        this.searchType = this.SEARCH_TYPES.ASN;
        APIService.getASN(search).then(response => {
          this.updateLastUpdate(response);
          selectNode(response);
        });
      } else if (search && search.toLowerCase().indexOf("new") === 0) {
        this.searchType = this.SEARCH_TYPES.NEW;
        const bits = search.split(" ");
        APIService.getNewSince(bits[1],bits[2]).then(response => {
          this.updateLastUpdate(response);
          selectNode(response);
        });
      } else {
        this.searchType = this.SEARCH_TYPES.FILENAME;
        APIService.getFilename(encodeURIComponent(search)).then(response => {
          this.updateLastUpdate(response);
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
    },
    getTimestamp(timestamp) {
      return moment.utc(timestamp).format() + " UTC";
    },
    fromNow(timestamp) {
      return moment.utc(timestamp).fromNow();
    },
    updateLastUpdate(response) {
      if (response.data && response.data.last_update) {
        this.$emit("update-last", response.data.last_update);
      }
    },
    getManifestRoot(rsyncUrl) {
      const parts = rsyncUrl.split("/");
      parts.pop();
      return parts.join("/") + "/";
    },
    getManifestFromRsync(rsyncUrl) {
      const mft = rsyncUrl.split("/").pop();
      let rMft = "";
      function traverse(children) {
        if (children && children.length) {
          children.forEach(child => {
            if (child.name === mft) {
              rMft = child;
            }
            if (child.mates) {
              child.mates.forEach(m => {
                if (m.name === mft) {
                  rMft = m;
                }
              });
            }
            if (child.children && child.children.length) {
              traverse(child.children);
            }
          });
        }
      }
      if (this && this.tree && this.tree.children) {
        traverse(this.tree.children);
        return rMft;
      }
    },
    loadManifest(rsyncUrl, e) {
      e.preventDefault();
      this.clickNode(this.getManifestFromRsync(rsyncUrl));
    },
    navigateTo(filename, e) {
      e.preventDefault();
      this.search = filename;
      this.searchResource();
    },
    transformResources(v4, v6) {
      const res = [];
      v4.concat(v6).forEach(r => {
        res.push({
          resource: r.prefix,
          roas: r.ROAs,
          cers: r.CERs
        });
      });
      return res;
    },
    preventAndSearch(object, e) {
      e.preventDefault();
      this.search = object;
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
.el-table {
  .cell {
      span {
        word-break: break-word;
      }
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

.table-label {
  padding-top: 6px;
}

.error-tags {
  margin-bottom: 1rem;
}

.tree-node {
  .el-tag {
    margin-bottom: 0;
  }
}

.and-more {
  color: #bbbbbb;
  padding: 1rem;
  font-size: 0.8rem;
}

.timestamp-relative {
  color: #bbbbbb;
  padding-left: 1rem;
}

.filename {
  color: #bbbbbb;
  font-size: 0.8rem;
}
</style>
