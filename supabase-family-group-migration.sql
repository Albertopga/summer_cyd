-- Soporte de inscripción familiar en registrations.

BEGIN;

ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS family_group_id UUID;

ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS family_role TEXT;

ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS family_contact_email TEXT;

ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS child_shares_parent_chozo BOOLEAN NOT NULL DEFAULT false;

-- Backfill para registros existentes (cada registro previo queda como titular de su propio grupo)
UPDATE public.registrations
SET family_group_id = gen_random_uuid()
WHERE family_group_id IS NULL;

UPDATE public.registrations
SET family_role = 'holder'
WHERE family_role IS NULL OR family_role = '';

ALTER TABLE public.registrations
ALTER COLUMN family_group_id SET NOT NULL;

ALTER TABLE public.registrations
ALTER COLUMN family_role SET NOT NULL;

ALTER TABLE public.registrations
ALTER COLUMN family_group_id SET DEFAULT gen_random_uuid();

ALTER TABLE public.registrations
ALTER COLUMN family_role SET DEFAULT 'holder';

ALTER TABLE public.registrations
DROP CONSTRAINT IF EXISTS registrations_family_role_check;

ALTER TABLE public.registrations
ADD CONSTRAINT registrations_family_role_check
CHECK (family_role IN ('holder', 'partner', 'child'));

CREATE INDEX IF NOT EXISTS registrations_family_group_id_idx
  ON public.registrations(family_group_id);

CREATE INDEX IF NOT EXISTS registrations_family_role_idx
  ON public.registrations(family_role);

COMMIT;
