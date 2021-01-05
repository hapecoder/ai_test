<template>
  <q-page>
    <div
      class="q-pa-md row q-col-gutter-xl justify-center"
      style="text-transform:capitalize"
    >
      <div class="col-10">
        <div class="row q-col-gutter-xs">
          <q-card class="col-12 text-h6">
            <q-card-section>
              <div class="q-pa-md">
                <q-table
                  class="table"
                  style="height: 80vh;min-width:500px"
                  title="Report"
                  :data="imageList"
                  :columns="imgColumns"
                  row-key="name"
                  virtual-scroll
                  :pagination.sync="pagination"
                  :rows-per-page-options="[0]"
                  :filter="imgFilter"
                >
                  <template v-slot:top="props">
                    Detail test result
                    <q-space />
                    <q-btn
                      no-caps
                      label="Filter Setting"
                      class="q-mr-xl q-mt-xs"
                      color="blue-3"
                      @click="filterDialog = !filterDialog"
                    />
                    <q-input
                      borderless
                      dense
                      debounce="300"
                      color="primary"
                      v-model="imgFilter"
                      placeholder="search"
                    >
                      <template v-slot:append>
                        <q-icon name="search" />
                      </template>
                    </q-input>
                  </template>
                  <template v-slot:body-cell-name="props">
                    <q-td :props="props" @click="showMore(props.row)">
                      {{ props.row.name }}
                      <q-tooltip>
                        click to show more
                      </q-tooltip>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-expectTag="props">
                    <q-td :props="props">
                      {{ props.row.expectTag }}
                      <q-tooltip>
                        <q-img
                          :src="imgUrl + props.row.name"
                          style="width:150px;margin:-5px -9px"
                        ></q-img>
                      </q-tooltip>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-mainTag="props">
                    <q-td :props="props">
                      <q-badge
                        outline
                        class="text-primary q-ml-xs"
                        v-for="items in parentTagFilter(props.row.filterTag)"
                        :key="items.tag"
                        @click="
                          deleteTag(props.row.filterTag, 'mainTag', items.tag)
                        "
                      >
                        {{ items.tag }}
                        <q-tooltip>
                          {{ items.score }}
                        </q-tooltip>
                      </q-badge>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-subTag="props">
                    <q-td :props="props">
                      <q-badge
                        outline
                        v-for="items in childTagFilter(props.row.filterTag)"
                        :key="items.tag"
                        @click="
                          deleteTag(props.row.filterTag, 'subTag', items.tag)
                        "
                        :class="
                          items.tag !== props.row.expectTag
                            ? 'text-black q-ml-xs'
                            : 'text-green q-ml-xs'
                        "
                      >
                        {{ items.tag }}
                        <q-tooltip>
                          {{ items.score }}
                        </q-tooltip>
                      </q-badge>
                    </q-td>
                  </template>
                </q-table>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
    <q-dialog v-model="showDialog">
      <q-scroll-area
        style="height:55vh;min-width:25vw"
        class="q-pl-md bg-white "
      >
        <q-input
          borderless
          dense
          class="q-pl-md"
          debounce="300"
          color="primary"
          v-model="dialogFilter"
          placeholder="search here..."
        />
        <q-tree
          :nodes="tagTree"
          node-key="tag"
          default-expand-all
          :filter="dialogFilter"
          :filter-method="treeFilterMethod"
        >
          <template v-slot:default-header="prop">
            <div class="row items-center">
              <span
                :class="
                  prop.node.children
                    ? 'text-weight-bold text-primary'
                    : 'text-black'
                "
              >
                {{ prop.node.tag + "&nbsp&nbsp" }}
              </span>
              <span :class="getScoreColor(prop.node)">{{
                prop.node.score
              }}</span>
            </div>
          </template>
        </q-tree>
      </q-scroll-area>
    </q-dialog>
    <q-dialog v-model="filterDialog">
      <q-card style="width:600px" class="q-pa-lg">
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
            class="q-mr-md q-pa-sm"
            v-close-popup
            dense
            @click="onSaveFilter"
            >OK</q-btn
          >
          <!-- <q-btn color="primary" no-caps class="q-px-sm" v-close-popup
            >Cancel</q-btn
          > -->
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
let _this;
// const FileSaver = require('file-saver')
import { imgUrl, loadImage, upload } from "../utils/request";
import axios from "axios";
import { exportFile } from "quasar";

