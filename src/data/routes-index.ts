import fs from "node:fs";

export default (function () {
  return fs
    .readdirSync(__dirname)
    .filter((file) => file != "index.ts")
    .flatMap((file) => require(`./${file}/${file}.controller.mjs`).default);
})();
