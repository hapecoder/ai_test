<template>
  <div class="q-pa-md" style="text-transform:capitalize">
    <div>
      <q-spinner
        color="primary"
        size="3em"
        :thickness="10"
        v-show="loading"
        class="loading"
      />
    </div>

    <div class="row justify-center">
      <img :src="logoImg" alt="" style="margin:100px 0 120px 0" />
    </div>

    <div class="row justify-center" style="height: 360px">
      <div class="col-5" style="width: 490px">
        <span class="main-options">model</span>
        <q-select
          outlined
          v-model="model"
          :options="models"
          style="margin: 6px 0 27px 0;"
        />
        <span class="main-options">type</span>
        <q-select
          outlined
          v-model="type"
          :options="types"
          style="margin: 6px 0 27px 0;"
        />
        <span class="main-options">file</span>
        <div class="row" style="margin: 6px 0 27px 0;">
          <q-input
            outlined
            v-model="ticked"
            placeholder="Select..."
            style="width: 400px;"
            disable
          />
          <q-btn
            style="width: 80px; margin-left:10px;"
            label="Browse..."
            no-caps
            @click="showDialog = true"
          ></q-btn>
        </div>
        <q-dialog v-model="showDialog">
          <q-card>
            <q-tabs
              v-model="tab"
              dense
              class="text-grey"
              active-color="primary"
              indicator-color="primary"
              align="justify"
              narrow-indicator
            >
              <q-tab
                v-for="item in files"
                :key="item.label"
                :name="item.label"
                :label="item.label"
              />
            </q-tabs>

            <q-separator />

            <q-tab-panels v-model="tab" animated>
              <q-tab-panel
                v-for="item in files"
                :key="item.label"
                :name="item.label"
              >
                <q-table
                  style="height: 550px;min-width:500px"
                  :data="item.data"
                  :columns="item.columns"
                  row-key="name"
                  dense
                  virtual-scroll
                  :pagination.sync="pagination"
                  :rows-per-page-options="[0]"
                  separator="none"
                  selection="multiple"
                  :selected.sync="item.selected"
                  :filter="filter"
                  :virtual-scroll-sticky-size-start="48"
                  class="my-sticky-virtscroll-table"
                >
                  <template v-slot:top>
                    <q-input
                      class="full-width"
                      borderless
                      dense
                      debounce="300"
                      v-model="filter"
                      placeholder="Search"
                    >
                      <template v-slot:append>
                        <q-icon name="search" />
                      </template>
                    </q-input>
                  </template>
                </q-table>
              </q-tab-panel>
            </q-tab-panels>
            <q-card-actions align="right">
              <q-btn flat label="OK" color="primary" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>
        <!-- <div class="row" style="margin: 6px 0 27px 0;">
          <input
            type="file"
            v-show="false"
            ref="inputFolder"
            webkitdirectory
            @change="handleChange()"
          />
          <q-input
            outlined
            v-model="text"
            placeholder="Select..."
            style="width: 400px;"
          />
          <q-btn
            style="width: 80px; margin-left:10px;"
            label="Browse..."
            no-caps
            @click="$refs.inputFolder.click()"
          ></q-btn>
        </div> -->
      </div>
    </div>

    <div class="row justify-center">
      <q-btn
        rounded
        label="Run"
        class="run-btn"
        no-caps
        size="20px"
        @click="handleRun"
      />
    </div>
  </div>
</template>

<script>
import {tagUrl, loadImage } from "../utils/request";
import axios from "axios";
export default {
  name: "PageIndex",
  data() {
    return {
      logoImg: require("../assets/logo.png"),
      model: localStorage.getItem("model") || "version :2",
      models: [],
      type: localStorage.getItem("type") || "Auto Test",
      types: ["Manual", "Auto Test", "Tag Results"],
      loading: false,
      imageList: [],
      showDialog: false,
      files: [],
      filesIndex: 0,
      selected: [],
      tab: "",
      pagination: {
        rowsPerPage: 0
      },
      filter: ""
    };
  },
  computed: {
    ticked() {
      let res = [];
      let temp = this.files.map(e => {
        if (e.selected[0]) {
          res = [...res, ...e.selected.map(e => e.key)];
        }
      });
      if (res) return res;
    }
  },
  async mounted() {
    axios(tagUrl).then(res => {
      res.data.model_version_status.map(v => {
        let state = v.state == "END" ? true : false;
        this.models.push({ label: "version :" + v.version, disable: state });
        this.models.push({
          label: "version :" + v.version + " (from DB)",
          disable: state
        });
      });
    });
    //get files
    let _this = this;
    let filesName = await loadImage();
    //async function always return a promise which regard as true  (when use some)
    filesName.map(async (file, index1) => {
      if (index1 == 0) this.tab = file.name;
      if (!file.name.match(/jpe?g/i)) {
        _this.files.push({
          label: file.name,
          // lazy: true,
          data: [],
          columns: [
            {
              name: "file",
              label: file.name,
              field: "name",
              align: "left",
              sortable: true
            }
          ],
          selected: [],
          key: file.name
        });
        let tagName = await loadImage("/" + file.name);
        tagName.some((item, index2) => {
          _this.files[index1].data.push({
            name: item.name,
            key: file.name + "/" + item.name
          });
        });
      }
    });
  },

  methods: {
    getImgToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          // const arr = reader.result.split(',')
          resolve(reader.result);
        };
        reader.onerror = reject;
      });
    },

    handleRun() {
      if (this.ticked.length === 0) {
        this.$q.notify({
          message: "There is no file chosen"
        });
      } else if (this.ticked.join().indexOf("JPG") > 0) {
        this.$q.notify({
          message: "Please choose image-file instead of single image."
        });
      } else {
        // localStorage.removeItem("files");
        console.log(this.model);
        this.$store.commit("main/CHANGE_CONFIG", {
          model: this.model.label || this.model,
          type: this.type,
          imgFiles: this.ticked
        });

        if (this.type == "Manual") {
          this.$router.push("/local");
        } else if (this.type == "Tag Results") {
          this.$router.push("/tag");
        } else {
          this.$router.push("/auto");
        }
      }
    }
  }
};
</script>

<style lang="scss">
.main-options {
  font-weight: bold;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #8f9bb3;
  font-size: 14px;
}

.file-btn {
  height: 56px;
  width: 110px;
  margin-left: 10px;
  background: #fafafa;
  font-weight: normal;
}

.run-btn {
  width: 200px;
  background: #0c66ff;
  color: #fff;
}

.loading {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.my-sticky-virtscroll-table {
  height: 410px;
  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th {
    background-color: #fff;
  }
  thead tr th {
    position: sticky;
    font-size: 20px;
    z-index: 1;
  }
  /* this will be the loading indicator */
  thead tr:last-child th {
    /* height of all previous header rows */
    top: 48px;
  }
  thead tr:first-child th {
    top: 0;
  }
}
</style>
