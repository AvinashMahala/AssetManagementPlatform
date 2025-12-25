import { Pool } from 'pg';
import { ReceiptTemplateInput, ReceiptTemplateType } from '../src/features/finance/receipt-template/core/receipt-template.types';
import * as crypto from 'crypto';

// Predefined receipt templates
const PREDEFINED_TEMPLATES: Omit<ReceiptTemplateInput, 'isActive' | 'isDefault' | 'sortOrder'>[] = [
  {
    name: 'Basic Template',
    type: ReceiptTemplateType.BASIC,
    description: 'Simple and clean receipt template for basic needs',
    defaultSettings: {
      theme: {
        primaryColor: '#2563eb',
        secondaryColor: '#64748b',
        fontFamily: 'Arial, sans-serif',
        fontSize: 'medium'
      },
      layout: {
        showLogo: false,
        logoPosition: 'top-left',
        showWatermark: false,
        paperSize: 'a4',
        orientation: 'portrait'
      },
      content: {
        showPropertyAddress: true,
        showTenantAddress: true,
        showPaymentBreakdown: true,
        showBalanceForward: true,
        showTermsAndConditions: false,
        showSignature: true,
        signatureText: 'Landlord Signature'
      },
      paymentOptions: {
        showBankDetails: true,
        showUPI: true,
        showQRCode: false,
        showWallets: false
      },
      numbering: {
        prefix: 'REC',
        startNumber: 1,
        includeYear: true,
        includeMonth: true
      }
    }
  },
  {
    name: 'Professional Template',
    type: ReceiptTemplateType.PROFESSIONAL,
    description: 'Professional template with enhanced styling and features',
    defaultSettings: {
      theme: {
        primaryColor: '#1e40af',
        secondaryColor: '#374151',
        fontFamily: 'Georgia, serif',
        fontSize: 'medium'
      },
      layout: {
        showLogo: true,
        logoPosition: 'top-center',
        showWatermark: true,
        watermarkText: 'OFFICIAL RECEIPT',
        paperSize: 'a4',
        orientation: 'portrait'
      },
      content: {
        showPropertyAddress: true,
        showTenantAddress: true,
        showPaymentBreakdown: true,
        showBalanceForward: true,
        showTermsAndConditions: true,
        termsAndConditionsText: 'This receipt is computer generated and does not require signature.',
        showSignature: true,
        signatureText: 'Authorized Signatory'
      },
      paymentOptions: {
        showBankDetails: true,
        showUPI: true,
        showQRCode: true,
        showWallets: true
      },
      numbering: {
        prefix: 'RNT',
        startNumber: 1,
        includeYear: true,
        includeMonth: true
      }
    }
  },
  {
    name: 'Premium Template',
    type: ReceiptTemplateType.PREMIUM,
    description: 'Premium template with advanced features and elegant design',
    defaultSettings: {
      theme: {
        primaryColor: '#7c3aed',
        secondaryColor: '#1f2937',
        fontFamily: 'Times New Roman, serif',
        fontSize: 'large'
      },
      layout: {
        showLogo: true,
        logoPosition: 'top-center',
        showWatermark: true,
        watermarkText: 'CONFIDENTIAL',
        paperSize: 'a4',
        orientation: 'portrait'
      },
      content: {
        showPropertyAddress: true,
        showTenantAddress: true,
        showPaymentBreakdown: true,
        showBalanceForward: true,
        showTermsAndConditions: true,
        termsAndConditionsText: 'This is an official receipt. All payments are subject to verification. For any queries, please contact the property management office.',
        showSignature: true,
        signatureText: 'Property Manager'
      },
      paymentOptions: {
        showBankDetails: true,
        showUPI: true,
        showQRCode: true,
        showWallets: true
      },
      numbering: {
        prefix: 'PMR',
        startNumber: 1,
        includeYear: true,
        includeMonth: true
      }
    }
  }
];

async function seedReceiptTemplates() {
  console.log('🌱 Seeding receipt templates...');

  try {
    // Initialize database connection
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'asset_platform_main',
      user: process.env.DB_USER || 'user',
      password: process.env.DB_PASSWORD || 'pass',
    });

    // Check if templates already exist
    const existingResult = await pool.query('SELECT COUNT(*) as count FROM receipt_templates');
    const existingCount = parseInt(existingResult.rows[0].count);

    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing templates. Skipping seeding.`);
      await pool.end();
      return;
    }

    // Seed templates directly
    let createdCount = 0;
    let defaultSet = false;

    for (let i = 0; i < PREDEFINED_TEMPLATES.length; i++) {
      const templateData = PREDEFINED_TEMPLATES[i];

      const templateInput = {
        ...templateData,
        isActive: true,
        isDefault: !defaultSet, // Set first template as default
        sortOrder: i + 1
      };

      try {
        await pool.query(
          `INSERT INTO receipt_templates (id, name, type, description, default_settings, is_active, is_default, sort_order, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            crypto.randomUUID(),
            templateInput.name,
            templateInput.type,
            templateInput.description,
            JSON.stringify(templateInput.defaultSettings),
            templateInput.isActive,
            templateInput.isDefault,
            templateInput.sortOrder,
            new Date(),
            new Date()
          ]
        );
        createdCount++;

        if (!defaultSet) {
          console.log(`✅ Created default template: ${templateData.name}`);
          defaultSet = true;
        } else {
          console.log(`✅ Created template: ${templateData.name}`);
        }
      } catch (error) {
        console.error(`❌ Failed to create template ${templateData.name}:`, error);
      }
    }

    console.log(`\n🎉 Successfully seeded ${createdCount} receipt templates!`);

    // Close database connection
    await pool.end();

  } catch (error) {
    console.error('❌ Error seeding receipt templates:', error);
    process.exit(1);
  }
}

// Run the seeding function
if (import.meta.url === `file://${process.argv[1]}`) {
  seedReceiptTemplates()
    .then(() => {
      console.log('✅ Receipt template seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Receipt template seeding failed:', error);
      process.exit(1);
    });
}

export { seedReceiptTemplates };