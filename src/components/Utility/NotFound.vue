<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default {
  data() {
    return {
    };
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
      if (this.user) {
        this.$router.push("/profile/" + this.user.email);
      } else {
        this.$router.push("/login");
      }
      return true;
    });
  },
};
</script>

<template>

  <body class="my_body">
    <h4 class="display-4">404</h4>
    <br />
    <h4 class="display-4">File not found</h4>
  </body>
</template>

<style scoped></style>
