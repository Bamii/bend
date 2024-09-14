import { ref, reactive, nextTick } from "vue"
import { defineStore } from 'pinia'
import { loadbend } from "../core/loadbend"
import * as Blockly from "blockly/core";

const storageKey = "workspace"
export const BEND = loadbend();

export const AUTHENTICATION_SCHEMES = {
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

function get_projects_data(project) {
  let data = window.localStorage.getItem("projects_data")
  if (!data) {
    data = `{
      "something": {
        "endpoints": [],
        "name": "something",
        "path": "/something",
        "auth": null
      }
    }`
    window.localStorage.setItem("projects_data", data)
  }

  // return data[project]
  return JSON.parse(data)
}

function get_projects_meta() {
  let meta = window.localStorage.getItem("projects_meta")
  if (!meta) {
    meta = `{
      "something": {
        "middlewares": [],
        "functions": [],
        "allfunctions": [],
        "auth_schemes": []
      }
    }`
    window.localStorage.setItem("projects_meta", meta)
  }

  return JSON.parse(meta)
}

export const useBendStore = defineStore('bend', {
  state: () => ({
    project: "something",
    projects_data: get_projects_data(),
    projects_meta: get_projects_meta(),

    models: [],

    // some things...
    modules: JSON.parse(window.localStorage.getItem("state") ?? `[
      {
        "endpoints": [],
        "name": "something",
        "path": "/something",
        "auth": null
      }
    ]`),
    middlewares: new Set(JSON.parse(window.localStorage.getItem("middlewares") ?? "[]")),
    functions: new Set(JSON.parse(window.localStorage.getItem("functions") ?? "[]")),
    auth_schemes: new Set(JSON.parse(window.localStorage.getItem("auth_schemes") ?? "[]")),
    allfunctions: JSON.parse(window.localStorage.getItem("finale") ?? "{}"),

    plugins: BEND.plugins,
  }),
  actions: {
    add_function(name, type) {
      if (type == "function") {
        this.functions.add(name);
        window.localStorage.setItem("functions", JSON.stringify([...this.functions.values()]))
      } else {
        this.middlewares.add(name)
        window.localStorage.setItem("middlewares", JSON.stringify([...this.middlewares.values()]))
      }
    },
    remove_function: () => { },
    edit_function: () => { },

    // modules...
    edit_module: () => { },
    add_module: () => { },
    remove_module: () => { },
    ensure_blockly_state(name) {
      let data = this.allfunctions;

      if (data[name]) {
        return name;
      } else {
        this.save_blockly_state(name, { fn: "", ws: {} })
        return name;
      }
    },

    get_blockly_state(name) {
      let data = this.allfunctions;

      if (data[name]) {
        return data[name];
      } else {
        return this.save_blockly_state(name, { fn: "", ws: {} })
      }
    },

    add_endpoint(endpoint, index) {
      console.log(endpoint)
      this.modules[0].endpoints.push(endpoint)
      window.localStorage.setItem("state", JSON.stringify(this.modules))
    },

    save_blockly_state(key, value) {
      this.allfunctions[key] = value;
      return value;
    },

    create_fn(id, ws) {
      // update storage with new data,
      // const config = JSON.stringify(ws)
      this.allfunctions[id] = ws

      // store the workspace json in a file.

      window.localStorage?.setItem("finale", JSON.stringify(this.allfunctions));
      // store the functions in a file.
    }
  },
});

export const useBlocklyStore = defineStore('blockly', {
  state: () => ({
    workspace: null
  }),
  actions: {
    save_blockly_state(workspace) {
      console.log('afda')
      const data = Blockly.serialization.workspaces.save(workspace);
      const config = JSON.stringify(data)
      window.localStorage?.setItem(storageKey, config);
      this.workspace = config
    },

    load_blockly_state(workspace) {
      let data;
      if (this.workspace) {
        data = this.workspace
      }

      data = window.localStorage?.getItem(storageKey);
      if (!data) return;

      // Don't emit events during loading.
      Blockly.Events.disable();
      Blockly.serialization.workspaces.load(JSON.parse(data), workspace, false);
      Blockly.Events.enable();
    }
  }
})

export const useBlocklyFactory = defineStore('blockly-factory', () => {
  // const blocklystore = useBlocklyStore();
  const instances = ref(new Map())

  function create_instance(name) {
    if(!instances.value.get(name)) {
      // const id = Math.random(); // change to more robust
      const iframe = null
      const channel = new MessageChannel();
      const port1 = channel.port1;
      const data = reactive({ state: null });
  
      instances.value.set(
        name, 
        { id: name, iframe, channel, port1, data }
      ) 
    }
    return name;
  }

  function mount(id, iframe_ref) {
    let instance = get_instance(id)
    const { port1, channel } = instance

    instance.iframe = iframe_ref;
    instances.value.set(id, instance)

    iframe_ref.value?.addEventListener("load", function onLoad() {
        port1.onmessage = save_state(id);

        // send in the user's function list.
        iframe_ref.value.contentWindow.postMessage(
            "A message from the index.html page!",
            "*",
            [channel.port2]
        );
    });
  } 

  function get_instance(id) {
    return instances.value.get(id)
  }

  const save_state = (id) => async function (e) {
    instances.value.get(id).data.state = e.data;
    // sav state in store
    await nextTick();
  };

  const post = async (id, message) => {
    const { port1 } = get_instance(id)

    port1.postMessage({
      type: "update",
      key: message
    })
    await nextTick();
    return data.value;
  };

  const reset = function (id, data) {
    const { port1 } = get_instance(id)

    if (data) {
      port1.postMessage({ type: "add_function", data })
    } else {
      port1.postMessage({ type: "reset" })
    }
  }

  return { instances, create_instance, get_instance, save_state, post, reset_iframe: reset, mount }
})