import * as Blockly from 'blockly';
import {blocks} from '../blocks/text';
import { functions } from '../blocks/functions';
import {forBlock} from '../generators/javascript';
import {javascriptGenerator} from 'blockly/javascript';
import {save, load_state} from './serialization';
import {toolbox} from '../utils/toolbox';
import {blocks as procedureBlocks, unregisterProcedureBlocks} from '@blockly/block-shareable-procedures';
// import './index.css?url';

// Register the blocks and generator with Blockly
export default function initialise({ plugins }) {
  unregisterProcedureBlocks();
  toolbox = { ...toolbox }
  console.log("plugins:- ", plugins)
  
  Blockly.common.defineBlocks(procedureBlocks);
  Blockly.common.defineBlocks(blocks);
  Object.assign(javascriptGenerator.forBlock, forBlock);
  
  // Set up UI elements and inject Blockly
  // const outputDiv = document.getElementById('output');
  const codeDiv = document.getElementById('generatedCode').firstChild;
  const blocklyDiv = document.getElementById('blocklyDiv');
  
  
  const ws = Blockly.inject(blocklyDiv, {
    toolbox,
    renderer: 'thrasos'
  });
  
  // This function resets the code and output divs, shows the
  // generated code from the workspace, and evals the code.
  // In a real application, you probably shouldn't use `eval`.
  const runCode = () => {
    console.log(ws.getProcedureMap())
    const code = javascriptGenerator.workspaceToCode(ws);
    // console.log(ws)
    // console.log(Blockly.getMainWorkspace().getAllBlocks())
    codeDiv.innerText = code;
  
    // outputDiv.innerHTML = '';
  
    // eval(code);
  };
  
  // Load the initial state from storage and run the code.
  load_state(ws);
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
  
  
  ws.registerToolboxCategoryCallback('MY_PROCEDURES', function(workspace) {
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
}