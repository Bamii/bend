<script setup>
const props = defineProps({
  name: { type: String, required: true },
  class: String
})
import { onMounted, ref, nextTick, reactive, watch } from "vue";
import { useBendStore } from "../../state/bend";
import { useSharedbStore } from "../../state/sharedb";
const id = Math.random();
const iframe = ref();
const channel = new MessageChannel();
const port1 = channel.port1;
const data = reactive({ state: null });

const store = useBendStore()
const { blockly_state, save_blockly_state } = store;

const sharedb = useSharedbStore();
onMounted(() => {
    iframe.value?.addEventListener("load", function onLoad() {
        port1.onmessage = save_state;

        // send in the user's function list.
        iframe.value.contentWindow.postMessage(
            "A message from the index.html page!",
            "*",
            [channel.port2]
        );
    });
});

const save_state = async function (e) {
    console.log("saving state")
    console.log(e)
    console.log()
    console.log()
        
    data.state = e.data;
    console.log(props.name, e.data)
    
    // sav state in store
    await nextTick();
};

const post = async (message) => {
    port1.postMessage({
        type: "update",
        key: message
    })
    console.log(data.value)
    console.log("----------")
    await nextTick();
    return data.value;
};


const url = `./index.pug?type=function&name=${props.name}`

const reset = function(data) {
    port1.postMessage({ type: "reset" })
    console.log("DATAAA", data)

    if(data) {
        port1.postMessage({ type: "add_function", data })
    }
}

defineExpose({
    iframe,
    channel,
    port1,
    post,
    reset,
    state: data
});
</script>

<template>
    <div :class="`${props.class} mt-10 border border-black rounded-lg flex flex-col`">
        <div class="p-2 flex items-center justify-between w-full">
            <div>Endpoint Logic</div>
            <button @click="getmycode" class="py-3 px-10">click</button>
        </div>

        <div class="border-2 rounded p-2 flex-1 h-[100%]">
            <div class="_h-[50vh] w-full relative h-[100%]">
                <iframe
                    class="h-[100%] w-full _mt-5"
                    :src="url"
                    ref="iframe"
                    :id="id"
                ></iframe>
            </div>
        </div>
    </div>
</template>
