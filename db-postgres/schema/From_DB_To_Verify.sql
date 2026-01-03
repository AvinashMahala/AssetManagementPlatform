-- public.audit_events definition

-- Drop table

-- DROP TABLE public.audit_events;

CREATE TABLE public.audit_events (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	actor varchar(200) NOT NULL,
	"action" varchar(200) NOT NULL,
	resource_type varchar(200) NOT NULL,
	resource_id varchar(50) NULL,
	"data" jsonb NOT NULL,
	occurred_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT audit_events_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_audit_events_actor ON public.audit_events USING btree (actor);
CREATE INDEX idx_audit_events_occurred_at ON public.audit_events USING btree (occurred_at);
CREATE INDEX idx_audit_events_resource_type ON public.audit_events USING btree (resource_type);


-- public.export_tokens definition

-- Drop table

-- DROP TABLE public.export_tokens;

CREATE TABLE public.export_tokens (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	"token" varchar(64) NOT NULL,
	created_by varchar(256) NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	expires_at timestamptz NOT NULL,
	used bool DEFAULT false NOT NULL,
	revoked bool DEFAULT false NOT NULL,
	revoked_by varchar(256) NULL,
	revoked_at timestamptz NULL,
	query varchar(1024) NULL,
	ids_csv text NULL,
	created_from_ip varchar(64) NULL,
	downloaded_at timestamptz NULL,
	downloaded_by_ip varchar(64) NULL,
	CONSTRAINT export_tokens_pkey PRIMARY KEY (id),
	CONSTRAINT export_tokens_token_key UNIQUE (token)
);
CREATE INDEX idx_export_tokens_revoked ON public.export_tokens USING btree (revoked);
CREATE INDEX idx_export_tokens_token ON public.export_tokens USING btree (token);


-- public.file_metadata definition

-- Drop table

-- DROP TABLE public.file_metadata;

CREATE TABLE public.file_metadata (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	entity_type varchar(50) NULL,
	entity_id uuid NULL,
	filename varchar(255) NOT NULL,
	original_name varchar(255) NOT NULL,
	file_size int8 NOT NULL,
	mime_type varchar(100) NOT NULL,
	file_hash varchar(128) NULL,
	category varchar(50) NULL,
	tags _text NULL,
	uploaded_by uuid NULL,
	uploaded_at timestamptz DEFAULT now() NULL,
	last_accessed timestamptz NULL,
	is_deleted bool DEFAULT false NULL,
	deleted_at timestamptz NULL,
	"version" int4 DEFAULT 1 NULL,
	parent_file_id uuid NULL,
	CONSTRAINT file_metadata_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_file_metadata_category ON public.file_metadata USING btree (category);
CREATE INDEX idx_file_metadata_entity ON public.file_metadata USING btree (entity_type, entity_id);
CREATE INDEX idx_file_metadata_hash ON public.file_metadata USING btree (file_hash);
CREATE INDEX idx_file_metadata_uploaded_by ON public.file_metadata USING btree (uploaded_by);


-- public.organizations definition

-- Drop table

-- DROP TABLE public.organizations;

CREATE TABLE public.organizations (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	slug varchar(255) NOT NULL,
	db_name varchar(255) NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT organizations_pkey PRIMARY KEY (id),
	CONSTRAINT organizations_slug_key UNIQUE (slug)
);
CREATE INDEX idx_organizations_slug ON public.organizations USING btree (slug);


-- public.permission_categories definition

-- Drop table

-- DROP TABLE public.permission_categories;

CREATE TABLE public.permission_categories (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	description varchar(1000) NULL,
	CONSTRAINT permission_categories_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_permission_categories_name ON public.permission_categories USING btree (name);


-- public.receipt_templates definition

-- Drop table

-- DROP TABLE public.receipt_templates;

CREATE TABLE public.receipt_templates (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(20) NOT NULL,
	description text NULL,
	default_settings jsonb NOT NULL,
	template_html text NULL,
	template_css jsonb NULL,
	layout_config jsonb NULL,
	placeholders jsonb NULL,
	preview_image_url varchar(500) NULL,
	is_active bool DEFAULT true NOT NULL,
	is_default bool DEFAULT false NOT NULL,
	sort_order int4 DEFAULT 0 NOT NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	CONSTRAINT receipt_templates_pkey PRIMARY KEY (id),
	CONSTRAINT receipt_templates_type_check CHECK (((type)::text = ANY ((ARRAY['basic'::character varying, 'professional'::character varying, 'premium'::character varying])::text[])))
);
CREATE INDEX idx_receipt_templates_is_active ON public.receipt_templates USING btree (is_active);
CREATE INDEX idx_receipt_templates_is_default ON public.receipt_templates USING btree (is_default);
CREATE INDEX idx_receipt_templates_sort_order ON public.receipt_templates USING btree (sort_order);
CREATE INDEX idx_receipt_templates_type ON public.receipt_templates USING btree (type);

-- Table Triggers

create trigger trigger_update_receipt_templates_updated_at before
update
    on
    public.receipt_templates for each row execute function update_receipt_templates_updated_at();


-- public.roles definition

-- Drop table

-- DROP TABLE public.roles;

CREATE TABLE public.roles (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	description text NULL,
	is_system bool DEFAULT false NOT NULL,
	tenant_id uuid NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT roles_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX ux_roles_tenant_name ON public.roles USING btree (tenant_id, lower(name));


-- public.tenants definition

-- Drop table

-- DROP TABLE public.tenants;

CREATE TABLE public.tenants (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	first_name varchar(100) NOT NULL,
	last_name varchar(100) NOT NULL,
	email varchar(255) NOT NULL,
	phone varchar(20) NULL,
	alternate_phone varchar(20) NULL,
	date_of_birth date NULL,
	gender varchar(10) NULL,
	occupation varchar(100) NULL,
	company_name varchar(255) NULL,
	monthly_income numeric(12, 2) NULL,
	current_address_street varchar(255) NOT NULL,
	current_address_city varchar(100) NOT NULL,
	current_address_state varchar(100) NOT NULL,
	current_address_pincode varchar(10) NOT NULL,
	permanent_address_street varchar(255) NULL,
	permanent_address_city varchar(100) NULL,
	permanent_address_state varchar(100) NULL,
	permanent_address_pincode varchar(10) NULL,
	emergency_contact_name varchar(100) NULL,
	emergency_contact_relationship varchar(50) NULL,
	emergency_contact_phone varchar(20) NULL,
	status varchar(50) DEFAULT 'active'::character varying NULL,
	total_rentals int4 DEFAULT 0 NULL,
	current_property_id uuid NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT check_total_rentals_non_negative CHECK ((total_rentals >= 0)),
	CONSTRAINT tenants_email_key UNIQUE (email),
	CONSTRAINT tenants_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_tenants_alternate_phone ON public.tenants USING btree (alternate_phone);
CREATE INDEX idx_tenants_company_name ON public.tenants USING btree (company_name);
CREATE INDEX idx_tenants_current_property_id ON public.tenants USING btree (current_property_id);
CREATE INDEX idx_tenants_email ON public.tenants USING btree (email);
CREATE INDEX idx_tenants_phone ON public.tenants USING btree (phone);
CREATE INDEX idx_tenants_status ON public.tenants USING btree (status);


-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	username varchar(255) NOT NULL,
	email varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	phone varchar(20) NULL,
	"role" varchar(50) DEFAULT 'user'::character varying NULL,
	google_id varchar(255) NULL,
	"name" varchar(255) NULL,
	profile_picture varchar(500) NULL,
	is_email_verified bool DEFAULT false NULL,
	email_verification_token varchar(255) NULL,
	email_verification_expires timestamp NULL,
	is_phone_verified bool DEFAULT false NULL,
	password_reset_token varchar(255) NULL,
	password_reset_expires timestamp NULL,
	last_login timestamp NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	refresh_token varchar(255) NULL,
	refresh_token_expiry timestamp NULL,
	CONSTRAINT users_email_key UNIQUE (email),
	CONSTRAINT users_google_id_key UNIQUE (google_id),
	CONSTRAINT users_pkey PRIMARY KEY (id),
	CONSTRAINT users_username_key UNIQUE (username)
);
CREATE INDEX idx_users_email ON public.users USING btree (email);
CREATE INDEX idx_users_google_id ON public.users USING btree (google_id);
CREATE INDEX idx_users_username ON public.users USING btree (username);
CREATE INDEX users_created_at_idx ON public.users USING btree (created_at DESC);
CREATE UNIQUE INDEX users_email_lower_idx ON public.users USING btree (lower((email)::text));
CREATE INDEX users_last_login_idx ON public.users USING btree (last_login DESC);
CREATE UNIQUE INDEX users_username_lower_idx ON public.users USING btree (lower((username)::text));


-- public.file_access_log definition

-- Drop table

-- DROP TABLE public.file_access_log;

CREATE TABLE public.file_access_log (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	file_id uuid NOT NULL,
	user_id uuid NOT NULL,
	access_type varchar(20) NOT NULL,
	ip_address inet NULL,
	user_agent text NULL,
	accessed_at timestamptz DEFAULT now() NULL,
	CONSTRAINT file_access_log_pkey PRIMARY KEY (id),
	CONSTRAINT file_access_log_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.file_metadata(id)
);
CREATE INDEX idx_file_access_log_file_id ON public.file_access_log USING btree (file_id);


-- public.file_content definition

-- Drop table

-- DROP TABLE public.file_content;

CREATE TABLE public.file_content (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	metadata_id uuid NOT NULL,
	chunk_number int4 DEFAULT 0 NOT NULL,
	chunk_data bytea NOT NULL,
	chunk_size int4 NOT NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT file_content_pkey PRIMARY KEY (id),
	CONSTRAINT file_content_metadata_id_fkey FOREIGN KEY (metadata_id) REFERENCES public.file_metadata(id) ON DELETE CASCADE
);
CREATE INDEX idx_file_content_metadata ON public.file_content USING btree (metadata_id, chunk_number);


-- public.password_reset_methods definition

-- Drop table

-- DROP TABLE public.password_reset_methods;

CREATE TABLE public.password_reset_methods (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	user_id uuid NOT NULL,
	method_type varchar(50) NOT NULL,
	is_enabled bool DEFAULT true NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT password_reset_methods_pkey PRIMARY KEY (id),
	CONSTRAINT password_reset_methods_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);


-- public.permissions definition

-- Drop table

-- DROP TABLE public.permissions;

CREATE TABLE public.permissions (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	description text NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	category_id uuid NULL,
	CONSTRAINT permissions_pkey PRIMARY KEY (id),
	CONSTRAINT permissions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.permission_categories(id)
);
CREATE INDEX idx_permissions_name ON public.permissions USING btree (name);
CREATE UNIQUE INDEX ux_permissions_name ON public.permissions USING btree (lower((name)::text));


-- public.phone_verification_codes definition

-- Drop table

-- DROP TABLE public.phone_verification_codes;

CREATE TABLE public.phone_verification_codes (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	user_id uuid NOT NULL,
	phone varchar(20) NOT NULL,
	code varchar(6) NOT NULL,
	expires_at timestamp NOT NULL,
	verified bool DEFAULT false NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT phone_verification_codes_pkey PRIMARY KEY (id),
	CONSTRAINT phone_verification_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);


-- public.properties definition

-- Drop table

-- DROP TABLE public.properties;

CREATE TABLE public.properties (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	description text NULL,
	property_type varchar(100) NULL,
	status varchar(50) DEFAULT 'active'::character varying NULL,
	currency varchar(10) DEFAULT 'INR'::character varying NULL,
	address_street varchar(255) NULL,
	address_city varchar(100) NULL,
	address_state varchar(100) NULL,
	address_pincode varchar(10) NULL,
	address_country varchar(100) DEFAULT 'India'::character varying NULL,
	address_landmark varchar(255) NULL,
	area numeric(10, 2) NULL,
	total_floors int4 NULL,
	year_built int4 NULL,
	parking_spaces int4 NULL,
	amenities jsonb DEFAULT '{"basic": [], "luxury": [], "additionalInfo": {"petFriendly": false, "eventsAllowed": false, "smokingAllowed": false}}'::jsonb NULL,
	owner_id uuid NULL,
	owner_name varchar(255) NULL,
	owner_mobile_numbers jsonb DEFAULT '[]'::jsonb NULL,
	owner_email_ids jsonb DEFAULT '[]'::jsonb NULL,
	owner_website varchar(500) NULL,
	co_owners jsonb DEFAULT '[]'::jsonb NULL,
	template_id uuid NULL,
	template_overrides jsonb NULL,
	receipt_settings jsonb NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT check_owner_email_ids_length CHECK ((jsonb_array_length(owner_email_ids) <= 5)),
	CONSTRAINT check_owner_mobile_numbers_length CHECK ((jsonb_array_length(owner_mobile_numbers) <= 5)),
	CONSTRAINT properties_pkey PRIMARY KEY (id),
	CONSTRAINT properties_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id),
	CONSTRAINT properties_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.receipt_templates(id)
);
CREATE INDEX idx_properties_owner_id ON public.properties USING btree (owner_id);


-- public.property_files definition

-- Drop table

-- DROP TABLE public.property_files;

CREATE TABLE public.property_files (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	property_id uuid NOT NULL,
	file_name varchar(255) NOT NULL,
	file_type varchar(20) NOT NULL,
	description text NULL,
	uploaded_at timestamptz DEFAULT now() NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	file_id uuid NULL,
	CONSTRAINT property_files_file_type_check CHECK (((file_type)::text = ANY ((ARRAY['photo'::character varying, 'document'::character varying])::text[]))),
	CONSTRAINT property_files_pkey PRIMARY KEY (id),
	CONSTRAINT fk_property_files_file_id FOREIGN KEY (file_id) REFERENCES public.file_metadata(id) ON DELETE SET NULL,
	CONSTRAINT property_files_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE
);
CREATE INDEX idx_property_files_file_type ON public.property_files USING btree (file_type);
CREATE INDEX idx_property_files_property_id ON public.property_files USING btree (property_id);

-- Table Triggers

create trigger update_property_files_updated_at before
update
    on
    public.property_files for each row execute function update_updated_at_column();


-- public.property_receipt_templates definition

-- Drop table

-- DROP TABLE public.property_receipt_templates;

CREATE TABLE public.property_receipt_templates (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	property_id uuid NOT NULL,
	bank_name varchar(255) NULL,
	account_number varchar(50) NULL,
	ifsc_code varchar(20) NULL,
	account_holder_name varchar(255) NULL,
	wallets jsonb DEFAULT '[]'::jsonb NULL,
	payment_qr_code_url text NULL,
	signature_url text NULL,
	watermark_url text NULL,
	additional_info jsonb DEFAULT '{"contactInfo": null, "customFooter": null, "termsAndConditions": null, "paymentInstructions": null}'::jsonb NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	CONSTRAINT property_receipt_templates_pkey PRIMARY KEY (id),
	CONSTRAINT property_receipt_templates_property_id_key UNIQUE (property_id),
	CONSTRAINT property_receipt_templates_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE
);
CREATE INDEX idx_property_receipt_templates_property_id ON public.property_receipt_templates USING btree (property_id);

-- Table Triggers

create trigger update_property_receipt_templates_updated_at before
update
    on
    public.property_receipt_templates for each row execute function update_updated_at_column();


-- public.property_template_customizations definition

-- Drop table

-- DROP TABLE public.property_template_customizations;

CREATE TABLE public.property_template_customizations (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	property_id uuid NOT NULL,
	template_id uuid NOT NULL,
	custom_styles jsonb NULL,
	custom_logo_url varchar(500) NULL,
	custom_header text NULL,
	custom_footer text NULL,
	show_qr_code bool DEFAULT false NULL,
	qr_code_data jsonb NULL,
	qr_code_position varchar(50) DEFAULT 'bottom-right'::character varying NULL,
	qr_code_size int4 DEFAULT 100 NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT property_template_customizations_pkey PRIMARY KEY (id),
	CONSTRAINT property_template_customizations_property_id_template_id_key UNIQUE (property_id, template_id),
	CONSTRAINT property_template_customizations_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE,
	CONSTRAINT property_template_customizations_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.receipt_templates(id) ON DELETE CASCADE
);


-- public.recovery_codes definition

-- Drop table

-- DROP TABLE public.recovery_codes;

CREATE TABLE public.recovery_codes (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	user_id uuid NOT NULL,
	code_hash varchar(255) NOT NULL,
	used bool DEFAULT false NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	used_at timestamp NULL,
	CONSTRAINT recovery_codes_pkey PRIMARY KEY (id),
	CONSTRAINT recovery_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);


-- public.role_permissions definition

-- Drop table

-- DROP TABLE public.role_permissions;

CREATE TABLE public.role_permissions (
	role_id uuid NOT NULL,
	permission_id uuid NOT NULL,
	allowed bool DEFAULT true NOT NULL,
	CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id),
	CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE,
	CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE
);
CREATE INDEX idx_role_permissions_permission_id ON public.role_permissions USING btree (permission_id);


-- public.security_questions definition

-- Drop table

-- DROP TABLE public.security_questions;

CREATE TABLE public.security_questions (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	user_id uuid NOT NULL,
	question varchar(255) NOT NULL,
	answer_hash varchar(255) NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT security_questions_pkey PRIMARY KEY (id),
	CONSTRAINT security_questions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);


-- public.session_tokens definition

-- Drop table

-- DROP TABLE public.session_tokens;

CREATE TABLE public.session_tokens (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	user_id uuid NOT NULL,
	refresh_token_hash varchar(64) NOT NULL,
	issued_at timestamptz DEFAULT now() NOT NULL,
	expires_at timestamptz NOT NULL,
	revoked bool DEFAULT false NOT NULL,
	device_info text NULL,
	ip_address text NULL,
	user_agent text NULL,
	last_used_at timestamptz NULL,
	replaced_by_session_id uuid NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT session_tokens_pkey PRIMARY KEY (id),
	CONSTRAINT session_tokens_refresh_token_hash_key UNIQUE (refresh_token_hash),
	CONSTRAINT session_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_session_tokens_revoked ON public.session_tokens USING btree (revoked);
CREATE INDEX idx_session_tokens_user_id ON public.session_tokens USING btree (user_id);


-- public.template_preview_cache definition

-- Drop table

-- DROP TABLE public.template_preview_cache;

CREATE TABLE public.template_preview_cache (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	template_id uuid NULL,
	property_id uuid NULL,
	sample_data jsonb NOT NULL,
	preview_html text NULL,
	preview_pdf_url varchar(500) NULL,
	preview_expires_at timestamp NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT template_preview_cache_pkey PRIMARY KEY (id),
	CONSTRAINT template_preview_cache_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE,
	CONSTRAINT template_preview_cache_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.receipt_templates(id) ON DELETE CASCADE
);


-- public.tenant_documents definition

-- Drop table

-- DROP TABLE public.tenant_documents;

CREATE TABLE public.tenant_documents (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	tenant_id uuid NOT NULL,
	document_type varchar(100) NOT NULL,
	document_name varchar(255) NOT NULL,
	document_url varchar(500) NOT NULL,
	file_size int4 NULL,
	uploaded_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT tenant_documents_pkey PRIMARY KEY (id),
	CONSTRAINT tenant_documents_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);


-- public.units definition

-- Drop table

-- DROP TABLE public.units;

CREATE TABLE public.units (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	property_id uuid NOT NULL,
	unit_number varchar(50) NOT NULL,
	unit_name varchar(255) NULL,
	description text NULL,
	unit_type varchar(100) NULL,
	status varchar(50) DEFAULT 'available'::character varying NULL,
	floor int4 NULL,
	area numeric(10, 2) NULL,
	bedrooms int4 NULL,
	bathrooms int4 NULL,
	balconies int4 NULL,
	furnished bool DEFAULT false NULL,
	max_occupants int4 NULL,
	unit_amenities jsonb DEFAULT '[]'::jsonb NULL,
	unit_photos jsonb DEFAULT '[]'::jsonb NULL,
	monthly_rent numeric(10, 2) NULL,
	security_deposit numeric(10, 2) NULL,
	maintenance_charges numeric(10, 2) NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT units_pkey PRIMARY KEY (id),
	CONSTRAINT units_property_id_unit_number_key UNIQUE (property_id, unit_number),
	CONSTRAINT units_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE
);
CREATE INDEX idx_units_property_id ON public.units USING btree (property_id);
CREATE INDEX idx_units_unit_amenities ON public.units USING gin (unit_amenities);
CREATE INDEX idx_units_unit_photos ON public.units USING gin (unit_photos);


-- public.user_roles definition

-- Drop table

-- DROP TABLE public.user_roles;

CREATE TABLE public.user_roles (
	user_id uuid NOT NULL,
	role_id uuid NOT NULL,
	tenant_id uuid NULL,
	CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id),
	CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE,
	CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_user_roles_role_id ON public.user_roles USING btree (role_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);


-- public.expenses definition

-- Drop table

-- DROP TABLE public.expenses;

CREATE TABLE public.expenses (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	property_id uuid NOT NULL,
	unit_id uuid NULL,
	"type" varchar(100) NOT NULL,
	description text NOT NULL,
	amount numeric(12, 2) NOT NULL,
	frequency varchar(50) DEFAULT 'one_time'::character varying NULL,
	start_date date NOT NULL,
	end_date date NULL,
	distribution varchar(50) DEFAULT 'owner_only'::character varying NULL,
	affected_unit_ids jsonb NULL,
	bill_photo_url text NULL,
	status varchar(50) DEFAULT 'active'::character varying NULL,
	is_active bool DEFAULT true NULL,
	created_by uuid NOT NULL,
	updated_by uuid NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT expenses_pkey PRIMARY KEY (id),
	CONSTRAINT expenses_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
	CONSTRAINT expenses_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id),
	CONSTRAINT expenses_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id),
	CONSTRAINT expenses_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id)
);
CREATE INDEX idx_expenses_is_active ON public.expenses USING btree (is_active);
CREATE INDEX idx_expenses_property_id ON public.expenses USING btree (property_id);
CREATE INDEX idx_expenses_start_date ON public.expenses USING btree (start_date);
CREATE INDEX idx_expenses_status ON public.expenses USING btree (status);
CREATE INDEX idx_expenses_type ON public.expenses USING btree (type);
CREATE INDEX idx_expenses_unit_id ON public.expenses USING btree (unit_id);


