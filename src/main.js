//import { create-App } from 'vue'
import { createApp } from "vue/dist/vue.esm-bundler.js";
import App from "./App.vue";
import { createRouter, createWebHashHistory } from "vue-router";

import NotFound from "./components/Utility/NotFound.vue";
import SignInSuccess from "./components/Utility/SignInSuccess.vue"; 
import Login from "./components/Utility/Login.vue";
  
import FriendProfile from "./components/Profile/FriendProfile.vue";
import UserSearch from "./components/Utility/UserSearch.vue";
import Rate from "./components/Utility/Rate.vue";

/*import BootstrapVue3 from "bootstrap-vue-3";

import "bootstrap/dist/css/bootstrap.css"; 
import "bootstrap-vue-3/dist/bootstrap-vue-3.css";*/

import Oruga from "@oruga-ui/oruga-next";
import "@oruga-ui/oruga-next/dist/oruga-full.css";

import { VuesticPlugin } from "vuestic-ui";
import "vuestic-ui/dist/vuestic-ui.css";
// 1. Define route components.
// These can be imported from other files

// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
const routes = [
  {
    path: "/:pathMatch(.*)*",
    name: "not_found",
    component: NotFound,
  },
  {
    path: "/",
    name: "not_entered",
    component: NotFound,
  },
  {
    path: "/sign-in-success",
    name: "sign_in_success",
    component: SignInSuccess,
  },
  {
    path: "/login",
    name: "login",
    component: Login,
  }, 
  {
    path: "/profile/:email",
    component: FriendProfile,
    name: "profile",
  },
  {
    path: "/rate/:combined",
    component: Rate,
    name: "rate",
  },
  {
    path: "/user-search",
    component: UserSearch,
    name: "user_search",
  },  
];

// 3. create- the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHashHistory(),
  routes, // short for `routes: routes`
});

// 5. create- and mount the root instance.
// Make sure to _use_ the router instance to make the
// whole app router-aware.

createApp(App).use(router).use(Oruga).use(VuesticPlugin).mount("#app");
