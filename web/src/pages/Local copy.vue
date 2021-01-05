<template>
  <q-page>
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered :width="260">
      <q-list class="text-body1">
        <q-tabs vertical v-model="tagSelected" class="text-teal">
          <q-tab
            no-caps
            name="all images"
            style="margin-top:20px"
            :class="[
              tagSelected === 'all images' ? 'active-tab tab-item' : 'tab-item'
            ]"
          >
            <div
              style="width:160px; font-family:Segoe UI;"
              class="row justify-between"
            >
              <span style=" font-weight: bold" class="ellipsis col-10 text-left"
                >All Images</span
              >
              <span
                :style="{
                  color: tagSelected === 'all images' ? '#fff' : '#999'
                }"
                class="col"
                >{{ getTagSum("all images") }}</span
              >
            </div>
          </q-tab>
        </q-tabs>
        <q-scroll-area style="height: 690px">
          <q-tabs v-model="tagSelected" vertical class="text-teal">
            <q-tab
              no-caps
              v-for="tag in TagsSorted"
              :id="tag.value"
              :key="tag.value"
              :name="tag.value"
              @dragenter="onDragEnter"
              @dragleave.self="onDragLeave"
              @dragover="onDragOver"
              @drop="onDrop"
              :class="[
                tagSelected === tag.value ? 'active-tab tab-item' : 'tab-item'
              ]"
            >
              <div style="width:160px" class="row justify-between">
                <span
                  style=" font-weight: bold;text-transform:capitalize;"
                  class="ellipsis col-10 text-left"
                  >{{ tag.title }}</span
                >
                <span
                  :style="{
                    color: tagSelected === tag.value ? '#fff' : '#999'
                  }"
                  class="col"
                  >{{ getTagSum(tag.value) }}</span
                >
              </div>
            </q-tab>
          </q-tabs>
        </q-scroll-area>
        <q-separator />
        <q-tabs vertical v-model="tagSelected" class="text-teal q-mt-xs">
          <q-tab
            no-caps
            name="incorrect"
            :class="[
              tagSelected === 'incorrect' ? 'active-tab tab-item' : 'tab-item'
            ]"
          >
            <div style="width:160px">
              <span style="display:block; float:left; font-weight: bold"
                ><q-icon
                  name="clear"
                  size="20px"
                  class="q-mr-xs q-pa-xs bg-red"
                  color="white"
                ></q-icon
                >Incorrect</span
              >
              <span
                :style="{
                  display: 'block',
                  float: 'right',
                  color: tagSelected === 'incorrect' ? '#fff' : '#999'
                }"
                >{{ getTagSum("incorrect") }}</span
              >
            </div>
          </q-tab>
          <q-tab
            no-caps
            name="issue"
            :class="[
              tagSelected === 'issue' ? 'active-tab tab-item' : 'tab-item'
            ]"
          >
            <div style="width:160px">
              <span style="display:block; float:left; font-weight: bold"
                ><q-icon
                  name="help"
                  size="20px"
                  class="q-mr-xs q-pa-xs bg-warning"
                  color="white"
                ></q-icon
                >Issue</span
              >
              <span
                :style="{
                  display: 'block',
                  float: 'right',
                  color: tagSelected === 'issue' ? '#fff' : '#999'
                }"
                >{{ getTagSum("issue") }}</span
              >
            </div>
          </q-tab>
        </q-tabs>
      </q-list>
    </q-drawer>

    <div class="col-12">
      <q-tab-panels
        v-model="tagSelected"
        vertical
        transition-prev="jump-up"
        transition-next="jump-up"
      >
        <q-tab-panel
          v-for="tag in Tags"
          :key="tag.value"
          :name="tag.value"
          :id="tag.value"
        >
          <q-table
            ref="imgTable"
            :pagination="{ sortBy: 'tag', descending: true, rowsPerPage: 12 }"
            :data="filterMethod()"
            :columns="columns"
            row-key="name"
            :filter="filter"
            :sort-method="sortMethod"
            :grid="!tableView"
          >
            <template v-slot:top>
              <span class="text-h5 col">
                {{
                  ["issue", "incorrect"].indexOf(tagSelected) === -1
                    ? "Correct " + getAccuracy(tagSelected)
                    : ""
                }}
              </span>
              <q-btn
                label="Filter Setting"
                class="q-mr-xl"
                color="secondary"
                @click="filterDialog = !filterDialog"
              />
              <q-toggle
                v-model="showLabel"
                label="Show Label"
                left-label
                class="q-mr-xl"
              />

              <q-toggle
                v-model="tableView"
                :label="tableView ? 'Table View' : 'Card View'"
                left-label
                class="q-mr-xl"
              />

              <q-input
                borderless
                dense
                debounce="300"
                color="primary"
                v-model="filter"
                placeholder="Search"
                class="col-2"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>

            <template v-slot:item="props" v-show="!tableView">
              <div
                class="q-pa-md col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition"
              >
                <q-card>
                  <q-list dense>
                    <q-img
                      :id="props.row.id"
                      :src="props.row.src"
                      style="height: 210px; max-width: 450px"
                      draggable="true"
                      @dragstart="onDragStart"
                      @dragend="onDragEnd"
                      spinner-color="primary"
                      class="rounded-borders"
                    >
                      <div
                        class="absolute-top-left"
                        style="padding: 0; background: transparent"
                        v-if="showLabel"
                      >
                        <q-btn
                          v-for="item in Object.keys(
                            parentTagFilter(props.row.tag[1])
                          )"
                          :key="item"
                          :label="item"
                          style="
                            margin: 10px;
                            background-color: rgba(0, 0, 100, 0.7);
                            color: #fff;
                          "
                        >
                          <q-tooltip>
                            {{ parentTagFilter(props.row.tag[1])[item] }}
                          </q-tooltip>
                        </q-btn>
                        <q-btn
                          v-for="item in Object.keys(
                            childTagFilter(props.row.tag[0])
                          )"
                          :key="item"
                          :label="item"
                          style="
                            margin: 10px;
                            background-color: rgba(0, 0, 0, 0.5);
                            color: #fff;
                          "
                        >
                          <q-tooltip>
                            {{ childTagFilter(props.row.tag[0])[item] }}
                          </q-tooltip>
                        </q-btn>
                      </div>
                      <q-btn
                        flat
                        icon="more_horiz"
                        class="absolute-top-right"
                        style="margin: 10px"
                        @click="handleMore(props.row)"
                      ></q-btn>
                      <div
                        class="absolute-bottom-right"
                        style="padding: 0; background: transparent"
                      >
                        <q-btn
                          icon="close"
                          :class="[
                            Object.keys(props.row).includes('checked') &&
                            props.row.checked === 'incorrect'
                              ? 'bottom-icon incorrect'
                              : 'bottom-icon'
                          ]"
                          @click="
                            handleAddState(
                              props.row.id,
                              'incorrect',
                              tagSelected
                            )
                          "
                        />
                        <q-btn
                          icon="help"
                          :class="[
                            Object.keys(props.row).includes('checked') &&
                            props.row.checked === 'issue'
                              ? 'bottom-icon issue'
                              : 'bottom-icon'
                          ]"
                          @click="
                            handleAddState(props.row.id, 'issue', tagSelected)
                          "
                        />
                        <q-btn
                          icon="check"
                          :class="[
                            Object.keys(props.row).includes('checked') &&
                            props.row.checked === 'correct'
                              ? 'bottom-icon correct'
                              : 'bottom-icon'
                          ]"
                          @click="
                            handleAddState(props.row.id, 'correct', tagSelected)
                          "
                        />
                      </div>
                    </q-img>
                  </q-list>
                </q-card>
              </div>
            </template>
            <template v-slot:body-cell-tag="props" v-show="tableView">
              <q-td :props="props" style="font-size:0.9rem;">
                <q-badge
                  v-for="item in Object.keys(childTagFilter(props.row.tag[0]))"
                  :key="item"
                  class="q-mx-xs"
                  outline
                  color="black"
                  ><q-tooltip>
                    {{ props.row.tag[0][item] }}
                  </q-tooltip>
                  {{ item }}
                </q-badge>
              </q-td>
            </template>
            <template v-slot:body-cell-checked="props" v-show="tableView">
              <q-td
                :props="props"
                :class="getTextColor(props.row.checked)"
                style="font-size:0.9rem;"
              >
                {{ props.row.checked }}
              </q-td>
            </template>

            <template v-slot:bottom="props">
              <q-toolbar>
                <q-toolbar-title>
                  Showing
                  <span class="text-bold">{{
                    (props.pagination.page - 1) * props.pagination.rowsPerPage +
                      1
                  }}</span
                  >-<span class="text-bold">{{
                    Math.min(
                      props.pagination.page * props.pagination.rowsPerPage,
                      filterMethod().length
                    )
                  }}</span>
                  of <span class="text-bold">{{ filterMethod().length }}</span>
                </q-toolbar-title>

                <div class="text-body1 q-mr-xl" v-if="tagLoading">
                  Loading tags prediction from server...<q-spinner
                    color="primary"
                    size="2em"
                  />
                </div>
                <q-pagination
                  id="pagination"
                  ripple
                  size="17px"
                  :direction-links="true"
                  :props="props"
                  v-model="props.pagination.page"
                  color="blue-3"
                  text-color="blue"
                  :max="props.pagesNumber"
                  :max-pages="6"
                >
                </q-pagination>
              </q-toolbar>
            </template>
          </q-table>
        </q-tab-panel>
      </q-tab-panels>
    </div>
    <q-dialog v-model="filterDialog">
      <q-card style="width:600px" class="q-pa-lg">
        <p class="text-h5">Showing Settings</p>

        Filter for parent tag: {{ parentTagFilterNum }}

        <q-slider
          v-model="parentTagFilterNum"
          :min="parentDataFilter"
          :max="1"
          :step="0.01"
        />

        Filter for detail tag: {{ childTagShowNum }}

        <q-slider
          v-model="childTagShowNum"
          :min="childDataFilter"
          :max="1"
          :step="0.01"
          color="green"
        />

        Parent label number limit: {{ parentLabelNum }}

        <q-slider
          v-model="parentLabelNum"
          :min="0"
          :max="5"
          :step="1"
          color="red"
        />

        Detail label number limit: {{ childLabelNum }}

        <q-slider
          v-model="childLabelNum"
          :min="0"
          :max="7"
          :step="1"
          color="orange"
        />
        <p class="text-h5">Data Settings(need refresh)</p>

        Data filter for parent tag: {{ parentDataFilter }}

        <q-slider v-model="parentDataFilter" :min="0" :max="1" :step="0.01" />

        Data filter for detail tag: {{ childDataFilter }}

        <q-slider
          v-model="childDataFilter"
          :min="0.5"
          :max="1"
          :step="0.01"
          color="green"
        />
        <q-card-actions align="right">
          <q-btn
            color="primary"
            no-caps
            class="q-mr-md q-px-sm"
            @click="onSaveFilter"
            >OK</q-btn
          >
          <!-- <q-btn color="primary" no-caps class="q-px-sm" v-close-popup
            >Cancel</q-btn
          > -->
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showDialog">
      <q-card>
        <q-btn
          icon="close"
          flat
          round
          dense
          v-close-popup
          class="absolute-top-right z-top q-ma-sm"
        />
        <q-card-section>
          <div class="row q-mt-md" style="width: 500px; margin-bottom: 15px">
            <q-img
              :src="selected.src"
              style="width: 214px; height: 143px"
              class="rounded-borders col"
            ></q-img>
            <div class="col" style="margin-left: 15px">
              <div class="title">
                AI Photo Tags
                <q-btn
                  class="q-ml-sm"
                  label="Change"
                  no-caps
                  color="blue-4"
                  dense
                  @click="addChildTag = !addChildTag"
                />
              </div>

              <q-select
                v-show="addChildTag"
                @blur="setSelectValue"
                ref="tagSelect"
                new-value-mode="add-unique"
                @filter="filterFn"
                outlined
                v-model="addTag"
                use-input
                hide-dropdown-icon
                input-debounce="0"
                :options="filterOptions"
                :placeholder="addTag === '' ? 'Add Tag' : ''"
                style="width: 240px; margin: 10px 0"
              >
                <template v-slot:append>
                  <q-icon
                    name="close"
                    @click.stop="addTag = ''"
                    class="cursor-pointer"
                  />
                </template>
              </q-select>
              <q-select
                v-show="!addChildTag"
                outlined
                v-model="addTag"
                :options="parentTagsList"
                style="width: 240px; margin: 10px 0"
              >
                <template v-slot:append>
                  <q-icon
                    name="close"
                    @click.stop="addTag = ''"
                    class="cursor-pointer"
                  />
                </template>
              </q-select>
              <q-btn
                label="add"
                no-caps
                style="
                  background: #0c66ff;
                  color: #fff;
                  height: 31px;
                "
                @click="handleAddTag(addChildTag)"
              />
            </div>
          </div>
          <q-separator />
          <div
            v-for="tag in Object.keys(
              selected.tag ? parentTagFilter(selected.tag[1]) : []
            )"
            style="margin: 15px 5px 0 5px; display: inline-block"
          >
            <q-btn
              :label="tag"
              no-caps
              icon-right="close"
              @click="handleDeleteTag(tag, 1)"
              style="background-color: rgba(0, 0, 100, 0.5); color: #fff"
            >
              <q-tooltip>
                {{ selected.tag ? selected.tag[1][tag] : "" }}
              </q-tooltip>
            </q-btn>
          </div>
          <div
            v-for="tag in Object.keys(
              selected.tag ? childTagFilter(selected.tag[0]) : []
            )"
            style="margin: 15px 5px 0 5px; display: inline-block"
          >
            <q-btn
              :label="tag"
              no-caps
              icon-right="close"
              @click="handleDeleteTag(tag, 0)"
              style="background-color: rgba(0, 0, 0, 0.5); color: #fff"
            >
              <q-tooltip>
                {{ selected.tag ? selected.tag[0][tag] : "" }}
              </q-tooltip>
            </q-btn>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
