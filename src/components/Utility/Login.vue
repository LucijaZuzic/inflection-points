<script>
import { ui, uiConfig } from "../../firebase_main.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default {
  components: {},
  methods: {
    delay(operation, delay) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(operation);
        }, delay);
      });
    },
    async new_async(operation, delay) {
      await this.delay(operation, delay);
    },
  },
  mounted() {
    const auth = getAuth();
    auth.signOut();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        // ...
        document.getElementById("signed_in").visible = true;
        document.getElementById("signed_in").hidden = false;
      } else {
        // User is signed out
        // ...
        document.getElementById("signed_in").visible = false;
        document.getElementById("signed_in").hidden = true;
        ui.start("#firebaseui-auth-container", uiConfig);
      }
      return true;
    });
  },
};
</script>

<template>
  <body class="my_body">
    <h4 class="display-4">Sign in</h4>
    <br />
    <section id="firebaseui-auth-container"></section>
    <br />
    <h4 id="signed_in" visible="false" hidden="true" class="display-4">
      Signed in
    </h4>
  </body>
</template>

<style scoped></style>
