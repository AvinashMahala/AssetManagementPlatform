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