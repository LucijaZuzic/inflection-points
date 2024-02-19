<script>
import { usersRef } from "../../firebase_main.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
export default {
  mounted() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        this.user = user;
        usersRef
          .doc(user.uid)
          .set(
            {
              displayName: user.displayName,
              email: user.email,
            },
            { merge: true }
          )
          .then(this.$router.push("/profile/" + user.email));
        // ...
      } else {
        // User is signed out
        // ...
      }
      return true;
    });
  },
  data() {
    return {};
  },
};
</script>

<template></template>

<style scoped></style>
