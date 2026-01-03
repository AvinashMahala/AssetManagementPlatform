#!/usr/bin/env -S npx tsx
import fs from 'fs';
import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import options from '../src/shared/config/swagger/options.js';

async function main() {
  try {
    const spec = swaggerJSDoc(options as any);
    const out = path.resolve(process.cwd(), 'public', 'openapi.json');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(spec, null, 2), 'utf8');
    // also output pretty YAML for easier diffing if desired
    console.log(`✅ OpenAPI spec written to ${out}`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to generate OpenAPI spec:', err);
    process.exit(2);
  }
}

main();
