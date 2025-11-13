import { Pool } from 'pg';

export const initializeTables = async (pool: Pool) => {
  try {
    // Tenants table
    await pool.query(`CREATE TABLE IF NOT EXISTS tenants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20) NOT NULL,
      alternate_phone VARCHAR(20),
      date_of_birth DATE,
      gender VARCHAR(10),
      occupation VARCHAR(100),
      company_name VARCHAR(255),
      monthly_income DECIMAL(12,2),
      current_address_street VARCHAR(255) NOT NULL,
      current_address_city VARCHAR(100) NOT NULL,
      current_address_state VARCHAR(100) NOT NULL,
      current_address_pincode VARCHAR(10) NOT NULL,
      permanent_address_street VARCHAR(255) NOT NULL,
      permanent_address_city VARCHAR(100) NOT NULL,
      permanent_address_state VARCHAR(100) NOT NULL,
      permanent_address_pincode VARCHAR(10) NOT NULL,
      emergency_contact_name VARCHAR(255) NOT NULL,
      emergency_contact_relationship VARCHAR(100) NOT NULL,
      emergency_contact_phone VARCHAR(20) NOT NULL,
      status VARCHAR(50) DEFAULT 'active',
      total_rentals INTEGER DEFAULT 0,
      current_property_id UUID,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('Tenants table ready');

    // Tenant documents table
    await pool.query(`CREATE TABLE IF NOT EXISTS tenant_documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      document_type VARCHAR(50) NOT NULL,
      document_number VARCHAR(100),
      file_url TEXT NOT NULL,
      verified BOOLEAN DEFAULT FALSE,
      verified_at TIMESTAMP,
      verified_by UUID REFERENCES users(id),
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('Tenant documents table ready');

    // Users table
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      role VARCHAR(50) DEFAULT 'user',
      is_email_verified BOOLEAN DEFAULT FALSE,
      is_phone_verified BOOLEAN DEFAULT FALSE,
      email_verification_token VARCHAR(255),
      email_verification_expires TIMESTAMP,
      password_reset_token VARCHAR(255),
      password_reset_expires TIMESTAMP,
      google_id VARCHAR(255) UNIQUE,
      profile_picture TEXT,
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('Users table ready');

    // Phone verification codes table
    await pool.query(`CREATE TABLE IF NOT EXISTS phone_verification_codes (
      phone VARCHAR(20) PRIMARY KEY,
      code VARCHAR(10) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('Phone verification codes table ready');

    // Password reset methods table
    await pool.query(`CREATE TABLE IF NOT EXISTS password_reset_methods (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      method_type VARCHAR(50) NOT NULL,
      is_enabled BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, method_type)
    )`);
    console.log('Password reset methods table ready');

    // Security questions table
    await pool.query(`CREATE TABLE IF NOT EXISTS security_questions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      question VARCHAR(500) NOT NULL,
      answer_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('Security questions table ready');

    // Recovery codes table
    await pool.query(`CREATE TABLE IF NOT EXISTS recovery_codes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code_hash VARCHAR(255) NOT NULL,
      is_used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      used_at TIMESTAMP
    )`);
    console.log('Recovery codes table ready');

  // Properties table
  pool.query(`CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    property_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    address_street VARCHAR(255) NOT NULL,
    address_city VARCHAR(100) NOT NULL,
    address_state VARCHAR(100) NOT NULL,
    address_pincode VARCHAR(10) NOT NULL,
    address_landmark VARCHAR(255),
    area DECIMAL(10,2),
    total_floors INTEGER,
    year_built INTEGER,
    parking_spaces INTEGER,
    amenities JSONB DEFAULT '[]'::jsonb,
    photos JSONB DEFAULT '[]'::jsonb,
    owner_id UUID NOT NULL REFERENCES users(id),
    co_owners JSONB DEFAULT '[]'::jsonb,
    template_id UUID,
    template_overrides JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating properties table', err);
    } else {
      console.log('Properties table ready');
    }
  });

  // Add template columns to properties table if they don't exist
  pool.query(`DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'template_id') THEN
      ALTER TABLE properties ADD COLUMN template_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'template_overrides') THEN
      ALTER TABLE properties ADD COLUMN template_overrides JSONB DEFAULT '{}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'receipt_settings') THEN
      ALTER TABLE properties ADD COLUMN receipt_settings JSONB DEFAULT '{}'::jsonb;
    END IF;
  END $$;`, (err) => {
    if (err) {
      console.error('Error adding template columns to properties table', err);
    }
  });

  // Receipt templates table
  pool.query(`CREATE TABLE IF NOT EXISTS receipt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('basic', 'professional', 'premium')),
    description TEXT,
    default_settings JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_default BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating receipt_templates table', err);
    } else {
      console.log('Receipt templates table ready');
    }
  });

  // Add foreign key constraint for template_id in properties
  pool.query(`DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_properties_template_id') THEN
      ALTER TABLE properties ADD CONSTRAINT fk_properties_template_id FOREIGN KEY (template_id) REFERENCES receipt_templates(id) ON DELETE SET NULL;
    END IF;
  END $$;`, (err) => {
    if (err) {
      console.error('Error adding template_id foreign key', err);
    }
  });

  // Seed predefined receipt templates
  pool.query(`
    INSERT INTO receipt_templates (name, type, description, default_settings, is_active, is_default, sort_order)
    SELECT * FROM (VALUES
      ('Basic Template'::VARCHAR(100), 'basic'::VARCHAR(20), 'Simple and clean receipt template for basic needs'::TEXT,
       '{"theme":{"primaryColor":"#2563eb","secondaryColor":"#64748b","fontFamily":"Arial, sans-serif","fontSize":"medium"},"layout":{"showLogo":false,"logoPosition":"top-left","showWatermark":false,"paperSize":"a4","orientation":"portrait"},"content":{"showPropertyAddress":true,"showTenantAddress":true,"showPaymentBreakdown":true,"showBalanceForward":true,"showTermsAndConditions":false,"showSignature":true,"signatureText":"Landlord Signature"},"paymentOptions":{"showBankDetails":true,"showUPI":true,"showQRCode":false,"showWallets":false},"numbering":{"prefix":"REC","startNumber":1,"includeYear":true,"includeMonth":true}}'::jsonb,
       true, true, 1),
      ('Professional Template'::VARCHAR(100), 'professional'::VARCHAR(20), 'Professional template with enhanced styling and features'::TEXT,
       '{"theme":{"primaryColor":"#1e40af","secondaryColor":"#374151","fontFamily":"Georgia, serif","fontSize":"medium"},"layout":{"showLogo":true,"logoPosition":"top-center","showWatermark":true,"watermarkText":"OFFICIAL RECEIPT","paperSize":"a4","orientation":"portrait"},"content":{"showPropertyAddress":true,"showTenantAddress":true,"showPaymentBreakdown":true,"showBalanceForward":true,"showTermsAndConditions":true,"termsAndConditionsText":"This receipt is computer generated and does not require signature.","showSignature":true,"signatureText":"Authorized Signatory"},"paymentOptions":{"showBankDetails":true,"showUPI":true,"showQRCode":true,"showWallets":true},"numbering":{"prefix":"RNT","startNumber":1,"includeYear":true,"includeMonth":true}}'::jsonb,
       true, false, 2),
      ('Premium Template'::VARCHAR(100), 'premium'::VARCHAR(20), 'Premium template with advanced features and elegant design'::TEXT,
       '{"theme":{"primaryColor":"#7c3aed","secondaryColor":"#1f2937","fontFamily":"Times New Roman, serif","fontSize":"large"},"layout":{"showLogo":true,"logoPosition":"top-center","showWatermark":true,"watermarkText":"CONFIDENTIAL","paperSize":"a4","orientation":"portrait"},"content":{"showPropertyAddress":true,"showTenantAddress":true,"showPaymentBreakdown":true,"showBalanceForward":true,"showTermsAndConditions":true,"termsAndConditionsText":"This is an official receipt. All payments are subject to verification. For any queries, please contact the property management office.","showSignature":true,"signatureText":"Property Manager"},"paymentOptions":{"showBankDetails":true,"showUPI":true,"showQRCode":true,"showWallets":true},"numbering":{"prefix":"PMR","startNumber":1,"includeYear":true,"includeMonth":true}}'::jsonb,
       true, false, 3)
    ) AS v(name, type, description, default_settings, is_active, is_default, sort_order)
    WHERE NOT EXISTS (SELECT 1 FROM receipt_templates WHERE type = v.type)
  `, (err) => {
    if (err) {
      console.error('Error seeding receipt templates', err);
    } else {
      console.log('Receipt templates seeded');
    }
  });
  pool.query(`CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    unit_number VARCHAR(50) NOT NULL,
    unit_name VARCHAR(255),
    description TEXT,
    unit_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'available',
    floor INTEGER,
    area DECIMAL(10,2) NOT NULL,
    bedrooms INTEGER,
    bathrooms INTEGER,
    balconies INTEGER,
    furnished BOOLEAN DEFAULT FALSE,
    max_occupants INTEGER DEFAULT 1,
    unit_amenities JSONB DEFAULT '[]'::jsonb,
    unit_photos JSONB DEFAULT '[]'::jsonb,
    monthly_rent DECIMAL(12,2) NOT NULL,
    security_deposit DECIMAL(12,2) NOT NULL,
    maintenance_charges DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, unit_number)
  )`, (err) => {
    if (err) {
      console.error('Error creating units table', err);
    } else {
      console.log('Units table ready');
    }
  });

  // Unit tenants table
  pool.query(`CREATE TABLE IF NOT EXISTS unit_tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    is_primary_tenant BOOLEAN DEFAULT FALSE,
    move_in_date DATE,
    move_out_date DATE,
    monthly_rent_share DECIMAL(12,2),
    security_deposit_share DECIMAL(12,2),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(unit_id, tenant_id)
  )`, (err) => {
    if (err) {
      console.error('Error creating unit_tenants table', err);
    } else {
      console.log('Unit tenants table ready');
    }
  });

  // Leases table
  pool.query(`CREATE TABLE IF NOT EXISTS leases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id),
    unit_id UUID NOT NULL REFERENCES units(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    notice_period_days INTEGER DEFAULT 30,
    auto_renewal BOOLEAN DEFAULT FALSE,
    monthly_rent DECIMAL(12,2) NOT NULL,
    security_deposit DECIMAL(12,2) NOT NULL,
    maintenance_charges DECIMAL(10,2),
    payment_frequency VARCHAR(20) DEFAULT 'monthly',
    rent_due_day INTEGER DEFAULT 1,
    electricity_charges DECIMAL(10,2),
    water_charges DECIMAL(10,2),
    other_charges DECIMAL(10,2),
    pets_allowed BOOLEAN DEFAULT FALSE,
    smoking_allowed BOOLEAN DEFAULT FALSE,
    subletting_allowed BOOLEAN DEFAULT FALSE,
    special_conditions TEXT,
    status VARCHAR(50) DEFAULT 'active',
    signed_at TIMESTAMP,
    terminated_at TIMESTAMP,
    termination_reason TEXT,
    lease_document_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating leases table', err);
    } else {
      console.log('Leases table ready');
    }
  });

  // Rent payments table
  pool.query(`CREATE TABLE IF NOT EXISTS rent_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id UUID NOT NULL REFERENCES leases(id),
    property_id UUID NOT NULL REFERENCES properties(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    amount DECIMAL(12,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    payment_reference VARCHAR(255),
    late_fee DECIMAL(10,2),
    penalty_amount DECIMAL(10,2),
    rent_amount DECIMAL(12,2),
    maintenance_charges DECIMAL(10,2),
    other_charges DECIMAL(10,2),
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating rent_payments table', err);
    } else {
      console.log('Rent payments table ready');
    }
  });

  // Rent transactions table (comprehensive rent collection)
  pool.query(`CREATE TABLE IF NOT EXISTS rent_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES units(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    property_id UUID NOT NULL REFERENCES properties(id),
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    billing_method VARCHAR(20) NOT NULL DEFAULT 'relative' CHECK (billing_method IN ('relative', 'fixed')),
    days_count INTEGER NOT NULL,
    base_rent DECIMAL(12,2) NOT NULL DEFAULT 0,
    previous_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    expenses JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
    new_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    paid_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'paid', 'cancelled')),
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    payment_reference VARCHAR(255),
    late_fee DECIMAL(10,2) DEFAULT 0,
    penalty_amount DECIMAL(10,2) DEFAULT 0,
    receipt_number VARCHAR(100),
    receipt_generated BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating rent_transactions table', err);
    } else {
      console.log('Rent transactions table ready');
    }
  });

  // Meters table (utility meter management)
  pool.query(`CREATE TABLE IF NOT EXISTS meters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    meter_type VARCHAR(20) NOT NULL CHECK (meter_type IN ('electricity', 'water', 'gas')),
    meter_name VARCHAR(100) NOT NULL,
    meter_number VARCHAR(50),
    cost_per_unit DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (cost_per_unit >= 0),
    fixed_charge DECIMAL(10,2) DEFAULT 0 CHECK (fixed_charge >= 0),
    remarks TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating meters table', err);
    } else {
      console.log('Meters table ready');
    }
  });

  // Meter readings table (monthly utility readings)
  pool.query(`CREATE TABLE IF NOT EXISTS meter_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meter_id UUID NOT NULL REFERENCES meters(id) ON DELETE CASCADE,
    reading_date DATE NOT NULL,
    previous_reading DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (previous_reading >= 0),
    current_reading DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (current_reading >= 0),
    units_consumed DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (units_consumed >= 0),
    total_cost DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (total_cost >= 0),
    meter_photo_url TEXT,
    rent_transaction_id UUID,
    recorded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_readings CHECK (current_reading >= previous_reading)
  )`, (err) => {
    if (err) {
      console.error('Error creating meter_readings table', err);
    } else {
      console.log('Meter readings table ready');
    }
  });

  // Create indexes for better performance
  pool.query(`CREATE INDEX IF NOT EXISTS idx_meters_unit_id ON meters(unit_id)`, (err) => {
    if (err) console.error('Error creating meters unit index', err);
  });

  pool.query(`CREATE INDEX IF NOT EXISTS idx_meters_property_id ON meters(property_id)`, (err) => {
    if (err) console.error('Error creating meters property index', err);
  });

  pool.query(`CREATE INDEX IF NOT EXISTS idx_meter_readings_meter_id ON meter_readings(meter_id)`, (err) => {
    if (err) console.error('Error creating meter readings meter index', err);
  });

  pool.query(`CREATE INDEX IF NOT EXISTS idx_meter_readings_reading_date ON meter_readings(reading_date)`, (err) => {
    if (err) console.error('Error creating meter readings date index', err);
  });

  // Receipts table
  pool.query(`CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number VARCHAR(100) NOT NULL UNIQUE,
    property_id UUID NOT NULL REFERENCES properties(id),
    rent_transaction_id UUID REFERENCES rent_transactions(id),
    tenant_id UUID REFERENCES tenants(id),
    receipt_date TIMESTAMP NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT NOT NULL,
    receipt_data JSONB NOT NULL,
    pdf_url TEXT,
    file_size INTEGER,
    status VARCHAR(50) DEFAULT 'generated',
    generated_by UUID NOT NULL REFERENCES users(id),
    sent_to VARCHAR(255),
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating receipts table', err);
    } else {
      console.log('Receipts table ready');
    }
  });

  // Create indexes for receipts table
  pool.query(`CREATE INDEX IF NOT EXISTS idx_receipts_property_id ON receipts(property_id)`, (err) => {
    if (err) console.error('Error creating receipts property index', err);
  });

  pool.query(`CREATE INDEX IF NOT EXISTS idx_receipts_tenant_id ON receipts(tenant_id)`, (err) => {
    if (err) console.error('Error creating receipts tenant index', err);
  });

  pool.query(`CREATE INDEX IF NOT EXISTS idx_receipts_rent_transaction_id ON receipts(rent_transaction_id)`, (err) => {
    if (err) console.error('Error creating receipts rent transaction index', err);
  });

  pool.query(`CREATE INDEX IF NOT EXISTS idx_receipts_receipt_number ON receipts(receipt_number)`, (err) => {
    if (err) console.error('Error creating receipts number index', err);
  });

  // Expenses table
  pool.query(`DROP TABLE IF EXISTS expenses`, (dropErr) => {
    if (dropErr) {
      console.error('Error dropping expenses table', dropErr);
    }
    pool.query(`CREATE TABLE expenses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      property_id UUID NOT NULL REFERENCES properties(id),
      unit_id UUID REFERENCES units(id),
      type VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      frequency VARCHAR(50) DEFAULT 'one_time',
      start_date DATE NOT NULL,
      end_date DATE,
      distribution VARCHAR(50) DEFAULT 'owner_only',
      affected_unit_ids JSONB,
      bill_photo_url TEXT,
      status VARCHAR(50) DEFAULT 'active',
      is_active BOOLEAN DEFAULT true,
      created_by UUID NOT NULL REFERENCES users(id),
      updated_by UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating expenses table', err);
      } else {
        console.log('Expenses table ready');

        // Create indexes for expenses table only after table is created
        pool.query(`CREATE INDEX IF NOT EXISTS idx_expenses_property_id ON expenses(property_id)`, (err) => {
          if (err) console.error('Error creating expenses property index', err);
        });

        pool.query(`CREATE INDEX IF NOT EXISTS idx_expenses_unit_id ON expenses(unit_id)`, (err) => {
          if (err) console.error('Error creating expenses unit index', err);
        });

        pool.query(`CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type)`, (err) => {
          if (err) console.error('Error creating expenses type index', err);
        });

        pool.query(`CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status)`, (err) => {
          if (err) console.error('Error creating expenses status index', err);
        });

        pool.query(`CREATE INDEX IF NOT EXISTS idx_expenses_start_date ON expenses(start_date)`, (err) => {
          if (err) console.error('Error creating expenses date index', err);
        });

        pool.query(`CREATE INDEX IF NOT EXISTS idx_expenses_is_active ON expenses(is_active)`, (err) => {
          if (err) console.error('Error creating expenses active index', err);
        });
      }
    });
  });
  } catch (error) {
    console.error('Error initializing main tables:', error);
    throw error;
  }
}