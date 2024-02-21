<script>
import NoDataToDisplay from "../Utility/NoDataToDisplay.vue";

import { getAuth, onAuthStateChanged } from "firebase/auth";

import { usersRef } from "../../firebase_main.js";

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
    let someUser = { email: "", displayName: "", uid: "", admin: false };
    let my_activity = this;
    my_activity.found_me = { email: "", displayName: "", uid: "", admin: false };
    usersRef
      .get()
      .then(function (snapshotUser) {
        snapshotUser.forEach(function (childSnapshotUser) {
          let someEmail = childSnapshotUser.get("email");
          if (someEmail == requestedEmail) {
            someUser = {
              email: someEmail,
              displayName: childSnapshotUser.get("displayName"),
              uid: childSnapshotUser.id,
              admin: childSnapshotUser.get("admin")
            };
          }
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
      .then(() => {
        my_activity.friend = someUser;
        if (my_activity.found_me && my_activity.found_me.email != my_activity.friend.email && !my_activity.found_me.admin) {
          my_activity.$router.push("/profile/" + my_activity.found_me.email);
        }
        if (!my_activity.user) {
          my_activity.$router.push("/login");
        }
        my_activity.fully_loaded = true;
      });
  },
  data() {
    return {
      fully_loaded: false,
      found_me: { email: "", displayName: "", uid: "", admin: false },
      user: { email: "", displayName: "", uid: "", admin: false },
      friend: { email: "", displayName: "", uid: "", admin: false }
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
        {{ friend.email }}
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
