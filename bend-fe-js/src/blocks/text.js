/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

// Create a custom block called 'add_text' that adds
// text to the output div on the sample app.
// This is just an example and you should replace this with your
// own custom blocks.
const addText = {
  type: 'add_text',
  message0: 'why Add text %1',
  args0: [
    {
      type: 'input_value',
      name: 'TEXT',
      check: 'String',
    },
  ],
  previousStatement: null,
  nextStatement: null,
  colour: 160,
  tooltip: '',
  helpUrl: '',
};

// Create the block definitions for the JSON-only blocks.
// This does not register their definitions with Blockly.
// This file has no side effects!
export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([
  addText,
  // {
  //   type: 'some_object',
  //   message0: '{ %1 }',
  //   args0: [
  //   {
  //     type: 'input_value',
  //     name: 'TEXT',
  //     check: 'String',
  //   },
  //   ],
  //   output: null,
  //   colour: 230,
  // },
  {
    type: 'jhghjmember',
    message0: 'somethig is this { %1 }',
    args0: [
      {
        type: 'input_value',
        name: 'TEXT',
        check: 'String',
      },
    ],
    output: "Number",
    previousStatement: null,
    nextStatement: null,
    colour: 230,
  tooltip: '',
  helpUrl: '',
  },
]);