-- public.leases definition

-- Drop table

-- DROP TABLE public.leases;

CREATE TABLE public.leases (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	property_id uuid NOT NULL,
	unit_id uuid NOT NULL,
	tenant_id uuid NOT NULL,
	start_date date NOT NULL,
	end_date date NOT NULL,
	monthly_rent numeric(10, 2) NOT NULL,
	security_deposit numeric(10, 2) NULL,
	late_fee_amount numeric(10, 2) NULL,
	grace_period_days int4 DEFAULT 3 NULL,
	payment_due_day int4 DEFAULT 1 NULL,
	terms_conditions text NULL,
	special_clauses text NULL,
	status varchar(50) DEFAULT 'draft'::character varying NULL,
	notice_period_days int4 NULL,
	auto_renewal bool DEFAULT false NULL,
	maintenance_charges numeric(10, 2) NULL,
	payment_frequency varchar(20) DEFAULT 'monthly'::character varying NULL,
	rent_due_day int4 DEFAULT 1 NULL,
	electricity_charges numeric(10, 2) NULL,
	water_charges numeric(10, 2) NULL,
	other_charges numeric(10, 2) NULL,
	pets_allowed bool DEFAULT false NULL,
	smoking_allowed bool DEFAULT false NULL,
	subletting_allowed bool DEFAULT false NULL,
	special_conditions text NULL,
	signed_at timestamp NULL,
	terminated_at timestamp NULL,
	termination_reason text NULL,
	lease_document_url varchar(500) NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT leases_pkey PRIMARY KEY (id),
	CONSTRAINT leases_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id),
	CONSTRAINT leases_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
	CONSTRAINT leases_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id)
);
CREATE INDEX idx_leases_property_id ON public.leases USING btree (property_id);


