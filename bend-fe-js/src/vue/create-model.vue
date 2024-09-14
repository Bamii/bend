<script setup>
import { reactive } from 'vue';
import { useSharedbStore } from '../state/sharedb';

const id = Date.now();
const state = reactive({ models: [] })

const sharedb = useSharedbStore();
const { insert_model, _insert_meta } = sharedb;
sharedb.setup(sharedb.docc)

function add_field(model) {
    state.models[model]?.fields.push({
        name: "",
        type: "",
        value: ""
    })
}

function add_model() {
    _insert_meta(["models", 0], { li: {
        name: "",
        fields: []
    }})
}
</script>

<template>
    <button :popovertarget="id">open models modal</button>
    <div
        popover="manual"
        :id="id"
        class="bkdrp fixed h-[100%] right-0 _w-full bg-white _max-w-screen-sm w-[70vw] p-[24px] rounded-[10px] border overflow"
    >
        <button :popovertarget=id class="mb-5">
            close modal
        </button>
        <button @click="addendpoint" class="mb-5">finish stuff</button>

        <form action="">
            <div>
                <div v-for="(model, index) in sharedb.data?.meta?.models ?? []" class="p-2 border rounded">
                    <div>
                        <input type="text" v-model="model.name" class="p-2 border">
                    </div>
                    <div>
                        <span>fields</span>
                        <div>
                            <div v-for="field in model.fields">
                                <div>
                                    {{ field.name }}
                                </div>
                                <input class="border p-2" type="text" v-model="field.value">
                            </div>
                            <button type="button" @click="add_field(index)">add field</button>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <button @click="add_model" type="button">add model</button>
            </div>
        </form>
    </div>
</template>