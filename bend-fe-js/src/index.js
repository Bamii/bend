import * as Blockly from 'blockly';
import { blocks as textBlocks } from './blocks/text';
// import { functions } from './blocks/functions';
import { forBlock } from './generators/javascript';
import { javascriptGenerator, Order } from 'blockly/javascript';
import { save, load_state, storageKey, final_result } from './core/serialization';
import { toolbox } from './utils/toolbox';
import { loadbend } from './core/loadbend';
import { DisableTopBlocks } from '@blockly/disable-top-blocks';
import { blocks as procedureBlocks, unregisterProcedureBlocks } from '@blockly/block-shareable-procedures';
import { capitalize } from './utils/utils';
import { TypedVariablesToolbox } from '../../toolbox_typed_variable/src';
// import initUnocssRuntime from '@unocss/runtime'

// initUnocssRuntime({ /* options */ })

document.addEventListener("DOMContentLoaded", () => {
  const search = new URLSearchParams(window.location.search);
  let name = search.get("name")
  if (!name) return;

  let port, ws;
  const loader = loadbend()

  function reset_state(trdpartyplugins = {}, reset = false) {
    ws?.dispose();

    const plgns_toolbox = Object.keys(loader.plugins)
      .map(e => ({
        kind: "category",
        name: e,
        categoryStyle: e + "_category",
        contents: loader.plugins[e].variables.map(c => {
          // console.log(`${c.name}_${e}`)
          forBlock[`custom_${c.name}_${e}`] = function (block, generator) {
            const text = (c.comments?.arguments ?? c.arguments).map(e => {
              return generator.valueToCode(block, e.name.toUpperCase(), Order.FUNCTION_CALL)
            })

            // Generate the function call for this block.
            const code = `${e}.${c.name}(${text?.join(",") ?? ""});\n`;
            return code;
          };

          return ({
            kind: "block",
            type: `custom_${c.name}_${e}`,
          })
        })
      }))

    const plgns_register = Object.values(loader.plugins).map(e => e.variables).flat()
      .map((plugin) => {
        const opts = (plugin.comments?.arguments ?? plugin.arguments)
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
          type: "custom_" + plugin.name + "_" + plugin.module,
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

    const trdpartyplugins_toolbox = Object.keys(trdpartyplugins)
      .map(e => ({
        kind: "category",
        name: e,
        categoryStyle: e + "_category",
        contents: trdpartyplugins[e].variables.map(c => {
          // console.log(`${c.name}_${e}`)
          forBlock[`custom_${c.name}_${e}`] = function (block, generator) {
            const text = (c.comments?.arguments ?? c.arguments).map(e => {
              return generator.valueToCode(block, e.name.toUpperCase(), Order.FUNCTION_CALL)
            })

            // Generate the function call for this block.
            const code = `${e}.${c.name}(${text?.join(",") ?? ""});\n`;
            return code;
          };

          return ({
            kind: "block",
            type: `custom_${c.name}_${e}`,
          })
        })
      }))

    const trdpartyplugins_register = Object.values(trdpartyplugins).map(e => e.variables).flat()
      .map((plugin) => {
        const opts = (plugin.comments?.arguments ?? plugin.arguments)
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
          type: "custom_" + plugin.name + "_" + plugin.module,
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
    Blockly.common.defineBlocks(textBlocks);
    Blockly.common.defineBlocks(procedureBlocks);
    Blockly.common.defineBlocks(Blockly.common.createBlockDefinitionsFromJsonArray(plgns_register));
    Blockly.common.defineBlocks(Blockly.common.createBlockDefinitionsFromJsonArray(trdpartyplugins_register));
    Object.assign(javascriptGenerator.forBlock, forBlock);

    ws = Blockly.inject(
      document.getElementById('blocklyDiv'),
      {
        toolbox: {
          ...toolbox,
          contents: [
            ...toolbox.contents,
            {
              name: "Plugins",
              kind: "category",
              contents: plgns_toolbox
            },
            {
              name: "User functions",
              kind: "category",
              contents: trdpartyplugins_toolbox
            },
          ]
        },
        renderer: 'thrasos',
        // horizontalLayout: true,
        // toolboxPosition: "end"
      }
    );
    if (reset) ws?.clear();

    const createFlyout = function (workspace) {
      let xmlList = [];
      // Add your button and give it a callback name.
      const button = document.createElement('button');
      button.setAttribute('text', 'Create Typed Variable');

      button.setAttribute('callbackKey', 'callbackName');

      xmlList.push(button);

      // This gets all the variables that the user creates and adds them to the
      // flyout.
      const blockList = Blockly.VariablesDynamic.flyoutCategoryBlocks(workspace);
      xmlList = xmlList.concat(blockList);
      return xmlList;
    };

    ws.registerToolboxCategoryCallback(
      'CREATE_TYPED_VARIABLE',
      createFlyout,
    );

    const typedVarModal = new TypedVariablesToolbox(ws, 'callbackName', [
      ['PENGUIN', 'Penguin'],
      ['GIRAFFE', 'Giraffe'],
    ]);
    typedVarModal.init();
    // Load the initial state from storage and run the code.
    load_state(ws, name, reset);
    console.log("blockly-state", JSON.parse(localStorage.getItem("blockly-state")))

    // The plugin must be initialized before it has any effect.
    const disableTopBlocksPlugin = new DisableTopBlocks();
    disableTopBlocksPlugin.init();

    // -------------------------------------------
    // listeners ---------------------------------
    ws.addChangeListener(Blockly.Events.disableOrphans);

    // Every time the workspace changes state, save the changes to storage.
    ws.addChangeListener((e) => {
      if (e.isUiEvent) return;

      let imports = [], function_arguments = [], function_return = null;
      const blk = ws.getTopBlocks().find(e => e.isEnabled())

      if (blk && blk.isProcedureDef()) {
        const imports_arr = blk.getDescendants()
          .map(e => e.type)
          .filter(e => e.startsWith("custom"))
          .map(e => e.split("_")[2])

        // debugger
        imports = [...new Set(imports_arr).values()]
          .map(e => ({ type: "module", module: e }))

        console.log(blk)
        function_arguments = blk.getVars();
        function_return = blk.type == "procedures_defnoreturn"
          ? null
          : {

          };
        console.log(imports)
      }

      port?.postMessage(
        save(name, {
          fn: javascriptGenerator.workspaceToCode(ws), ws,
          imports, arguments: function_arguments, return: function_return
        })
      );
    });
  }

  reset_state({
    custom: {
      origin: "custom",
      variables: []
    }
  });


  // message listeners for the channel.
  window.addEventListener("message", function onMessage(e) {
    if (!e.ports.length) return;

    port = e.ports[0]

    port.postMessage(
      JSON.parse(localStorage.getItem(storageKey)?? "{}")[name] ?? final_result
    )

    port.onmessage = function (e) {
      switch (e.data.type) {
        case "reset":
          // ws.clear();
          console.log("RESETTING")

          const logg = save("defaulter", {
            fn: javascriptGenerator.workspaceToCode(ws), ws,
            imports: [], arguments: [], return: null
          })

          reset_state({
            custom: {
              origin: "custom",
              variables: [
                {
                  "module": "custom",
                  "name": "function_name",
                  "arguments": [
                    { "name": "server", "type": "Identifier", "vars": [] },
                  ],
                  "comments": null
                }
              ]
            }
          }, true)
          break;

        case "update":
          load_state(ws, e.data.message)
          break;

        case "add_function":
          reset_state({
            custom: {
              origin: "custom",
              variables: [
                {
                  "module": "custom",
                  "name": "function_name",
                  "arguments": [
                    { "name": "server", "type": "Identifier", "vars": [] },
                  ],
                  "comments": null
                }
              ]
            }
          })
          break;

        default:
          break;
      }
    }
  });
})