-- public.meters definition

-- Drop table

-- DROP TABLE public.meters;

CREATE TABLE public.meters (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	property_id uuid NOT NULL,
	unit_id uuid NULL,
	meter_type varchar(50) NOT NULL,
	meter_number varchar(100) NOT NULL,
	meter_name varchar(255) NULL,
	multiplier numeric(5, 2) DEFAULT 1.0 NULL,
	cost_per_unit numeric(10, 2) DEFAULT 0 NULL,
	fixed_charge numeric(10, 2) NULL,
	remarks text NULL,
	installation_date date NULL,
	status varchar(50) DEFAULT 'active'::character varying NULL,
	is_active bool DEFAULT true NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT meters_pkey PRIMARY KEY (id),
	CONSTRAINT meters_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id),
	CONSTRAINT meters_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id)
);


-- public.rent_payments definition

-- Drop table

-- DROP TABLE public.rent_payments;

CREATE TABLE public.rent_payments (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	lease_id uuid NOT NULL,
	property_id uuid NOT NULL,
	tenant_id uuid NOT NULL,
	amount numeric(10, 2) NOT NULL,
	due_date date NOT NULL,
	paid_date date NULL,
	payment_method varchar(50) NULL,
	transaction_reference varchar(255) NULL,
	status varchar(50) DEFAULT 'pending'::character varying NULL,
	late_fee numeric(10, 2) DEFAULT 0 NULL,
	penalty_amount numeric(10, 2) DEFAULT 0 NULL,
	rent_amount numeric(10, 2) NULL,
	maintenance_charges numeric(10, 2) DEFAULT 0 NULL,
	other_charges numeric(10, 2) DEFAULT 0 NULL,
	notes text NULL,
	created_by uuid NULL,
	updated_by uuid NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT rent_payments_pkey PRIMARY KEY (id),
	CONSTRAINT rent_payments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
	CONSTRAINT rent_payments_lease_id_fkey FOREIGN KEY (lease_id) REFERENCES public.leases(id),
	CONSTRAINT rent_payments_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id),
	CONSTRAINT rent_payments_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
	CONSTRAINT rent_payments_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id)
);
CREATE INDEX idx_rent_payments_due_date ON public.rent_payments USING btree (due_date);
CREATE INDEX idx_rent_payments_lease_id ON public.rent_payments USING btree (lease_id);
CREATE INDEX idx_rent_payments_paid_date ON public.rent_payments USING btree (paid_date);
CREATE INDEX idx_rent_payments_property_id ON public.rent_payments USING btree (property_id);
CREATE INDEX idx_rent_payments_status ON public.rent_payments USING btree (status);
CREATE INDEX idx_rent_payments_tenant_id ON public.rent_payments USING btree (tenant_id);


