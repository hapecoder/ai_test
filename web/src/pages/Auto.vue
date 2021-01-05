<template>
  <q-page>
    <div v-if="loading" class="row justify-center">
      <div style="margin-top:35vh;width:40vw">
        <q-linear-progress :value="progress" size="30px">
          <div class="absolute-full flex flex-center">
            <q-badge color="white" text-color="green" :label="progressLabel" />
          </div>
        </q-linear-progress>
        <div class="text-center text-h6 text-grey q-mt-xl">
          Auto test running...
        </div>
      </div>
    </div>
    <div
      v-else
      class="q-pa-md row q-col-gutter-xl"
      style="text-transform:capitalize"
    >
      <div class="col-12">
        <q-splitter v-model="splitterModel">
          <template v-slot:before>
            <q-card>
              <q-card-section class="text-h6 q-py-xs">
                <span class="text-h4 q-ma-xs q-ml-md">Summary</span>
                <div class="text-body1 q-ma-xs q-ml-md">
                  Model Version:{{ version }}
                </div>
                <div class="text-body1 q-ma-xs q-ml-md">
                  Tested Photos:{{ photos }}
                </div>
                <div class="q-pa-md">
                  <q-table
                    :data="totalData"
                    :columns="columns.slice(1)"
                    row-key="name"
                    hide-bottom
                  >
                    <template v-slot:top>
                      Total accuracy
                    </template>
                  </q-table>
                </div>
                <div class="q-pa-md">
                  <q-table
                    style="height: 50vh;min-width:500px"
                    title="Report"
                    :data="data"
                    :columns="columns"
                    row-key="name"
                    virtual-scroll
                    :pagination.sync="pagination"
                    :rows-per-page-options="[0]"
                    :filter="tagFilter"
                  >
                    <template v-slot:top="props">
                      Tag accuracy
                      <q-space />
                      <q-input
                        borderless
                        dense
                        debounce="300"
                        color="primary"
                        v-model="tagFilter"
                        placeholder="search"
                      >
                        <template v-slot:append>
                          <q-icon name="search" />
                        </template>
                      </q-input>
                    </template>
                  </q-table>
                </div>
              </q-card-section>
            </q-card>
          </template>
          <template v-slot:after>
            <div class="row q-col-gutter-xs">
              <q-card class="col-12 text-h6">
                <q-card-section>
                  <div class="q-pa-md">
                    <q-table
                      style="height: 78vh;min-width:500px"
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
                        <q-td :props="props">
                          {{ props.row.name }}
                          <q-tooltip >
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
                            v-for="items in props.row.mainTag"
                            :key="items.tag"
                          >
                            {{ items.tag }}
                            <q-tooltip>
                              {{ items.score }}
                            </q-tooltip>
                          </q-badge>
                        </q-td>
                      </template>

                      <template v-slot:body-cell-subTag="props">
                        <q-td :props="props" @click="showMore(props.row)">
                          <q-badge
                            outline
                            v-for="items in props.row.subTag.slice(0, 4)"
                            :key="items.tag"
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
          </template>
        </q-splitter>
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
      columns: [
        {
          name: "name",
          required: true,
          label: "Tag",
          align: "left",
          field: row => row.name,
          format: val => `${val}`,
          sortable: true
        },
        {
          name: "total",
          label: "Total",
          field: "total",
          align: "left",
          sortable: true
        },
        {
          name: "correct",
          label: "Correct",
          field: "correct",
          sortable: true
        },
        {
          name: "ratio",
          label: "Ratio",
          field: "ratio",
          sortable: true,
          sort: (a, b) => parseInt(a, 10) - parseInt(b, 10)
        }
      ],
      imgColumns: [
        {
          name: "name",
          required: true,
          label: "File",
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
      data: [],
      ticked: [],
      selected: [],
      filter: "",
      splitterModel: 35,
      report: false,
      tagFilter: "",
      dialogFilter: "",
      imgFilter: "",
      imgUrl: imgUrl,
      pagination: {
        rowsPerPage: 0
      },
      imageList: [],
      Tags: [],
      loading: false,
      progress: 0,
      useModel: true,
      showDialog: false,
      dbLoading: true
    };
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
      this.loading = true;
      let doneNum = 0;
      for (let i = 0, len = files.length; i < len; i++) {
        const tag = files[i];
        const pathList = [];

        let value = tag[1];
        // make tags match with filename
        if (value == "Businesscard") value = "Business_card";
        if (value == "Cloudy") value = "cloud";
        if (value == "People") value = "person";
        if (value == "Skycraper") value = "Skyscraper";
        if (value == "Sports car") value = "car";
        if (value == "volleyball") value = "volleyball sport";
        value = value.replace(" ", "_");
        _this.Tags.push({ title: value });
        const imgName = await loadImage(tag[0] + "/" + tag[1]);

        imgName.map(item => {
          if (
            item.name.match(/jpe?g/i) &&
            escape(item.name).indexOf("%u") < 0
          ) {
            pathList.push(imgUrl + tag[0] + "/" + tag[1] + "/" + item.name);
          }
        });
        let query = window.btoa(
          JSON.stringify({ find: { "info.path": pathList } })
        );
        // async load
        if (this.dbLoading) {
          upload("query", query)
            .then(res => {
              _this.resHandle(
                res.data.data[0].info.res,
                value,
                pathList,
                tag,
                doneNum,
                len
              );
              doneNum += 1;
              if (doneNum == len) setTimeout(() => (this.loading = false), 500);
            })
            .catch(e => (doneNum += 1));
        } else {
          upload("predict", pathList)
            .then(imgPredict => {
              _this.resHandle(imgPredict, value, pathList, tag, doneNum, len);
              doneNum += 1;
              if (doneNum == len) setTimeout(() => (this.loading = false), 500);
            })
            .catch(e => (doneNum += 1));
        }
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
    },
    totalData() {
      if (this.data[0]) {
        const total = this.data
          .map(t => t.total)
          .reduce((sum, num) => {
            return sum + num;
          });
        const correct = this.data
          .map(t => t.correct)
          .reduce((sum, num) => {
            return sum + num;
          });
        return [
          {
            total: total,
            correct: correct,
            ratio: ((correct / total) * 100).toFixed(2) + "%"
          }
        ];
      }
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
    resHandle(imgPredict, value, pathList, tag, doneNum, len) {
      let correctNum = 0;
      imgPredict.map((filterTag, index3) => {
        let childTags = [],
          parentTags = [];
        filterTag.forEach(e => {
          childTags = childTags.concat(e.children);
        });

        filterTag.forEach(e => {
          if (e.score > 0.4) {
            parentTags = parentTags.concat([{ tag: e.tag, score: e.score }]);
          }
        });
        childTags.sort((a, b) => {
          return b.score - a.score;
        });
        const checked =
          childTags.map(e => e.tag).includes(value.toLowerCase()) ||
          parentTags.map(e => e.tag).includes(value.toLowerCase());
        if (checked) {
          correctNum += 1;
        }

        this.imageList.push({
          name: pathList[index3].split("/image/")[1],
          expectTag: value.toLowerCase(),
          mainTag: parentTags,
          subTag: childTags,
          checked: checked,
          filterTag: filterTag
        });
      });
      this.data.push({
        name: tag[1],
        total: imgPredict.length,
        correct: correctNum,
        ratio: ((correctNum / imgPredict.length) * 100).toFixed(2) + "%"
      });

      this.progress = (doneNum + 1) / len;
    },
    showMore(e) {
      this.showDialog = true;
      this.tagTree = e.filterTag.sort((a, b) => {
        return b.score - a.score;
      });
      console.log(e);
    },
    getScoreColor(node) {
      if (node.score > 0.7 && node.children) return "text-orange";
      else if (node.score > 0.5 && node.children) return "text-red";
      else if (node.score > 0.8) return "text-green";
      else return "text-grey";
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
      /** * Excel  accepts \n and \r in strings, but some other CSV parsers do not
       * Uncomment the next two lines to escape new lines */
      // .split('\n').join('\\n')
      // .split('\r').join('\\r')

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
      if (this.totalData && this.progress > 0.99) {
        const text =
          "Model Version," +
          this.version +
          "\r\n" +
          "Tested photos," +
          this.photos +
          "\r\n\r\n";
        const content =
          text +
          this.tableToCsv(this.columns.slice(1), this.totalData) +
          "\r\n\r\n" +
          this.tableToCsv(this.columns, this.data) +
          "\r\n\r\n" +
          this.tableToCsv(this.imgColumns, this.imageList);

        const status = exportFile("table-export.csv", content, "text/csv");
        if (status !== true) {
          this.$q.notify({
            message: "Browser denied file download...",
            color: "negative",
            icon: "warning"
          });
        }

        const incorrect = [];
        this.imageList.some((item, index) => {
          if (!item.checked) {
            incorrect.push({ path: item.name, tags: item.filterTag });
          }
        });
        upload("tags", [this.version, this.photos, incorrect]).then(res => {
          this.$q.notify({
            message: "Upload tags successfully",
            position: "top",
            color: "primary",
            actions: [{ label: "OK", color: "white" }]
          });
        });
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
