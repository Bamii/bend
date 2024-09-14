<script setup>
import { reactive, ref } from "vue"
import { useBendStore } from "../state/bend";

const authh = reactive({ scheme: "none", mode: "" })
const AUTHENTICATION_SCHEMES = {
  jwt: {
    options: {
      audience: "",
      iss: "",
      name: ""
    }
  },
  google: {
    clientId: "",
    clientSecret: "",
  },
  twitter: {
    clientId: "",
    clientSecret: "",
    password: ""
  }
}

function update(val) {
  console.log(val)
  authh.scheme = val
}
</script>

<template>
    <button popovertarget="auth-controller">open create auth modal</button>
    <div
        popover="manual"
        id="auth-controller"
        ref="auth-controller"
        class="bkdrp fixed h-[100%] right-0 _w-full bg-white _max-w-screen-sm w-[70vw] p-[24px] rounded-[10px] border overflow"
    >
        <button popovertarget="auth-controller" class="mb-5">
            close modal
        </button>
        <button @click="addendpoint" class="mb-5">finish stuff</button>

        <form
            @submit="submit_form"
            id="endpoint-form"
            class="gap-[6px] grid grid-cols-3"
        >
            <div class="col-span-3 flex flex-col _bg-black">
                <div
                    class="border _border-dashed border-black rounded p-2 mt-10"
                >
                    <div class="flex flex-col">
                        <div
                            class="mb-1 flex justify-between items-center gap-[2px]"
                        >
                            Authentication Scheme
                        </div>
                        <div class="flex gap-[4px]">
                            <div class="flex flex-col-reverse">
                                <input
                                    :checked="authh.scheme == 'none'"
                                    value="none"
                                    type="radio"
                                    id="none_auth_scheme"
                                    name="auth_scheme"
                                    class="peer appearance-none rounded-full border-black"
                                />
                                <label
                                    for="none_auth_scheme_controller"
                                    @click="update('none')"
                                    class="peer-checked:text-white peer-checked:bg-black py-1 px-5 text-sm rounded-full border-black border border-2 border-dashed"
                                >
                                    None
                                </label>
                            </div>
                            <div
                                id="auth-controller-scheme"
                                v-for="scheme in Object.keys(AUTHENTICATION_SCHEMES)"
                                class="flex flex-col-reverse"
                                @click="update(scheme)"
                            >
                                <input
                                    type="radio"
                                    :checked="authh.scheme == scheme"
                                    :id="scheme + '_auth_scheme_controller'"
                                    name="auth_scheme_controller"
                                    class="peer appearance-none rounded-full border-black"
                                />
                                <label
                                    :for="scheme + '_auth_scheme'"
                                    class="peer-checked:text-white peer-checked:bg-black py-1 px-5 text-sm rounded-full border-black border border-2 border-dashed"
                                >
                                    {{ scheme }}
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
                        v-show="authh.scheme != 'none'"
                    >sdafkjadklfjlakdf</div>
                </div>
                
                <blockly name="authentication" class="h-[90vh]"></blockly>
            </div>
        </form>
    </div>
</template>
