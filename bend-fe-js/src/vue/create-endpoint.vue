<script setup>
import { ref } from "vue";
import { AUTHENTICATION_SCHEMES, useBendStore } from "../state/bend.js"
import { loadbend } from "../loadbend.js"
const { add_endpoint, middlewares } = useBendStore();
const BEND = loadbend()

const props = defineProps({
    action: Function,
});

const store = ref({
    middlewares: [],
});

console.log("bebnd:", loadbend())
const default_state = () => ({
    module: "something",
    name: "",
    path: "",
    method: "",
    inputs: [],
    cors: false,
    auth: {
        mode: "",
        scheme: "none"
    },
    cors: "",
    middlewares: [],
})
const state = ref(default_state());
const iframe_ref = ref()

const _add_endpoint = () => {
    add_endpoint(state.value)
    
    state.value = default_state();
    console.log(iframe_ref.value)
    console.log(iframe_ref.value.iframe)
    console.log(iframe_ref.value.port1)

    iframe_ref.value.port1.postMessage(
      "A message from the index.html page!",
    );
}

const addinput = () => {
    state.value.inputs.push({
        type: "",
        fields: []
    })
}

const add_middleware = (mw) => {
    state.value.middlewares.push({
        name: mw ?? "something"
    })
}

const edit_auth_scheme = (auth) => {
    state.value.auth.scheme = auth
}

function update(val) {
  console.log("updater")
  state.value.auth.scheme = val
}
</script>

