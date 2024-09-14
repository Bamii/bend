/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

export const storageKey = 'blockly-state';

/**
 * Saves the state of the workspace to browser's local storage.
 * @param {string} name Blockly workspace to save.
 * @param {Blockly.Workspace} workspace Blockly workspace to save.
 */
export const save = function (name, { ws, fn, imports, arguments: _arguments, return: _return }) {
  debugger
  let data = JSON.parse(window.localStorage?.getItem(storageKey) ?? "{}");
  const wss = Blockly.serialization.workspaces.save(ws);
  let final_result = {
    fn, imports,
    ws: wss,
    arguments: _arguments, return: _return
  }

  data[name] = final_result
  window.localStorage?.setItem(storageKey, JSON.stringify(data));

  console.log(data)
  return final_result;
};
  const defaulter = {
    "blocks": {
      "languageVersion": 0,
      "blocks": [
        {
          "type": "procedures_defnoreturn",
          "id": "0;5Qp*n|4%Uz/a1x]AtE",
          "x": 53,
          "y": 90,
          "extraState": {
            "procedureId": "{m4Qk%5BELa.bH=C?ekz"
          },
          "icons": {
            "comment": {
              "text": "Describe this function...",
              "pinned": false,
              "height": 80,
              "width": 160
            }
          },
          "fields": {
            "NAME": "do something"
          }
        }
      ]
    }
  }

  export const final_result = {
    fn: "function dosomething() {}", imports: [],
    ws: defaulter,
    arguments: [], return: null
  }
/**
 * Loads saved state from local storage into the given workspace.
 * @param {Blockly.Workspace} workspace Blockly workspace to load into.
 */
export const load_state = function (workspace, name, reset = false) {
  let data = window.localStorage?.getItem(storageKey);
  if (!data) return;

  data = JSON.parse(data);

  if (reset || !data[name]?.ws) {
    Blockly.Events.disable();
    Blockly.serialization.workspaces.load(defaulter, workspace, false);
    data[name] = final_result;
    Blockly.Events.enable();
    localStorage.setItem(storageKey, JSON.stringify(data))
    return;
    // workspace.clear()
  }

  Blockly.Events.disable();
  Blockly.serialization.workspaces.load(data[name].ws, workspace, false);
  Blockly.Events.enable();
};
