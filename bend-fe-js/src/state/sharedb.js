import ReconnectingWebSocket from 'reconnecting-websocket'
import sharedb, { Connection } from 'sharedb/lib/client'
import { defineStore } from 'pinia'
import * as json1 from 'ot-json1';

sharedb.types.register(json1.type);

var socket = new ReconnectingWebSocket('ws://localhost:4445/', [], {
  // ShareDB handles dropped messages, and buffering them while the socket
  // is closed has undefined behavior
  maxEnqueuedMessages: 0
})

export const useSharedbStore = defineStore("sharedb-store", {
  state() {

    return ({ docc: null, data: null, is_setup: false })
  },
  getters: {},
  actions: {
    setup(_dc) {
      const that = this;
      if (!this.is_setup) {
        // console.log("SCREAMINGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG")
        // console.log("we are setting up")

        var connection = new Connection(socket)
        const dc = connection.get("project", "files")
        // const dc = this.docc;

        dc.subscribe((dcc) => {
          // console.log(arguments)
          // console.log(dcc?.data)
          if (!dc.type) {
            const document = {
              meta: {
                "middlewares": [],
                "functions": [],
                "allfunctions": {},
                "auth_schemes": [],
                "models": [{ name: "", fields: [] }]
              },
              data: {
                modules: {
                  something: {
                    "endpoints": [],
                    "name": "something",
                    "path": "/something",
                    "auth": null
                  }
                }
              }
            }

            // console.log('inside creator.')
            dc.create(document, (error) => {
              that.data = document;
              if (error) console.error(error);
            });
          } else {
            that.data = dc.data;
          }
        })

        dc.on("load", function (e) {
          // console.log("----------- loader ")
        })

        dc.on("before op", function (e) { console.log(e, "before op") })

        dc.on("create", function (e) { console.log(e, "create") })

        dc.on("op", function (e) { console.log(e, "op") })

        dc.on("before op batch", function (e) { console.log(e, "before op batch") })

        dc.on("del", function (e) { console.log(e, "del") })

        dc.on("error", function (e) { console.log(e, "error") })

        dc.on("op batch", (op) => {
          // console.log("count", dc.data);
          data = dc.data;
          that.data = dc.data;
          console.log(dc.data);
        });

        this.docc = dc;
        this.is_setup = true;
      }
    },

    insert_model(data) {
      this.docc.submitOp([
        { p: ["meta", "models", 0], li: data }
      ])
    },

    update_model(index, data) {
      this.docc.submitOp([
        { p: ["meta", "models", index], li: data }
      ])
    },

    _insert_data(path, data) {
      this.docc.submitOp([
        { p: ["data", "modules", ...path], ...data }
      ])
    },

    _insert_meta(path, data) {
      this.docc.submitOp([
        { p: ["meta", ...path], ...data }
      ])
    },

    // meta related oerations
    insert_meta(type, id, data) {
      this.docc.submitOp([
        { p: ["meta", type, id], oi: data }
      ])

      // this.doc.submitOp([])
    },

    update_meta() { },

    // data related oerations
    insert_module(id, data) {
      this.docc.submitOp([
        { p: ["data", "modules", id], oi: data }
      ])
    },

    insert_data() {

    },

    update_data() { },

    add_endpoint(module, endpoint_id, endpoint) {

    },

    update_endpoint(module, endpoint_id, endpoint) {

    },

    add_module(module_name) {

    },

    update_module(name, data) {

    }
  }
})

