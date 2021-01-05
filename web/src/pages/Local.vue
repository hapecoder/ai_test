<template>
  <q-page style="text-transform:capitalize;">
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
              <span class="ellipsis col-10 text-left text-bold "
                >All Images</span
              >
              <span
                :style="{
                  color: tagSelected === 'all images' ? '#fff' : '#999'
                }"
                class="col text-bold"
              >
                {{ getTagSum("all images") || "" }}
              </span>
            </div>
          </q-tab>
        </q-tabs>
        <q-scroll-area style="height:72.5vh">
          <q-tabs v-model="tagSelected" vertical class="text-teal q-ml-xs">
            <q-tree
              :nodes="TagsSorted"
              node-key="tag"
              label-key="tag"
              ref="tree"
              v-if="TagsSorted.length > 0"
            >
              <template v-slot:default-header="prop">
                <div class="row items-center">
                  <q-tab
                    no-caps
                    class="text-weight-bold text-black q-ml-md"
                    :id="prop.node.tag"
                    :name="prop.node.tag"
                    @dragenter="onDragEnter"
                    @dragleave.self="onDragLeave"
                    @dragover="onDragOver"
                    @drop="onDrop"
                  >
                    <div style="width:160px" class="row justify-between">
                      <span
                        :style="{
                          color: tagSelected === prop.node.tag ? '#000' : '#888'
                        }"
                        class="ellipsis col-9 text-left"
                        >{{ prop.node.tag }}</span
                      >
                      <span
                        :style="{
                          color: tagSelected === prop.node.tag ? '#000' : '#888'
                        }"
                        class="col"
                        >{{ getTagSum(prop.node.tag) || "" }}</span
                      >
                    </div>
                  </q-tab>
                </div>
              </template>
            </q-tree>
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
      <div class="q-mt-md">
        <q-table
          ref="imgTable"
          :pagination="{ rowsPerPage: 12 }"
          :data="tableDataFilter"
          :columns="columns"
          row-key="name"
          :filter="filter"
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
              no-caps
              label="Show tag-Num"
              class="q-mr-md"
              color="secondary"
              @click="freeze"
            />
            <q-btn
              no-caps
              label="Filter Setting"
              class="q-mr-xl"
              color="secondary"
              @click="filterDialog = !filterDialog"
            />
            <q-toggle
              v-model="showMore"
              label="Show More"
              left-label
              class="q-mr-xl"
            />
            <q-toggle
              v-model="showLabel"
              label="Show Label"
              left-label
              class="q-mr-xl"
            />

            <q-toggle
              v-model="tableView"
              label="Table View"
              left-label
              class="q-mr-xl"
            />

            <q-input
              borderless
              dense
              debounce="300"
              color="primary"
              v-model="filter"
              placeholder="Search filename here..."
              class="col-2"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
              <template v-slot:append>
                <q-icon
                  name="close"
                  @click="filter = ''"
                  class="cursor-pointer"
                />
              </template>
            </q-input>
          </template>

          <template v-slot:item="props" v-show="!tableView">
            <div
              class="q-pa-sm col-xs-12 col-sm-6 col-md-4 col-lg-2 grid-style-transition"
              :class="showMore ? '' : 'col-lg-3 q-pa-md'"
            >
              <q-card>
                <q-list dense>
                  <q-img
                    :ratio="16 / 9"
                    :id="props.row.id"
                    :src="props.row.src"
                    style="max-width: 450px"
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
                          parentTagFilter(props.row.tag)
                        )"
                        :key="item"
                        :label="item"
                        style="
                            background-color: rgba(0, 0, 100, 0.7);
                            color: #fff;
                          "
                        class="q-ma-xs"
                        :size="showMore ? '80%' : '100%'"
                      >
                        <q-tooltip>
                          {{ parentTagFilter(props.row.tag)[item] }}
                        </q-tooltip>
                      </q-btn>
                      <q-btn
                        v-for="item in Object.keys(
                          childTagFilter(props.row.tag)
                        )"
                        :key="item"
                        :label="item"
                        style="
                            background-color: rgba(0, 0, 0, 0.5);
                            color: #fff;
                          "
                        class="q-ma-xs"
                        :size="showMore ? '80%' : '100%'"
                      >
                        <q-tooltip>
                          {{ childTagFilter(props.row.tag)[item] }}
                        </q-tooltip>
                      </q-btn>
                    </div>
                    <q-btn
                      flat
                      icon="more_horiz"
                      class="absolute-top-right"
                      style="margin: 10px"
                      :size="showMore ? '80%' : '100%'"
                      @click="handleMore(props.row)"
                    ></q-btn>
                    <div
                      class="absolute-bottom-right"
                      style="padding: 0; background: transparent"
                    >
                      <q-btn
                        icon="close"
                        class="q-ma-xs"
                        :style="
                          showMore
                            ? 'transform:scale(0.7);margin:1px'
                            : 'margin:10px'
                        "
                        :class="[
                          Object.keys(props.row).includes('checked') &&
                          props.row.checked === 'incorrect'
                            ? 'bottom-icon incorrect '
                            : 'bottom-icon'
                        ]"
                        @click="
                          handleAddState(props.row.id, 'incorrect', tagSelected)
                        "
                      />
                      <q-btn
                        icon="help"
                        class="q-ma-xs"
                        :style="
                          showMore
                            ? 'transform:scale(0.7);margin:1px'
                            : 'margin:10px'
                        "
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
                        :style="
                          showMore
                            ? 'transform:scale(0.7);margin:1px'
                            : 'margin:10px'
                        "
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
                v-for="item in Object.keys(childTagFilter(props.row.tag))"
                :key="item"
                class="q-mx-xs"
                outline
                color="black"
                ><q-tooltip>
                  {{ childTagFilter(props.row.tag)[item] }}
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
                  (props.pagination.page - 1) * props.pagination.rowsPerPage + 1
                }}</span
                >-<span class="text-bold">{{
                  Math.min(
                    props.pagination.page * props.pagination.rowsPerPage,
                    tableDataFilter.length
                  ) || tableDataFilter.length
                }}</span>
                <span style="text-transform:lowercase;"> of </span>
                <span class="text-bold">{{ tableDataFilter.length }}</span>
                <span class="q-ml-xl">
                  <span class="text-blue text-bold">{{
                    props.pagination.rowsPerPage + " "
                  }}</span
                  >Images PerPage<q-popup-edit
                    v-model="props.pagination.rowsPerPage"
                  >
                    <q-input
                      style="width:50px"
                      debounce="1000"
                      dense
                      autofocus
                      type="number"
                      v-model="props.pagination.rowsPerPage"
                  /></q-popup-edit>
                  <q-tooltip>Click to edit</q-tooltip>
                </span>
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
      </div>
    </div>
    <q-dialog v-model="filterDialog">
      <q-card style="width:600px" class="q-pa-lg">
        <p class="text-h5">Showing Settings</p>

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
        <p class="text-h5">Data Settings</p>

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
          <div class="row q-mt-md" style="width: 500px; margin-bottom: 15px;">
            <q-img
              contain
              :src="selected.src"
              style="max-height:230px"
              class="rounded-borders col q-mt-md"
              :ratio="1"
            ></q-img>
            <div class="col" style="margin-left: 15px">
              <div class="title">
                AI Photo Tags
              </div>
              <q-select
                dense
                outlined
                v-model="addParentTag"
                :options="parentTagsList"
                style="width: 240px; margin: 10px 0;"
                hint="Parent"
              >
                <template v-slot:append>
                  <q-icon
                    name="close"
                    @click.stop="addParentTag = ''"
                    class="cursor-pointer"
                  />
                </template>
              </q-select>
              <q-select
                dense
                @blur="setSelectValue"
                ref="tagSelect"
                new-value-mode="add-unique"
                @filter="selectFilter"
                outlined
                v-model="addChildTag"
                use-input
                hide-dropdown-icon
                input-debounce="0"
                :options="filterOptions"
                style="width: 240px; margin: 10px 0"
                hint="Children"
              >
                <template v-slot:append>
                  <q-icon
                    name="close"
                    @click.stop="addChildTag = ''"
                    class="cursor-pointer"
                  />
                </template>
              </q-select>

              <q-btn
                label="Add"
                no-caps
                size="15px"
                style="
                  background: #0c66ff;
                  color: #fff;
                  
                "
                @click="handleAddTag()"
              />
            </div>
          </div>
          <q-separator />
          <div
            v-for="tag in Object.keys(
              tagFilterById(selected.id)
                ? parentTagFilter(tagFilterById(selected.id).tag)
                : []
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
                {{
                  tagFilterById(selected.id)
                    ? parentTagFilter(tagFilterById(selected.id).tag)[tag]
                    : ""
                }}
              </q-tooltip>
            </q-btn>
          </div>
          <div
            v-for="tag in Object.keys(
              tagFilterById(selected.id)
                ? childTagFilter(tagFilterById(selected.id).tag)
                : []
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
                {{
                  tagFilterById(selected.id)
                    ? childTagFilter(tagFilterById(selected.id).tag)[tag]
                    : ""
                }}
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
import { imgUrl, uploadUrl, loadImage, upload } from "../utils/request";
import { extend } from "quasar";
export default {
  name: "PageLocal",
  data() {
    return {
      filterOptions: [],
      filter: "",
      tableView: false,
      showDialog: false,
      showLabel: true,
      showMore: false,
      parentTagsList: [],
      addChildTag: "",
      addParentTag: "",
      currentPage: 1,
      tagSelected: "all images",
      image: [],
      ticked: [],
      selected: "",
      slide: 1,
      imageList: [],
      freezeImageList: [],
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
          align: "left"
        },
        {
          name: "checked",
          label: "checked",
          field: "checked",
          sortable: true
        }
      ],
      autoplay: false,
      leftDrawerOpen: false,
      Tags: [],
      dragover: null,
      tagLoading: false,
      dbLoading: true,
      childLabelNum: Number(localStorage.getItem("cl-num") || 3),
      parentLabelNum: Number(localStorage.getItem("pl-num") || 2),
      parentDataFilter: Number(localStorage.getItem("pd-num") || 0.4),
      childDataFilter: Number(localStorage.getItem("cd-num") || 0.8),
      filterDialog: false
    };
  },
  computed: {
    tagsArray() {
      if (this.Tags.length > 0) {
        let childTags = [],
          parentTags = [];
        this.Tags.forEach(e => {
          childTags = childTags.concat(e.children.map(e => e.tag));
        });
        parentTags = this.Tags.map(e => e.tag);
        return parentTags.concat(childTags, "all images", "incorrect", "issue");
      }
    },
    TagsSorted() {
      let temp = JSON.parse(JSON.stringify(this.Tags));
      temp.sort((a, b) => {
        return a.tag.localeCompare(b.tag);
      });
      temp.forEach(e => {
        e.children = e.children.sort((a, b) => {
          return a.localeCompare(b);
        });
      });
      temp.forEach(
        e =>
          (e.children = e.children.map(c => {
            return { tag: c };
          }))
      );
      //if (this.$refs.tree) this.$refs.tree.expandAll();
      return Object.freeze(temp);
    },
    tableDataFilter() {
      const imageList = this.imageList;
      //const imageList = this.freezeImageList;
      if (this.tagSelected == "all images") return imageList;
      else if (this.tagSelected == "incorrect" || this.tagSelected == "issue") {
        return imageList.filter(item => {
          return item.checked == this.tagSelected;
        });
      } else if (this.parentTagsList.includes(this.tagSelected)) {
        return imageList.filter(item => {
          return item.tag.find(
            e => e.tag == this.tagSelected && e.score > this.parentDataFilter
          );
        });
      } else {
        return imageList.filter(item => {
          return item.tag.find(
            e =>
              e.children.find(v => v.tag == this.tagSelected) &&
              e.score > this.parentDataFilter &&
              e.children.find(
                v => v.tag == this.tagSelected && v.score > this.childDataFilter
              )
          );
        });
      }
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
        value = value.replace(" ", "_");
        const imgName = await loadImage(tag[0] + "/" + tag[1]);
        const pathList = [];
        imgName.map(item => {
          if (
            item.name.match(/jpe?g/i) &&
            escape(item.name).indexOf("%u") < 0
          ) {
            pathList.push(imgUrl + tag[0] + "/" + tag[1] + "/" + item.name);
          }
        });
        pathList.map((t, index3) => {
          _this.imageList.push({
            id: tag[1] + "_" + index3,
            src: pathList[index3],
            tag: [],
            checked: "issue"
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
  watch: {
    showMore(val) {
      let num = 12;
      if (val == true) num = 42;
      this.$refs.imgTable.setPagination({ rowsPerPage: num });
    }
  },

  beforeDestroy() {
    this.$root.$off("exportFile");
  },
  methods: {
    resHandle(res, value, i) {
      res.map((filterTag, index3) => {
        if (this.parentTagsList.length == 0)
          this.parentTagsList = filterTag.map(e => e.tag).sort();
        //console.log(this.parentTagsList)
        //push tag to TagList
        if (this.Tags.length == 0) {
          this.parentTagsList.forEach(e => {
            this.Tags.push({ tag: e, children: [] });
          });
        }
        this.Tags.forEach((e, ind) => {
          e.children = Array.from(
            new Set(
              e.children.concat(
                filterTag
                  .filter(t => {
                    return t.tag == e.tag;
                  })[0]
                  .children.map(c => c.tag)
              )
            )
          );
        });
        let childTags = [],
          checked;
        filterTag.forEach(e => {
          if (e.score > this.parentDataFilter)
            childTags = childTags.concat(
              e.children.filter(c => c.score > this.childDataFilter)
            );
        });
        if (childTags.map(e => e.tag).includes(value.toLowerCase())) {
          checked = childTags.length > 1 ? "issue" : "correct";
        } else checked = "incorrect";

        _this.imageList[i + index3].tag = filterTag;
        _this.imageList[i + index3].checked = checked;
      });
    },

    onSaveFilter() {
      localStorage.setItem("cl-num", this.childLabelNum);
      localStorage.setItem("pl-num", this.parentLabelNum);
      localStorage.setItem("cd-num", this.childDataFilter);
      localStorage.setItem("pd-num", this.parentDataFilter);
      this.filterDialog = false;
    },
    tableDataFilterMethod(tagNow, imageList = this.imageList) {
      if (tagNow == "all images")
        return imageList.filter(item => {
          return item.tag.find(e => e.score > this.parentDataFilter);
        });
      else if (tagNow == "incorrect" || tagNow == "issue") {
        return imageList.filter(item => {
          return item.checked == tagNow;
        });
      } else if (this.parentTagsList.includes(tagNow)) {
        return imageList.filter(item => {
          return item.tag.find(
            e => e.tag == tagNow && e.score > this.parentDataFilter
          );
        });
      } else {
        return imageList.filter(item => {
          return item.tag.find(
            e =>
              e.children.find(v => v.tag == tagNow) &&
              e.score > this.parentDataFilter &&
              e.children.find(
                v => v.tag == tagNow && v.score > this.childDataFilter
              )
          );
        });
      }
    },

    parentTagFilter(tag) {
      let tagObject = {};
      let parentTag = tag
        .map(e => {
          return { tag: e.tag, score: e.score };
        })
        .sort((a, b) => {
          return b.score - a.score || a.tag.localeCompare(b.tag);
        });
      if (this.parentLabelNum > 0 && tag.length > 0) {
        parentTag.some((key, index) => {
          if (parentTag[index].score > this.parentDataFilter) {
            tagObject[key.tag] = parentTag[index].score;
          }
          return index == this.parentLabelNum - 1;
        });
      }

      return tagObject;
    },
    childTagFilter(tag) {
      let tagObject = {};
      let childTag = [];
      let ptagArray = Object.keys(this.parentTagFilter(tag));
      tag.forEach(e => {
        if (ptagArray.includes(e.tag)) childTag = childTag.concat(e.children);
      });
      childTag.sort((a, b) => {
        return b.score - a.score || a.tag.localeCompare(b.tag);
      });
      if (this.childLabelNum > 0 && tag.length > 0) {
        childTag.some((key, index) => {
          if (childTag[index].score > this.childDataFilter) {
            tagObject[key.tag] = childTag[index].score;
          }
          return index == this.childLabelNum - 1;
        });
      }
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
      //console.log(targetTagId, draggedId, originTag);
      // ADD TAG
      this.imageList.forEach(e => {
        if (e.id == draggedId) {
          e.tag.forEach(f => {
            if (f.children.find(c => c.tag == targetTagId))
              f.children.some(c => {
                if (c.tag == targetTagId) c.score = 1;
              });
            else f.children.unshift({ tag: targetTagId, score: 1 });
          });
        }
      });
      e.target.classList.remove("drag-enter");
    },

    getTagSum(ctag) {
      return this.tableDataFilterMethod(ctag, this.freezeImageList).length;
    },
    freeze() {
      this.freezeImageList = Object.freeze(
        JSON.parse(JSON.stringify(this.imageList))
      );
    },
    getAccuracy(tag) {
      return (
        (
          (this.tableDataFilter.filter(e => e.checked != "incorrect").length /
            this.tableDataFilter.length) *
          100
        ).toFixed(2) + "%"
      );
    },
    tagFilterById(id) {
      return this.tableDataFilter.filter(e => e.id == id)[0];
    },
    handleMore(img) {
      this.selected = img;
      this.showDialog = true;
      this.addParentTag = img.tag[0] ? img.tag[0].tag : "";
      console.log(img.tag[0].children);
    },
    swapArray(arr, index1, index2) {
      arr[index1] = arr.splice(index2, 1, arr[index1])[0];
      return arr;
    },
    handleAddTag() {
      const ptext = this.addParentTag.trim();
      const ctext = this.addChildTag.trim();

      if (ctext !== "" && ptext !== "") {
        let id = this.selected.id;
        this.imageList.some(e => {
          if (e.id == id) {
            e.tag.some(f => {
              if (f.tag == ptext) {
                //CHILD TAG  EXIST IN THIS PARENT TAG
                if (f.children.find(c => c.tag == ctext)) {
                  f.children.some(c => {
                    if (c.tag == ctext) c.score = 1;
                  });
                  f.score = 1;
                }
                //CHILD TAG  EXIST IN OTHER PARENT TAG
                else if (
                  e.tag.find(t => t.children.find(c => c.tag == ctext))
                ) {
                  this.$q.notify("Tag has already existed in other parent tag");
                }
                //CHILD TAG  NOT EXIST
                else {
                  f.children.unshift({ tag: ctext, score: 1 });
                  if (this.childLabelNum == 0) this.childLabelNum += 1;
                  this.Tags.some(t => {
                    if (t.tag == ptext) {
                      if (!t.children.find(c => c == ctext)) {
                        t.children.unshift(ctext);
                      }
                      return true;
                    }
                  });
                  f.score = 1;
                }
                return true;
              }
            });
            return true;
          }
        });
        // add non-exist tag
        if (this.parentLabelNum == 0) this.parentLabelNum += 1;
        this.freeze();
        this.addChildTag = "";
      } else this.$q.notify("Please add something!");

      // console.log(this.Tags)
    },

    handleDeleteTag(tag, parent) {
      let id = this.selected.id;
      console.log(tag, this.tagSelected);
      this.imageList.some(e => {
        if (e.id == id) {
          e.tag.some(f => {
            let ind = f.children.findIndex(c => c.tag == tag);
            if (f.tag == tag && parent == 1) {
              f.score = 0;
              return true;
            } else if (ind > -1 && parent == 0) {
              f.children[ind].score = 0;
              return true;
            }
          });
          return true;
        }
      });
      //disappear alert

      if (tag == this.tagSelected) {
        this.$q.notify({
          message: "This image no longer shows here.",
          position: "center",
          timeout: 1500,
          actions: [
            {
              label: "OK",
              color: "white"
            }
          ]
        });
        this.showDialog = false;
      }

      this.freeze();
    },

    handleAddState(id, state, tagSelected) {
      this.imageList.some((img, index) => {
        if (img.id === id) {
          this.$set(this.imageList[index], "checked", state);
        }
        return img.id === id;
      });
      this.freeze();
    },

    setSelectValue(val) {
      if (this.$refs.tagSelect.$refs.target.value !== "") {
        this.addChildTag = this.$refs.tagSelect.$refs.target.value;
      }
    },
    getChildArray(tagArray, ptag) {
      let childrenArray = [];

      tagArray.forEach(e => {
        if (ptag && e.tag == ptag) {
          childrenArray.push(...e.children);
        }
      });

      return childrenArray;
    },

    selectFilter(val, update) {
      update(() => {
        //  console.log(this.Tags);

        if (val === "") {
          this.filterOptions = this.getChildArray(this.Tags, this.addParentTag);
        } else {
          const needle = val.toLowerCase();
          this.filterOptions = this.filterOptions.filter(
            v => v.toLowerCase().indexOf(needle) > -1
          );
        }
      });
    },

    async handleExport() {
      for (
        let i = 0, len = this.tableDataFilterMethod("all images").length;
        i < len;
        i++
      ) {
        const item = this.tableDataFilterMethod("all images")[i];
        console.log(item.checked);
        if (item.checked !== "correct") continue;
        item.path = item.src.split("image/")[1];
        const tags = item.tag;
        // Object.keys(item.tag[0]).filter(key => {
        //   if (item.tag[0][key] > 0) {
        //     tags.push({ name: key, region: item.tag[0][key] });
        //   }
        // });

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
.q-item__label {
  text-transform: capitalize;
}
span {
  text-transform: capitalize;
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
