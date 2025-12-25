const fs = require('fs');
const yaml = require('yaml');
const glob = require('glob');
const files = glob.sync('backend/src/**/**/*.ts');
let bad = [];
let empties = [];
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  const regex = /\/\*[\s\S]*?\*\//g;
  let m;
  while ((m = regex.exec(s))) {
    const block = m[0];
    if (block.includes('@openapi') || block.includes('@swagger')) {
      const lines = block.split('\n').map(l => l.replace(/^\s*\*\s?\/?/, '')).filter(Boolean);
      const idx = lines.findIndex(l => l.trim().startsWith('@openapi') || l.trim().startsWith('@swagger'));
      const content = lines.slice(idx + 1).join('\n');
      if (!content.trim()) {
        empties.push({ file: f, snippet: block.split('\n').slice(0, 6).join('\n') });
        continue;
      }
      try {
        yaml.parseDocument(content);
      } catch (e) {
        bad.push({ file: f, error: e.message, snippet: content.split('\n').slice(0, 40).join('\n') });
      }
    }
  }
}
if (empties.length) {
  console.log('Empty @openapi/@swagger blocks found:', empties.length);
  empties.forEach(e => console.log('\nFILE:', e.file, '\n', e.snippet));
}

if (bad.length) {
  console.log('Found issues in', bad.length, 'blocks');
  bad.forEach(b => {
    console.log('\nFILE:', b.file);
    console.log('ERR:', b.error);
    console.log('SNIPPET:\n', b.snippet);
  });
  process.exit(1);
} else if (!empties.length) {
  console.log('No parsing errors found');
}
