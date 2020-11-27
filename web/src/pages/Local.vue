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
              v-for="tag in Tags.slice(3)"
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
                  style=" font-weight: bold;"
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
            :title="
              ['issue', 'incorrect'].indexOf(tagSelected) === -1
                ? 'Correct ' + getAccuracy(tagSelected)
                : ''
            "
            :pagination="{ sortBy: 'tag', rowsPerPage: 12 }"
            :data="imageList"
            :columns="columns"
            row-key="name"
            :filter="tagSelected"
            :filter-method="filterMethod"
            grid
            hide-header
          >
            <template v-slot:item="props">
              <div
                class="q-pa-md col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition"
              >
                <q-card>
                  <q-list dense>
                    <q-img
                      :id="props.row.id"
                      :src="props.row.src"
                      style="height: 210px; max-width: 400px"
                      draggable="true"
                      @dragstart="onDragStart"
                      @dragend="onDragEnd"
                      spinner-color="primary"
                      class="rounded-borders"
                    >
                      <div
                        class="absolute-top-left"
                        style="padding: 0; background: transparent"
                        v-if="
                          ['all images', 'incorrect', 'issue'].indexOf(
                            tagSelected
                          ) > -1
                        "
                      >
                        <q-btn
                          v-for="item in Object.keys(props.row.tag)"
                          v-if="props.row.tag[item] > 0"
                          :key="item"
                          :label="item"
                          style="
                            margin: 10px;
                            background-color: rgba(0, 0, 0, 0.5);
                            color: #fff;
                          "
                        ></q-btn>
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

    <q-dialog v-model="showDialog" v-if="showDialog">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="row" style="width: 500px; margin-bottom: 15px">
            <q-img
              :src="selected.src"
              style="width: 214px; height: 143px"
              class="rounded-borders col"
            ></q-img>
            <div class="col" style="margin-left: 15px">
              <div class="title">AI Photo Tags</div>
              <q-select
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
                style="width: 214px; margin: 10px 0"
              />
              <q-btn
                label="add"
                no-caps
                style="
                  background: #0c66ff;
                  color: #fff;
                  width: 72px;
                  height: 31px;
                "
                @click="handleAddTag"
              />
            </div>
          </div>
          <q-separator />
          <div
            v-for="tag in Object.keys(selected.tag)"
            v-if="selected.tag[tag] > 0"
            style="margin: 15px 5px 0 5px; display: inline-block"
          >
            <q-btn
              :label="tag"
              no-caps
              icon-right="close"
              @click="handleDeleteTag(tag)"
              style="background-color: rgba(0, 0, 0, 0.5); color: #fff"
            ></q-btn>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
let _this;

import axios from "axios";
import { loadImage, upload } from "../utils/request";

