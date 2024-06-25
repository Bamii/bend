<script setup>

function getmycode() {

}
</script>

<template>
                <div class="mt-10 border border-black rounded-lg">
                    <div class="p-2 flex items-center justify-between w-full">
                        <div>
                            Endpoint Logic
                        </div>
                        <button @click="getmycode" class="py-3 px-10">click</button>
                    </div>

                    <div class="border-2 rounded p-2">
                        <div class="h-[50vh] w-full relative">
                            <iframe
                                class="h-[100vh] w-full _mt-5"
                                src="./index.pug"
                                id="iframe-code"
                                ref="iframe_code"
                            ></iframe>
                        </div>
                    </div>
                </div>
</template>