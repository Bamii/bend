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
  const root = "C:/Users/ACER-PC/Documents/work/bend/src/data/plugins"
  const plugins = fs.readdirSync(root)
  // console.log(plugins)
  const _tree = await Promise.allSettled(plugins.map(e => fsp.readFile(root + "/" + e + "/function.ts")))
  const tree = _tree.map(e => e.value).map(e => e?.toString())

  // const plugin_map = new Map();
  const plugin_map = {}
  for (let i = 0; i < plugins.length; i++) {
    let leaf = tree[i]
    let origin = plugins[i]
    let pax;

    const myexports = []
    if (leaf) {
      const parsed = babelparser.parse(leaf, { sourceType: "module", plugins: ["typescript"] })
      pax = parsed

      // get all the variables in a map 
      let map = new Map(
        parsed.program.body
          .filter(e => !e.type.includes("Import") && !e.type.includes("Export"))
          .map(e => {
            if(e.declarations) {
              return e.declarations.map(declaration => ({ declaration: declaration, base: e }))
            } else {
              return { declaration: e, base: e }
            }
          
          })
          .flat()
          .map(({ declaration, base }) => ([declaration.id.name, base]))
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

    // const xxt = myexports.flatMap(e => e[1])


    let plugin_tree = myexports
      .map(e => (e.specifiers))
      .flat()


      plugin_tree = plugin_tree
      .map(e => (e.exported))

      plugin_tree = plugin_tree
      .map((e) => {

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