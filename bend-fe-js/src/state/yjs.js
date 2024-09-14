
import { defineStore } from 'pinia'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

const doc = new Y.Doc()
export const useCRDTStore = defineStore("yjs-store", {
  state: () => {
    console.log('adfaf')
    return ({ doc, provider: new WebsocketProvider('ws://localhost:3000', '', doc) })
  },
  actions: {
    getkey() {
      this.ymap.set('keyA', 'valueA')
    }
  }
})

