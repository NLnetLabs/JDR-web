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
              <el-col :span="8" style="overflow: hidden">
                <panZoom
                  :options="{ minZoom: 0.2, maxZoom: 2, bounds: true, boundPadding: 0 }"
                  v-if="activeTab === index + ''"
                >
                  <TreeChart :json="getTreeData(activeTab)" @click-node="clickNode" />
                </panZoom>
              </el-col>
              <el-col :span="16">
                <div v-if="selectedNode">
                  <h3>{{ selectedNode.name }}</h3>

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
                        <json-viewer :value="currentObject"></json-viewer>
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
                        <el-table :data="selectedNode.object.vrps" style="width: 100%">
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
const GREEN_SQUARE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwcHgiIGhlaWdodD0iMTAwcHgiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPHRpdGxlPlJlY3RhbmdsZTwvdGl0bGU+CiAgICA8ZyBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8cmVjdCBpZD0iUmVjdGFuZ2xlIiBmaWxsPSIjOTJiZDExIiB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PC9yZWN0PgogICAgPC9nPgo8L3N2Zz4=";
const LIGHT_GREEN_SQUARE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwcHgiIGhlaWdodD0iMTAwcHgiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPHRpdGxlPlJlY3RhbmdsZTwvdGl0bGU+CiAgICA8ZyBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8cmVjdCBpZD0iUmVjdGFuZ2xlIiBmaWxsPSIjZTVmN2FlIiB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PC9yZWN0PgogICAgPC9nPgo8L3N2Zz4=";
const WHITE_SQUARE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwcHgiIGhlaWdodD0iMTAwcHgiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPHRpdGxlPlJlY3RhbmdsZTwvdGl0bGU+CiAgICA8ZyBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8cmVjdCBpZD0iUmVjdGFuZ2xlIiBmaWxsPSIjZmZmZmZmIiB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PC9yZWN0PgogICAgPC9nPgo8L3N2Zz4=";
const RIPENCC =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwcHgiIGhlaWdodD0iMTAwcHgiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPHRpdGxlPkdyb3VwPC90aXRsZT4KICAgIDxnIGlkPSJQYWdlLTEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJHcm91cCIgZmlsbC1ydWxlPSJub256ZXJvIj4KICAgICAgICAgICAgPGcgaWQ9ImdyZWVuIiBmaWxsPSIjOTJCRDExIj4KICAgICAgICAgICAgICAgIDxyZWN0IGlkPSJSZWN0YW5nbGUiIHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48L3JlY3Q+CiAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPHBhdGggZD0iTTY1LjAxMTUzMzQsNDUuODc3MzgwNiBMNjUuMDExNTMzNCw0NS44NzczODA2IEw2NS4wMTE1MzM0LDI5LjY3MzU3MTcgTDUwLDIxIEwzNC45ODg0NjY2LDI5LjY3MzU3MTcgTDM0Ljk4ODQ2NjYsNDUuODU3NjY3OSBMMzQuOTg4NDY2Niw0NS44NzczODA2IEwyMSw1My45NTk1NzIzIEwyMSw3MS4zMjY0MjgzIEwzNi4wMTE1MzMxLDgwIEw1MCw3MS45MTc4MDgyIEw2My45ODg0NjY5LDgwIEw3OSw3MS4zMjY0MjgzIEw3OSw1My45NTk1NzIzIEw2NS4wMTE1MzM0LDQ1Ljg3NzM4MDYgWiBNNTAsNTMgTDM4LDQ2IEw1MCwzOSBMNjIsNDYgTDUwLDUzIFogTTM3LDQ4IEw0OSw1NSBMNDksNjkgTDM3LDYyIEwzNyw0OCBaIE01MSw1NSBMNjMsNDggTDYzLDYyIEw1MSw2OSBMNTEsNTUgWiBNMzcsMzEuMzgyMDUzNyBMNTAsMjQgTDYzLDMxLjM4MjA1MzcgTDYzLDQ1IEw1MCwzNy42MTc5NDYzIEwzNyw0NSBMMzcsMzEuMzgyMDUzNyBaIE0yMyw3MC41OTQ1MDQgTDIzLDU1LjgwMjk0OTEgTDM0Ljk3NzExMSw0OSBMMzQuOTc3MTExLDYzLjc3MjExOCBMNDgsNzEuMTc3NjEzOSBMMzYuMDAzMTU2OCw3OCBMMjMsNzAuNTk0NTA0IFogTTc3LDcwLjYxMzk0MSBMNjMuOTk2ODQyOSw3OCBMNTIsNzEuMTc3NjEzOSBMNjUuMDIyODg4Nyw2My43NzIxMTggTDY1LjAyMjg4ODcsNDkgTDc3LDU1LjgwMjk0OTEgTDc3LDcwLjYxMzk0MSBaIiBpZD0iU2hhcGUiIGZpbGw9IiNGRkZGRkYiPjwvcGF0aD4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==";
const LACNIC =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwcHgiIGhlaWdodD0iMTAwcHgiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPHRpdGxlPkdyb3VwPC90aXRsZT4KICAgIDxnIGlkPSJQYWdlLTEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJHcm91cCIgZmlsbC1ydWxlPSJub256ZXJvIj4KICAgICAgICAgICAgPGcgaWQ9ImdyZWVuIiBmaWxsPSIjOTJCRDExIj4KICAgICAgICAgICAgICAgIDxyZWN0IGlkPSJSZWN0YW5nbGUiIHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48L3JlY3Q+CiAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPGcgaWQ9ImczNDM1IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzMy4wMDAwMDAsIDE0LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPGcgaWQ9ImcxNDg2IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMS4wOTYxODQsIDMyLjk3Mjc2MCkgc2NhbGUoLTEsIDEpIHJvdGF0ZSgtMTgwLjAwMDAwMCkgdHJhbnNsYXRlKC0yMS4wOTYxODQsIC0zMi45NzI3NjApIHRyYW5zbGF0ZSg5LjA5NjE4NCwgMjEuNDcyNzYwKSIgZmlsbD0iI0U0RjdBRSI+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTEyLDAgQzQuODE4LDAgMC44NjMsNC4yMTQyODU3MSAwLjg2MywxMS4zNjA3MTQzIEMwLjg2MywxOC42OTI4NTcxIDUsMjIuNTQyODU3MSAxMiwyMi41NDI4NTcxIEMxOS4wMDM1LDIyLjU0Mjg1NzEgMjMuMTMzNSwxOC42OTI4NTcxIDIzLjEzMzUsMTEuMzYwNzE0MyBDMjMuMTMzNSw0LjIxNDI4NTcxIDE5LjE4NTUsMCAxMiwwIiBpZD0icGF0aDE0ODgiPjwvcGF0aD4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxnIGlkPSJnMTQ5MCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjMuMDk2MTg0LCAyOS40NzI3NjApIHNjYWxlKC0xLCAxKSByb3RhdGUoLTE4MC4wMDAwMDApIHRyYW5zbGF0ZSgtMjMuMDk2MTg0LCAtMjkuNDcyNzYwKSB0cmFuc2xhdGUoMTYuMDk2MTg0LCAyMi40NzI3NjApIiBmaWxsPSIjRkZGRkZGIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNywwIEMyLjY4OCwwIDAuMzE4NSwyLjQ3OCAwLjMxODUsNi42ODE1IEMwLjMxODUsMTAuOTkgMi43OTY1LDEzLjI1NDUgNywxMy4yNTQ1IEMxMS4yMDM1LDEzLjI1NDUgMTMuNjc4LDEwLjk5IDEzLjY3OCw2LjY4MTUgQzEzLjY3OCwyLjQ3OCAxMS4zMDg1LDAgNywwIiBpZD0icGF0aDE0OTIiPjwvcGF0aD4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxnIGlkPSJnMTQ5NCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjQuMDk2MTg0LCAyOC45NzI3NjApIHNjYWxlKC0xLCAxKSByb3RhdGUoLTE4MC4wMDAwMDApIHRyYW5zbGF0ZSgtMjQuMDk2MTg0LCAtMjguOTcyNzYwKSB0cmFuc2xhdGUoMTkuMDk2MTg0LCAyNC40NzI3NjApIiBmaWxsPSIjRTRGN0FFIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNSwtNy4xMDU0MjczNmUtMTUgQzIuNDE3LC03LjEwNTQyNzM2ZS0xNSAwLjk5MjUsMS41NTgzMzMzMyAwLjk5MjUsNC4xOTgzMzMzMyBDMC45OTI1LDYuOTA4IDIuNDgsOC4zMzA2NjY2NyA1LDguMzMwNjY2NjcgQzcuNTIzNSw4LjMzMDY2NjY3IDkuMDExLDYuOTA4IDkuMDExLDQuMTk4MzMzMzMgQzkuMDExLDEuNTU4MzMzMzMgNy41ODY1LC03LjEwNTQyNzM2ZS0xNSA1LC03LjEwNTQyNzM2ZS0xNSIgaWQ9InBhdGgxNDk2Ij48L3BhdGg+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICA8ZyBpZD0iZzE0OTgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE4LjA5NjE4NCwgNTIuNDcyNzYwKSBzY2FsZSgtMSwgMSkgcm90YXRlKC0xODAuMDAwMDAwKSB0cmFuc2xhdGUoLTE4LjA5NjE4NCwgLTUyLjQ3Mjc2MCkgdHJhbnNsYXRlKDExLjA5NjE4NCwgNDUuNDcyNzYwKSIgZmlsbD0iI0ZGRkZGRiI+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTcsMCBDMi42ODgsMCAwLjMxODUsMi40NzggMC4zMTg1LDYuNjc4IEMwLjMxODUsMTAuOTkgMi44LDEzLjI1MSA3LDEzLjI1MSBDMTEuMjAzNSwxMy4yNTEgMTMuNjc4LDEwLjk5IDEzLjY3OCw2LjY3OCBDMTMuNjc4LDIuNDc4IDExLjMwODUsMCA3LDAiIGlkPSJwYXRoMTUwMCI+PC9wYXRoPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPGcgaWQ9ImcxNTAyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNy4wOTYxODQsIDUzLjk3Mjc2MCkgc2NhbGUoLTEsIDEpIHJvdGF0ZSgtMTgwLjAwMDAwMCkgdHJhbnNsYXRlKC0xNy4wOTYxODQsIC01My45NzI3NjApIHRyYW5zbGF0ZSgxMi4wOTYxODQsIDQ5LjQ3Mjc2MCkiIGZpbGw9IiNFNEY3QUUiPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik01LDAgQzIuNDEzNSwwIDAuOTkyNSwxLjU1ODMzMzMzIDAuOTkyNSw0LjE5ODMzMzMzIEMwLjk5MjUsNi45MDggMi40OCw4LjMzMDY2NjY3IDUsOC4zMzA2NjY2NyBDNy41MjM1LDguMzMwNjY2NjcgOS4wMTEsNi45MDggOS4wMTEsNC4xOTgzMzMzMyBDOS4wMTEsMS41NTgzMzMzMyA3LjU4NjUsMCA1LDAiIGlkPSJwYXRoMTUwNCI+PC9wYXRoPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPGcgaWQ9ImcxNTA2IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNi41OTYxODQsIDUzLjk3Mjc2MCkgc2NhbGUoLTEsIDEpIHJvdGF0ZSgtMTgwLjAwMDAwMCkgdHJhbnNsYXRlKC0xNi41OTYxODQsIC01My45NzI3NjApIHRyYW5zbGF0ZSgxNC4wOTYxODQsIDUxLjQ3Mjc2MCkiIGZpbGw9IiNGRkZGRkYiPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0yLjUsMCBDMC45NDYsMCAwLjA5MiwwLjg4OSAwLjA5MiwyLjQwNDUgQzAuMDkyLDMuOTU1IDAuOTg4LDQuNzY3IDIuNSw0Ljc2NyBDNC4wMTIsNC43NjcgNC45MDQ1LDMuOTU1IDQuOTA0NSwyLjQwNDUgQzQuOTA0NSwwLjg4OSA0LjA1NCwwIDIuNSwwIiBpZD0icGF0aDE1MDgiPjwvcGF0aD4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxnIGlkPSJnMTUxMCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNy4wOTYxODQsIDE1LjQ3Mjc2MCkgc2NhbGUoLTEsIDEpIHJvdGF0ZSgtMTgwLjAwMDAwMCkgdHJhbnNsYXRlKC03LjA5NjE4NCwgLTE1LjQ3Mjc2MCkgdHJhbnNsYXRlKDAuMDk2MTg0LCA4LjQ3Mjc2MCkiIGZpbGw9IiNGRkZGRkYiPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik03LDAgQzIuNjkxNSwwIDAuMzIyLDIuNDc4IDAuMzIyLDYuNjgxNSBDMC4zMjIsMTAuOTkzNSAyLjgsMTMuMjU0NSA3LDEzLjI1NDUgQzExLjIwMzUsMTMuMjU0NSAxMy42ODUsMTAuOTkzNSAxMy42ODUsNi42ODE1IEMxMy42ODUsMi40NzggMTEuMzEyLDAgNywwIiBpZD0icGF0aDE1MTIiPjwvcGF0aD4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxnIGlkPSJnMTUxNCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoOC4wOTYxODQsIDE2Ljk3Mjc2MCkgc2NhbGUoLTEsIDEpIHJvdGF0ZSgtMTgwLjAwMDAwMCkgdHJhbnNsYXRlKC04LjA5NjE4NCwgLTE2Ljk3Mjc2MCkgdHJhbnNsYXRlKDMuMDk2MTg0LCAxMi40NzI3NjApIiBmaWxsPSIjRTRGN0FFIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNSwtNy4xMDU0MjczNmUtMTUgQzIuNDE3LC03LjEwNTQyNzM2ZS0xNSAwLjk5MjUsMS41NTgzMzMzMyAwLjk5MjUsNC4xOTgzMzMzMyBDMC45OTI1LDYuOTA4IDIuNDgsOC4zMzA2NjY2NyA1LDguMzMwNjY2NjcgQzcuNTIzNSw4LjMzMDY2NjY3IDkuMDExLDYuOTA4IDkuMDExLDQuMTk4MzMzMzMgQzkuMDExLDEuNTU4MzMzMzMgNy41ODY1LC03LjEwNTQyNzM2ZS0xNSA1LC03LjEwNTQyNzM2ZS0xNSIgaWQ9InBhdGgxNTE2Ij48L3BhdGg+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICA8ZyBpZD0iZzE1MTgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDguNTk2MTg0LCAxNy45NzI3NjApIHNjYWxlKC0xLCAxKSByb3RhdGUoLTE4MC4wMDAwMDApIHRyYW5zbGF0ZSgtOC41OTYxODQsIC0xNy45NzI3NjApIHRyYW5zbGF0ZSg2LjA5NjE4NCwgMTUuNDcyNzYwKSIgZmlsbD0iI0ZGRkZGRiI+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTIuNSwtNy4xMDU0MjczNmUtMTUgQzAuOTQ5NSwtNy4xMDU0MjczNmUtMTUgMC4wOTU1LDAuODkyNSAwLjA5NTUsMi40MDQ1IEMwLjA5NTUsMy45NTUgMC45ODgsNC43NzA1IDIuNSw0Ljc3MDUgQzQuMDEyLDQuNzcwNSA0LjkwNDUsMy45NTUgNC45MDQ1LDIuNDA0NSBDNC45MDQ1LDAuODkyNSA0LjA1MDUsLTcuMTA1NDI3MzZlLTE1IDIuNSwtNy4xMDU0MjczNmUtMTUiIGlkPSJwYXRoMTUyMCI+PC9wYXRoPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPGcgaWQ9ImcxNTIyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNy4wOTYxODQsIDQuOTcyNzYwKSBzY2FsZSgtMSwgMSkgcm90YXRlKC0xODAuMDAwMDAwKSB0cmFuc2xhdGUoLTE3LjA5NjE4NCwgLTQuOTcyNzYwKSB0cmFuc2xhdGUoMTIuMDk2MTg0LCAwLjQ3Mjc2MCkiIGZpbGw9IiNFNEY3QUUiPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik01LDAgQzIuNDEzNSwwIDAuOTg5LDEuNTU4MzMzMzMgMC45ODksNC4xOTgzMzMzMyBDMC45ODksNi45MDggMi40OCw4LjMzMDY2NjY3IDUsOC4zMzA2NjY2NyBDNy41MjM1LDguMzMwNjY2NjcgOS4wMTEsNi45MDggOS4wMTEsNC4xOTgzMzMzMyBDOS4wMTEsMS41NTgzMzMzMyA3LjU4NjUsMCA1LDAiIGlkPSJwYXRoMTUyNCI+PC9wYXRoPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPGcgaWQ9ImcxNTI2IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNi41OTYxODQsIDUuOTcyNzYwKSBzY2FsZSgtMSwgMSkgcm90YXRlKC0xODAuMDAwMDAwKSB0cmFuc2xhdGUoLTE2LjU5NjE4NCwgLTUuOTcyNzYwKSB0cmFuc2xhdGUoMTQuMDk2MTg0LCAzLjQ3Mjc2MCkiIGZpbGw9IiNGRkZGRkYiPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0yLjUsMCBDMC45NDk1LDAgMC4wOTIsMC44OTI1IDAuMDkyLDIuNDA0NSBDMC4wOTIsMy45NTUgMC45ODQ1LDQuNzcwNSAyLjUsNC43NzA1IEM0LjAxMiw0Ljc3MDUgNC45MDQ1LDMuOTU1IDQuOTA0NSwyLjQwNDUgQzQuOTA0NSwwLjg5MjUgNC4wNTA1LDAgMi41LDAiIGlkPSJwYXRoMTUyOCI+PC9wYXRoPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPGcgaWQ9ImcxNTMwIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNC41OTYxODQsIDY1Ljk3Mjc2MCkgc2NhbGUoLTEsIDEpIHJvdGF0ZSgtMTgwLjAwMDAwMCkgdHJhbnNsYXRlKC0xNC41OTYxODQsIC02NS45NzI3NjApIHRyYW5zbGF0ZSgxMC4wOTYxODQsIDYxLjQ3Mjc2MCkiIGZpbGw9IiNFNEY3QUUiPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik01LDAgQzIuNDEsMCAwLjk4OSwxLjU1ODMzMzMzIDAuOTg5LDQuMjAyIEMwLjk4OSw2LjkxMTY2NjY3IDIuNDc2NSw4LjMzNDMzMzMzIDUsOC4zMzQzMzMzMyBDNy41Miw4LjMzNDMzMzMzIDkuMDA0LDYuOTExNjY2NjcgOS4wMDQsNC4yMDIgQzkuMDA0LDEuNTU4MzMzMzMgNy41ODMsMCA1LDAiIGlkPSJwYXRoMTUzMiI+PC9wYXRoPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPGcgaWQ9ImcxNTM0IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNC4wOTYxODQsIDY2LjQ3Mjc2MCkgc2NhbGUoLTEsIDEpIHJvdGF0ZSgtMTgwLjAwMDAwMCkgdHJhbnNsYXRlKC0xNC4wOTYxODQsIC02Ni40NzI3NjApIHRyYW5zbGF0ZSgxMS4wOTYxODQsIDYzLjQ3Mjc2MCkiIGZpbGw9IiNGRkZGRkYiPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0yLjc1LDAgQzEuMDg4NzUsMCAwLjE3Mzc1LDAuOTU2MjUgMC4xNzM3NSwyLjU3NjI1IEMwLjE3Mzc1LDQuMjQ1IDEuMTMsNS4xMTUgMi43NSw1LjExNSBDNC4zNzM3NSw1LjExNSA1LjMyMjUsNC4yNDUgNS4zMjI1LDIuNTc2MjUgQzUuMzIyNSwwLjk1NjI1IDQuNDExMjUsMCAyLjc1LDAiIGlkPSJwYXRoMTUzNiI+PC9wYXRoPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=";
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
      currentObject: {}
    };
  },
  computed: {
    roas: function() {
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
    this.loading = false;
  },
  methods: {
    clickNode: function(node) {
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
    getTreeData: function(index) {
      let tree = this.tree;
      const roas = this.roas;
      function traverse(node) {
        let mates = node.mates;
        let newMates = [];
        if (mates) {
          mates.forEach(m => {
            newMates.push({
              name: m.name,
              object: m.object,
              class: ["clickable"],
              image_url: LIGHT_GREEN_SQUARE,
              warnings: m.object ? m.object.remark_counts_me.WARN : 0,
              errors: m.object ? m.object.remark_counts_me.ERROR : 0
            });
          });
        }

        node.siblings = newMates;

        let children = node.children;
        node.image_url = GREEN_SQUARE;
        if (node.name === "ripe-ncc-ta.cer") {
          node.image_url = RIPENCC;
        }
        if (node.name === "rta-lacnic-rpki.cer") {
          node.image_url = LACNIC;
        }
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
                child.image_url = GREEN_SQUARE;
              } else {
                child.image_url = WHITE_SQUARE;
              }
            }
          });
        }
      }
      traverse(tree);
      return tree;
    },
    searchResource: function() {
      this.loading = true;
      if (isIp(this.search)) {
        APIService.getPrefix(this.search).then(response => {
          this.loading = false;
          this.tree = response.data.data;
          if (!this.selectedNode) {
            this.selectedNode = this.roas[0];
          }
        });
      } else {
        APIService.getASN(this.search).then(response => {
          this.loading = false;
          this.tree = response.data.data;
          if (!this.selectedNode) {
            this.selectedNode = this.roas[0];
          }
        });
      }
      return false;
    }
  }
};
</script>

<style lang="scss">
.box-card {
  margin: 2rem;
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
  .el-row {
    padding: 0.8rem;
    border-bottom: 1px solid #ebeef5;
  }
  .el-row:nth-child(odd) {
    background-color: #fafafa;
  }
}
</style>