-- public.rent_transactions definition

-- Drop table

-- DROP TABLE public.rent_transactions;

CREATE TABLE public.rent_transactions (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	lease_id uuid NOT NULL,
	unit_id uuid NULL,
	tenant_id uuid NOT NULL,
	property_id uuid NOT NULL,
	billing_period_start date NOT NULL,
	billing_period_end date NOT NULL,
	billing_method varchar(20) DEFAULT 'relative'::character varying NOT NULL,
	days_count int4 NOT NULL,
	base_rent numeric(12, 2) DEFAULT 0 NOT NULL,
	maintenance_charges numeric(12, 2) DEFAULT 0 NOT NULL,
	previous_balance numeric(12, 2) DEFAULT 0 NOT NULL,
	total_meter_charges numeric(12, 2) DEFAULT 0 NOT NULL,
	total_expenses numeric(12, 2) DEFAULT 0 NOT NULL,
	expenses jsonb DEFAULT '[]'::jsonb NOT NULL,
	total_amount numeric(12, 2) DEFAULT 0 NOT NULL,
	amount_paid numeric(12, 2) DEFAULT 0 NOT NULL,
	new_balance numeric(12, 2) DEFAULT 0 NOT NULL,
	payments jsonb DEFAULT '[]'::jsonb NOT NULL,
	paid_date date NULL,
	status varchar(20) DEFAULT 'draft'::character varying NOT NULL,
	payment_method varchar(50) NULL,
	transaction_id varchar(255) NULL,
	payment_reference varchar(255) NULL,
	late_fee numeric(10, 2) DEFAULT 0 NULL,
	penalty_amount numeric(10, 2) DEFAULT 0 NULL,
	receipt_number varchar(100) NULL,
	receipt_generated bool DEFAULT false NOT NULL,
	invoice_number varchar(100) NULL,
	invoice_date date NULL,
	invoice_pdf_url varchar(500) NULL,
	workflow_status varchar(30) DEFAULT 'invoice_pending'::character varying NOT NULL,
	invoice_generated bool DEFAULT false NOT NULL,
	invoice_sent_date timestamp NULL,
	notification_sent bool DEFAULT false NOT NULL,
	notification_sent_date timestamp NULL,
	notification_method varchar(20) NULL,
	last_payment_date timestamp NULL,
	receipt_sent bool DEFAULT false NOT NULL,
	receipt_sent_date timestamp NULL,
	workflow_completed_date timestamp NULL,
	notes text NULL,
	created_by uuid NOT NULL,
	updated_by uuid NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT rent_transactions_billing_method_check CHECK (((billing_method)::text = ANY ((ARRAY['relative'::character varying, 'fixed'::character varying])::text[]))),
	CONSTRAINT rent_transactions_notification_method_check CHECK (((notification_method)::text = ANY ((ARRAY['email'::character varying, 'sms'::character varying, 'manual'::character varying])::text[]))),
	CONSTRAINT rent_transactions_pkey PRIMARY KEY (id),
	CONSTRAINT rent_transactions_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'finalized'::character varying, 'paid'::character varying, 'cancelled'::character varying])::text[]))),
	CONSTRAINT rent_transactions_workflow_status_check CHECK (((workflow_status)::text = ANY ((ARRAY['invoice_pending'::character varying, 'invoice_generated'::character varying, 'notification_sent'::character varying, 'payment_pending'::character varying, 'payment_partial'::character varying, 'payment_completed'::character varying, 'receipt_generated'::character varying, 'workflow_completed'::character varying])::text[]))),
	CONSTRAINT rent_transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
	CONSTRAINT rent_transactions_lease_id_fkey FOREIGN KEY (lease_id) REFERENCES public.leases(id) ON DELETE CASCADE,
	CONSTRAINT rent_transactions_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id),
	CONSTRAINT rent_transactions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id),
	CONSTRAINT rent_transactions_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id),
	CONSTRAINT rent_transactions_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id)
);
CREATE INDEX idx_rent_transactions_billing_period ON public.rent_transactions USING btree (billing_period_start, billing_period_end);
CREATE INDEX idx_rent_transactions_created_at ON public.rent_transactions USING btree (created_at);
CREATE INDEX idx_rent_transactions_invoice_generated ON public.rent_transactions USING btree (invoice_generated);
CREATE INDEX idx_rent_transactions_invoice_number ON public.rent_transactions USING btree (invoice_number);
CREATE INDEX idx_rent_transactions_lease_id ON public.rent_transactions USING btree (lease_id);
CREATE INDEX idx_rent_transactions_notification_sent ON public.rent_transactions USING btree (notification_sent);
CREATE INDEX idx_rent_transactions_paid_date ON public.rent_transactions USING btree (paid_date);
CREATE INDEX idx_rent_transactions_property_id ON public.rent_transactions USING btree (property_id);
CREATE INDEX idx_rent_transactions_receipt_number ON public.rent_transactions USING btree (receipt_number);
CREATE INDEX idx_rent_transactions_receipt_sent ON public.rent_transactions USING btree (receipt_sent);
CREATE INDEX idx_rent_transactions_status ON public.rent_transactions USING btree (status);
CREATE INDEX idx_rent_transactions_tenant_id ON public.rent_transactions USING btree (tenant_id);
CREATE INDEX idx_rent_transactions_unit_id ON public.rent_transactions USING btree (unit_id);
CREATE INDEX idx_rent_transactions_workflow_completed_date ON public.rent_transactions USING btree (workflow_completed_date);
CREATE INDEX idx_rent_transactions_workflow_status ON public.rent_transactions USING btree (workflow_status);


