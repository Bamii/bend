// import { walk } from "./utils";
import * as acorn from "acorn"
import * as walk from "acorn-walk"
import * as parser from "@babel/parser"
import traverse from "@babel/traverse"
import * as jsdoc from "comment-parser"
import fs from "node:fs"
import fsp from "node:fs/promises"

async function doplugins() {
  const root = "C:/Users/ACER-PC/Documents/work/bend/src/data/plugins"
  const plugins = fs.readdirSync(root)
  // console.log(plugins)
  const _tree = await Promise.allSettled(plugins.map(e => fsp.readFile(root + "/" + e + "/function.mjs")))
  const tree = _tree.map(e => e.value).map(e => e?.toString())

  // const plugin_map = new Map();
  const plugin_map = {}
  for (let i = 0; i < plugins.length; i++) {
    let leaf = tree[i]
    let origin = plugins[i]

    const myexports = []
    if (leaf) {
      const parsed = parser.parse(leaf, { sourceType: "module" })
      traverse.default(parsed, {
        ExportDefaultDeclaration(node) {
          // console.log(node.node)
          const comment = commenter(node)
          myexports.push([node.node, comment])
        },
        ExportNamedDeclaration(node) {
          // console.log(node.node)
          const comment = commenter(node)
          myexports.push([node.node, comment])
        }
      })
    }

    const xxt = myexports.flatMap(e => e[1])


    const plugin_tree = myexports
      .map(e => ([e[0].declaration, e[1]]))
      .flatMap(e => ([e[0]?.declarations, e[1]]))

      .map(([e, c]) => {
        console.log(e,c)

        return ({
          name: e?.id.name ?? "default",
          module: origin,
          arguments: []
        })
      })

    // console.log(plugin_tree[0])

    // plugin_map.set(origin, plugin_tree)
    plugin_map[origin] = plugin_tree
  }

  fs.writeFileSync("./data.json", JSON.stringify(plugin_map))
}

function commenter(node) {
  const comment = node.node.leadingComments?.find(e => e.type == "CommentBlock")

  if (comment) {
    const ct = `/*${comment.value.trim()} */`
    ct.replace("\r", "")
    console.log(ct)
    console.log()

    const description = jsdoc.parse(ct)
    console.log(description)
    return description
  } else {
    return null
  }
}

doplugins();