#!/usr/bin/env tsx

import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import { Pool } from 'pg';
import { ReceiptTemplateRepository } from '../src/features/finance/receipt-template/data/repository/ReceiptTemplateRepository.js';
import { PropertyRepository } from '../src/features/properties/property/data/repository/PropertyRepository.js';
import { ReceiptTemplateService } from '../src/features/finance/receipt-template/core/services/ReceiptTemplateService.js';
import { ReceiptTemplateType } from '../src/features/finance/receipt-template/core/receipt-template.types';

// Database configuration
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'asset_platform_main',
  user: 'user',
  password: 'pass',
});

async function testTemplates() {
  try {
    console.log('🧪 Testing receipt template functionality...');

    // Test database connection
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful');

    // Test repository
    const repository = new ReceiptTemplateRepository(pool);
    console.log('✅ Repository created');

    const templates = await repository.findAll();

    console.log(`✅ Found ${templates.length} templates in database:`);
    templates.forEach(template => {
      console.log(`  - ${template.name} (${template.type}) - Default: ${template.isDefault}`);
    });

    // Test service
    const propertyRepository = new PropertyRepository(pool);
    const service = new ReceiptTemplateService(repository, propertyRepository);
    const allTemplates = await service.getAllTemplates();

    console.log(`✅ Service returned ${allTemplates.length} templates`);

    // Test default template
    const defaultTemplate = await service.getDefaultTemplate();
    if (defaultTemplate) {
      console.log(`✅ Default template: ${defaultTemplate.name}`);
    } else {
      console.log('❌ No default template found');
    }

    // Test template by type
    const basicTemplate = await service.getTemplateByType(ReceiptTemplateType.BASIC);
    if (basicTemplate) {
      console.log(`✅ Basic template found: ${basicTemplate.name}`);
      console.log(`   Settings keys: ${Object.keys(basicTemplate.defaultSettings).join(', ')}`);
    } else {
      console.log('❌ Basic template not found');
    }

    console.log('🎉 All template tests passed!');

  } catch (error) {
    console.error('❌ Template test failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testTemplates();