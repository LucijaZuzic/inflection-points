<script>
export default {
  props: ["customMessage"],
  data() {
    return {};
  },
  components: {},
  methods: {},
};
</script>

<template>
  <br />
  <div>
    <span style="font-weight: bold">
      <va-icon name="folder_off"></va-icon>&nbsp; {{ customMessage }}
    </span>
  </div>
  <br />
</template>

<style scoped></style>
