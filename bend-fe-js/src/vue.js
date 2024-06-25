import { createApp, ref } from 'vue/dist/vue.esm-bundler.js'
// import { ref } from "vue";
import EndpointInputComponent from "./vue/endpoint-input-component.vue"
import SchemaField from "./vue/schema-field.vue"
import AuthenticationController from "./vue/authentication-controller.vue"
import CreateFunction from "./vue/create-function.vue"
import CreateEndpoint from "./vue/create-endpoint.vue"
import EndpointList from "./vue/endpoint-list.vue"
import Blockly from "./vue/components/blockly.vue"
import {loadbend} from "./loadbend"
import { createPinia } from "pinia"
import initialise from './init'

const pinia = createPinia()

// load data from opfs
// bendast.json
// functions.js
// functions.json
// models.json

// use those files to populate
// middlewares, functions, 
const iframe_code = ref(null);
const loader = loadbend();
const { middlewares, functions, plugins } = loader;

// initialise({ plugins, functions, middlewares })
const AUTHENTICATION_SCHEMES = {
  jwt: {
    options: {
      audience: "",
      iss: "",
      name: ""
    }
  },
  google: {
    clientId: "",
    clientSecret: "",
  },
  twitter: {
    clientId: "",
    clientSecret: "",
    password: ""
  }
}

// console.log(loader)
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
app.component('AuthenticationController', AuthenticationController);
app.component('CreateFunction', CreateFunction);
app.component('CreateEndpoint', CreateEndpoint);
app.component('Blockly', Blockly);
app.component('EndpointList', EndpointList);

app.use(pinia)
app.mount("#app")