-- public.session_jtis definition

-- Drop table

-- DROP TABLE public.session_jtis;

CREATE TABLE public.session_jtis (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	session_id uuid NOT NULL,
	jti varchar(100) NOT NULL,
	expires_at timestamptz NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT session_jtis_jti_key UNIQUE (jti),
	CONSTRAINT session_jtis_pkey PRIMARY KEY (id),
	CONSTRAINT session_jtis_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.session_tokens(id) ON DELETE CASCADE
);
CREATE INDEX idx_session_jtis_jti ON public.session_jtis USING btree (jti);
CREATE INDEX idx_session_jtis_session_id ON public.session_jtis USING btree (session_id);


-- public.unit_tenants definition

-- Drop table

-- DROP TABLE public.unit_tenants;

CREATE TABLE public.unit_tenants (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	unit_id uuid NOT NULL,
	tenant_id uuid NOT NULL,
	move_in_date date NOT NULL,
	move_out_date date NULL,
	is_primary bool DEFAULT false NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT unit_tenants_pkey PRIMARY KEY (id),
	CONSTRAINT unit_tenants_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
	CONSTRAINT unit_tenants_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id) ON DELETE CASCADE
);


-- public.unit_utilities definition

-- Drop table

-- DROP TABLE public.unit_utilities;

