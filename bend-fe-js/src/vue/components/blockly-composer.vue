<script setup>
const props = defineProps({
  name: { type: String, required: true },
  class: String
})
import { onMounted, ref, nextTick, reactive, watch } from "vue";
import { useBlocklyFactory } from "../../state/bend";
// import { useSharedbStore } from "../../state/sharedb";

const blocklystore = useBlocklyFactory();
const iframe = ref();

onMounted(() => {
  blocklystore.create_instance(props.name)
  blocklystore.mount(props.name, iframe)
});

const instance = blocklystore.get_instance(props.name)

const post = async (message) => {
    instance?.port1.postMessage({
        type: "update",
        key: message
    })
    console.log(instance?.data.value)
    console.log("----------")
    await nextTick();
    return instance?.data.value;
};

const url = `./index.pug?type=function&name=${props.name}`

const reset = function(data) {
    instance?.port1.postMessage({ type: "reset" })
    console.log("DATAAA", data)

    if(data) {
        instance?.port1.postMessage({ type: "add_function", data })
    }
}

defineExpose({
    // iframe,
    // channel,
    // port1,
    post,
    reset,
    state: instance?.data
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