<script>
import NoDataToDisplay from "../Utility/NoDataToDisplay.vue"; 
  
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { usersRef } from "../../firebase_main.js";
 
import LoadingBar from "../Utility/LoadingBar.vue";
import RideTable from "../Utility/RideTable.vue";

export default {
  methods: { 
    authenticate() {
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
      let someUser = { email: "", displayName: "", uid: "" };
      let my_activity = this; 
      usersRef
        .get()
        .then(function (snapshotUser) {
          snapshotUser.forEach(function (childSnapshotUser) {
            let someEmail = childSnapshotUser.get("email");
            if (someEmail == requestedEmail) {
              someUser = { 
                email: childSnapshotUser.get("email"),
                displayName: childSnapshotUser.get("displayName"),
                uid: childSnapshotUser.id
              };
            }
          });
        })
        .then(() => {
          my_activity.friend = someUser;
          this.fully_loaded = true;
        });
    } 
  },
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
    this.authenticate();
  },
  data() {
    return { 
      fully_loaded: false,   
      user: { email: "", displayName: "", uid: "" },
      friend: { email: "", displayName: "", uid: "" }
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
    <span
      v-if="friend.email != '' || friend.displayName != '' || friend.uid != ''"
    >
      <span v-if="user.email != friend.email">
        <h4 class="display-4">
          <va-icon size="large" name="account_box"></va-icon>&nbsp; Profil
          korisnika
        </h4>
        <br />
        <va-divider></va-divider>
        <div style="font-weight: bold">
          <va-icon name="person"></va-icon> &nbsp;
          {{ friend.displayName }} &nbsp;
          <va-icon name="email"></va-icon> &nbsp;
          {{ friend.email }}  
        </div> 
        <RideTable />
      </span>
      <span v-else>
        <h4 class="display-4">
          <va-icon size="large" name="account_box"></va-icon>&nbsp; Moj profil
        </h4>
        <br />
        <va-divider></va-divider>
        <div style="font-weight: bold">
          <va-icon name="person"></va-icon> &nbsp;
          {{ friend.displayName }} &nbsp;
          <va-icon name="email"></va-icon> &nbsp;
          {{ friend.email }} 
        </div>
        <RideTable :user_to_find="friend.uid" /> 
      </span> 
    </span>
    <span v-else>
      <NoDataToDisplay
        customMessage="Ne postoji korisnik s navedenom email adresom"
      >
      </NoDataToDisplay>
    </span>
  </body>
</template>

<style scoped></style>
