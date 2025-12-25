#!/usr/bin/env node
/*
  Produce a per-controller tabular report comparing router-detected
  operations vs operations present in generated OpenAPI JSON.
*/

const fs = require('fs');
const path = require('path');
const glob = require('glob');

let SWAGGER_FILE = path.resolve(process.cwd(), 'public', 'openapi.json');
if (!fs.existsSync(SWAGGER_FILE)) {
  SWAGGER_FILE = path.resolve(__dirname, '..', 'public', 'openapi.json');
}

function stripComments(src) {
  src = src.replace(/\/\/.*$/gm, '');
  src = src.replace(/\/\*[\s\S]*?\*\//g, '');
  return src;
}

function countRouterOpsInFiles(patterns) {
  const ops = ['get', 'post', 'put', 'patch', 'delete'];
  const files = patterns.flatMap(p => glob.sync(p, { nodir: true }));
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
    } catch (err) {
      // ignore
    }
  }
  return perFile;
}

function loadSwagger(swaggerFile) {
  if (!fs.existsSync(swaggerFile)) {
    console.error('Error: swagger file not found at', swaggerFile);
    process.exit(2);
  }
  const swagger = JSON.parse(fs.readFileSync(swaggerFile, 'utf8'));
  return swagger;
}

function perControllerSwaggerCounts(swagger, fileKeys) {
  // Build array of swagger path strings
  const paths = swagger.paths ? Object.keys(swagger.paths) : [];
  const counts = {};
  for (const k of fileKeys) counts[k] = 0;

  for (const p of paths) {
    for (const key of fileKeys) {
      // match key as a path segment (e.g., /api/receipt or /receipt/{id})
      const esc = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp('(^|/)' + esc + '($|/|\\{|\\.)', 'i');
      if (re.test(p)) {
        // count number of ops under this path
        const ops = swagger.paths[p];
        const opCount = Object.keys(ops || {}).filter(m => ['get','post','put','patch','delete'].includes(m.toLowerCase())).length;
        counts[key] += opCount;
      }
    }
  }
  return counts;
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

function keyFromFile(file) {
  const base = path.basename(file).replace(/\.routes\.ts$|\.ts$/i, '');
  // normalize camelCase or dotted names to dash separated token
  return base.toLowerCase();
}

function makeTable(rows) {
  const header = ['Controller', 'Swagger documented', 'Router-defined', 'Diff'];
  const lines = [];
  lines.push(`| ${header.join(' | ')} |`);
  lines.push(`| ${header.map(() => '---').join(' | ')} |`);
  for (const r of rows) {
    lines.push(`| ${r.controller} | ${r.swagger} | ${r.router} | ${r.diff} |`);
  }
  return lines.join('\n');
}

function makeConsoleTable(rows) {
  const headers = ['Controller', 'Swagger', 'Router', 'Diff'];
  const numCols = headers.length;
  const termWidth = (process && process.stdout && process.stdout.columns) ? process.stdout.columns : 120;

  // compute width for numeric cols (right-aligned)
  const numericWidths = [0,0,0];
  numericWidths[0] = Math.max(headers[1].length, ...rows.map(r => String(r.swagger).length));
  numericWidths[1] = Math.max(headers[2].length, ...rows.map(r => String(r.router).length));
  numericWidths[2] = Math.max(headers[3].length, ...rows.map(r => String(r.diff).length));

  const padding = 2; // spaces around
  const numericTotal = numericWidths.reduce((a,b) => a+b, 0) + padding * numericWidths.length + (numericWidths.length - 1);

  // controller column gets remaining width
  const controllerWidth = Math.max(10, termWidth - numericTotal - 6);

  function truncate(s, n) {
    if (s.length <= n) return s;
    if (n <= 3) return s.slice(0, n);
    return s.slice(0, n - 3) + '...';
  }

  // build header
  const h0 = headers[0].padEnd(controllerWidth);
  const h1 = headers[1].padStart(numericWidths[0] + padding);
  const h2 = headers[2].padStart(numericWidths[1] + padding);
  const h3 = headers[3].padStart(numericWidths[2] + padding);

  const sep = '-'.repeat(Math.min(termWidth, controllerWidth + numericTotal + 6));
  const lines = [sep, `${h0}${h1}${h2}${h3}`, sep];

  for (const r of rows) {
    const c = truncate(r.controller, controllerWidth).padEnd(controllerWidth);
    const s = String(r.swagger).padStart(numericWidths[0] + padding);
    const ro = String(r.router).padStart(numericWidths[1] + padding);
    const d = String(r.diff).padStart(numericWidths[2] + padding);
    lines.push(`${c}${s}${ro}${d}`);
  }
  lines.push(sep);
  return lines.join('\n');
}

function main() {
  const swagger = loadSwagger(SWAGGER_FILE);

  const baseDir = path.resolve(__dirname, '..');
  const patterns = [
    path.join(baseDir, 'src', 'features', '**', 'api', '**', '*.ts'),
    path.join(baseDir, 'src', 'features', '**', 'api', '*.routes.ts'),
  ];

  const perFile = countRouterOpsInFiles(patterns);
  const files = Object.keys(perFile).sort((a,b) => perFile[b] - perFile[a]);
  const keys = files.map(keyFromFile);
  const swaggerCounts = perControllerSwaggerCounts(swagger, keys);

  const rows = files.map(f => {
    const key = keyFromFile(f);
    const controller = path.relative(path.resolve(__dirname, '..'), f);
    const router = perFile[f] || 0;
    const swaggerCount = swaggerCounts[key] || 0;
    return { controller, swagger: swaggerCount, router, diff: router - swaggerCount };
  });

  // Summary stats
  const totalRouter = rows.reduce((s, r) => s + r.router, 0);
  const totalSwagger = countSwaggerOps(swagger);
  const totalDiff = totalRouter - totalSwagger;
  const mismatches = rows.filter(r => r.diff !== 0).length;
  const topMismatches = rows.slice().sort((a,b) => Math.abs(b.diff) - Math.abs(a.diff)).slice(0, 10);

  const table = makeTable(rows);
  const header = '# Endpoint report\n\nThis report compares router-detected endpoint counts vs generated OpenAPI documentation (approx).\n\n';
  const summaryMd = [];
  summaryMd.push('## Summary');
  summaryMd.push('');
  summaryMd.push(`- **Total Swagger documented operations:** ${totalSwagger}`);
  summaryMd.push(`- **Total router-detected operations:** ${totalRouter}`);
  summaryMd.push(`- **Overall difference (router - swagger):** ${totalDiff}`);
  summaryMd.push(`- **Controllers with mismatches:** ${mismatches} / ${rows.length}`);
  summaryMd.push('');
  summaryMd.push('### Top mismatches');
  summaryMd.push('');
  summaryMd.push('| Controller | Swagger | Router | Diff |');
  summaryMd.push('| --- | ---: | ---: | ---: |');
  for (const t of topMismatches) summaryMd.push(`| ${t.controller} | ${t.swagger} | ${t.router} | ${t.diff} |`);

  const out = header + table + '\n\n' + summaryMd.join('\n') + '\n\n' + 'Notes:\n- "Controller" is the routes file path relative to repo backend.\n- "Swagger documented" is an approximation: counts swagger paths that include the controller key as a segment.\n- Use `npm run generate-swagger` and add @openapi blocks to sync documentation.\n';

  // Print an aligned console-friendly ASCII table first
  try {
    const consoleTable = makeConsoleTable(rows);
    console.log('\nPer-controller endpoint report (approx):\n');
    console.log(consoleTable);
  } catch (err) {
    // fall back to markdown if table rendering fails
    console.log('\nPer-controller endpoint report (approx):\n');
    console.log(table);
  }

  const outFile = path.resolve(path.dirname(SWAGGER_FILE), 'endpoint-report.md');
  try {
    fs.writeFileSync(outFile, out, 'utf8');
    console.log('\nWrote report to:', outFile);
  } catch (err) {
    console.error('Failed to write report file:', err);
  }

  // Print a compact console summary
  console.log('\nSummary:');
  console.log(`  Total Swagger documented operations: ${totalSwagger}`);
  console.log(`  Total router-detected operations:   ${totalRouter}`);
  console.log(`  Overall difference (router - swagger): ${totalDiff}`);
  console.log(`  Controllers with mismatches: ${mismatches} / ${rows.length}`);
  console.log('\nTop mismatches:');
  for (const t of topMismatches.slice(0, 10)) {
    console.log(`  ${t.controller}  -> swagger: ${t.swagger}, router: ${t.router}, diff: ${t.diff}`);
  }
}

try {
  main();
} catch (err) {
  console.error('Report generation failed:', err);
  process.exit(4);
}
