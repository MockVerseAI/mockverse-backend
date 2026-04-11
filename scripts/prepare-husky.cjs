const { existsSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const { join } = require('node:path');

const root = join(__dirname, '..');
const huskyBin = join(root, 'node_modules', 'husky', 'bin.js');
if (!existsSync(huskyBin)) {
  process.exit(0);
}
const result = spawnSync(process.execPath, [huskyBin], {
  stdio: 'inherit',
  cwd: root,
});
process.exit(result.status ?? 0);
