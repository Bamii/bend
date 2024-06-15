import { createApp } from 'vue/dist/vue.esm-bundler.js'
import EndpointInputComponent from "./vue/endpoint-input-component.vue"
import SchemaField from "./vue/schema-field.vue"

const app = createApp({
  data: () => ({
    items: [],
    // items: [1,22,4],
    endpoints: []
  }),
  methods: {
    addinput() {
      console.log('fadsf')
      console.log(this.items)
      this.items.push({
        type: "",
        fields: []
      })
    },
    addendpointinputschema() {

    }
  }
  /* root component options */
});

app.component('EndpointInputComponent', EndpointInputComponent);
app.component('SchemaField', SchemaField);

app.mount("#app")