let _this;

import axios from "axios";
import { uploadUrl, loadImage, upload } from "../utils/request";

export default {
  name: "PageLocal",
  data() {
    return {
      filterOptions: [],
      filter: "",
      tableView: false,
      showDialog: false,
      showLabel: true,
      addChildTag: true,
      parentTagsList: null,
      addTag: [],
      currentPage: 1,
      tagSelected: "all images",
      image: [],
      ticked: [],
      selected: [],
      slide: 1,
      imageList: [],
      columns: [
        {
          name: "imgId",
          required: true,
          label: "imgId",
          align: "left",
          field: row => row.id,
          format: val => `${val}`
        },
        {
          name: "src",
          label: "src",
          field: "src",
          align: "left",
          field: row => row.src.split("image/")[1]
        },
        {
          name: "tag",
          label: "tag",
          align: "left",
          field: row => Object.keys(row.tag).join(", "),
          sortable: true
        },
        {
          name: "checked",
          label: "checked",
          field: "checked"
        }
      ],
      autoplay: false,
      leftDrawerOpen: false,
      Tags: [
        {
          value: "all images"
        },
        {
          value: "incorrect"
        },
        {
          value: "issue"
        }
      ],
      dragover: null,
      tagLoading: false,
      dbLoading: true,
      parentTagFilterNum: Number(localStorage.getItem("pd-num") || 0.4),
      childTagShowNum: Number(localStorage.getItem("cd-num") || 0.8),
      childLabelNum: Number(localStorage.getItem("cl-num") || 3),
      parentLabelNum: Number(localStorage.getItem("pl-num") || 2),
      parentDataFilter: Number(localStorage.getItem("pd-num") || 0.4),
      childDataFilter: Number(localStorage.getItem("cd-num") || 0.8),
      filterDialog: false
    };
  },
  computed: {
    tagsArray() {
      return this.Tags.map(e => e.value);
    },
    TagsSorted() {
      return _this.Tags.slice(3).sort((a, b) => {
        return a.value.localeCompare(b.value);
      });
    }
  },
  async created() {
    _this = this;

    const file = JSON.parse(localStorage.getItem("files"));
    this.dbLoading = localStorage.getItem("model").match("DB") ? true : false;
    const files = file.map(item => item.split("/"));

    if (!files[0]) {
      this.$q.notify({
        message: "There is no file chosen, please go back.",
        position: "center",
        color: "primary",
        actions: [
          {
            label: "OK",
            color: "white"
          }
        ]
      });
    } else {
      let last = 0;

      files.map(async (tag, index1) => {
        let value = tag[1];
        if (value == "Businesscard") value = "Business_card";
        if (value == "Cloudy") value = "cloud";
        if (value == "People") value = "person";
        if (value == "Skycraper") value = "Skyscraper";
        if (value == "Sports car") value = "car";
        if (value == "volleyball") value = "volleyball sport";
        value = value.replace(" ", "_");
        _this.Tags.push({ title: tag[1], value: value.toLowerCase() });
        const imgName = await loadImage(tag[0] + "/" + tag[1]);
        const pathList = [];
        imgName.map(item => {
          if (
            item.name.match(/jpe?g/i) &&
            escape(item.name).indexOf("%u") < 0
          ) {
            pathList.push(
              "http://192.168.82.205/file/image/" +
                tag[0] +
                "/" +
                tag[1] +
                "/" +
                item.name
            );
          }
        });
        pathList.map((t, index3) => {
          _this.imageList.push({
            id: tag[1] + "_" + index3,
            src: pathList[index3],
            tag: [{ [tag[1]]: 1 }, {}],
            checked: "correct"
          });
        });

        // async load
        function predict(i) {
          _this.tagLoading = true;
          let query = window.btoa(
            JSON.stringify({ find: { "info.path": pathList } })
          );

          if (_this.dbLoading) {
            upload("query", query).then(res => {
              _this.resHandle(res.data.data[0].info.res, value, i);
              _this.tagLoading = false;
            });
          } else {
            upload("predict", pathList).then(res => {
              _this.resHandle(res, value, i);
              _this.tagLoading = false;
            });
          }
        }
        if (pathList.length > 0) predict(last);
        // start index of every tag
        last += pathList.length;
      });
    }
  },
  mounted() {
    this.$root.$on("exportFile", () => {
      this.handleExport();
    });
  },

  beforeDestroy() {
    this.$root.$off("exportFile");
  },
  methods: {
    resHandle(res, value, i) {
      res.map((filterTag, index3) => {
        let checked;
        let t = [{}, {}];
        let childTags = [],
          parentTags = [];
        if (!this.parentTagsList)
          this.parentTagsList = filterTag.map(e => e.tag).sort();
        //first parent filter
        filterTag = filterTag.filter(e => {
          return e.score > this.parentDataFilter;
        });
        filterTag.forEach(e => {
          childTags = childTags.concat(e.children);
        });
        filterTag.forEach(e => {
          parentTags = parentTags.concat([{ tag: e.tag, score: e.score }]);
        });
        childTags.sort((a, b) => {
          return b.score - a.score;
        });
        if (
          childTags.map(e => e.tag).includes(value.toLowerCase()) ||
          parentTags.map(e => e.tag).includes(value.toLowerCase())
        ) {
          checked = childTags.length > 1 ? "issue" : "correct";
        } else checked = "incorrect";
        //first child filter
        childTags.map(e => {
          if (e.score > this.childDataFilter) t[0][e.tag] = e.score;
        });
        parentTags.map(e => {
          t[1][e.tag] = e.score;
        });
        //console.log(childTags);
        _this.imageList[i + index3].tag = t;
        _this.imageList[i + index3].checked = checked;
        for (const key in t[0]) {
          if (!_this.tagsArray.includes(key)) {
            _this.Tags.push({
              title: key,
              value: key.toLowerCase()
            });
          }
        }
      });
    },
    filterMethod() {
      if (this.tagSelected == "all images") return this.imageList;
      else if (this.tagSelected == "incorrect" || this.tagSelected == "issue") {
        return this.imageList.filter(item => {
          return item.checked == this.tagSelected;
        });
      } else {
        return this.imageList.filter(item => {
          return item.tag[0][this.tagSelected];
        });
      }
    },
    onSaveFilter() {
      localStorage.setItem("cl-num", this.childLabelNum);
      localStorage.setItem("pl-num", this.parentLabelNum);
      localStorage.setItem("cd-num", this.childDataFilter);
      localStorage.setItem("pd-num", this.parentDataFilter);
      this.filterDialog = false;
    },

    sortMethod(rows, sortBy, descending) {
      const data = [...rows];
      if (sortBy) {
        data.sort((a, b) => {
          const x = descending ? b : a;
          const y = descending ? a : b;
          if (sortBy === "tag") {
            // string sort
            return (
              parseFloat(x[sortBy][this.tagSelected]) -
              parseFloat(y[sortBy][this.tagSelected])
            );
          } else {
            // numeric sort
            return parseFloat(x[sortBy]) - parseFloat(y[sortBy]);
          }
        });
      }

      return data;
    },

    parentTagFilter(tag) {
      let tagObject = {},
        keys = Object.keys(tag);
      if (this.parentLabelNum > 0) {
        keys.some((key, index) => {
          if (tag[key] > this.parentTagFilterNum) tagObject[key] = tag[key];
          return index == this.parentLabelNum - 1;
        });
      }
      if (Object.keys(tagObject).length == 1 && tagObject[keys[0]] < 0.7)
        tagObject = {};
      return tagObject;
    },
    childTagFilter(tag) {
      let tagObject = {},
        keys = Object.keys(tag);
      if (this.childLabelNum > 0) {
        keys.some((key, index) => {
          if (tag[key] > this.childTagShowNum) tagObject[key] = tag[key];
          return index == this.childLabelNum - 1;
        });
      }

      // if (Object.keys(tagObject).length == 0 && keys[0])
      //   tagObject[keys[0]] = tag[keys[0]];
      return tagObject;
    },
    getTextColor(checked) {
      if (checked == "correct") {
        return "text-green";
      } else if (checked == "incorrect") {
        return "text-red";
      } else if (checked == "issue") {
        return "text-orange";
      }
    },

    onDragStart(e) {
      e.dataTransfer.setData("text", e.target.id + "*" + this.tagSelected);
      e.dataTransfer.dropEffect = "move";
      // console.log(this.imageList[0].tag);
    },

    onDragEnter(e) {},

    onDragLeave(e) {
      e.preventDefault();
      if (this.dragover) {
        this.dragover.classList.remove("drag-enter");
      }

      this.dragover = null;
    },

    onDragOver(e) {
      e.preventDefault();
      let q = e.target;
      for (let i = 0; i < 3; i++) {
        if (!q.id) {
          q = q.parentNode;
        }
      }
      // console.log(this.dragover==q)
      if (q != this.dragover) {
        q.classList.add("drag-enter");
        if (this.dragover) {
          this.dragover.classList.remove("drag-enter");
        }
      }
      this.dragover = q;
    },
    onDragEnd(e) {
      if (this.dragover) {
        this.dragover.classList.remove("drag-enter");
        this.dragover = null;
      }
    },
    onDrop(e) {
      e.preventDefault();
      // don't drop on other draggables
      if (e.target.draggable === true) {
        return;
      }
      const draggedId = e.dataTransfer.getData("text").split("*")[0];
      const originTag = e.dataTransfer.getData("text").split("*")[1];
      const draggedEl = document.getElementById(draggedId);

      let q = e.target;
      for (let i = 0; i < 3; i++) {
        if (!q.id) {
          q = q.parentNode;
        }
      }

      const targetTagId = q.id;
      // check if original parent node
      // if (draggedEl.parentNode === e.target) {
      //   e.target.classList.remove("drag-enter");
      //   return;
      // }
      // make the change
      this.imageList.some(img => {
        if (img.id == draggedId && targetTagId) {
          if (["all images", "incorrect", "issue"].indexOf(originTag) == -1) {
            img.tag[0][originTag] = 0;
          }
          img.tag[0][targetTagId] = 1;
        }
        return img.id == draggedId;
      });
      this.$forceUpdate();
      // console.log(this.imageList);
      e.target.classList.remove("drag-enter");
    },

    getTagSum(ctag) {
      let len = 0;
      if (ctag === "all images") {
        len = this.imageList.length;
      } else if (ctag === "incorrect" || ctag === "issue") {
        const data = this.imageList.filter(
          item => Object.keys(item).includes("checked") && item.checked === ctag
        );
        len = data.length;
      } else {
        const data = this.imageList.map(item => {
          if (item.tag[0][ctag] > 0) {
            len += 1;
          }
        });
      }
      return len;
    },

    getAccuracy(tag) {
      let trueData = null;
      let data = null;
      if (tag === "all images") {
        data = this.imageList;
        trueData = this.imageList.filter(
          item =>
            Object.keys(item).includes("checked") &&
            item.checked !== "incorrect"
        );
      } else {
        data = this.imageList.filter(
          item => Object.keys(item.tag[0]).includes(tag) && item.tag[0][tag] > 0
        );
        trueData = this.imageList.filter(
          item =>
            Object.keys(item).includes("checked") &&
            item.checked !== "incorrect" &&
            Object.keys(item.tag[0]).includes(tag) &&
            item.tag[0][tag] > 0
        );
      }
      //console.log(data)
      return ((trueData.length / data.length) * 100).toFixed(2) + "%";
    },

    handleMore(img) {
      this.selected = img;
      this.showDialog = true;
    },

    handleAddTag(child) {
      const text = this.addTag.trim();
      if (text !== "") {
        if (child == true) {
          let data = this.Tags.filter(item => item.value === text);
          // add non-exist tag
          if (data.length === 0) {
            this.Tags.push({ title: text, value: text });
          }
          this.$set(this.selected.tag[0], text, 1.0);
          this.$set(this.selected, "checked", "correct");
          // this.selected.checked = "correct";
        } else this.$set(this.selected.tag[1], text, 1.0);
        this.addTag = "";
      }
      // console.log(this.Tags)
    },

    handleDeleteTag(tag, ind) {
      this.$set(this.selected.tag[ind], tag, 0);
      // this.selected.tag[tag] = 0;
      let sum = 0;
      for (const key in this.selected.tag[0]) {
        sum += this.selected.tag[0][key];
      }
      if (sum == 0) this.$set(this.selected, "checked", "issue");
      this.$forceUpdate();
    },

    handleAddState(id, state, tagSelected) {
      // this.$set(this.imageList[index], "checked", state);
      // if (["all images", "issue", "incorrect"].indexOf(tagSelected) === -1) {
      //   this.$set(this.imageList[index].tag, tagSelected, 0);
      // }
      this.imageList.some((img, index) => {
        if (img.id === id) {
          this.$set(this.imageList[index], "checked", state);
          // if (
          //   ["all images", "issue", "incorrect"].indexOf(tagSelected) === -1
          // ) {
          //   this.$set(this.imageList[index].tag, tagSelected, 0);
          // }
        }
        return img.id === id;
      });
    },

    setSelectValue(val) {
      if (this.$refs.tagSelect.$refs.target.value !== "") {
        this.addTag = this.$refs.tagSelect.$refs.target.value;
      }
    },

    filterFn(val, update) {
      update(() => {
        //  console.log(this.Tags);
        if (val === "") {
          this.filterOptions = this.TagsSorted.map(item => item.value);
        } else {
          const needle = val.toLowerCase();
          const options = this.Tags.slice(3).map(item => item.value);
          this.filterOptions = options.filter(
            v => v.toLowerCase().indexOf(needle) > -1
          );
        }
      });
    },

    async handleExport() {
      for (let i = 0, len = this.imageList.length; i < len; i++) {
        const item = this.imageList[i];
        if (item.checked !== "correct") continue;
        item.path = item.src.split("image/")[1];
        const tags = [];
        Object.keys(item.tag[0]).filter(key => {
          if (item.tag[0][key] > 0) {
            tags.push({ name: key, region: item.tag[0][key] });
          }
        });
        const query = window.btoa(
          JSON.stringify({ find: { "info.path": item.path } })
        );

        const res = await upload("query", query);
        // console.log(res)
        let q_method = res.data.total == 0 ? "POST" : "PUT";
        let q_id = res.data.total == 0 ? "" : res.data.data[0].id;
        let q_msg = res.data.total == 0 ? "Upload" : "Change";
        axios({
          method: q_method,
          url: uploadUrl + "/images/" + q_id,
          data: {
            info: {
              path: item.path,
              tags: tags
            }
          }
        }).then(() => {
          this.$q.notify({
            message: q_msg + " images successfully",
            position: "top",
            color: "green",
            actions: [
              {
                label: "OK",
                color: "white"
              }
            ]
          });
        });
      }
    }
  }
};
</script>

<style lang="scss">
.drag-enter {
  background-color: $green-5;
}

.tab-item {
  border-radius: 50px;
  margin: 5px auto;
  color: #000;
  font-family: Segoe UI;
}

.active-tab {
  background-color: #000;
  color: #fff;
}

.bottom-icon {
  margin: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  width: 36px;
}

.title {
  font-family: Segoe UI;
  font-size: 24px;
  color: #333;
}

.page-info {
  font-family: Segoe UI;
  font-size: 18px;
  color: #333;
}

.incorrect {
  background-color: #f03d3d !important;
}

.issue {
  background-color: #f8ce3d !important;
}

.correct {
  background-color: #3ed3a3 !important;
}
.q-tab__indicator {
  display: none;
}
.q-table__top {
  padding: 0 16px;
}
.q-table__title {
  font-family: Segoe UI;
  font-size: 24px;
}

.q-toolbar__title {
  font-family: Segoe UI;
  color: #333;
  font-size: 18px;
}

.q-tab {
  min-height: 40px;
  height: 40px;
  width: 200px;
}
.round-btn {
  border-radius: 15px;
}
</style>
