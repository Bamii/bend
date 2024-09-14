<script>
import {
    Dialog,
    // Listbox,
    // ListboxButton,
    // ListboxOptions,
    // ListboxOption,
    DialogPanel,
    DialogTitle,
    DialogDescription,
} from "@headlessui/vue";
//   import { CheckIcon } from '@heroicons/vue/20/solid'

// import Dialog from 'primevue/dialog';
export default {
    props: ["creator", "toggler"],
    mounted() {
        console.log(this.creator);
    },
    data() {
        return {
            fields: [],
            schemas: new Map(),
            count: 0,
            me: true,
            open: false,
            variable: {
                name: "",
                type: ""
            },
            selectedPerson: { id: 1, name: "String" },
            basic_types: [
                { id: 1, name: "String" },
                { id: 2, name: "Number" },
                { id: 5, name: "Boolean" },
                { id: 4, name: "BigInt" },
                { id: 3, name: "Object" },
            ],
        };
    },
    computed: {
        basic_type() {
            return [
                { id: 1, name: "String" },
                { id: 2, name: "Integer" },
                { id: 3, name: "Float" },
            ];
        },
    },
    methods: {
        create() {
            console.log(this.variable)
            if(!this.variable.name || !this.variable.type) {
                // error out or sth.
                return;
            }

            this.creator(this.variable)
            this.toggler();
        },
        add_field() {
            this.fields = [
                ...this.fields,
                {
                    name: "",
                    type: "",
                    type_id: null,
                    id: this.fields.length + 1,
                },
            ];
        },
        log(e) {
            this.open = e;
            this.toggler()
        }
    },
};
</script>

<template>
    <div class="">
        <button @click="create">Count is: {{ count }}</button>

        <Dialog
            :visible="open"
            @update:visible="log"
            header="Create Variable"
            class="bg-gray-100 rounded p-3 absolute"
            :style="{ width: '25rem' }"
            :pt="{
                header: {
                    class: 'flex items-center justify-between',
                }
            }"
        >
            <div class="flex items-center gap-4 mb-4">
                <div>
                    <label
                        for="variable_name"
                        class="block text-sm font-medium text-gray-700"
                    >
                        Variable Name
                    </label>
                    <div class="mt-1">
                        <input
                            v-model="variable.name"
                            name="variable_name"
                            id="variable_name"
                            required
                            class="p-4 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>

                <div>
                    <label
                        for="variable_type"
                        class="block text-sm font-medium text-gray-700"
                    >
                        Type
                    </label>
                    <select
                        id="variable_type"
                        name="variable_type"
                        v-model="variable.type"
                        required
                        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        <option v-for="btype in basic_types" :key="btype.id" :value="btype.name">{{ btype.name }}</option>
                    </select>
                </div>
            </div>

            <div v-if="fields.length > 0">
                <div
                    v-for="field in fields"
                    class="flex items-center gap-4 mb-4"
                >
                    <div>
                        <label
                            :for="field.name"
                            class="block text-sm font-medium text-gray-700"
                            >Variable Name</label>
                        <div class="mt-1">
                            <input
                                v-model="field.name"
                                :name="field.name"
                                :id="field.name"
                                class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            :for="field.name"
                            class="block text-sm font-medium text-gray-700"
                            >Type</label
                        >
                        <select
                            id="location"
                            name="location"
                            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option>United States</option>
                            <option selected="">Canada</option>
                            <option>Mexico</option>
                        </select>
                    </div>
                </div>
            </div>

            <Button v-if="variable.type == 'Object'" @click="add_field">
                Add Field
            </Button>
            <Button @click="create">
                Create Variable
            </Button>
        </Dialog>
    </div>
</template>

<style scoped>
button {
    font-weight: bold;
}
</style>