export default {
  name: "PageLocal",
  data() {
    return {
      filterOptions: [],
      showDialog: false,
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
          field: row => row.name,
          format: val => `${val}`
        },
        {
          name: "src",
          label: "src",
          field: "src"
        },
        {
          name: "tag",
          label: "tag",
          field: row => row.tag,
          sort: (a, b) => b[this.tagSelected] - a[this.tagSelected]
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
      dragover: null
    };
  },
  computed: {
    photos() {
      return Array.from(
        new Set(
          JSON.parse(localStorage.getItem("files")).map(
            item => item.split("/")[0]
          )
        )
      );
    },
    version() {
      return localStorage.getItem("model").split(":")[1];
    }
  },
  async created() {
    _this = this;

    let file = JSON.parse(localStorage.getItem("files"));
    let files = file.map(item => item.split("/"));

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
        let value =tag[1]
        if (value == "Skycraper") value = "Skyscraper";
        if (value == "Motobike") value = "Motorbike";
        if (value == "volleyball") value = "volleyball sport";
        _this.Tags.push({ title: tag[1], value: value.toLowerCase() });
        let imgName = await loadImage(tag[0] + "/" + tag[1]);
        let pathList = [];
        imgName.map(item => {
          if (item.name.match(/jpe?g/i) && escape(item.name).indexOf( "%u" )<0) {
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
            id: tag[1] + index3,
            src: pathList[index3],
            tag: {
              [tag[1].toLowerCase()]: 1
            },
            checked: "correct"
          });
        });
        // let imgPredict = await loadPredict(pathList);
        // imgPredict.map((t, index3) => {
        //   _this.imageList.push({
        //     id: tag[1] + index3,
        //     src: pathList[index3],
        //     // tag: {
        //     //   [tag[1]]: 1
        //     // },
        //     tag: t,
        //     checked: "correct"
        //   });
        // });

        //async load
        function predict(i) {
          upload("predict", pathList).then(res => {
            res.map((t, index3) => {
              let checked;
              if (Object.keys(t).indexOf(tag[1].toLowerCase()) > -1) {
                checked = Object.keys(t).length > 1 ? "issue" : "correct";
              } else checked = "incorrect";
              _this.imageList[i + index3].tag = t;
              _this.imageList[i + index3].checked = checked;
            });
          });
        }
        predict(last);
        last += pathList.length;
      });
    }
  },
  mounted() {
    this.$root.$on("exportFile", () => {
      this.handleExport();
    });

    // request({
    //   url: "http://192.168.82.205/model/v1/models/aitag",
    //   method: "post",
    //   data: { image: this.$store.imgFiles }
    // }));
    // let files = JSON.parse(localStorage.getItem("files"));
    // if (files) {
    //   files.map((item, index) => {
    //     _this.imageList.push({
    //       id: index,
    //       src: item,
    //       tag: {
    //         "'Nduja": (index + 1) % 2,
    //         "10 cane": index % 2
    //       },
    //       checked: "correct"
    //     });
    //   });
    // }
  },

  beforeDestroy() {
    this.$root.$off("exportFile");
  },
  methods: {
    fileChange(file) {
      _this.imageList = [];
      _this.$refs.uploader.files.map((file, index) => {
        _this.imageList.push({ src: file.__img.src, id: index });
      });
      console.log(_this.imageList);
    },
    filterMethod() {
      if (this.tagSelected == "all images") return this.imageList;
      else if (this.tagSelected == "incorrect" || this.tagSelected == "issue") {
        return this.imageList.filter(item => {
          return item.checked == this.tagSelected;
        });
      } else {
        return this.imageList.filter(item => {
          return item.tag[this.tagSelected];
        });
      }
    },
    onDragStart(e) {
      e.dataTransfer.setData("text", e.target.id + "*" + this.tagSelected);
      e.dataTransfer.dropEffect = "move";
      // console.log(this.imageList[0].tag);
    },

    onDragEnter(e) {},

    onDragLeave(e) {},

    onDragOver(e) {
      e.preventDefault();
      let q = e.target;
      for (let i = 0; i < 3; i++) {
        if (!q.id) {
          q = q.parentNode;
        }
      }
      // console.log(q);
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
      let draggedId = e.dataTransfer.getData("text").split("*")[0];
      let originTag = e.dataTransfer.getData("text").split("*")[1];
      let draggedEl = document.getElementById(draggedId);

      let q = e.target;
      for (let i = 0; i < 3; i++) {
        if (!q.id) {
          q = q.parentNode;
        }
      }

      let targetTagId = q.id;
      // check if original parent node
      // if (draggedEl.parentNode === e.target) {
      //   e.target.classList.remove("drag-enter");
      //   return;
      // }
      // make the change
      this.imageList.some(img => {
        if (img.id == draggedId && targetTagId) {
          if (["all images", "incorrect", "issue"].indexOf(originTag) == -1) {
            img.tag[originTag] = 0;
          }
          img.tag[targetTagId] = 1;
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
          if (item.tag[ctag] > 0) {
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
            Object.keys(item).includes("checked") && item.checked === "correct"
        );
      } else {
        data = this.imageList.filter(
          item => Object.keys(item.tag).includes(tag) && item.tag[tag] > 0
        );
        trueData = this.imageList.filter(
          item =>
            Object.keys(item).includes("checked") &&
            item.checked === "correct" &&
            Object.keys(item.tag).includes(tag) &&
            item.tag[tag] > 0
        );
      }
      return ((trueData.length / data.length) * 100).toFixed(2) + "%";
    },

    handleMore(img) {
      this.selected = img;
      this.showDialog = true;
    },

    handleAddTag() {
      const text = this.addTag.trim();
      if (text !== "") {
        const data = this.Tags.filter(item => item.value === text);
        //add non-exist tag
        if (data.length === 0) {
          this.Tags.push({ title: text });
        }
        //add new pic's tag
        this.$set(this.selected.tag, text, 1.0);
        this.$set(this.selected, "checked", "correct");
        // this.selected.checked = "correct";
        this.addTag = "";
      }
    },

    handleDeleteTag(tag) {
      this.$set(this.selected.tag, tag, 0);
      //this.selected.tag[tag] = 0;
      let sum = 0;
      for (let key in this.selected.tag) {
        sum += this.selected.tag[key];
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
          this.filterOptions = this.Tags.slice(3).map(item => item.value);
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
      // let text = "prediction_id,image_md5,image_type,labels\n";
      // for (const i of this.imageList) {
      //   if (i.checked === "incorrect" || i.checked === "issue") {
      //     text =
      //       text +
      //       i.id +
      //       "," +
      //       md5(i.src) +
      //       "," +
      //       i.type +
      //       "," +
      //       JSON.stringify(Object.keys(i.tag)) +
      //       "\n";
      //   }
      // }
      // var blob = new Blob([text], { type: "application/vnd.ms-excel" });
      // FileSaver.saveAs(blob, "model_result.csv");
      // console.log(this.imageList);
      for (let i = 0, len = this.imageList.length; i < len; i++) {
        let item = this.imageList[i];
        item.path = item.src.split("image/")[1];
        let tags = [];
        Object.keys(item.tag).filter(key => {
          if (item.tag[key] > 0) {
            tags.push({ name: key, region: item.tag[key] });
          }
        });
        let query = window.btoa(
          JSON.stringify({ find: { "info.path": item.path } })
        );
        let res = await axios({
          method: "GET",
          url: "http://127.0.0.1:10050/api/images?query=" + query
        });
        if (res.data.total == 0) {
          upload("images", [item.path, tags]).then(res => {
            this.$q.notify({
              message: "Export images successfully",
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
      let incorrect = [];
      this.imageList.some((item, index) => {
        if (item.checked == "incorrect") {
          incorrect.push({
            path: item.path,
            tags: item.tag
          });
        }
      });
      upload("tags", [this.version, this.photos, incorrect]).then(res => {
        this.$q.notify({
          message: "Export tags successfully",
          position: "top",
          color: "primary",
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
};
</script>

<style lang="scss">
.drag-enter {
  background-color: $green-2;
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
