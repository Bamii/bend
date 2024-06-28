import * as Blockly from 'blockly';
import { blocks } from './blocks/text';
import { functions } from './blocks/functions';
import { forBlock } from './generators/javascript';
import { javascriptGenerator, Order } from 'blockly/javascript';
import { save, load } from './serialization';
import { toolbox } from './toolbox';
import { loadbend } from './loadbend';
import { DisableTopBlocks } from '@blockly/disable-top-blocks';
import { blocks as procedureBlocks, unregisterProcedureBlocks } from '@blockly/block-shareable-procedures';
import { capitalize } from './utils';


const loader = loadbend()

const plgns_toolbox = Object.keys(loader.plugins)
  .map(e => ({
    kind: "category",
    name: e,
    categoryStyle: e + "_category",
    contents: loader.plugins[e].map(c => {
      forBlock[`${c.name}_${e}`] = function (block, generator) {
        const text = c.comments?.arguments.map(e => {
          return generator.valueToCode(block, e.name.toUpperCase(), Order.FUNCTION_CALL)
        })

        // Generate the function call for this block.
        const code = `${e}.${c.name}(${text?.join(",") ?? ""});\n`;
        return code;
      };

      return ({
        kind: "block",
        type: `${c.name}_${e}`,
      })
    })
  }))

const plgns_register = Object.values(loader.plugins).flat()
  .map((plugin) => {
    const opts = plugin.comments?.arguments
      .map((arg, index) => {
        let type = arg.type?.toLowerCase();
        if (type)
          type = capitalize(type)

        return {
          [`args${index + 1}`]: [
            {
              "type": "input_value",
              "name": arg.name.toUpperCase(),
              "check": type
            }
          ],
          [`message${index + 1}`]: `${arg.description} %1`,
        }
      }).reduce((acc, curr) => ({ ...acc, ...curr }), {}) ?? {}

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
      tooltip: '',
      helpUrl: '',
    }
  })

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


const type = new URLSearchParams(window.location.search).get("type")
const block = ws.newBlock('procedures_defnoreturn')


if (type == "function") {
  // set the variables to be empty.
  // and editable
} else if (type == "middleware") {
  // set the varibales to be the shape of the req, res, objects.
}

// This function resets the code and output divs, shows the
// generated code from the workspace, and evals the code.
// In a real application, you probably shouldn't use `eval`.
const runCode = () => {
  // console.log(ws.getProcedureMap())
  const code = javascriptGenerator.workspaceToCode(ws);
  // console.log(Blockly.getMainWorkspace().getAllBlocks())
  codeDiv.innerText = code;

  // outputDiv.innerHTML = '';
  // eval(code);
};

// Load the initial state from storage and run the code.
load(ws);
runCode();
ws.addChangeListener(Blockly.Events.disableOrphans);

// The plugin must be initialized before it has any effect.
const disableTopBlocksPlugin = new DisableTopBlocks();
disableTopBlocksPlugin.init();

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

// const output = document.querySelector(".output");
window.addEventListener("message", onMessage);

let port;
function onMessage(e) {
  if (!e.ports.length) return;

  console.log(e)
  console.log(e.data)
  // Use the transferred port to post a message to the main frame
  
  port = e.ports[0]
  e.ports[0].onmessage = function messager(e) {
    console.log(e)
    e.ports[0].postMessage(`Message received by IFrame: "${e.data}"`);
  }

  e.ports[0].postMessage("A message from the iframe in page2.html");
}

