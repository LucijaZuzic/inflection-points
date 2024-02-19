<template>
  <div>Vehicle {{ vehicle }} Ride {{ ride }} </div>
  <div><img id="my_canvas" alt="da" width="300" /></div>
</template>

<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
export default {
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
    let combined = this.$route.params.combined;
    let split_vals = combined.split("_");
    this.vehicle = split_vals[0];
    this.ride = split_vals[1];
    this.file_name = "../../assets/cleaned_png/" + this.vehicle + "/" + this.ride + "/" + this.vehicle + "_" + this.ride + ".png";
    this.getFile();
    return {
      vehicle: split_vals[0],
      ride: split_vals[1]
    };
  },
  methods: {
    getFile: async function (event) {
      var get_response = await import(this.file_name);
      var c = document.getElementById('my_canvas');
      c.src = get_response.default;
    }
  }
}
</script>