<script setup>
const props = defineProps({
  type: { type: String, default: "function" }
})
import { ref } from 'vue';
import { useBendStore, useBlocklyFactory } from '../state/bend.js';
import { useSharedbStore } from "../state/sharedb";

let id = "create-function-"+Date.now()
let iframe_ref = ref()
let function_name = ref("")

// blockly x bend
const { modules, add_function, save_blockly_state } = useBendStore()
const blocklystore = useBlocklyFactory();

// sharedb
const sharedb = useSharedbStore();
const { _insert_meta } = sharedb;
sharedb.setup(sharedb.docc)

function create_function(e){
    e.preventDefault()
    if(!function_name.value) return;
    const instance = blocklystore.get_instance(props.type)

    let short_type = props.type == "function" ? "fn" : "mw";
    let id = `${short_type}__${modules[0].name}__${function_name.value}`;
    
    const data = { id, ...instance.data.state };
    
    ///////////// new
    _insert_meta([props.type+"s", 0], { li: id })
    _insert_meta(["allfunctions", id], { oi: data })

    // reset state
    blocklystore.reset_iframe(props.type);
}
</script>

<template>
    <button :popovertarget="id">open create {{ props.type }} modal</button>
    <div
        :id="id"
        popover="manual"
        class="bkdrp fixed h-[100%] right-0 _w-full bg-white _max-w-screen-sm w-[70vw] p-[24px] rounded-[10px] border overflow"
    >
        <button :popovertarget=id class="mb-5">
            close modal
        </button>
        <button type="submit" @click="create_function" _form="endpoint-form" class="mb-5">finish stuff</button>

        <form
            id="endpoint-form"
            @submit="create_function"
            class="gap-[6px] h-[100%]"
        >
            <div class="flex flex-col">
                <label for="name">function name</label>
                <input required name="name" v-model="function_name" class="w-full border border-black rounded p-2" />
            </div>
            <blockly :name="props.type" ref="iframe_ref" class="h-[100%]"></blockly> 
        </form>
    </div>
</template>

