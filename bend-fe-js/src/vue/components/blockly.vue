<script setup>
import { ref } from "vue";
const iframe = ref();
const channel = new MessageChannel();
const port1 = channel.port1
console.log(port1)
console.log(port1.value)

    port1.onmessage = function(e) {
        console.log(e)
        // port1.value.postMessage("sdfadsfa")
    };

// Compiler macros, such as defineExpose, don't need to be imported
defineExpose({
    iframe,
    channel,
    port1
});

iframe.value?.addEventListener("load", function onLoad() {
    // Transfer port2 to the iframe
    iframe.contentWindow.postMessage(
      "A message from the index.html page!",
      "*",
      [channel.port2]
    );
});

function getmycode() {}
</script>

<template>
    <div class="mt-10 border border-black rounded-lg">
        <div class="p-2 flex items-center justify-between w-full">
            <div>Endpoint Logic</div>
            <button @click="getmycode" class="py-3 px-10">click</button>
        </div>

        <div class="border-2 rounded p-2">
            <div class="h-[50vh] w-full relative">
                <iframe
                    class="h-[100vh] w-full _mt-5"
                    src="./index.pug?type=function"
                    id="iframe-code"
                    ref="iframe"
                ></iframe>
            </div>
        </div>
    </div>
</template>
