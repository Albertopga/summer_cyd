-- Sincroniza pago familiar: si paga titular, marca pagados el resto de miembros.

BEGIN;

CREATE OR REPLACE FUNCTION public.sync_family_payment_from_holder()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.family_role = 'holder'
     AND NEW.accommodation_paid = true
     AND (OLD.accommodation_paid IS DISTINCT FROM true)
     AND NEW.family_group_id IS NOT NULL THEN
    UPDATE public.registrations
    SET accommodation_paid = true
    WHERE family_group_id = NEW.family_group_id
      AND id <> NEW.id
      AND accommodation_paid IS DISTINCT FROM true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_family_payment_from_holder_trigger ON public.registrations;
CREATE TRIGGER sync_family_payment_from_holder_trigger
AFTER UPDATE ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.sync_family_payment_from_holder();

COMMIT;
