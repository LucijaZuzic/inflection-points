<script>
import { TwitterAuthProvider, getAuth, onAuthStateChanged } from "firebase/auth";
import {
  usersRef
} from "../../firebase_main.js";
import NoDataToDisplay from "./NoDataToDisplay.vue";
import LoadingBar from "./LoadingBar.vue";
import MyCounter from "./MyCounter.vue";
export default {
  components: {
    NoDataToDisplay,
    LoadingBar,
    MyCounter,
  },
  mounted() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        this.user = user;
        // ...
      } else {
        // User is signed out
        // ...
      }
      return true;
    });
  },
  data() {
    return {
      user: null,
      fully_loaded: false,
      friends: [],
      status: [],
      selectedItemsEmitted: [],
      new_item: "",
      new_item_tag: "",
      filterBy: "",
      new_item_exact: false,
      filter: "",
      useCustomFilteringFn: false,
      filters: [],
      filtered: [],
      columns: [],
      sortBy: "score",
      sortingOrder: "asc",
      perPage: 1,
      currentPage: 1,
      columns: [
        { key: "user_display_name", sortable: true, classes: "data_table_overflow" },
        { key: "user_email", sortable: true, classes: "data_table_overflow" },
        { key: "user_id", sortable: false, classes: "data_table_overflow" },
      ],
      sortingOrderOptions: [
        { text: "Uzlazno", value: "asc" },
        { text: "Silazno", value: "desc" },
        { text: "Bez sortiranja", value: null },
      ],
    };
  },
  methods: {
    filterExact(source) {
      if (this.filter === "") {
        return true;
      }
      return source?.toString?.() === this.filter;
    },
    fetch_users() {
      this.fully_loaded = false;
      this.friends = [];
      this.status = [];
      let me = this;
      usersRef.get().then(function (snapshotUser) {
        snapshotUser.forEach(function (childSnapshotUser) {
          let user_display_name = childSnapshotUser.get("displayName");
          let user_email = childSnapshotUser.get("email");
          let user_id = childSnapshotUser.id;
          if (!me.user) {
            me.friends.push({
              user_display_name: user_display_name,
              user_email: user_email,
              user_id: user_id,
            });
            me.status.push({
              user_id: user_id,
              status: "not_logged_in",
            });
          } else {
            if (!(me.user && me.user.uid == user_id)) {
              me.friends.push({
                user_display_name: user_display_name,
                user_email: user_email,
                user_id: user_id,
              });
              me.status.push({ user_id: user_id, status: "friends" });
            } else {
              me.friends.push({
                user_display_name: user_display_name,
                user_email: user_email,
                user_id: user_id,
              });
              me.status.push({ user_id: user_id, status: "me" });
            }
          }
        });
      }).then(() => {
        this.filtered = this.friends;
        this.perPage = 1;
        this.fully_loaded = true;
      });
    },
    getStatus(user_id) {
      for (let i = 0; i < this.status.length; i++) {
        if (this.status[i]["user_id"] == user_id) {
          return this.status[i]["status"];
        }
      }
      return false;
    },
    sortByOptions() {
      return this.columns.map(({ key }) => key);
    },
  },
  created() {
    this.fetch_users();
  },
  computed: {
    customFilteringFn() {
      return this.useCustomFilteringFn ? this.filterExact : undefined;
    },
    pages() {
      return this.perPage && this.perPage !== 0
        ? Math.ceil(this.filtered.length / this.perPage)
        : this.filtered.length;
    },
  },
  watch: {
    perPage: function () {
      this.currentPage = 1; 
    }
  }
};
</script>

<template>
  <body class="my_body">
    <h4 class="display-4">
      <va-icon size="large" name="person_search"></va-icon>
      &nbsp; Find users
    </h4>
    <LoadingBar v-if="!fully_loaded"></LoadingBar>
    <span v-else>
      <span v-if="friends.length > 0">
        <br />
        <div>
          <va-input style="display: inline-block" placeholder="Search term" v-model="filter" />
          &nbsp;
          <va-checkbox style="display: inline-block" label="Match whole word" v-model="useCustomFilteringFn" />
        </div>
        <br />
        <div>
          <div style="display: inline-block">
            <MyCounter :key="'perPage_' + perPage" :min_value="1" :max_value="Math.min(Math.ceil(this.filtered.length), 10)" v-bind:value="perPage"
              @input="(n) => (perPage = n)" :is_page_size="true" :some_text="'Per page'">
            </MyCounter>
          </div>
          <div style="display: inline-block; margin-left: 10px">
            <MyCounter :key="'currentPage_' + currentPage" :min_value="1" :max_value="Math.ceil(this.filtered.length / perPage)" v-bind:value="currentPage"
              @input="(n) => (currentPage = n)" :is_page_number="true" :some_text="'Page'">
            </MyCounter>
          </div>
        </div>
        <br />
        <va-data-table :items="friends" :filter="filter" :columns="columns" :hoverable="true" :per-page="perPage"
          :current-page="currentPage" v-model:sort-by="sortBy" v-model:sorting-order="sortingOrder"
          @filtered="filtered = $event.items" no-data-filtered-html="No results"
          no-data-html="No data" :filter-method="customFilteringFn">
          <template #header(user_display_name)>User (name)</template>
          <template #header(user_email)>User (e-mail)</template>
          <template #header(user_id)></template>
          <template #cell(user_email)="{ source: user_email }">
            <router-link v-bind:to="{ name: 'profile', params: { email: user_email } }">
              <va-button outline :rounded="false" style="border: none"><va-icon name="email"></va-icon> &nbsp;
                {{ user_email }}</va-button>
            </router-link>
          </template>
          <template #cell(user_id)="{ source: user_id }">
          </template>
        </va-data-table>
      </span>
      <NoDataToDisplay v-if="friends.length <= 0" customMessage="No users">
      </NoDataToDisplay>
    </span>
  </body>
</template>

<style scoped></style>
