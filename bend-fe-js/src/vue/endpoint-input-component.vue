<script setup>
const props = defineProps({
  input: [{
    type: Object,
    default: () => {
      return {}
    }
  }, Number],
});
import { reactive, ref } from "vue";

const schema = ref({
  inputs: [1,34,4],
})
const add_new_input = function(_) {
  props.input.fields.push({
    type: "",
    fields: []
  })
}

const add_new_schema_field = function(id) {
  props.input.fields.push({
    type: "sth",
    name: "sth"
  })
}

const update_schema_field = function(id) {
  schema.value.inputs.map((e, index) => {
    if(index == id) {
      return e
    } else {
      return e
    }
  })
}
</script>

<template>
    <div
        id="id"
        data-endpoint-input-target="unique"
        class="w-full border border-black p-3 rounded"
    >
        <div class="flex flex-col mt-0">
            <select
                class="border-gray-300 border-2 p-2 rounded"
                name="method"
                id=""
            >
                <option value="body">Body</option>
                <option value="query">query</option>
                <option value="Header">Header</option>
            </select>
        </div>

        <div class="mt-3">
            <div class="">
                Schema
                <div style="flex-wrap: wrap;" class="flex gap-[8px] mt-2 flex-wrap schema-field-list">
                    <schema-field v-for="schema in props.input.fields" :field=schema></schema-field>
                    <button
                        @click="add_new_schema_field"
                        data-endpoint-input-actor="unique"
                        type="button"
                        class="w-max border-2 border-dashed rounded p-3"
                    >
                        + add new schema item
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
