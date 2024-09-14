import { createApp, defineAsyncComponent, ref } from 'vue/dist/vue.esm-bundler.js'
// import { ref } from "vue";
import { createPinia } from "pinia"
import SchemaField from "./vue/schema-field.vue"
import EndpointInputComponent from "./vue/endpoint-input-component.vue"
import AuthenticationController from "./vue/authentication-controller.vue"
import CreateFunction from "./vue/create-function.vue"
import CreateEndpoint from "./vue/create-endpoint.vue"
import CreateModel from "./vue/create-model.vue"
import EndpointList from "./vue/endpoint-list.vue"
import ShareDB from "./vue/components/sharedb.vue"
// import Blockly from "./vue/components/blockly-component.vue"
import Blockly from "./vue/components/blockly-composer.vue"
// import Blockly from "./vue/components/blockly.vue"
import { loadbend } from "./core/loadbend"
import { AUTHENTICATION_SCHEMES } from './state/bend'

const pinia = createPinia()

// load data from opfs
// bendast.json
// functions.js
// functions.json
// models.json

// use those files to populate
// middlewares, functions, 
// const iframe_code = ref(null);
const loader = loadbend();
const { middlewares, functions, plugins } = loader;

// document.addEventListener("DOMContentLoaded", function() {
//   const channel = new MessageChannel();
//   const output = document.querySelector(".output");
//   const iframe = document.querySelector("iframe");
  
//   // Wait for the iframe to load
//   iframe.addEventListener("load", onLoad);
  
//   function onLoad() {
//     // Listen for messages on port1
//     channel.port1.onmessage = onMessage;
//     // Transfer port2 to the iframe
//     iframe.contentWindow.postMessage(
//       "A message from the index.html page!",
//       "*",
//       [channel.port2]
//     );
//   }
  
//   function onMessage(e) {
//     console.log(e)
//     console.log(e.data)
//   }
// })


const app = createApp({
  data: () => ({
    AUTHENTICATION_SCHEMES,
    user_auth_schemes: [],
    store: {
      middlewares,
      functions,
      plugins
    },
    inputs: [],
    path: "",
    method: "GET",
    auth: { mode: "", scheme: "none" },
    cors: false,
    middlewares: [],
    endpoints: []
  }),
  methods: {
    addinput() {
      console.log('fadsf')
      this.inputs.push({
        type: "",
        fields: []
      })
    },
    add_middleware(mw) {
      this.middlewares.push({
        name: mw ?? "something"
      })
    },
    addendpoint() {
      this.endpoints.push({
        method: this.method,
        path: this.path,
        inputs: this.inputs,
        middlewares: this.middlewares,
        auth: this.auth,
        cors: this.cors,
        body: {}
      })
      this.path = "";
      this.method = "GET";
      this.inputs = []
      this.middlewares = []
      this.auth = { mode: "", scheme: "" };
      this.cors = false;
    },
    submit_form(e) {
      e.preventDefault()
      this.addendpoint();
      console.log(this.endpoints)
      document.getElementById("pop").hideModal()
    },
    async getmycode() {
      console.log(document.getElementById("iframe-code")?.contentDocument.getElementById("generatedCode").outerText)

      const opfsRoot = await navigator.storage.getDirectory();
      console.log(opfsRoot);
      const fileHandle = await opfsRoot
        .getFileHandle('my first file', { create: true });
    }
  }
});

app.component('EndpointInputComponent', EndpointInputComponent);
app.component('SchemaField', SchemaField);
// app.component('AuthenticationController', defineAsyncComponent(() => import('./vue/authentication-controller.vue')));
// app.component('CreateFunction', defineAsyncComponent(() => import('./vue/create-function.vue')));
// app.component('CreateEndpoint', defineAsyncComponent(() => import('./vue/create-endpoint.vue')));
app.component('AuthenticationController', AuthenticationController);
app.component('CreateFunction', CreateFunction);
app.component('CreateModel', CreateModel);
app.component('CreateEndpoint', CreateEndpoint);
app.component('Sharedb', ShareDB);
app.component('Blockly', Blockly);
// app.component('Blockly', defineAsyncComponent(() => import("./vue/components/blockly-component.vue")));
// app.component('Blockly', defineAsyncComponent(() => import("./vue/components/blockly.vue")));
app.component('EndpointList', EndpointList);

app.use(pinia)
app.mount("#app")
