// import { walk } from "./utils";
import * as acorn from "acorn"
import * as walk from "acorn-walk"
import * as babelparser from "@babel/parser"
import traverse from "@babel/traverse"
import * as jsdoc from "comment-parser"
import typescriptparser from "@typescript-eslint/typescript-estree"
import fs from "node:fs"
import fsp from "node:fs/promises"

async function doplugins() {
  const root = "C:/Users/ACER-PC/Documents/work/bend-files/bend/src/data/plugins"
  const plugins = fs.readdirSync(root)
  const packages = (await Promise.allSettled(plugins.map(plugin => fsp.readFile(root+"/"+plugin+"/package.json"))))
    .map(e => e.value).map(e => JSON.parse(e?.toString() ?? "{}"))

  const _tree = await Promise.allSettled(plugins.map(async plugin => {
    return (await Promise.allSettled(
      ['functions.ts', "functions.mjs", "functions.js", 'function.ts', "function.mjs", "function.js"]
        .map(e => fsp.readFile(root + "/" + plugin + "/" + e))
    )).find(e => e.status == "fulfilled").value
  }))
  const tree = _tree.map(e => e.value).map(e => e?.toString())

  // const plugin_map = new Map();
  const plugin_map = {}
  for (let i = 0; i < plugins.length; i++) {
    let leaf = tree[i]
    let origin = plugins[i]
    let map;

    const myexports = []
    if (leaf) {
      const parsed = babelparser.parse(leaf, { sourceType: "module", plugins: ["typescript"] })
      // pax = parsed

      // get all the variables in a map 
      map = new Map(
        parsed.program.body
          .filter(e => !e.type.includes("Import") && !e.type.includes("Export"))
          .map(e => !e.id ? e.declarations : e)
          .flat()
          .map(e => ([e.id.name, e]))
      )

      traverse.default(parsed, {
        ExportDefaultDeclaration(node) {
          const comment = commenter(node)
          myexports.push(node)
        },
        ExportNamedDeclaration(node) {
          const specs = node.node.specifiers
          const comment = commenter(node)
          myexports.push(node)
        }
      })
    }

    const variables = []
    for (let node of myexports) {
      if (node.node.type == "ExportDefaultDeclaration") {
        const curr_node = node.node.declaration;

        if (curr_node.type == "Identifier") {
          const xx = map.get(curr_node.name)

          if (xx) {
            variables.push({
              module: origin,
              name: 'default',
              arguments: curr_node.node.params.map((e, i) => ({
                name: 'param' + i,
                type: e.type,
                vars: []
              })),
              comments: commenter(xx.leadingComments)
            })
          }
        } else if (curr_node.type == "FunctionDeclaration") {
          variables.push({
            module: origin,
            name: 'default',
            arguments: curr_node.params.map((e, i) => ({
              name: e.name ?? 'param' + i,
              type: e.type,
              vars: []
            })),
            comments: commenter(node.node.leadingComments)
          })
        }
      } else if (node.node.type == "ExportNamedDeclaration") {
        const curr_node = node.node.declaration;

        if (curr_node) {
          if (curr_node.type == "VariableDeclaration") {
            for (let spec of curr_node.declarations) {
              if (spec.init.type.includes("Function")) {
                variables.push({
                  module: origin,
                  name: spec.id.name,
                  arguments: spec.init.params.map((e, i) => ({
                    name: e.name ?? 'param' + i,
                    type: e.type,
                    vars: []
                  })),
                  comments: commenter(node.node.leadingComments)
                })
              }
            }
          } else if (curr_node.type == "FunctionDeclaration") {
            variables.push({
              module: origin,
              name: curr_node.id.name,
              arguments: curr_node.params.map((e, i) => ({
                name: e.name ?? 'param' + i,
                type: e.type,
                vars: []
              })),
              comments: commenter(node.node.leadingComments)
            })
          }
        } else if (node.node.specifiers) {
          for (let spec of node.node.specifiers) {
            const nd = map.get(spec.local.name)

            if (nd) {
              variables.push({
                module: origin,
                name: spec.exported.name,
                arguments: nd.params.map((e, i) => ({
                  name: e.name ?? 'param' + i,
                  type: e.type,
                  vars: []
                })),
                comments: commenter(nd.leadingComments)
              })
            }
          }
        }
      }
    }

    const pkg = packages[i];
    plugin_map[origin] = {
      origin, variables,
      type: pkg.bend ?? "function",
    }
  }

  fs.writeFileSync("./data.json", JSON.stringify(plugin_map))
}

function commenter(comments) {
  const comment = comments?.find(e => e.type == "CommentBlock")
  if (!comment)
    return null

  const ct = `/*${comment.value.trim()}*/`
  ct.replace("\r", "")

  const [{ description, tags }] = jsdoc.parse(ct)

  const args = tags
    .filter(e => e.tag == "param" || e.tag == "arg" || e.tag == "argument")
    .map(({ source: _, problems: __, ...e }) => (e))

  const { source: __, problems: _, ...returns } = tags
    .find(e => e.tag.includes("return"))

  return {
    description,
    return: returns,
    arguments: args,
  }
}

doplugins();