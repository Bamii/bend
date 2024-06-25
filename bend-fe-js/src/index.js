/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import { blocks } from './blocks/text';
import { functions } from './blocks/functions';
import { forBlock } from './generators/javascript';
import { javascriptGenerator } from 'blockly/javascript';
import { save, load } from './serialization';
import { toolbox } from './toolbox';
import { loadbend } from './loadbend';
import { blocks as procedureBlocks, unregisterProcedureBlocks } from '@blockly/block-shareable-procedures';
// import './index.css?url';

// Register the blocks and generator with Blockly
const loader = loadbend()

console.log(loader.plugins)
const plgns_toolbox = Object.keys(loader.plugins).map(e => (
  {
    kind: "category",
    name: e,
    categoryStyle: e + "_category",
    contents: loader.plugins[e].map(c => {
      forBlock[`${c.name}_${e}`] = function (block, generator) {
        const text = "''";

        const addText = generator.provideFunction_(
          'addText',
          `function ${generator.FUNCTION_NAME_PLACEHOLDER_}(text) {
            // Add text to the output area.
            const outputDiv = document.getElementById('output');
            const textEl = document.createElement('p');
            textEl.innerText = text;
            outputDiv.appendChild(textEl);
          }`,
        );
        // Generate the function call for this block.
        const code = `${addText}(${text});\n`;
        return code;
      };

      return ({
        kind: "block",
        type: `${c.name}_${e}`
      })
    })
  }
))

const plgns_register = Object.values(loader.plugins).flat()
  .map((tool) => {
    // console.log(tool)
    return {
      type: tool.name + "_" + tool.module,
      message0: `${tool.module}.${tool.name}`,
      args0: [],
      previousStatement: null,
      nextStatement: null,
      colour: 160,
      tooltip: '',
      helpUrl: '',
    }
  })

console.log("adfafafasdf", plgns_register)
unregisterProcedureBlocks();
Blockly.common.defineBlocks(procedureBlocks);
Blockly.common.defineBlocks(blocks);
Blockly.common.defineBlocks(Blockly.common.createBlockDefinitionsFromJsonArray(plgns_register));
Object.assign(javascriptGenerator.forBlock, forBlock);

// Set up UI elements and inject Blockly
// const outputDiv = document.getElementById('output');
const codeDiv = document.getElementById('generatedCode').firstChild;
const blocklyDiv = document.getElementById('blocklyDiv');


const ws = Blockly.inject(blocklyDiv, {
  toolbox: {
    ...toolbox,
    contents: [
      ...toolbox.contents,
      ...plgns_toolbox
    ]
  },
  renderer: 'thrasos'
});
console.log(ws)

// This function resets the code and output divs, shows the
// generated code from the workspace, and evals the code.
// In a real application, you probably shouldn't use `eval`.
const runCode = () => {
  console.log(ws.getProcedureMap())
  const code = javascriptGenerator.workspaceToCode(ws);
  // console.log(Blockly.getMainWorkspace().getAllBlocks())
  codeDiv.innerText = code;

  // outputDiv.innerHTML = '';

  // eval(code);
};

// Load the initial state from storage and run the code.
load(ws);
runCode();

// Every time the workspace changes state, save the changes to storage.
ws.addChangeListener((e) => {
  // UI events are things like scrolling, zooming, etc.
  // No need to save after one of these.
  if (e.isUiEvent) return;
  save(ws);
});

// Whenever the workspace changes meaningfully, run the code again.
ws.addChangeListener((e) => {
  // Don't run the code when the workspace finishes loading; we're
  // already running it once when the application starts.
  // Don't run the code during drags; we might have invalid state.
  if (
    e.isUiEvent ||
    e.type == Blockly.Events.FINISHED_LOADING ||
    ws.isDragging()
  ) {
    return;
  }
  runCode();
});


ws.registerToolboxCategoryCallback('MY_PROCEDURES', function (workspace) {
  const blockList = [];
  blockList.push({
    'kind': 'block',
    'type': 'my_procedure_call',
  });
  // for (const model of ws.getProcedureMap().getProcedures()) {
  //   blockList.push({
  //     'kind': 'block',
  //     'type': 'my_procedure_call',
  //     'extraState': {
  //       'procedureId': model.getId(),
  //     },
  //   });
  // }
  return blockList;
});

functions()