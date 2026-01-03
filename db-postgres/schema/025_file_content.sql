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