CREATE TABLE public.unit_utilities (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	unit_id uuid NOT NULL,
	property_id uuid NOT NULL,
	utility_type varchar(50) NOT NULL,
	utility_name varchar(255) NOT NULL,
	is_enabled bool DEFAULT true NULL,
	billing_method varchar(20) DEFAULT 'fixed'::character varying NOT NULL,
	fixed_amount numeric(10, 2) NULL,
	meter_id uuid NULL,
	multiplier numeric(5, 2) DEFAULT 1.0 NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT chk_billing_method CHECK (((billing_method)::text = ANY ((ARRAY['fixed'::character varying, 'meter_based'::character varying])::text[]))),
	CONSTRAINT chk_fixed_amount_required CHECK (((((billing_method)::text = 'fixed'::text) AND (fixed_amount IS NOT NULL) AND (fixed_amount >= (0)::numeric)) OR ((billing_method)::text = 'meter_based'::text))),
	CONSTRAINT chk_meter_required CHECK (((((billing_method)::text = 'meter_based'::text) AND (meter_id IS NOT NULL)) OR ((billing_method)::text = 'fixed'::text))),
	CONSTRAINT chk_multiplier_positive CHECK ((multiplier > (0)::numeric)),
	CONSTRAINT unit_utilities_pkey PRIMARY KEY (id),
	CONSTRAINT unit_utilities_unit_id_utility_type_key UNIQUE (unit_id, utility_type),
	CONSTRAINT unit_utilities_meter_id_fkey FOREIGN KEY (meter_id) REFERENCES public.meters(id) ON DELETE SET NULL,
	CONSTRAINT unit_utilities_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE,
	CONSTRAINT unit_utilities_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id) ON DELETE CASCADE
);
CREATE INDEX idx_unit_utilities_meter_id ON public.unit_utilities USING btree (meter_id);
CREATE INDEX idx_unit_utilities_property_id ON public.unit_utilities USING btree (property_id);
CREATE INDEX idx_unit_utilities_unit_id ON public.unit_utilities USING btree (unit_id);
CREATE INDEX idx_unit_utilities_utility_type ON public.unit_utilities USING btree (utility_type);


