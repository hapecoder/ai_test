<template>
  <q-page>
    <div class="q-pa-md row q-col-gutter-xl">
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
                    </q-table>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </template>
        </q-splitter>
      </div>
    </div>
  </q-page>
</template>

<script>
let _this;
const FileSaver = require("file-saver");
import { loadImage, upload } from "../utils/request";
import axios from "axios";
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
          label: "total",
          field: "total",
          align: "left",
          sortable: true
        },
        {
          name: "correct",
          label: "correct",
          field: "correct",
          sortable: true
        },
        {
          name: "radio",
          label: "radio",
          field: "radio",
          sortable: true,
          sort: (a, b) => parseInt(a, 10) - parseInt(b, 10)
        }
      ],
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
          name: "expect tag",
          label: "expect tag",
          field: "expect tag",
          align: "left",
          sortable: true
        },
        {
          name: "detected tag",
          label: "detected tag",
          field: "detected tag",
          sortable: true
        }
      ],
      data: [],
      ticked: [],
      selected: [],
      filter: "",
      splitterModel: 40,
      report: false,
      tagFilter: "",
      imgFilter: "",
      pagination: {
        rowsPerPage: 0
      },
      imageList: [],
      Tags: []
    };
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
      this.$q.loading.show({
        message:
          'Getting data from server.<br/><span class="text-primary">Hang on...</span>'
      });


      for (let i = 0, len = files.length; i < len; i++) {
        let tag = files[i];
        let pathList = [];
        let correctNum = 0;
        let value = tag[1];
        if (value == "Skycraper") value = "Skyscraper";
        if (value == "Motobike") value = "Motorbike";
        if (value == "volleyball") value = "volleyball sport";
        _this.Tags.push({ title: value });
        let imgName = await loadImage(tag[0] + "/" + tag[1]);

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

        //await load
        let imgPredict = await upload("predict", pathList);
        imgPredict.map((t, index3) => {
          let checked = Object.keys(t).indexOf(value.toLowerCase()) > -1;
          if (checked) {
            correctNum += 1;
          }

          this.imageList.push({
            name: pathList[index3].split("/image/")[1],
            "expect tag": value,
            "detected tag": Object.keys(t).join(", ")
          });
        });

        this.data.push({
          name: tag[1],
          total: imgPredict.length,
          correct: correctNum,
          radio: ((correctNum / imgPredict.length) * 100).toFixed(2) + "%"
        });
      }
    }
    this.$q.loading.hide();
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
    totalData() {
      if (this.data[0]) {
        let total = this.data
          .map(t => t.total)
          .reduce((sum, num) => {
            return sum + num;
          });
        let correct = this.data
          .map(t => t.correct)
          .reduce((sum, num) => {
            return sum + num;
          });
        return [
          {
            total: total,
            correct: correct,
            radio: ((correct / total) * 100).toFixed(2) + "%"
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
    handleExport() {
      let text =
        "Model Version," +
        this.version +
        "\n" +
        "Tested photos," +
        this.photos +
        "\n";
      text += "\ntotal,correct,radio\n";
      for (let i of this.totalData) {
        text = text + i.total + "," + i.correct + "," + i.radio + "," + "\n";
      }
      text += "\ntag,total,correct,radio\n";
      for (let i of this.data) {
        text =
          text +
          i.name +
          "," +
          i.total +
          "," +
          i.correct +
          "," +
          i.radio +
          "," +
          "\n";
      }
      text += "\nfile,expect tag,detected tag\n";
      for (let i of this.imageList) {
        text =
          text +
          i.name +
          "," +
          i["expect tag"] +
          "," +
          i["detected tag"] +
          "\n";
      }
      var blob = new Blob([text], { type: "application/vnd.ms-excel" });
      FileSaver.saveAs(blob, "model_result.csv");
    }
  }
};
</script>
