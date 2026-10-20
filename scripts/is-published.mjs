import { execFileSync } from 'node:child_process'

// Exit 0 if `<name>@<version>` is on the npm registry, 1 if it is not, 2 if the registry could not tell.
const [name, version] = process.argv.slice(2)

try {
  const found = execFileSync('npm', ['view', `${name}@${version}`, 'version'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
  process.exit(found === version ? 0 : 1)
} catch (error) {
  if (String(error.stderr).includes('E404')) process.exit(1)
  console.error(error.stderr || error.message)
  process.exit(2)
}
