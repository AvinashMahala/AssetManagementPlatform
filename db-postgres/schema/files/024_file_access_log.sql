-- MOVED: original file: ../024_file_access_log.sql
-- Location: schema/files/024_file_access_log.sql

-- public.file_access_log definition

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
