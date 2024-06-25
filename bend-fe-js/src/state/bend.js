import { defineStore } from 'pinia'
import { loadbend } from "../loadbend"

// You can name the return value of `defineStore()` anything you want,
// but it's best to use the name of the store and surround it with `use`
// and `Store` (e.g. `useUserStore`, `useCartStore`, `useProductStore`)
// the first argument is a unique id of the store across your application
console.log(loadbend())

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
export const useBendStore = defineStore('bend', {
  state: () => ({ 
    count: 0,
    /**
     * modules: [{ endpoints: [] }]
     */
    modules: [
      {
        endpoints: [],
        name: "something",
        path: "/something",
        auth: null,
      }
    ],
    middlewares: [],
    functions: [],
    plugins: BEND.plugins,
    auth_schemes: []
  }),
  getters: {
    // should be used for functions and middlewares

  },
  actions: {
    increment() {
      this.count++
    },
    add_function: () => {},
    remove_function: () => {},
    edit_function: () => {},

    // modules...
    edit_module: () => {},
    add_endpoint(endpoint, index) {
      this.modules[0].endpoints.push(endpoint)
    },
    add_module: () => {},
    remove_module: () => {}
  },
});