-- public.meter_readings definition

-- Drop table

-- DROP TABLE public.meter_readings;

CREATE TABLE public.meter_readings (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	meter_id uuid NOT NULL,
	previous_reading numeric(10, 2) DEFAULT 0 NULL,
	current_reading numeric(10, 2) NOT NULL,
	reading_date date NOT NULL,
	recorded_by uuid NULL,
	notes text NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT meter_readings_pkey PRIMARY KEY (id),
	CONSTRAINT meter_readings_meter_id_fkey FOREIGN KEY (meter_id) REFERENCES public.meters(id),
	CONSTRAINT meter_readings_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.users(id)
);


-- public.receipts definition

-- Drop table

-- DROP TABLE public.receipts;

CREATE TABLE public.receipts (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	receipt_number varchar(100) NOT NULL,
	property_id uuid NOT NULL,
	rent_transaction_id uuid NULL,
	tenant_id uuid NULL,
	receipt_date date NOT NULL,
	amount numeric(12, 2) NOT NULL,
	description text NULL,
	receipt_data jsonb NOT NULL,
	pdf_url varchar(500) NULL,
	file_size int8 NULL,
	status varchar(20) DEFAULT 'generated'::character varying NOT NULL,
	generated_by uuid NOT NULL,
	sent_to varchar(255) NULL,
	sent_at timestamptz NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	CONSTRAINT receipts_pkey PRIMARY KEY (id),
	CONSTRAINT receipts_receipt_number_key UNIQUE (receipt_number),
	CONSTRAINT receipts_status_check CHECK (((status)::text = ANY ((ARRAY['generated'::character varying, 'sent'::character varying, 'downloaded'::character varying])::text[]))),
	CONSTRAINT receipts_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES public.users(id),
	CONSTRAINT receipts_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE,
	CONSTRAINT receipts_rent_transaction_id_fkey FOREIGN KEY (rent_transaction_id) REFERENCES public.rent_transactions(id) ON DELETE SET NULL,
	CONSTRAINT receipts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL
);
CREATE INDEX idx_receipts_created_at ON public.receipts USING btree (created_at);
CREATE INDEX idx_receipts_property_id ON public.receipts USING btree (property_id);
CREATE INDEX idx_receipts_receipt_date ON public.receipts USING btree (receipt_date);
CREATE INDEX idx_receipts_receipt_number ON public.receipts USING btree (receipt_number);
CREATE INDEX idx_receipts_rent_transaction_id ON public.receipts USING btree (rent_transaction_id);
CREATE INDEX idx_receipts_status ON public.receipts USING btree (status);
CREATE INDEX idx_receipts_tenant_id ON public.receipts USING btree (tenant_id);

