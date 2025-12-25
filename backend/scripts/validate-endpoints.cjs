#!/usr/bin/env node
/*
  Validate that number of controller-defined endpoints roughly matches number
  of documented operations in generated OpenAPI JSON (`public/openapi.json`).
*/

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Support running from repo root or backend folder
let SWAGGER_FILE = path.resolve(process.cwd(), 'public', 'openapi.json');
if (!fs.existsSync(SWAGGER_FILE)) {
  // Fallback to backend package relative path
  SWAGGER_FILE = path.resolve(__dirname, '..', 'public', 'openapi.json');
}

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
  src = src.replace(/\/\/.*$/gm, '');
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

function main() {
  if (!fs.existsSync(SWAGGER_FILE)) {
    console.error('Error: swagger file not found at', SWAGGER_FILE);
    process.exit(2);
  }

  const swagger = JSON.parse(fs.readFileSync(SWAGGER_FILE, 'utf8'));
  const swaggerCount = countSwaggerOps(swagger);

  const baseDir = path.resolve(__dirname, '..');
  const patterns = [
    path.join(baseDir, 'src', 'features', '**', 'api', '**', '*.ts'),
    path.join(baseDir, 'src', 'features', '**', 'api', '*.routes.ts'),
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
      if (c > 0) console.error(`  ${c}\t${file}`);
    }
    process.exit(3);
  }

  console.log('\nOK: documented operations match detected router operations.');
}

try {
  main();
} catch (err) {
  console.error('Validation script failed:', err);
  process.exit(4);
}
