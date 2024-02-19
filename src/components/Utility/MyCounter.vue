<template>
  <span
    style="
      display: inline-block;
      overflow-wrap: anywhere !important;
      margin: 10px;
    "
  >
    <div>
      <va-button
        v-if="is_zoom"
        disabled
        size="small"
        outline
        round
        :rounded="false"
        style="border: none"
      >
        <va-icon name="search"></va-icon>
      </va-button>
      {{ some_text }}
      <va-button
        v-if="is_zoom"
        :disabled="100 == value"
        size="small"
        outline
        round
        :rounded="false"
        style="border: none"
        @click="
          value = 100;
          value = Math.max(min_value, Math.min(value, max_value));
          $emit('input', value);
        "
      >
        <va-icon name="restart_alt"></va-icon>
      </va-button>
    </div>
    <br />
    <va-button
      :disabled="min_value >= value"
      size="small"
      outline
      round
      :rounded="false"
      style="border: none"
      @click="
        value = min_value;
        value = Math.max(min_value, Math.min(value, max_value));
        $emit('input', value);
      "
    >
      <va-icon name="first_page"></va-icon>
    </va-button>
    <va-button
      :disabled="min_value >= value"
      size="small"
      outline
      round
      :rounded="false"
      style="border: none"
      @click="
        value = value - 1;
        value = Math.max(min_value, Math.min(value, max_value));
        $emit('input', value);
      "
    >
      <va-icon name="chevron_left" />
    </va-button>
    <input
      @input="
        value = Math.max(min_value, Math.min(value, max_value));
        $emit('input', value);
      "
      v-model="value"
      :min="min_value"
      :max="max_value"
      type="number"
    />
    <va-button
      :disabled="max_value <= value"
      size="small"
      outline
      round
      :rounded="false"
      style="border: none"
      @click="
        value = value + 1;
        value = Math.max(min_value, Math.min(value, max_value));
        $emit('input', value);
      "
    >
      <va-icon name="chevron_right" />
    </va-button>
    <va-button
      :disabled="max_value <= value"
      size="small"
      outline
      round
      :rounded="false"
      style="border: none"
      @click="
        value = max_value;
        value = Math.max(min_value, Math.min(value, max_value));
        $emit('input', value);
      "
    >
      <va-icon name="last_page"></va-icon>
    </va-button>
  </span>
</template>

<script>
export default {
  emits: ["input"],
  props: [
    "value",
    "some_text",
    "max_value",
    "min_value",
    "is_page_size",
    "is_page_number",
    "is_zoom",
  ],
  components: {},
  data() {
    return {};
  },
};
</script>

<style scoped>
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
  border: none;
  width: 40px;
  background-color: transparent;
  vertical-align: middle;
  text-align: center;
  font-weight: bold;
  color: #767c88;
  display: inline-block;
  margin: none;
  padding: none;
}
</style>
