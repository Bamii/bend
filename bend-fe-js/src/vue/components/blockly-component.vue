<script setup>
/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blockly Vue Component.
 * @author dcoodien@gmail.com (Dylan Coodien)
 */

import { onMounted, ref, shallowRef } from "vue";
import * as Blockly from "blockly/core";
import * as En from "blockly/msg/en";
import "blockly/blocks";
import { blocks } from "../../blocks/text";
import { functions } from "../../blocks/functions";
import { forBlock } from "../../generators/javascript";
import { javascriptGenerator, Order } from "blockly/javascript";
// import { save, load } from "../../core/serialization";
import { toolbox } from "../../utils/toolbox";
import { loadbend } from "../../core/loadbend";
import { useBlocklyStore } from "../../state/bend";
import { DisableTopBlocks } from "@blockly/disable-top-blocks";
import {
    blocks as procedureBlocks,
    unregisterProcedureBlocks,
} from "@blockly/block-shareable-procedures";
import { capitalize } from "../../utils/utils";

const loader = loadbend();

const plgns_toolbox = Object.keys(loader.plugins).map((e) => ({
    kind: "category",
    name: e,
    categoryStyle: e + "_category",
    contents: []
    // contents: loader.plugins[e].map((c) => {
    //     forBlock[`${c.name}_${e}`] = function (block, generator) {
    //         const text = c.comments?.arguments.map((e) => {
    //             return generator.valueToCode(
    //                 block,
    //                 e.name.toUpperCase(),
    //                 Order.FUNCTION_CALL
    //             );
    //         });

    //         // Generate the function call for this block.
    //         const code = `${e}.${c.name}(${text?.join(",") ?? ""});\n`;
    //         return code;
    //     };

    //     return {
    //         kind: "block",
    //         type: `${c.name}_${e}`,
    //     };
    // }),
}));

const plgns_register = Object.values(loader.plugins)
    .flat()
    .map((plugin) => {
        const opts =
            plugin.comments?.arguments
                .map((arg, index) => {
                    let type = arg.type?.toLowerCase();
                    if (type) type = capitalize(type);

                    return {
                        [`args${index + 1}`]: [
                            {
                                type: "input_value",
                                name: arg.name.toUpperCase(),
                                check: type,
                            },
                        ],
                        [`message${index + 1}`]: `${arg.description} %1`,
                    };
                })
                .reduce((acc, curr) => ({ ...acc, ...curr }), {}) ?? {};

        const output = plugin.comments?.return.type
            ? capitalize(plugin.comments?.return.type)
            : null;

        return {
            type: plugin.name + "_" + plugin.module,
            message0: `${plugin.name} (${plugin.comments?.description ?? ""})`,
            args0: [],
            ...opts,
            output,
            previousStatement: null,
            nextStatement: null,
            colour: 160,
            tooltip: "",
            helpUrl: "",
        };
    });

const blocklyToolbox = ref();
const blocklyDiv = ref();
const codeDiv = ref();
const workspace = shallowRef();
const { save_blockly_state, load_blockly_state } = useBlocklyStore();

defineExpose({ workspace });

onMounted(() => {
    Blockly.setLocale(En);

    unregisterProcedureBlocks();
    Blockly.common.defineBlocks(procedureBlocks);
    Blockly.common.defineBlocks(blocks);
    Blockly.common.defineBlocks(
        Blockly.common.createBlockDefinitionsFromJsonArray(plgns_register)
    );
    Object.assign(javascriptGenerator.forBlock, forBlock);
    workspace.value = Blockly.inject(blocklyDiv.value, {
        toolbox: {
            ...toolbox,
            contents: [...toolbox.contents, ...plgns_toolbox],
        },
        // renderer: "thrasos",
    });

    const runCode = () => {
        // console.log(workspace.value.getProcedureMap())
        // console.log(Blockly.getMainWorkspace().getAllBlocks())
        const code = javascriptGenerator.workspaceToCode(workspace.value);
        codeDiv.value.innerText = code;

        // outputDiv.innerHTML = '';
        // eval(code);
    };

    // Load the initial state from storage and run the code.
    load_blockly_state(workspace.value);
    // runCode();
    workspace.value.addChangeListener(Blockly.Events.disableOrphans);

    // The plugin must be initialized before it has any effect.
    const disableTopBlocksPlugin = new DisableTopBlocks();
    disableTopBlocksPlugin.init();

    // Every time the workspace changes state, save the changes to storage.
    workspace.value.addChangeListener((e) => {
        // UI events are things like scrolling, zooming, etc.
        // No need to save after one of these.
        if (e.isUiEvent) return;
        save_blockly_state(workspace.value);
    });

    // Whenever the workspace changes meaningfully, run the code again.
    workspace.value.addChangeListener((e) => {
        // Don't run the code when the workspace finishes loading; we're
        // already running it once when the application starts.
        // Don't run the code during drags; we might have invalid state.
        if (
            e.isUiEvent ||
            e.type == Blockly.Events.FINISHED_LOADING ||
            workspace.value.isDragging()
        ) {
            return;
        }
        runCode();
    });

    // workspace.value.registerToolboxCategoryCallback(
    //     "MY_PROCEDURES",
    //     function (workspace) {
    //         const blockList = [];
    //         blockList.push({
    //             kind: "block",
    //             type: "my_procedure_call",
    //         });
    //         return blockList;
    //     }
    // );
});
</script>

<template>
    <div id="blockly" class="mt-10 border border-black rounded-lg">
        <div class="p-2 flex items-center justify-between w-full">
            <div>Endpoint Logic</div>
            <button @click="getmycode" class="py-3 px-10">click</button>
        </div>

        <div class="border-2 rounded p-2">
            <div class="_h-[50vh] w-full relative">
                <div id="pageContainer">
                    <div ref="blocklyDiv" id="blocklyDiv" class="blocklyDiv"></div>
                    <div id="outputPane">
                        <pre ref="codeDiv" id="generatedCode"><code></code></pre>
                        <!-- <div id="output"></div> -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* .blocklyDiv {
    height: 100%;
    width: 100%;
    text-align: left;
} */
#pageContainer {
  display: flex;
  flex-direction: row;
  width: 100%;
  max-width: 100vw;
  height: 40vh;
}
 #blockly {
  all: revert;
 }
.blocklyDiv {
    flex-basis: 100%;
    height: 100%;
    width: 600px;
}

#outputPane {
    display: flex;
    flex-direction: column;
    width: 400px;
    flex: 0 0 400px;
    overflow: auto;
    margin: 1rem;
}

#generatedCode {
    height: 50%;
    background-color: rgb(247, 240, 228);
}

#output {
    height: 50%;
}
</style>
