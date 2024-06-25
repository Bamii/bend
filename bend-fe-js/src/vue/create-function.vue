<script setup>
const props = defineProps({
  type: { type: String, default: "function" }
})
let id = "create-function-"+Date.now()
</script>

<template>
    <button popovertarget=id>open create {{ props.type }} modal</button>
    <div
        popover="manual"
        id=id
        ref=id
        class="bkdrp fixed h-[100%] right-0 _w-full bg-white _max-w-screen-sm w-[70vw] p-[24px] rounded-[10px] border overflow"
    >
        <button popovertarget=id class="mb-5">
            close modal
        </button>
        <button @click="addendpoint" class="mb-5">finish stuff</button>

        <form
            @submit="submit_form"
            id="endpoint-form"
            class="gap-[6px] grid grid-cols-3"
        >
           <blockly></blockly> 
        </form>
    </div>
</template>

