// const generator = require("@babel/generator")
import generator from "@babel/generator"
import fs from "node:fs/promises"

(async function() {
  console.log(generator(
 {
        "type": "FunctionDeclaration",
        "start": 1,
        "end": 32,
        "loc": {
          "start": {
            "line": 2,
            "column": 0,
            "index": 1
          },
          "end": {
            "line": 4,
            "column": 1,
            "index": 32
          }
        },
        "id": {
          "type": "Identifier",
          "start": 10,
          "end": 13,
          "loc": {
            "start": {
              "line": 2,
              "column": 9,
              "index": 10
            },
            "end": {
              "line": 2,
              "column": 12,
              "index": 13
            },
            "identifierName": "mec"
          },
          "name": "mec"
        },
        "generator": false,
        "async": false,
        "params": [
          {
            "type": "Identifier",
            "start": 14,
            "end": 15,
            "loc": {
              "start": {
                "line": 2,
                "column": 13,
                "index": 14
              },
              "end": {
                "line": 2,
                "column": 14,
                "index": 15
              },
              "identifierName": "n"
            },
            "name": "n"
          }
        ],
        "body": {
          "type": "BlockStatement",
          "start": 17,
          "end": 32,
          "loc": {
            "start": {
              "line": 2,
              "column": 16,
              "index": 17
            },
            "end": {
              "line": 4,
              "column": 1,
              "index": 32
            }
          },
          "body": [
            {
              "type": "ReturnStatement",
              "start": 21,
              "end": 30,
              "loc": {
                "start": {
                  "line": 3,
                  "column": 2,
                  "index": 21
                },
                "end": {
                  "line": 3,
                  "column": 11,
                  "index": 30
                }
              },
              "argument": {
                "type": "Identifier",
                "start": 28,
                "end": 29,
                "loc": {
                  "start": {
                    "line": 3,
                    "column": 9,
                    "index": 28
                  },
                  "end": {
                    "line": 3,
                    "column": 10,
                    "index": 29
                  },
                  "identifierName": "n"
                },
                "name": "n"
              }
            }
          ],
          "directives": []
        }
      }
  ).code)
})() 

async function dos() {
  //const project = await projectSchema.create({ name: "", user_id: "" });

  const files = [
    "bendast.json", "{}",
    "functions.json",
    "functions.js"
  ]

  storage.send(filename, "")

  for(let filename of files) {
    const file = await fs.appendFile(filename, "{}")
    
  }
}

dos()