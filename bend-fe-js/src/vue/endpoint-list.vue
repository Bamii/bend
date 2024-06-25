<script setup>
import { useBendStore } from "../state/bend";
const { modules } = useBendStore();
const endpoints = modules[0].endpoints;
console.log(modules);
</script>

<template>
    <h3>endpoint list.</h3>
    <div class="flexflex-col">
        <div v-for="endpoint in endpoints" class="w-full">
            <div>{{ JSON.stringify(endpoint) }}</div>
        </div>
    </div>
</template>
