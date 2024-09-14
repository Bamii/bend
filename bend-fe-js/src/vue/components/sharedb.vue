<script setup>
import { useSharedbStore } from "../../state/sharedb";

const sharedb = useSharedbStore()
sharedb.setup(sharedb.docc)

function test() {
    console.log("adfds");
    console.log(sharedb.data)
}

function create() {
    sharedb.increment();
}
</script>

<template>
    <div>
      test sharedb
    </div>
    <div class="space-x-2 mt-3">
      <button @click="test">test</button>
      <button @click="create">create</button>
    </div>
</template>