export default {
  name: "PageIndex",
  data() {
    return {
      imgColumns: [
        {
          name: "name",
          required: true,
          label: "file",
          align: "left",
          field: row => row.name,
          format: val => `${val}`,
          sortable: true
        },
        {
          name: "expectTag",
          label: "Expect Tag",
          field: "expectTag",
          align: "left",
          sortable: true
        },
        {
          name: "mainTag",
          label: "Parent Tag",
          field: "mainTag",
          sortable: true
        },
        {
          name: "subTag",
          label: "Detail Tag",
          field: "subTag",
          sortable: true
        }
      ],
      tagTree: [],
      dialogFilter: "",
      imgFilter: "",
      pagination: {
        rowsPerPage: 0
      },
      imgUrl: imgUrl,
      imageList: [],
      showDialog: false,
      filterDialog: false,
      parentDataFilter: Number(localStorage.getItem("pdf-num") || 0.4),
      childDataFilter: Number(localStorage.getItem("cdf-num") || 0.8)
    };
  },
  async created() {

    _this = this;
    const file = JSON.parse(localStorage.getItem("files"));
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
      for (let i = 0, len = files.length; i < len; i++) {
        const tag = files[i];
        let value = tag[1];
        // make tags match with filename
        if (value == "Businesscard") value = "Business_card";
        if (value == "Cloudy") value = "cloud";
        if (value == "People") value = "person";
        if (value == "Skycraper") value = "Skyscraper";
        if (value == "Sports car") value = "car";
        if (value == "volleyball") value = "volleyball sport";
        value = value.replace(" ", "_");

        const imgName = await loadImage(tag[0] + "/" + tag[1]);
        imgName.map(item => {
          if (
            item.name.match(/jpe?g/i) &&
            escape(item.name).indexOf("%u") < 0
          ) {
            let query = window.btoa(
              JSON.stringify({
                find: { "info.path": tag[0] + "/" + tag[1] + "/" + item.name }
              })
            );
            upload("query", query).then(res => {
              let filterTag = res.data.data[0].info.tags;
              let childTags = [],
                parentTags = [];
              filterTag.forEach(e => {
                if (e.score > this.parentDataFilter) {
                  parentTags = parentTags.concat([
                    { tag: e.tag, score: e.score }
                  ]);
                }
              });
              filterTag.forEach(e => {
                if (parentTags.find(p => p.tag == e.tag)) {
                  childTags = childTags.concat(
                    e.children.filter(c => c.score > this.childDataFilter)
                  );
                }
              });
              childTags.sort((a, b) => {
                return b.score - a.score;
              });
              this.imageList.push({
                name: tag[0] + "/" + tag[1] + "/" + item.name,
                expectTag: value.toLowerCase(),
                mainTag: parentTags,
                subTag: childTags,
                filterTag: filterTag
              });
            });
          }
        });
      }
    }
  },
  computed: {
    version() {
      return localStorage.getItem("model").split(":")[1];
    },
    photos() {
      return Array.from(
        new Set(
          JSON.parse(localStorage.getItem("files")).map(
            item => item.split("/")[0]
          )
        )
      );
    },
    progressLabel() {
      return (this.progress * 100).toFixed(2) + "%";
    }
  },
  mounted() {
    this.$root.$on("exportAuto", () => {
      this.handleExport();
    });
  },
  beforeDestroy() {
    this.$root.$off("exportAuto");
  },
  methods: {
    showMore(e) {
      this.showDialog = true;
      this.tagTree = e.filterTag.sort((a, b) => {
        return b.score - a.score;
      });
      console.log(e);
    },
    parentTagFilter(filterTag) {
      let parentTags = [];
      filterTag.forEach(e => {
        if (e.score > this.parentDataFilter) {
          parentTags = parentTags.concat([{ tag: e.tag, score: e.score }]);
        }
      });
      return parentTags;
    },
    childTagFilter(filterTag) {
      let childTags = [];
      filterTag.forEach(e => {
        if (this.parentTagFilter(filterTag).find(p => p.tag == e.tag)) {
          childTags = childTags.concat(
            e.children.filter(c => c.score > this.childDataFilter)
          );
        }
      });
      return childTags;
    },
    onSaveFilter() {
      localStorage.setItem("cdf-num", this.childDataFilter);
      localStorage.setItem("pdf-num", this.parentDataFilter);
      this.filterDialog = false;
    },
    getScoreColor(node) {
      if (node.score > 0.7 && node.children) return "text-orange";
      else if (node.score > 0.5 && node.children) return "text-red";
      else if (node.score > 0.8) return "text-green";
      else return "text-grey";
    },
    deleteTag(filterTag, type, tag) {
      if (type == "mainTag") {
        //filterTag = filterTag.filter(e => e.tag != tag);
        this.$delete(
          filterTag,
          filterTag.findIndex(e => e.tag == tag)
        );
      } else {
        filterTag.forEach(e => {
          e.children = e.children.filter(c => c.tag != tag);
        });
      }
    },
    treeFilterMethod(node, filter) {
      const filt = filter.toLowerCase();
      return node.tag && node.tag.toLowerCase().indexOf(filt) > -1;
    },
    wrapCsvValue(val, formatFn) {
      let formatted = formatFn !== void 0 ? formatFn(val) : val;
      formatted =
        formatted === void 0 || formatted === null ? "" : String(formatted);
      formatted = formatted.split('"').join('""');
      return `"${formatted}"`;
    },
    tableToCsv(cols, data) {
      // naive encoding to csv format
      const content = [cols.map(col => this.wrapCsvValue(col.label))]
        .concat(
          data.map(row =>
            cols
              .map(col => {
                return this.wrapCsvValue(
                  typeof col.field === "function"
                    ? col.field(row)
                    : typeof row[col.field] === "object"
                    ? row[col.field].map(e => e.tag)
                    : row[col.field],
                  col.format
                );
              })
              .join(",")
          )
        )
        .join("\r\n");
      return content;
    },
    handleExport() {
      if (this.imageList.length > 0) {
        const content = this.tableToCsv(this.imgColumns, this.imageList);
        const status = exportFile("tag-result.csv", content, "text/csv");
        if (status !== true) {
          this.$q.notify({
            message: "Browser denied file download...",
            color: "negative",
            icon: "warning"
          });
        }
      } else {
        this.$q.notify({
          message: "There is no data to export."
        });
      }
    }
  }
};
</script>
<style lang="scss">
tr:nth-child(even) {
  background: #f8f6f6;
}
</style>
