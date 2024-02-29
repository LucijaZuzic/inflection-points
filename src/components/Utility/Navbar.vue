<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";

import icon_default from "../../assets/icons/extension_FILL0_wght400_GRAD0_opsz48.png";
import icon_profile from "../../assets/icons/person_FILL0_wght400_GRAD0_opsz48.png";
import icon_folder from "../../assets/icons/rule_folder_FILL0_wght400_GRAD0_opsz48.png";
import icon_search from "../../assets/icons/person_search_FILL0_wght400_GRAD0_opsz48.png";

import AllData from '../../assets/all_no_data_short.json';
import { ratingsRef } from "../../firebase_main.js";
import { usersRef } from "../../firebase_main.js";

export default {
  data() {
    return {
      found_me: { email: "", displayName: "", uid: "", admin: false },
      name_to_icon: {
        profile: icon_profile,
        search: icon_search,
        other: icon_default,
        rate: icon_folder,
      },
      name_to_title: {
        not_found: "Not found",
        not_entered: "Not found",
        sign_in_success: "Signed in",
        login: "Sign in",
        profile: "Profile",
        user_search: "Find users",
        rate: "Rate",
      },
      selected_destination: null,
      bgcolor: "#ffffff",
      user: null,
      visible_menu: false,
    };
  },
  methods: {
    signOut() {
      this.user = null;
      const auth = getAuth();
      auth.signOut();
      this.$router.push("/login");
    },
    shuffle(array) {
      let currentIndex = array.length, randomIndex;

      // While there remain elements to shuffle.
      while (currentIndex > 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex], array[currentIndex]];
      }

      return array;
    },
    generateArray() {
      this.rated_array = [];
      for (var ws_use = 20; ws_use < 25; ws_use += 5) {
        for (var i = 0; i < AllData.vehicles.length; i++) {
          if (AllData.vehicles[i].vehicle < 10) {
            for (var j = 0; j < AllData.vehicles[i].rides.length; j++) {
              this.rated_array.push({ "string_rated": AllData.vehicles[i].vehicle + "_" + AllData.vehicles[i].rides[j].ride + "_" + ws_use, "rated_before": false });
            }
          }
        }
        for (var i = 0; i < AllData.vehicles.length; i++) {
          if (AllData.vehicles[i].vehicle >= 10) {
            for (var j = 0; j < AllData.vehicles[i].rides.length; j++) {
              this.rated_array.push({ "string_rated": AllData.vehicles[i].vehicle + "_" + AllData.vehicles[i].rides[j].ride + "_" + ws_use, "rated_before": false });
            }
          }
        }
      }
    },
    balancedLatinSquare(array, participantId) {
      result = [];
      // Based on "Bradley, J. V. Complete counterbalancing of immediate sequential effects in a Latin square design. J. Amer. Statist. Ass.,.1958, 53, 525-528. "
      for (var i = 0, j = 0, h = 0; i < array.length; ++i) {
        var val = 0;
        if (i < 2 || i % 2 != 0) {
          val = j++;
        } else {
          val = array.length - h - 1;
          ++h;
        }

        var idx = (val + participantId) % array.length;
        result.push(array[idx]);
      }

      if (array.length % 2 != 0 && participantId % 2 != 0) {
        result = result.reverse();
      }

      return result;
    },
    findNextUnrated() {
      let me = this;
      me.generateArray();
      if (me.user) {
        usersRef
          .get()
          .then(function (snapshotUser) {
            snapshotUser.forEach(function (childSnapshotUser) {
              let user_email = childSnapshotUser.get("email");
              let user_class = childSnapshotUser.get("class");
              if (user_email == me.user.email) {
                me.user_class = user_class;
              }
            })
          }).then(() => {
            if (me.user_class) {
              var url_array = [];
              for (var ix_rated = 0; ix_rated < me.rated_array.length; ix_rated += 1) {
                url_array.push("/rate/" + me.rated_array[ix_rated].string_rated);
              }
              url_array = sorted([... url_array]);
              var bls = me.balancedLatinSquare(url_array, me.user_class - 1);
              me.$router.push(bls[0]);
            } else {
              me.$router.push("/profile/" + me.user.email);
            }
          })
      } else {
        me.$router.push("/login");
      }
    }
  },
  created() {
    this.$watch(
      () => this.$route.name,
      (toParams, previousParams) => {
        this.selected_destination =
          this.$route.name.split("_")[this.$route.name.split("_").length - 1];
        this.visible_menu = false;
        document.title = this.name_to_title[this.$route.name];
        const link = document.querySelector("[rel='icon']");
        link.setAttribute("href", this.name_to_icon[this.selected_destination]);
        if (this.name_to_icon[this.selected_destination] == undefined) {
          link.setAttribute("href", this.name_to_icon["other"]);
        }
        if (
          this.$route.name == "profile" &&
          this.user &&
          this.$route.params.email == this.user.email
        ) {
          document.title = "Moj profil";
          this.selected_destination = "my_profile";
        }
      }
    );
  },
  mounted() {
    const auth = getAuth();
    let my_activity = this;
    my_activity.found_me = { email: "", displayName: "", uid: "", admin: false };
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        my_activity.user = user;
        // ...
      } else {
        // User is signed out
        // ...
      }
      if (!my_activity.user) {
        my_activity.$router.push("/login");
      }
      usersRef
        .get()
        .then(function (snapshotUser) {
          snapshotUser.forEach(function (childSnapshotUser) {
            let someEmail = childSnapshotUser.get("email");
            if (my_activity.user && someEmail == my_activity.user.email) {
              my_activity.found_me = {
                email: someEmail,
                displayName: childSnapshotUser.get("displayName"),
                uid: childSnapshotUser.id,
                admin: childSnapshotUser.get("admin")
              };
            }
          });
        })
      return true;
    });
  },
};
</script>
<template>
  <va-affix :offset-top="0" style="background-color: #2c82e0; width: 100%">
    <div style="background-color: #2c82e0; text-align: start">
      <va-tabs :color="bgcolor" v-model="selected_destination">
        <template #tabs>
          <va-tab name="my_profile" :disabled="user == null">
            <router-link :to="'/profile/' + user.email" v-if="user != null">
              <span style="color: #ffffff">
                <va-icon name="person" />
                <span>
                  {{ user.displayName }}
                </span>
              </span>
              &nbsp;
            </router-link>
          </va-tab>
          <va-tab name="login">
            <span v-if="user != null" @click="signOut()" style="color: #ffffff">
              <va-icon name="logout" />
              <span> Sign out </span>
            </span>
            <router-link :to="'/login'" v-else>
              <span style="color: #ffffff">
                <va-icon name="login" />
                <span> Sign in </span>
              </span>
            </router-link>
          </va-tab>
          <va-tab v-if="found_me != null && found_me.admin" name="search">
            <router-link to="/user-search">
              <span style="color: #ffffff">
                <va-icon name="person_search" />
                <span> Find users </span>
              </span>
            </router-link>
          </va-tab>
          <va-tab v-if="user != null" name="rate">
            <span style="color: #ffffff" v-on:click="findNextUnrated()">
              <va-icon name="rule_folder" />
              <span> Rate </span>
            </span>
          </va-tab>
          <va-tab :name="10000" disabled></va-tab>
        </template>
      </va-tabs>
    </div>
  </va-affix>
</template>

<style scoped>
.navbar-container {
  width: 200px;
  min-width: 200px;
  max-width: 200px;
  min-height: 100%;
  max-height: 80vh;
  display: inline-block;
  position: absolute;
  left: 0;
  background-color: #1e70c8;
  overflow-y: scroll;
  overflow-x: scroll;
}
</style>
