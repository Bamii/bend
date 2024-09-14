import { defineStore } from 'pinia'
import { DocHandle, Repo, isValidAutomergeUrl } from "@automerge/automerge-repo"
import { MessageChannelNetworkAdapter } from "@automerge/automerge-repo-network-messagechannel"
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb"
import { BroadcastChannelNetworkAdapter } from '@automerge/automerge-repo-network-broadcastchannel'

// declare global {
//   interface Window {
//     handle: DocHandle<unknown>
//     repo: Repo
//   }
// }



export const useCRDTStore = defineStore("automerge-store", {
  state: () => {
    console.log('adfaf')
    const provider = new Repo({
      network: [new BroadcastChannelNetworkAdapter()],
      storage: new IndexedDBStorageAdapter("automerge-repo-demo-counter"),
      // sharePolicy: async peerId => peerId.includes("shared-worker"),
    })
    let handle;
    const rootDocUrl = `${document.location.hash.substring(1)}`
    if (isValidAutomergeUrl(rootDocUrl)) {
      handle = repo.find(rootDocUrl)
    } else {
      handle = repo.create < { count: number } > ({ count: 0 })
      document.location.hash = handle.url
    }
    return ({ doc, provider, handle })
  },
  actions: {
    getkey() {
      // this.ymap.set('keyA', 'valueA')
    }
  }
})
