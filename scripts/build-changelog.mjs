// Writes the changelog.d fragments into CHANGELOG.md as the section of the version in package.json.
import { execFileSync } from "node:child_process"
import { readFileSync, writeFileSync } from "node:fs"

const { version } = JSON.parse(readFileSync("package.json", "utf8"))
execFileSync("uvx", ["towncrier", "build", "--yes", "--version", version], { stdio: "inherit" })

// Towncrier leaves two blank lines before the previous release section; the file keeps one.
const changelog = readFileSync("CHANGELOG.md", "utf8")
writeFileSync("CHANGELOG.md", changelog.replace(/\n{3,}(?=## \[)/g, "\n\n"))
