<template>
  <q-layout view="hHh Lpr lff">
    <q-header elevated>
      <q-toolbar style="background-color: #fff">
        <img src="../assets/logo.png" alt="" style="margin:30px 35px" />
        <q-space />
        <q-btn
          class="q-mx-lg"
          unelevated
          rounded
          no-caps
          icon="reply"
          label="Home"
          to="/"
          size="14px"
          style="background:linear-gradient(to right, #916BFF, #3366FF); height:40px; width:120px;"
        />
        <q-btn
          class="q-mx-lg"
          unelevated
          rounded
          no-caps
          align="right"
          @click="throttle(handleExport, 2000)"
          style="background:linear-gradient(to right, #916BFF, #3366FF);height:40px; width:120px;"
          ><q-icon
            name="reply"
            style="margin-right:12px;transform: rotateY(180deg);"
          ></q-icon>
          Export</q-btn
        >
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: "MainLayout",

  data() {
    return {
      timer: null
    };
  },
  methods: {
    handleExport() {
      if (this.$route.path == "/local") {
        this.$root.$emit("exportFile");
      } else {
        this.$root.$emit("exportAuto");
      }
    },
    throttle(fn, wait) {
      let _this = this;
      if (!_this.timer) {
        fn();
        _this.timer = setTimeout(function() {
          _this.timer = null;
        }, wait);
      }
    }
  }
};
</script>
