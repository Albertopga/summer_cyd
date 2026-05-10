-- Sincronizar contadores de numeración con los datos actuales.
-- Tras borrar registros a mano, ejecuta esto en Supabase → SQL Editor.
-- Si la tabla está vacía, el siguiente número asignado será 1.
--
-- - attendee_number: al marcar pago (trigger)
-- - temp_attendee_number: al crear registro (trigger)

SELECT setval(
  'public.registrations_attendee_number_seq',
  COALESCE((SELECT MAX(attendee_number) FROM public.registrations), 1),
  COALESCE((SELECT MAX(attendee_number) FROM public.registrations), 0) > 0
);

SELECT setval(
  'public.registrations_temp_attendee_number_seq',
  COALESCE((SELECT MAX(temp_attendee_number) FROM public.registrations), 1),
  COALESCE((SELECT MAX(temp_attendee_number) FROM public.registrations), 0) > 0
);

-- Equivalente solo para el número «oficial» (si ya tienes la función):
-- SELECT public.sync_attendee_number_sequence();
