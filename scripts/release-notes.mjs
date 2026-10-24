// Prints the CHANGELOG.md section of a version, to use as GitHub release notes.
import { readFileSync } from "node:fs"

const version = process.argv[2]
if (!version) {
  console.error("Usage: pnpm release-notes <version>")
  process.exit(1)
}

const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
// Both heading forms: `## 0.4.0 - date` and `## [0.6.0] - date`
const heading = new RegExp(`^## \\[?${escaped}\\]?( - |$)`)
const lines = readFileSync(new URL("../CHANGELOG.md", import.meta.url), "utf8").split("\n")

const start = lines.findIndex((line) => heading.test(line))
if (start === -1) {
  console.error(`No section for ${version} in CHANGELOG.md`)
  process.exit(1)
}
let end = lines.findIndex((line, index) => index > start && line.startsWith("## "))
if (end === -1) end = lines.length

// The last section is followed by the `[x.y.z]: …` link references of the whole file
const section = lines.slice(start + 1, end).filter((line) => !/^\[[^\]]+\]: /.test(line))
console.log(section.join("\n").trim())
