<template>
  <div class="q-pa-md">
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
            <q-card-actions class="text-body1">
              <q-scroll-area style="height:50vh;min-width:500px">
                <q-tree
                  ref="tree"
                  style="min-width:100px"
                  :nodes="files"
                  node-key="key"
                  label-key="label"
                  tick-strategy="leaf-filtered"
                  :ticked.sync="ticked"
                  :selected.sync="selected"
                  selected-color="primary"
                />
              </q-scroll-area>
            </q-card-actions>
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
import { Notify } from "quasar";
import { loadImage } from "../utils/request";
export default {
  name: "PageIndex",
  data() {
    return {
      logoImg: require("../assets/logo.png"),
      model: "version : 1",
      models: [{ label: "version : 1" }],
      type: "Auto Test",
      types: [{ label: "Manual", disable: true }, { label: "Auto Test" }],
      loading: false,
      imageList: [],
      showDialog: false,
      files: [],
      filesIndex: 0,
      ticked: [],
      selected: []
    };
  },

  mounted() {
    //get files
    let _this = this;
    loadImage().then(res => {
      res.some((file, index1) => {
        _this.files.push({
          label: file.name,
          // lazy: true,
          children: [],
          key: file.name
        });

        if (!file.name.match(/jpe?g/i)) {
          loadImage("/" + file.name).then(res => {
            res.some((item, index2) => {
              _this.files[index1].children.push({
                label: item.name,
                key: file.name + "/" + item.name
              });

              return index2 == 200;
            });
          });
        }
      });
    });
  },

  methods: {
    async handleChange() {
      this.loading = true;
      this.text = this.$refs.inputFolder.value;
      console.log(this.$refs.inputFolder.files);
      const files = this.$refs.inputFolder.files;
      for (const i of files) {
        if (
          i.type === "image/png" ||
          i.type === "image/jpeg" ||
          i.type === "image/gif"
        ) {
          const imgData = await this.getImgToBase64(i);
          this.imageList.push(imgData);
        }
      }
      this.loading = false;
    },
    // handleRun() {
    //   if (this.imageList.length === 0) {
    //     this.showMsg = true;
    //     this.$q.notify({
    //       message: "There is no image chosen."
    //     });
    //   } else {
    //     localStorage.removeItem("files");
    //     this.$store.commit("main/CHANGE_CONFIG", {
    //       model: this.model,
    //       type: this.type,
    //       imgFiles: this.imageList
    //     });
    //     this.$router.push("/local");
    //   }
    // },

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
          message: "There is no file chosen."
        });
      } else if (this.ticked.join().indexOf("JPG") > 0) {
        this.$q.notify({
          message: "Please choose image-file instead of single image."
        });
      } else {
        // localStorage.removeItem("files");
        this.$store.commit("main/CHANGE_CONFIG", {
          model: this.model,
          type: this.type,
          imgFiles: this.ticked
        });
        this.$router.push("/local");
      }
    }
    // onLazyLoad({ node, key, done, fail }) {
    //   let temp = [];
    //   if (this.files.map(f => f.label).indexOf(key) > -1) {
    //     node.lazy = false;
    //     loadImage("/" + key).then(res => {
    //       res.some((item, index) => {
    //         temp.push({ label: item.name, key: key + "/" + item.name });
    //         return index == 100;
    //       });
    //       done(temp);
    //     });
    //   }
    //   else {
    //     loadImage("/" + node.label).then(res => {
    //       res.some((item, index) => {
    //         temp.push({ label: item.name });
    //         return index == 100;
    //       });
    //       done(temp);
    //     });
    //   }
    // }
  }
};
</script>

<style scoped>
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
</style>
