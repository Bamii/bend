<script setup>
import * as Y from "yjs";
import // { useCRDTStore } from "../../state/automerge";

// const store = useCRDTStore();
// const ymap = store.doc.getMap("something")
// store.doc.on("update", function(e) {
//   console.log(ymap.toJSON())
//   console.log(e)
// })
// store.provider.on('status', event => {
//   console.log(event.status) // logs "connected" or "disconnected"
// })
// console.log(JSON.stringify(ymap.toJSON()))

// ymap.observe((e) => {
//   console.log(e)
//   // Y.applyUpdate(store.doc, e)
// })

const sharedb = useSharedbStore();
sharedb.doc.subscribe((error) => {
    if (error) return console.error(error);

    console.log("inside subscriber")
    console.log(sharedb.doc)
    // If doc.type is undefined, the document has not been created, so let's create it
    if (!sharedb.doc.type) {
        sharedb.doc.create({ counter: 0 }, (error) => {
            if (error) console.error(error);
        });
    }
});

sharedb.doc.on("op", (op) => {
    console.log("count", sharedb.doc.data.counter);
    console.log(op);
});

function test() {
    console.log("adfds");
    // ymap.set("jey", "afkjhgh");

    console.log(sharedb.doc.data)

    // newDoc = Automerge.change(currentDoc, (doc) => {
    //     doc.property = "value"; // assigns a string value to a property
    // });
}

function create() {
    // console.log([...ymap.entries()]);

    // sharedb.doc.submitOp([{p: ['numClicks'], na: 1}]);
    sharedb.doc.create({ counter: 0 }, (error) => {
        if (error) console.error(error);
    });
}
</script>

<template>
    test yjs
    <button @click="test">test</button>
    <button @click="create">create</button>
</template>
