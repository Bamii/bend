<script setup>
import { onMounted, ref } from "vue";
import { useBendStore } from "../state/bend";
import { useSharedbStore } from "../state/sharedb.js";

const { modules, set_blockly_state, functions, middlewares } = useBendStore();
const sharedb = useSharedbStore();
const endpoints = modules[0].endpoints;
console.log("------------ ", sharedb.docc)

onMounted(() => {
    sharedb.setup(sharedb.docc)
})

const ataa = ref([
    ...sharedb?.data?.meta?.functions ?? [], 
    ...sharedb?.data?.meta.middlewares ?? []
]);

const dataa = ref(sharedb?.data?.meta.functions)
function edit(endpoint) {
    const element = document.getElementById("endpoint-controller");
    console.log(endpoint);
    set_blockly_state(endpoint.body.name)
    element.togglePopover();
}
</script>

<template>
    <h3>endpoint list.</h3>
    <div class="grid grid-cols-2 gap-[8px]">
        <div class="p-2 overflow-auto border-2 border-black flex flex-col gap-[2rem]">
            <div v-for="endpoint in sharedb.data?.data.modules.something.endpoints ?? []" class="w-full">
                <div class="flex items-center gap-[8px] my-2">
                    <div>delete</div>
                    <div @click="edit(endpoint)">edit</div>
                </div>
                <div>{{ JSON.stringify(endpoint) }}</div>
            </div>
        </div>

        <div class="p-2 overflow-auto border-2 border-black">
            <div v-for="fn in sharedb?.data?.meta?.functions ?? []" class="w-full">
                {{ fn }}
            </div>
        </div>
    </div>
</template>