-- Table Triggers

create trigger trigger_update_receipts_updated_at before
update
    on
    public.receipts for each row execute function update_receipts_updated_at();


-- public.rent_transaction_meter_readings definition

-- Drop table

-- DROP TABLE public.rent_transaction_meter_readings;

CREATE TABLE public.rent_transaction_meter_readings (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	transaction_id uuid NOT NULL,
	meter_id uuid NOT NULL,
	meter_reading_id uuid NULL,
	meter_name varchar(100) NOT NULL,
	meter_type varchar(50) NOT NULL,
	meter_number varchar(100) NULL,
	previous_reading numeric(10, 2) NOT NULL,
	current_reading numeric(10, 2) NOT NULL,
	units_consumed numeric(10, 2) NOT NULL,
	cost_per_unit numeric(10, 4) NOT NULL,
	fixed_charge numeric(10, 2) DEFAULT 0 NULL,
	total_cost numeric(10, 2) NOT NULL,
	reading_date timestamp NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT chk_current_greater_than_previous CHECK ((current_reading >= previous_reading)),
	CONSTRAINT rent_transaction_meter_readings_cost_per_unit_check CHECK ((cost_per_unit >= (0)::numeric)),
	CONSTRAINT rent_transaction_meter_readings_current_reading_check CHECK ((current_reading >= (0)::numeric)),
	CONSTRAINT rent_transaction_meter_readings_fixed_charge_check CHECK ((fixed_charge >= (0)::numeric)),
	CONSTRAINT rent_transaction_meter_readings_pkey PRIMARY KEY (id),
	CONSTRAINT rent_transaction_meter_readings_previous_reading_check CHECK ((previous_reading >= (0)::numeric)),
	CONSTRAINT rent_transaction_meter_readings_total_cost_check CHECK ((total_cost >= (0)::numeric)),
	CONSTRAINT rent_transaction_meter_readings_units_consumed_check CHECK ((units_consumed >= (0)::numeric)),
	CONSTRAINT rent_transaction_meter_readings_meter_id_fkey FOREIGN KEY (meter_id) REFERENCES public.meters(id) ON DELETE RESTRICT,
	CONSTRAINT rent_transaction_meter_readings_meter_reading_id_fkey FOREIGN KEY (meter_reading_id) REFERENCES public.meter_readings(id) ON DELETE SET NULL,
	CONSTRAINT rent_transaction_meter_readings_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.rent_transactions(id) ON DELETE CASCADE
);
CREATE INDEX idx_transaction_meter_readings_meter_id ON public.rent_transaction_meter_readings USING btree (meter_id);
CREATE INDEX idx_transaction_meter_readings_meter_reading_id ON public.rent_transaction_meter_readings USING btree (meter_reading_id);
CREATE INDEX idx_transaction_meter_readings_reading_date ON public.rent_transaction_meter_readings USING btree (reading_date);
CREATE INDEX idx_transaction_meter_readings_transaction_id ON public.rent_transaction_meter_readings USING btree (transaction_id);