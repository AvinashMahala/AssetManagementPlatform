#!/usr/bin/env node
/*
  Validate that number of controller-defined endpoints roughly matches number
  of documented operations in generated OpenAPI JSON (`public/openapi.json`).

  Strategy:
  - Count documented operations in openapi.json (get/post/put/patch/delete)
  - Count router.<verb>( occurrences across feature API route files:
      src/features/**/api/**/*.ts and src/features/**/api/*.routes.ts
  - Compare totals and fail if mismatched. This keeps docs and code in sync.

  Limitations:
  - Works best if routes are defined with `router.get/post/put/patch/delete`.
  - Nested/mounted routers are counted where declared, not at server mount-time.
  - This is a build-time heuristic to catch regressions early.
*/

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const SWAGGER_FILE = path.resolve(process.cwd(), 'public', 'openapi.json');

function countSwaggerOps(swagger) {
  const ops = ['get', 'post', 'put', 'patch', 'delete'];
  let count = 0;
  if (!swagger.paths) return 0;
  for (const p of Object.values(swagger.paths)) {
    for (const k of Object.keys(p)) {
      if (ops.includes(k.toLowerCase())) count++;
    }
  }
  return count;
}

function stripComments(src) {
  // remove // comments
  src = src.replace(/\/\/.*$/gm, '');
  // remove /* */ comments
  src = src.replace(/\/\*[\s\S]*?\*\//g, '');
  return src;
}

function countRouterOpsInFiles(patterns) {
  const ops = ['get', 'post', 'put', 'patch', 'delete'];
  const files = patterns.flatMap(p => glob.sync(p, { nodir: true }));
  let total = 0;
  const perFile = {};
  for (const file of files) {
    try {
      const raw = fs.readFileSync(file, 'utf8');
      const src = stripComments(raw);
      let fileCount = 0;
      for (const op of ops) {
        const re = new RegExp('\\.\\s*' + op + '\\s*\\(', 'g');
        const matches = src.match(re);
        fileCount += matches ? matches.length : 0;
      }
      perFile[file] = fileCount;
      total += fileCount;
    } catch (err) {
      // ignore
    }
  }
  return { total, perFile, files };
}

async function main() {
  if (!fs.existsSync(SWAGGER_FILE)) {
    console.error('Error: swagger file not found at', SWAGGER_FILE);
    process.exit(2);
  }

  const swagger = JSON.parse(fs.readFileSync(SWAGGER_FILE, 'utf8'));
  const swaggerCount = countSwaggerOps(swagger);

  const patterns = [
    'src/features/**/api/**/*.ts',
    'src/features/**/api/*.routes.ts',
  ];

  const { total: routeCount, perFile } = countRouterOpsInFiles(patterns);

  console.log(`Swagger documented operations: ${swaggerCount}`);
  console.log(`Router-defined operations (approx): ${routeCount}`);

  if (swaggerCount !== routeCount) {
    console.error('\nMismatch detected: controller routes and Swagger docs differ.');
    console.error('Suggestion: run `npm run generate-swagger` and add/update @openapi blocks in');
    console.error('the corresponding files under `src/shared/config/swagger/apis/` to keep them in sync.');
    console.error('\nTop files by detected route counts:');
    const sortedFiles = Object.entries(perFile).sort((a, b) => b[1] - a[1]).slice(0, 20);
    for (const [file, c] of sortedFiles) {
      if (c > 0) console.error(`  ${c}	${file}`);
    }
    process.exit(3);
  }

  console.log('\nOK: documented operations match detected router operations.');
}

main().catch(err => {
  console.error('Validation script failed:', err);
  process.exit(4);
});
