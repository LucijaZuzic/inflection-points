<script>
import NoDataToDisplay from "../Utility/NoDataToDisplay.vue";

import { getAuth, onAuthStateChanged } from "firebase/auth";

import { usersRef } from "../../firebase_main.js";

import AllData from '../../assets/all_no_data.json';
import LoadingBar from "../Utility/LoadingBar.vue";
import RideTable from "../Utility/RideTable.vue";

export default {
  created() {
    this.$watch(
      () => this.$route.params,
      (toParams, previousParams) => {
        this.$router.go();
      }
    );
  },
  beforeUpdate() {
    this.fully_loaded = true;
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
    let requestedEmail = this.$route.params.email;
    let someUser = { email: "", displayName: "", uid: "", class: -1, admin: false };
    let my_activity = this;
    my_activity.found_me = { email: "", displayName: "", uid: "", class: -1, admin: false };
    let noClassUsers = [];
    let classes_count = [];
    for (var ws_use = 20; ws_use < 25; ws_use += 5) {
      for (var i = 0; i < AllData.vehicles.length; i++) {
        for (var j = 0; j < 2; j++) {
          classes_count.push({ "count": 0 });
        }
      }
    }
    usersRef
      .get()
      .then(function (snapshotUser) {
        snapshotUser.forEach(function (childSnapshotUser) {
          let somedisplayName = childSnapshotUser.get("displayName");
          let someAdmin = childSnapshotUser.get("admin");
          let someEmail = childSnapshotUser.get("email");
          let someClass = childSnapshotUser.get("class");
          let someUid = childSnapshotUser.id;
          if (someClass) {
            classes_count[someClass - 1].count = classes_count[someClass - 1].count + 1;
          }
          if (!someClass) {
            noClassUsers.push({
              email: someEmail,
              displayName: somedisplayName,
              uid: someUid,
              class: someClass,
              admin: someAdmin
            });
          }
          if (someEmail == requestedEmail) {
            someUser = {
              email: someEmail,
              displayName: somedisplayName,
              uid: someUid,
              class: someClass,
              admin: someAdmin
            };
          }
          if (my_activity.user && someEmail == my_activity.user.email) {
            my_activity.found_me = {
              email: someEmail,
              displayName: somedisplayName,
              uid: someUid,
              class: someClass,
              admin: someAdmin
            };
          }
        });
      })
      .then(() => {
        my_activity.friend = someUser;
        if (my_activity.found_me && my_activity.found_me.email != my_activity.friend.email && !my_activity.found_me.admin) {
          my_activity.$router.push("/profile/" + my_activity.found_me.email);
        }
        if (!my_activity.user) {
          my_activity.$router.push("/login");
        }
        if (noClassUsers.length > 0) {
          for (var user_ix = 0; user_ix < noClassUsers.length; user_ix += 1) {
            let ix_least = 0;
            let least_common_class = classes_count[ix_least];
            for (var i = 0; i < classes_count.length; i++) {
              if (classes_count[i].count < least_common_class.count) {
                ix_least = i;
                least_common_class = classes_count[i];
              }
            }
            if (noClassUsers[user_ix].uid == my_activity.found_me.uid) {
              my_activity.found_me.class = ix_least;
            }
            noClassUsers[user_ix].class = ix_least;
            classes_count[ix_least].count = classes_count[ix_least].count + 1;
            usersRef
              .doc(noClassUsers[user_ix].uid)
              .set(
                {
                  class: ix_least + 1
                },
                { merge: true }
              )
          }
        }
        my_activity.fully_loaded = true;
      });
  },
  data() {
    return {
      fully_loaded: false,
      found_me: { email: "", displayName: "", uid: "", class: -1, admin: false },
      user: { email: "", displayName: "", uid: "", class: -1, admin: false },
      friend: { email: "", displayName: "", uid: "", class: -1, admin: false }
    };
  },
  components: {
    NoDataToDisplay,
    LoadingBar,
    RideTable
  },
};
</script>

<template>
  <body class="my_body" v-if="!fully_loaded">
    <LoadingBar></LoadingBar>
  </body>

  <body class="my_body" v-else>
    <span v-if="friend.email != '' || friend.displayName != '' || friend.uid != ''">
      <h4 class="display-4">
        <va-icon size="large" name="star" v-if="friend.admin"></va-icon>
        <va-icon size="large" name="account_box" v-else></va-icon>
        &nbsp;
        <span v-if="user.email != friend.email">User profile</span>
        <span v-else>My profile</span>
      </h4>
      <va-divider></va-divider>
      <div style="font-weight: bold">
        <va-icon name="person"></va-icon> &nbsp;
        {{ friend.displayName }} &nbsp;
        <va-icon name="email"></va-icon> &nbsp;
        {{ friend.email }} &nbsp;
        <span v-if="found_me.admin"><va-icon name="interests"></va-icon> &nbsp; User class &nbsp; {{ friend.class }} </span>
      </div>
      <va-divider></va-divider>
      <RideTable :user_to_find="friend.uid" :is_admin="found_me.admin" />
    </span>
    <span v-else>
      <NoDataToDisplay customMessage="User not found">
      </NoDataToDisplay>
    </span>
  </body>
</template>

<style scoped></style>