<template>
    <button popovertarget="endpoint-controller">
        open create endpoint modal
    </button>
    <div
        popover="manual"
        id="endpoint-controller"
        ref="endpoint-controller"
        class="bkdrp fixed h-[100%] right-0 _w-full bg-white _max-w-screen-sm w-[70vw] p-[24px] rounded-[10px] border overflow"
    >
        <button popovertarget="endpoint-controller" class="mb-5">
            close modal
        </button>
        <button @click="_add_endpoint()" class="mb-5">finish stuff</button>

        <form
            @submit="submit_form"
            id="endpoint-form"
            class="gap-[6px] grid grid-cols-3"
        >
            <div class="col-span-3 flex flex-col _bg-black">
                <div class="grid grid-cols-[100px_1fr] gap-[4px]">
                    <div class="justify-between flex flex-col mt-3">
                        <select
                            v-model="state.method"
                            class="border-gray-300 border-2 p-2 rounded mt-1"
                            name="method"
                            id=""
                        >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                        </select>
                    </div>

                    <div class="justify-between flex flex-col mt-3">
                        <div class="grid grid-cols-[auto_1fr]">
                            <div
                                class="rounded-l pl-3 border-2 border-r-0 _bg-gray-100 mt-1 flex items-center justify-center"
                            >
                                /{{ state.module }}/
                            </div>
                            <input
                                class="border-gray-300 border-2 border-l-0 p-2 pl-0 rounded-r mt-1"
                                type="text"
                                name="url"
                                v-model="state.path"
                                autocomplete="endpoint_url"
                                id="url"
                            />
                        </div>
                    </div>
                </div>

                <div
                    class="border _border-dashed border-black rounded p-2 mt-10"
                >
                    <div class="flex flex-col">
                        <div
                            class="mb-1 flex justify-between items-center gap-[2px]"
                        >
                            Authentication Schemer
                        </div>
                        <div class="flex gap-[4px]">
                            <div class="flex flex-col-reverse">
                                <input
                                    value="none"
                                    :checked="state.auth.scheme == 'none'"
                                    type="radio"
                                    id="none_endpoint_auth_scheme"
                                    name="endpoint_auth_scheme"
                                    class="peer appearance-none rounded-full border-black"
                                />
                                <label
                                    for="none_auth_scheme"
                                    class="peer-checked:text-white peer-checked:bg-black py-1 px-5 text-sm rounded-full border-black border border-2 border-dashed"
                                    @click="update('none')"
                                >
                                    None
                                </label>
                            </div>
                            <div
                                id="endpoint-controller-auth-scheme"
                                v-for="scheme in Object.keys(AUTHENTICATION_SCHEMES)"
                                class="flex flex-col-reverse"
                                @click="update(scheme)"
                            >
                                <input
                                    :value="scheme"
                                    :checked="state.auth.scheme == scheme"
                                    type="radio"
                                    :id="scheme + '_endpoint_auth_scheme'"
                                    name="endpoint_auth_scheme"
                                    class="peer appearance-none rounded-full border-black"
                                />
                                <label
                                    :for="scheme + '_auth_scheme'"
                                    class="peer-checked:text-white peer-checked:bg-black py-1 px-5 text-sm rounded-full border-black border border-2 border-dashed"
                                >
                                    {{ scheme }} sad
                                </label>
                            </div>
                            <div class="flex flex-col-reverse">
                                <div
                                    class="py-1 px-5 text-small rounded-full border-black border border-2 border-dashed text-sm"
                                >
                                    Configure new Scheme.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        class="flex flex-col mt-3"
                        v-show="state.auth.scheme != 'none'"
                    >
                        <div
                            class="mb-1 flex justify-between items-center gap-[2px]"
                        >
                            Mode
                        </div>
                        <div class="flex gap-[4px]">
                            <div class="flex flex-col-reverse">
                                <input
                                    v-model="state.auth.mode"
                                    value="required"
                                    type="radio"
                                    id="auth_mode_required"
                                    name="auth_mode"
                                    class="peer appearance-none rounded-full border-black"
                                />
                                <label
                                    for="auth_mode_required"
                                    class="peer-checked:text-white peer-checked:bg-black py-1 px-5 text-sm rounded-full border-black border border-2 border-dashed"
                                >
                                    Required
                                </label>
                            </div>
                            <div class="flex flex-col-reverse">
                                <input
                                    v-model="state.auth.mode"
                                    value="optional"
                                    type="radio"
                                    id="auth_mode_optional"
                                    name="auth_mode"
                                    class="peer appearance-none rounded-full border-black"
                                />
                                <label
                                    for="auth_mode_optional"
                                    class="peer-checked:text-white peer-checked:bg-black py-1 text-sm px-5 rounded-full border-2 border border-black border-dashed text-black"
                                >
                                    Optional
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-[4px] mt-3">
                    <input
                        class="border-gray-300 border-2 p-2 rounded mt-1"
                        type="checkbox"
                        v-model="state.cors"
                        name="cors"
                        id="cors"
                    />
                    <label for="cors"> ENABLE cors on this Endpoints </label>
                </div>

                <div class="mt-10 border border-black rounded-lg">
                    <div class="p-2 flex items-center justify-between w-full">
                        <div>Endpoint Input</div>
                        <div>+</div>
                    </div>

                    <div class="border-2 rounded flex flex-col p-2">
                        <div
                            id="endpoint-input-list"
                            class="grid grid-cols-2 gap-[8px] border border-2 border-dashed border-black p-2"
                        >
                            <div v-for="input in state.inputs">
                                <!-- //- +endpoint-input("") -->
                                <endpoint-input-component
                                    :input="input"
                                ></endpoint-input-component>
                            </div>
                        </div>
                    </div>

                    <div
                        @click="addinput"
                        class="w-full p-3 ml-auto border-2 border-dashed border-black m-2"
                    >
                        add new input
                    </div>
                </div>

                <div class="mt-10 border border-black rounded-lg">
                    <div class="p-2 flex items-center justify-between w-full">
                        <div>Middleware Stack</div>
                        <div>+</div>
                    </div>

                    <div class="border-2 rounded flex flex-col p-2">
                        <div class="grid grid-cols-[6fr_4fr] gap-2">
                            <div
                                class="flex gap-[4px] p-2 border border-2 border-black border-dashed"
                                style="flex-wrap: wrap"
                            >
                                <div
                                    v-for="middleware in state.middlewares"
                                    class="flex flex-col-reverse h-max"
                                >
                                    <input
                                        type="radio"
                                        id="middleware.name"
                                        name="middleware_stack"
                                        class="peer appearance-none rounded-full border-black"
                                    />
                                    <label
                                        :for="middleware.name"
                                        class="peer-checked:text-white peer-checked:bg-black py-1 px-5 text-small rounded-full border-black border border-2 border-dashed"
                                    >
                                        {{ middleware.name }}
                                    </label>
                                </div>
                            </div>

                            <div
                                class="flex flex-col p-2 gap-[4px] border border-2 border-black border-dashed"
                            >
                                <div
                                    v-for="middleware in BEND.middlewares"
                                    @click="add_middleware(middleware.name)"
                                    class="w-full flex items-center justify-between _border-b p-2 py-1 text-sm"
                                >
                                    <div>{{ middleware.name }}</div>
                                    <div>+</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <blockly ref="iframe_ref"></blockly>
            </div>
        </form>
    </div>
</template>
